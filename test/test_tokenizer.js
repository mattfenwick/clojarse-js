function testTokenizer(tokens, tokenizer, maybeerror) {

    module("tokenizer");
    var T = tokens.Token,
        tize = tokenizer,
        pure = maybeerror.pure;
    
    test("punctuation", function() {
        var p = tize.punc,
            cases = [['open-curly',   '{'],
                     ['close-curly',  '}'],
                     ['open-paren',   '('],
                     ['close-paren',  ')'],
                     ['open-square',  '['],
                     ['close-square', ']'],
                     ['at-sign',      '@'],
                     ['open-var',     "#'"],
                     ['open-set',     '#{'],
                     ['open-fn',      '#('],
                     ['open-regex',   '#"']];
        cases.map(function(x) {
            deepEqual(pure({rest: 'abc', result: T(x[0], x[1])}), p.parse(x[1] + "abc"));
        });
//        deepEqual(pure({rest: 'abc', result: T('open-curly', '{')}), p.parse("{abc"));
    });
    
    test("char", function() {
        var char = tize.char;
        var p =    pure({rest: ' bc', result: T('char', 'a')});
        var q =    char.parse("\\a bc");//);
        
        deepEqual(p, q);
    });
    
    test("string", function() {
        deepEqual(
            pure({rest: ' qrs', result: T('string', 'qrs"\n\\abc')}),
            tize.string.parse('"qrs\"\\n\\\\abc" qrs'));
    });
    /*
    test("number of token types", function() {
        deepEqual(23, tokens.priorities.length);
    });
    
    test("token type priorities", function() {
        ok(0);
    });
    
    test("invalid token construction", function() {    
        expectExc(function() {
            tokens.Token('blargh?', 'hi');
        }, 'ValueError', 'invalid token type causes exception');
    });*/

}
