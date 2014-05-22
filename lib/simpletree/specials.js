'use strict';


function warning(name, message, position, obj) {
    obj.severity = 'warning';
    obj.name = name;
    obj.message = message;
    obj.position = position;
    return obj;
}

// log an error -- not an error effect
function error(name, message, position, obj) {
    obj.severity = 'error';
    obj.name = name;
    obj.message = message;
    obj.position = position;
    return obj;
}

// 1,1          0,1,2   no,yes,no
// null,1       0,1,2   yes,yes,no
// 1,null       0,1,2   no,yes,yes
// null,null    0,1,2   yes,yes,yes    
function arg_check(name, min, max, f, message, node, log) {
    var args = node.elems.length,
        low = (min === null) ? 0 : min,
        high = (max === null) ? Infinity : max;
    if ( ( args >= low ) && ( args <= high ) ) {
        log.issue(f(name, message, node.pos,
                    {'arguments': args}));
    }
}

function def(node, log, env, state) {
    arg_check('def', null, 1, error, 'too few arguments', node, log);
    arg_check('def', 2, 2, warning, 'missing initial value', node, log);
    arg_check('def', 5, null, error, 'too many arguments', node, log);
    var elems = node.elems;
    if ( elems.length >= 2 ) {
        var second = elems[1];
        if ( second.type === 'symbol' ) {
            var name = second.name;
            // one major drawback (for now):
            //   ignoring namespaces
            if ( state.is_bound(name) ) {
                log.issue(warning('def', 'redefining symbol', second.pos, 
                                  {'symbol': name, 'original position': state.position(name)}));
            } else {
                state.define(name, second.pos);
            }
        } else {
            log.issue(error('def', '2nd arg must be a symbol', second.pos, {}));
        }
    }
    if ( elems.length >= 4 ) {
        var third = elems[2];
        if ( third.type !== 'string' ) {
            log.issue(error('def', 'in 4-arg version, doc-string must be a string', third.pos, {}));
        }
    }
}

function if_(node, log, env, state) {
    arg_check('if', null, 2, error, 'too few arguments', node, log);
    arg_check('if', 3, 3, warning, 'missing else-branch', node, log);
    arg_check('if', 5, null, error, 'too many arguments', node, log);
}

function quote(node, log, env, state) {
    arg_check('quote', null, 1, warning, 'missing operand', node, log);
    arg_check('quote', 3, null, warning, 'too many arguments', node, log);
}

function var_(node, log, env, state) {
    arg_check('var', null, 1, error, 'too few arguments', node, log);
    arg_check('var', 3, null, error, 'too many arguments', node, log);
    if ( ( node.elems.length >= 2 ) && ( node.elems[1].type !== 'symbol' ) ) {
        log.issue(error('var', '2nd argument must be a symbol', node.pos, {}));
    }
}

function throw_(node, log, env, state) {
    arg_check('throw', null, 1, error, 'too few arguments', node, log);
    arg_check('throw', 3, null, error, 'too many arguments', node, log);
}

function new_(node, log, env, state) {
    arg_check('new', null, 1, error, 'too few arguments', node, log);
}

function monitor_enter(node, log, env, state) {
    log.issue(warning('monitor-enter', 'should be avoided in user code. Use the locking macro', node.pos, {}));
    arg_check('monitor-enter', null, 1, error, 'too few arguments', node, log);
    arg_check('monitor-enter', 3, null, error, 'too many arguments', node, log);
}

function monitor_exit(node, log, env, state) {
    log.issue(warning('monitor-exit', 'should be avoided in user code. Use the locking macro', node.pos, {}));
    arg_check('monitor-exit', null, 1, error, 'too few arguments', node, log);
    arg_check('monitor-exit', 3, null, error, 'too many arguments', node, log);
}

function do_(node, log, env, state) {
    // nothing to do
}

function dot(node, log, env, state) {
    arg_check('.', null, 2, error, 'too few arguments', node, log);
    // need to check whether 2nd arg is symbol or list
}

function set_bang(node, log, env, state) {
    arg_check('set!', null, 2, error, 'too few arguments', node, log);
    arg_check('set!', 4, null, error, 'too many arguments', node, log);
    // need to check whether 1st arg is a valid target or Java target
}

function recur(node, log, env, state) {
    // nothing to do
    // but would be nice to warn if not in a loop or fn
    // also, check if in tail position
}

function _list_starts_with(node, name) {
    return (node.type === 'list') && 
           (node.elems.length > 0) &&
           (node.elems[0].type === 'symbol') &&
           (node.elems[0].ns === null) &&
           (node.elems[0].name === name);
}

function _catch(node, log, env, state) {
    arg_check('catch', null, 2, error, 'too few arguments', node, log);
    arg_check('catch', 3, 3, warning, 'missing expression(s)', node, log);
    var exc_type = node.elems[1],
        name = node.elems[2];
    if ( exc_type && ( exc_type.type !== 'symbol' ) ) {
        log.issue(error('catch', 'exception type must be a symbol', exc_type.pos, {}));
    }
    if ( name && ( name.type !== 'symbol' ) ) {
        log.issue(error('catch', 'exception name must be a symbol', name.pos, {}));
    }
}

function _finally(node, log, env, state) {
    arg_check('finally', null, 1, warning, 'missing expression(s)', node, log);
}

function try_(node, log, env, state) {
    var exprs = [],
        catches = [],
        final = null,
        i = 1,
        e;
    for ( ; i < node.elems.length; i++) {
        e = node.elems[i];
//        console.log(JSON.stringify([i, node.elems[i], e]));
        if ( _list_starts_with(e, 'catch') || _list_starts_with(e, 'finally') ) {
            break;
        }
        exprs.push(e);
    }
    for ( ; i < node.elems.length; i++) {
        e = node.elems[i];
//        console.log(JSON.stringify([i, node.elems[i], e]));
        if ( _list_starts_with(e, 'catch') ) {
            catches.push(e);
            _catch(e, log, env, state);
        } else if ( _list_starts_with(e, 'finally') ) {
            break;
        } else {
            log.issue(error('try', 'invalid expression in catch/finally', e.pos, {}));
        }
    }
//    console.log(JSON.stringify([i, node.elems[i], e]));
    if ( i < node.elems.length ) {
        e = node.elems[i];
        if ( _list_starts_with(e, 'finally') ) {
            final = e;
            _finally(e, log, env, state);
        }
        i++;
    }
    for ( ; i < node.elems.length; i++) {
        e = node.elems[i];
        log.issue(error('try', 'invalid expression after finally', e.pos, {}));
    }
//    console.log(JSON.stringify({'expr': exprs, 'catches': catches, 'finally': final}));
    if ( exprs.length === 0 ) {
        log.issue(warning('try', '0 expressions', node.pos, {}));
    }
    if ( ( catches.length === 0 ) && ( final === null ) ) {
        log.issue(warning('try', 'no catch or finally', node.pos, {}));
    }
}


module.exports = {
    'def'   : def     ,
    'if'    : if_     ,
    'quote' : quote   ,
    'var'   : var_    ,
    'throw' : throw_  ,
    'new'   : new_    ,
    'do'    : do_     ,
    '.'     : dot     ,
    'set!'  : set_bang,
    'recur' : recur   ,
    'try'   : try_    ,
    'monitor-enter': monitor_enter,
    'monitor-exit' : monitor_exit
};

