'use strict';


function State() {
    this._bindings = {};
}

State.prototype.define = function(name, pos) {
    this._bindings[name] = pos;
};

State.prototype.position = function(name) {
    return this._bindings[name];
};

State.prototype.is_bound = function(name) {
    return this._bindings.hasOwnProperty(name);
};


module.exports = State;

