'use strict';

var M = require('./misc'),
    S = require('./specials'),
    Mac = require('./macros'),
    State = require('./state'),
    Log = require('./log'),
    Env = require('./env');


var _type_checks = {
    'integer': [M.integer_base, M.integer_digits]  ,
    'table'  : [M.table_even]                      ,
    'ratio'  : [M.ratio_denominator]               ,
    'symbol' : [M.count_symbols]                   ,
    'float'  : [M.float_range]                     ,
    'eval'   : [M.eval_reader]                     ,
//  'struct': [M.indentation]                     
};


function simple_checks(node, state, log, env) {
    if ( _type_checks.hasOwnProperty(node.type) ) {
        _type_checks[node.type].map(function(f) {
            // don't care about return value -- just about side effects in state and log
            f(node, state, log, env);
        });
    }
    M.metadata_value(node, state, log, env);
    M.metadata_meta(node, state, log, env);
    M.count_nodes(node, state, log, env);
    return env;
}


function operator(op_table, node, state, log, env) {
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
    return op_table[first.name](node, state, log, env);
}


var special = operator.bind(null, S),
    macro = operator.bind(null, Mac),
    func = operator.bind(null, {}); // TODO implement !


function traverse(f, node, state, log, env) {
    var new_env = f(node, state, log, env);
    switch (node._tag) {
        case 'token':
            break;
        case 'struct':
            node.elems.map(function(e) { traverse(f, e, state, log, new_env); });
            break;
        default:
            throw new Error('unexpected AST node tag -- ' + JSON.stringify(node));
    }
    node.meta.map(function(m) { traverse(f, m, state, log, new_env); });
}


function default_traverse(node) {
    var s = new State(),
        l = new Log(),
        e = new Env();
    traverse(simple_checks, node, s, l, e);
    traverse(special, node, s, l, e);
    traverse(macro, node, s, l, e);
    traverse(func, node, s, l, e);
    traverse(M.shorthand_function, node, s, l, e);
    return [s, l];
}


module.exports = {
    'special'       : special       ,
    'macro'         : macro         ,
    'function'      : func          ,
    'simple_checks' : simple_checks ,

    'traverse'      : traverse      ,
    'default_traverse': default_traverse
};

