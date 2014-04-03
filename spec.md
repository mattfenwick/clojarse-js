
## Tokens ##

 - `(`
 - `)`
 - `[`
 - `]`
 - `{`
 - `}`
 - open-fn: `#(`
 - open-set: `#{`
 - `@`
 - open-var: `#'`
 - meta: `^`
 - meta: `#^`
 - quote: `'`
 - syntax-quote: `\``
 - unquote-splicing: `~@`
 - unquote: `~`
 - string
   - `(= "\n" "\
")`
   - escape
     - `\n`
   - plain char
     - unprintable chars (actual newline, etc.)
 - regex
   - same as string, but for open?

 - number
   - integer examples
     - `0`, `+0`, `-0`
     - base 10: `34N`
     - base 16: `0xabcN`
     - base 8: `+007`
     - custom radix: `36rabcz` (no trailing N)
     - custom radix error: `35rz` (b/c z out of range for base 35)
     - custom radix error: `37rz` (b/c 36 is maximum radix)
     - error: `08`
     - error: `4a`
   - bigint
     - `42N`
   - bigdecimal
     - `42M`
     - error: `42P`
   - float
     - `0.`
     - `0.0000`
     - overflow: `(. Double parseDouble (apply str (range 0 1000)))`
     - underflow: `(. Double parseDouble (apply str (cons "-" (range 0 1000))))`
   - scinum
     - `3e0`
     - `3e-0`
     - `5.e-4`
     - parses, but overflows: `4.2e+892`
     - parses, but underflows: `4.2e-892`
   - integer
     - `-0`
     - `+0`
     - not an integer: `- 0`
     - not an integer: `+ 0`
     - overflow seems impossible, b/c Clojure uses bigints where necessary
   - ratio
     - valid: `3/4`
     - valid: `-3/4`
     - parses, but blows up in evaluation: `4/0`
     - invalid: `3/ 4`
     - ?invalid?: `3 /4`
     - invalid: `3/-4`
     - not an error: `09/8` (surprising because `09` **is** an error)

 - char
   - escape
     - `\newline`
     - `\space`
     - `\tab`
   - ?anything else?
     - `\n` -- the character 'n'
     - `\u` -- 'u'
     - `\\` -- `\`
     - ??? `\	` -- a tab
     - `\ ` -- a space
     - `\
` -- a newline
     - `\` followed by something unprintable??
   - unicode escapes
     - `\u1`, `\u12`, `\u123` -- errors
     - `\u1234` -- valid unicode character

 - nil
   - `nil`

 - boolean
   - `true`
   - `false`

    SymbolHead  :=  /[^\s\d\:\#\'\"\;\@\^\`\~\(\)\[\]\{\}\\]/

    SymbolRest  :=  /[^\s\%\"\;\@\^\`\~\(\)\[\]\{\}\\]/

    SYMBOL      :=  SymbolHead  SymbolRest(*)

 - keyword
   - valid: `:abc`
   - valid (but is it different from above?): `::abc`
   - error: `:::abc`
   - ':'  SymbolRest(*)

 - comment
   - `/(;|#!)[^\n\r\f]*/`

 - whitespace
   - `/[ \t,\n\r\f]+/`

## Special notes ##

 - `/` -- what is it?  (it's a valid form)
 
 - `clojure.core//` -- trailing `//` has something to do with namespaces.
   not sure what it does

 - `\n` is just the 'n' character (ASCII 110), not a newline escape.
   but, "\n" is the one-character string for a newline escape.
   use `\newline` for the newline character

## Characters following tokens ##

Some tokens are sensitive to what they may be followed by.  
They seem to generally require that some or any of the macro, 
whitespace, or punctuation characters follow them.  These tokens are:

 - number
 - char
 - symbol
 - keyword
 - nil
 - boolean

## Hierarchical forms ##

 - `^ {} {}` is valid meta-data, but `^ 3 {}` and `^ {} 3` are not
   there may be a problem in the grammar currently

