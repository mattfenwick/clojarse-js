"use strict";

var P = require('../lib/parser'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("parser/parseCst", function() {

    test("some chars", function() {
        var inp = '\\b \\u0041 \\backspace \\o101',
            out = P.parseCst(inp);
        deepEqual(out.status, 'success');
        deepEqual(out.value.body.map(function(c) {return c._name;}), 
                  ['char', 'char', 'char', 'char']);
        deepEqual(out.value.body.map(function(c) {return c.kind;}),
                  ['simple', 'unicode', 'long', 'octal']);
    });
    
    test("token errors", function() {
        var inp = '4 4&',
            out = P.parseCst(inp);
        deepEqual(out.status, 'error');
        deepEqual(out.value['token errors'].length, 1);
        deepEqual(out.value.tree.body[1], {'_name': 'token error', 'id': 0});
    });
    
    test("multiple token errors", function() {
        var inp = '4 4& a::b 5/a',
            out = P.parseCst(inp);
        deepEqual(out.status, 'error');
        deepEqual(out.value['token errors'].length, 3);
        deepEqual(out.value.tree.body.slice(1), 
                  [{'_name': 'token error', 'id': 0},
                   {'_name': 'token error', 'id': 1},
                   {'_name': 'token error', 'id': 2}]);
    });
    /*
    test("char", function() {
        deepEqual(out.value.body.length, 4);
    });

    test("char simple", function() {
        deepEqual(out.value.body[0].value._name, 'simple');
    });

    test("char unicode", function() {
        deepEqual(out.value.body[1].value._name, 'unicode');
    });

    test("char long", function() {
        deepEqual(out.value.body[2].value._name, 'long');
    });

    test("char octal", function() {
        deepEqual(out.value.body[3].value._name, 'octal');
    });

    test("char error", function() {
        var out = F.fullParse("\\bac"); // also for \obac.  but is already correct for \ubac
        deepEqual(out.value.body[0].status, 'error');
        deepEqual(out.value.body[0].value[0][0], 'char');
    });

    var coarse = '1 1.2 1/3 x/y :x/y ::x/y "" #"" \\z \\tab';
    
    test("coarse test", function() {
        deepEqual(F.fullParse(coarse).body.map(function(x) {return x._name;}),
                  ['integer', 'float', 'ratio', 'symbol', 'keyword',
                   'autokey', 'string', 'regex', 'char', 'char']);
    });
    
    */
    var ints = '1 +1N 0 0756 -0756 0x32f 36r0az',
        errors = '08 100r0 0x0g';
    
    var floats = '8M 8.2';

});

module("parser/comment and whitespace", function() {
    var cases = [
        ["#! abc \n def", ' abc ', 'comment', P.comment],
        ["; tuv\n xyz", ' tuv', 'comment', P.comment],
        [", \r\f\n\t  qrs", ', \r\f\n\t  ', 'whitespace', P.whitespace]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>', function() {
            var parsed = c[3].parse(c[0], [1,1]);
            deepEqual(parsed.status, 'success');
            deepEqual(parsed.value.result._name, c[2]);
            deepEqual(parsed.value.result.value, c[1].split(''));
        });
    });
});

module("parser/char", function() {
    var cases = [
        ['\\b', 'b'],
        ['\\b""', 'b'],
        ['\\  ', ' '],
        ['\\\t ', '\t'],
        ['\\\n,', '\n'],
        ['\\blarghabag ', 'blarghabag'],
        ['\\u123~[]', 'u123'],
        ["\\a#'%{}", "a#'%", "only terminating macros and whitespace end a char"]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  <' + c[1] + '>', function() {
            var parsed = P.parse(c[0]);
            deepEqual(parsed.status, 'success');
            deepEqual(parsed.value.body[0]._name, 'char');
            deepEqual(parsed.value.body[0].value, c[1]);
        });
    });
});

module("parser/number", function() {
    var cases = [
        ['4 ', '4'],
        ["+3'x", "+3"],
        ['-2xyz#{}', '-2xyz', 'ended by whitespace and macros'],
        ['8????()', '8????']
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  <' + c[1] + '>', function() {
            var parsed = P.parse(c[0]);
            deepEqual(parsed.status, 'success');
            deepEqual(parsed.value.body[0]._name, 'number');
            deepEqual(parsed.value.body[0].value, c[1]);
        });
    });
});

