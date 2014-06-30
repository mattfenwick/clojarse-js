"use strict";

var S = require('../lib/structure'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;

module("structure/comment and whitespace", function() {
    var cases = [
        ["#! abc \n def", ' abc ', 'comment', S.comment],
        ["; tuv\n xyz", ' tuv', 'comment', S.comment],
        [", \r\f\n\t  qrs", ', \r\f\n\t  ', 'whitespace', S.whitespace]
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

module("structure/char", function() {
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
            var parsed = S.parse(c[0]);
            deepEqual(parsed.status, 'success');
            deepEqual(parsed.value.body[0]._name, 'char');
            deepEqual(parsed.value.body[0].value, c[1]);
        });
    });
});

module("structure/number", function() {
    var cases = [
        ['4 ', '4'],
        ["+3'x", "+3"],
        ['-2xyz#{}', '-2xyz', 'ended by whitespace and macros'],
        ['8????()', '8????']
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  <' + c[1] + '>', function() {
            var parsed = S.parse(c[0]);
            deepEqual(parsed.status, 'success');
            deepEqual(parsed.value.body[0]._name, 'number');
            deepEqual(parsed.value.body[0].value, c[1]);
        });
    });
});

module("structure/ident", function() {
    var cases = [
        ['x ', 'x'],
        [':x,', ':x'],
        ['::x\t', '::x'],
        ['%234\n', '%234'],
        ["x'#%[]", "x'#%"]
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>  ->  <' + c[1] + '>', function() {
            var parsed = S.parse(c[0]);
            deepEqual(parsed.status, 'success');
            deepEqual(parsed.value.body[0]._name, 'ident');
            deepEqual(parsed.value.body[0].value, c[1]);
        });
    });
});

