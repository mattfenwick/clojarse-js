define(["libs/maybeerror", "app/tokens", "app/regexizer"], function (ME, Tokens, R) {

    /* tests:
       1. token definitions
       2. line/cols
       3. error messages
         - unclosed string/regex
         - no token possible
         - bad following chars
       5. following chars
    */
    
    return function() {
        
        module("regexizer");
        var scanner = R.scanner,
            T       = Tokens.Token,
            mPure   = ME.pure,
            err     = ME.error;

        
        test("token definitions -- punctuation", function() {
            var ts = [
                ['open-curly',   '{', 1, 1],
                ['close-curly',  '}', 1, 2],
                ['open-paren',   '(', 1, 3],
                ['close-paren',  ')', 1, 4],
                ['open-square',  '[', 1, 5],
                ['close-square', ']', 1, 6],
                ['open-fn',      '#(', 1, 7],
                ['open-set',     '#{', 1, 9]
            ].map(function(t) {
                return T(t[0], t[1], {line: t[2], column: t[3]});
            });
                    
            deepEqual(mPure(ts), scanner("{}()[]#(#{"), "punctuation");
        });
        
        test("token definitions -- all", function() {
            var ts = [
                ['number',       '123',   1, 1],
                ['open-square',  '[',     1, 4],
                ['nil',          'nil',   1, 5],
                ['open-curly',   '{',     1, 8],
                ['boolean',      'true',  1, 9],
                ['open-paren',   '(',     1, 13],
                ['symbol',       'abc',   1, 14],
                ['close-square', ']',     1, 17],
                ['boolean',      'false', 1, 18],
                ['close-curly',  '}',     1, 23],
                ['comment',      'oo',    1, 24],
                ['space',        '\n',    1, 27],
                ['open-set',     '#{',    2, 1],
                ['string',       'blar',  2, 3],
                ['regex',        'nuff',  2, 9],
                ['space',        '  ',    2, 16],
                ['keyword',      'non',   2, 18],
                ['char',         'q',     2, 22],
                ['close-paren',  ')',     2, 24],
                ['open-fn',      '#(',    2, 25],
                ['at-sign',      '@',     2, 27],
                ['open-var',     "#'",    2, 28],
                ['space',        ' ',     2, 30],
                ['number',       '3.2',   2, 31],
                ['space',        ' \n ',  2, 34],
                ['unquote-splicing', '~@', 3, 2],
                ['unquote',      '~',     3, 4],
                ['syntax-quote', '`',     3, 5],
                ['quote',        "'",     3, 6],
                ['meta',         '^',     3, 7],
                ['meta',         '#^',    3, 8],
                ['char',         ' ',     3, 10]];
            var tokens = ts.map(function(x) {
                return T(x[0], x[1], {line: x[2], column: x[3]});
            });

            deepEqual(
                mPure(tokens), 
                scanner('123[nil{true(abc]false};oo\n#{"blar"#"nuff"  :non\\q)#(@#\' 3.2 \n ~@~`\'^#^\\space'), 
                'all tokens');
        });
        
        test("symbols", function() {
            var syms = ['.', '%', '&', 'nil?'];
            syms.map(function(x) {
                propEqual(
                    mPure([T('symbol', x, {line: 1, column: 1}), T('space', ' ', {line: 1, column: x.length + 1})]),
                    scanner(x + ' '),
                    'symbol ' + x);
            });
        });
        
        test("following chars", function() {
            deepEqual(err({error: {message: 'invalid following characters', line: 1, column: 4, rest: 'abc'},
                           tokens: []}),
                      scanner("123abc"),
                      'integer');
            deepEqual(err({error: {message: 'invalid following characters', line: 1, column: 3, rest: '123'},
                           tokens: []}),
                      scanner("\\q123"),
                      'char');
            deepEqual(err({error: {message: 'invalid following characters', line: 1, column: 9, rest: '#{'},
                           tokens: []}),
                      scanner("\\newline#{"),
                      'char -- long');
        });
        
        test("error messages", function() {
        
            deepEqual(err({error: {message: 'end-of-string not found', line: 1, column: 4, rest: '"abc (derr 2 3)'}, 
                           tokens: [T('number', '123', {line: 1, column: 1})]}), 
                      scanner('123"abc (derr 2 3)'), 
                'unclosed string literal');

            deepEqual(err({error: {message: 'end-of-regex not found', line: 2, column: 1, rest: '#"abc (o m g)'}, 
                           tokens: [T('space', ' \n', {line: 1, column: 1})]}), 
                      scanner(' \n#"abc (o m g)'), 
                'unclosed regex literal');

            deepEqual(err({error: {message: 'invalid following characters', line: 1, column: 7, rest: 'g'},
                           tokens: [T('number', '123', {line: 1, column: 1}), T('space', ' ', {line: 1, column: 4})]}), 
                      scanner("123 \\bg"), 
                      "invalid character -- following by something ???");
            
            // don't know why I did propEqual instead ... just tired of seeing all those stupid prototype properties
            propEqual(err({error: {message: 'invalid character escape', line: 1, column: 5, rest: '\\q" 123'},
                           tokens: []}),
                      scanner('"abc\\q" 123'),
                      "invalid char escape");
                        
            // not sure if I can even hit this error -- what are some invalid chars in clojure ?? :  how about #abc or something?          
    //            deepEqual(err({error: {}, tokens: []}), scanner(), 'no matching token found');
        });
    };

});