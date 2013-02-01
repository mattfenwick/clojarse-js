var imports = [
    "libs/maybeerror", "libs/parsercombs",
    "app/tokens", "app/tokenizer",
    "app/ast", "app/parser",
    "app/ast_to_jstree"
];

require(imports, function(me, pc, tokens, tokenizer, ast, parser, a2jst) {
    function filterJunk(tokens) {
        return tokens.filter(function(t) {
            return (t.tokentype !== 'space') && (t.tokentype !== 'comment');
        });
    }

    $("#doit").click(function() {
        var text = $("#clojure").val(),
            result = tokenizer.scanner.parse(text),
            out = $("#output");
        out.empty();
        out.append("<tr><th>token type</th><th>value</th></tr>");
        if(result.status === 'success') {
            result.value.result.map(function(t) {
                out.append(["<tr><td>", t.tokentype, "</td><td>", t.value, "</td></tr>"].join(''));
            });
            var tree = parser.forms.parse(filterJunk(result.value.result));
            if(tree.status === 'success') {
                var conned = tree.value.result.map(a2jst.convert);
                $("#ast").jstree({"json_data": {"data": conned},
                                  "plugins" : [ "themes", "json_data", "ui" ]});
            } else {
                alert("parsing failed");
            }
        } else if(result.status === 'error') {
            alert('error: ' + JSON.stringify(result.value));
        } else {
            alert('failure: (no message provided)');
        }
    });
    
});
