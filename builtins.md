# Special forms #

http://clojure.org/special_forms

    (def symbol doc-string? init?)

    (if test then else?)

    (do exprs*)

    (let [bindings* ] exprs*)  ; see http://clojure.org/special_forms#binding-forms

    (quote form) ; same as 'form

    (var symbol) ; same as #'symbol

    (fn name? [params* ] exprs*)
    (fn name? ([params* ] exprs*)+)
    ; since 1.1:
    (fn name? [params* ] condition-map? exprs*)
    (fn name? ([params* ] condition-map? exprs*)+)

    (loop [bindings* ] exprs*)

    (recur exprs*)

    (throw expr)

    (try expr* catch-clause* finally-clause?)

    (monitor-enter x)
    (monitor-exit x)

    (. instance-expr member-symbol)
    (. Classname-symbol member-symbol)
    (. instance-expr (method-symbol args*)) or (. instance-expr method-symbol args*)
    (. Classname-symbol (method-symbol args*)) or (. Classname-symbol method-symbol args*)

    (new Classname args*)

    ; http://clojure.org/java_interop#set
    (set! (. instance-expr instanceFieldName-symbol) expr)
    (set! (. Classname-symbol staticFieldName-symbol) expr)

    ; distinct from above -- see http://clojure.org/vars#set
    (set! var-symbol expr)




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




# Functions #

see http://clojure.github.io/clojure/clojure.core-api.html#clojure.core/&

