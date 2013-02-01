define(["libs/maybeerror", "app/tokens"], function (ME, Tokens) {
    "use strict";
    
    var T = Tokens.Token;
    
    function tok(tt) {
        return T.bind(null, tt);
    }
    
    var ESCAPES = {
        'newline':  '\n',
        'space'  :  ' ',
        'tab'    :  '\t'
    };
    
    function fChar(str) {
        if(ESCAPES[str]) {
            return tok('char')(ESCAPES[str]);
        }
        throw new Error('invalid char escape: ' + str);
    }
    
    var AFTER1 = /^[ \t\n\r\f,\"\;\@\^\`\~\(\)\[\]\{\}\\\%]/, /* apparently these chars are known as 'terminating macros' ... */
        AFTER2 = /^[ \t\n\r\f,\"\;\@\^\`\~\(\)\[\]\{\}\\\%\#\'/;
    
    // these don't correspond exactly to token types
    var REGEXES = [
        ['open-paren'   ,  /^(\()/,                   tok('open-paren')   ],
        ['close-paren'  ,  /^(\))/,                   tok('close-paren')  ],
        ['open-square'  ,  /^(\[)/,                   tok('open-square')  ],
        ['close-square' ,  /^(\])/,                   tok('close-square') ],
        ['open-curly'   ,  /^(\{)/,                   tok('open-curly')   ],
        ['close-curly'  ,  /^(\})/,                   tok('close-curly')  ],
        ['at-sign'      ,  /^(@)/,                    tok('at-sign')      ],
        ['open-var'     ,  /^(#')/,                   tok('open-var')     ],
        ['open-fn'      ,  /^(#\()/,                  tok('open-fn')      ],
        ['open-set'     ,  /^(#\{)/,                  tok('open-set')     ],
        ['string'       ,  /^"((?:[^\\\"]|\\[btnfr\"\'\\])*)"/,
                                                      tok('string')       ],
        // 'regex' regex same but starts with #
        ['regex'        ,  /^#"((?:[^\\\"]|\\[btnfr\"\'\\])*)"/,
                                                      tok('regex')        ],
        ['integer'      ,  /^([\+\-]?\d+)/,           tok('number')       ],
        ['float'        ,  /^([\+\-]?\d+\.\d*)/,      tok('number')       ],
        ['ratio'        ,  /^([\+\-]?\d+\/\d+)/,      tok('number')       ],
        // TODO scinum
        ['char-long'    ,  /^\\(newline|space|tab)/,  fChar               ],
        ['char-short'   ,  /^\\(.|\n|\r|\f)/,         tok('char')         ],
        ['nil'          ,  /^(nil)/,                  tok('nil')          ], // TODO does this work?
        ['boolean'      ,  /^(true|false)/,           tok('boolean')      ],
        ['keyword'      ,  /^:([a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%][a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%0-9\/]*)/,
                                                      tok('keyword')      ],
        // same as keyword but for the leading :
        ['symbol'       ,  /^([a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%][a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%0-9\/]*)/, 
                                                      tok('symbol')       ],
        ['comment'      ,  /^(?:;|#!)(.*)/,           tok('comment')      ],
        ['space'        ,  /^((?:\s|,)+)/             tok('space')        ]
    ];
    
    // the below are TOKEN TYPES ... not regexes
    var FOLLOWING = {
        'number'  :  AFTER2,
        'char'    :  AFTER1,
        'nil'     :  AFTER1,
        'boolean' :  AFTER1,
        'keyword' :  AFTER1,
        'symbol'  :  AFTER1
    };
    
    
    function scanner(str) {
        // repeatedly:
        //  - match a regex
        //  - check that the remaining chars are fine. possibilities:
        //    - nothing left:  pass
        //    - anything is fine:  pass
        //    - next chars are fine: pass
        //    - next chars are not fine:  fail
        //  - count line/column consumed
        //  - construct a new token with:
        //    - line, column, tokentype, value
    }


    return {
        'scanner' :  scanner,
        'regexes' :  REGEXES
    };

});