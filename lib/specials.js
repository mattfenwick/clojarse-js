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
    // which elements should we recur on?
    elems.slice(2).map(dispatch_or_something); // TODO we don't want `def` to be responsible for recurring
    return undefined; // TODO return something instead of writing to console
}

function if_(node) {
    console.log('checking if ...');
    var elems = node.body;
    switch (elems.length) {
        case 1: 
        case 2: error('if', 'too few arguments', node._state); break;
        case 3: warning('if', 'missing else-branch', node._state); break;
        case 4: break;
        default: error('if', 'too many arguments', node._state); break;
        case 0: throw new Error('should never have happened'); break;
    }
    elems.slice(1).map(dispatch_or_something); // TODO do we want `if` to be responsible for recurring?
}

function quote(node) {
    console.log('checking quote ...');
    switch (node.body.length) {
        case 1: warning('quote', 'too few arguments', node._state); break;
        case 2: break;
        default: warning('quote', 'too many arguments', node._state); break;
        case 0: throw new Error('should never have happened'); break;
    }
}

function var_(node) {
    console.log('checking var ...');
    switch (node.body.length) {
        case 1: error('var', 'too few arguments', node._state); break;
        default: warning('var', 'too many arguments', node._state);
        case 2: // default case is intended to hit this too
            if ( node.body[1]._name !== 'symbol' ) {
                error('var', '2nd argument must be a symbol', node._state);
            }
            break;
        case 0: throw new Error('should never have happened'); break;
    }
}

function throw_(node) {
    console.log('checking throw ...');
    switch (node.body.length) {
        case 1: error('throw', 'too few arguments', node._state); break;
        case 2: break;
        default: warning('throw', 'too many arguments', node._state); break;
        case 0: throw new Error('should never have happened'); break;
    }
    node.body.slice(1).map(dispatch_or_something); // TODO do we want `throw` to be responsible for recurring?
}

function new_(node) {
    console.log('checking new ...');
    switch (node.body.length) {
        case 1: error('new', 'too few arguments', node._state); break;
        default: break;
        case 0: throw new Error('should never have happened'); break;
    }
    node.body.slice(1).map(dispatch_or_something); // TODO 
}

function monitor_enter(node) {
    console.log('checking monitor-enter ...');
    warning('monitor-enter', 'should be avoided in user code. Use the locking macro', node._state);
    switch (node.body.length) {
        case 1: error('monitor-enter', 'too few arguments', node._state); break;
        case 2: break;
        default: warning('monitor-enter', 'too many arguments', node._state); break;
        case 0: throw new Error('should never have happened'); break;
    }
    node.body.slice(1).map(dispatch_or_something); // TODO
}

function monitor_exit(node) {
    console.log('checking monitor-exit ...');
    warning('monitor-exit', 'should be avoided in user code. Use the locking macro', node._state);
    switch (node.body.length) {
        case 1: error('monitor-exit', 'too few arguments', node._state); break;
        case 2: break;
        default: warning('monitor-exit', 'too many arguments', node._state); break;
        case 0: throw new Error('should never have happened'); break;
    }
    node.body.slice(1).map(dispatch_or_something); // TODO
}

var specials = {
    'def'   : def    ,
    'if'    : if_    ,
    'quote' : quote  ,
    'var'   : var_   ,
    'throw' : throw_ ,
    'new'   : new_   ,
    'monitor-enter': monitor_enter,
    'monitor-exit' : monitor_exit
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

