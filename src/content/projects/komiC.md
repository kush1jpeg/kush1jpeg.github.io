---
title: komiC
description: A from-scratch compiler in C for komiLang, a small typed language
publishDate: "2026-10-14T00:00:00Z"
---

komiC is a compiler for **komiLang**, written from scratch in C. The aim is narrowed towards running a program by building the compiler myself, with no parser
generators and no LLVM support...and partly to fulfill a childish dream in my freshman year - of making a compiler

I wrote a shell first (komi.sh, with a recursive descent parser). komiC is
the next step: a real language with types, functions, and native output.

## The language
komiLang is small and readable, with typed functions, `let` bindings,
`if`/`else`, and `while`.

    fn add(a: int, b: int) -> int {
        return a + b;
    }

    fn main() {
        let x = add(10, 20);

        if x > 20 {
            print("large");
        }
    }

## The pipeline

    source → tokens → AST → semantic analysis → IR → x86-64 assembly → executable

- **Lexer:** hand-written, tokens stored as a struct of arrays
- **Parser:** recursive descent for declarations and statements, Pratt parsing for expressions
- **Semantic analysis:** type checking with diagnostics
- **IR → x86-64:** : future_work
- **Memory:** arena allocation in future
- **External tools:** GNU `as` to assemble, `gcc` to link

## Status

> [Work in Progress]

::github{repo="kush1jpeg/komiC"}
