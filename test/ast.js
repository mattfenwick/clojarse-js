define(["app/ast"], function (AST) {

    return function() {
    
        module("ast");
        
        function astNode(type, value, meta) {
            return {
                type: 'astnode', 
                asttype: type,
                value: value,
                meta: meta
            };
        }
        
        test("parser metadata", function() {
            propEqual(astNode('number', 3, "i'm some metadata"), AST.number(3, "i'm some metadata"), 'number');
            propEqual(astNode('nil', null, 14), AST.nil(14), 'nil');
            propEqual(astNode('string', 'abc', 15), AST.string('abc', 15), 'string');
            propEqual(astNode('symbol', 'def', 16), AST.symbol('def', 16), 'symbol');
            propEqual(astNode('keyword', 'ghi', 17), AST.keyword('ghi', 17), 'keyword');
            propEqual(astNode('boolean', true, 18), AST.boolean(true, 18), 'boolean');
            propEqual(astNode('list', [], 39), AST.list([], 39), 'list');
        });
        
        test("clojure metadata", function() {
            propEqual(astNode('metadata', astNode('string', 'on', 'p'), 'hi'), AST.metadata(astNode('string', 'on', 'p'), 'hi'));
        });
        
        test("macro forms", function() {
            propEqual(astNode('unquotesplicing', 444, 'h'), AST.unquotesplicing(444, 'h'));
        });
    };
});