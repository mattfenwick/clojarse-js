'use strict';

function warning(message, position, obj) {
    obj.severity = 'warning';
    obj.message = message;
    obj.position = position;
    return obj;
}

// log an error -- not an error effect
function error(message, position, obj) {
    obj.severity = 'error';
    obj.message = message;
    obj.position = position;
    return obj;
}


var allows_metadata = {
    'table': 1, 'set': 1, 'list': 1,
    'vector': 1, 'function': 1, 'symbol': 1
};

function metadata_value(node, state, log) {
    if ( node.meta.length > 0 ) {
        if ( !allows_metadata.hasOwnProperty(node.type) ) {
            log.push(error('form does not support metadata', node.pos, {'type': node.type}));
        }
    }
}

var can_be_metadata = {
    'keyword': 1, 'autokey': 1,
    'symbol': 1, 'string': 1, 'table': 1
};

function metadata_meta(node, state, log) {
    var rwss = node.meta.map(function(m) {
        if ( !can_be_metadata.hasOwnProperty(m.type) ) {
            log.push(error('invalid metadata type', m.pos, {'type': m.type}));
        }
    });
}

function ratio_denominator(node, state, log) {
    var is_all_zeros = true,
        den = node.tree.denominator;
    for (var i = 0; i < den.length; i++) {
        if ( den[i] !== '0' ) {
            is_all_zeros = false;
        }
    }
    if ( is_all_zeros ) {
        log.push(error('divide by 0', node.pos, {}));
    }
}

function integer_base(node, state, log) {
    var base = parseInt(node.tree.base, 10);
    if ( base > 36 ) {
        log.push(error('radix too large', node.pos, {'radix': base}));
    } else if ( base <= 1 ) {
        log.push(error('radix too small', node.pos, {'radix': base}));
    }
}

function integer_digits(node, state, log) {
    var base = parseInt(node.tree.base, 10);
    node.tree.digits.split('').map(function(d) {
        var norm,
            c = d.charCodeAt();
        if ( ( c >= 48 ) && ( c <= 57 ) ) { // 0-9
            norm = (c - 48);
        } else if ( ( c >= 65 ) && ( c <= 90 ) ) { // A-Z
            norm = ((c - 65) + 10);
        } else if ( ( c >= 97 ) && ( c <= 122 ) ) { // a-z
            norm = ((c - 97) + 10);
        } else {
            throw new Error('unrecognized digit in ' + JSON.stringify(node));
        }
        if ( norm >= base ) {
            console.log(norm + ' -- ' + base);
            log.push(error('out of range digit', node.pos, {'digit': d})); // TODO wrong position
        }
    });
}

function table_even(node, state, log) {
    if ( ( node.elems.length % 2 ) === 1 ) {
        log.push(error('uneven number of elements in table', node.pos, {'number': node.elems.length}));
    }
}

function type(t) {
    return function(node) {
        return (t === node.type);
    };
}

var checks = [
    [type('integer')            , [integer_base, integer_digits]    ],
    [function() {return true;}  , [metadata_value, metadata_meta]   ],
    [type('table')              , [table_even]                      ],
    [type('ratio')              , [ratio_denominator]               ]
];

function traverse(node, state, log) {
    var fs = [],
        self,
        pred,
        recurse,
        i;
    for (i = 0; i < checks.length; i++) {
        pred = checks[i][0];
        if ( pred(node) ) {
            fs = fs.concat(checks[i][1]);
        }
    }
    fs.map(function(f) {
        return f(node, state, log);
    });
    switch (node._tag) {
        case 'token':
            break;
        case 'struct':
            node.elems.map(function(e) { traverse(e, state, log); });
            break;
        case 'leaf':
            traverse(node.form, state, log);
            break;
        default:
            throw new Error('unexpected AST node tag -- ' + JSON.stringify(node));
    }
    // TODO we need to also recurse into the metadata
}


module.exports = {
    'traverse': traverse
};

