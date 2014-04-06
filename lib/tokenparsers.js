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
    node = Cst.node, cut = Cst.cut;

// TODO not sure if these are necessary
var _a_f = 'abcdef',
    _A_F = 'ABCDEF',
    _a_z = 'abcdefghijklmnopqrstuvwxyz',
    _A_Z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    _1_9 = '123456789',
    _0_9 = '0123456789';

var _base16 = node('base16', 
        ['open', seq(literal('0'), oneOf('xX'))],
        ['body', cut('body', many1(oneOf('0123456789abcdefABCDEF')))]),
    
    _base8 = node('base8',
        ['open', literal('0')],
        ['body', many1(oneOf('01234567'))]),
    
    // couldn't this be folded in with octal?
    //   can't be folded into base10 b/c e.g. `09` is illegal
    _zero = node('zero',
        ['value', literal('0')]),
        
    _baseN = node('baseN',
        ['radix', seq(oneOf('123456789'), oneOf('0123456789'))],
        ['r'    , oneOf('rR')],
        ['body' , many1(oneOf('0123456789' + _a_z + _A_Z))]),

    _base10 = node('base10',
        ['first', oneOf('123456789')],
        ['rest', many0(oneOf('012345789'))]),
    
    // TODO how does this interfere with the patterns for floats and ratios?
    //   when parsing, does integer need to be tried after them?  (probably)
    _invalid = node('invalid',
        ['open', literal('0')],
        ['rest', many1(oneOf('012345789'))]),
        
    integer = node('integer',
        ['sign', optional(oneOf('+-'))],
        ['value', alt(_base16, _base8, _zero, _baseN, _base10, _invalid)], // order *is* important here !!
        ['suffix', optional(literal('N'))]); // ?? can't apply to _num_custom ??


//"([-+]?[0-9]+)/([0-9]+)");
var _int_10 = many1(oneOf('0123456789')),

    ratio = node('ratio',
        ['sign'       , optional(oneOf('+-'))],
        ['numerator'  , _int_10],
        ['slash'      , literal('/')],
        ['denominator', cut('int', _int_10)]);

    
//"([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?"
var _decimal = node('decimal',
        ['dot', literal('.')],
        ['int', many0(oneOf('0123456789'))]),
    
    _exp = node('exponent',
        ['e'    , oneOf('eE')],
        ['sign' , optional(oneOf('+-'))],
        ['power', _int_10]),

    float = node('float',
        ['sign'    , optional(oneOf('+-'))],
        ['int'     , _int_10],
        ['decimal' , optional(_decimal)],
        ['exponent', optional(_exp)],
        ['suffix'  , optional(literal('M'))]);

function end(parser) {
    return seq2L(parser, not0(item));
}

var number = alt(end(float), end(ratio), end(integer));


var ESCAPES = 'btnfr"\\',

    _simple_escape = node('simple',
        ['value', oneOf(ESCAPES)]),
    
    _unicode_escape = node('unicode',
        ['open', literal('u')],
        ['value', cut('4 hex characters', quantity(4, oneOf('abcdefABCDEF0123456789')))]),
    
    _octal_escape = node('octal',
        ['value', // good: \0, \10, \232
                  // bad: \9, \400, \3z ???

    _string_escape = node('escape',
        ['open', literal('\\')],
        ['value', cut('escape sequence', alt(_simple_escape, _unicode_escape, _octal_escape))]),
    
    _string_char = node('char',
        ['value', not1(oneOf('\\"'))],
    
    _string_body = many0(alt(_string_char, _string_escape)),

    string = node('string',
        ['open', literal('"')],
        ['value', stringBody],
        ['close', cut('"', literal('"'))]),
    
    regex = node('regex',
        ['open', string('#"')],
        ['value', stringBody],
        ['close', cut('"', literal('"'))]);


module.exports = {
    '_integer': {
        'base16' : _base16 , 
        'base8'  : _base8  ,
        'base10' : _base10 , 
        'zero'   : _zero   ,
        'baseN'  : _baseN  ,
        'invalid': _invalid
    },
    'integer': integer
};
