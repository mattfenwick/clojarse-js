
function runTests() {

    var MODULES = [
        'libs/maybeerror',
        'libs/parsercombs'
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
        });
    });
}


runTests(); // um ... why?