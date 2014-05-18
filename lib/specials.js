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

function num_args(name, min, f_low, max, f_high, node, log) {
    var l = node.elems.length;
    if ( ( min !== null ) && ( l < min ) ) {
        log.issue(f_low(name, 'too few arguments', node.pos, 
                       {'minimum': min, 'actual': l}));
    }
    if ( ( max !== null ) && ( l > max ) ) {
        log.issue(f_high(name, 'too many arguments', node.pos, 
                        {'maximum': max, 'actual': l}));
    }
}

function def(node, state, log) {
    var elems = node.elems;
    num_args('def', 2, error, 4, error, node, log);
    if ( elems.length === 2 ) {
        log.issue(warning('def', 'missing initial value', node.pos, {}));
    }
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

function if_(node, state, log) {
    num_args('if', 3, error, 4, error, node, log);
    if ( node.elems.length === 3 ) {
        log.issue(warning('if', 'missing else-branch', node.pos, {}));
    }
}

function quote(node, state, log) {
    num_args('quote', 2, warning, 2, warning, node, log);
}

function var_(node, state, log) {
    num_args('var', 2, error, 2, warning, node, log);
    if ( ( node.elems.length >= 2 ) && ( node.elems[1].type !== 'symbol' ) ) {
        log.issue(error('var', '2nd argument must be a symbol', node.pos, {}));
    }
}

function throw_(node, state, log) {
    num_args('throw', 2, error, 2, error, node, log);
}

function new_(node, state, log) {
    num_args('new', 2, error, null, null, node, log);
}

function monitor_enter(node, state, log) {
    log.issue(warning('monitor-enter', 'should be avoided in user code. Use the locking macro', node.pos, {}));
    num_args('monitor-enter', 2, error, 2, error, node, log);
}

function monitor_exit(node, state, log) {
    log.issue(warning('monitor-exit', 'should be avoided in user code. Use the locking macro', node.pos, {}));
    num_args('monitor-exit', 2, error, 2, error, node, log);
}

function do_(node, state, log) {
    // nothing to do
}

function dot(node, state, log) {
    num_args('.', 3, error, null, null, node, log);
    // need to check whether 2nd arg is symbol or list
}

function set_bang(node, state, log) {
    num_args('set!', 3, error, 3, error, node, log);
    // need to check whether 1st arg is a valid target or Java target
}

function recur(node, state, log) {
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

function _catch(node, state, log) {
    num_args('catch', 3, error, null, null, node, log);
    if ( node.elems.length === 3 ) {
        log.issue(warning('catch', 'missing expression(s)', node.pos, {}));
    }
    var exc_type = node.elems[1],
        name = node.elems[2];
    if ( exc_type && ( exc_type.type !== 'symbol' ) ) {
        log.issue(error('catch', 'exception type must be a symbol', exc_type.pos, {}));
    }
    if ( name && ( name.type !== 'symbol' ) ) {
        log.issue(error('catch', 'exception name must be a symbol', name.pos, {}));
    }
}

function _finally(node, state, log) {
    if ( node.elems.length === 1 ) {
        log.issue(warning('finally', 'missing expression(s)', node.pos, {}));
    }
}

function try_(node, state, log) {
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
            _catch(e, state, log);
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
            _finally(e, state, log);
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


var specials = {
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

function special_form(node, state, log) {
    if ( node.elems.length === 0 ) { 
        return; 
    }
    var first = node.elems[0];
    if ( ( first.type !== 'symbol'            ) ||
         ( first.ns !== null                  ) ||
         ( !specials.hasOwnProperty(first.name) ) ) {
        return;
    }
    console.log('special form: ' + first.name + ' ...');
    return specials[first.name](node, state, log);
}



module.exports = {
    'special_form'  : special_form,
    'specials'      : specials
};

