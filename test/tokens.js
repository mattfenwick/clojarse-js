"use strict";

var T = require('../lib/tokens'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("tokens/char", function() {
    var cases = [
        ['b'        , 'b'        , 'simple'  ],
        ['u0041'    , '0041'     , 'unicode' ],
        ['backspace', 'backspace', 'long'    ],
        ['o101'     , '101'      , 'octal'   ],
        ['o10'      , '10'       , 'octal'   ],
        ['o7'       , '7'        , 'octal'   ]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  <' + c[1] + '>', function() {
            var p = T.parse_('char', c[0], [1, 1]);
            deepEqual(p.status, 'success');
            deepEqual(p.value._name, 'char');
            deepEqual(p.value.value, c[1]);
            deepEqual(p.value.kind, c[2]);
        });
    });
});

module("tokens/integer", function() {
    function int(sign, suffix, base, digits, end) {
        return {
            '_name': 'integer', '_start': [1,1],
            'sign': sign, 'suffix': suffix,
            'base': base, 'digits': digits,
            '_end': end
        };
    }
    var cases = [
        ['0xdefN'   , int(null, 'N', 16, 'def', [1,7])     ],
        ['-077'     , int('-', null, 8, '77', [1,5])       ],
        ['+123'     , int('+', null, 10, '123', [1,5])     ],
        ['0'        , int(null, null, 10, '0', [1,2])      ],
        ['36r123zZ' , int(null, null, 36, '123zZ', [1,9])  ],
        ['40r888'   , int(null, null, 40, '888', [1,7])    ]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  <' + JSON.stringify(c[1]) + '>', function() {
            var p = T.parse_('number', c[0], [1, 1]);
            deepEqual(p.status, 'success');
            deepEqual(p.value, c[1]);
        });
    });
});

module("tokens/float", function() {
    function ex(sign, pow) {
        return {'sign': sign, 'power': pow};
    }
    function float(sign, int, dec, exp, suff, end) {
        return {
            '_name': 'float', '_start': [1,1], 
            'sign': sign, 'int': int,
            'decimal': dec, 'suffix': suff, 
            'exponent': exp, '_end': end
        };
    }
    var cases = [
        ['4M'           , float(null, '4', '', null, 'M', [1,3])               ],
        ['-0.'          , float('-', '0', '', null, null, [1,4])               ],
        ['18e37'        , float(null, '18', '', ex(null, '37'), null, [1,6])   ],
        ['+875.623e-22M', float('+', '875', '623', ex('-', '22'), 'M', [1,14]) ],
        ['01238M'       , float(null, '01238', '', null, 'M', [1,7])           ]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  <' + JSON.stringify(c[1]) + '>', function() {
            var p = T.parse_('number', c[0], [1, 1]);
            deepEqual(p.status, 'success');
            deepEqual(p.value, c[1]);
        });
    });
});

module("tokens/ratio", function() {
    function ratio(sign, num, den, end) {
        return {
            '_name': 'ratio', '_start': [1,1], 
            'sign': sign, 'numerator': num,
            'denominator': den, '_end': end
        };
    }
    var cases = [
        ['0/0'      , ratio(null, '0', '0', [1,4])     ],
        ['01238/1'  , ratio(null, '01238', '1', [1,8]) ],
        ['-198/202' , ratio('-', '198', '202', [1,9])  ],
        ['+18/34'   , ratio('+', '18', '34', [1,7])    ]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  <' + JSON.stringify(c[1]) + '>', function() {
            var p = T.parse_('number', c[0], [1, 1]);
//            console.log(JSON.stringify(p));
            deepEqual(p.status, 'success');
            deepEqual(p.value, c[1]);
        });
    });
});

module("tokens/number errors", function() {
    var cases = [
        ['01238',   ['octal digit', [1,5]] ],
        ['4/z',     ['denominator', [1,3]] ]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  ' + c[1], function() {
            var p = T.parse_('number', c[0], [1,1]);
            deepEqual(p.status, 'error');
            deepEqual(p.value[p.value.length - 1], c[1]);
        });
    });
});

module("tokens/ident", function() {
    function ident(type, ns, name, end) {
        return {
            '_name': type, '_start': [1,1], 
            'ns': ns, 'name': name,
            '_end': end
        };
    }
    function reserved(value, end) {
        return {'_name': 'reserved', '_start': [1,1], 'value': value, '_end': end};
    }
    
    var cases = [
        ['nil'      , reserved('nil', [1,4])            ],
        ['x'        , ident('symbol' , null, 'x', [1,2])],
        [':x'       , ident('keyword', null, 'x', [1,3])],
        ['::x'      , ident('autokey', null, 'x', [1,4])],
        // TODO figure out where the problem is with the following case
        // I don't understand it
//        [':///'     , ident('keyword', ''   , '//' )],
        ['a:/b/c'   , ident('symbol' , 'a:' , 'b/c', [1,7])]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  <' + JSON.stringify(c[1]) + '>', function() {
            var p = T.parse_('ident', c[0], [1, 1]);
            deepEqual(p.status, 'success');
            deepEqual(p.value, c[1]);
        });
    });
});

module("tokens/ident errors", function() {
    var cases = [
        ['x::y',     [':: is illegal in identifiers (except at beginning)', [1,1]] ],
        [':::x',     [':: is illegal in identifiers (except at beginning)', [1,1]] ],
        ['///',      ['invalid identifier for mysterious reasons', [1,1]]],
//        ['::///',    ['', [1,1]]],  // TODO figure this out   
        ['a/b:/c',   [':/ is sometimes illegal in identifiers', [1,1]]],
        ['x:',       ['identifier may not end with a :', [1,1]]]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  ' + c[1], function() {
            var p = T.parse_('ident', c[0], [1,1]);
            deepEqual(p.status, 'error');
            deepEqual(p.value[p.value.length - 1], c[1]);
        });
    });
});

