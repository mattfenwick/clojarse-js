# Special forms #

[main source](http://clojure.org/special_forms)

In clojure, to check if something is a special form, use `special-symbol?`:

    => (special-symbol? 'letfn*)
    true
    => (special-symbol? 'fn)
    false
    => (special-symbol? '.)
    true


### def ###

    (def symbol doc-string? init?)

 - error: `(def)` -- too few args
 - warning: `(def x)` -- missing init
 - error: `(def x "doc" 4 5)` -- too many args
 
 - error: `(def 3 "abc")` -- need symbol for 2nd arg
 
 - error: `(def x 3 "abc")` -- 4-arg version needs string for 3rd arg

### if ###

    (if test then else?)

 - error: `(if a)` -- too few args
 - warning: `(if a b)` -- missing else-branch
 - error: `(if a b c d)` -- too many args

### do ###

    (do exprs*)

### quote ###

    (quote form) ; same as 'form

 - warning: `(quote)` -- same as `(quote nil)`
 - warning: `(quote 1 2)` -- all but first arg are ignored

### var ###

    (var symbol) ; same as #'symbol

 - error: `(var)`
 - error: `(var 3)` -- 1st arg must be a symbol
 - ?? error: `(var oops)` -- if `oops` is undefined ??
 - warning: `(var abc ghi)` -- all but 1st arg are ignored
 
### recur ###

    (recur exprs*)

 - error: if not in tail position
 - ?? error: if the number of args doesn't match the `loop`/`fn` ??

 - warning: if not in a `loop` or `fn`
   but apparently, it is legal to have something like `(recur)` at the 
   top-level in a module

### throw ###

    (throw expr)

### try ###

    (try expr* catch-clause* finally-clause?)

examples:

    (try)
    (try (throw (new Exception "abc")))
    (try (throw (new Exception "abc"))
         (catch RuntimeException e1)
         (catch Exception e2 e2)
         (finally (println "hi")))

 - subordinate 'special' forms:  only resolved as such inside a `try`, and
   at a particular position inside the `try`:

        (catch classname name expr*)

        (finally expr*)

 - warning: no exprs
 - warning: catches without subordinate exprs
 - warning: finally without a subordinate expr
 - warning: 0 catches and no finally

### monitor-enter & monitor-exit ###

    (monitor-enter x)
    (monitor-exit x)

### . ###

    (. instance-expr member-symbol)
    (. Classname-symbol member-symbol)
    (. instance-expr (method-symbol args*)) or (. instance-expr method-symbol args*)
    (. Classname-symbol (method-symbol args*)) or (. Classname-symbol method-symbol args*)

### new ###

    (new Classname args*)

### set! -- java interop ###

    ; http://clojure.org/java_interop#set
    (set! (. instance-expr instanceFieldName-symbol) expr)
    (set! (. Classname-symbol staticFieldName-symbol) expr)

### set! -- vars ###

    ; distinct from above -- see http://clojure.org/vars#set
    (set! var-symbol expr)

### fn* ###

### let* ###

### loop* ###

### letfn* ###

### case* ###

### clojure.core/import* ###

### deftype* ###

### reify* ###



# Macros #

see http://clojure.org/macros


    (.instanceMember instance args*)
    (.instanceMember Classname args*)
    (Classname/staticMethod args*)
    ; not sure about this one
    Classname/staticField

    (.. instance-expr member+)
    (.. Classname-symbol member+)

    (Classname. args*)

### fn ###

    (fn name? [params* ] exprs*)
    (fn name? ([params* ] exprs*)+)

    ; since 1.1:
    (fn name? [params* ] condition-map? exprs*)
    (fn name? ([params* ] condition-map? exprs*)+)

binding forms: see http://clojure.org/special_forms#binding-forms

### let ###

    (let [bindings* ] exprs*)

### loop ###

    (loop [bindings* ] exprs*)



# Functions #

see http://clojure.github.io/clojure/clojure.core-api.html#clojure.core/&

