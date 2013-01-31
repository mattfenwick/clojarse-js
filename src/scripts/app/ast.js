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
        if(elems.length === undefined || typeof elems === 'string') {
            throw new Error('type error');
        }
        return astNode('list', elems);
    }
    
    function myVector(elems) {
        if(elems.length === undefined || typeof elems === 'string') {
            throw new Error('type error');
        }
        return astNode('vector', elems);
    }
    
    function myTable(pairs) {
        if(pairs.length === undefined || typeof pairs === 'string') {
            throw new Error('type error');
        }
        pairs.map(function(p) {
            if(p.length !== 2) {
                throw new Error('value error, needed array of length 2');
            }
        });
        return astNode('table', pairs);
    }
    
    function mySet(elems) {
        if(elems.length === undefined || typeof elems === 'string') {
            throw new Error('type error');
        }
        return astNode('set', elems);
    }
    
    // TODO should this be a javascript array
    //   or a wrapped list ?????
    function myFunction(form) {
        if(form.asttype !== 'list') {
            throw new Error('type error');
        }
        return astNode('function', form);
    }
    
    function myQuote(form) {
        return astNode('quote', form);
    }
    
    function myRegex(str) {
        if(typeof str !== 'string') {
            throw new Error('type error');
        }
        return astNode('regex', str);
    }
    
    // just for kicks:  var myDeref = astNode.bind(null, 'deref');
    function myDeref(form) {
        return astNode('deref', form);
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