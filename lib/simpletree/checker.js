'use strict';

var M = require('./misc'),
    S = require('./specials'),
    Mac = require('./macros'),
    State = require('./state'),
    Log = require('./log'),
    Env = require('./env'),
    F = require('./func');


var _type_checks = {
    'integer': [M.integer_base, M.integer_digits]  ,
    'table'  : [M.table_even]                      ,
    'ratio'  : [M.ratio_denominator]               ,
    'symbol' : [M.count_symbols]                   ,
    'float'  : [M.float_range]                     ,
    'eval'   : [M.eval_reader]                     ,
//  'struct': [M.indentation]                     
};

function simple_checks(node, log) {
    if ( _type_checks.hasOwnProperty(node.type) ) {
        _type_checks[node.type].map(function(f) {
            f(node, log);
        });
    }
    M.metadata_value(node, log);
    M.metadata_meta(node, log);
    M.count_nodes(node, log);
}

function traverse(f, node, log, env, state) {
    var new_env = f(node, log, env, state);
    switch (node._tag) {
        case 'token':
            break;
        case 'struct':
            node.elems.map(function(e) { traverse(f, e, log, new_env, state); });
            break;
        default:
            throw new Error('unexpected AST node tag -- ' + JSON.stringify(node));
    }
    node.meta.map(function(m) { traverse(f, m, log, new_env, state); });
}



function operator(op_table, node, log, env, state) {
    if ( ( node.type !== 'list' ) || ( node.elems.length === 0 ) ) { 
        return env;
    }
    var first = node.elems[0];
    if ( ( first.type !== 'symbol'            ) ||
         ( first.ns !== null                  ) ||
         ( !op_table.hasOwnProperty(first.name) ) ) {
        return env;
    }
    console.log('operator: ' + first.name + ' ...');
    return op_table[first.name](node, log, env, state);
}

function effectful_checks(node, log, env, state) {
    if ( node.type === 'list' ) {
        operator(S, node, log, env, state);
        operator(Mac, node, log, env, state);
        // functions // TODO 
        // TODO ignore `env` returned from operator checkers?
        return env;
    } else if ( node.type === 'function' ) {
        return F.shorthand(node, log, env, state);
    } else if ( node.type === 'symbol' ) {
        return F.shorthand_args(node, log, env, state);
    }
    return env;
}

function _is_quote(node) {
    if ( ( node.type !== 'list'    ) || 
         ( node.elems.length === 0 ) ) {
        return false;
    }
    var first = node.elems[0];
    return ( first.type === 'symbol' ) &&
           ( first.ns === null       ) &&
           ( first.name === 'quote'  );
}

function effectful_traverse(f, node, log, env, state) {
    var new_env = f(node, log, env, state);
    // don't recurse into `... and '...
    if ( ( node.type === 'syntax-quote' ) ||
         ( _is_quote(node) ) ) {
        return env;
    }
    function f_cont(subnode) { 
        effectful_traverse(f, subnode, log, new_env, state); 
    }
    switch (node._tag) {
        case 'token':
            break;
        case 'struct':
            node.elems.map(f_cont);
            break;
        default:
            throw new Error('unexpected AST node tag -- ' + JSON.stringify(node));
    }
    node.meta.map(f_cont);
}



function default_traverse(node) {
    var state = new State(),
        log   = new Log()  ,
        env   = new Env()  ;
    traverse(simple_checks, node, log);
    effectful_traverse(effectful_checks, node, log, env, state);
    return [state, log];
}



module.exports = {
    'simple_checks' : simple_checks ,
    'effectful_checks': effectful_checks,

    'traverse'      : traverse      ,
    'effectful_traverse': effectful_traverse,
    'default_traverse': default_traverse
};

