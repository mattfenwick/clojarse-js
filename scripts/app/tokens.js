define(function () {
    "use strict";
    
    var TOKENTYPES = {
        'open-paren'   : 1,
        'close-paren'  : 1,
        'open-square'  : 1,
        'close-square' : 1,
        'open-curly'   : 1,
        'close-curly'  : 1,
        'at-sign'      : 1,
        'open-var'     : 1,
        'open-regex'   : 1,
        'open-fn'      : 1,
        'open-set'     : 1,
        'single-quote' : 1,
        'double-quote' : 1,
        'string'    : 1,
        'regex'     : 1,
        'number'    : 1,
        'char'      : 1,
        'nil'       : 1,
        'boolean'   : 1,
        'symbol'    : 1,
        'keyword'   : 1,
        'comment'   : 1,
        'space'     : 1
    };
    
    var PRIORITIES = [
        'open-paren',   'close-paren', 'open-square', 'close-square', 
        'open-curly',   'close-curly', 'at-sign',     'open-var', 
        'open-regex',   'open-fn',     'open-set',    'single-quote',
        'double-quote', 'string',      'regex',       'number',
        'char',         'nil',         'boolean',     'symbol',
        'keyword',      'comment',     'space'
    ];
    
    function token(tokentype, value, meta) {
        if(!(tokentype in TOKENTYPES)) {
            throw {type: 'ValueError', expected: 'valid token type', actual: tokentype};
        }
        return {
            type: 'token',
            tokentype: tokentype,
            value: value,
            meta: meta
        };
    }
    
    return {
        tokentypes:  TOKENTYPES,
        priorities:  PRIORITIES,
        Token:  token
    };

});