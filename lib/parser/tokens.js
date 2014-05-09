"use strict";

var u = require('unparse-js'),
    C = u.combinators,
    Cst = u.cst;

var pos = C.position,
    literal = pos.literal, item  = pos.item ,
    check = C.check      , oneOf = pos.oneOf,
    string  = pos.string , not1  = pos.not1 ,
    optional = C.optional, alt   = C.alt    ,
    get = C.get    ,  bind  = C.bind ,
    many0 = C.many0,  many1 = C.many1,
    seq2L = C.seq2L,  seq = C.seq    ,
    seq2R = C.seq2R,  alt = C.alt    ,
    node = Cst.node,  cut = Cst.cut  ,
    pure = C.pure  ,  zero = C.zero  , // be careful not to confuse this `zero` with any clojure parsers
    not0 = C.not0  ;

function quantity(n, parser) {
    var ps = [];
    for ( var i = 0; i < n; i++) {
        ps.push(parser);
    }
    return seq.apply(null, ps);
}

var _0_7 = oneOf('01234567'),
    _0_9 = oneOf('0123456789'),
    _hex = oneOf('abcdefABCDEF0123456789'),
    _1_9 = oneOf('123456789'),
    _a_z = oneOf('abcdefghijklmnopqrstuvwxyz'),
    _A_Z = oneOf('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    _sign = optional(oneOf('+-'));

var _base16 = node('base16',
        ['open', seq(literal('0'), oneOf('xX'))],
        ['body', cut('body', many1(_hex))]),
    
    _base8 = node('base8',
        ['open', literal('0')],
        ['body', many1(_0_7)]),
    
    // couldn't this be folded in with octal?
    //   can't be folded into base10 b/c e.g. `09` is illegal
    _zero = node('zero',
        ['value', literal('0')]),
        
    _baseN = node('baseN',
        ['radix', seq(_1_9, optional(_0_9))],
        ['r'    , oneOf('rR')],
        ['body' , many1(alt(_0_9, _a_z, _A_Z))]),

    _base10 = node('base10',
        ['first', _1_9],
        ['rest', many0(_0_9)]),
    
    integer = node('integer',
        ['sign', _sign],
        ['value', alt(_base16, _base8, _zero, _baseN, _base10)], // order *is* important here !!
        ['suffix', optional(literal('N'))]);


var _int_10 = many1(_0_9),

    //"([-+]?[0-9]+)/([0-9]+)");
    ratio = node('ratio',
        ['sign'       , _sign],
        ['numerator'  , _int_10],
        ['slash'      , literal('/')],
        ['denominator', cut('int', _int_10)]),
 
    _decimal = node('decimal',
        ['dot', literal('.')],
        ['int', many0(_0_9)]),
    
    _exp = node('exponent',
        ['e'    , oneOf('eE')],
        ['sign' , _sign],
        ['power', _int_10]),

    //"([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?"
    float = node('float',
        ['sign'    , _sign],
        ['int'     , _int_10],
        ['decimal' , optional(_decimal)],
        ['exponent', optional(_exp)],
        ['suffix'  , optional(literal('M'))]);


var ESCAPES = 'btnfr"\\',
    MACROS = '";@^`~()[]{}\\\'%#',
    WS = ', \t\n\r';

function IS_MACRO(ch) {
    return (MACROS.indexOf(ch) > -1);
}

function IS_WHITESPACE(ch) {
    return (WS.indexOf(ch) > -1);
}


var _simple_escape = node('simple',
        ['value', oneOf(ESCAPES)]),
    
    _unicode_escape = node('unicode',
        ['open', literal('u')],
        ['value', cut('4 hex characters', quantity(4, _hex))]),
    
    // 0-7:good  macro:done  end:done  other:error
    _octal_digit = bind(get, function(xs) {
        if ( xs.length === 0 ) {
            return pure(null);
        }
        var first = xs[0];
        if ( IS_MACRO(first) || IS_WHITESPACE(first) ) {
            return pure(null);
        }
        return cut('octal digit', _0_7);
    }),
    
    // good: \0, \10, \3\3 \232
    // bad: \9, \400, \3z 
    _octal_escape = node('octal',
        ['check', cut('not 8 or 9', not0(oneOf('89')))],
        ['digits', seq(_0_7, _octal_digit, _octal_digit)]),

    _string_escape = node('escape',
        ['open', literal('\\')],
        ['value', cut('escape sequence', alt(_simple_escape, _unicode_escape, _octal_escape))]),
    
    _string_char = node('char',
        ['value', not1(oneOf('\\"'))]),
    
    clojure_string = node('string',
        ['value', many0(alt(_string_char, _string_escape))]),

    // TODO this needs to parse based on java.util.regex.Pattern.compile
    regex = node('regex',
        ['value', many0(item)]);


var _long_escapes = ["newline", "space", "tab", "backspace", "formfeed", "return"],

    _char_long = node('long',
        ['value', alt.apply(null, _long_escapes.map(string))]),

    // can I just reuse unicode escape?  
    //   no, because `\u` is okay (but parsed by _char_simple)
    _char_unicode = node('unicode',
        ['open', literal('u')],
        ['first', _hex       ],
        ['rest', cut('3 hex characters', quantity(3, _hex))]),
    
    _char_octal = node('octal',
        ['o'     , literal('o')],
        ['first' , _0_7        ],
        ['rest'  , cut('0-2 octal characters', 
                       check(function(cs) {return (cs.length <= 2);}, 
                             many0(_0_7)))]),
    
    _char_simple = node('simple',
        ['value', item]),

    char = node('char',
        ['value', alt(_char_long, _char_octal, _char_unicode, _char_simple)]);


//"[:]?([\\D&&[^/]].*/)?(/|[\\D&&[^/]][^/]*)"
//"[:]? ([^0-9/].*/)? (/|[^0-9/][^/]*)"
var _reserved = node('reserved',
        ['value', alt.apply(null, ["nil", "true", "false"].map(string))]),
    
    _ns = node('ns',
        ['value', many1(not1(literal('/')))],
        ['slash', literal('/')]),
        
    _symbol = node('symbol',
        ['type', alt(seq2R(string('::'), pure('auto keyword')),
                     seq2R(literal(':'), pure('keyword')),
                     pure('symbol'))],
        ['ns', optional(_ns)],
        ['name', many1(item)]),
    
    // check for special error cases (maybe match against regex as in Clojure implementation)
    _checks = pure('not implemented'), // TODO 

    symbol = seq2R(_checks, alt(end(_reserved), _symbol));


function end(parser) {
    return seq2L(parser, not0(item));
}

// TODO repeats `end` 3x b/c, if `float` only consumes a prefix, then it
//      should not error out, but rather try `ratio`
var number = alt(end(integer), end(float), end(ratio));

var token_parsers = {
    'number': number        ,
    'char'  : char          ,
    'symbol': symbol        ,
    'string': clojure_string,
    'regex' : regex
};

function dirtyParse(token) {
    if ( token_parsers.hasOwnProperty(token._name) ) {
        var p = token_parsers[token._name];
        return seq2L(cut('token', p),
                     cut('end', not0(item))).parse(token.value, token._state).fmap(function(v) {return v.result;});
    }
    throw new Error('invalid node type: ' + token + JSON.stringify(token));
}


var clean = (function() {

    function cleanSymbol(node) {
        return {
            '_name' : node.type, // keyword, `auto keyword`, reserved, symbol
            '_state': node._state,
            'ns'    : (node.ns ? node.ns.value.join('') : null),
            'name'  : node.name.join('')
        };
    }
    
    function cleanFloat(node) {
        return {
            '_name': node._name,// always `float`, no?
            '_state': node._state,
            'sign': node.sign,
            'int' : node.int.join(''),
            'decimal': node.decimal ? node.decimal.int.join('') : null,
            'exponent': node.exponent ? {'sign': node.exponent.sign, 'power': node.exponent.power.join('')} : null,
            'suffix': node.suffix
        };
    }
    
    function cleanInteger(node) {
        var out = {
                '_name': 'integer',
                '_state': node._state,
                'sign': node.sign,
                'suffix': node.suffix
            },
            v = node.value;
        if ( v._name === 'base8' ) {
            out.base = 8;
            out.digits = node.value.body.join('');
        } else if ( v._name === 'base10' ) {
            out.base = 10;
            out.digits = node.value.first + node.value.rest.join('');
        } else if ( v._name === 'base16' ) {
            out.base = 16;
            out.digits = node.value.body.join('');
        } else if ( v._name === 'baseN' ) {
            out.base = parseInt(node.value.radix.join(''), 10); // not sure if this is the appropriate place to do this
            out.digits = node.value.body.join('');
        } else if ( v._name === 'zero' ) {
            out.base = 10;
            out.digits = '0';
        } else { 
            throw new Error('unrecognized integer subtype');
        }
        return out;
    }
    
    function cleanRatio(node) {
        return {
            '_name': 'ratio',
            '_state': node._state,
            'numerator': node.numerator.join(''),
            'denominator': node.denominator.join(''),
            'sign'       : node.sign
        };
    }
    
    function cleanChar(node) {
        var new_char = {
            '_name': 'char',
            '_state': node._state,
            'value': {'_name': node.value._name}
        };
        switch (node.value._name) {
            case 'long': 
            case 'simple':
                new_char.value.value = node.value.value;
                break;
            case 'unicode':
            case 'octal':
                new_char.value.value = node.value.first + node.value.rest.join('');
                break;
            default:
                throw new Error('invalid char type: ' + JSON.stringify(node));
        }
        return new_char;
    }
    
    function isNotNull(x) {
        return (x !== null);
    }
    
    function cleanString(node) {
        var cs = node.value.map(function(c) {
            if ( c._name === 'char' ) {
                // optimizing for the common case ... unless it gets annoying later ??
                return c.value;
            } else if ( c._name === 'escape' ) {
                var out = {
                    '_name': c.value._name,
                    '_state': c.value._state
                };
                switch ( c.value._name ) {
                    case 'simple': out.value = c.value.value; break;
                    case 'octal': out.value = c.value.digits.filter(isNotNull).join(''); break;
                    case 'unicode': out.value = c.value.value.join(''); break;
                    default: throw new Error('unrecognized escape in string -- ' + c.value._name);
                }
                return out;
            }
            throw new Error('unrecognized char type in string: --' + c._name);
        });
        return {
            '_name' : node._name ,
            '_state': node._state,
            'value' : cs
        };
    }
    
    function cleanRegex(node) {
        return node;
    }
    
    function cleanReserved(node) {
        return node;
    }

    var actions = {
        'symbol'  : cleanSymbol  ,
        'float'   : cleanFloat   ,
        'integer' : cleanInteger ,
        'ratio'   : cleanRatio   ,
        'char'    : cleanChar    ,
        'string'  : cleanString  ,
        'regex'   : cleanRegex   ,
        'reserved': cleanReserved
    };
    
    return function(node) {
        if ( actions.hasOwnProperty(node._name) ) {
            return actions[node._name](node);
        }
        throw new Error('unrecognized node type -- ' + node._name);
    };

})();


function parse(token) {
    var parsed = dirtyParse(token);
    return parsed.fmap(clean);
}


module.exports = {
    'dirtyParse': dirtyParse,
    'clean'     : clean,
    'parse'     : parse,

    '_number': {
        '_integer': {
            'base16' : _base16 ,
            'base8'  : _base8  ,
            'base10' : _base10 ,
            'zero'   : _zero   ,
            'baseN'  : _baseN
        },
        'integer': integer,
        'ratio'  : ratio  ,
        'float'  : float  ,
    },
    
    'number' : number ,
    'char'   : char   ,
    'symbol' : symbol ,
    'regex'  : regex  ,
    'string' : clojure_string
    
};

