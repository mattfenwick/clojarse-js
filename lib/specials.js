'use strict';



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
}


module.exports = {
    'def'   : def    ,
    'if'    : if_    ,
    'quote' : quote  ,
    'var'   : var_   ,
    'throw' : throw_ ,
    'new'   : new_   ,
    'monitor-enter': monitor_enter,
    'monitor-exit' : monitor_exit
};

