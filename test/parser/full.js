"use strict";

var F = require('../../lib/parser/full'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("parser/full", function() {

    var inp = '\\b \\u0041 \\backspace \\o101',
        out = F.fullParse(inp);

    test("char", function() {
        deepEqual(out.body.length, 4);
    });

    test("char simple", function() {
        deepEqual(out.body[0].value._name, 'simple');
    });

    test("char unicode", function() {
        deepEqual(out.body[1].value._name, 'unicode');
    });

    test("char long", function() {
        deepEqual(out.body[2].value._name, 'long');
    });

    test("char octal", function() {
        deepEqual(out.body[3].value._name, 'octal');
    });
    
    test("char error", function() {
        var out = F.fullParse("\\bac"); // also for \obac.  but is already correct for \ubac
        deepEqual(out.body[0].status, 'error');
        deepEqual(out.body[0].value[0][0], 'char');
    });

});