module("parser/char", function() {
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
            var p = P.parse(c[0]);
            deepEqual(p.status, 'success');
            deepEqual(p.value._name, 'char');
            deepEqual(p.value.value, c[1]);
            deepEqual(p.value.kind, c[2]);
        });
    });
});

module("parser/integer", function() {
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
            var p = P.parse(c[0]);
            deepEqual(p.status, 'success');
            deepEqual(p.value, c[1]);
        });
    });
});

function parseForm(str) {
    return P.form.parse(str, [1, 1]).fmap(function(x) {
        return x.result;
    });
}

module("parser/float", function() {
    var cases = [
        ['4M'           , null, '4'    , null , null        , 'M' , [1,3] ],
        ['-0.'          , '-' , '0'    , ''   , null        , null, [1,4] ],
        ['18e37'        , null, '18'   , null , [null, '37'], null, [1,6] ],
        ['+875.623e-22M', '+' , '875'  , '623', ['-', '22'] , 'M' , [1,14]],
        ['01238M'       , null, '01238', null , null        , 'M' , [1,7] ]
    ];
    cases.map(function(c) {
        test(c[0], function() {
            var p = parseForm(c[0]);
            deepEqual(p.status, 'success');
            var v = p.value;
            deepEqual(v.sign, c[1]);
            deepEqual(v._name, 'number');
            deepEqual(v.number._name, 'float');
            deepEqual(v.number.int, c[2].split(''));
            if ( c[3] !== null ) {
                deepEqual(v.number.decimal.int, c[3].split(''));
            } else {
                deepEqual(v.number.decimal, null);
            }
            if ( c[4] !== null ) {
                deepEqual(v.number.exponent.sign, c[4][0]);
                deepEqual(v.number.exponent.power, c[4][1].split(''));
            } else {
                deepEqual(v.number.exponent, null);
            }
            deepEqual(v.number.suffix, c[5]);
            deepEqual(v._end, c[6]);
        });
    });
});

module("parser/ratio", function() {
    var cases = [
        ['0/0'      , null, '0'     , '0', [1,4]  ],
        ['01238/1'  , null, '01238' , '1', [1,8]  ],
        ['-198/202' , '-', '198'    , '202', [1,9]],
        ['+18/34'   , '+', '18'     , '34', [1,7] ]
    ];
    cases.map(function(c) {
        test(c[0], function() {
            var p = parseForm(c[0]);
//            console.log(JSON.stringify(p));
            deepEqual(p.status, 'success');
            var v = p.value;
            deepEqual(v._name, 'number');
            deepEqual(v.sign, c[1]);
            deepEqual(v.number.numerator, c[2].split(''));
            deepEqual(v.number.denominator, c[3].split(''));
            deepEqual(v.number._name, 'ratio');
            deepEqual(v._end, c[4]);
        });
    });
});

module("parser/number errors", function() {
    var cases = [
        ['01238',   ['octal digit', [1,5]] ],
        ['4/z',     ['denominator', [1,3]] ]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  ' + c[1], function() {
            var p = P.parse(c[0]);
            deepEqual(p.status, 'error');
            deepEqual(p.value[p.value.length - 1], c[1]);
        });
    });
});

module("parser/ident", function() {
    var cases = [
        ['x '           , 'symbol'       , [1,2]],
        [':x,'          , 'keyword'      , [1,3]],
        ['::x\t'        , 'autokey'     , [1,4]],
        ['%234\n'       , 'symbol'    , [1,5]],
        ["x'#%[]"       , "symbol"    , [1,5]],
        ['x/y '         , 'symbol'  , [1,4]],
        [':x/y '        , 'keyword' , [1,5]],
        ['::x/y '       , 'autokey' , [1,6]],
        // TODO figure out where the problem is with the following case
        // I don't understand it
//        [':///'     , ident('keyword', ''   , '//' )],
        ['a:/b/c '     , 'symbol' , [1,7]]
    ];
    cases.map(function(c) {
        test(c[0], function() {
            var p = parseForm(c[0]);
            deepEqual(p.status, 'success');
            deepEqual(p.value._name, 'ident');
            deepEqual(p.value.value._name, 'name');
            deepEqual(p.value.value.type, c[1]);
            deepEqual(p.value._end, c[2]);
        });
    });
    test('reserved', function() {
        var p = P.form.parse('nil ', [1,1]);
        deepEqual(p.status, 'success');
        var v = p.value.result;
        deepEqual(v._name, 'ident');
        deepEqual(v.value._name, 'reserved');
        deepEqual(v.value.value, 'nil');
        deepEqual(v._end, [1,4]);
    });
});

