"use strict";

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var pos = C.position,
    literal = pos.literal, item  = pos.item ,
    satisfy = pos.satisfy, oneOf = pos.oneOf,
    string  = pos.string , not1  = pos.not1 ,
    optional = C.optional, alt   = C.alt    , 
    getState = C.getState, bind  = C.bind   , 
    many0 = C.many0,  many1 = C.many1,
    seq2L = C.seq2L,  seq = C.seq    , 
    node = Cst.node,  cut = Cst.cut  ,
    pure = C.pure  ,  zero = C.zero  , // be careful not to confuse this `zero` with any clojure parsers
    not0 = C.not0  ;

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
        ['suffix', optional(literal('N'))]);


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
    
    clojure_string = node('string',
        ['value', many0(alt(_string_char, _string_escape))]),

    regex = node('regex',
        ['value', many0(alt(not1(oneOf('\\"')), // TODO pretty ugly
                            seq(literal('\\'),
                                cut('escaped char', item))))]);


var _long_escapes = ["newline", "space", "tab", "backspace", "formfeed", "return"],

    _char_long = node('long',
        ['value', any.apply(null, _long_escapes.map(string))]),

    // can I just reuse unicode escape?  see spec.md
    _char_unicode = _unicode_escape,
    
    // not sure what errors this is responsible for
    _octal_check = function(ds) {
        if ( ds.length > 3 ) {
            return cut('octal escape: too long', zero);
        } else if ( parseInt(ds, 8) > 255 ) {
            // not sure if this error check belongs in this phase
            //   maybe it should be split into a later phase
            //   because the current phase is still about parsing
            return cut('octal escape: too large', zero);
        }
        return pure(ds);
    }
    
    _char_octal = node('octal',
        ['o'     , literal('o')],
        ['digits', cut('digits', bind(many1(_0_7), _octal_check))]),
    
    _char_simple = node('simple',
        ['value', item]),

    char = node('char',
        ['value', any(_char_long, _char_octal, _char_unicode, _char_simple)]);


//"[:]?([\\D&&[^/]].*/)?(/|[\\D&&[^/]][^/]*)"
//"[:]? ([^0-9/].*/)? (/|[^0-9/][^/]*)"
var _reserved = node('reserved',
        ['value', any.apply(null, ["nil", "true", "false"].map(string))]),
    
    _ns = node('ns',
        ['value', many1(not1(literal('//')))],
        ['slash', literal('//')]),
        
    _symbol = node('symbol',
        ['type', any(seq2R(string('::'), pure('auto keyword')), 
                     seq2R(literal(':'), pure('keyword')),
                     pure('symbol'))],
        ['ns', optional(ns)],
        ['name', many1(item)]),
    
    // check for special error cases (maybe match against regex as in Clojure implementation)
    _checks = pure('not implemented'), // TODO 

    symbol = seq2R(_checks, any(_reserved, _symbol));


function end(parser) {
    return seq2L(parser, not0(item));
}

// TODO do I have to repeat `end` 3x? is there a better way to do it?
// TODO the reason is, if `float` only consumes a prefix, then it
//      should not error out, but rather try `ratio`
// TODO what about error reporting when a prefix is successfully parsed?
var number = alt(end(float), end(ratio), end(integer));

var token_parsers = {
    'number': number,
    'char'  : char,
    'symbol': symbol,
    'string': clojure_string,
    'regex' : regex
};

function parseToken(token) {
    if ( token_parsers.hasOwnProperty(token._name) ) {
        var p = token_parsers[token._name];
        return seq2L(cut('token', p), 
                     cut('end', not0(item)));
    }
    throw new Error('invalid node type: ' + token);
}


module.exports = {
    '_number': {
        '_integer': {
            'base16' : _base16 ,
            'base8'  : _base8  ,
            'base10' : _base10 ,
            'zero'   : _zero   ,
            'baseN'  : _baseN
        },
        'integer': integer,
        'ratio'  : ratio  ,
        'float'  : float  ,
    },
    
    'number' : number ,
    'char'   : char   ,
    'symbol' : symbol ,
    'regex'  : regex  ,
    'string' : clojure_string,
    
    'parseToken': parseToken
};

