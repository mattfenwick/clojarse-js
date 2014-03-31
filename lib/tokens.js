"use strict";

var PRIORITIES = [
    'open-paren',   'close-paren',  'open-square',      'close-square', 
    'open-curly',   'close-curly',  'at-sign',          'open-var', 
    'open-regex',   'open-fn',      'open-set',         'meta',
    'quote',        'syntax-quote', 'unquote-splicing', 'unquote',
    'string',       'regex',        'number',           'char',         
    'nil',          'boolean',      'symbol',
    'keyword',      'comment',      'space'
];

var TOKENTYPES = {};
PRIORITIES.map(function(t) {
    TOKENTYPES[t] = 1;
});

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

module.exports = {
    tokentypes:  TOKENTYPES,
    priorities:  PRIORITIES,
    Token:  token
};

