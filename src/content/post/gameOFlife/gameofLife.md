---
title: "Conway’s Game of Life"
description: "4 simple rules giving rise to an unmeasurable complexity......Strange, isn’t it?"
publishDate: "10 December 2025"
coverImage:
   src: "./life1.png"
   alt: "coverPage"
tags: ["shelf"]
---
<style>
.short-video video {
  height: 300px;       /* set your height */
  width: 100%;         /* scale properly */
  object-fit: cover;   /* no distortion */
}
.vid-row {
  display: flex;
  gap: 1rem;        /* space between the videos */
}

.vid-row video {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 6px; /* optional: looks clean */
}
</style>

How does it feel to know that a simple niggerlicious game with just 4 rules can become so complex that no models could be trained on it making it act more like a deterministic system with an unpredictable emergence. The game is Turing Complete - Meaning: given enough space and an arrangement of cells, it can run any computable algorithm, in easy words it is simple, yet complex enough at the same time to make us wonder...:>

yeahh brothers and ladies i stumbled on the game of life by JOHN Conway, never thought that they would include something like this in my stupid btech 3rd sem syllabus, though the teacher shitted on the explanation but i will try to make it NOT feel colorless....and boring

## Introduction-

> “Simplicity is the ultimate sophistication.” ~Da Vinci

1950's........the whole story starts with this one insane polymath guy -VON Neumann(developed the neumann architechture : mathematician : helped in building a hydrogen bomb) .One day, he got this lust for knowing more about self-replication of machines, in engineering biology termed as cellular automata. He researched on it for years and even made one giant,complex,mathematical machine which could replicate itself mechanically. He did more than enough to spark the joy in our guy JOHN's eye decades later. Now our main guy JOHN simplified the idea of neumann (computation + construction = self-replication) and compressed the neumann's ugly monstrous work full of mathematics into just 4 simple set of rules.

the four rules giving rise to this were -
- A cell with 2–3 neighbors lives.
- A cell with <2 neighbors dies (loneliness).
- A cell with >3 neighbors dies (too much socialising).
- A cell with exactly 3 neighbors is born. (3some or wat)

<div class="short-video">
  <video autoplay loop muted playsinline>
    <source src="/assets/gameOFlife/life1.mp4" type="video/mp4" />
  </video>
</div>

## emergence of PATTERN's

Conway opened us to infinite possibilities of complex patterns, almost giving rise to a digital ecosystem and because these patterns came up so regularly that we started classifying them - majorly into these 4 types -

 1. Still Lifes :

These patterns settle down and never change again.
No drama, no evolution, no movement.
They act as building blocks for bigger machines.

 2. Oscillators :

These guys keep flipping back and forth between states forever, like a pendulum
Their “period” (how many steps before they repeat) becomes their identity.

 3. Spaceships : oscillators that f&&k around

these give the game a movement.
Same idea, except now the oscillator shifts its position slightly each cycle.
Gliders are the smallest and most iconic — the “atoms” of computation in Life.

 4. Guns : factories of spaceships

These monsters just sit there and… manufacture spaceships infinitely.
The most famous:

Gosper’s Glider Gun was the first pattern ever shown to grow forever.
A stationary structure that endlessly spits out moving particles.

eg- A representation of gospels glider gun -> shoots spaceships, which i find very damn interesting!

<video autoplay loop muted playsinline width="650">
  <source src="/assets/gameOFlife/vid1.mp4" type="video/mp4" />
</video>


 5. Methuselahs : long-lived

Tiny starting patterns that explode, transform, mutate, and take thousands of generations to stabilize. the name izz pretty tho.


6. Wicks : repeating lines of destruction or construction

Imagine a line of cells that burns or grows steadily across array.
They can be explosive like nietzsche , delicate like sylvia , or surprisingly stable like kant.
Think of them as linear beings which are moody.



## Turing COMPLETED-ness

A system is Turing complete if it can emulate any computation that a Turing machine can given enough space and time. Basically:
If it can do if-else and loops its generally Turing complete.

so yeaah we can build logic gates like (xor, nand, nor and all that) using the patterns found in Conway's game -

eg- combining a glider, which is just a spaceship, which again is just an oscillator with a movement, we can easily create a NOT gate.....

a NOT gate just for us to remember simply gives the opposite output, 0->1 and 1->0 in binary
so by using gliders and a gospel gun we can easily create a not gate; 1 is when the gliders are passing and 0 is when they are not;

<div class="vid-row">
  <video autoplay loop muted playsinline>
    <source src="/assets/gameOFlife/not1.mp4" type="video/mp4" />
  </video>
  <video autoplay loop muted playsinline >
    <source src="/assets/gameOFlife/not2.mp4" type="video/mp4" />
  </video>
</div>

u can see that we have  an input stream labelled as 1) and an output stream labelled as 4) the output is just the opposite of the input behaving adequately like a NOT gate

The patterns allow it to store, transmit, and manipulate information. Those are the three ingredients of computation. From four trivial rules, a basic computer arises....NO like for real by simulating logic inside this game hackers around the world have even made a 8bit computer!


## Confluence -

Why is this a big deal?

Because it proves something profound:
- Extreme complexity emerges from absurd simplicity.
- No need for conscious design.
- its really easy to code it out
- and its way more fun to play it.

[ play it once man !](https://playgameoflife.com/)

~Sayonara
