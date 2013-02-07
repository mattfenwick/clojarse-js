define(["app/tokens"], function (Tokens) {

    return function() {
    
        module("tokens");
        var token = Tokens.Token;
        
        test("number of tokentypes", function() {
            deepEqual(26, Tokens.priorities.length, 'priorities');
            deepEqual(26, Object.keys(Tokens.tokentypes).length, 'tokentypes');
        });
        
        test("token constructors", function() {
            var i = 3,
                tests = Tokens.priorities.map(function(tt) {
                    i++;
                    deepEqual({tokentype: tt, type: 'token', meta: i + 1, value: 'hi: ' + i}, token(tt, 'hi: ' + i, i + 1), tt);
                });
        });
        
        test("invalid token type", function() {
            ok(0, "haven't figured out exception-raising tests yet");
            /*var excepts = [
                [function() {
                    token('blargh?', 'hi');
                }, 'ValueError', 'invalid token type causes exception']
            ];*/
        });

    };

});