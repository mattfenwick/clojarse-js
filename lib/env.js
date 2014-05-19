'use strict';


function Env() {
    this._scopes = [];
    this._functions = [];
}

Env.prototype._copy = function() {
    var e = new Env();
    e._scopes = this._scopes;
    e._functions = this._functions;
    return e;
};

Env.prototype.add_scope = function(s) {
    var e = this._copy();
    e._scopes = e._scopes.concat(s);
    return e;
};

Env.prototype.add_function = function(pos) {
    var e = this._copy();
    e._functions = e._functions.slice();
    e._functions.push(pos);
    return e;
};


module.exports = Env;

