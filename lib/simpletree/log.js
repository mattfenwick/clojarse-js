'use strict';


function Log() {
    this._issues = [];
    this._symbol_use = {};
}


// warning or error
Log.prototype.issue = function(e) {
    this._issues.push(e);
};

Log.prototype.symbol = function(ns, name) {
    var full_name = ns ? (ns + "/" + name)
                       : name;
    if ( !this._symbol_use.hasOwnProperty(full_name) ) {
        this._symbol_use[full_name] = 0;
    }
    this._symbol_use[full_name]++;
};


module.exports = Log;

