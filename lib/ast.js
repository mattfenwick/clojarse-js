"use strict";

function astNode(asttype, value, meta) {
    return {
        'type': 'astnode',
        'asttype': asttype,
        'value': value,
        'meta': meta
    };
}
    
function myString(str, meta) {
    if(typeof str !== 'string') {
        throw new Error('type error');
    }
    return astNode('string', str, meta);
}

function myNumber(num, meta) {
    if(typeof num !== 'number') {
        throw new Error('type error');
    }
    return astNode('number', num, meta);
}

function myChar(chr, meta) {
    if(typeof chr !== 'string' || chr.length !== 1) {
        throw new Error('type error');
    }
    return astNode('char', chr, meta);
}

function myNil(meta) {
    return astNode('nil', null, meta);
}

function myBoolean(bool, meta) {
    if(typeof bool !== 'boolean') {
        throw new Error('type error');
    }
    return astNode('boolean', bool, meta);
}

function mySymbol(str, meta) {
    if(typeof str !== 'string') {
        throw new Error('type error');
    }
    return astNode('symbol', str, meta);
}

function myKeyword(str, meta) {
    if(typeof str !== 'string') {
        throw new Error('type error');
    }
    return astNode('keyword', str, meta);
}

function myRegex(str, meta) {
    if(typeof str !== 'string') {
        throw new Error('type error');
    }
    return astNode('regex', str, meta);
}

function myList(elems, meta) {
    if(elems.length === undefined || typeof elems === 'string') {
        throw new Error('type error');
    }
    return astNode('list', elems, meta);
}

function myVector(elems, meta) {
    if(elems.length === undefined || typeof elems === 'string') {
        throw new Error('type error');
    }
    return astNode('vector', elems, meta);
}

function myTable(pairs, meta) {
    if(pairs.length === undefined || typeof pairs === 'string') {
        throw new Error('type error');
    }
    pairs.map(function(p) {
        if(p.length !== 2) {
            throw new Error('value error, needed array of length 2');
        }
    });
    return astNode('table', pairs, meta);
}

function mySet(elems, meta) {
    if(elems.length === undefined || typeof elems === 'string') {
        throw new Error('type error');
    }
    return astNode('set', elems, meta);
}

function myFunction(elems, meta) {
    if(elems.length === undefined || typeof elems === 'string') {
        throw new Error('type error');
    }
    return astNode('function', elems, meta);
}

function myQuote(form, meta) {
    return astNode('quote', form, meta);
}
    
// just for kicks:  var myDeref = astNode.bind(null, 'deref');
function myDeref(form, meta) {
    return astNode('deref', form, meta);
}

function mySyntaxQuote(form, meta) {
    return astNode('syntaxquote', form, meta);
}

function myUnquoteSplicing(form, meta) {
    return astNode('unquotesplicing', form, meta);
}

function myUnquote(form, meta) {
    return astNode('unquote', form, meta);
}

var metatypes = {
    'string' : 1,
    'symbol' : 1,
    'table'  : 1,
    'keyword': 1
};

function myMetadata(form, meta) {
    if(!(form.asttype in metatypes)) {
        throw new Error('invalid metadata type: ' + form.asttype);
    }
    return astNode('metadata', form, meta);
}


module.exports = {
    
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
    'syntaxquote'  :  mySyntaxQuote,
    'unquotesplicing'  :  myUnquoteSplicing,
    'unquote'      :  myUnquote,
    'metadata'     :  myMetadata
};

