define(["libs/maybeerror", "libs/parsercombs", "app/tokens"], function (ME, PC, Tokens) {
    "use strict";
    
    var T = Tokens.Token;

    var openParen   = PC.literal('(').fmap(T.bind(null, 'open-paren')),
        closeParen  = PC.literal(')').fmap(T.bind(null, 'close-paren')),
        openSquare  = PC.literal('[').fmap(T.bind(null, 'open-square')),
        closeSquare = PC.literal(']').fmap(T.bind(null, 'close-square')),
        openCurly   = PC.literal('{').fmap(T.bind(null, 'open-curly')),
        closeCurly  = PC.literal('}').fmap(T.bind(null, 'close-curly')),
        atSign      = PC.literal('@').fmap(T.bind(null, 'at-sign')),
        openVar     = PC.string("#'").fmap(T.bind(null, 'open-var')),
        openRegex   = PC.string('#"').fmap(T.bind(null, 'open-regex')),
        openFn      = PC.string('#(').fmap(T.bind(null, 'open-fn')),
        openSet     = PC.string('#{').fmap(T.bind(null, 'open-set'));
        
    var punctuation = PC.any([
        openParen,  closeParen, 
        openSquare, closeSquare,
        openCurly,  closeCurly,
        atSign,     openVar, 
        openRegex,  openFn,
        openSet]);

    var ESCAPES = [
        ['b' ,  '\b'],
        ['t' ,  '\t'],
        ['n' ,  '\n'],
        ['f' ,  '\f'],
        ['r' ,  '\r'],
        ['"' ,  '"' ],
        ["'" ,  "'" ],
        ['\\',  '\\']
    ];
    
    var escape = PC.literal('\\')
        .seq2R(PC.any(ESCAPES.map(function(e) {
            // match the character and return the translation
            return PC.literal(e[0]).seq2R(PC.pure(e[1]));
        }))),
        sq = PC.literal("'"),
        dq = PC.literal('"'),
        notSlashOrDq = PC.literal('\\').plus(dq).not1(),
        stringBody = notSlashOrDq.plus(escape).many0().fmap(function(x) {return x.join('');});

    var string = dq.seq2R(stringBody).seq2L(dq).fmap(T.bind(null, 'string'));

    var regex = openRegex.seq2R(stringBody).seq2L(dq);

    var digit = PC.item.check(function(c) {
        return c >= '0' && c <= '9'; // does this work?
    });
    
    var integer = digit.many1(),
        float = PC.all([integer, PC.literal('.'), digit.many0()]),
        ratio = PC.all([integer, PC.literal('/'), integer]),
        sign = PC.literal('-').plus(PC.literal('+')).optional(),
        scinum = null, // TODO !!!!
        number = PC.all([sign, PC.any([float, integer, ratio, scinum])]);
        
    // how does 'string' work with equality?  not sure if it needs to be passed a function
    var char = PC.literal('\\')
        .seq2R(PC.any([
            PC.string('newline').seq2R(PC.pure('\n')), 
            PC.string('space').seq2R(PC.pure(' ')), 
            PC.string('tab').seq2R(PC.pure('\t')), 
            PC.item])).fmap(T.bind(null, 'char'));
    // TODO whoa whoa whoa -- does char have to look ahead so that it can correctly identify \ab as an error?
    //   note that this can be solved using the get/check/put parsers
    
    var nil = PC.string('nil'),
        bool = PC.string('true').plus(PC.string('false'));
        
    /* tests */
    
    var tests = (function() {
        var T = Tokens.Token,
            mPure = ME.pure;

        var tests = [['open-curly',   '{'],
                ['close-curly',  '}'],
                ['open-paren',   '('],
                ['close-paren',  ')'],
                ['open-square',  '['],
                ['close-square', ']'],
                ['at-sign',      '@'],
                ['open-var',     "#'"],
                ['open-set',     '#{'],
                ['open-fn',      '#('],
                ['open-regex',   '#"']].map(function(x) {
                    return ['punctuation: ' + x[0], mPure({rest: 'abc', result: T(x[0], x[1])}), punctuation.parse(x[1] + "abc")];
                });
        return tests.concat([
            ['char', mPure({rest: ' bc', result: T('char', 'a')}), char.parse("\\a bc")],
            ['escape', mPure({rest: 'ab', result: '\r'}), escape.parse('\\rab')],
            ['stringbody', mPure({rest: '"def', result: 'abc'}), stringBody.parse('abc"def')],
            ['string', mPure({rest: ' zzz', result: T('string', 'qrs"\n\\abc')}),
                string.parse('"qrs\\"\\n\\\\abc" zzz')]
        ]);
    })();


    return {
        'tokenize':  null,
        'punc'    :  punctuation,
        'char'    :  char,
        'string'  :  string,
        'escape'  :  escape,
        'nil'     :  nil,
        'tests'   :  tests
    };

});