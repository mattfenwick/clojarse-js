
    Clojure   :=  Form(+)
        
    Form	  :=  Atom  |  Compound  |  MacroForm
    

    Atom      :=  SYMBOL  |  STRING  |  NUMBER   |  
                  CHAR    |  NIL     |  BOOLEAN  |  
                  KEYWORD |  REGEX
                  

    Compound  :=  List  |  Vector  |  Table  |  Set  |  Function
        
    List      :=  '('  Form(+)  ')'
        
    Vector    :=  '['  Form(*)  ']'
        
    Table     :=  '{'  ( Form  Form )(*)  '}'

    Set       :=  '#{'  Form(*)  '}'
    
    Function  :=  '#('  Form(+)  ')'
    
            
    MacroForm        :=  Quote  |  SyntaxQuote      |  Meta     |
                         Deref  |  UnquoteSplicing  |  Unquote

    Quote            :=  QUOTE  Form

    Deref            :=  AT-SIGN  Form
    
    Meta             :=  META  ( SYMBOL  |  STRING  |  KEYWORD  |  Table )

    SyntaxQuote      :=  SYNTAX-QUOTE  Form
    
    UnquoteSplicing  :=  UNQUOTE-SPLICING  Form
    
    Unquote          :=  UNQUOTE  Form
