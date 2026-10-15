---
title: "writing a Pratt Parser in C :part 1"
description: "How Pratt parsing handles operator precedence and associativity : @komiC"
publishDate: "2026-10-15"
coverImage:
   src: "./fri.png"
   alt: "frieren studying compiler construction"
tags: ["compiler", "c", "linux", "shelf"]
---

## confessions of a young-MONK
To save my remaining braincells and personality, from a certain ennui which arises when AI is coming to take over your job, and especially when its taking too long....I decided to make a compiler from scratch. Dreamt of making one as a first-year..finally doing something i am really proud of.

the fact that i had made a Recursive-descent parser for my custom shell([komi.sh](/projects/komish/)), I thought making one with a weird name(Pratt) would hardly require any effort! I was wrong! its something which felt odd, but beautiful.

:::note
Bob Nystrom's [Pratt Parsers: Expression Parsing Made Easy](https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/)
is the best introduction to this topic, and you should read it. This post
is not a replacement but rather what happened when I built one in C for my
compiler, [komiC](/projects/komic), and partly acts as a way to instantly remember
what the fuck I wrote.

Already know how Pratt parsing works? [Skip to the C implementation](#building-it-in-c).
:::


## recursive and pratt-parsing
Recursive descent works when the lookahead token tells you which rule to apply, if you know you’re parsing an if-statement, see while and you know it’s a loop. The leading keyword picks the branch, so the code is trivial.

Expressions are where the trick fails. Look at a + b * c. The first token, a, tells you nothing about what follows. The operator comes after the left operand, so you can’t pick a rule from the first token. Prefix versus infix is also ambiguous: - means different things depending on position. 

all of this can be done using Recursive-descent parsing but it would be very repetitive/lengthy as for any new precedence you would have to make a whole new function, but in pratt-parsing its just defining the precedence in the precedence table and knowing the ast shape to wire it upto, adding the switch-case and the rest is handled.

the thing is, pratt-parsing remained obscure for many years, when Mr.Pratt wrote the paper for dynamic languages originally in lisp, the lisp community didn't care because the language itself doesn't carry heavy syntax - 
Code is written as (+ 1 (* 2 3)), which is already a tree, therefore the demonstration of parser became useless/something not needed. 
The hand-written recursive descent was already good enough, parser-generator theory dominated textbooks, and the 1973 Vaughan Pratt’s paper is hard to read.

### crux-

parsing is simply breaking the expression/tokens to form a tree; 
1) manually 
2) using a context free grammar - bnf(Backus Naur form)

  <p class="">
    You might remember the precedence and associativity concepts we
    learned in 5th grade, which determine the order in which operators
    are evaluated in an expression (like BODMAS).
  </p>

  <img
    src="/assets/compiler/table.png"
    alt="Operator precedence and associativity table"
  />

#### here's an example -
notice that we assign the right side a value greater than the left so that when 2 operators of same precedence are in view, left-associativity is maintained.

```sh 
expr:   A       +       B       *       C      +       2      /     4
power:        3   3.1        5   5.1         3  3.1         5   5.1

  
expr:   A +       B  *  C      +       2  /  4
power:  3   3.1              3   3.1


expr:   A +       MUL      +       DIV
                  / \              / \
                 B   C            2   4

power:  3  3.1            3   3.1


expr:   A + MUL      +  DIV
            / \         / \
           B   C       2   4
power:              3  3.1


expr:    PlUS
         / \
        A  MUL        +  DIV
            / \          / \
           B   C        2   4


expr:         PlUS
             /    \
         PlUS     DIV
         / \       / \
        A  MUL    2   4
            / \
           B   C

```
#### nud and led

we utilize the above concept when making a pratt-parser and it handles the infix( tokens that are between an expression) and postfix( tokens that can BEGIN an expression) notations elegantly;
for larping -
- prefix handler can be referred as nud (null denotation) handler —it processes tokens that can start an expression without needing a left-hand side context.
- infix handler can be referred as led (left denotation) handler —it processes tokens that expect to be between or after some other expression to its left.

## building-it-in-c

I already had a finely-built lexer from the shell I made, slapped that in here, for you, yourself, manage a toy lexer or assume the tokens are something...we are born with.
the parser has a general structure i copied while reading Nora Sandler's Writing a C compiler.

#### parser struct
```c
typedef struct Parser {
  const Tokens *tokens;
  uint32_t current; // to track the curr token;

  bool has_error;
  bool in_panic_mode;

  // error handling;
  size_t length;
  size_t capacity;
  Error *data;
} Parser;
```

#### parsing_engine

