'use strict';

var structure = require('./structure'),
    tokens = require('./tokens'),
    M = require('unparse-js').maybeerror;

/* parsing:
 * 1. structure
 * 2. tokens
 */

// TODO could use a real set here
var is_token = {
        'number': 1, 
        'string': 1, 
        'regex': 1, 
        'char': 1, 
        'ident': 1
    };
// just copied from the cleaning part of `structure` module
// TODO import these from `structure` instead
var has_body = {
        'list': 1, 'vector': 1, 'table': 1, 
        'function': 1, 'set': 1, 'clojure': 1
    },
    has_value = {
        'quote': 1, 'unquote': 1, 'deref': 1, 'syntax-quote': 1,
        'unquote-splicing': 1, 'eval': 1, 'var': 1
    };

function parseTokensInTree(errCount, tree) {
//    console.log('working on ' + JSON.stringify([tree._name, tree._state]));
    if ( has_body.hasOwnProperty(tree._name) ) {
        return {
            '_state': tree._state, 
            '_name': tree._name,
            'body': tree.body.map(function(e) {return parseTokensInTree(errCount, e);})
        };
    } else if ( has_value.hasOwnProperty(tree._name) ) {
        return {
            '_state': tree._state,
            '_name': tree._name,
            'value': parseTokensInTree(errCount, tree.value)
        };
    } else if ( is_token.hasOwnProperty(tree._name) ) {
//        console.log('token: ' + JSON.stringify(tree));
        var pt = tokens.parse(tree);
        switch ( pt.status ) {
            case 'success': pt = pt.value; break;
            case 'error': 
                pt = {'status': 'error', 'trace': pt.value, 'input': tree};
                errCount.count += 1;
                break;
            default: throw new Error('unexpected parse result -- ' + pt.status); break;
        }
        return pt;
    } else if ( tree._name === 'metadata' ) {
        return {
            '_state': tree._state,
            '_name': tree._name,
            'metadata': parseTokensInTree(errCount, tree.metadata),
            'value': parseTokensInTree(errCount, tree.value)
        };
    }
    throw new Error('unrecognized type: ' + tree._name);
}


function parseCst(input) {
    var parsed = structure.parse(input),
        errCount = {'count': 0};
    if ( parsed.status === 'success' ) {
        var cst = parseTokensInTree(errCount, parsed.value);
        if ( errCount.count > 0 ) {
            return M.error({'token errors': errCount.count, 'tree': cst});
        }
        return M.pure(cst);
    }
    return parsed;
}


module.exports = {
    '_parseTokensInTree': parseTokensInTree,
    
    'parseCst'          :  parseCst
};

