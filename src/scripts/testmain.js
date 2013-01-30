
function runTests(th) {

    var MODULES = [
        'libs/maybeerror',
        'libs/parsercombs',
        'app/tokens',
        'app/tokenizer'
    ];
    
    require(MODULES, function() {
        var mods = Array.prototype.slice.call(arguments);
        mods.map(function(mod, ix) {
            module(MODULES[ix]); // set the qunit module name
            mod.tests.map(function(testcase) {
                test(testcase[0], function() {
                    deepEqual(testcase[1], testcase[2]);
                });
            });
            if ( mod.excepts ) {
                mod.excepts.map(function(exc) {
                    test('oops', function() {
                        th.expectException(exc[0], exc[1], exc[2]);
                    });
                });
            }
        });
    });
}


runTests(TestHelper);