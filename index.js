'use strict';

var parser = require('./lib/parser'),
    fs = require('fs');


var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});

var output = JSON.stringify(parser.parse(input), null, 2);

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

