"use strict";

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst,
    Tokens = require('./tokens');

var T = Tokens.Token,
    pos = C.position,
    lookahead = C.lookahead,
    literal = pos.literal,
    string = pos.string,
    oneOf = pos.oneOf,
    item = pos.item,
    not1 = pos.not1,
    satisfy = pos.satisfy,
    alt = C.alt,
    optional = C.optional,
    many0 = C.many0,
    many1 = C.many1,
    check = C.check,
    get = C.get,
    node = Cst.node,
    cut = Cst.cut;

var PUNCTUATION = [
        ['open-paren'  , '(' ],
        ['close-paren' , ')' ],
        ['open-square' , '[' ],
        ['close-square', ']' ],
        ['open-curly'  , '{' ],
        ['close-curly' , '}' ],
        ['at-sign'     , '@' ], // TODO there's some overlap between these and pieces of larger tokens
        ['open-var'    , "#'"], // maybe the solution is to not do separate tokenization
        ['open-regex'  , '#"'],
        ['open-fn'     , '#('],
        ['open-set'    , '#{']
    ];

var punctuation = alt.apply(null,
                            PUNCTUATION.map(function(p) {
                                return node(p[0], ['value', string(p[1])]);
                            }));

var ESCAPES = 'btnfr"\'\\',

    escape = node('escape',
        ['open', literal('\\')],
        ['value', oneOf(ESCAPES)]), // TODO cut ???
    
    notSlashOrDq = not1(alt(oneOf('\\"'))), // TODO schema should match escape's a bit better ??
    
    stringBody = many0(alt(notSlashOrDq, escape));

var string = node('string',
        ['open', literal('"')],
        ['value', stringBody],
        ['close', cut('"', literal('"'))]),
    
    regex = node('regex',
        ['open', string('#"')],
        ['value', stringBody],
        ['close', cut('"', literal('"'))]);

var TERMINATING_MACRO = lookahead(oneOf(' \t\n\r\f,";@^`~()[]{}\\%')),
    ANY_MACRO = lookahead(oneOf('#\' \t\n\r\f,";@^`~()[]{}\\%'));

var digit = oneOf('0123456789');

var integer = node('integer',
        ['value', many1(digit)]),

    ratio = node('ratio',
        ['numerator', integer],
        ['slash', literal('/')],
        ['denominator', integer]),

    float = node('float',
        ['int', integer], // TODO need a better name
        ['dot', literal('.')],
        ['decimal', optional(integer)]),

    scinum = null, // TODO !!!!

    number = node('number',
        ['sign', optional(oneOf('+-'))],
        ['value', alt(float, ratio, integer)], //, scinum)],
        ['end', cut('format error', ANY_MACRO)]);
    
var char = node('char',
        ['open', literal('\\')],
        ['value', alt(string('newline'), string('space'), string('tab'), item)], // TODO a cut here?
        ['end', cut('format error', TERMINATING_MACRO)]);

var nil = node('nil',
        ['value', string('nil')],
        ['end', cut('format error', TERMINATING_MACRO)]),

    bool = node('boolean',
        ['value', alt(string('true'), string('false'))],
        ['end', cut('format error', TERMINATING_MACRO)]);

var symbolHead = satisfy(function(c) {
        return c.match(/^[a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%]$/);
    }),
    
    symbolRest = alt(symbolHead, digit, literal('/')),

    symbol = node('symbol',
        ['first', symbolHead],
        ['rest', many0(symbolRest)],
        ['end', cut('format error', TERMINATING_MACRO)]);

var keyword = node('keyword',
        ['open', literal(':')],
        ['value', symbol]);

var newline = oneOf('\n\r\f'),
    
    comment = node('comment',
        ['open', alt(literal(';'), string('#!'))],
        ['value', many0(not1(newline))]),
    
    space = node('space',
        ['value', many1(oneOf(' \t,\n\r\f'))]);

var token = alt(
        punctuation, atSign,
        openVar, char, string,
        regex, number, bool,
        nil, symbol, keyword,
        comment, space
    ),
    scanner = many0(token);

module.exports = {
    
    'token'   :  token,
    'scanner' :  scanner,
    
    // 'public' parsers
    'punc'    :  punctuation,
    'char'    :  char,
    'string'  :  string,
    'nil'     :  nil,
    'bool'    :  bool,
    'number'  :  number,
    'keyword' :  keyword,
    'symbol'  :  symbol,
    'space'   :  space,

    // 'private' parsers
    'escape'  :  escape
};
