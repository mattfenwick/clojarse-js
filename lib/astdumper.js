'use strict';

var ignore = {'_tag': 1, 'type': 1, 'meta': 1, 'pos': 1};

// make a copy of an object, minus certain keys
function extract(token) {
    var obj = {};
    Object.keys(token).map(function(k) {
        if ( !ignore.hasOwnProperty(k) ) {
            obj[k] = token[k];
        }
    });
    return obj;
}


function dump_help(node, lines, depth) {
    lines.push(depth + node.type + ' at ' + node.pos);
    node.meta.map(function(m) { dump_help(m, lines, depth + '        '); });
    if ( node._tag === 'struct' ) {
        node.elems.map(function(e) {
            dump_help(e, lines, depth + '  ');
        });
    } else if ( node._tag === 'token' ) {
        lines.push(depth + '  ' + JSON.stringify(extract(node)));
    } else {
        throw new Error('unrecognized node type -- ' + node._tag + JSON.stringify(node));
    }
}

function dump(node) {
    var lines = [];
    dump_help(node, lines, '');
    return lines.join('\n');
}


module.exports = {
    // dump to string
    'dump': dump
};

