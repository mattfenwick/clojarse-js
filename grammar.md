
    Clojure   :=  Form(+)
        
    Form	  :=  Atom  |  Compound  |  MacroForm

    Atom      :=  SYMBOL  |  STRING  |  NUMBER  |  CHAR  |  NIL  |  BOOLEAN  |  KEYWORD

    Compound  :=  List  |  Vector  |  Table  |  Set
        
    List      :=  '('  Form(+)  ')'
        
    Vector    :=  '['  Form(*)  ']'
        
    Table     :=  '{'  ( Form  Form )(*)  '}'

    Set       :=  '#{'  Form(*)  '}'
            
    MacroForm :=  Quote  |  REGEX  |   Function  |  Deref  

    Quote     :=  '\''  Form

    Function  :=  '#('  Form(+)  ')'

    Deref     :=  '@'  Form
