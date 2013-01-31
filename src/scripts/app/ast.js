define(function () {
    "use strict";
    
    function astNode(asttype, value) {
        return {
            type: 'astnode',
            asttype: asttype,
            value: value
        };
    }
        
    function myString(str) {
        if(typeof str !== 'string') {
            throw new Error('type error');
        }
        return astNode('string', str);
    }
    
    function myNumber(num) {
        if(typeof num !== 'number') {
            throw new Error('type error');
        }
        return astNode('number', num);
    }
    
    function myChar(chr) {
        if(typeof chr !== 'string' || chr.length !== 1) {
            throw new Error('type error');
        }
        return astNode('char', chr);
    }
    
    var myNil = astNode('nil', null),
        myFalse = astNode('boolean', false),
        myTrue = astNode('boolean', true);
    
    function myKeyword(str) {
        if(typeof str !== 'string') {
            throw new Error('type error');
        }
        return astNode('keyword', str);
    }
    
    function myList(elems) {
    
    }
    
    function myVector(elems) {
    
    }
    
    function myTable(pairs) {
    
    }
    
    function mySet(elems) {
    
    }
    
    function myFunction(form) {
        if(form.asttype !== 'list') {
            throw new Error('type error');
        }
        return astNode('function', form);
    }


    return {
        
        'string'  :  myString,
        'number'  :  myNumber,
        'char'    :  myChar,
        'nil'     :  myNil,
        'false'   :  myFalse,
        'true'    :  myTrue,
        'symbol'  :  mySymbol,
        'keyword' :  myKeyword,
        
        'list'    :  myList,
        'vector'  :  myVector,
        'set'     :  mySet,
        'table'   :  myTable,
        
        'quote'   :  myQuote,
        'regex'   :  myRegex,
        'deref'   :  myDeref,
    
        tests:  []
    };

});