"use strict";

var T = require('../../lib/parser/tokens'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("parser/tokens/char", function() {
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
            deepEqual(p.value.type, c[2]);
        });
    });
});

module("parser/tokens/integer", function() {
    function int(sign, suffix, base, digits) {
        return {
            'sign': sign, 'suffix': suffix,
            'base': base, 'digits': digits
        };
    }
    var cases = [
        ['0xdefN'   , int(null, 'N', 16, 'def')     ],
        ['-077'     , int('-', null, 8, '77')       ],
        ['+123'     , int('+', null, 10, '123')     ],
        ['0'        , int(null, null, 10, '0')      ],
        ['36r123zZ' , int(null, null, 36, '123zZ')  ]
    ];
    cases.map(function(c) {
        var t = c[1];
        test('<' + c[0] + '>  ->  <' + JSON.stringify(t) + '>', function() {
            var p = T.parse_('number', c[0], [1, 1]);
            deepEqual(p.status, 'success');
            deepEqual(p.value._name, 'integer');
            deepEqual(p.value.sign, t.sign);
            deepEqual(p.value.suffix, t.suffix);
            deepEqual(p.value.base, t.base);
            deepEqual(p.value.digits, t.digits);
        });
    });
});

module("parser/tokens/number errors", function() {
    var cases = [
        ['01238', 'invalid octal digit']
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  ' + c[1], function() {
            var p = T.parse_('number', c[0], [1,1]);
            deepEqual(p.value, '');
            deepEqual(p.status, 'error');
        });
    });
});

