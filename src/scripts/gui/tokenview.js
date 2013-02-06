define(function() {

    function TokenView(elem) {
        this.elem = elem;
    }
    
    TokenView.prototype.drawRow = function(ttype, val, line, col) { 
        this.elem.append(["<tr><td>", ttype, 
                          "</td><td>", val, 
                          "</td><td>", line, 
                          "</td><td>", col, 
                          "</td></tr>"].join(''));
    };
    
    TokenView.prototype.drawTokens = function(tokens) {
        var self = this;
        self.elem.empty();
		tokens.map(function(t) {
		    self.drawRow(t.tokentype, t.value, t.meta.line, t.meta.column);
        });
    }

    TokenView.prototype.error = function(e, tokens) {
        var self = this;
        self.elem.empty();
        tokens.map(function(t) {
            self.drawRow(t.tokentype, t.value, t.meta.line, t.meta.column);
        });
        self.drawRow("ERROR", e.message, e.line, e.column);
    };

    return TokenView;

});