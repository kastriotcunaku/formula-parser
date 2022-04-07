/* description: Parses end evaluates mathematical expressions. */

/* lexical grammar */
%lex
%%
\s+                   {/* skip whitespace */}
[0-9]+("."[0-9]+)?\b  {return 'NUMBER';}
"*"                   {return '*';}
"/"                   {return '/';}
"-"                   {return '-';}
"+"                   {return '+';}
"^"                   {return '^';}
"("                   {return '(';}
")"                   {return ')';}
"PI"                  {return 'PI';}
"E"                   {return 'E';}
[a-zA-Z][a-zA-Z0-9]*  {return 'IDENTIFIER'; }
"$"[a-zA-Z0-9]        {return 'VARIABLE'; }
<<EOF>>               {return 'EOF'; }

/lex

/* operator associations and precedence */

%left '+' '-'
%left '*' '/'
%left '^'
%left UMINUS

%start expressions

%% /* language grammar */

expressions
    : e EOF
        {return $1;}
    ;

e
    : e '+' e
        {
            $$ = {
                type: 'ADDITION',
                left: $1,
                right: $3
            };
        }
    | e '-' e
        {
            $$ = {
                type: 'SUBTRACTION',
                left: $1,
                right: $3
            };
        }
    | e '*' e
        {
            $$ = {
                type: 'MULTIPLICATION',
                left: $1,
                right: $3
            };
        }
    | e '/' e
        {
            $$ = {
                type: 'DIVISION',
                left: $1,
                right: $3
            };
        }
    | e '^' e
        {
            $$ = {
                type: 'POWER',
                expression: $1,
                power: $3
            };
        }
    | '-' e %prec UMINUS
        {
            $$ = {
                type: 'NEGATION',
                expression: $2
            }
        }
    | '(' e ')'
        {
            $$ = {
                type: 'PAREN',
                expression: $2
            };
        }
    | NUMBER
        {
            $$ = {
                type: 'NUMBER',
                value: Number(yytext)
            };
        }
    | E
        {
            $$ = {
                type: 'E',
                value: Math.E
            };
        }
    | PI
        {
            $$ = {
                type: 'PI',
                value: Math.PI
            };
        }
    | VARIABLE
        {
            $$ = {
                type: 'VARIABLE',
                name: yytext
            };
        }
    | IDENTIFIER '(' ')'
        {
            $$ = {
                type: 'FUNCTION',
                name: $1,
                arguments: []
            };
        }
    | IDENTIFIER '(' arguments ')'
        {
            $$ = {
                type: 'FUNCTION',
                name: $1,
                arguments: $3
            };
        }
    ;

arguments
    : e
        { $$ = [ $1 ]; }
    | arguments "," e
        { $$ = $1.concat($2); }
    ;