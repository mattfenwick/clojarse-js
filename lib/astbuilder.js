'use strict';

var A = require('./ast');


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

// TODO use a real set
var structs = {
        'clojure'   : 1,
        'list'      : 1,
        'vector'    : 1,
        'set'       : 1,
        'function'  : 1,
        'table'     : 1
    },
    tokens = {
        'symbol'  : 1,
        'keyword' : 1,
        'autokey' : 1,
        'integer' : 1,
        'ratio'   : 1,
        'float'   : 1,
        'string'  : 1,
        'regex'   : 1,
        'char'    : 1,
        'reserved': 1
    };

function build(node) {
    if ( actions.hasOwnProperty(node._name) ) {
        return actions[node._name](node);
    } else if ( tokens.hasOwnProperty(node._name) ) {
        return A[node._name](node._state, [], node);
    } else if ( structs.hasOwnProperty(node._name) ) {
        return A[node._name](node._state, [], node.body.map(build));
    }
    throw new Error('unrecognized node type -- ' + JSON.stringify(node));
}


module.exports = {
    'build': build
};

