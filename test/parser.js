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

