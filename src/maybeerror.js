var MaybeError = (function() {
    "use strict";

    var STATUSES = {
        'success': 1,
        'failure': 1,
        'error'  : 1
    };

    function ME(status, value) {
        if(!(status in STATUSES)) {
            throw new Error('invalid MaybeError constructor name: ' + status);
        }
        this.status = status;
        this.value = value;
    }
    
    ME.prototype.fmap = function(f) {
        if(this.status === 'success') {
            return new ME('success', f(this.value));
        }
        return this;
    };
    
    ME.pure = function(x) {
        return new ME('success', x);
    };
    
    ME.prototype.ap = function(y) {
        if(this.status === 'success') {
            return y.fmap(this.value);
        }
        return this;
    }
    
    ME.prototype.bind = function(f) {
        if(this.status === 'success') {
            return f(this.value);
        }
        return this;
    }
    
    ME.error = function(e) {
        return new ME('error', e);
    };
    
    ME.prototype.mapError = function(f) {
        if(this.status === 'error') {
            return ME.error(f(this.value));
        }
        return this;
    };
    
    ME.prototype.plus = function(that) {
        if(this.status === 'failure') {
            return that;
        }
        return this;
    };
    
    ME.zero = new ME('failure', undefined);
    
    return ME;

})();