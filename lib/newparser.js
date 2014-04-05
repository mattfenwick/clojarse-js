'use strict';

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;


var form = error('unimplemented'); // to allow mutual recursion


var macro            = oneOf('";@^`~()[]{}\\\'%#'),

    terminatingMacro = oneOf('";@^`~()[]{}\\'),

    // also, everything else that Java's Character.isWhitespace says
    whitespace = oneOf(', \t\n\r'),

    // does this have the right behavior?
    //   not a number: +
    //   number:  +3  4  4abcdefghij
    number = node('number',
        ['sign', optional(oneOf('+-'))],
        ['digit', oneOf('0123456789')],
        ['rest', many0(not1(alt(whitespace, macro)))]),

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
        ['first', alt(not1(alt(whitespace, macro)), literal('%'))],
        ['rest', many0(not1(alt(whitespace, terminatingMacro)))]);



// questions:
//  1. what about discarding whitespace, comments?
//  2. what about the discard reader `#_...`? (maybe that should count as a form)
var list = node('list',
        ['open', literal('(')],
        ['body', many0(form)],
        ['close', cut('close', literal(')'))],
    
    vector = node('vector',
        ['open', literal('[')],
        ['body', many0(form)],
        ['close', cut('close', literal(']'))]),
    
    table = node('table',
        ['open' , literal('{')],
        ['items', many0(form)            ],
        ['close', cut('close', literal('}'))]),

    quote = node('quote',
        ['open', literal("'")],
        ['form', cut('form', form)]),
                   
    deref = node('deref',
        ['open', literal('@')],
        ['form', cut('form', form)]),
    
    unquote = node('unquote',
        ['open', literal('~')],
        ['form', cut('form', form)]),
    
    unquoteSplicing = node('unquote-splicing',
        ['open', string('~@')],
        ['form', cut('form', form)]),

    syntaxQuote = node('syntax-quote',
        ['open', literal('`')],
        ['form', cut('form', form)]),

    // yes: `[\"[]]` -- because [ is a terminating macro
    // no: 
    //  `[\"#(vector)]`
    //    because `(` is the first terminating macro (`#` is not a terminating macro), 
    //    and \"# is not a valid character
    char = node('char', 
        ['open', literal('\\'),
        ['first', cut('any character', item)],
        ['rest', many0(not1(alt(whitespace, terminatingMacro)))]),

    comment = node('comment',
        ['open', alt(literal(';'), string('#!'))],
        ['value', many0(not1(oneOf('\n\r')))]);


// this is only approximately correct
// possible disaster scenarios?
//   - ????
var clojure_string = node('string',
        ['open', literal('"')],
        ['value', many0(alt(not1(oneOf('\\"')), 
                            seq(literal('\\'), cut('escape', item))))],
        ['close', cut('"', literal('"'))]),
    
    regex = node('regex',
        ['open', string('#"')],
        ['value', many0(alt(not1(oneOf('\\"')),
                            seq(literal('\\'), cut('escape', item))))],
        ['close', cut('"', literal('"'))]),

    function_ = node('function',
        ['open', string('#(')],
        ['body', many0(form)],
        ['close', cut('close', literal(')'))]),
    
    set = node('set',
        ['open' , string('#{')],
        ['body' , many0(form)        ],
        ['close', cut('close', literal('}'))]),
    
    meta = node('meta',
        ['open', alt(string('#^'), literal('^'))],
        ['metadata', cut('metadata', form)],
        ['value', cut('value', form)]),

    discard = node('discard',
        ['open', string('#_')],
        ['value', cut('form', form)]),
    
    eval_ = node('eval',
        ['open', string('#=')],
        []),
    
    var_ = node('var',
        ['open', string("#'")],
        ['value', cut('form', form)]),
    
    unreadable = node('unreadable',
        ['open', string('#<')],
        ['rest', cut('anything', zero)]),
    
    other_dispatch = node('dispatch',
        ['open', literal('#')],
        ['value', form],
        ['rest', cut('unknown dispatch', zero)]);


// what about:
//  - `#<...`?  -- does that blow up tokenization?
//  - `#_...`?  -- is that a single token?  (answer: no, it can't be)
//  - other `#...` dispatches?
var tokenizer = [
        '(', ')', '[', ']', '{', '}', '@', "#'", '#(',
        '#{', '^', '#^', "'", '`', '~@', '~',
        number, string, regex, symbol, char, comment, whitespace
    ];
// tokens:
//   - ( ) [ ] { } 
//   - regex, string, number, symbol, char
//   - #( #{ #^ #_ #= #'
//   - ' ^ ` ~ ~@ @
//   - comment, whitespace
// not tokens:
//   - starts token: #" #!
//   - starts token: \ "
//   - just weird: #<
