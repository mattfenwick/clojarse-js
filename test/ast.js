"use strict";

var AST = require('../lib/ast'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("ast", function() {

    function astNode(type, value, meta) {
        return {
            type: 'astnode', 
            asttype: type,
            value: value,
            meta: meta
        };
    }
    
    test("parser metadata", function() {
        deepEqual(astNode('number', 3, "i'm some metadata"), AST.number(3, "i'm some metadata"), 'number');
        deepEqual(astNode('nil', null, 14), AST.nil(14), 'nil');
        deepEqual(astNode('string', 'abc', 15), AST.string('abc', 15), 'string');
        deepEqual(astNode('symbol', 'def', 16), AST.symbol('def', 16), 'symbol');
        deepEqual(astNode('keyword', 'ghi', 17), AST.keyword('ghi', 17), 'keyword');
        deepEqual(astNode('boolean', true, 18), AST.boolean(true, 18), 'boolean');
        deepEqual(astNode('list', [], 39), AST.list([], 39), 'list');
    });
    
    test("clojure metadata", function() {
        deepEqual(astNode('metadata', astNode('string', 'on', 'p'), 'hi'), AST.metadata(astNode('string', 'on', 'p'), 'hi'));
    });
    
    test("macro forms", function() {
        deepEqual(astNode('unquotesplicing', 444, 'h'), AST.unquotesplicing(444, 'h'));
    });
});

