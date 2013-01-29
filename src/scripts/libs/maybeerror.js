define(function() {
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
    
    
    /* tests */
    
    ME.tests = (function() {
        function f(x) {return x + 5;}

        function g(x) {
            if(x > 2) return ME.pure(x * 2);
            return ME.zero;
        }
        
        return [
            ['constructor -- success', new ME('success', [2, 'hi']),   ME.pure([2, 'hi'])],
            ['constructor -- success', [1,2,3],                        ME.pure([1,2,3]).value],
            ['constructor -- failure', new ME('failure'),              ME.zero],
            ['constructor -- failure', undefined,                      ME.zero.value],
            ['constructor -- error',   new ME('error', 'oopsy-daisy'), ME.error('oopsy-daisy')],
            ['constructor -- error',   'message',                      ME.error('message').value],
            ['fmap', ME.pure(13),     ME.pure(8).fmap(f)       ],
            ['fmap', ME.zero,         ME.zero.fmap(f)          ],
            ['fmap', ME.error('abc'), ME.error('abc').fmap(f)  ],
            ['ap',   ME.pure(8),      ME.pure(f).ap(ME.pure(3))],
            ['ap',   ME.zero,         ME.pure(f).ap(ME.zero)   ],
            ['ap',   ME.zero,         ME.zero.ap(ME.pure(3))   ],
            ['bind', ME.pure(8), ME.pure(4).bind(g)],
            ['bind', ME.zero, ME.pure(2).bind(g)],
            ['plus -- left-biased success', ME.pure(3), ME.pure(3).plus(ME.pure(4))], 
            ['plus -- left-biased error', ME.error('left'), ME.error('left').plus(ME.error('right'))],
            ['plus -- left zero: return right', ME.pure(4), ME.zero.plus(ME.pure(4))],
            ['plus', ME.zero, ME.zero.plus(ME.zero)],
            ['plus', ME.pure(18), ME.pure(18).plus(ME.error('right'))], 
            ['plus', ME.error('left'), ME.error('left').plus(ME.pure(24))],
            ['mapError', ME.pure(3), ME.pure(3).mapError(f)],
            ['mapError', ME.zero, ME.zero.mapError(f)],
            ['mapError', ME.error(13), ME.error(8).mapError(f)]
        ];
    })();
    
    return ME;

});