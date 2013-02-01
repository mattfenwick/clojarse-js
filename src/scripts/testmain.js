
function runTests(th) {

    var MODULES = [
        'libs/maybeerror',
        'libs/parsercombs',
        'app/tokens',
        'app/tokenizer',
        'app/ast',
        'app/parser',
        'app/ast_to_jstree'
    ];
    
    require(MODULES, function() {
        var mods = Array.prototype.slice.call(arguments);
        mods.map(function(mod, ix) {
            module(MODULES[ix]); // set the qunit module name
            window[MODULES[ix]] = mod; // make the module globally available to allow interactive testing
            mod.tests.map(function(testcase) {
                test(testcase[0], function() {
                    deepEqual(testcase[1], testcase[2]);
                });
            });
            if ( mod.excepts ) {
                mod.excepts.map(function(exc) {
                    test(exc[2], function() {
                        th.expectException(exc[0], exc[1], exc[2]);
                    });
                });
            }
        });
    });
}

runTests(TestHelper);
