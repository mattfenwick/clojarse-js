[clojarse-js](http://mattfenwick.github.io/clojarse-js/)
=================

A pure Javascript library for parsing Clojure code into trees.


# Installation #

    npm install clojarse-js



# Examples #

    var c = require('clojarse-js');
    // first the CST
    console.log(JSON.stringify(c.parseCst('(^a b @c)'), null, 2));
    // now for an AST
    console.log(JSON.stringify(c.parseAst('(^a b @c)'), null, 2));



# Caveats #

The goal is to parse a superset of Clojure's syntax.  Therefore, some things
which clojarse-js parses may be invalid from Clojure's point of view.



# Strategy #

### parse: structure ###
 
determine start, end of each hierarchical form and token
   
errors possible:  first one will terminate parsing



### parse: tokens ###

determine structure of tokens 

errors possible: will be in output tree


 
### build AST ###

 - expand built-in reader macros

   - `#'abc` -> `(var abc)`
   - `'qrs` -> `(quote qrs)`
   - `@abc` -> `(clojure.core/deref abc)`
   - `~abc` -> `(clojure.core/unquote abc)`
   - `~@abc` -> `(clojure.core/unquote-splicing abc)`

 - fold metadata into "owner" node

Errors are not expected -- any errors should represent bugs.

