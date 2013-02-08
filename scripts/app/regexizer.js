define(["libs/maybeerror", "app/tokens"], function (MaybeError, Tokens) {
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
    
    function fChar(str, meta) {
        if(ESCAPES[str]) {
            return tok('char')(ESCAPES[str], meta);
        }
        throw new Error('invalid char escape: ' + str);
    }
    
    function fSymbol(str, meta) {
        var ttype = 'symbol';
        if(str === 'nil') {
            ttype = 'nil';
        } else if(str === 'false' || str === 'true') {
            ttype = 'boolean';
        }
        return T(ttype, str, meta);
    }
    
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
        ['meta'         ,    /^(\^|\#\^)/,            tok('meta')         ],
        ['quote'        ,    /^(\')/,                 tok('quote')        ],
        ['syntax-quote' ,    /^(\`)/,                 tok('syntax-quote') ],
        ['unquote-splicing', /^(~@)/,                 tok('unquote-splicing')],
        ['unquote'      ,    /^(~)/,                  tok('unquote')      ],
        ['string'       ,  /^"((?:[^\\\"]|\\[btnfr\"\'\\])*)"/,
                                                      tok('string')       ],
        // 'regex' regex same but starts with #
        ['regex'        ,  /^#"((?:[^\\\"]|\\[btnfr\"\'\\])*)"/,
                                                      tok('regex')        ],
        ['float'        ,  /^([\+\-]?\d+\.\d*)/,      tok('number')       ],
        ['ratio'        ,  /^([\+\-]?\d+\/\d+)/,      tok('number')       ],
        ['integer'      ,  /^([\+\-]?\d+)/,           tok('number')       ],
        // TODO scinum
        ['char-long'    ,  /^\\(newline|space|tab)/,  fChar               ],
        ['char-short'   ,  /^\\(.|\n|\r|\f)/,         tok('char')         ],
        ['keyword'      ,  /^:([a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%\&][a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%\&0-9\/]*)/,
                                                      tok('keyword')      ],
        // same as keyword but for the leading :
        ['symbol'       ,  /^([a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%\&][a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%\&0-9\/]*)/, 
                                                      fSymbol             ],
        ['comment'      ,  /^(?:;|#!)(.*)/,           tok('comment')      ],
        ['space'        ,  /^((?:\s|,)+)/,            tok('space')        ]
    ];
    
    var AFTER1 = /^[ \t\n\r\f,\"\;\@\^\`\~\(\)\[\]\{\}\\\%]/, /* apparently these chars are known as 'terminating macros' ... */
        AFTER2 = /^[ \t\n\r\f,\"\;\@\^\`\~\(\)\[\]\{\}\\\%\#\']/;
    
    var FOLLOWING = {
        'integer'     :  AFTER2,
        'float'       :  AFTER2,
        'ratio'       :  AFTER2,
        'char-long'   :  AFTER1,
        'char-short'  :  AFTER1,
        'nil'         :  AFTER1,
        'boolean'     :  AFTER1,
        'keyword'     :  AFTER1,
        'symbol'      :  AFTER1
    };

    function tokenError(message, line, column, rest) {
        return MaybeError.error({
            message  :  message,
            line     :  line,
            column   :  column,
            rest     :  rest
        });
    }
    
    function countLCs(string) {
        var lines = 0,
            columns = 0,
            i;
        for(i = 0; i < string.length; i++) {
            if(string[i] === '\n') {
                lines++;
                columns = 0;
            } else {
                columns++;
            }
        }
        return [lines, columns];
    }

    //   error if:
    //      string or regex is started but not stopped
    //   or if the input doesn't match any token definitions
    function nextToken(string, line, column) {
        var match, i,
            name, regex, action,
            res, count,
            newLine, newCol,
            rest, regexA;

        // 0. empty string
        if (string === "") {
            return MaybeError.zero;
        }
        
        for(i = 0; i < REGEXES.length; i++) {
            name = REGEXES[i][0];
            regex = REGEXES[i][1];
            action = REGEXES[i][2];
            if(match = string.match(REGEXES[i][1])) {
                count = countLCs(match[0]);
                newLine = line + count[0];
                newCol = ((count[0] > 0) ? 1 : column) + count[1];
                rest = string.substring(match[0].length);
                regexA = FOLLOWING[name];
                // if we do care what follows, something follows, and what's following isn't good:
                if(regexA && rest && !rest.match(regexA)) {
                    return tokenError('invalid following characters', newLine, newCol, rest);
                }
                return MaybeError.pure({
                    'token' : action(match[1], {line: line, column: column}),
                    'rest'  : rest,
                    'line'  : newLine,
                    'column': newCol
                });
            }
        }
        
        if (string[0] === '"') { // this is special-cased to provide better error reporting
            return tokenError("end-of-string not found", line, column, string);
        }
        
        if (string.slice(0, 2) === '#"') { // open-regex
            return tokenError("end-of-regex not found", line, column, string);
        }
        
        if (string[0] === '\\') { // char 
            return tokenError("invalid character", line, column, string);
        }

        return tokenError("no tokens matched", line, column, string);
    }
    
    // must parse entire string to succeed
    function tokenize(string) {
        var tokens = [],
            next,
            line = 1,
            column = 1;
        while (1) {
            next = nextToken(string, line, column);
            if(next.status === 'error') {
                return MaybeError.error({
                    error :  next.value,
                    tokens:  tokens
                });
            } else if(next.status === 'failure') {
                break;
            }
            // otherwise it must be success
            tokens.push(next.value.token);
            string = next.value.rest;
            line = next.value.line;
            column = next.value.column;
        }
        return MaybeError.pure(tokens);
    }

    return {
        'scanner' :  tokenize,
        'regexes' :  REGEXES
    };

});