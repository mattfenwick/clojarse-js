[clolint-js](http://mattfenwick.github.io/clolint-js/)
=================

# Installation #

    npm install clojarse-js


# Examples #

    var c = require('clojarse-js');
    // first the CST
    console.log(JSON.stringify(c.parseCst('(^a b @c)'), null, 2));
    // now for an AST
    console.log(JSON.stringify(c.parseAst('(^a b @c)'), null, 2));


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

