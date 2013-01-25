
Clojure   :=  Form(+)
    
Form	  :=  Literal  |  Compound  |  MacroForm

Literal   :=  STRING  |  NUMBER  |  CHAR  |  NIL  |  BOOLEAN  |  KEYWORD

Compound  :=  List  |  Vector  |  Map  |  Set
    
List      :=  '('  Form(+)  ')'
    
Vector    :=  '['  Form(*)  ']'
    
Map       :=  '{'  ( Form  Form )(*)  '}'

Set       :=  '#{'  Form(*)  '}'
        
MacroForm :=  Quote  |  REGEX  |   Function  |  Deref  

Quote     :=  '\''  Form

Function  :=  '#('  Form(+)  ')'

Deref     :=  '@'  Form
