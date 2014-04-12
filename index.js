'use strict';

var parser = require('./lib/parser'),
    cleaner = require('./lib/cleaner'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var parsed = parser.parse(input);

var outstring = ( parsed.status === 'success' ) ?
        parsed.value.result.map(cleaner.cleanTree) :
        parsed;

var output = JSON.stringify(outstring, null, 2);

/*
fs.writeFile('output', 
    JSON.stringify(parser.parse(input), null, 2),
    {'encoding': 'utf8'});
*/
process.stdout.write(output);


module.exports = {
//    'parser'     : require('./lib/parser.js')     ,
//    'treechecker': require('./lib/treechecker.js'),
//    'validator'  : require('./lib/validator.js')
};

