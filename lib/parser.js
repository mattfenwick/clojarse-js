'use strict';

var structure = require('./structure'),
    tokens = require('./tokens'),
    M = require('unparse-js').maybeerror,
    Dict = require('./dict');

/* parsing:
 * 1. structure
 * 2. tokens
 */

var nodeGroups = new Dict({
    'clojure'   : 'clojure',

    'metadata'  : 'metadata',

    'string'    : 'token',
    'regex'     : 'token',
    'char'      : 'token',
    'integer'   : 'token',
    'float'     : 'token',
    'ratio'     : 'token',
    'symbol'    : 'token',
    'keyword'   : 'token',
    'autokey'   : 'token',
    'reserved'  : 'token',

    'quote'         : 'hasValue',
    'deref'         : 'hasValue',
    'var'           : 'hasValue',
    'unquote'       : 'hasValue',
    'eval'          : 'hasValue',
    'syntax-quote'  : 'hasValue',
    'unquote-splicing': 'hasValue',

    'list'      : 'hasBody',
    'vector'    : 'hasBody',
    'table'     : 'hasBody',
    'function'  : 'hasBody',
    'set'       : 'hasBody',
});

function getNodeGroup(node) {
    return nodeGroups.get(node._name);
}


function parseTokensInTree(errors, tree) {
    var grp = structure.nodeGroups.get(tree._name);
    if ( grp === 'hasBody' ) {
        return {
            '_start': tree._start,
            '_name' : tree._name,
            '_end'  : tree._end,
            'body'  : tree.body.map(function(e) {
                return parseTokensInTree(errors, e);
            })
        };
    } else if ( grp === 'hasValue' ) {
        return {
            '_start': tree._start,
            '_name' : tree._name,
            '_end'  : tree._end,
            'value' : parseTokensInTree(errors, tree.value)
        };
    } else if ( grp === 'token' ) {
        var pt = tokens.parse(tree);
        switch ( pt.status ) {
            case 'success':
                return pt.value;
            case 'error':
                var id = errors.push({'trace': pt.value, 'input': tree}) - 1;
                return {'_name': 'token error', 'id': id};
            default:
                throw new Error('unexpected parse result -- ' + pt.status);
        }
    } else if ( grp === 'metadata' ) {
        return {
            '_start': tree._start,
            '_name' : tree._name,
            '_end'  : tree._end,
            'metadata': parseTokensInTree(errors, tree.metadata),
            'value' : parseTokensInTree(errors, tree.value)
        };
    } else if ( grp === 'clojure' ) {
        return {
            '_start': tree._start,
            '_name' : tree._name,
            '_end'  : tree._end,
            'body'  : tree.body.map(function(e) {
                return parseTokensInTree(errors, e);
            })
        };
    } else {
        throw new Error('unrecognized group: ' + grp + ' from type: ' + tree._name);
    }
}


function parseCst(input) {
    var parsed = structure.parse(input),
        errors = [];
    if ( parsed.status === 'success' ) {
        var cst = parseTokensInTree(errors, parsed.value);
        if ( errors.length > 0 ) {
            return M.error({'token errors': errors, 'tree': cst});
        }
        return M.pure(cst);
    }
    return parsed;
}


module.exports = {
    '_parseTokensInTree': parseTokensInTree ,
    'nodeGroups'        : nodeGroups        ,
    'getNodeGroup'      : getNodeGroup      ,
    
    'parseCst'          :  parseCst         ,
};

