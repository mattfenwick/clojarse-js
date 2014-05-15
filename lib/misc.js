'use strict';

var allows_metadata = {
    'table': 1, 'set': 1, 'list': 1,
    'vector': 1, 'function': 1
};

var can_be_metadata = {
    'keyword': 1, 'autokey': 1,
    'symbol': 1, 'string': 1, 'map': 1
};

function metadata(node) {
    if ( node.meta.length > 0 ) {
        if ( !allows_metadata.hasOwnProperty(node.type) ) {
            ?? error ??
        }
    }
    node.meta.map(function(m) {
        if ( !can_be_metadata.hasOwnProperty(m.type) ) {
            ?? error ??
        }
    });
    ?? return_value ??
}

function ratio_denominator(node) {
    var is_all_zeros = true;
    for (var i = 0; i < node.tree.digits.length; i++) {
        if ( node.tree.digits[i] !== 0 ) {
            is_all_zeros = false;
        }
    }
    if ( is_all_zeros ) {
        ?? error divide by 0 ??
    }
}

function integer_base(node) {
    var base = parseInt(node.tree.base, 10);
    if ( base > 36 ) {
        ?? error ??
    } else if ( base <= 1 ) {
        ?? error ??
    }
}

function integer_digits(node) {
    var base = parseInt(node.tree.base, 10);
    node.tree.digits.split('').map(function(d) {
        var norm,
            c = d.charCodeAt();
        if ( ( c >= 48 ) && ( c <= 57 ) ) { // 0-9
            norm = c;
        } else if ( ( c >= 65 ) && ( c <= 90 ) ) { // A-Z
            norm = ((c - 65) + 10);
        } else if ( ( c >= 97 ) && ( c <= 122 ) ) { // a-z
            norm = ((c - 97) + 10);
        } else {
            throw new Error('unrecognized digit in ' + JSON.stringify(node));
        }
        if ( c >= base ) {
            ?? error ??
        }
    });
}

function map_even(node) {
    if ( ( node.elems.length % 2 ) === 1 ) {
        ?? error ??
    }
}

var checks = {
    'integer': [integer_base, integer_digits],
    'ratio': [ratio_denominator],
    'map': [map_even],
    ?? all ?? : [metadata]
};

function traverse() {

}


module.exports = {

};

