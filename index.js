'use strict';

var FP = require('./lib/full'),
    D = require('./lib/astdumper'),
    B = require('./lib/astbuilder'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var parsed = FP.fullParse(input);
var ast = parsed.fmap(B.build);
var output = ast.fmap(D.dump).mapError(JSON.stringify).value;


// TODO call this from an executable ... which should probably go in another directory or project?
process.stdout.write((typeof output === 'string' ? 
                      output :
                      JSON.stringify(output))   + "\n"); // TODO utf8?


module.exports = {

};

