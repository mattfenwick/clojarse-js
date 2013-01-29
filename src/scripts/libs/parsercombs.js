define(["libs/maybeerror"], function (MaybeError) {
    "use strict";

    // ([t] -> m ([t], a)) -> Parser m t a
    function Parser(f) {
        this.parse = f;
    }
    
    // (a -> b) -> Parser t a -> Parser t b
    Parser.prototype.fmap = function(f) {
        var self = this;
        return new Parser(function(xs) {
            return self.parse(xs).fmap(function(r) {
                return {
                    rest: r.rest,
                    result: f(r.result)
                };
            });
        });
    };
    
    // a -> Parser t a
    Parser.pure = function(x) {
        return new Parser(function(xs) {
            return MaybeError.pure({rest: xs, result: x});
        });
    };
    
    // skipping Applicative ... for now
    
    // m a -> (a -> m b) -> m b
    // ([t] -> m ([t], a)) -> (a -> [t] -> m ([t], b)) -> [t] -> m ([t], b)
    Parser.prototype.bind = function(f) {
        var self = this;
        return new Parser(function(xs) {
            var r = self.parse(xs);
            if(r.status === 'success') {
                return f(r.value.result).parse(r.value.rest);
            }
            return r;
        });
    };
    
    Parser.prototype.plus = function(that) {
        var self = this;
        return new Parser(function(xs) {
            return self.parse(xs).plus(that.parse(xs));
        });
    };
    
    Parser.zero = new Parser(function(xs) {
        return MaybeError.zero;
    });
    
    // Parser [t] t a
    Parser.error = function(value) {
        return new Parser(function(xs) {
            return MaybeError.error(value);
        });
    };
    
    // (e -> m) -> Parser e t a -> Parser m t a
    Parser.prototype.mapError = function(f) {
        var self = this;
        return new Parser(function(xs) {
            return self.parse(xs).mapError(f);
        });
    };
    
    // Parser t [t]
    Parser.get = new Parser(function(xs) {
        return MaybeError.pure({rest: xs, result: xs});
    });
    
    // [t] -> Parser t ()   // just for completeness
    Parser.put = function(xs) {
        return new Parser(function() {
            return MaybeError.pure({rest: xs, result: null});
        });
    };

    // Parser t t
    Parser.item = new Parser(function(xs) {
        if(xs.length === 0) {
            return MaybeError.zero;
        }
        var x = xs[0];
        return MaybeError.pure({rest: xs.slice(1), result: x});
    });
    
    // (a -> Bool) -> Parser t a -> Parser t a
    Parser.prototype.check = function(p) {
        var self = this;
        return new Parser(function(xs) {
            var r = self.parse(xs);
            if(r.status !== 'success') {
                return r;
            } else if(p(r.value.result)) {
                return r;
            }
            return MaybeError.zero;
        });
    };
    
    function equality(x, y) {
        return x === y;
    }

    // t -> Maybe (t -> t -> Bool) -> Parser t t    
    Parser.literal = function(x, f) {
        var eq = f ? f : equality;
        return Parser.item.check(function (y) {
                                     return eq(x, y);
                                 });
    };
    
    // (t -> Bool) -> Parser t t
    Parser.satisfy = function(pred) {
        return Parser.item.check(pred);
    };
    
    // Parser t a -> Parser t [a]
    Parser.prototype.many0 = function() {
        var self = this;
        return new Parser(function(xs) {
            var vals = [],
                tokens = xs,
                r;
            while(true) {
                r = self.parse(tokens);
                if(r.status === 'success') {
                    vals.push(r.value.result);
                    tokens = r.value.rest;
                } else if(r.status === 'failure') {
                    return MaybeError.pure({rest: tokens, result: vals});
                } else { // must respect errors
                    return r;
                }
            }
        });
    };
    
    // Parser t a -> Parser t [a]
    Parser.prototype.many1 = function() {
        return this.many0().check(function(x) {return x.length > 0;});
    };

    // (a -> b -> ... z) -> (Parser t a, Parser t b, ...) -> Parser t z
    // example:   app(myFunction, parser1, parser2, parser3, parser4)
    Parser.app = function(f, ps__) {
        var p = Parser.all(Array.prototype.slice.call(arguments, 1));
        return p.fmap(function(rs) {
            return f.apply(undefined, rs); // 'undefined' gets bound to 'this' inside f
        });
    };
    
    // a -> Parser t a -> Parser t a
    Parser.prototype.optional = function(x) {
        return this.plus(Parser.pure(x));
    };
    
    // [Parser t a] -> Parser t [a]
    Parser.all = function(ps) {
        return new Parser(function(xs) {
            var vals = [],
                i, r,
                tokens = xs;
            for(i = 0; i < ps.length; i++) {
                r = ps[i].parse(tokens);
                if(r.status === 'error') {
                    return r;
                } else if(r.status === 'success') {
                    vals.push(r.value.result);
                    tokens = r.value.rest;
                } else {
                    return MaybeError.zero;
                }
            }
            return MaybeError.pure({rest: tokens, result: vals});
        });
    };
    
    // Parser t a -> Parser t ()
    Parser.prototype.not0 = function() {
        var self = this;
        return new Parser(function(xs) {
            var r = self.parse(xs);
            if(r.status === 'error') {
                return r;
            } else if(r.status === 'success') {
                return MaybeError.zero;
            } else {
                return MaybeError.pure({rest: xs, result: null}); // or undefined?  ???
            }
        });
    };
    
    // Parser t a -> Parser t t
    Parser.prototype.not1 = function() {
        return this.not0().seq2R(Parser.item);
    };
    
    // e -> Parser e t a
    Parser.prototype.commit = function(e) {
        return this.plus(Parser.error(e));
    };
    
    Parser.prototype.seq2L = function(p) {
        return Parser.all([this, p]).fmap(function(x) {return x[0];});
    };
    
    Parser.prototype.seq2R = function(p) {
        return Parser.all([this, p]).fmap(function(x) {return x[1];});
    };
    
    // purpose:  '[].map' passes in index also
    //   which messed up literal because it
    //   expects 2nd arg to be a function or undefined
    // this function ensures that doesn't happen
    function safeMap(array, f) {
        var out = [], i;
        for(i = 0; i < array.length; i++) {
            out.push(f(array[i]));
        }
        return out;
    }
    
    // [t] -> Parser t [t]
    // n.b.:  [t] != string !!!
    Parser.string = function(str) {
        return Parser.all(safeMap(str, Parser.literal)).seq2R(Parser.pure(str));
    };

    // [Parser t a] -> Parser t a
    Parser.any = function (ps) {
        return new Parser(function(xs) {
            var r = MaybeError.zero,
                i;
            for(i = 0; i < ps.length; i++) {
                r = ps[i].parse(xs);
                if(r.status === 'success' || r.status === 'error') {
                    return r;
                }
            }
            return r;
        });
    };
    
    /* tests */
    
    Parser.tests = (function() {
        var item     =  Parser.item,
			sat      =  Parser.satisfy,
			literal  =  Parser.literal,
			zero     =  MaybeError.zero,
			error    =  MaybeError.error,
			pure     =  MaybeError.pure,
			all      =  Parser.all,
			string   =  Parser.string,
			any      =  Parser.any,
			err      =  Parser.error;
    
		function myPure(value, rest) {
			return Parser.pure(value).parse(rest);
		}
		
		function g(l, r) {
            if(l.length !== r.length) {
                return false;
            }
            for(var i = 0; i < l.length; i++) {
                if(l[i] !== r[i]) {
                    return false;
                }
            }
            return true;
        }
        
        function f(x, y) {
            return x.b === y.b;
        }
        
        function f3(x,y,z) {
            return x + z;
        }
        
        function fe(e) {
            return {e: e, length: e.length};
        }
        
        var p = literal('a').plus(literal('b')),
            ex = item.bind(function(x) {
                return item.bind(function(y) {
                    return literal(x);
                });
            }),
            two = item.bind(literal), // recognizes two of the same token
            allEx = all([item, literal('x'), literal('3')]),
            fmapEx = literal(3).fmap(function(x) {return x + 15;}),
            seq2LEx = literal('a').seq2L(literal("b")),
            seq2REx = literal('a').seq2R(literal("b")),
            anyEx = Parser.any([literal('a'), literal('b'), string("zyx")]);
		
        return [
            ['item', item.parse(""), zero], 
            ['item', item.parse("abcde"), myPure('a', 'bcde')], 
            ['item', item.parse([1,2,3,4]), myPure(1, [2,3,4])],        
            ['check', item.check(false).parse(""), zero],
            ['check', item.check(function(x) {return x > 3;}).parse([4, 5, "abc"]), myPure(4, [5, "abc"])], 
            ['check', item.check(function(y) {return y % 2 === 0;}).parse([17, 'duh']),            zero],
            ['satisfy', sat(false).parse(""), zero],
            ['satisfy', sat(function(x) {return x > 3;}).parse([4, 5, "abc"]), myPure(4, [5, "abc"])],
            ['satisfy', sat(function(y) {return y % 2 === 0;}).parse([17, 'duh']), zero],
            ['literal', literal('a').parse(""), zero],
            ['literal', literal('b').parse("cde"), zero],
            ['literal', literal('m').parse("matt"), myPure('m', "att")],
            ['literal', literal(13).parse([13, 79, 22]), myPure(13, [79, 22])],
            ['literal -- the equality comparison must work for anything"', 
                literal([12, 13], g).parse([[12,13], 27, "abc"]),
                myPure([12, 13], [27, "abc"])],
            ['literal', literal({b: 2, c: 3}, f).parse([{b: 2, c: 311}, 17]),
                myPure({b: 2, c: 311}, [17])],
            ['pure', Parser.pure("hi there").parse("123abc"), myPure('hi there', '123abc')],
            ['zero', Parser.zero.parse("abc123"), zero],
            ['plus', p.parse("abcde"),            myPure('a', 'bcde')],
            ['plus', p.parse("bcde"),             myPure('b', 'cde')],
            ['plus', p.parse("cde"),              zero],
            ['plus', literal('a').plus(Parser.get.bind(Parser.error)).parse("xyz"),
                MaybeError.error("xyz")],
            ['commit -- turns failure into an error', 
                literal('a').commit('blegg').parse("bcde"), err('blegg').parse("bcde")],
            ['commit -- does not affect success', 
                literal('a').commit('???').parse("abcde"), myPure('a', 'bcde')],
            ['commit -- does not affect errors', 
                err(123).commit('ouch!').parse('abcde'), MaybeError.error(123)],
            ['bind', two.parse("aabcd"),  myPure('a', 'bcd')],
            ['bind', two.parse("bbcd"),   myPure('b', 'cd')],
            ['bind', two.parse("abcd"),   zero],
            ['bind', ex.parse([1,2,1,3]), myPure(1, [3])],
            ['bind', ex.parse([1,2,3,4]), zero],
            ['all -- identity', all([]).parse('abc'), myPure([], 'abc')],
            ['all', all([literal('2')]).parse("2345"), myPure(['2'], '345')],
            ['all', allEx.parse("ax3dyz"), myPure(['a', 'x', '3'], "dyz")],
            ['all', allEx.parse("bx4zzz"), zero],
            ['fmap', fmapEx.parse([3,4,5]), myPure(18, [4,5])],
            ['fmap', fmapEx.parse("bcd"), zero],
            ['seq2L', seq2LEx.parse("abcdefg"), myPure('a', 'cdefg')],
            ['seq2L', seq2LEx.parse("acefg"), zero],
            ['seq2R', seq2REx.parse("abcdefg"), myPure('b', 'cdefg')],
            ['seq2R', seq2REx.parse("acefg"), zero],
            ['string', string('public').parse("publicness"), myPure('public', 'ness')],
            ['string', string('public').parse("pub-a-thon"), zero],
            ['many0', literal('a').many0().parse("bbb"), myPure([], 'bbb')],
            ['many0', literal('a').many0().parse("aaaaaabcd"), myPure(['a', 'a', 'a', 'a', 'a', 'a'], 'bcd')],
            ['many0  -- must respect errors', Parser.error('abc').many0().parse("abc"), 
                MaybeError.error("abc")],
            ['many1', literal('a').many1().parse("bbb"), zero],
            ['many1', literal('a').many1().parse("aaaaaabcd"), myPure(['a', 'a', 'a', 'a', 'a', 'a'], 'bcd')],
            ['many1 -- must respect errors', Parser.error('abc').many1().parse("abc"),
                MaybeError.error("abc")],
            ['any', anyEx.parse("aq123"), myPure('a', 'q123')],
            ['any', anyEx.parse("zyx34534"), myPure('zyx', '34534')],
            ['any', anyEx.parse("zy123"), zero],
            ['any -- must respect errors', 
                any([literal('a'), Parser.error(13)]).parse('cde'),
                MaybeError.error(13)],
            ['app', Parser.app(f3, item, literal(-1), item).parse([18, -1, 27, 3, 4]), 
                myPure(45, [3, 4])],
            ['app', Parser.app(undefined, item, literal(2)).parse([1,3,4,5]), zero],
            ['app -- must respect errors', 
                Parser.app(undefined, item, literal(1).commit('blah')).parse([1,2,3,4]),
                MaybeError.error('blah')],
            ['optional', literal('a').optional().parse('bcde'), myPure(undefined, 'bcde')],
            ['optional', literal('a').optional().parse('abcd'), myPure('a', 'bcd')],
            ['error', literal('a').seq2R(err('qrs')).parse('abcd'),
                MaybeError.error('qrs')],
            ['error', literal('a').seq2R(err('tuv')).parse('bcd'), zero],
            ['mapError', err([89, 22]).parse([2,3,4]).mapError(fe), 
                MaybeError.error({e: [89, 22], length: 2})]
        ];
    })();

    return Parser;
    
});