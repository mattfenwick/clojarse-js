define(["app/ast", "app/ast_to_jstree"], function (AST, a2jst) {

    return function() {
    
        module("ast_to_jstree");
        var convert = a2jst.convert;
        
        function node(data, children) {
            var out = {data: data};
            if ( children ) {
                out.state = 'open';
                out.children = children;
            }
            return out;
        }
        
        test('atoms', function() {
            // the line/col metadata is thrown away
            deepEqual(node('symbol: blargh'), convert(AST.symbol('blargh')), 'symbol');
            deepEqual(node('nil'), convert(AST.nil('meta')), 'nil');
            deepEqual(node('boolean: true'), convert(AST.boolean(true, 13)), 'boolean');
            deepEqual(node('char: a'), convert(AST.char('a', 'oops')), 'char');
            deepEqual(node('string: xyz'), convert(AST.string('xyz', {})), 'string');
            deepEqual(node('regex: [a-z]+\d?'), convert(AST.regex('[a-z]+\d?', [1])), 'regex');
            deepEqual(node('keyword: oopsy'), convert(AST.keyword('oopsy', 222)), 'keyword');
            deepEqual(node('number: 135.24'), convert(AST.number(135.24, 'oh no')), 'number');
        });
        
        test("compound", function() {
            deepEqual(node('list', [node('keyword: abc'), node('number: 13')]), 
                convert(AST.list([AST.keyword('abc'), AST.number(13)])),
                'list');
            deepEqual(node('vector', [node('nil')]),
                convert(AST.vector([AST.nil()])),
                'vector');
            deepEqual(node('set', [node('keyword: u')]),
                convert(AST.set([AST.keyword('u')])),
                'set');
            deepEqual(node('function', [node('symbol: +'), node('number: 4')]),
                convert(AST.function([AST.symbol('+'), AST.number(4)])),
                'function');
            deepEqual(node('table', [node('entry', [node('keyword: abc'), node('number: 123')])]),
                convert(AST.table([[AST.keyword('abc'), AST.number(123)]])),
                'table');
        });
        
        test("macro forms", function() {
            deepEqual(node('syntax quote', [node('symbol: a1')]),
                convert(AST.syntaxquote(AST.symbol('a1'))),
                'syntax quote');
            deepEqual(node('deref', [node('symbol: de')]),
                convert(AST.deref(AST.symbol('de'))),
                'deref');
            deepEqual(node('quote', [node('list', [node('symbol: x')])]),
                convert(AST.quote(AST.list([AST.symbol('x')]))),
                'quote');
            deepEqual(node('unquote', [node('keyword: abc')]),
                convert(AST.unquote(AST.keyword('abc'))),
                'unquote');
            deepEqual(node('metadata', [node('symbol: md')]),
                convert(AST.metadata(AST.symbol('md'))),
                'metadata');
            deepEqual(node('unquote splicing', [node('number: 32')]),
                convert(AST.unquotesplicing(AST.number(32))),
                'unquote splicing');
        });
    };

});