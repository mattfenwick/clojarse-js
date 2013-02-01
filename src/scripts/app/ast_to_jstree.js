define(["app/ast"], function (AST) {

    function convertList(v) {
        return {
            'data': 'list',
            'children': v.map(convert)
        };
    }
    
    function convertVector(v) {
        return {
            'data': 'vector',
            'children': v.map(convert)
        };
    }
    
    function convertTable(pairs) {
        var kids = pairs.map(function(p) {
            return {
                'data': 'entry',
                children: p.map(convert),
                'state': 'open'
            };
        });
        return {
            'data': 'table',
            'children': kids
        };
    }
    
    function convertSet(v) {
        return {
            'data': 'set',
            'children': v.map(convert)
        };
    }
    
    function convertFunction(v) {
        return {
            'data': 'function',
            'children': v.map(convert)
        };
    }

    var actions = {
        'nil'    :  function() {return {'data': 'nil'};},
        'boolean':  function(v) {return {'data': 'boolean: ' + v};},
        'string' :  function(v) {return {'data': 'string: ' + v};},
        'number' :  function(v) {return {'data': 'number: ' + v};},
        'symbol' :  function(v) {return {'data': 'symbol: ' + v};},
        'keyword':  function(v) {return {'data': 'keyword: ' + v};},
        'char'   :  function(v) {return {'data': 'char: ' + v};},
        'list'   :  convertList,
        'vector' :  convertVector,
        'table'  :  convertTable,
        'set'    :  convertSet,
        'function': convertFunction
    };

    function convert(astNode) {
        var f = actions[astNode.asttype];
        if ( f ) {
            var val = f(astNode.value);
            val.state = 'open';
            return val;
        }
        throw new Error('unrecognized astnode type: ' + astNode.asttype);
    }
    
    /* tests */
    
    var tests = (function() {
        return [
            ['symbol', {'data': 'symbol: blargh', 'state': 'open'}, convert(AST.symbol('blargh'))],
            ['list', {data: 'list', state: 'open',
                      children: [{data: 'keyword: abc', state: 'open'}, 
                                 {data: 'number: 13', state: 'open'}]}, 
                convert(AST.list([AST.keyword('abc'), AST.number(13)]))]
        ];
    })();

    return {
    
        convert:  convert,
    
        tests:  tests
    };

});