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
        log.push(f_low(name, 'too few arguments', node.pos, 
                       {'minimum': min, 'actual': l}));
    }
    if ( ( max !== null ) && ( l > max ) ) {
        log.push(f_high(name, 'too many arguments', node.pos, 
                        {'maximum': max, 'actual': l}));
    }
}

function def(node, state, log) {
    var elems = node.elems;
    num_args('def', 2, error, 4, error, node, log);
    if ( elems.length === 2 ) {
        log.push(warning('def', 'missing initial value', node.pos, {}));
    }
    if ( elems.length >= 2 ) {
        var second = elems[1];
        if ( second.type !== 'symbol' ) {
            log.push(error('def', '2nd arg must be a symbol', second.pos, {}));
        }
    }
    if ( elems.length >= 4 ) {
        var third = elems[2];
        if ( third.type !== 'string' ) {
            log.push(error('def', 'in 4-arg version, doc-string must be a string', third.pos, {}));
        }
    }
}

function if_(node, state, log) {
    num_args('if', 3, error, 4, error, node, log);
    if ( node.elems.length === 3 ) {
        log.push(warning('if', 'missing else-branch', node.pos, {}));
    }
}

function quote(node, state, log) {
    num_args('quote', 2, warning, 2, warning, node, log);
}

function var_(node, state, log) {
    num_args('var', 2, error, 2, warning, node, log);
    if ( ( node.elems.length >= 2 ) && ( node.elems[1].type !== 'symbol' ) ) {
        log.push(error('var', '2nd argument must be a symbol', node.pos, {}));
    }
}

function throw_(node, state, log) {
    num_args('throw', 2, error, 2, error, node, log);
}

function new_(node, state, log) {
    num_args('new', 2, error, null, null, node, log);
}

function monitor_enter(node, state, log) {
    log.push(warning('monitor-enter', 'should be avoided in user code. Use the locking macro', node.pos, {}));
    num_args('monitor-enter', 2, error, 2, error, node, log);
}

function monitor_exit(node, state, log) {
    log.push(warning('monitor-exit', 'should be avoided in user code. Use the locking macro', node.pos, {}));
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
    num_args('set!', 2, error, 2, error, node, log);
    // need to check whether 1st arg is a valid target or Java target
}

// 3 with binding forms: let, loop/recur, fn/recur
// recur
// try/catch/finally


var specials = {
    'def'   : def    ,
    'if'    : if_    ,
    'quote' : quote  ,
    'var'   : var_   ,
    'throw' : throw_ ,
    'new'   : new_   ,
    'do'    : do_    ,
    '.'     : dot    ,
    'set!'  : set_bang,
    'monitor-enter': monitor_enter,
    'monitor-exit' : monitor_exit
};

function special_form(node, state, log) {
    if ( node.elems.length === 0 ) { 
        return; 
    }
    var first = node.elems[0];
    if ( ( first.type !== 'symbol'            ) ||
         ( first.tree.ns !== null             ) ||
         ( !specials.hasOwnProperty(first.tree.name) ) ) {
        return;
    }
    console.log('checking ' + first.tree.name + ' ...');
    return specials[first.tree.name](node, state, log);
}



module.exports = {
    'special_form'  : special_form,
    'specials'      : specials
};

