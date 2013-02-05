
var NEW_TESTS = [
    "test/libs/maybeerror", 
    "test/libs/parsercombs",
    'test/app/tokens',
    "test/app/regexizer",
    "test/app/tokenizer",
    'test/app/parser',
    'test/app/ast_to_jstree'
//        'app/ast', // TODO no tests yet
];

require(NEW_TESTS, function() {
    var mods = Array.prototype.slice.call(arguments);
    mods.map(function(mod, ix) {
        mod();
    });
});
