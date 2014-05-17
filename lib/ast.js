'use strict';


function _struct(type, pos, meta, elems) {
    return {
        '_tag' : 'struct',
        'type' : type    ,
        'pos'  : pos     ,
        'meta' : meta    ,
        'elems': elems
    };
}

function _token(type, keys, pos, meta, node) {
    var tok = {
        '_tag': 'token',
        'type': type   ,
        'pos' : pos    ,
        'meta': meta
    };
    keys.map(function(k) {
        if ( tok.hasOwnProperty(k) ) {
            throw new Error('duplicate key in token: ' + k);
        } else if ( !node.hasOwnProperty(k) ) {
            throw new Error('missing key while building AST token: ' + k);
        }
        tok[k] = node[k];
    });
    return tok;
}


module.exports = {
    // structs
    'list'    : _struct.bind(null, 'list')    ,
    'vector'  : _struct.bind(null, 'vector')  ,
    'set'     : _struct.bind(null, 'set')     ,
    'table'   : _struct.bind(null, 'table')   ,
    'function': _struct.bind(null, 'function'),
    'clojure' : _struct.bind(null, 'clojure') ,
    // one-element structs
    'syntax-quote' : _struct.bind(null, 'syntax-quote'),
    'eval'         : _struct.bind(null, 'eval'),
    // tokens
    'integer' : _token.bind(null, 'integer' , ['sign', 'suffix', 'base', 'digits'])             ,
    'ratio'   : _token.bind(null, 'ratio'   , ['numerator', 'denominator', 'sign'])             ,
    'float'   : _token.bind(null, 'float'   , ['sign', 'int', 'decimal', 'exponent', 'suffix']) ,
    'symbol'  : _token.bind(null, 'symbol'  , ['ns', 'name'])   ,
    'keyword' : _token.bind(null, 'keyword' , ['ns', 'name'])   ,
    'autokey' : _token.bind(null, 'autokey' , ['ns', 'name'])   ,
    'char'    : _token.bind(null, 'char'    , ['kind', 'value']),
    'string'  : _token.bind(null, 'string'  , ['value'])        ,
    'regex'   : _token.bind(null, 'regex'   , ['value'])        ,
    'reserved': _token.bind(null, 'reserved', ['value'])
};

