[clolint-js](http://mattfenwick.github.io/clolint-js/)
=================

# Other resources #

 - [the CCW ANTLR grammar](https://github.com/laurentpetit/ccw) 
 - [the Clojure implementation](https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/LispReader.java)


# Structural parsing #

Goal: correctly break input into tokens and hierarchical forms, but don't
worry about verifying that tokens have the correctly internal structure.
Just make sure the right amount of text is matched for each token.

## Tokens ##

Definitions:

   - macro character: one of ``` ";@^`~()[]{}\'%# ```
   
   - terminating macro character: one of ``` ";@^`~()[]{}\ ```

### Comment ###

   - open: `/(;|#!)/`
   - value: `/[^\n\r\f]*/`

### Whitespace ###

   - value: `/[ \t,\n\r\f]+/`

Also, everything else that Java's `Character.isWhitespace` considers to be whitespace.


### Number ###

   - sign:  `/[-+]?/`
   - first: `/\d/`
   - rest: `(not1  ( whitespace  |  macro ) )(*)`

Examples

    // yes
    4abc
    4
    +3
    
    // no
    +

### Symbol ###

   - first:  `(not1  ( whitespace  |  macro ) )  |  '%'`
   - rest:  `(not1  ( whitespace  |  terminatingMacro ))(*)`

Why does this include `%...`?  
Because: outside of a `#()` function, `%...` is just a normal symbol.

### Character ###

   - open: `\\`
   - first: `.`
   - rest: `(not1  ( whitespace  |  terminatingMacro ) )(*)`

### String ###

   - open: `"`
   - body: `/([^\\"]|\\.)*/` -- `.` includes newlines
   - close: `"`

This is only approximately correct.  how could it go wrong?

### Regex ###

   - open: `#"`
   - body: `/([^\\"]|\\.)*/` -- `.` includes newlines
   - close: `"`

### Punctuation ###

 - `(`
 - `)`
 - `[`
 - `]`
 - `{`
 - `}`
 - `@`
 - `^`
 - `'`
 - ``` ` ```
 - `~@`
 - `~`
 - #-dispatches
   - `#(`
   - `#{`
   - `#^`
   - `#'`
   - `#=`
   - `#_`
   - `#<` -- ??? unreadable reader ???
   - error: `#` followed by anything else (except for `#!` and `#"`)

## Hierarchical forms ##

Whitespace, comments and discard forms (`#_`) can appear in any amount
between tokens.

### Discard ###

   - open: `#_`
   - value: `Form`

### List ###

   - open: `(`
   - body: `Form(*)`
   - close: `)`

### Vector ###

   - open: `[`
   - body: `Form(*)`
   - close: `]`

### Table ###

   - open: `{`
   - body: `Form(*)`
   - close: `}`

### Quote ###

   - open: `'`
   - value: `Form`

### Deref ###

   - open: `@`
   - value: `Form`

### Unquote ###

   - open: `~`
   - value: `Form`

### Unquote splicing ###

   - open: `~@`
   - value: `Form`

### Syntax quote ###

   - open: ``` ` ```
   - value: `Form`

### Function ###

   - open: `#(`
   - body: `Form(*)`
   - close: `)`

### Set ###

   - open: `#{`
   - body: `Form(*)`
   - close: `}`

### Meta ###

   - open: `'^'  |  '#^'`
   - metadata: `Form`
   - value: `Form`

### Eval ###

   - open: `#=`
   - value: `Form`

### Var ###

   - open: `#'`
   - value: `Form`

### Unreadable ###

   - open: `#<`
   - value: ??????????

### Other dispatch ###

   - open: `/#./`
   - value: ???????????

### Form ###

     String  |  Number  |  Char  |  Symbol  |  Regex     |
     List    |  Vector  |  Set   |  Table   |  Function  |
     Deref   |  Quote   |  Unquote  |  UnquoteSplicing   |
     SyntaxQuote  |  Meta  |  Eval  |  Var

Order in which they're tried does seem to be important for some cases, since
a given input might match multiple patterns:

  - Number before Symbol

### Clojure ###

    Form(*)



# Token sub-parsers #

## String ##

Syntax

   - escape
   
       - open: `\`

       - error: next char matches `/[^btnfr\\"0-7u]/`
   
       - value
       
         - simple
           - `/[btnfr\\"]/`

         - octal
           - `/[0-7]{1,3}/`
           - stops when: 3 octal characters parsed, or whitespace hit,
             or macro character hit
           - error: digit is 8 or 9
           - error: hasn't finished, but encounters character which is not
           whitespace, octal, or macro

         - unicode
           - `/u[0-9a-zA-Z]{4}/`
           - error: less than four hex characters found

   - `/[^\\"]/`: plain character (not escaped)

     - what about ?? unprintable chars (actual newline, etc.) ??

Notes

   - macro and whitespace characters have special meaning inside strings:
     they terminate octal and unicode escape sequences
   - octal and unicode escapes use Java's `Character.digit` and
     `Character.isDigit`, so they seem to work on other forms of digits,
     such as u+ff13

            "\uＡＢＣＤ" is the 1 character string "ꯍ"
            // b/c each of ＡＢＣＤ is a digit according to Character.digit(ch, 16)


Examples

   - real newline
   
        (= "\n" "\
        ")
   
   - octal escapes
   
     - good: \0, \10, \3\3 \232
     - bad: \9, \400, \3z 


## Regex ##

Syntax
 
   - real escape: `/\\[\\"]/`
   - fake escape: `/\\[^\\"]/`
     so-called because both characters get included in output

Notes

Examples


## Number ##

Syntax

   - ratio

       - sign: `/[-+]?/`
       - numerator: `/[0-9]+/`
       - slash: `/`
       - denominator: `/[0-9]+/`

   - float

       - sign: `/[-+]?/`
       - int: `/[0-9]+/`
       - decimal (optional)
           - dot: `.`
           - int: `/[0-9]*/`
       - exponent (optional)
           - e: `/[eE]/`
           - sign: `/[+-]?/`
           - power: `/[0-9]+/`
       - suffix
           - `/M?/`

   - integer

       - sign: `/[+-]?/`
       - body
          - base16
              - `/0[xX]hex+/
              - where `hex` is `/[0-9a-zA-Z]/`
          - base8 (not sure about this)
              - `/0[0-7]+/`
              - error: `08`
          - base(2-36)
              - `/[1-9][0-9]?[rR][0-9a-zA-Z]+/`
          - base10
              - `/[1-9][0-9]*/`
       - bigint suffix: `/N?/`

Notes

   - apparently, can't apply bigint suffix to base(2-36)


Examples

  - integer
  
    - `0`, `+0`, `-0`
    - base 10: `34N`
    - base 16: `0xabcN`
    - base 8: `+007`
    - custom radix: `36rabcz`

  - float

    - `0.`
    - `0.0000`
    - `3e0`
    - `3e-0`
    - `5.e-4`
   
  - ratio

    - valid: `3/4`
    - valid: `-3/4`
    - valid: `09/8` (surprising because `09` **is** an error)
    - invalid: `3/-4`

## Char ##

   - open: `\`
   
   - value
      - long escape
        - `newline`
        - `space`
        - `tab`
        - `backspace`
        - `formfeed`
        - `return`

      - unicode escape -- *not* identical to string's unicode escape
        - `XXXX` where X is a hex character
        - hex characters defined by Java's `Character.digit(<some_int>, 16)`
          - includes some surprises!

      - octal escape
        - `oX`, `oXX`, or `oXXX` where X is an octal character
        - octal characters defined by Java's `Character.digit(<som_int>, 8)`
          - includes surprises!
        - value must be between 0 and 255 (8r377)

      - simple character (not escaped)
        - any character, including `n`, `u`, `\`, an actual tab, space, newline
        - what about unprintable characters?

Okay: `[\"[]]` -- `[` is a terminating macro, so the char is `\"`.

Not okay: `[\"#(vector)]` -- `(` is the first terminating macro (`#` is 
 not a terminating macro), and `\"#` is not a valid character.


Examples

 - good:
    - `\u0041`
    - `\u`
    - `\o123`
    - `\o`
    - `\o7`
    - `\o007`
    - `\tab`
 - bad:
    - `\u0`
    - `\o400`
    - `\o8`
    - `\o3777`
    - `\tabs` 


## Symbol ##

Syntax

   - special errors
     - `::` anywhere but at the beginning
     - if it matches `/([:]?)([^\d/].*/)?(/|[^\d/][^/]*)/`, and:
       - `$2 =~ /:\/$/` -> error
       - `$3 =~ /:$/` -> error

   - value
     - reserved
       - `nil`
       - `true`
       - `false`

     - not reserved
        - type: starts with:
          - `::` -- auto keyword
          - `:`  -- keyword
          - else -- symbol

        - namespace (optional)
          - `/[^/]+/`
          - `/`
       
        - name
          - `/.+/`
   
   - code used to verify against implementation:
   
        (fn [my-string]
          (let [f (juxt type namespace name)]
            (try 
              (f (eval (read-string my-string)))
              (catch RuntimeException e 
                (.getMessage e)))))
 
Examples

    input:  abc::def
    Invalid token: abc::def

    input:  abc
    java.lang.RuntimeException: Unable to resolve symbol: abc in this context, compiling:(/tmp/form-init7040393767260359100.clj:1:130)

    input:  :abc
    [clojure.lang.Keyword nil abc]

    input:  ::abc
    [clojure.lang.Keyword user abc]

    input:  'abc
    [clojure.lang.Symbol nil abc]

    input:  :::abc
    Invalid token: :::abc

    input:  '%234
    [clojure.lang.Symbol nil %234]

    input:  '////
    Invalid token: ////

    input:  'x////x
    [clojure.lang.Symbol x ///x]

    input:  'q/a/b
    [clojure.lang.Symbol q a/b]

    input:  'qa
    [clojure.lang.Symbol nil qa]

    input:  ::stuff.core/def
    [clojure.lang.Keyword stuff.core def]

    input:  '/abc
    Invalid token: /abc

    input:  :/abc
    Invalid token: :/abc

    input:  :8/abc
    [clojure.lang.Keyword 8 abc]

    input:  ::8/abc
    Invalid token: ::8/abc

    input:  :qrs/
    Invalid token: :qrs/

    input:  :q/a/b
    [clojure.lang.Keyword q a/b]

    input:  'clojure.core//
    [clojure.lang.Symbol clojure.core /]

    input:  '/
    [clojure.lang.Symbol nil /]

    input:  '/ab
    Invalid token: /ab

## Special notes ##

 - `\n`
   - in a character: just the 'n' character (ASCII 110), not a newline escape
   - in a string: the one-character string for a newline escape
   - use `\newline` for the newline character

# Further constraints #

## Metadata ##

 - `^ {} {}` is valid meta-data, but `^ 3 {}` and `^ {} 3` are not

## Symbol ##

   - keywords
     - auto vs ?not?-auto
       - multiple ways to get the same thing

                abc=> (set [::s :s ::abc/s :abc/s])
                #{:abc/s :s}
    
     - `::abc/def` apparently is only valid when there's an `abc` namespace
     -  `:abc/def` apparently is always valid
     - when there *is* an `abc` namespace, `(= :abc/def ::abc/def)` is true

   - starts with `%`
      - inside `#(...)`: 
        - okay: `%`, `%&`
        - okay: `%<number>` -- all numbers allowed -- calls `Number.intValue` to get an int
          - okay: `%1`
          - okay: `%3.2`  -- same as `%3`
          - okay: `%8r20` -- same as `%16`
          - error: `%0`  -- min is 1
          - error: `%21` -- max is 20
          - error: `%2z` -- invalid number
        - okay: `abc/%x`, `abc/%2` -- resolve to free variables
        - error: `%abc`
      - outside #(...):
        - `%2z` -> okay
   
## Char ##

  - unicode escape
    - value can *not* be between u+D800 and u+DFFF
      - `\uDFFF` -> error
      - `(first "\uDFFF")` -> not an error

  - octal escape
    - value can not be greater than `8r377`

## Number ##

  - integer
  
     - integer overflow seems impossible, b/c Clojure uses bigints where necessary
     - max radix of 36
       - error: `37rz` (b/c 36 is maximum radix)
     - digits after `/[rR]/` must correspond to range of radix
       - error: `35rz` (b/c z out of range for base 35)

  - float

    - overflow: `(. Double parseDouble (apply str (range 0 1000)))`
    - underflow: `(. Double parseDouble (apply str (cons "-" (range 0 1000))))`
    - but overflows: `4.2e+892`
    - but underflows: `4.2e-892`
   
  - ratio

    - blows up: `4/0`

## String ##

  - octal escape
  
    - value must be less than `8r400` 



# Creating values (done with syntax) #

String

Regex

 - uses `java.util.regex.Pattern.compile` for definition of accepted input

Number

 - ratio: denominator != 0
 - baseN: digits within range of radix, radix <= 36

Symbol

Keyword, auto-keyword

Reserved

Char

 - octal escape: <= 255



# Linting #

## Definitely ##

 - repeated name usage in function or let parameter lists
 
        (defn f [x x] x)
        (fn [x x] x)
        (let [x 1 x 2] x)

## Not sure ##

  - variables defined, used, used but not defined, defined but not used
  - formatting -- consistent indentation
  - ?shadowing?
  - known special forms and functions: correct syntax used
  - maximum number of function parameters, maximum nesting level
  - operator position is treated specially with respect to special forms:
  
        (let [def 1] def)        ; ==> okay
        
        ((fn [def] (def 2 3)) +) ; ==> error

## Potential warnings ##

Breaking these isn't illegal, but may indicate an error even if the syntax is okay,
or may cause an undetected error which confusingly doesn't show up until later:

  - string, regex, number, symbol, char followed by whitespace

