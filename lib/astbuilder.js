'use strict';

var A = require('./ast'),
    S = require('./set');


function expand(ns, name) {
    return function (node) {
        var pos = node._start,
            second = node.value;
        return A.list(pos,
                      [],
                      [A.symbol(pos, [], {'ns': ns, 'name': name}),
                       build(second)]); // have to recur
    };
}

function one_child(f) {
    return function (node) {
        return f(node._start, [], [build(node.value)]);
    };
}

function metadata(node) {
    var meta = build(node.metadata),
        form = build(node.value);
    form.meta.push(meta);
    return form;
}

// TODO use a real dict
var actions = {
    'quote': expand(null, 'quote'),
    'deref': expand('clojure.core', 'deref'),
    'var'  : expand(null, 'var'),
    'unquote'           : expand('clojure.core', 'unquote'),
    'unquote-splicing'  : expand('clojure.core', 'unquote-splicing'),

    'syntax-quote'      : one_child(A['syntax-quote']),
    'eval'              : one_child(A['eval']),
    
    'metadata'  :  metadata,
};

var structs = new S(['clojure', 'list', 'vector', 'set', 'function', 'table']),
    tokens = new S(['symbol', 'keyword', 'autokey', 'integer', 'ratio',
                      'float', 'string', 'regex', 'char', 'reserved']);

function build(node) {
    if ( actions.hasOwnProperty(node._name) ) {
        return actions[node._name](node);
    } else if ( tokens.has(node._name) ) {
        return A[node._name](node._start, [], node);
    } else if ( structs.has(node._name) ) {
        return A[node._name](node._start, [], node.body.map(build));
    }
    throw new Error('unrecognized node type -- ' + JSON.stringify(node));
}


module.exports = {
    'build': build
};

