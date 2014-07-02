'use strict';

var structure = require('./structure'),
    tokens = require('./tokens'),
    M = require('unparse-js').maybeerror,
    S = require('./set');

/* parsing:
 * 1. structure
 * 2. tokens
 */

var isToken = new S(['number', 'string', 'regex', 'char', 'ident']);

function parseTokensInTree(errCount, tree) {
//    console.log('working on ' + JSON.stringify([tree._name, tree._state]));
    if ( structure.hasBody.has(tree._name) ) {
        return {
            '_state': tree._state,
            '_name': tree._name,
            'body': tree.body.map(function(e) {return parseTokensInTree(errCount, e);})
        };
    } else if ( structure.hasValue.has(tree._name) ) {
        return {
            '_state': tree._state,
            '_name': tree._name,
            'value': parseTokensInTree(errCount, tree.value)
        };
    } else if ( isToken.has(tree._name) ) {
//        console.log('token: ' + JSON.stringify(tree));
        var pt = tokens.parse(tree);
        switch ( pt.status ) {
            case 'success':
                pt = pt.value;
                break;
            case 'error':
                pt = {'status': 'error', 'trace': pt.value, 'input': tree};
                errCount.count += 1;
                break;
            default:
                throw new Error('unexpected parse result -- ' + pt.status);
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

