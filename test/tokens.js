"use strict";

var Tokens = require('../lib/tokens'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;

module("tokens", function() {
    
    var token = Tokens.Token;
    
    test("number of tokentypes", function() {
        deepEqual(26, Tokens.priorities.length);
        deepEqual(26, Object.keys(Tokens.tokentypes).length);
    });
    
    test("token constructors", function() {
        var i = 3,
            tests = Tokens.priorities.map(function(tt) {
                i++;
                deepEqual({tokentype: tt, type: 'token', meta: i + 1, value: 'hi: ' + i}, token(tt, 'hi: ' + i, i + 1), tt);
            });
    });
    
    test("invalid token type", function() {
        assert.throws(function() {token('blargh?', 'hi');});
    });

});

