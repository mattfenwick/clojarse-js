'use strict';


function _struct(type, pos, elems) {
    return {
        '_tag' : 'struct',
        'type' : type    ,
        'pos'  : pos     ,
        'elems': elems
    };
}

function _leaf(type, pos, form) {
    return {
        '_tag': 'leaf',
        'type': type,
        'pos' : pos,
        'form': form
    };
}

var meta = function(pos, metadata, form) {
    return {
        '_tag': 'meta',
        'type': 'meta',
        'pos' : pos,
        'meta': metadata,
        'form': form
    };
}

function _token(type, pos, tree) {
    return {
        '_tag': 'token',
        'type': type,
        'pos' : pos,
        'tree': tree
    };
}


function dump_help(node, lines, depth) {
    if ( node._tag === 'struct' ) {
        lines.push(depth + node.type + ' at ' + node.pos);
        node.elems.map(function(e) {
            dump_help(e, lines, depth + '  ');
        });
    } else if ( node._tag === 'leaf' ) {
        lines.push(depth + node.type + ' at ' + node.pos);
        dump_help(node.form, lines, depth + '  ');
    } else if ( node._tag === 'meta' ) {
        lines.push(depth + node.type + ' at ' + node.pos);
        dump_help(node.meta, lines, depth + '  ');
        dump_help(node.form, lines, depth + '  ');
    } else if ( node._tag === 'token' ) {
        lines.push(depth + node.type + ' at ' + node.pos + '  ' + JSON.stringify(node.tree));
    } else {
        throw new Error('unrecognized node type -- ' + node._tag);
    }
}

function dump(node) {
    var lines = [];
    dump_help(node, lines, '');
    return lines.join('\n');
}


module.exports = {
    // structs
    'list'    : _struct.bind(null, 'list')    ,
    'vector'  : _struct.bind(null, 'vector')  ,
    'set'     : _struct.bind(null, 'set')     ,
    'table'   : _struct.bind(null, 'table')   ,
    'function': _struct.bind(null, 'function'),
    'clojure' : _struct.bind(null, 'clojure') ,
    // leafs
    'syntax-quote'    : _leaf.bind(null, 'syntax-quote')     ,
    'unquote'         : _leaf.bind(null, 'unquote')          ,
    'unquote-splicing': _leaf.bind(null, 'unquote-splicing') ,
    'eval'            : _leaf.bind(null, 'eval')             ,
    // meta
    'meta': meta,
    // tokens
    'integer' : _token.bind(null, 'integer') ,
    'ratio'   : _token.bind(null, 'ratio')   ,
    'float'   : _token.bind(null, 'float')   ,
    'symbol'  : _token.bind(null, 'symbol')  ,
    'keyword' : _token.bind(null, 'keyword') ,
    'autokey' : _token.bind(null, 'autokey') ,
    'char'    : _token.bind(null, 'char')    ,
    'string'  : _token.bind(null, 'string')  ,
    'regex'   : _token.bind(null, 'regex')   ,
    
    // dump to string
    'dump': dump
};

