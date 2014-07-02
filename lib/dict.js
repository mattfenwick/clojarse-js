'use strict';


function Dict(kvs) {
    this.table = Object.create(null);
    for (var key in kvs) {
        this.set(key, kvs[key]);
    }
}

function check(key) {
    if ( typeof key !== 'string' ) {
        throw new TypeError('expected string in Dict');
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
};

Dict.prototype.remove = function(key) {
    if ( !this.has(key) ) {
        throw new Error('key not found in Dict: ' + key);
    }
    delete this.table[key];
};


module.exports = Dict;

