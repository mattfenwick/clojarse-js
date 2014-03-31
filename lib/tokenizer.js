"use strict";

var ME = require('unparse-js/maybeerror'),
    PC = require('unparse-js/combinators'), // what about CST?
    Tokens = require('./tokens');

var T = Tokens.Token;

var openParen   = PC.literal('(').fmap(T.bind(null, 'open-paren')),
    closeParen  = PC.literal(')').fmap(T.bind(null, 'close-paren')),
    openSquare  = PC.literal('[').fmap(T.bind(null, 'open-square')),
    closeSquare = PC.literal(']').fmap(T.bind(null, 'close-square')),
    openCurly   = PC.literal('{').fmap(T.bind(null, 'open-curly')),
    closeCurly  = PC.literal('}').fmap(T.bind(null, 'close-curly')),
    atSign      = PC.literal('@').fmap(T.bind(null, 'at-sign')),
    openVar     = PC.string("#'").fmap(T.bind(null, 'open-var')),
    openRegex   = PC.string('#"').fmap(T.bind(null, 'open-regex')),
    openFn      = PC.string('#(').fmap(T.bind(null, 'open-fn')),
    openSet     = PC.string('#{').fmap(T.bind(null, 'open-set'));
    
var punctuation = PC.any([
    openParen,  closeParen,
    openSquare, closeSquare,
    openCurly,  closeCurly,
    openFn,     openSet]);

var ESCAPES = [
    ['b' ,  '\b'],
    ['t' ,  '\t'],
    ['n' ,  '\n'],
    ['f' ,  '\f'],
    ['r' ,  '\r'],
    ['"' ,  '"' ],
    ["'" ,  "'" ],
    ['\\',  '\\']
];

// join a list of chars into a string
function joiner(x) {
    return x.join('');
}

var escape = PC.literal('\\')
    .seq2R(PC.any(ESCAPES.map(function(e) {
        // match the character and return the translation
        return PC.literal(e[0]).seq2R(PC.pure(e[1]));
    }))),
    sq = PC.literal("'"),
    dq = PC.literal('"'),
    notSlashOrDq = PC.literal('\\').plus(dq).not1(),
    stringBody = notSlashOrDq.plus(escape).many0().fmap(joiner);

var string = dq.seq2R(stringBody).seq2L(dq).fmap(T.bind(null, 'string'));

// if strings are single tokens, then regexes should be, too
var regex = openRegex.seq2R(stringBody).seq2L(dq).fmap(T.bind(null, 'regex'));

var TERMINATING_MACRO = PC.get.check(function(ts) {
        if (ts.length === 0) { return true; }
        var ALLOWABLE = ' \t\n\r\f,";@^`~()[]{}\\%';
        for(var i = 0; i < ALLOWABLE.length; i++) {
            if(ts[0] === ALLOWABLE[i]) {
                return true;
            }
        }
        return false;
    }),
    ANY_MACRO = PC.get.check(function(ts) {
            if (ts.length === 0) { return true; }
            var ALLOWABLE = '#\' \t\n\r\f,";@^`~()[]{}\\%';
            for(var i = 0; i < ALLOWABLE.length; i++) {
                if(ts[0] === ALLOWABLE[i]) {
                    return true;
                }
            }
            return false;
        });

var digit = PC.item.check(function(c) {
    return c >= '0' && c <= '9'; // does this work?
});

var integer = digit.many1().fmap(joiner),
    ratio = PC.all([integer, PC.literal('/'), integer]).fmap(joiner),
    float = PC.all([integer, PC.literal('.'), integer.optional()]).fmap(joiner),
    sign = PC.literal('-').plus(PC.literal('+')).optional(),
    scinum = null, // TODO !!!!
    number = PC.all([sign, PC.any([float, ratio, integer])]) //, scinum])])
        .fmap(function(x) {
            return T('number', x.join(''));
        })
        .seq2L(ANY_MACRO.commit('number format error'));
    
var char = PC.literal('\\')
    .seq2R(PC.any([
        PC.string('newline').seq2R(PC.pure('\n')),
        PC.string('space').seq2R(PC.pure(' ')),
        PC.string('tab').seq2R(PC.pure('\t')),
        PC.item])).fmap(T.bind(null, 'char'))
    .seq2L(TERMINATING_MACRO.commit('char format error'));

var nil = PC.string('nil')
        .fmap(T.bind(null, 'nil'))
        .seq2L(TERMINATING_MACRO.commit('nil format error')),
    bool = PC.string('true')
        .plus(PC.string('false'))
        .fmap(T.bind(null, 'boolean'))
        .seq2L(TERMINATING_MACRO.commit('boolean format error'));

var symbolHead = PC.item.check(function(c) {
        return c.match(/^[a-zA-Z\*\+\!\-\_\?\>\<\=\$\.\%]$/);
    }),
    symbolRest = PC.any([symbolHead, digit, PC.literal('/')]),
    symbolBody = PC.app(function(f, r) {return [f, r].join('');}, symbolHead, symbolRest.many0().fmap(joiner))
        .seq2L(TERMINATING_MACRO.commit('symbol format error')),
    symbol = symbolBody.fmap(T.bind(null, 'symbol'));

var keyword = PC.literal(':').seq2R(symbolBody.fmap(T.bind(null, 'keyword')));

var newline = PC.any([PC.literal('\n'), PC.literal('\r'), PC.literal('\f')]),
    comment = PC.any([PC.literal(';'), PC.string('#!')])
        .seq2R(newline.not1().many0().fmap(joiner))
        .fmap(T.bind(null, 'comment')),
    space = PC.item.check(function(c) {return c.match(/^[ \t,]$/);})
        .plus(newline)
        .many1()
        .fmap(joiner)
        .fmap(T.bind(null, 'space'));

var token = PC.any([
        punctuation, atSign,
        openVar, char, string,
        regex, number, bool,
        nil, symbol, keyword,
        comment, space
    ]),
    scanner = token.many0();

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

