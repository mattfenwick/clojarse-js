var imports = [
    "app/parser",
    "app/ast_to_jstree", "app/regexizer",
    "gui/astview", "gui/tokenview"
];

require(imports, function(parser, a2jst, regs, astview, tokenview) {
    function filterJunk(tokens) {
        return tokens.filter(function(t) {
            return (t.tokentype !== 'space') && (t.tokentype !== 'comment');
        });
    }
    
    var ast = new astview($("#ast")),
        tokenView = new tokenview($("#tokens > tbody"));

    $("#parse").click(function() {
        var text = $("#input").val(),
            result = regs.scanner(text);
        if(result.status === 'success') {
            var goodTokens = filterJunk(result.value);
            tokenView.drawTokens(goodTokens);
            var tree = parser.forms.parse(goodTokens);
            if(tree.status === 'success') { // what about if there's some tokens unconsumed?
                var conned = tree.value.result.map(a2jst.convert);
                ast.drawAST(conned);
            } else {
                var e = tree.value;
                ast.error(e.rule, e.meta.line, e.meta.column);
            }
        } else if(result.status === 'error') {
            tokenView.error(result.value.error, result.value.tokens);
            ast.error();
        } else {
            alert('unexpected failure: (no message provided)');
        }
    });
    
    $("#input").val('(f a b\n   [{:language "clojure"\n     :family "lisp"\n     :platform "jvm"} 1 2])');
    $("#parse").click();
});
