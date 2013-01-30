Based off of [the CCW ANTLR grammar](https://github.com/laurentpetit/ccw) 
and the [Clojure implementation](https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/LispReader.java).


    OPEN-PAREN    :=  '('
    CLOSE-PAREN   :=  ')'
    OPEN-SQUARE   :=  '['
    CLOSE-SQUARE  :=  ']'
    OPEN-CURLY    :=  '{'
    CLOSE-CURLY   :=  '}'
    OPEN-FN       :=  #(
    OPEN-SET      :=  #{

    AT-SIGN       :=  '@'
    OPEN-VAR      :=  #'
    
    Open-Regex    :=  #"

    Escape      :=  '\\'  ('b' | 't' | 'n' | 'f' | 'r' | '\"' | '\'' | '\\')

    StringBody  :=  ( Escape  |  (not  ( '\\'  |  DQ )) )(*)

    Sq          :=  '\''

    Dq          :=  '"'

    STRING      :=  Dq  StringBody  Dq

    REGEX       :=  Open-Regex  StringBody  Dq

    Float       :=  Integer  '.'  Digit(*)

    SciNum      :=  Float  /e/i  /[-+]/(?)  Integer  

    Integer     :=  Digit(+)

    Ratio       :=  Integer  '/'  Integer

    NUMBER      :=  ( '-'  |  '+' )(?)  ( Float  |  SciNum  |  Integer  |  Ratio  | )

    CHAR        :=  '\\'  ( 'newline'  |  'space'  |  'tab'  |  /./ )    
      (and must be followed by one of:  ( SPACE  |  /";@^`~()[]{}\%/ )
            
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
