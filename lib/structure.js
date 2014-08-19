'use strict';

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var P = C.position,
    item = P.item, oneOf = P.oneOf,
    literal = P.literal, string = P.string,
    not1 = P.not1, not0 = C.not0,
    cut = Cst.cut, node = Cst.node,
    alt = C.alt, many0 = C.many0,
    many1 = C.many1, error = C.error,
    optional = C.optional, seq = C.seq,
    seq2L = C.seq2L, zero = C.zero;

var Dict = require('./dict');


var comment = node('comment',
        ['open' , alt(literal(';'), string('#!'))],
        ['value', many0(not1(oneOf('\n\r')))     ]),

    whitespace = node('whitespace',
        ['value', many1(oneOf(', \t\n\r\f'))]);
    

var _macro            = oneOf('";@^`~()[]{}\\\'%#'),

    _terminatingMacro = oneOf('";@^`~()[]{}\\');


var number = node('number',
        ['sign' , optional(oneOf('+-'))               ],
        ['first', oneOf('0123456789')                 ],
        ['rest' , many0(not1(alt(whitespace, _macro)))]),

    ident = node('ident',
        ['first', alt(not1(alt(whitespace, _macro)), literal('%'))],
        ['rest' , many0(not1(alt(whitespace, _terminatingMacro))) ]),

    char = node('char',
        ['open' , literal('\\')                                  ],
        ['first', cut('any character', item)                     ],
        ['rest' , many0(not1(alt(whitespace, _terminatingMacro)))]),

    clojure_string = node('string',
        ['open' , literal('"')                        ],
        ['chars', many0(alt(not1(oneOf('\\"')),
                            seq(literal('\\'),
                                cut('escape', item))))],
        ['close', cut('"', literal('"'))              ]),

    regex = node('regex',
        ['open' , string('#"')                        ],
        ['chars', many0(alt(not1(oneOf('\\"')),
                            seq(literal('\\'),
                                cut('escape', item))))],
        ['close', cut('"', literal('"'))              ]);


// to allow mutual recursion
var form = error('unimplemented'),
    discard = error('unimplemented');

var junk = many0(alt(whitespace, comment, discard));

function munch(tok) {
    return seq2L(tok, junk);
}

discard.parse = node('discard',
    ['open' , munch(string('#_'))],
    ['value', cut('form', form)  ]).parse;

function punc(str) {
    return node(str,
        ['value', munch(string(str))]);
}

// tokens:
//   - ( ) [ ] { } 
//   - regex, string, number, ident, char
//   - #( #{ #^ #_ #= #'
//   - ' ^ ` ~ ~@ @
//   - comment, whitespace
// not tokens:
//   - starts token: #" #!
//   - starts token: \ " ; %
//   - just weird: #<
var op    = punc('(')  ,
    cp    = punc(')')  ,
    os    = punc('[')  ,
    cs    = punc(']')  ,
    oc    = punc('{')  ,
    cc    = punc('}')  ,
    of    = punc('#(') ,
    oset  = punc('#{') ,
    ometa = punc('#^') ,
    oeval = punc('#=') ,
    ovar  = punc("#'") ,
    qt    = punc("'")  ,
    pow   = punc('^')  ,
    bt    = punc('`')  ,
    uqs   = punc('~@') ,
    uq    = punc('~')  ,
    at    = punc('@')  ;


var list = node('list',
        ['open' , op              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cp)]),
    
    vector = node('vector',
        ['open' , os              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cs)]),
    
    table = node('table',
        ['open' , oc              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cc)]),

    quote = node('quote',
        ['open' , qt                ],
        ['value', cut('value', form)]),
                   
    deref = node('deref',
        ['open' , at                ],
        ['value', cut('value', form)]),
    
    unquoteSplicing = node('unquote-splicing',
        ['open' , uqs               ],
        ['value', cut('value', form)]),

    unquote = node('unquote',
        ['open' , uq                ],
        ['value', cut('value', form)]),
    
    syntaxQuote = node('syntax-quote',
        ['open' , bt                ],
        ['value', cut('value', form)]);


var function_ = node('function',
        ['open' , of              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cp)]),
    
    set = node('set',
        ['open' , oset            ],
        ['body' , many0(form)     ],
        ['close', cut('close', cc)]),
    
    meta = node('metadata',
        ['open'    , alt(ometa, pow)      ],
        ['metadata', cut('metadata', form)],
        ['value'   , cut('value', form)   ]),

    eval_ = node('eval',
        ['open' , oeval             ],
        ['value', cut('value', form)]),
    
    var_ = node('var',
        ['open' , ovar              ],
        ['value', cut('value', form)]),
    
    unreadable = node('unreadable dispatch',
        ['open' , string('#<')         ],
        ['value', cut('anything', zero)]),
    
    dispatch = node('unknown dispatch',
        ['open' , literal('#')                 ],
        ['value', cut('dispatch character', zero)]);


form.parse = alt(
        munch(clojure_string), munch(number),
        munch(char), munch(ident), munch(regex),
        list, vector, set, table,
        function_, deref, quote,
        unquoteSplicing, unquote,
        syntaxQuote, meta,
        eval_, var_, unreadable, dispatch
    ).parse;


var clojure = node('clojure',
    ['junk' , junk       ],
    ['forms', many0(form)]);



var groups = new Dict({
    'clojure'   : 'clojure',
    
    'metadata'  : 'metadata',
    
    'number'    : 'token',
    'ident'     : 'token',
    'string'    : 'token',
    'regex'     : 'token',
    'char'      : 'token',
    
    'quote'     : 'hasValue',
    'deref'     : 'hasValue',
    'var'       : 'hasValue',
    'unquote'   : 'hasValue',
    'eval'      : 'hasValue',
    'syntax-quote': 'hasValue',
    'unquote-splicing': 'hasValue',
    
    'list'      : 'hasBody',
    'vector'    : 'hasBody',
    'table'     : 'hasBody',
    'function'  : 'hasBody',
    'set'       : 'hasBody',
});


function parse(input) {
    var init_position = [1, 1],
        parser = seq2L(clojure, cut('end', not0(item)));
    return parser.parse(input, init_position).fmap(function(value) {
        return value.result;
    });
}



module.exports = {
    // convenience functions
    'parse'         : parse         ,
    
    // "top-level" parsers
    'clojure'       : clojure       ,
    'form'          : form          ,
    // delimited parsers
    'list'          : list          ,
    'vector'        : vector        ,
    'set'           : set           ,
    'table'         : table         ,
    'function'      : function_     ,
    'deref'         : deref         ,
    'quote'         : quote         ,
    'unquote'       : unquote       ,
    'unquoteSplicing': unquoteSplicing,
    'syntaxQuote'   : syntaxQuote   ,
    'meta'          : meta          ,
    'eval'          : eval_         ,
    'var'           : var_          ,
    // token parsers
    'number'        : number        ,
    'ident'         : ident         ,
    'char'          : char          ,
    'string'        : clojure_string,
    'regex'         : regex         ,
    // junk parsers
    'comment'       : comment       ,
    'whitespace'    : whitespace    ,
    'discard'       : discard       ,
    // additional parsers
    'unreadable'    : unreadable    ,
    'dispatch'      : dispatch      ,
    
    // not parsers -- divide node types into groups by fields
    'nodeGroups'    : groups        ,
};

