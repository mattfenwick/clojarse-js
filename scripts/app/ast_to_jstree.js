define(["app/ast"], function (AST) {

    function manySubs(type, subs) {
        if(subs.length === undefined || typeof subs === 'string') {
            throw new Error('type error');
        }
        return {
            'data': type,
            'children': subs.map(convert),
            'state': 'open'
        };
    }

    function convertTable(pairs) {
        return {
            'data': 'table',
            'children': pairs.map(manySubs.bind(null, 'entry')),
            'state': 'open'
        };
    }
    
    function oneSub(type, sub) {
        return {
            'data': type,
            'children': [convert(sub)],
            'state': 'open'
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
            return f(astNode.value);
        }
        throw new Error('unrecognized astnode type: ' + astNode.asttype);
    }
    
    return {
        convert:  convert,
    };

});