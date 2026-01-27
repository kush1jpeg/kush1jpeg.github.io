---
title: "asynchronous-ity via eventLoop"
description: "a short mug up of how the eventLoop handles promises/async-await"
publishDate: "28 January 2026"
coverImage:
   src: "./js1.png"
   alt: "coverPage"
tags: ["Javascript", "shelf", "node" , "backend"]
---

## OVER_view
Miners, we know about the core behaviour of the engine already [read it](https://kush1jpeg.github.io./posts/jsengine/on_jsengine). To recall...the js-Environment has the JS-engine(which contains the stack and heap along with the compiler,parser, and all that low level shit), the event-loop, and the web/OS calls.

JS is based on a single threaded synchronous model; ie only one thread is executed at a time as the main thread; it uses a call stack to keep a track of all the threads to be executed; the problem with this approach arises if some compute heavy task comes, then the whole execution is blocked till this task is completed thereby preventing working of other tasks/threads;

Even with multithreaded capability of modern CPU's(dual core Pentium series by Intel which changed game-dev) which could simultaneously execute multiple threads -> JS was lagging by believing the future of web would just be just shitty animated front-end sites, built by NEET's

To solve this, Apache's http server used multithreaded model approach where each request was a thread in itself, a disaster for a large userbase. Node took a completely different approach by using the #eventLoop.

## eventLoop
Whatdf is even the eventLoop..?
remember the stack/call-stack of our JS runtime-environment - the eventLoop .... well it is a scheduler that continuously checks whether the call stack is empty and, if yes -> moves pending callbacks from queues (microtasks first, then macrotasks) onto the stack for execution. Event loop runs: ALL microtasks then ONE macrotask and loops again.

wats microtaskQueue and macrotaskQueue u may ask:-
anything which is involving promises and process.nextTick (not explored till now), comes under the microtaskQueue or basically call them high-priority jobs.

rest, all the webAPI/node stuff, timers, DOM events, the io operations by libuv, comes under macrotaskQueue, think of these low priority jobs only to be executed after drying/emptying the microtaskQueue.

#### Example 1
```js
console.log("begin")

setTimeout(()=>{
console.log("timer after 5 sec");
},5000);

console.log("end");
```

so as soon as we run this code a global Execution context is created like always(memory(variable env) + code (thread of execution) useless for now..) and the code is executed synchronously ie

```
"begin" pushed to call-stack → printed immediately
        |
setTimeout registers callback to the webAPI/node
        |
"end" pushed to call stack → printed immediately
        |
(after ~5s) the callback gets queued in
the callbackQueue/macrotaskQueue
        |
event loop sees empty stack → pushes a task from
macrotaskQueue to the call-stack
        |
"timer after 5 sec" printed
```


#### Example 2


```js
console.log("start");

setTimeout(() => {
  console.log("A");
}, 0);

Promise.resolve().then(() => {
  console.log("B");
});

console.log("end");
```

```
Global execution context is created
          |
start is printed immediately
          |
a timeout is registered with the host -> later macrotaskQueue
          |
a promise is registered in microtaskQueue
          |
end is printed immediately
          |
microtaskQueue is dequed first as stack is empty cuz of higher priority
          |
B is printed immediately
          |
A is printed as the next task from macrotaskQueue.
```

#### killerQsn
Here's a little evil one to try together and u can use paper...no point in saving the trees for me!
also remember that async is just a promise in disguise...i mean async either itself returns a promise or watever u return inside async automatically gets wrapped up as a promise after the first await, aint this like Oedipus' Sphinx......🦥, cuz if no await inside async, then it acts as a normal function.

```js
async function foo() {
  console.log("A");

  await Promise.resolve();

  console.log("B");

  setTimeout(() => console.log("C"), 0);
}

console.log("D");

setTimeout(() => console.log("E"), 0);

foo();   // no await

Promise.resolve().then(() => console.log("F"));

console.log("G");
```

so yeah here's the ans for this one, along with a kaam-chalau explanation.

```
gec is created
      |
D printed immediately
      |
e stored as in macrotaskQueue
      |
foo is called till first await
a is printed
rest all after is stored in microtaskQueue
      |
promise printing f is stored in microtaskQueue
      |
g is printed immediately
      |
microtaskQueue is dequed
and b is printed
then f is printed after it thus emptying the microtaskQueue
      |
then macrotaskQueue is emptied and e is printed
      |
then c is printed

```


this always confused me, like really, and finally i got some time to brush up the concepts yet again- after feeling incompetent for the 99th time today. Sooh i tried to make it much easier to revise...sayonara!
