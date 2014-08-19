'use strict';

var index = require('./index'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var cstOrError = index.parseCst(input),
    tree;

if ( process.argv[2] === 'cst' ) {
    tree = cstOrError.fmap(JSON.stringify);
} else if ( process.argv[2] !== undefined ) {
    throw new Error('invalid arg -- can only be "cst": was ' + process.argv[2]);
} else {
    tree = cstOrError.fmap(index.cstToAst)
                     .fmap(index.ast.dump);
}

var o1 = tree.mapError(function(x) {return JSON.stringify(x, null, 2);}),
    output = o1.value;

process.stdout.write(output + "\n"); // TODO utf8?


module.exports = {

};

