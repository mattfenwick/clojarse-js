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
        openFn,     openSet]);

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
    
    // join a list of chars into a string
    function joiner(x) {
        return x.join('');
    }
    
    var escape = PC.literal('\\')
        .seq2R(PC.any(ESCAPES.map(function(e) {
            // match the character and return the translation
            return PC.literal(e[0]).seq2R(PC.pure(e[1]));
        }))),
        sq = PC.literal("'"),
        dq = PC.literal('"'),
        notSlashOrDq = PC.literal('\\').plus(dq).not1(),
        stringBody = notSlashOrDq.plus(escape).many0().fmap(joiner);

    var string = dq.seq2R(stringBody).seq2L(dq).fmap(T.bind(null, 'string'));

    // if strings are single tokens, then regexes should be, too
    var regex = openRegex.seq2R(stringBody).seq2L(dq).fmap(T.bind(null, 'regex'));

    var TERMINATING_MACRO = PC.get.check(function(ts) {
            if (ts.length === 0) return true;
            var ALLOWABLE = ' \t\n\r\f,";@^`~()[]{}\\%';
            for(var i = 0; i < ALLOWABLE.length; i++) {
                if(ts[0] === ALLOWABLE[i]) {
                    return true;
                }
            }
            return false;
        }),
        ANY_MACRO = PC.get.check(function(ts) {
                if (ts.length === 0) return true;
                var ALLOWABLE = '#\' \t\n\r\f,";@^`~()[]{}\\%';
                for(var i = 0; i < ALLOWABLE.length; i++) {
                    if(ts[0] === ALLOWABLE[i]) {
                        return true;
                    }
                }
                return false;
            });
    
    var digit = PC.item.check(function(c) {
        return c >= '0' && c <= '9'; // does this work?
    });
    
    var integer = digit.many1().fmap(joiner),
        ratio = PC.all([integer, PC.literal('/'), integer]).fmap(joiner),
        float = PC.all([integer, PC.literal('.'), integer.optional()]).fmap(joiner),
        sign = PC.literal('-').plus(PC.literal('+')).optional(),
        scinum = null, // TODO !!!!
        number = PC.all([sign, PC.any([float, ratio, integer])]) //, scinum])])
            .fmap(function(x) {
                return T('number', x.join(''));
            })
            .seq2L(ANY_MACRO.commit('number format error'));
        
    var char = PC.literal('\\')
        .seq2R(PC.any([
            PC.string('newline').seq2R(PC.pure('\n')), 
            PC.string('space').seq2R(PC.pure(' ')), 
            PC.string('tab').seq2R(PC.pure('\t')), 
            PC.item])).fmap(T.bind(null, 'char'))
        .seq2L(TERMINATING_MACRO.commit('char format error'));
    
    var nil = PC.string('nil')
            .fmap(T.bind(null, 'nil'))
            .seq2L(TERMINATING_MACRO.commit('nil format error')),
        bool = PC.string('true')
            .plus(PC.string('false'))
            .fmap(T.bind(null, 'boolean'))
            .seq2L(TERMINATING_MACRO.commit('boolean format error'));
    
    var symbolHead = PC.item.check(function(c) {
            return c.match(/^[a-zA-Z\*\+\!\-\_\?\>\<\=\$]$/);
        }),
        symbolRest = PC.any([symbolHead, digit, PC.literal('.'), PC.literal('/')]),
        symbolBody = PC.app(function(f, r) {return [f, r].join('');}, symbolHead, symbolRest.many0().fmap(joiner))
            .seq2L(TERMINATING_MACRO.commit('symbol format error')),
        symbol = symbolBody.fmap(T.bind(null, 'symbol'));
    
    var keyword = PC.literal(':').seq2R(symbolBody.fmap(T.bind(null, 'keyword')));
    
    var newline = PC.any([PC.literal('\n'), PC.literal('\r'), PC.literal('\f')]),
        comment = PC.any([PC.literal(';'), PC.string('#!')])
            .seq2R(newline.not1().many0().fmap(joiner))
            .fmap(T.bind(null, 'comment')),
        space = PC.item.check(function(c) {return c.match(/^[ \t,]$/);})
            .plus(newline)
            .many1()
            .fmap(joiner)
            .fmap(T.bind(null, 'space'));
    
    var token = PC.any([
            punctuation, atSign, 
            openVar, char, string, 
            regex, number, bool, 
            nil, symbol, keyword,
            comment, space
        ]),
        scanner = token.many0();
        
    /* tests */
    
    var tests = (function() {
        var mPure = ME.pure;

        var tests = [['open-curly',   '{'],
                ['close-curly',  '}'],
                ['open-paren',   '('],
                ['close-paren',  ')'],
                ['open-square',  '['],
                ['close-square', ']'],
                ['open-fn',      '#('],
                ['open-set',     '#{']].map(function(x) {
                    return ['punctuation: ' + x[0], mPure({rest: 'abc', result: T(x[0], x[1])}), punctuation.parse(x[1] + "abc")];
                });
        tests = tests.concat([
            ['at-sign', mPure({rest: 'd', result: T('at-sign', '@')}), atSign.parse("@d")],
            ['open-var', mPure({rest:'ouch', result: T('open-var', "#'")}), openVar.parse("#'ouch")],
            ['char', mPure({rest: ' bc', result: T('char', 'a')}), char.parse("\\a bc")],
            ['char', mPure({rest: '@de', result: T('char', '\n')}), char.parse("\\newline@de")],
            ['char -- cannot be followed by some characters', ME.error('char format error'), char.parse("\\a#bc")],
            ['char -- cannot be followed by some characters', ME.error('char format error'), char.parse("\\abc")],
            ['escape', mPure({rest: 'ab', result: '\r'}), escape.parse('\\rab')],
            ['stringbody', mPure({rest: '"def', result: 'abc'}), stringBody.parse('abc"def')],
            ['string', mPure({rest: ' zzz', result: T('string', 'qrs"\n\\abc')}),
                string.parse('"qrs\\"\\n\\\\abc" zzz')],
            ['regex', mPure({rest: 'blargh', result: T('regex', 'uh\noh')}), 
                regex.parse('#"uh\noh"blargh')],
            ['number -- float', mPure({rest: ';abc', result: T('number', '412.34')}), number.parse("412.34;abc")],
            ['bool -- true', mPure({rest: '%abc', result: T('boolean', 'true')}), bool.parse('true%abc')],
            ['bool -- false', mPure({rest: ' \t', result: T('boolean', 'false')}), bool.parse('false \t')],
            ["bools can't be followed by some chars", ME.error('boolean format error'), bool.parse("false'a")],
            ['nil', mPure({rest: '[]', result: T('nil', 'nil')}), nil.parse('nil[]')],
            ['nil cannot be followed by some chars', ME.error('nil format error'), nil.parse("nil#{1}")],
            ['symbol', mPure({rest: '[]', result: T('symbol', 'a1_+-')}), symbol.parse('a1_+-[]')],
            ['symbol -- cannot be followed by some chars', ME.error('symbol format error'), symbol.parse('abc#{}')],
            ['keyword', mPure({rest: '{}', result: T('keyword', 'abc123')}), keyword.parse(':abc123{}')],
            ['keyword -- cannot be followed by some chars', ME.error('symbol format error'), keyword.parse(':abc#{}')],
            ['comment ;', mPure({rest: '\nabc', result: T('comment', 'hi!')}), comment.parse(';hi!\nabc')],
            ['comment #!', mPure({rest: '', result: T('comment', 'uh-oh')}), comment.parse('#!uh-oh')],
            ['space', mPure({rest: '123', result: T('space', '\t, \n\r\f')}), space.parse('\t, \n\r\f123')],
            ['token -- nil', mPure({rest: ';okay', result: T('nil', 'nil')}), token.parse('nil;okay')]
        ]);
        return tests.concat([['tokens -- all',
            mPure({rest: '', 
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
            scanner.parse('123[nil{true(abc]false};oo\n#{"blar"#"nuff"  :non\\q)#(@#\' 3.2')
        ]]);
    })();


    return {
        
        'token'   :  token,
        'scanner' :  scanner,
        
        // 'public' parsers
        'punc'    :  punctuation,
        'char'    :  char,
        'string'  :  string,
        'nil'     :  nil,
        'bool'    :  bool,
        'number'  :  number,
        'keyword' :  keyword,
        'symbol'  :  symbol,
        'space'   :  space,

        // 'private' parsers
        'escape'  :  escape,

        // other
        'tests'   :  tests
    };

});