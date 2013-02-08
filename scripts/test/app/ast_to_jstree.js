define(["app/ast", "app/ast_to_jstree"], function (AST, a2jst) {

    return function() {
    
        module("ast_to_jstree");
        var convert = a2jst.convert;
        
        test('atom', function() {
            deepEqual({'data': 'symbol: blargh', 'state': 'open'}, convert(AST.symbol('blargh')), 'symbol');
        });
        
        test("compound", function() {
            deepEqual({data: 'list', state: 'open',
                       children: [{data: 'keyword: abc', state: 'open'}, 
                                     {data: 'number: 13', state: 'open'}]}, 
                convert(AST.list([AST.keyword('abc'), AST.number(13)])),
                'list');
        });
        
        test("macro form", function() {
            deepEqual({data: 'syntax quote', state: 'open',
                       children: [{data: 'symbol: a1', state: 'open'}]},
                convert(AST.syntaxquote(AST.symbol('a1'))),
                'syntax quote');
        });
    };

});