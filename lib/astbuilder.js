'use strict';

var A = require('./ast'),
    S = require('./set');


function expand(ns, name, node) {
    var pos = node._state,
        second = node.value;
    return A.list(pos,
                  [],
                  [A.symbol(pos, [], {'ns': ns, 'name': name}),
                   build(second)]); // have to recur
}

function one_child(f, node) {
    return f(node._state, [], [build(node.value)]);
}

function metadata(node) {
    var meta = build(node.metadata),
        form = build(node.value);
    form.meta.push(meta);
    return form;
}

// TODO use a real dict
var actions = {
    'quote': expand.bind(null, null, 'quote'),
    'deref': expand.bind(null, 'clojure.core', 'deref'),
    'var'  : expand.bind(null, null, 'var'),
    'unquote'           : expand.bind(null, 'clojure.core', 'unquote'),
    'unquote-splicing'  : expand.bind(null, 'clojure.core', 'unquote-splicing'),

    'syntax-quote'      : one_child.bind(null, A['syntax-quote']),
    'eval'              : one_child.bind(null, A['eval']),
    
    'metadata'  :  metadata,
};

var structs = new S(['clojure', 'list', 'vector', 'set', 'function', 'table']),
    tokens = new S(['symbol', 'keyword', 'autokey', 'integer', 'ratio',
                      'float', 'string', 'regex', 'char', 'reserved']);

function build(node) {
    if ( actions.hasOwnProperty(node._name) ) {
        return actions[node._name](node);
    } else if ( tokens.has(node._name) ) {
        return A[node._name](node._state, [], node);
    } else if ( structs.has(node._name) ) {
        return A[node._name](node._state, [], node.body.map(build));
    }
    throw new Error('unrecognized node type -- ' + JSON.stringify(node));
}


module.exports = {
    'build': build
};

