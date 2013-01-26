var Tokenizer = (function (ME, PC) {
    "use strict";

    var openParen   = PC.literal('('),
        closeParen  = PC.literal(')'),
        openSquare  = PC.literal('['),
        closeSquare = PC.literal(']'),
        openCurly   = PC.literal('{'),
        closeCurly  = PC.literal('}'),
        atSign      = PC.literal('@'),
        openVar     = PC.literal("#'"),
        openRegex   = PC.literal('#"'),
        openFn      = PC.literal('#('),
        openSet     = PC.literal('#{');

    var ESCAPES = [
        ['b' ,  '\b'],
        ['t' ,  '\t'],
        ['n' ,  '\n'],
        ['f' ,  '\f'],
        ['r' ,  '\r'],
        ['"' ,  '"'],
        ["'" ,  "'"],
        ['\\', '\\']
    ];
    
    var escape = PC.literal('\\')
        .seq2R(PC.any(ESCAPES.map(function(e) {
            return PC.literal(e[0]).seq2R(PC.pure(e[1])); // match the character and return the translation
        })));
        
    var sq = PC.literal("'"),
        dq = PC.literal('"'),
        stringBody = PC.plus(PC.literal('\\').plus(DQ).not1(), escape).many0();
    
    var string = dq.seq2R(stringBody).seq2L(dq);
    
    var regex = openRegex.seq2R(stringBody).seq2L(dq);
    
    var digit = PC.item.check(function(c) {
        return c >= '0' && c <= '9';
    });
    
    var integer = digit.many1(),
        float = PC.all([integer, PC.literal('.'), digit.many0()]),
        scinum = null, // TODO !!!!
        ratio = PC.all([integer, PC.literal('/'), integer]),
        number = PC.all([PC.literal('-').plus(PC.literal('+')).optional(), PC.any([float, scinum, integer, ratio]));
        
    var char = PC.literal('\\').seq2R(PC.any([PC.string('newline'), PC.string('space'), PC.string('tab'), PC.item]));
    // TODO whoa whoa whoa -- does char have to look ahead so that it can correctly identify \ab as an error?
    //   note that this can be solved using the get/check/put parsers
    
    var nil = PC.string('nil'),
        bool = PC.string('true').plus(PC.string('false'));

    return {
    };

})(MaybeError, ParserCombs);