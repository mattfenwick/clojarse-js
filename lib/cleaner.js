'use strict';


function cleanNumber(node) {
    return {
        '_state': node._state,
        '_name' : node._name ,
        'sign'  : node.sign  ,
        'value' : node.first + node.rest.join('')
    };
}

function cleanSymbol(node) {
    return {
        '_state': node._state,
        '_name' : node._name ,
        'value' : node.first + node.rest.join('')
    };
}

function cleanString(node) {
    function action(p) { 
        if ( typeof p === 'string' ) {
            return p;
        }
        return p.join('');
    }
    return {
        '_state': node._state,
        '_name' : node._name,
        'value' : node.body.map(action).join('') // be careful, changing name of field here
    };
}

var actions = {
    'number': cleanNumber,
    'symbol': cleanSymbol,
    'char'  : cleanSymbol, // ditches 'open'
    'string': cleanString, // ditches 'open', 'close'
    'regex' : cleanString  // ditches 'open', 'close'
};

var has_body = {'list': 1, 'vector': 1, 'table': 1, 'function': 1, 'set': 1};
var has_value = {
    'quote': 1, 'unquote': 1, 'deref': 1, 'syntax-quote': 1,
    'unquote-splicing': 1, 'eval': 1, 'var': 1
};

function cleanTree(node) {
    var type = node._name;
    if ( actions.hasOwnProperty(type) ) {
        return actions[type](node);
    } else if ( has_body.hasOwnProperty(type) ) {
        return {
            '_state': node._state,
            '_name': node._name,
            'body': node.body.map(cleanTree)
        };
    } else if ( has_value.hasOwnProperty(type) ) {
        return {
            '_state': node._state,
            '_name': node._name,
            'value': cleanTree(node.value)
        };
    } else if ( type === 'metadata' ) {
        return {
            '_state': node._state,
            '_name': node._name,
            'metadata': cleanTree(node.metadata),
            'value': cleanTree(node.value)
        };
    } else {
        throw new Error('invalid type -- ' + type + ' ' + JSON.stringify(node));
    }
}

module.exports = {
    'cleanTree': cleanTree
};

