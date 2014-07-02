[clolint-js](http://mattfenwick.github.io/clolint-js/)
=================

# Installation #

    npm install clojarse-js


# Examples #

    var c = require('clojarse-js');
    console.log(JSON.stringify(c.parseAst('(a b c)')));


# Strategy #

### parse: structure ###
 
determine start, end of each hierarchical form and token
   
errors possible:  first one will terminate parsing


### parse: tokens ###

determine structure of tokens 

errors possible: what should be done with them?

  - omitted from output tree
    - no evidence of errors in output
    - perhaps surprising, unexpected results
  - filled in with default value
    - will cause incorrect results (i.e. two errors in map keys: duplicate default values)
  - left in as explicitly marked errors
    - probably the best choice as it's the most flexible
    - later traversals will have to take them into account

 
### build AST ###

 - expand built-in reader macros

   - `#'abc` -> `(var abc)`
   - `'qrs` -> `(quote qrs)`
   - `@abc` -> `(clojure.core/deref abc)`
   - `~abc` -> `(clojure.core/unquote abc)`
   - `~@abc` -> `(clojure.core/unquote-splicing abc)`

 - fold metadata into "owner" node
 
 - use ast module for syntax definition

