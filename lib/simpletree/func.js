'use strict';

var tokens = require('../parser/tokens');

function warning(message, position, obj) {
    obj.severity = 'warning';
    obj.message = message;
    obj.position = position;
    return obj;
}

// log an error -- not an error effect
function error(message, position, obj) {
    obj.severity = 'error';
    obj.message = message;
    obj.position = position;
    return obj;
}


// for functions
function shorthand(node, log, env, state) {
    if ( env._functions.length !== 0 ) {
        var err = error('nested shorthand function', node.pos, {'enclosing positions': env._functions});
        log.issue(err);
    }
    return env.add_function(node.pos);
}

// for symbols
function shorthand_args(node, log, env, state) {
    if ( ( env._functions.length === 0 ) || 
         ( node.ns !== null )            ||
         ( node.name[0] !== '%' ) ) {
        return env;
    }
    if ( ( node.name === '%' ) || ( node.name === '%&' ) ) {
        return env;
    }
    var pos = [node.pos[0], node.pos[1] + 1];
    var n = tokens.parse_('number', node.name.slice(1), pos);
    if ( n.status !== 'success' ) {
        log.issue(error('invalid %-arg', node.pos, {'error': n.value, 'text': node.name}));
    } else {
        var v = n.value; // it parsed correctly
        // TODO but is it valid according to the rest of the rules? (valid base, range, digits, etc.)
        if ( v.sign === '-' ) {
            log.issue(error('%-args may not be negative', node.pos, {'actual': v}));
        }
        if ( v._name !== 'integer' ) {
            log.issue(warning('%-args should be integers', node.pos, {'actual': v}));
        } else if ( v.base !== 10 ) {
            log.issue(warning('%-args should use base10 notation', node.pos, {'actual': v}));
        } else if ( parseInt(v.digits, 10) > 20 ) {
            log.issue(error('%-args may not exceed 20', node.pos, {'actual': v}));
        }
    }
    return env;
}


module.exports = {
    'shorthand'     : shorthand,
    'shorthand_args': shorthand_args,
};

