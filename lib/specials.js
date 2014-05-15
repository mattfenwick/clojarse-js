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
    var elems = node.elems;
    switch (elems.length) {
        case 1:
            error('def', 'too few arguments', node.pos);
            break;
        case 2:
            warning('def', 'missing initial value', node.pos);
            break;
        case 3:
        case 4:
            break;
        default:
            error('def', 'too many arguments', node.pos);
            break;
        case 0:
            throw new Error('should never have happened');
    }
    if ( elems.length >= 2 ) {
        var second = elems[1];
        if ( second.type !== 'symbol' ) {
            error('def', '2nd arg must be a symbol', second.pos);
        }
    }
    if ( elems.length >= 4 ) {
        var third = elems[2];
        if ( third.type !== 'string' ) {
            error('def', 'in 4-arg version, doc-string must be a string', third.pos);
        }
    }
    // which elements should we recur on?
    elems.slice(2).map(dispatch); // TODO we don't want `def` to be responsible for recurring
    return undefined; // TODO return something instead of writing to console
}

function if_(node) {
    console.log('checking if ...');
    var elems = node.elems;
    switch (elems.length) {
        case 1:
        case 2:
            error('if', 'too few arguments', node.pos);
            break;
        case 3:
            warning('if', 'missing else-branch', node.pos);
            break;
        case 4:
            break;
        default:
            error('if', 'too many arguments', node.pos);
            break;
        case 0:
            throw new Error('should never have happened');
    }
    elems.slice(1).map(dispatch); // TODO do we want `if` to be responsible for recurring?
}

function quote(node) {
    console.log('checking quote ...');
    switch (node.elems.length) {
        case 1:
            warning('quote', 'too few arguments', node.pos);
            break;
        case 2:
            break;
        default:
            warning('quote', 'too many arguments', node.pos);
            break;
        case 0:
            throw new Error('should never have happened');
    }
}

function var_(node) {
    console.log('checking var ...');
    switch (node.elems.length) {
        case 1:
            error('var', 'too few arguments', node.pos);
            break;
        default:
            warning('var', 'too many arguments', node.pos);
            // nope, no break -- default case is intended to hit this too
        case 2:
            if ( node.elems[1].type !== 'symbol' ) {
                error('var', '2nd argument must be a symbol', node.pos);
            }
            break;
        case 0:
            throw new Error('should never have happened');
    }
}

function throw_(node) {
    console.log('checking throw ...');
    switch (node.elems.length) {
        case 1:
            error('throw', 'too few arguments', node.pos);
            break;
        case 2:
            break;
        default:
            warning('throw', 'too many arguments', node.pos);
            break;
        case 0:
            throw new Error('should never have happened');
    }
    node.elems.slice(1).map(dispatch); // TODO do we want `throw` to be responsible for recurring?
}

function new_(node) {
    console.log('checking new ...');
    switch (node.elems.length) {
        case 1:
            error('new', 'too few arguments', node.pos);
            break;
        default:
            break;
        case 0:
            throw new Error('should never have happened');
    }
    node.elems.slice(1).map(dispatch); // TODO 
}

function monitor_enter(node) {
    console.log('checking monitor-enter ...');
    warning('monitor-enter', 'should be avoided in user code. Use the locking macro', node.pos);
    switch (node.elems.length) {
        case 1:
            error('monitor-enter', 'too few arguments', node.pos);
            break;
        case 2:
            break;
        default:
            warning('monitor-enter', 'too many arguments', node.pos);
            break;
        case 0:
            throw new Error('should never have happened');
    }
    node.elems.slice(1).map(dispatch); // TODO
}

function monitor_exit(node) {
    console.log('checking monitor-exit ...');
    warning('monitor-exit', 'should be avoided in user code. Use the locking macro', node.pos);
    switch (node.elems.length) {
        case 1:
            error('monitor-exit', 'too few arguments', node.pos);
            break;
        case 2:
            break;
        default:
            warning('monitor-exit', 'too many arguments', node.pos);
            break;
        case 0:
            throw new Error('should never have happened');
    }
    node.elems.slice(1).map(dispatch); // TODO
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


function dispatch(node) {
//    console.log('poop -- ' + JSON.stringify(node));
    switch (node._tag) {
        case 'token':
            return;
        case 'leaf':
            dispatch(node.form);
            return;
        case 'meta':
            dispatch(node.meta);
            dispatch(node.form);
            return;
        case 'struct':
            break;
        default:
            throw new Error('oops -- ' + node._tag);
    }
    switch (node.type) {
        case 'list':
            break;
        default:
            node.elems.map(dispatch);
            return;
    }
    if ( node.elems.length === 0 ) { return; }
    var first = node.elems[0];
    if ( first.type !== 'symbol' ) { node.elems.map(dispatch); return; }
    if ( first.tree.ns !== null ) { node.elems.map(dispatch); return; }
    if ( !specials.hasOwnProperty(first.tree.name) ) { return; }
    return specials[first.tree.name](node);
}


module.exports = {
    'check_specials': dispatch
};

