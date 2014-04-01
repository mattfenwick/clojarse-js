
 - `\n` is just the 'n' character (ASCII 110), not a newline escape.
   but, "\n" is the one-character string for a newline escape.
   use `\newline` for the newline

 - `:abc` and `::abc` are valid symbols, but `:::abc` is not

 - `^ {} {}` is valid meta-data, but `^ 3 {}` and `^ {} 3` are not
   there may be a problem in the grammar currently

 - `\
` -- that's a slash followed by an actual newline character -- seems to be a valid character, equal to `\newline`

 - Some tokens are sensitive to what they may be followed by.  
They seem to generally require that some or any of the macro, 
whitespace, or punctuation characters follow them.These tokens are:

   - number
   - char
   - symbol
   - keyword
   - nil
   - boolean
