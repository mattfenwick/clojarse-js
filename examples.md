# Structural parsing #

## Tokens ##

### Comment ###

### Whitespace ###

### Number ###

yes:

    4abc
    4
    +3
    
no:

    +

### Ident ###

### Character ###

### String ###

### Regex ###

### Punctuation ###

## Hierarchical forms ##

### Discard ###

### List ###

### Vector ###

### Table ###

### Quote ###

### Deref ###

### Unquote ###

### Unquote splicing ###

### Syntax quote ###

### Function ###

### Set ###

### Meta ###

### Eval ###

### Var ###

### Unreadable ###

### Other dispatch ###

### Form ###

### Clojure ###




# Token parsers #

## String ##

real newline
   
    (= "\n" "\
    ")
   
octal escapes
   
    "\0"
    "\10"
    "\3\3"
    "\232"

error octal escapes:

    "\9"
    "\400"
    "\3z"


## Regex ##


## Number ##

integer: yes

    0
    +0 
    -0
    34N     ; base 10
    0xabcN  ; base 16
    +007    ; base 8
    36rabcz ; custom radix

integer: no

    01238  

float: yes

    0.
    0.0000
    3e0
    3e-0
    5.e-4

float: no

    .7
    .7e-4
   
ratio: yes

    3/4
    -3/4
    09/8  ; surprising because `09` **is** an error

ratio: no

    3/-4
    3/ 4



## Char ##

corner case yes:

    [\"[]]      ; `[` is a terminating macro, so the char is `\"`.

corner case no: 

    [\"#(vector)]   ; `(` is the first terminating macro (`#` is 
                    ; not a terminating macro), 
                    ; and `\"#` is not a valid character

yes:

    \u0041
    \u
    \o123
    \o
    \o7
    \o007
    \tab

no:

    \u0
    \o400
    \o8
    \o3777
    \tabs



## Symbol/keyword/autokeyword ##

yes:

    :abc                ; keyword, (nil, abc)
    ::abc               ; auto keyword, (nil, abc)
    abc                 ; symbol, (nil, abc)
    x////x              ; symbol, (x, ///x)
    q/a/b               ; symbol, (q, a/b)
    qa                  ; symbol, (nil, qa)
    ::stuff.core/def    ; auto keyword, (stuff.core, def)
    :8/abc              ; keyword, (8, abc)
    :q/a/b              : keyword, (q, a/b)
    clojure.core//      ; symbol, (clojure.core, /)
    /                   ; symbol, (nil, /)
    %234                ; symbol, (nil, %234)

no:

    abc::def
    :::abc
    ////
    /abc
    :/abc
    ::8/abc
    :qrs/
    /ab




# Further constraints #

## Var ##

 - must be a symbol -- [ref](http://clojure.org/special_forms#var)

## Metadata ##

good

    ^ {} {}

bad 
 
    ^ 3 {} 
    ^ {} 3

## Symbol ##

starts with `%`: inside `#(...)`:

 - good
 
        %
        %&
        %<number> -- all numbers allowed -- calls `Number.intValue` to get an int
        %1
        %3.2 -- same as %3
        %8r20 -- same as %16
        abc/%x -- free variable
        abc/%2 -- free variable

 - bad
        
        %0 -- min is 1
        %21 -- max is 20
        %2z -- invalid number
        %abc

starts with `%`: outside `#(...)`:

    %2z
   
## Char ##

bad

    \o400
    \uDFFFF

## Integer ##

    37r3    ; radix must be <= 36
    35rz    ; digits must be within range of radix

## Float ##

overflow/underflow

    4.2e892
    4.2e-892

big decimal overflow/underflow

    4e8000000000M   ; NumberFormatException
    4e-8000000000M  ; NumberFormatException

## Ratio ##

bad

    4/0

## String ##

good

    "\uDFFF"

