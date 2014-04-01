"use strict";

var Tokens = require('../lib/tokens'),
    Tzer = require('../lib/tokenizer'),
    ME = require('unparse-js').maybeerror,
    assert = require('assert');

var module = describe,
    test = it,
    deepEqual = assert.deepEqual;


module("tokenizer", function() {
    
    var T = Tokens.Token,
        mPure = ME.pure;
    
    test('punctuation', function() {
        [['open-curly',   '{'],
            ['close-curly',  '}'],
            ['open-paren',   '('],
            ['close-paren',  ')'],
            ['open-square',  '['],
            ['close-square', ']'],
            ['open-fn',      '#('],
            ['open-set',     '#{']].map(function(x) {
                deepEqual(mPure({rest: 'abc', result: T(x[0], x[1])}), Tzer.punc.parse(x[1] + "abc"), x[0]);
            });
    });
    
    test("non-punctuation", function() {
        var token = Tzer.token.parse;
        [
            ['at-sign', mPure({rest: 'd', result: T('at-sign', '@')}), token("@d")],
            ['open-var', mPure({rest:'ouch', result: T('open-var', "#'")}), token("#'ouch")],
            ['char', mPure({rest: ' bc', result: T('char', 'a')}), token("\\a bc")],
            ['char', mPure({rest: '@de', result: T('char', '\n')}), token("\\newline@de")],
            ['char -- cannot be followed by some characters', ME.error('char format error'), token("\\a#bc")],
            ['char -- cannot be followed by some characters', ME.error('char format error'), token("\\abc")],
            ['escape', mPure({rest: 'ab', result: '\r'}), Tzer.escape.parse('\\rab')],
            ['string', mPure({rest: ' zzz', result: T('string', 'qrs"\n\\abc')}),
                token('"qrs\\"\\n\\\\abc" zzz')],
            ['regex', mPure({rest: 'blargh', result: T('regex', 'uh\noh')}), 
                token('#"uh\noh"blargh')],
            ['number -- float', mPure({rest: ';abc', result: T('number', '412.34')}), token("412.34;abc")],
            ['bool -- true', mPure({rest: '%abc', result: T('boolean', 'true')}), token('true%abc')],
            ['bool -- false', mPure({rest: ' \t', result: T('boolean', 'false')}), token('false \t')],
            ["bools can't be followed by some chars", ME.error('boolean format error'), token("false'a")],
            ['nil', mPure({rest: '[]', result: T('nil', 'nil')}), token('nil[]')],
            ['nil cannot be followed by some chars', ME.error('nil format error'), token("nil#{1}")],
            ['symbol', mPure({rest: '[]', result: T('symbol', 'a1_+-')}), token('a1_+-[]')],
            ['symbol -- cannot be followed by some chars', ME.error('symbol format error'), token('abc#{}')],
            ['symbol -- dots, slashes, etc', mPure({rest: '{', result: T('symbol', '../ab.%c')}), token('../ab.%c{')],
            ['keyword', mPure({rest: '{}', result: T('keyword', 'abc123')}), token(':abc123{}')],
            ['keyword -- cannot be followed by some chars', ME.error('symbol format error'), token(':abc#{}')],
            ['comment ;', mPure({rest: '\nabc', result: T('comment', 'hi!')}), token(';hi!\nabc')],
            ['comment #!', mPure({rest: '', result: T('comment', 'uh-oh')}), token('#!uh-oh')],
            ['space', mPure({rest: '123', result: T('space', '\t, \n\r\f')}), token('\t, \n\r\f123')],
            ['token -- nil', mPure({rest: ';okay', result: T('nil', 'nil')}), token('nil;okay')]
        ].map(function(x) {
            deepEqual(x[1], x[2], x[0]);
        });
    });
        
    test("consecutive tokens", function() {
        deepEqual(mPure({rest: '', 
                result: [
                    T('number', '123'),
                    T('open-square', '['),
                    T('nil', 'nil'),
                    T('open-curly', '{'),
                    T('boolean', 'true'),
                    T('open-paren', '('),
                    T('symbol', 'abc'),
                    T('close-square', ']'),
                    T('boolean', 'false'),
                    T('close-curly', '}'),
                    T('comment', 'oo'),
                    T('space', '\n'),
                    T('open-set', '#{'),
                    T('string', 'blar'),
                    T('regex', 'nuff'),
                    T('space', '  '),
                    T('keyword', 'non'),
                    T('char', 'q'),
                    T('close-paren', ')'),
                    T('open-fn', '#('),
                    T('at-sign', '@'),
                    T('open-var', "#'"),
                    T('space', ' '),
                    T('number', '3.2')
                ]}),
            Tzer.scanner.parse('123[nil{true(abc]false};oo\n#{"blar"#"nuff"  :non\\q)#(@#\' 3.2'));
    });
});

