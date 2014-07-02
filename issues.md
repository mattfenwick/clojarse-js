what I'm currently facing:

 - would like to have a module which implements the syntax of the parse tree
   motivation: I'm using this syntax definition in multiple places (normal
     modules as well as test modules), might as well factor it out
   description: between the cst -- b/c tree is "cleaned" -- and ast

 - would like to have close position for hierarchical forms

 - `#java.lang.String["abc"]` is valid syntax for a call to a java constructor,
   or something defined with deftype or defrecord

 - improper chars and chars in strings -- some escapes are disallowed (which ones?)

 - parse regexes: use `java.util.regex.Pattern.compile`

 - char octal escape: <= 255
 
 - unicode escape: value can *not* be between u+D800 and u+DFFF

        \uDFFF              ; -> error
        (first "\uDFFF")    ; -> not an error -- it's okay in strings


my mistakes:
 - the wrong positions are getting passed in to start some of the token parsers:
   - the position passed in is of the 1st " in `"abc"`
   - but, the token parsing starts at the a in `"abc"`
   - this is because the delimiters `"` are assumed to already be correct
     by the time token parsing is started

