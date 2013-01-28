function testTokens(tokens, testHelper) {

    module("tokens");
    var expectExc = testHelper.expectException;
    
    test("Token construction", function() {
        var ts = {
			'open-paren'   : '(',
			'close-paren'  : ')',
			'open-square'  : '[',
			'close-square' : ']',
			'open-curly'   : '{',
			'close-curly'  : '}',
			'at-sign'      : '@',
			'open-var'     : "#'",
			'open-regex'   : '#"',
			'open-fn'      : '#(',
			'open-set'     : '#{',
			'single-quote' : "'",
			'double-quote' : '"',
			'string'       : 'abc',
			'regex'        : 'def',
			'number'       : '32',
			'char'         : 'x',
			'nil'          : 'nil',
			'boolean'      : 'true',
			'symbol'       : 'abc',
			'keyword'      : ':def',
			'comment'      : 'blargh\n',
			'space'        : '  \t \n\r  '
		}, 
            i = 2; // arbitrary number so things don't get boring
        
        for(var t in ts) {
            deepEqual({type: 'token', tokentype: t,
                       meta: {line: i * 2, column: i * 3},
                       value: ts[t]}, 
                      tokens.Token(t, ts[t], {line: i * 2, column: i * 3}));
            i++; // keep it exciting !!!
        }
    });
    
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
    });

}