Below is the engine, radical, parse_precedence(parser, precedence) means: parse an expression, but stop the moment you meet an operator weaker than precedence, it grabs the first token and hands it to parse_prefix, because whatever starts an expression is a prefix thing (a number, a name, a -, a (), that gives us left. Then the loop asks one question over and over: does the next token bind at least as tightly as the level I was called with? if yes, swallow the operator, hand left and the operator to parse_infix, and whatever comes back becomes the new left. if no, we’re done and the caller gets left. The associativity part is handled individually for each type.

```c 
ASTNode *parse_precedence(Parser *parser, Precedence precedence) {
  Token token = parser_advance(parser);
  ASTNode *left = parse_prefix(parser, token);
  if (left == NULL)
    return NULL;
  while (precedence <=
         get_precedence(get_token(parser->tokens, parser->current).tag)) {
    Token op = parser_advance(parser);
    left = parse_infix(parser, left, op);

    if (left == NULL)
      return NULL;
  }
  return left;
}
```

#### infix and postfix expressions

the prefix and infix handlers looked something like - 
```c

static ASTNode *parse_prefix(Parser *parser, Token token) {
  // Tokens that can BEGIN an expression:
  switch (token.tag) {

  case TOKEN_INTEGER:
  case TOKEN_FLOAT:
  case TOKEN_STRING:
  case TOKEN_KEYWORD_TRUE:
  case TOKEN_KEYWORD_FALSE:
    return create_ast_literal(token);

  case TOKEN_IDENTIFIER:
    return create_ast_identifier(token);

  case TOKEN_MINUS:
  case TOKEN_NOT:
    return parse_unary(parser, token);

  case TOKEN_LEFT_PAREN:
    return parse_grouping(parser);

  default:
    snprintf(msg, sizeof(msg), "komic: expected expression, got %s\n", token_tag_name(token.tag));
    return NULL;
  }
}
```
```c
ASTNode *parse_infix(Parser *parser, ASTNode *left, Token op)
// Tokens that can be in-between expressions:
{
  char msg[128] = "";
  switch (op.tag) {

  // arithmetic
  case TOKEN_PLUS:
  case TOKEN_MINUS:
  case TOKEN_STAR:
  case TOKEN_SLASH:
  case TOKEN_PERCENT:

  // equality
  case TOKEN_EQUAL_EQUAL:
  case TOKEN_NOT_EQUAL:

  // comparison
  case TOKEN_LESS:
  case TOKEN_LESS_EQUAL:
  case TOKEN_GREATER:
  case TOKEN_GREATER_EQUAL:

  // logical
  case TOKEN_AND_AND:
  case TOKEN_OR_OR:
    return parse_binary(parser, left, op);

  // assignment
  case TOKEN_EQUAL:
    return parse_assignment(parser, left, op);

    // function call
  case TOKEN_LEFT_PAREN:
    return parse_call(parser, left);

  default:
    snprintf(msg, sizeof(msg), "komiLang: invalid infix operator %s",
             token_tag_name(op.tag));
    parser_error(parser, msg);

    return NULL;
  }
}
```

#### left/right associativity
as discussed above, Precedence tells you * beats +, but what happens when the same operator shows up twice, like 8 - 3 - 2? group it from the left, (8 - 3) - 2, and you get 3. group it from the right, 8 - (3 - 2), and you get 7. same tokens, different answer, so the parser has to pick a side. Most operators are left-associative: -, /, + but assignment is the rebel: a = b = c has to mean a = (b = c), otherwise you’re assigning c to the result of a = b, which is idiocy.

In my parser the whole difference is one + 1. parse_binary calls back into parse_precedence with precedence + 1, so when the inner call peeks at the next -, its own level is now too high to accept it. it stops, hands back 3, and the outer loop picks up the second - with (8 - 3) as its left side, which leans the tree left. parse_assignment recurses with the same precedence, so the inner call is allowed to swallow the next = and the tree leans right. one number decides which way the tree falls.

```c
static ASTNode *parse_assignment(Parser *parser, ASTNode *left, Token op) {
  // NOTE: Assignment is RIGHT associative.
  Precedence p = get_precedence(op.tag);

  ASTNode *right = parse_precedence(parser, p);

  if (right == NULL)
    return NULL;

  return create_ast_binary(op, left, right);
}

static ASTNode *parse_binary(Parser *parser, ASTNode *left, Token op) {
  Precedence a = get_precedence(op.tag);
  // NOTE: +1 makes ordinary binary operators LEFT associative.
  ASTNode *right = parse_precedence(parser, (Precedence)(a + 1));

  if (right == NULL)
    return NULL;

  return create_ast_binary(op, left, right);
}
```

## that's it?
this concludes the part1 of the compiler creation journey;  
The parser now handles expressions: literals, unary minus and not, binary operators, grouping, assignment, and function calls, all from one while loop and a precedence table. here’s 1 + 2 * 3 = ... going in and AST coming out.

upcoming is where it actually becomes a true parser: [block and declarations parsing, panic mode, function calls, etc ].

::github{repo="kush1jpeg/komiC"}

sayonara....
