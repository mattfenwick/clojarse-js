'use strict';

var A = require('./ast');


function expand(ns, name, node) {
    var pos = node._state,
        second = node.value;
    return A.list(pos, 
                  [], 
                  [A.symbol(null, [], {'ns': ns, 'name': name}), 
                   build(second)]); // have to recur
}

function extract(keys, obj) {
    var out = {};
    keys.map(function(k) {
        if ( !obj.hasOwnProperty(k) ) {
            throw new Error('missing property -- ' + k);
        }
        out[k] = obj[k];
    });
    return out;
}

function token(f, keys, node) {
    return f(node._state, [], extract(keys, node));
}

function struct(f, node) {
    return f(node._state, [], node.body.map(build));
}

function leaf(f, node) {
    return f(node._state, [], build(node.value));
}

function metadata(node) {
        var meta = build(node.metadata), 
            form = build(node.value);
        form.meta.push(meta);
        return form;
}

var actions = {
    'clojure'   : struct.bind(null, A.clojure),
    'list'      : struct.bind(null, A.list),
    'vector'    : struct.bind(null, A.vector),
    'set'       : struct.bind(null, A.set),
    'function'  : struct.bind(null, A['function']),
    'table'     : struct.bind(null, A.table),

    'quote': expand.bind(null, null, 'quote'),
    'deref': expand.bind(null, 'clojure.core', 'deref'), // plain deref can be shadowed !
    'var'  : expand.bind(null, null, 'var'),

    'unquote'           : leaf.bind(null, A.unquote),
    'unquote-splicing'  : leaf.bind(null, A['unquote-splicing']),
    'syntax-quote'      : leaf.bind(null, A['syntax-quote']),
    'eval'              : leaf.bind(null, A['eval']),
    
    'metadata'  :  metadata,

    'symbol' : token.bind(null, A.symbol, ['ns', 'name']),
    'keyword': token.bind(null, A.keyword, ['ns', 'name']),
    'auto keyword': token.bind(null, A.autokey, ['ns', 'name']),
    'integer'   : token.bind(null, A.integer, ['sign', 'suffix', 'base', 'digits']),
    'ratio'     : token.bind(null, A.ratio, ['numerator', 'denominator', 'sign']),
    'float'     : token.bind(null, A.float, ['sign', 'int', 'decimal', 'exponent', 'suffix']),
    'string'    : token.bind(null, A.string, ['value']),
    'regex'     : token.bind(null, A.regex, ['value']),
    'char'      : token.bind(null, A.char, ['value']),
    'reserved'  : token.bind(null, A.reserved, ['value'])

};

function build(node) {
    if ( actions.hasOwnProperty(node._name) ) {
        return actions[node._name](node);
    }
    throw new Error('unrecognized node type -- ' + JSON.stringify(node));
}


module.exports = {
    'build': build
};

