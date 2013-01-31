Based off of [the CCW ANTLR grammar](https://github.com/laurentpetit/ccw) 
and the [Clojure implementation](https://github.com/clojure/clojure/blob/master/src/jvm/clojure/lang/LispReader.java).

Some tokens are sensitive to what they may be followed by.  
They seem to generally require that some or any of the macro, 
whitespace, or punctuation characters follow them.  These tokens are:

 - number
 - char
 - symbol
 - keyword
 - nil
 - boolean


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
            
    NIL         :=  'nil'
        
    BOOLEAN     :=  'true'  |  'false'

    SymbolHead  :=  /[a-zA-Z\*\+\!\-\_\?\>\<\=\$]/

    SymbolRest  :=  SymbolHead  |  Digit  |  '.'  |  '/'

    SYMBOL      :=  SymbolHead  SymbolRest(*)

    KEYWORD     :=  ':'  SYMBOL

    Newline     :=  '\n'  |  '\r'  |  '\f'

    COMMENT     :=  ( ';'  |  '#!' )  (not Newline)(*)

    SPACE       :=  ( ' '  |  '\t'  |  ','  |  Newline )(+)
