
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
   - integer
     - syntax
       - sign: `/[+-]?/`
       - body: base8, base16, base(2-36), base10
       - suffix: `/N?/`
       
     - examples
        - `0`, `+0`, `-0`
        - base 10: `34N`
        - base 16: `0xabcN`
        - base 8: `+007`
        - custom radix: `36rabcz` (no trailing N)
        - custom radix error: `35rz` (b/c z out of range for base 35)
        - custom radix error: `37rz` (b/c 36 is maximum radix)
        - error: `08`
        - error: `4a`
        - not an integer: `- 0`
        - not an integer: `+ 0`
        - overflow seems impossible, b/c Clojure uses bigints where necessary
   
     - base16
       - `/0[xX]hex+/
       - where `hex` is `/[0-9a-zA-Z]/`
       
     - base8 (not sure about this)
       - `/0[0-7]+/`
       
     - base(2-36)
       - `/[1-9][0-9]?[rR][0-9a-zA-Z]+/
       - max radix of 36
       - digits after `/[rR]/` must correspond to range of radix
     
     - base10
       - `/[1-9][0-9]*/`

     - bigint suffix
       - `42N`
       - apparently, can't apply to base(2-36)

   - float
     - bigdecimal
       - `42M`
       - error: `42P`
    - examples
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

   - ratio
     - examples
        - valid: `3/4`
        - valid: `-3/4`
        - parses, but blows up in evaluation: `4/0`
        - invalid: `3/ 4`
        - ?invalid?: `3 /4`
        - invalid: `3/-4`
        - not an error: `09/8` (surprising because `09` **is** an error)

 - char
   - long escape
     - `\newline`
     - `\space`
     - `\tab`
     - `\backspace`
     - `\formfeed`
     - `\return`

   - unicode escape -- *not* identical to string's unicode escape
     - `\uXXXX` where X is a hex character
     - hex characters defined by Java's `Character.digit(<some_int>, 16)`
       - includes some surprises!
     - value can *not* be between u+D800 and u+DFFF
       - `\uDFFF` -> error
       - `(first "\uDFFF")` -> not an error

   - octal escape
     - `oX`, `oXX`, or `oXXX` where X is an octal character
     - octal characters defined by Java's `Character.digit(<som_int>, 8)`
       - includes surprises!
     - value can not be greater than `8r377`

   - simple character (not escaped)
     - any character, including `n`, `u`, `\`, an actual tab, an actual space,
       an actual newline
     - what about unprintable characters?

 - symbol
   - keywords
     - auto vs ?not?-auto
       - multiple ways to get the same thing

        abc=> (set [::s :s ::abc/s :abc/s])
        #{:abc/s :s}
    
     - `::abc/def` apparently is only valid when there's an `abc` namespace
     -  `:abc/def` apparently is always valid
     - when there *is* an `abc` namespace, `(= :abc/def ::abc/def)` is true

   - special errors
     - `::` anywhere but at the beginning
     - if it matches `/([:]?)([^\d/].*/)?(/|[^\d/][^/]*)/`
       - `$2 =~ /:\/$/` -> error
       - `$3 =~ /:$/` -> error

   - starts with `%`
      - inside `#(...)`: 
        - `%2z` -> error (invalid number)
        - `%abc` -> error
        - `%3.2` -> okay, same as `%3`
        - `%21` -> error, max is 20
        - `%8r20` -> okay, same as `%16`
        - `abc/%x`, `abc/%2` are both okay -- resolves to free variables
      - outside #(...):
        - `%2z` -> okay
   
   - reserved
     - `nil`
     - `true`
     - `false`

   - type: starts with:
     - `::` -- auto keyword
     - `:`  -- keyword
     - else -- symbol

   - namespace
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
 
   - examples
   
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

 - comment
   - `/(;|#!)[^\n\r\f]*/`

 - whitespace
   - `/[ \t,\n\r\f]+/`

## Special notes ##

 - `\n`
   - in a character: just the 'n' character (ASCII 110), not a newline escape.
   - in a string: the one-character string for a newline escape.
   - use `\newline` for the newline character

## Hierarchical forms ##

 - `^ {} {}` is valid meta-data, but `^ 3 {}` and `^ {} 3` are not
   there may be a problem in the grammar currently

