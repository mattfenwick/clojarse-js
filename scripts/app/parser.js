define(["libs/maybeerror", "libs/parsercombs", "app/ast", "app/tokens"], function (ME, PC, AST, TS) {
    "use strict";

    function tokentype(type) {
        return PC.satisfy(
            function(t) {
                return t.tokentype === type;
            });
    }
    
    function metaF(f) {
        return function(t) {
            return f(t.value, t.meta);
        };
    }
    
    var myForm = new PC(function() {}); // a 'forward declaration'
    
    function boolAction(t) {
        var val = true;
        if(t.value === 'false') {
            val = false;
        } else if(t.value !== 'true') {
            throw new Error('invalid boolean: ' + t.value);
        }
        return AST.boolean(val, t.meta);
    }
    
    var myString   =  tokentype('string').fmap(metaF(AST.string)),
        myNumber   =  tokentype('number').fmap(function(t) {return AST.number(parseFloat(t.value), t.meta);}),
        myChar     =  tokentype('char').fmap(metaF(AST.char)),
        myNil      =  tokentype('nil').fmap(function(t) {return AST.nil(t.meta);}),
        myBoolean  =  tokentype('boolean').fmap(boolAction),
        mySymbol   =  tokentype('symbol').fmap(metaF(AST.symbol)),
        myKeyword  =  tokentype('keyword').fmap(metaF(AST.keyword));
    
    // return value's meta is the meta of the 'start' parser
    function delimited(start, middle, end, rule) {
        return start.bind(
            function(t) {
                return middle
                    .seq2L(end)
                    .fmap(function(a) {a.meta = t.meta; return a;}) // oops, mutation.  sorry
                    .commit({meta: t.meta, rule: rule});
            });
    };
    
    var myList = delimited(
            tokentype('open-paren'),
            myForm.many0().fmap(AST.list),
            tokentype('close-paren'),
            'list'),
        myVector = delimited(
            tokentype('open-square'),
            myForm.many0().fmap(AST.vector),
            tokentype('close-square'),
            'vector'),
        mySet = delimited(
            tokentype('open-set'),
            myForm.many0().fmap(AST.set),
            tokentype('close-curly'),
            'set'),
        myTable = delimited(
            tokentype('open-curly'),
            PC.all([myForm, myForm]).many0().fmap(AST.table),
            tokentype('close-curly'),
            'table');
    
    function firstMeta(f, p1, p2) {
        return PC.app(function(a, b) {return f(b, a.meta);}, p1, p2);
    }
    
    var myFunction = delimited(
            tokentype('open-fn'),
            myForm.many0().fmap(AST.function),
            tokentype('close-paren'),
            'function'),
        myQuote = firstMeta(AST.quote, tokentype('quote'), myForm),
        myRegex = tokentype('regex').fmap(metaF(AST.regex)),
        myDeref = firstMeta(AST.deref, tokentype('at-sign'), myForm),
        myUnquote = firstMeta(AST.unquote, tokentype('unquote'), myForm),
        myUnquoteSplicing = firstMeta(AST.unquotesplicing, tokentype('unquote-splicing'), myForm),
        mySyntaxQuote = firstMeta(AST.syntaxquote, tokentype('syntax-quote'), myForm),
        myMeta = firstMeta(AST.metadata, tokentype('meta'), PC.any([mySymbol, myString, myKeyword, myTable])); // fails without error -- bad !!!
        
    myForm.parse = PC.any([myString, myNumber, myChar, myNil,
        myBoolean, mySymbol, myKeyword, myRegex,
        myList, myVector, mySet, myTable,
        myFunction, myDeref, myQuote,
        myUnquote, myUnquoteSplicing,
        mySyntaxQuote, myMeta]).parse;
        
    var myForms = myForm.many0();
        
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
        'regex'   :  myRegex,
        
        'list'    :  myList,
        'vector'  :  myVector,
        'set'     :  mySet,
        'table'   :  myTable,
        'function':  myFunction,
        
        'quote'   :  myQuote,
        'deref'   :  myDeref,
        'unquote' :  myUnquote
    };

});