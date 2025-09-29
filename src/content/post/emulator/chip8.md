---
title: "chip8: old school hacker's first project"
description: "implemented a chip8 from scratch in c because i want to build nes"
publishDate: "29 Sep 2025"
coverImage:
   src: "./cover.jpg"
   alt: "coverPage"
tags: ["c", "emulator" , "linux" , "chip8" ]

---

## chip8 but WHY?-


now, making an emulator from scratch was one of the cool projects i wanted to do from the moment i started C programming language and became a shut-in degenerate(Hikikomori) because this world doesn't need another idiot.

Initially after watching few videos and reading blogs + reddit posts I desired building a NES
emulator(Nintendo Entertainment System). but soon reality struck in: like truck-kun in an isekai anime :)
Upon realizing the sheer complexity of the project and the ugliness of my current skills, i decided to
start small - the answer was chip8 emulator -> first project of many old school hackers and
computer enthusiasts.

so i started out with a chip8 emulator
    and named the githb repo as NOT_chip8.       -- -- oh boyy so creative :>

:::important
chip8 is a small interpreted language for 8 bit micro-computers developed in 1970,it allowed video games to be easily programmed,  but became famous when hackers ran games on hp graphing calculators using it.

chip8 is not a cpu its very much similar to a vm ((yes its not a true emulator too)) because the programs require an interpreter to run them. Chip-8 programs (like Pong, Space Invaders) could run on wildly different hardware as long as someone wrote a Chip-8 interpreter for that host. That’s the essence of a VM write once, run anywhere, even on a pregnancy tester like the doom community.
:::

## about it -

  u wana know the specifics as a tldr?
|spec                 | description
|---------------------|-------------------------------------------------------------------------
|Registers	          |16 general-purpose 8-bit registers (V0–VF). VF often used as a flag.
|Index register (I)   |	16-bit register used to store memory addresses.
|Program Counter (PC) |	16-bit, holds address of current instruction.
|Stack                |	Used to store return addresses for subroutines. Depth: 16 levels.
|Stack Pointer (SP)   |	Points to top of stack (implementation detail in interpreters).
|Timers	              |2 × 8-bit countdown timers (decrement at 60 Hz):
|                     |    - Delay Timer
|                     |    - Sound Timer
|Memory	              |4 KB (4096 bytes).
|                     |- 0x000–0x1FF: reserved for interpreter & fontset
|                     |- 0x200: default start address for programs
|Instruction size     |	2 bytes (16 bits), big-endian encoding.
|Instruction set      |	~35 instructions (opcodes). Arithmetic, logic, jumps, drawing, input.
|Graphics             |	monochrome, resolution: 64 × 32 pixels. Drawing via XOR sprites (8 pixels wide, up to 15 pixels tall). use any graphic api, i used sdl
|Input                |	Hex keypad (16 keys): 0x0–0xF. Typically mapped to 0–9 and A–F keys.
|Output               |	Sound (single buzzer, on/off). Graphics as above.
|Program entry point  |	0x200 (512). Programs typically loaded starting here.


## period!

it took around 2-3 weeks to complete it in C, i would specially give a big thanks to the shitty docs of sdl which made this journey very encouraging and full of motivation; just figuring out the sdl part and printing patterns on it felt very demn good....
![](./egs.png)

memory mapping bugs took most of the time, i was testing some unknown rom which expected fontset to be loaded at 0x32 but my cute ass noticed this after 2 days of frustration and no-work effort

but finally it worked with the help of gpt and docs-

## Demo 🎥

<video width="720" controls autoplay muted loop>
  <source src="/assets/emulator/pong.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

::github{repo="kush1jpeg/NOT_chip8"}

## Build it-

so i believe there are ample of well documented blog about how to make this project so it would be idiocy to just write something which has already been written very well.

here are a few resources that helped me figure stuff out -

- [chip8 emulator by austin morlan](https://austinmorlan.com/posts/chip8_emulator/).

- [cowgods tech reference](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM).

and also many other blogs that made it possible


