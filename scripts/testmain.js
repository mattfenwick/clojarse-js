
var NEW_TESTS = [
    "test/libs/maybeerror", 
    "test/libs/parsercombs",
    'test/app/tokens',
    "test/app/regexizer",
    "test/app/tokenizer",
    'test/app/ast',
    'test/app/parser',
    'test/app/ast_to_jstree',
];

require(["test/helper"], function(helper) {
    require(NEW_TESTS, function() {
        var mods = Array.prototype.slice.call(arguments);
        mods.map(function(mod, ix) {
            mod(helper);
        });
    });
});
