
var macro = oneOf('";\'@^`~()[]{}\\%#'),

    terminatingMacro = oneOf('";@^`~()[]{}\\'),

    whitespace = oneOf(', \t\n\r'),

    // does this have the right behavior?
    //   not a number: +
    //   number:  +3  4  4abcdefghij
    number = node('number',
        ['sign', oneOf('+-')],
        ['digit', oneOf('0123456789')],
        ['rest', many0(not1(alt(whitespace, macro)))]),

    // seems to be ambiguous with `number` for things like `4a`
    //   but, if `number` tries first ... ??
    // also ambiguous with macro-things (like ;-comments)
    token = node('token', 
        ['first', not1(alt(whitespace, macro))],
        ['rest', many1(not1(alt(whitespace, terminatingMacro)))]),
    
    // outside of a `#()` function, `%...` is just a normal symbol
    // inside, `%`, `%&`, and `%<base 10 integer>` are allowed, but:
    //   - the integer must be between 1 and 20
    //   - other `%...` are illegal
    // this should really be folded into `token` or something
    arg = node('arg',
        ['open', '%'],
        ['rest', many0(not1(alt(whitespace, terminatingMacro)))]);