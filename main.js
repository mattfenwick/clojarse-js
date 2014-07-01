'use strict';

var index = require('./index'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var cstOrError = index.parseCst(input),
    ast = cstOrError.fmap(index.cstToAst);

// what about errors?
var output = ast.fmap(index.ast.dump).mapError(JSON.stringify).value;

process.stdout.write((typeof output === 'string' ? 
                      output :
                      JSON.stringify(output))   + "\n"); // TODO utf8?


module.exports = {

};

