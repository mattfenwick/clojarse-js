Based off of [the CCW ANTLR grammar](https://github.com/laurentpetit/ccw) 
and the [Clojure implementation](https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/LispReader.java).

Deviations:
 - no metadata
 - syntaxquote/unquotesplicing/unquote/quote
 - symbols aren't able to use full range of characters
 - doesn't track whether you're in a shorthand anonymous function


OPEN-PAREN    :=  '('
CLOSE-PAREN   :=  ')'
OPEN-SQUARE   :=  '['
CLOSE-SQUARE  :=  ']'
OPEN-CURLY    :=  '{'
CLOSE-CURLY   :=  '}'
AT-SIGN       :=  '@'
OPEN-VAR      :=  #'
OPEN-REGEX    :=  #"
OPEN-FN       :=  #(
OPEN-SET      :=  #{

Escape      :=  '\\'  ('b' | 't' | 'n' | 'f' | 'r' | '\"' | '\'' | '\\')

StringBody  :=  ( Escape  |  (not  ( '\\'  |  DQ )) )(*)

SQ          :=  '\''

DQ          :=  '"'

STRING      :=  DQ  StringBody  DQ

REGEX       :=  OPEN-REGEX  StringBody  DQ

Float       :=

Integer     :=

Ratio       :=

NUMBER      :=  Float  |  Integer  |  Ratio  |  ???

CHAR        :=  '\\'  ( 'newline'  |  'space'  |  'tab'  |  ( 'u'  HexDigit(4) )  |  /./ )
        
NIL         :=  'nil'
    
BOOLEAN     :=  'true'  |  'false'

SymbolHead  :=   /[a-zA-Z\*\+\!\-\_\?\>\<\=\$]/

SymbolRest  :=   SymbolHead  |  Digit  |  '.'

SymbolPart  :=  SymbolHead  SymbolRest(*)

SYMBOL      :=  '::'(?)  SymbolPart  ( '/'  SymbolPart)(*)

KEYWORD     :=  ':'  SYMBOL

Newline     :=  '\n'  |  '\r'  |  '\f'

COMMENT     :=  ( ';'  |  '#!' )  (not Newline)(*)  Newline(?)

SPACE       :=  ( ' '  |  '\t'  |  ','  |  Newline )(+)
