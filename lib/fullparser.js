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
    


module.exports = {
    '_integer': {
        'base16': _base16, 'base8': _base8,
        'base10': _base10, 'zero': _zero,
        'custom': _baseCustom,
        'invalid': _invalid
    },
    'integer': integer
};

