var imports = [
    "libs/maybeerror", "libs/parsercombs",
    "app/tokens", "app/tokenizer"
];

require(imports, function(me, pc, tokens, tokenizer) {
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
        } else if(result.status === 'error') {
            alert('error: ' + JSON.stringify(result.value));
        } else {
            alert('failure: (no message provided)');
        }
    });
    
    $("#maketree").click(function() {
        $("#ast").jstree({
			"json_data" : {
				"data" : [{
						"data" : "A node",
						"metadata" : { id : 23 },
						"children" : [ "Child 1", "A Child 2", {data: 'blargh', children: ['a']}],
						state: 'open'
					}, {
						"data" : {
							"title" : "Long format demo"
						}
					}
				]
			},
            "plugins" : [ "themes", "json_data", "ui" ]
        });/**/
    });
});
