'use strict';

var M = require('./misc'),
    S = require('./specials');


function type(t) {
    return function(node) {
        return (t === node.type);
    };
}

function tag(t) {
    return function(node) {
        return (t === node._tag);
    };
}

var default_checks = [
    [type('integer')            , [M.integer_base, M.integer_digits]  ],
    [function() {return true;}  , [M.metadata_value, M.metadata_meta] ],
    [type('table')              , [M.table_even]                      ],
    [type('ratio')              , [M.ratio_denominator]               ],
    [type('list')               , [S.special_form]                    ],
    [type('symbol')             , [M.count_symbols]                   ],
//    [tag('struct')              , [M.indentation]                     ]
];

function traverse(checks, node, state, log) {
    var fs = [];
    checks.map(function(cs) {
        var pred = cs[0];
        if ( pred(node) ) {
            fs = fs.concat(cs[1]);
        }
    });
    fs.map(function(f) {
        f(node, state, log);
    });
    switch (node._tag) {
        case 'token':
            break;
        case 'struct':
            node.elems.map(function(e) { traverse(checks, e, state, log); });
            break;
        default:
            throw new Error('unexpected AST node tag -- ' + JSON.stringify(node));
    }
    node.meta.map(function(m) { traverse(checks, m, state, log); });
}

var default_traverse = traverse.bind(null, default_checks);


module.exports = {
    'traverse'        : traverse        ,
    'default_traverse': default_traverse,
    'default_checks'  : default_checks
};

