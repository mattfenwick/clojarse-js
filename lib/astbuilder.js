'use strict';

var A = require('./ast'),
    S = require('./set'),
    Dict = require('./dict');

// TODO we're probably going to want to join these array fields up at some point
function float(node) {
    var n = node.number;
    return A.float(node._start,
                   node.sign, 
                   n.int,
                   n.decimal !== null ? n.decimal.int : null,
                   n.exponent !== null ? {'sign': n.exponent.sign, 'power': n.exponent.power} : null,
                   n.suffix);
}

function ratio(node) {
    var n = node.number;
    return A.ratio(node._start,
                   node.sign,
                   n.numberator,
                   n.denominator);
}

function integer(node) {
    var n = node.number,
        v = n.value;
    if ( v._name === 'base8' ) {
        base = 8;
        digits = v.digits.join('');
    } else if ( v._name === 'base16' ) {
        base = 16;
        digits = v.digits.join('');
    } else if ( v._name === 'base10' ) {
        base = 10;
        digits = v.first + v.rest.join('');
    } else if ( v._name === 'zero' ) {
        base = 10;
        digits = '0';
    } else if ( v._name === 'baseN' ) {
        base = parseInt(v.radix, 10);
        digits = v.digits.join('');
    } else {
        throw new Error('oops');
    }
    return A.integer(node._start,
                     node.sign,
                     base,
                     digits,
                     n.suffix);
}

function number(node) {
    switch (node.number._name) {
        case 'float': return float(node);
        case 'integer': return integer(node);
        case 'ratio': return ratio(node);
        default: throw new Error('oops');
    }
}

// TODO this is just a temporary hack
var nametypes = new S(['keyword', 'autokey', 'symbol']);

function ident(node) {
    var v = node.value;
    if ( v._name === 'reserved' ) {
        return A.reserved(node._start, v.value);
    } else if ( v._name === 'name' ) {
        if ( !nametypes.has(v.type) ) {
            throw new Error('illegal name type -- ' + v.type);
        }
        return A[v.type](node._start,
                         v.ns === null ? null : v.ns.value.join(''),
                         v.name.join(''));
    } else {
        throw new Error('oops');
    }
}

function char(node) {
    var v = node.value,
        value;
    if ( v._name === 'simple' ) {
        value = v.value;
    } else { // long, octal, unicode
        value = v.first + v.rest.join('');
    }
    return A.char(node._start,
                  v._name,
                  value);
}

function char(node) {
    if ( node._name === 'char' ) {
        return node.value;
    }
    // so we have an escape
    var v = node.value;
    if ( v._name === 'simple' ) {
        return A.char(v._start, 'simple', v.value);
    } else if ( v._name === 'octal' ) {
        return A.char(v._start, 'octal', v.digits.join(''));
    } else if ( v._name === 'unicode' ) {
        return A.char(v._start, 'unicode', v.value.join(''));
    } else {
        throw new Error('oops');
    }
}

function string(node) {
    return A.string(node._start,
                    node.chars.map(char));
}

function regex(node) {
    function normalize(str) {
        if ( typeof str === 'string' ) {
            return str;
        }
        return str.join('');
    }
    return A.regex(node._start,
                   node.chars.map(normalize).join(''));
}


function hasBody(node) {
    return A[node._name](node._start, node.body.map(build));
}

function clojure(node) {
    return A.clojure(node._start, node.body.map(build));
}

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

var actions = new Dict({
        'number'    : number,
        'ident'     : ident ,
        'string'    : string,
        'regex'     : regex ,
        'char'      : char  ,
        
        'vector'    : hasBody,
        'list'      : hasBody,
        'set'       : hasBody,
        'function'  : hasBody,
        'table'     : hasBody,

        'clojure'   : clojure,
        
        'metadata'  : metadata,
        
        // TODO the hasValue node types haven't been checked
        'quote'             : expand(null, 'quote'),
        'deref'             : expand('clojure.core', 'deref'),
        'var'               : expand(null, 'var'),
        'unquote'           : expand('clojure.core', 'unquote'),
        'unquote-splicing'  : expand('clojure.core', 'unquote-splicing'),
        'syntax-quote'      : one_child(A['syntax-quote']),
        'eval'              : one_child(A['eval']),
    });

function build(node) {
    var name = node._name;
    if ( actions.has(name) ) {
        return actions.get(name)(node);
    }
    throw new Error('unrecognized node._name -- ' + name);
}


module.exports = {
    'actions'   : actions   ,
    'build'     : build     ,
};

