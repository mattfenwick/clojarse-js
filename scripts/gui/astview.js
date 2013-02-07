define(function() {

    function errorTemplate(rule, line, column) {
        return ['<div class="error">',
            'parse error',
            '<div class="rule">rule: ', rule, '</div>',
            '<div class="line">line: ', line, '</div>',
            '<div class="column">column: ', column, '</div>',
            '</div>'].join('');
    }

    function ASTView(elem) {
        this.elem = elem;
    }
    
    ASTView.prototype.drawAST = function(data) {
        this.elem.jstree({"json_data": {"data": data},
                          "plugins": ["themes", "json_data", "ui"]});
    };
    
    ASTView.prototype.error = function(rule, line, column) {
        this.elem.empty();
        this.elem.append(errorTemplate(rule, line, column));
    }

    return ASTView;

});