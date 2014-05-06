'use strict';

// check special form syntax

function error(name, message, position) {
    console.log(name + ' -- error -- ' + message + ' at ' + JSON.stringify(position));
}

function warning(name, message, position) {
    console.log(name + ' -- warning -- ' + message + ' at ' + JSON.stringify(position));
}

function def(node) {
    console.log('checking def ...');
    var elems = node.body;
    switch (elems.length) {
        case 1: error('def', 'too few arguments', node._state); break;
        case 2: warning('def', 'missing initial value', node._state); break;
        case 3: 
        case 4: break;
        default: error('def', 'too many arguments', node._state); break;
        case 0: throw new Error('should never have happened'); break;
    }
    if ( elems.length >= 2 ) {
        var second = elems[1];
        if ( second._name !== 'symbol' ) {
            error('def', '2nd arg must be a symbol', second._state);
        }
    }
    if ( elems.length >= 4 ) {
        var third = elems[2];
        if ( third._name !== 'string' ) {
            error('def', 'in 4-arg version, doc-string must be a string', third._state);
        }
    }
    elems.slice(1).map(dispatch_or_something);
    return undefined; // TODO return something instead of writing to console
}

var specials = {
    'def': def
};


function dispatch_or_something(node) {
    if ( node._name !== 'list' ) {
        if ( node.hasOwnProperty('body') ) {
            node.body.map(dispatch_or_something);
        }
        return;
    }
    if ( node.body.length === 0 ) {
        return; //throw new Error('need a neutral return value');
    }
    var first = node.body[0];
    if ( first._name !== 'symbol' ) {
        throw new Error('need a neutral return value');
    }
    // TODO what about namespaces?
    if ( !specials.hasOwnProperty(first.name) ) {
        return; //throw new Error('need a neutral return value');
    }
    return specials[first.name](node); // TODO effects ??
}


module.exports = {
    'check_specials': dispatch_or_something
};

