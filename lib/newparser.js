'use strict';

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var P = C.position,
    item = P.item, oneOf = P.oneOf,
    literal = P.literal, string = P.string,
    not1 = P.not1,
    cut = Cst.cut, node = Cst.node,
    alt = C.alt, many0 = C.many0,
    many1 = C.many1, error = C.error,
    optional = C.optional, seq = C.seq,
    seq2L = C.seq2L, zero = C.zero,
    seq2R = C.seq2R;


// to allow mutual recursion
var form = error('unimplemented'),
    discard = error('unimplemented');

var comment = node('comment',
        ['open', alt(literal(';'), string('#!'))],
        ['value', many0(not1(oneOf('\n\r')))]),

    // also, everything else that Java's Character.isWhitespace says
    whitespace = node('whitespace',
        ['value', many1(oneOf(', \t\n\r'))]);
    

var _macro            = oneOf('";@^`~()[]{}\\\'%#'),

    _terminatingMacro = oneOf('";@^`~()[]{}\\');


    // does this have the right behavior?
    //   not a number: +
    //   number:  +3  4  4abcdefghij
var number = node('number',
        ['sign' , optional(oneOf('+-'))],
        ['digit', oneOf('0123456789')  ],
        ['rest' , many0(not1(alt(whitespace, _macro)))]),

    // seems to be ambiguous with `number` for things like `4a`
    //   but, if `number` tries first ... ??
    // why does this include `%...`?  because:
    //   outside of a `#()` function, `%...` is just a normal symbol
    //   inside, only `%`, `%&`, and `%<number>` are allowed, but:
    //    - 20 is the max number of args
    //    - other `%...` are illegal
    //    - all numbers: hex, octal, floats are allowed !!!!
    //    - calls Number.intValue to get an int
    symbol = node('symbol',
        ['first', alt(not1(alt(whitespace, _macro)), literal('%'))],
        ['rest', many0(not1(alt(whitespace, _terminatingMacro)))]),

    // yes: `[\"[]]` -- because [ is a terminating macro
    // no: 
    //  `[\"#(vector)]`
    //    because `(` is the first terminating macro (`#` is not a terminating macro), 
    //    and \"# is not a valid character
    char = node('char',
        ['open', literal('\\')],
        ['first', cut('any character', item)],
        ['rest', many0(not1(alt(whitespace, _terminatingMacro)))]),

    // this is only approximately correct
    // possible disaster scenarios?
    //   - ????
    clojure_string = node('string',
        ['open', literal('"')],
        ['value', many0(alt(not1(oneOf('\\"')),
                            seq(literal('\\'), cut('escape', item))))],
        ['close', cut('"', literal('"'))]),
    
    regex = node('regex',
        ['open', string('#"')],
        ['value', many0(alt(not1(oneOf('\\"')),
                            seq(literal('\\'), cut('escape', item))))],
        ['close', cut('"', literal('"'))]);


var junk = many0(alt(whitespace, comment, discard));

function munch(tok) {
    return seq2L(tok, junk);
}

discard.parse = node('discard',
    ['open' , munch(string('#_'))],
    ['value', cut('form', form)  ]).parse;

// tokens:
//   - ( ) [ ] { } 
//   - regex, string, number, symbol, char
//   - #( #{ #^ #_ #= #'
//   - ' ^ ` ~ ~@ @
//   - comment, whitespace
// not tokens:
//   - starts token: #" #!
//   - starts token: \ " ; %
//   - just weird: #<
var op = munch(literal('(')),
    cp = munch(literal(')')),
    os = munch(literal('[')),
    cs = munch(literal(']')),
    oc = munch(literal('{')),
    cc = munch(literal('}')),
    // reg, num, str, sym, char
    of = munch(string('#(')),
    oset  = munch(string('#{')),
    ometa = munch(string('#^')),
    odis  = munch(string('#_')),
    oeval = munch(string('#=')),
    ovar  = munch(string("#'")),
    qt  = munch(literal("'")),
    pow = munch(literal('^')),
    bt  = munch(literal('`')),
    uq  = munch(literal('~')),
    uqs = munch(string('~@')),
    at  = munch(literal('@'));


// questions:
//  1. what about discarding whitespace, comments?
//  2. what about the discard reader `#_...`? (maybe that should count as a form)
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
        ['items', many0(form)     ],
        ['close', cut('close', cc)]),

    quote = node('quote',
        ['open', qt               ],
        ['form', cut('form', form)]),
                   
    deref = node('deref',
        ['open', at               ],
        ['form', cut('form', form)]),
    
    unquote = node('unquote',
        ['open', uq               ],
        ['form', cut('form', form)]),
    
    unquoteSplicing = node('unquote-splicing',
        ['open', uqs              ],
        ['form', cut('form', form)]),

    syntaxQuote = node('syntax-quote',
        ['open', bt               ],
        ['form', cut('form', form)]);


var function_ = node('function',
        ['open', of         ],
        ['body', many0(form)],
        ['close', cut('close', cp)]),
    
    set = node('set',
        ['open' , oset            ],
        ['body' , many0(form)     ],
        ['close', cut('close', cc)]),
    
    meta = node('meta',
        ['open', alt(ometa, pow)          ],
        ['metadata', cut('metadata', form)],
        ['value', cut('value', form)      ]),

    eval_ = node('eval',
        ['open', oeval            ],
        ['form', cut('form', form)]),
    
    var_ = node('var',
        ['open' , ovar             ],
        ['value', cut('form', form)]),
    
    unreadable = node('unreadable',
        ['open', string('#<')],
        ['rest', cut('anything', zero)]),
    
    other_dispatch = node('dispatch',
        ['open', literal('#')],
        ['rest', cut('unknown dispatch', zero)]);


form.parse = alt(
        munch(clojure_string), munch(number), 
        munch(char), munch(symbol), munch(regex),
        list, vector, set, table,
        function_, deref, quote, unquote,
        unquoteSplicing, syntaxQuote, meta,
        eval_, var_
    ).parse;


var clojure = seq2R(junk, many0(form));

module.exports = {
    'parse': function(str) { 
        var init_position = [1,1];
        return clojure.parse(str, init_position);
    },
    
    'clojure': clojure,
    'form'   : form   ,
    
    'comment'   : comment   ,
    'whitespace': whitespace,
    'discard'   : discard   ,
    
    'number': number,
    'symbol': symbol,
    'char'  : char  ,
    'string': string,
    'regex' : regex

};

