'use strict';

var M = require('./misc'),
    error = M.error,
    warning = M.warning;


function def(node, state, log) {
    var elems = node.elems;
    switch (elems.length) {
        case 1:
            log.push(error('def -- too few arguments', node.pos, {}));
            break;
        case 2:
            log.push(warning('def -- missing initial value', node.pos, {}));
            break;
        case 3:
        case 4:
            break;
        default:
            log.push(error('def -- too many arguments', node.pos, {}));
            break;
        case 0:
            throw new Error('should never have happened');
    }
    if ( elems.length >= 2 ) {
        var second = elems[1];
        if ( second.type !== 'symbol' ) {
            log.push(error('def -- 2nd arg must be a symbol', second.pos, {}));
        }
    }
    if ( elems.length >= 4 ) {
        var third = elems[2];
        if ( third.type !== 'string' ) {
            log.push(error('def -- in 4-arg version, doc-string must be a string', third.pos, {}));
        }
    }
    // which elements should we recur on?
    elems.slice(2).map(function(e) { return dispatch(e, state, log); }); // TODO who recurs?
}

function if_(node, state, log) {
    var elems = node.elems;
    switch (elems.length) {
        case 1:
        case 2:
            log.push(error('if -- too few arguments', node.pos, {}));
            break;
        case 3:
            log.push(warning('if -- missing else-branch', node.pos, {}));
            break;
        case 4:
            break;
        default:
            log.push(error('if -- too many arguments', node.pos, {}));
            break;
        case 0:
            throw new Error('should never have happened');
    }
    elems.slice(1).map(function(e) { return dispatch(e, state, log);}); // TODO
}

function quote(node, state, log) {
    switch (node.elems.length) {
        case 1:
            log.push(warning('quote -- too few arguments', node.pos, {}));
            break;
        case 2:
            break;
        default:
            log.push(warning('quote -- too many arguments', node.pos, {}));
            break;
        case 0:
            throw new Error('should never have happened');
    }
}

function var_(node, state, log) {
    switch (node.elems.length) {
        case 1:
            log.push(error('var -- too few arguments', node.pos, {}));
            break;
        default:
            log.push(warning('var -- too many arguments', node.pos, {}));
            // nope, no break -- default case is intended to hit this too
        case 2:
            if ( node.elems[1].type !== 'symbol' ) {
                log.push(error('var -- 2nd argument must be a symbol', node.pos, {}));
            }
            break;
        case 0:
            throw new Error('should never have happened');
    }
}

function throw_(node, state, log) {
    switch (node.elems.length) {
        case 1:
            log.push(error('throw -- too few arguments', node.pos, {}));
            break;
        case 2:
            break;
        default:
            log.push(warning('throw -- too many arguments', node.pos, {}));
            break;
        case 0:
            throw new Error('should never have happened');
    }
    node.elems.slice(1).map(function(e) { return dispatch(e, state, log);}); // TODO do we want `throw` to be responsible for recurring?
}

function new_(node, state, log) {
    switch (node.elems.length) {
        case 1:
            log.push(error('new -- too few arguments', node.pos, {}));
            break;
        default:
            break;
        case 0:
            throw new Error('should never have happened');
    }
    node.elems.slice(1).map(function(e) { return dispatch(e, state, log);}); // TODO 
}

function monitor_enter(node, state, log) {
    log.push(warning('monitor-enter -- should be avoided in user code. Use the locking macro', node.pos, {}));
    switch (node.elems.length) {
        case 1:
            log.push(error('monitor-enter -- too few arguments', node.pos, {}));
            break;
        case 2:
            break;
        default:
            log.push(warning('monitor-enter -- too many arguments', node.pos, {}));
            break;
        case 0:
            throw new Error('should never have happened');
    }
    node.elems.slice(1).map(function(e) { return dispatch(e, state, log);}); // TODO
}

function monitor_exit(node, state, log) {
    log.push(warning('monitor-exit -- should be avoided in user code. Use the locking macro', node.pos, {}));
    switch (node.elems.length) {
        case 1:
            log.push(error('monitor-exit -- too few arguments', node.pos, {}));
            break;
        case 2:
            break;
        default:
            log.push(warning('monitor-exit -- too many arguments', node.pos, {}));
            break;
        case 0:
            throw new Error('should never have happened');
    }
    node.elems.slice(1).map(function(e) { return dispatch(e, state, log);}); // TODO
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


function dispatch(node, state, log) {
    switch (node._tag) {
        case 'token':
            return;
        case 'leaf':
            dispatch(node.form, state, log);
            return;
        case 'struct':
            break;
        default:
            throw new Error('unrecognized node tag -- ' + node._tag);
    }
    switch (node.type) {
        case 'list':
            break;
        default:
            node.elems.map(function(e) { return dispatch(e, state, log);});
            return;
    }
    if ( node.elems.length === 0 ) { 
        return; 
    }
    var first = node.elems[0];
    if ( first.type !== 'symbol' ) {
        node.elems.map(function(e) { return dispatch(e, state, log);});
        return;
    }
    if ( first.tree.ns !== null ) {
        node.elems.map(function(e) { return dispatch(e, state, log);});
        return;
    }
    if ( !specials.hasOwnProperty(first.tree.name) ) {
        return;
    }
    console.log('checking ' + first.tree.name + ' ...');
    return specials[first.tree.name](node, state, log);
}


module.exports = {
    'check_specials': dispatch
};

