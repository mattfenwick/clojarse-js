var imports = [
    "libs/maybeerror", "libs/parsercombs",
    "app/tokens", "app/tokenizer",
    "app/ast", "app/parser",
    "app/ast_to_jstree", "app/regexizer"
];

require(imports, function(me, pc, tokens, tokenizer, ast, parser, a2jst, regs) {
    function filterJunk(tokens) {
        return tokens.filter(function(t) {
            return (t.tokentype !== 'space') && (t.tokentype !== 'comment');
        });
    }

    $("#parse").click(function() {
        var text = $("#input").val(),
            result = regs.scanner(text),
            out = $("#tokens"),
            ast = $("#ast");
        out.empty();
        ast.empty();
        out.append("<tr><th>token type</th><th>value</th><th>Line</th><th>Column</th></tr>");
        if(result.status === 'success') {
            var goodTokens = filterJunk(result.value);
            goodTokens.map(function(t) {
                out.append(["<tr><td>", t.tokentype, "</td><td>", t.value, "</td><td>", 
                                        t.meta.line, "</td><td>", t.meta.column, "</td></tr>"].join(''));
            });
            var tree = parser.forms.parse(goodTokens);
            if(tree.status === 'success') { // what about if there's some tokens unconsumed?
                var conned = tree.value.result.map(a2jst.convert);
                ast.jstree({"json_data": {"data": conned},
                                  "plugins" : [ "themes", "json_data", "ui" ]});
            } else {
                alert("parsing failed");
            }
        } else if(result.status === 'error') {
            result.value.tokens.map(function(t) {
                out.append(["<tr><td>", t.tokentype, "</td><td>", t.value, "</td><td>", 
                                        t.meta.line, "</td><td>", t.meta.column, "</td></tr>"].join(''));
            });
            var e = result.value.error;
            out.append(["<tr><td>", "ERROR", "</td><td>", e.message, '</td><td>', e.line, '</td><td>', e.column, '</td></tr>'].join(''));
        } else {
            alert('failure: (no message provided)');
        }
    });
    
    $("#input").val('(f a b\n   [{:language "clojure"\n     :family "lisp"\n     :platform "jvm"} 1 2])');
    $("#parse").click();
});
