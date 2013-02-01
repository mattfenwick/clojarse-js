define(["libs/maybeerror", "libs/parsercombs", "app/ast", "app/tokens"], function (ME, PC, AST, TS) {
    "use strict";

    function tokentype(ttype) {
        return PC.item.bind(function(t) {
            if(t.tokentype === ttype) {
                return PC.pure(t.value);
            }
            return PC.zero;
        });
    }
    
    var myForm = new PC(function() {}); // a 'forward declaration'
    
    var myString   =  tokentype('string').fmap(AST.string),
        myNumber   =  tokentype('number').fmap(parseFloat).fmap(AST.number),
        myChar     =  tokentype('char').fmap(AST.char),
        myNil      =  tokentype('nil').seq2R(PC.pure(AST.nil)),
        myBoolean  =  tokentype('boolean').fmap(AST.boolean),
        mySymbol   =  tokentype('symbol').fmap(AST.symbol),
        myKeyword  =  tokentype('keyword').fmap(AST.keyword);
    
    var myList = tokentype('open-paren')
            .seq2R(myForm.many0())
            .seq2L(tokentype('close-paren'))
            .fmap(AST.list),
        myVector = tokentype('open-square')
            .seq2R(myForm.many0())
            .seq2L(tokentype('close-square'))
            .fmap(AST.vector),
        mySet = tokentype('open-set')
            .seq2R(myForm.many0())
            .seq2L(tokentype('close-curly'))
            .fmap(AST.set),
        myTable = tokentype('open-curly')
            .seq2R(PC.all([myForm, myForm]).many0())
            .seq2L(tokentype('close-curly'))
            .fmap(AST.table);
    
    var myFunction = tokentype('open-fn')
            .seq2R(myForm.many0())
            .seq2L(tokentype('close-paren'))
            .fmap(AST.function),
        myQuote = null, // TODO ??
        myRegex = tokentype('regex').fmap(AST.regex),
        myDeref = tokentype('at-sign').seq2R(myForm).fmap(AST.deref);
        
    myForm.parse = PC.any([myString, myNumber, myChar, myNil,
        myBoolean, mySymbol, myKeyword, 
        myList, myVector, mySet, myTable,
        myRegex, myDeref]).parse;
        
    var myForms = myForm.many0();
        
    /* tests */
    
    var tests = (function() {
        var T = TS.Token;
        return [
            ['string', ME.pure({rest: [T('number', '32')], result: AST.string('abc')}), 
                myString.parse([T('string', 'abc'), T('number', '32')])],
            ['string fail', ME.zero, myString.parse([T('number', '16')])],
            ['list', ME.pure({rest: [], result: AST.list([AST.symbol('+'), AST.number(13), AST.symbol('x')])}),
                myForm.parse([T('open-paren', '('), T('symbol', '+'), T('number', '13'),
                              T('symbol', 'x'), T('close-paren', ')')])]
        ];
    })();
    
    return {
    
        'forms'   :  myForms,
        'form'    :  myForm,
        
        'string'  :  myString,
        'number'  :  myNumber,
        'char'    :  myChar,
        'nil'     :  myNil,
        'boolean' :  myBoolean,
        'symbol'  :  mySymbol,
        'keyword' :  myKeyword,
        
        'list'    :  myList,
        'vector'  :  myVector,
        'set'     :  mySet,
        'table'   :  myTable,
        
        'function':  myFunction,
        'quote'   :  myQuote,
        'regex'   :  myRegex,
        'deref'   :  myDeref,
    
        tests:  tests
    };

});