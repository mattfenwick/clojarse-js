"use strict";

// I don't think the stack order matters
// ReaderT r (WriterT w (StateT s Id)) a
// 
// r -> s -> (s, (w, a))
function RWS(f) {
    if ( typeof f !== 'function' ) {
        throw new Error('RWS needs a function');
    }
    this.f = f;
}

function result(state, log, value) {
    return {
        'state': state,
        'log': log,
        'value': value
    };
}

RWS.pure = function(x) {
    function f(env, state) {
        return result(state, [], x);
    }
    return new RWS(f);
};

RWS.fmap = function(f, rws) {
    function g(env, state) {
        var out1 = rws.f(env, state);
        return result(out1.state, out1.log, f(out1.value));
    }
    return new RWS(g);
};

RWS.seq = function() {
    var rwss = Array.prototype.slice.call(arguments),
        log = [],
        vals = [],
        r;
    function f(env, state) {
        for (var i = 0; i < rwss.length; i++) {
            r = rwss[i].f(env, state);
            state = r.state;
            log = log.concat(r.log);
            vals.push(r.value);
        }
        return result(state, log, vals);
    }
    return new RWS(f);
};

// (r -> s -> (s, (w, a)) -> (a -> r -> s -> (s, (w, b))) -> (r -> s -> (s, (w, b)))
RWS.bind = function(rws, f) {
    function g(env, state) {
        var out1 = rws.f(env, state),
            out2 = f(out1.value)(env, out1.state);
        return result(out2.state, out1.log.concat(out2.log), out2. value);
    }
    return new RWS(g);        
};

RWS.write = function(x) {
    function f(env, state) {
        return result(state, [x], null);
    }
    return new RWS(f);
};

RWS.local = function(f_r, rws) {
    function g(env, state) {
        return rws.f(f_r(env), state);
    }
    return new RWS(g);
};

RWS.ask = new RWS(function(env, state) {
    return result(state, [], env);
});

RWS.get = new RWS(function(env, state) {
    return result(state, [], state);
});

RWS.put = function(s) {
    return RWS.update(function(_old_state) {
        return s;
    });
};

RWS.update = function(f) {
    function g(env, state) {
        return result(f(state), [], null);
    }
    return new RWS(g);
};


module.exports = RWS;

