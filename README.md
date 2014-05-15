[clolint-js](http://mattfenwick.github.io/clolint-js/)
=================

# Other resources #

 - [the CCW ANTLR grammar](https://github.com/laurentpetit/ccw) 
 - [the Clojure implementation](https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/LispReader.java)


# Structural parsing #

Goal: correctly break input into tokens and hierarchical forms, but don't
worry about verifying that tokens have the correctly internal structure.
Just make sure the right amount of text is matched for each token.



# Token parsing #

Goal: determine the internal structure of the number, symbol,
char, string, and regex tokens



# Static token constraints #

### String ###

octal escape

 - value must be less than `8r400` 

### Regex ###

 - uses `java.util.regex.Pattern.compile` for definition of accepted input

### Ratio ###

denominator != 0

### Integer ###

custom base: radix must be <= 36, digits must be within range of radix

### Float ###

big decimal overflow/underflow: exponent limited to Java Integer range:
see http://docs.oracle.com/javase/7/docs/api/java/math/BigDecimal.html#BigDecimal(java.lang.String)

### Symbol ###

### Keyword, auto-keyword ###

### Reserved ###

### Char ###

octal escape

 - <= 255
 
unicode escape: value can *not* be between u+D800 and u+DFFF

    \uDFFF              ; -> error
    (first "\uDFFF")    ; -> not an error -- it's okay in strings



# Further constraints #

## Var ##

 - must be a symbol -- [ref](http://clojure.org/special_forms#var)

## Metadata ##

in `^ {} {}`:

 - metadata must be symbol, keyword, auto keyword, string, or map
 - value must implement IMeta
 
invalid:
 
 - `^ 3 {}` 
 - `^ {} 3`

doesn't implement IMeta:

 - number
 - string
 - reserved
 - regex
 - char

not sure:

 - symbol -- but it looks like they can: `(meta (first '(^:a b)))` -> `{:a true}`

does implement IMeta:

 - set
 - function
 - table
 - list
 - vector



# Linting #

## Definitely ##

 - repeated name usage in function or let parameter lists
 
        (defn f [x x] x)
        (fn [x x] x)
        (let [x 1 x 2] x)

 - no nested shorthand functions
 
        #(map #(+ 1 %1) %1)

 - `%...` variables names inside shorthand functions

 - eval reader -- `#=xyz` -- permits only a symbol or a non-empty list
 
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

