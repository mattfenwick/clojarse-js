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

Goal: determine the internal structure of the number, ident,
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

