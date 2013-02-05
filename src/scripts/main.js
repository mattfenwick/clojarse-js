var imports = [
    "libs/maybeerror", "libs/parsercombs",
    "app/tokens", "app/tokenizer",
    "app/ast", "app/parser",
    "app/ast_to_jstree", "app/regexizer"
];

/* the 'views' */

function renderTokens(elem, tokens) {
    tokens.map(function(t) {
        elem.append(["<tr><td>", t.tokentype, "</td><td>", t.value, "</td><td>", 
                                t.meta.line, "</td><td>", t.meta.column, "</td></tr>"].join(''));
    });
}

function failTokens(elem, result) {
    result.tokens.map(function(t) {
        elem.append(["<tr><td>", t.tokentype, "</td><td>", t.value, "</td><td>", 
                                t.meta.line, "</td><td>", t.meta.column, "</td></tr>"].join(''));
    });
    var e = result.error;
    elem.append(["<tr><td>", "ERROR", "</td><td>", e.message, '</td><td>', e.line, '</td><td>', e.column, '</td></tr>'].join(''));
}

function renderAST(elem, data) {
    elem.jstree({"json_data": {"data": data},
                 "plugins": ["themes", "json_data", "ui"]});
}

function failAST(elem, result) {
    alert("parsing failed");
}

/* end views */

require(imports, function(me, pc, tokens, tokenizer, ast, parser, a2jst, regs) {
    function filterJunk(tokens) {
        return tokens.filter(function(t) {
            return (t.tokentype !== 'space') && (t.tokentype !== 'comment');
        });
    }

    $("#parse").click(function() {
        var text = $("#input").val(),
            result = regs.scanner(text),
            out = $("#tokens > tbody"),
            ast = $("#ast");
        out.empty();
        ast.empty();
        if(result.status === 'success') {
            var goodTokens = filterJunk(result.value);
            renderTokens(out, goodTokens);
            var tree = parser.forms.parse(goodTokens);
            if(tree.status === 'success') { // what about if there's some tokens unconsumed?
                var conned = tree.value.result.map(a2jst.convert);
                renderAST(ast, conned);
            } else {
                failAST(ast, tree.value);
            }
        } else if(result.status === 'error') {
            failTokens(out, result.value);
        } else {
            alert('unexpected failure: (no message provided)');
        }
    });
    
    $("#input").val('(f a b\n   [{:language "clojure"\n     :family "lisp"\n     :platform "jvm"} 1 2])');
    $("#parse").click();
});
