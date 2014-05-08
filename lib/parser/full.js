'use strict';

var parser = require('./structure'),
    tokens = require('./tokens');

/* parsing:
 * 1. structure
 * 2. tokens
 * 3. tokens to 'real' objects (numbers, strings, etc.)
 * 4. ? AST ?
 */

var is_token = {'number': 1, 'string': 1, 'regex': 1, 'char': 1, 'symbol': 1};
// just copied from the cleaning part of `structure` module
var has_body = {
        'list': 1, 'vector': 1, 'table': 1, 
        'function': 1, 'set': 1, 'clojure': 1
    },
    has_value = {
        'quote': 1, 'unquote': 1, 'deref': 1, 'syntax-quote': 1,
        'unquote-splicing': 1, 'eval': 1, 'var': 1
    };

function parseTokensInTree(tree) {
//    console.log('working on ' + JSON.stringify([tree._name, tree._state]));
    if ( has_body.hasOwnProperty(tree._name) ) {
        return {
            '_state': tree._state, 
            '_name': tree._name,
            'body': tree.body.map(parseTokensInTree)
        };
    } else if ( has_value.hasOwnProperty(tree._name) ) {
        return {
            '_state': tree._state,
            '_name': tree._name,
            'value': parseTokensInTree(tree.value)
        };
    } else if ( is_token.hasOwnProperty(tree._name) ) {
//        console.log('token: ' + JSON.stringify(tree));
        var pt = tokens.parse(tree);
        switch ( pt.status ) {
            case 'success': pt = pt.value; break;
            case 'error': 
                pt = {'type': 'error', 'trace': pt.value, 'input': tree}; 
                throw new Error(JSON.stringify(pt)); // TODO change to a counter that tracks number of token errors
                break;
            default: throw new Error('unexpected parse result -- ' + pt.status); break;
        }
        return pt;
    } else if ( tree._name === 'metadata' ) {
        return {
            '_state': tree._state,
            '_name': tree._name,
            'metadata': parseTokensInTree(tree.metadata),
            'value': parseTokensInTree(tree.value)
        };
    }
    throw new Error('unrecognized type: ' + tree._name);
}


function fullParse(input) {
    var parsed = parser.parse(input);
    return parsed.fmap(parseTokensInTree);
}


module.exports = {
    'parseTokensInTree': parseTokensInTree,
    'fullParse'        : fullParse
};

