# Phases #

### parse: structure ###
 
   1. determine start, end of each hierarchical form and token
   
     - errors possible:  first one will terminate parsing
 
   2. clean the tree
 
     - get rid of junk attributes which are just artifacts of the parsing process,
       such as first/rest or arrays instead of strings
 
### parse: tokens ###
 
   1. determine structure of tokens 
   
     - errors possible: what should be done with them?
       - omitted from output tree
         - no evidence of errors in output
         - perhaps surprising, unexpected results
       - filled in with default value
         - will cause incorrect results (i.e. two errors in map keys: duplicate default values)
       - left in as explicitly marked errors
         - probably the best choice as it's the most flexible
         - later traversals will have to take them into account
 
   2. clean the token sub-trees
 
     - get rid of junk attributes from token sub-parsing
 
### normalize (some/all) token types ###
 
   - integers -- `8r77` -> `63`
   - floats -- ???
   - ratios -- ???
   - strings -- `"\u0041"` -> `"A"`
   - chars -- `\u0041` -> `\A`
   - regexes -- ???
   - symbols -- ?? nothing ??
   - keywords -- ?? nothing ??
   - auto-keywords -- ?? nothing ??

### expand built-in reader macros ###
 
   - `#'abc` -> `(var abc)`
   - `'qrs` -> `(quote qrs)`
   - `@abc` -> `(clojure.core/deref abc)`
   - `~abc` -> `(clojure.core/unquote abc)`
   - `~@abc` -> `(clojure.core/unquote-splicing abc)`

