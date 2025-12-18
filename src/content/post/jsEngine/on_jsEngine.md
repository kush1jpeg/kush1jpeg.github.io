---
title: "looking inside the JS engine"
description: "A summary of the internals and the working of a JS engine"
publishDate: "19 December 2025"
coverImage:
   src: "./js.jpg"
   alt: "coverPage"
tags: ["Javascript", "shelf", "node" , "backend"]
---

## INtro to JS
so u wrote your shitty code and it does what u wanted, it shits! Butt what all happened behind?
to run js we need the Javascript Runtime Environment.


Let's start from answering this very question -
“Is JavaScript compiled or interpreted? Yes. And no. Maybe. Honestly, even JS isn’t sure, it just pretends to be whatever’s convenient at the time.”

The code needs an engine to convert it to machine code inorder to be processed by the OS just like any other language, in ur machine the work is done by the node binary(contains engine + libuv + other shit) and for the browsers its managed by different engines all across. [ENGINES](https://en.wikipedia.org/wiki/List_of_JavaScript_engines#List)

The big boss Brendan Eich(creator of js) built an engine which was interpreted -> the reason was simple -> browsers can't wait for the code to first get compiled and then show it, but new modern times gave rise to modern solutions which are efficient and carry the same fastness of that in interpreted listing -> bang!, comes the google's V8 engine with - JIT((JUST-IN-TIME) compilation), the v8 engine called SpiderMonkey included the first ever jit.

![Environment](/assets/jsEngine/js.png)

## UTF-8 → AST → Bytecode

u give ur code, v8 engine during execution, takes in the code in the form of a long UTF-8 string -

1) turns it into tokens, parses through your tokens and generates an AST(abstract syntax tree). It checks for syntax mistakes and defines the scope of variable(global, local, pvt and all), exits if any error is found. (no optimization till this point)

2) gets generated the v8 bytecode for faster interpretation

3) Ignition: for the first code run, it executes bytecode instruction by instruction - Collects type feedback - builds inline caches - this is where hot and cold functions are identified, changing object shapes nukes optimizations - tracks var type - object shape, etc. All the data is stored in the engines memory.

4) TurboFan the compiler, wakes up, detects stability + hotness + some deep shit of a function, decides to optimize that -> Takes bytecode + feedback, builds an IR (Intermediate Representation) , applies optimizations later discussed like -

- Inline Caching
- hidden classes
- Dead code elimination
- Constant folding
- Copy elision
- Bounds check removal

and a machine code is generated based on the machines architecture.

5) Garbage collector automatically cleans the heap,
- the stack is fast, and contains only the local primitives or pointers to the heap object.
- heap is used for storing arrays or objects. The array is also treated as an object in the node Environment, and the object has two arrays

6) now the optimized code is used but the old code is still kept for fallback.

7) as the optimizations performed by the TurboFan is of monomorphic(of one type).... and speed of execution decreases as u move toward megamorphic(many types), any change in the code types leads to a break in the optimized code that had been generated before and it de-optimizes the code piece and the all this shit starts again from Ignition ie step no 3.

eg-
```js
function add(a, b) {
  return a + b;
}

/*
here the assumption is that a and b are integers

but lets say u give var a as a string 'hi' then all
the optimizations break as it assumed the two to be
numbers so it starts again from Ignition.

*/
```

##  Hidden Classes and Inline Caching

it intrigued me the first time i read this -

so for every object the v8 engine tries to create a class, a hidden one, cuz structure gives speed;
remember i said that objects are just 2 arrays; well, lets take for eg-
```js
x={a:4 , b:5}
```
so two arrays are created in the heap one which stores a and b , other one stores 4 and 5 ; and u can see that the offset or the index of these are the same, so we store the pointer of a in the stack.
so v8 creates a blueprint for this and stores it in order to get faster lookup, doesn't have to look the hash table up every time if the user wants lets say value at index b; can just do base+1 as the index/offset of b was 1.

all of this fwucks up when u change the order
```js
x={b:5 , a:4}
```

cuz now the indexes changed although the values are the same but now b is at index 0; so new blueprint that is deopt is triggered.

## De-optimizations :

- Bailouts is V8’s TurboFan making assumptions to generate optimized machine code and u breaking it by passing something unexpected; like the prev example of passing a string in a add function and the engine discards the optimized code

- On-Stack Replacement (OSR):  if a loop or a function has been running for too long or is used frequently , it marks it as a hot function and stores it in the cache, OSR allows switching mid-execution from bytecode → optimized machine code without restarting the function

- changing object shapes nukes optimizations can be inferred from the case of hidden classes

- for the very same reasons try-catch block , eval , etc are hated cuz they decrease predictibility  of the engine.




------Sayonara
