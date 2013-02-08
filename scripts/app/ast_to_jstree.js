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
    
    function convertDeref(v) {
        return {
            'data': 'deref',
            'children': [convert(v)]
        };
    }
    
    function convertQuote(v) {
        return {
            'data': 'quote',
            'children': [convert(v)]
        };
    }
    
    function convertUnquote(v) {
        return {
            'data': 'unquote',
            'children': [convert(v)]
        };
    }
    
    function convertUnquoteSplicing(v) {
        return {
            'data': 'unquote splicing',
            'children': [convert(v)]
        };
    }
    
    function convertSyntaxQuote(v) {
        return {
            'data': 'syntax quote',
            'children': [convert(v)]
        };
    }
    
    function convertMetadata(v) {
        return {
            'data': 'metadata',
            'children': [convert(v)]
        };
    }

    var actions = {
        'nil'    :  function() {return {'data': 'nil'};},
        'boolean':  function(v) {return {'data': 'boolean: ' + v};},
        'string' :  function(v) {return {'data': 'string: ' + v};},
        'regex'  :  function(v) {return {'data': 'regex: ' + v};},
        'number' :  function(v) {return {'data': 'number: ' + v};},
        'symbol' :  function(v) {return {'data': 'symbol: ' + v};},
        'keyword':  function(v) {return {'data': 'keyword: ' + v};},
        'char'   :  function(v) {return {'data': 'char: ' + v};},
        'list'   :  convertList,
        'vector' :  convertVector,
        'table'  :  convertTable,
        'set'    :  convertSet,
        'function': convertFunction,
        'deref'  :  convertDeref,
        'quote'  :  convertQuote,
        'unquote' : convertUnquote,
        'unquotesplicing' : convertUnquoteSplicing,
        'syntaxquote' : convertSyntaxQuote,
        'metadata'    : convertMetadata
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
    
    return {
        convert:  convert,
    };

});