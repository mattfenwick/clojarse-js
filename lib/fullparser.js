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

var 
    _base16 = node('base16', 
        ['open', seq(literal('0'), oneOf('xX'))],
        ['body', cut('body', many1(oneOf('0123456789abcdefABCDEF')))]),
    
    _base8 = node('base8',
        ['open', literal('0')],
        ['body', many1(oneOf('01234567'))]),
    
    _zero = literal('0'), // couldn't this be folded in with octal or base10?
                          // at least, it should have the same schema
    
    _baseCustom = node('baseCustom', // TODO terrible name !!
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
        
    // can't be followed by *most* characters
    //   can be followed by: whitespace, macro
    // want to catch things like 09 and 4a and generate errors
    //   basically, if it starts with a +, -, or \d and doesn't match
    //   one of the above rules -- it's an error
    // possible strategies:
    //   1. blow up on error
    //   2. parse as 'invalid number' to allow parsing to continue
    integer = node('integer',
        ['sign', optional(oneOf('+-'))],
        ['value', alt(_base16, _base8, _zero, _baseCustom, _base10, _invalid)], // order *is* important here !!
        ['suffix', optional(literal('N'))]); // ?? can't apply to _num_custom ??
    

// another possible strategy for number parsing: do what Clojure does:
//   match text starting from `[+-\d]` until whitespace or terminating macro
//   then figure out how to classify the number
//   perhaps by starting a new subparse
//   if it's not classified, or if the whole chunk isn't used, 
//   report an error (or invalid number, and continue)
// justification for this approach:
//   ensures that stuff like `4a` is grabbed as a single token,
//   so that I'll avoid mistakes like parsing `4` and leaving `a`
//   maybe also easier to show that it's correct compared to Clojure


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
        'base16': _base16, 'base8': _base8,
        'base10': _base10, 'zero': _zero,
        'custom': _baseCustom,
        'invalid': _invalid
    },
    'integer': integer
};