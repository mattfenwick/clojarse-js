## Phases ##

 - structure parsing
 
   1. determine start, end of each hierarchical form and token
   
     - errors possible:  first one will terminate parsing
 
   2. clean the tree
 
     - get rid of junk attributes which are just artifacts of the parsing process,
       such as first/rest or arrays instead of strings
 
 - token parsing
 
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
 
 - normalize representation of (some/all) token types
 
   - numbers -- `8r77` -> `63`
   - strings -- `"\u0041"` -> `"A"`
   - chars -- `\u0041` -> `\A`
   - regexes -- ????
   - symbols -- ?? nothing ??

## Additional, questionable phases ##

 - build a 'real' ast
 
   - would special forms and macros have to be recognized?

