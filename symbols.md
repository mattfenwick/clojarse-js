Goals:

 - correctly tokenize valid Clojure symbols

 - not recognize multiple consecutive Clojure tokens as a single token

So this is intended to parse a superset of Clojure's symbols, and should
not misparse symbols by consuming more characters than Clojure would.


first char(s):

 - not whitespace

 - not a digit

 - not + or - followed by a digit

 - not #'";@^`~()[]{}\

 - not :

rest chars:

 - not whitespace

 - not %

 - not ";@^`~()[]{}\


keywords start with :, then follow the same rules as 'rest chars'.


so, if we open a token with a character that's not covered above,
 we read until the next whitespace or macro opener (or EOF):

 - which is one of   ";@^`~()[]{}\

 - note:   #'%   are NOT terminating macro characters

 - further note:  nevertheless, % seems to terminate symbols
   - example please?  becuase these work:
     - `(def abc% 3)`
     - `(print abc%)`
   - example in repl:
     - `user=> abc%`
     - seems to only happen when it's the last form on a line

