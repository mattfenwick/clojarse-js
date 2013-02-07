define(["app/ast"], function (AST) {

    return function() {
    
        module("ast");
        
        test("metadata", function() {
            propEqual({type: 'astnode', asttype: 'number', value: 3, meta: "i'm some metadata"}, AST.number(3, "i'm some metadata"), 'number');
            propEqual({type: 'astnode', asttype: 'nil', value: null, meta: 14}, AST.nil(14), 'nil');
            propEqual({type: 'astnode', asttype: 'string', value: 'abc', meta: 15}, AST.string('abc', 15), 'string');
            propEqual({type: 'astnode', asttype: 'symbol', value: 'def', meta: 16}, AST.symbol('def', 16), 'symbol');
            propEqual({type: 'astnode', asttype: 'keyword', value: 'ghi', meta: 17}, AST.keyword('ghi', 17), 'keyword');
            propEqual({type: 'astnode', asttype: 'boolean', value: true, meta: 18}, AST.boolean(true, 18), 'boolean');
            propEqual({type: 'astnode', asttype: 'list', value: [], meta: 39}, AST.list([], 39), 'list');
        });
        
    };

});