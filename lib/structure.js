'use strict';

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var P = C.position,
    item = P.item, oneOf = P.oneOf,
    literal = P.literal, string = P.string,
    not1 = P.not1, not0 = C.not0,
    cut = Cst.cut, node = Cst.node,
    alt = C.alt, many0 = C.many0,
    many1 = C.many1, error = C.error,
    optional = C.optional, seq = C.seq,
    seq2L = C.seq2L, zero = C.zero,
    seq2R = C.seq2R;


// to allow mutual recursion
var form = error('unimplemented'),
    discard = error('unimplemented');

var comment = node('comment',
        ['open', alt(literal(';'), string('#!'))],
        ['value', many0(not1(oneOf('\n\r')))]),

    whitespace = node('whitespace',
        ['value', many1(oneOf(', \t\n\r\f'))]);
    

var _macro            = oneOf('";@^`~()[]{}\\\'%#'),

    _terminatingMacro = oneOf('";@^`~()[]{}\\');


var number = node('number',
        ['sign' , optional(oneOf('+-'))],
        ['first', oneOf('0123456789')  ],
        ['rest' , many0(not1(alt(whitespace, _macro)))]),

    ident = node('ident',
        ['first', alt(not1(alt(whitespace, _macro)), literal('%'))],
        ['rest', many0(not1(alt(whitespace, _terminatingMacro)))]),

    char = node('char',
        ['open', literal('\\')],
        ['first', cut('any character', item)],
        ['rest', many0(not1(alt(whitespace, _terminatingMacro)))]),

    clojure_string = node('string',
        ['open', literal('"')],
        ['body', many0(alt(not1(oneOf('\\"')),
                           seq(literal('\\'), cut('escape', item))))],
        ['close', cut('"', literal('"'))]),

    regex = node('regex',
        ['open', string('#"')],
        ['body', many0(alt(not1(oneOf('\\"')),
                           seq(literal('\\'), cut('escape', item))))],
        ['close', cut('"', literal('"'))]);


var junk = many0(alt(whitespace, comment, discard));

function munch(tok) {
    return seq2L(tok, junk);
}

discard.parse = node('discard',
    ['open' , munch(string('#_'))],
    ['value', cut('form', form)  ]).parse;

// tokens:
//   - ( ) [ ] { } 
//   - regex, string, number, ident, char
//   - #( #{ #^ #_ #= #'
//   - ' ^ ` ~ ~@ @
//   - comment, whitespace
// not tokens:
//   - starts token: #" #!
//   - starts token: \ " ; %
//   - just weird: #<
var op = munch(literal('(')),
    cp = munch(literal(')')),
    os = munch(literal('[')),
    cs = munch(literal(']')),
    oc = munch(literal('{')),
    cc = munch(literal('}')),
    // reg, num, str, sym, char
    of = munch(string('#(')),
    oset  = munch(string('#{')),
    ometa = munch(string('#^')),
    oeval = munch(string('#=')),
    ovar  = munch(string("#'")),
    qt  = munch(literal("'")),
    pow = munch(literal('^')),
    bt  = munch(literal('`')),
    uqs = munch(string('~@')),
    uq  = munch(literal('~')),
    at  = munch(literal('@'));


var list = node('list',
        ['open' , op              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cp)]),
    
    vector = node('vector',
        ['open' , os              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cs)]),
    
    table = node('table',
        ['open' , oc              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cc)]),

    quote = node('quote',
        ['open' , qt                ],
        ['value', cut('value', form)]),
                   
    deref = node('deref',
        ['open' , at                ],
        ['value', cut('value', form)]),
    
    unquoteSplicing = node('unquote-splicing',
        ['open' , uqs               ],
        ['value', cut('value', form)]),

    unquote = node('unquote',
        ['open' , uq                ],
        ['value', cut('value', form)]),
    
    syntaxQuote = node('syntax-quote',
        ['open' , bt                ],
        ['value', cut('value', form)]);


