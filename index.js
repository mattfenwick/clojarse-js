'use strict';

var FP = require('./lib/parser/full'),
    D = require('./lib/astdumper'),
    T = require('./lib/simpletree/checker'),
    B = require('./lib/astbuilder'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var parsed = FP.fullParse(input);
var ast = parsed.fmap(B.build);

ast.fmap(function(a) {
    var out = T.default_traverse(a),
        state = out[0],
        log = out[1]; 
    console.log('state -- ' + JSON.stringify(state, null, 2));
    log._issues.map(function(e) { console.log(JSON.stringify(e)); });
    console.log(JSON.stringify(log._symbol_use, null, 2));
    console.log();
});

// var output = JSON.stringify(parsed, null, 2) + JSON.stringify(ast, null, 2) + ast.fmap(A.dump).value;
// var output = JSON.stringify(ast, null, 2) + '\n' + ast.fmap(A.dump).value;
var output = ast.fmap(D.dump).mapError(JSON.stringify).value;
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

