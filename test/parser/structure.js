"use strict";

var S = require('../../lib/parser/structure'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;

module("parser/structure/comment and whitespace", function() {
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

module("parser/structure/char", function() {
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
        test('<' + c[0] + '>', function() {
            var parsed = S.parse(c[0]);
            deepEqual(parsed.status, 'success');
            deepEqual(parsed.value.body[0]._name, 'char');
            deepEqual(parsed.value.body[0].value, c[1]);
        });
    });
});

module("parser/structure/number", function() {
    var cases = [
    
    ];
    cases.map(function(c) {
        test('<' + c[0] + '>', function() {
            deepEqual(true, false);
        });
    });
});

