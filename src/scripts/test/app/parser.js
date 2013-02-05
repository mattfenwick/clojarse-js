define(["app/tokens", "app/ast", "libs/maybeerror", "libs/parsercombs", "app/parser"], function (Tokens, AST, ME, PC, Parser) {

    return function() {
    
        module("parser");
        var T = Tokens.Token,
            form = Parser.form;
        
        test('basic tests', function() {
            [['string', ME.pure({rest: [T('number', '32')], result: AST.string('abc')}), 
                    form.parse([T('string', 'abc'), T('number', '32')])],
                ['list', ME.pure({rest: [], result: AST.list([AST.symbol('+'), AST.number(13), AST.symbol('x')])}),
                    form.parse([T('open-paren', '('), T('symbol', '+'), T('number', '13'),
                                  T('symbol', 'x'), T('close-paren', ')')])],
                ['function', ME.pure({rest: [], result: AST.function([AST.symbol('a'), AST.symbol('%')])}),
                    form.parse([T('open-fn', '#('), T('symbol', 'a'),
                                      T('symbol', '%'), T('close-paren', ')')])]
            ].map(function(x) {
                propEqual(x[1], x[2], x[0]);
            });
        });
    };

});