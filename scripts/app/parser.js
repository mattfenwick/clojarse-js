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
    
    var myFunction = delimited(
            tokentype('open-fn'),
            myForm.many0().fmap(AST.function),
            tokentype('close-paren'),
            'function'),
        myQuote = null, // TODO ??
        myRegex = tokentype('regex').fmap(metaF(AST.regex)),
        myDeref = PC.app(function(a, f) {return AST.deref(f, a.meta);}, tokentype('at-sign'), myForm);
        
    myForm.parse = PC.any([myString, myNumber, myChar, myNil,
        myBoolean, mySymbol, myKeyword, 
        myList, myVector, mySet, myTable,
        myFunction, myRegex, myDeref]).parse;
        
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
        
        'list'    :  myList,
        'vector'  :  myVector,
        'set'     :  mySet,
        'table'   :  myTable,
        
        'function':  myFunction,
        'quote'   :  myQuote,
        'regex'   :  myRegex,
        'deref'   :  myDeref
    };

});