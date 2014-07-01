'use strict';

var T = require('./lib/tokens'),
    S = require('./lib/structure'),
    P = require('./lib/parser'),
    A = require('./lib/ast'),
    B = require('./lib/astbuilder');


function parseCst(input) {
    var cst = P.parseCst(input);
}

function parseAst(cst) {
    return cst.fmap(B.build);
}


module.exports = {
    'tokens'    : T,
    'structure' : S,
    'parser'    : P,
    
    'ast'       : A,
    'astbuilder': B,
    
    // this seems kind of redundant
    'parseCst'  : parseCst,
    'parseAst'  : parseAst
};

