## Phases ##

 - structure parsing
 
   1. determine start, end of each hierarchical form and token (errors possible)
 
   2. clean the tree
 
     - get rid of junk attributes which are just artifacts of the parsing process,
       such as first/rest or arrays instead of strings
 
 - token parsing
 
   1. determine structure of tokens  (errors possible)
 
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

