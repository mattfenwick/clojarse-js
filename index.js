'use strict';

var S = require('./lib/structure'),
    A = require('./lib/ast'),
    B = require('./lib/astbuilder');


function parseCst(input) {
    return S.parse(input);
}

function cstToAst(cst) {
    return B.build(cst);
}

function parseAst(input) {
    var cstOrError = parseCst(input);
    return cstOrError.fmap(cstToAst);
}


module.exports = {
    // parser modules
    'structure' : S,
    // ast modules
    'ast'       : A,
    'astbuilder': B,
    // convenience functions -- although seems redundant
    'parseCst'  : parseCst,
    'cstToAst'  : cstToAst,
    'parseAst'  : parseAst
};