var function_ = node('function',
        ['open' , of              ],
        ['body' , many0(form)     ],
        ['close', cut('close', cp)]),
    
    set = node('set',
        ['open' , oset            ],
        ['body' , many0(form)     ],
        ['close', cut('close', cc)]),
    
    meta = node('metadata',
        ['open', alt(ometa, pow)          ],
        ['metadata', cut('metadata', form)],
        ['value', cut('value', form)      ]),

    eval_ = node('eval',
        ['open' , oeval             ],
        ['value', cut('value', form)]),
    
    var_ = node('var',
        ['open' , ovar              ],
        ['value', cut('value', form)]),
    
    unreadable = node('unreadable',
        ['open' , string('#<')         ],
        ['value', cut('anything', zero)]),
    
    other_dispatch = node('dispatch',
        ['open' , literal('#')                 ],
        ['value', cut('unknown dispatch', zero)]);


form.parse = alt(
        munch(clojure_string), munch(number),
        munch(char), munch(ident), munch(regex),
        list, vector, set, table,
        function_, deref, quote,
        unquoteSplicing, unquote,
        syntaxQuote, meta,
        eval_, var_
    ).parse;


var clojure = node('clojure',
    ['junk', junk       ], 
    ['body', many0(form)]);


// why isn't this in a separate file?
//   because it's tightly coupled to parser's parse tree
var cleanParseTree = (function() {

    function cleanNumber(node) {
        var sign = node.sign ? node.sign : '';
        return {
            '_state': node._state,
            '_name' : node._name ,
            'value' : sign + node.first + node.rest.join('')
        };
    }

    function cleanIdent(node) {
        return {
            '_state': node._state,
            '_name' : node._name ,
            'value' : node.first + node.rest.join('')
        };
    }

    function cleanString(node) {
        function action(p) {
            if ( typeof p === 'string' ) {
                return p;
            }
            return p.join('');
        }
        return {
            '_state': node._state,
            '_name' : node._name,
            'value' : node.body.map(action).join('') // be careful, changing name of field here
        };
    }

    var token_actions = {
        'number': cleanNumber,
        'ident' : cleanIdent ,
        'char'  : cleanIdent , // ditches 'open'
        'string': cleanString, // ditches 'open', 'close'
        'regex' : cleanString  // ditches 'open', 'close'
    };

    // TODO could use real sets here
    var has_body = {
            'list': 1, 'vector': 1, 'table': 1, 
            'function': 1, 'set': 1, 'clojure': 1
        },
        has_value = {
            'quote': 1, 'deref': 1, 'var': 1,
            'unquote': 1, 'syntax-quote': 1, 'unquote-splicing': 1, 
            'eval': 1
        };

    function cleanTree(node) {
        var type = node._name;
        if ( token_actions.hasOwnProperty(type) ) {
            return token_actions[type](node);
        } else if ( has_body.hasOwnProperty(type) ) {
            return {
                '_state': node._state,
                '_name': node._name,
                'body': node.body.map(cleanTree)
            };
        } else if ( has_value.hasOwnProperty(type) ) {
            return {
                '_state': node._state,
                '_name': node._name,
                'value': cleanTree(node.value)
            };
        } else if ( type === 'metadata' ) {
            return {
                '_state': node._state,
                '_name': node._name,
                'metadata': cleanTree(node.metadata),
                'value': cleanTree(node.value)
            };
        } else {
            throw new Error('invalid type -- ' + type + ' ' + JSON.stringify(node));
        }
    }
    
    return cleanTree;

})();


function dirtyParse(input) {
    var init_position = [1, 1],
        parser = seq2L(clojure, cut('end', not0(item)));
    return parser.parse(input, init_position);
}


function parse(input) {
    var parsed = dirtyParse(input);
    return parsed.fmap(function(value) {
        // throws away rest of input and position
        return cleanParseTree(value.result);
    });
}



module.exports = {
    'dirtyParse'    : dirtyParse    ,
    'cleanParseTree': cleanParseTree,
    'parse'         : parse         ,
    
    'clojure'   : clojure   ,
    'form'      : form      ,
    
    'comment'   : comment   ,
    'whitespace': whitespace,
    'discard'   : discard   ,
    
    'number'    : number    ,
    'ident'     : ident     ,
    'char'      : char      ,
    'string'    : clojure_string ,
    'regex'     : regex     ,
    
    'list'      : list      ,
    'vector'    : vector    ,
    'set'       : set       ,
    'table'     : table     ,
    'function'  : function_ ,
    'deref'     : deref     ,
    'quote'     : quote     ,
    'unquote'   : unquote   ,
    'unquoteSplicing': unquoteSplicing,
    'syntaxQuote': syntaxQuote,
    'meta'      : meta      ,
    'eval'      : eval_     ,
    'var'       : var_

};

