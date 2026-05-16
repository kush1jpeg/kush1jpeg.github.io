---
title: komi.sh
description: A shell made from scratch in C
publishDate: "2025-06-14T11:23:00Z"
---

komi.sh is a UNIX shell implemented from scratch in C, built it during the summer break after freshman year.

Features a handcrafted lexical analyzer for tokenizing raw character streams, a recursive descent parser that encodes grammar production rules directly as C functions, and a full AST construction and traversal pipeline for execution.

Supports pipe chaining, I/O redirection, background execution, logical operators (&&, ||), and environment detection across major runtimes.

Integrated Groq, prompted to embody Komi's persona, accessible via the komi command directly from the terminal.

For a more comprehensive look-
::github{repo="kush1jpeg/komi.sh"}
