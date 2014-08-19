'use strict';

var structure = require('./structure'),
    tokens = require('./tokens'),
    M = require('unparse-js').maybeerror;


function _number(node) {
    return node.first + node.rest.join('');
}

function _string(node) {
    function action(p) {
        if ( typeof p === 'string' ) {
            return p;
        }
        return p.join('');
    }
    return node.body.map(action).join('');
}

// these are coupled to the token definitions given in structure.js
var token_cleanup = {
    'number': _number,
    'ident' : _number,
    'char'  : _number,
    'string': _string,
    'regex' : _string,
};

function parseTokensInTree(errors, tree) {
//    console.log(JSON.stringify(tree, null, 2));
    var grp = structure.nodeGroups.get(tree._name);
    if ( grp === 'hasBody' ) {
        tree.body.map(function(e) {
            parseTokensInTree(errors, e);
        });
    } else if ( grp === 'hasValue' ) {
        parseTokensInTree(errors, tree.value);
    } else if ( grp === 'token' ) {
        var pos = tree._start,
            type = tree._name,
            input = token_cleanup[type](tree),
            // TODO is this position correct?
            pt = tokens.parse(type, input, pos);
        if ( pt.status === 'success' ) {
            // TODO hopefully not overwriting anything
            tree._parsed = pt;
        } else if ( pt.status === 'error' ) {
            var id = errors.push(pt.value) - 1;
            tree._parsed = M.error(id);
        } else {
            throw new Error('unexpected parse result -- ' + pt.status);
        }
    } else if ( grp === 'metadata' ) {
        parseTokensInTree(errors, tree.metadata);
        parseTokensInTree(errors, tree.value);
    } else if ( grp === 'clojure' ) {
        tree.body.map(function(e) {
            parseTokensInTree(errors, e);
        });
    } else {
        throw new Error('unrecognized group: ' + grp + ' from type: ' + tree._name);
    }
}


/* parsing:
 * 1. structure
 * 2. tokens
 */

function parseCst(input) {
    var parsed = structure.parse(input),
        errors = [];
    if ( parsed.status === 'success' ) {
        parseTokensInTree(errors, parsed.value);
        if ( errors.length > 0 ) {
            return M.error({'token errors': errors, 'tree': parsed.value});
        }
        return M.pure(parsed.value);
    }
    return parsed;
}


module.exports = {
    'parseTokensInTree' : parseTokensInTree ,    
    'parseCst'          :  parseCst         ,
};

