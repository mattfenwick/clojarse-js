'use strict';

var index = require('./index'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var cst = index.cst(input),
    ast = index.ast(input);

var output = ast.fmap(D.dump).mapError(JSON.stringify).value;

process.stdout.write((typeof output === 'string' ? 
                      output :
                      JSON.stringify(output))   + "\n"); // TODO utf8?


module.exports = {

};

