"use strict";

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var pos = C.position,
    literal = pos.literal, item  = pos.item  ,
    satisfy = pos.satisfy, oneOf = pos.oneOf,
    string  = pos.string , not1  = pos.not1  ,
    alt     = C.alt      , optional = C.optional,
    many0 = C.many0,  many1 = C.many1,
    node = Cst.node, cut = Cst.cut,
    seq = C.seq, seq2L = C.seq2L,
    bind = C.bind, getState = C.getState,
    pure = C.pure, not0 = C.not0;

var _0_7 = oneOf('01234567'),
    _0_9 = oneOf('0123456789'),
    _hex = oneOf('abcdefABCDEF0123456789'),
    _1_9 = oneOf('123456789'),
    _a_z = oneOf('abcdefghijklmnopqrstuvwxyz'),
    _A_Z = oneOf('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    _sign = optional(oneOf('+-'));

var _base16 = node('base16',
        ['open', seq(literal('0'), oneOf('xX'))],
        ['body', cut('body', many1(_hex))]),
    
    _base8 = node('base8',
        ['open', literal('0')],
        ['body', many1(_0_7)]),
    
    // couldn't this be folded in with octal?
    //   can't be folded into base10 b/c e.g. `09` is illegal
    _zero = node('zero',
        ['value', literal('0')]),
        
    _baseN = node('baseN',
        ['radix', seq(_1_9, optional(_0_9))],
        ['r'    , oneOf('rR')],
        ['body' , many1(alt(_0_9, _a_z, _A_Z))]),

    _base10 = node('base10',
        ['first', _1_9],
        ['rest', many0(_0_9)]),
    
    integer = node('integer',
        ['sign', _sign],
        ['value', alt(_base16, _base8, _zero, _baseN, _base10)], // order *is* important here !!
        ['suffix', optional(literal('N'))]); // ?? can't apply to _baseN ??


var _int_10 = many1(_0_9),

    //"([-+]?[0-9]+)/([0-9]+)");
    ratio = node('ratio',
        ['sign'       , _sign],
        ['numerator'  , _int_10],
        ['slash'      , literal('/')],
        ['denominator', cut('int', _int_10)]),
 
    _decimal = node('decimal',
        ['dot', literal('.')],
        ['int', many0(_0_9)]),
    
    _exp = node('exponent',
        ['e'    , oneOf('eE')],
        ['sign' , _sign],
        ['power', _int_10]),

    //"([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?"
    float = node('float',
        ['sign'    , _sign],
        ['int'     , _int_10],
        ['decimal' , optional(_decimal)],
        ['exponent', optional(_exp)],
        ['suffix'  , optional(literal('M'))]);


var ESCAPES = 'btnfr"\\',
    MACROS = '";@^`~()[]{}\\\'%#';

function IS_MACRO(ch) {
    return (MACROS.indexOf(ch) > -1);
}


var _simple_escape = node('simple',
        ['value', oneOf(ESCAPES)]),
    
    // "\uＡＢＣＤ" is the 1 character string "ꯍ"
    // b/c each of ＡＢＣＤ is a digit according to Character.digit(ch, 16)
    _unicode_escape = node('unicode',
        ['open', literal('u')],
        ['value', cut('4 hex characters', quantity(4, _hex))]),
    
    // 0-7:good  macro:done  end:done  other:error
    _octal_digit = bind(getState, function(xs) {
        if ( xs.length === 0 ) {
            return pure(null);
        }
        var first = xs[0];
        if ( IS_MACRO(first) ) {
            return pure(null);
        }
        return cut('octal digit', _0_7);
    }),
    
    // good: \0, \10, \3\3 \232
    // bad: \9, \400, \3z 
    _octal_escape = node('octal',
        ['check', cut('octal digit', not0(oneOf('89')))],
        ['digits', seq(_0_7, _octal_digit, _octal_digit)]),

    _string_escape = node('escape',
        ['open', literal('\\')],
        ['value', cut('escape sequence', alt(_simple_escape, _unicode_escape, _octal_escape))]),
    
    _string_char = node('char',
        ['value', not1(oneOf('\\"'))]),
    
    _string_body = many0(alt(_string_char, _string_escape)),

    clojure_string = node('string',
        ['open' , literal('"')],
        ['value', _string_body],
        ['close', cut('"', literal('"'))]),
    
    regex = node('regex',
        ['open', string('#"')],
        ['value', alt(not1(oneOf('\\"')), // TODO pretty ugly
                      seq(literal('\\'),
                          cut('escaped char', item)))],
        ['close', cut('"', literal('"'))]);


var _long_escapes = ["newline", "space", "tab", "backspace", "formfeed", "return"],

    _char_long = node('charlong',
        ['value', any.apply(null, _long_escapes.map(string))]),

    // can I just reuse unicode escape?  see spec.md
    _char_unicode = _unicode_escape,
    
    // length must be 1-3
    // value must be between 8r0 and 8r377
    _char_octal = node('charoctal',
        ['o'     , literal('o')],
        ['digits', many1(_0_7)]),
    
    _char_simple = node('charsimple',
        ['value', item      ],
        ['end'  , not0(item)]),

    _char = node('char',
        ['open' , literal('\\')],
        ['value', cut('value', any(_char_simple, _char_long, _char_octal, _char_unicode))]);


//"[:]?([\\D&&[^/]].*/)?(/|[\\D&&[^/]][^/]*)"
//"[:]? ([^0-9/].*/)? (/|[^0-9/][^/]*)"
var _reserved = node('reserved',
        ['value', any.apply(null, ["nil", "true", "false"].map(string))]),
    
    // so, to parse:
    //  - check for special error cases (maybe match against regex as in Clojure implementation)
    //  - contains `::` anywhere but beginning -- error
    //  - starts with `::` -- namespace?  and name?
    //  - starts with `:` -- namespace and name
    //  - starts with anything else -- namespace and name
    _ns = node('ns',
        ['value', many1(not1(literal('//')))],
        ['slash', literal('//')]),
        
    _symbol = node('symbol',
        ['type', any(seq2R(string('::'), pure('auto keyword')), 
                     seq2R(literal(':'), pure('keyword')),
                     pure('symbol'))],
        ['ns', optional(ns)],
        ['name', many1(item)]),
    
    _checks = ???,

    // not sure what the rules are with /'s, b/c:
    //   (ns q/a) ---> works
    //   (def q/a/b 44) ---> works, repl replies `#'q/a/b`
    //   q/a/b ---> doesn't work
    // use `(fn [x] (juxt namespace name) x)` to split a keyword or symbol into its parts
    symbol = seq2R(_checks, any(_reserved, _symbol));


function end(parser) {
    return seq2L(parser, not0(item));
}

// TODO do I have to repeat `end` 3x? is there a better way to do it?
// TODO what about error reporting when a prefix is successfully parsed?
var number = alt(end(float), end(ratio), end(integer)),

    char = end(_char);


module.exports = {
    '_integer': {
        'base16' : _base16 ,
        'base8'  : _base8  ,
        'base10' : _base10 ,
        'zero'   : _zero   ,
        'baseN'  : _baseN
    },
    'integer': integer
};

