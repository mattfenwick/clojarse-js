define(["app/ast"], function (AST) {

    function manySubs(type, subs) {
        if(subs.length === undefined || typeof subs === 'string') {
            throw new Error('type error');
        }
        return {
            'data': type,
            'children': subs.map(convert)
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
    
    function oneSub(type, sub) {
        return {
            'data': type,
            'children': [convert(sub)]
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
        'list'   :  manySubs.bind(null, 'list'),
        'vector' :  manySubs.bind(null, 'vector'),
        'table'  :  convertTable,
        'set'    :  manySubs.bind(null, 'set'),
        'function': manySubs.bind(null, 'function'),
        'deref'  :  oneSub.bind(null, 'deref'),
        'quote'  :  oneSub.bind(null, 'quote'),
        'unquote' : oneSub.bind(null, 'unquote'),
        'unquotesplicing' : oneSub.bind(null, 'unquote splicing'),
        'syntaxquote' : oneSub.bind(null, 'syntax quote'),
        'metadata'    : oneSub.bind(null, 'metadata')
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