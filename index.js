'use strict';

var fullparser = require('./lib/parser/full'),
    specials = require('./lib/specials'),
    A = require('./lib/ast'),
    builder = require('./lib/astbuilder'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var parsed = fullparser.fullParse(input);
var ast = parsed.fmap(builder.build);
ast.fmap(specials.check_specials);

// var output = JSON.stringify(parsed, null, 2) + JSON.stringify(ast, null, 2) + ast.fmap(A.dump).value;
// var output = JSON.stringify(ast, null, 2) + '\n' + ast.fmap(A.dump).value;
var output = ast.fmap(A.dump).mapError(JSON.stringify).value;
// var output = ast.mapError(JSON.stringify).value;

/*
fs.writeFile('output', 
    JSON.stringify(parser.parse(input), null, 2),
    {'encoding': 'utf8'});
*/
process.stdout.write((typeof output === 'string' ? 
                      output :
                      JSON.stringify(output))   + "\n");


module.exports = {

};

