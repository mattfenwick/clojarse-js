'use strict';


function Dict(kvs) {
    this.table = Object.create(null);
    for (var key in kvs) {
        this.set(key, kvs[key]);
    }
}

function check(key) {
    var type = typeof key;
    if ( type !== 'string' ) {
        throw new TypeError('expected string in Dict, got: ' + type);
    }
}

Dict.prototype.set = function(key, value) {
    check(key);
    this.table[key] = value;
};

Dict.prototype.has = function(key) {
    check(key);
    return key in this.table;
};

Dict.prototype.get = function(key) {
    if ( !this.has(key) ) {
        throw new Error('key not found in Dict: ' + key);
    }
    return this.table[key];
};

Dict.prototype.remove = function(key) {
    if ( !this.has(key) ) {
        throw new Error('key not found in Dict: ' + key);
    }
    delete this.table[key];
};

Dict.prototype.keys = function() {
    return Object.keys(this.table);
};

Dict.prototype.values = function() {
    return this.keys().map(function(k) {
        return this.table[k];
    });
};

Dict.prototype.items = function() {
    var self = this;
    return this.keys().map(function(k) {
        return [k, self.table[k]];
    });
};


module.exports = Dict;

