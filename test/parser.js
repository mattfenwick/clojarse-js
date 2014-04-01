"use strict";

var Tokens = require('../lib/tokens'),
    U = require('unparse-js'),
    AST = require('../lib/ast'),
    ME = U.maybeerror,
    PC = U.combinators, 
    Parser = require('../lib/parser'),
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;

module("parser", function() {
    
    var T = Tokens.Token,
        form = Parser.form,
        tnum = T('number', '32', 1),
        tstr = T('string', 'abc', 2),
        tsym = T('symbol', '+', 3),
        top  = T('open-paren', '(', {line: 3, column: 7}),
        tcp  = T('close-paren', ')', 5),
        tof  = T('open-fn', '#(', 6),
        tos  = T('open-square', '[', 7),
        tcs  = T('close-square', ']', 8),
        toc  = T('open-curly', '{', 9),
        tcc  = T('close-curly', '}', 10),
        tost = T('open-set', '#{', 11),
        treg = T('regex', 'abc', 12),
        tat  = T('at-sign', '@', 13),
        tnil = T('nil', 'nil', 14),
        tfal = T('boolean', 'false', 15),
        tkey = T('keyword', 'abcde', 16),
        tqt  = T('quote', "'", 17),
        tuqt = T('unquote', '~', 18),
        tuqs = T('unquote-splicing', '~@', 19),
        tsq  = T('syntax-quote', '`', 20),
        tmet = T('meta', '#^', 21),
        anum = AST.number(32, 1),
        astr = AST.string('abc', 2),
        asym = AST.symbol('+', 3),
        alis = AST.list([asym, anum, astr], {line: 3, column: 7}),
        af   = AST.function([asym, anum], 6),
        atab = AST.table([[asym, anum]], 9),
        aset = AST.set([asym, anum], 11),
        areg = AST.regex('abc', 12),
        adrf = AST.deref(anum, 13)
        anil = AST.nil(14),
        afal = AST.boolean(false, 15),
        akey = AST.keyword('abcde', 16),
        aqt  = AST.quote(anum, 17),
        auqt = AST.unquote(asym, 18),
        auqs = AST.unquotesplicing(astr, 19),
        asq  = AST.syntaxquote(anum, 20),
        amet = AST.metadata(asym, 21);
        
    function good(rest, result) {
        return ME.pure({rest: rest, result: result});
    }
    
    test('assorted forms', function() {
        deepEqual(good([tnum], astr), form.parse([tstr, tnum]), 'string');
        deepEqual(good([], asym), form.parse([tsym]), 'symbol');
        deepEqual(good([tsym], anum), form.parse([tnum, tsym]), 'number');
        deepEqual(good([], alis), form.parse([top, tsym, tnum, tstr, tcp]), 'list');
        deepEqual(good([], af), form.parse([tof, tsym, tnum, tcp]), 'function');
        deepEqual(good([1], atab), form.parse([toc, tsym, tnum, tcc, 1]), 'table');
        deepEqual(good([], aset), form.parse([tost, tsym, tnum, tcc]), 'set');
        deepEqual(good([], areg), form.parse([treg]), 'regex');
        deepEqual(good([tnum], adrf), form.parse([tat, tnum, tnum]), 'deref');
        deepEqual(good([], anil), form.parse([tnil]), 'nil');
        deepEqual(good([], afal), form.parse([tfal]), 'boolean');
        deepEqual(good([], akey), form.parse([tkey]), 'keyword');
    });
    
    test('quote, unquote, splicing, unquotesplicing, meta', function() {
        deepEqual(good([tstr], aqt), form.parse([tqt, tnum, tstr]), 'quote');            
        deepEqual(good([tnum], auqt), form.parse([tuqt, tsym, tnum]), 'unquote');
        deepEqual(good([tsym], auqs), form.parse([tuqs, tstr, tsym]), 'unquotesplicing');
        deepEqual(good([tsym], asq), form.parse([tsq, tnum, tsym]), 'syntaxquote');
        propEqual(good([tnum], amet), form.parse([tmet, tsym, tnum]), 'metadata');
    });
    
    test('unmatched open delimiter', function() {
        deepEqual(
             ME.error({rule: 'list', meta: {line: 3, column: 7}}),
             form.parse([top, tsym, tstr]),// '( + abc'
             'unmatched open-paren');
    });
    
    test('unmatched close delimiter', function() {
        deepEqual(
             ME.error({rule: 'vector', meta: 7}),
             form.parse([tos, tsym, tcp, tcs]),// '[ + ) ]'
             'unmatched close-paren -- unfortunately, the error reporting is poor');
    });

    test('nested errors -- innermost wins', function() {
        deepEqual(
            ME.error({rule: 'set', meta: 11}),
            form.parse([tos, tost]));// "(abc [123"  -- report square-bracket error
    });

    test('unconsumed input remaining', function() {
        ok(0, 'unimplemented');// not sure what example would produce unconsumed output
    });
    
/*        test('metadata must be symbol, keyword, string, map', function() {
        
    });
    
    test('@ deref -- must be what ???', function() {
    
    });
    
    test("many nested delimiters, finally one's unmatched -- what to report?", function() {
        // something like:   [[[]]) <-- report missing ']'?  or extra ')' -- which is the Clojure behavior ... ???
    });
*/
});

