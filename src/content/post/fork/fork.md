---
title: "Fork: how to reproduce as a process?"
description: "fork() is just a term for creating a child, a parent gives birth to a child, child may or may not outlive them"
publishDate: "29 August 2025"
coverImage:
   src: "./cover.jpg"
   alt: "coverPage"
tags: ["c", "shell" , "linux" , "shelf" ]
---

## Introduction -

hmmm so u wanna know about the fork call in linux ecosystem; for tldr- its just the way a process reproduces and creates a child process;

We know that anything that runs a piece of code (yes including the garbage u write) can be considered a process, each process can be considered as an island managed by the god(the kernel). Every island is isolated from the rest of the islands, with its own unique process-Id (or PID ), and has their own resources.All of the  islands are owned by god(kernel) through a super duper godly power called init-process(starts as soon as u boot up!), this prevents your computer from crashing if a process fails, by adopting that very process. don't worry things will get clearer as u read on..

the init process in the kernel space calls systemd or bin file of init itself as the first process check it out by writing the following bash command in ur distro-



```bash
ps -f 1

# UID   PID  PPID  C   STIME  TTY  STAT  TIME   CMD
# root   1    0   0   Aug25    ?    Ss   0:12  /sbin/init
```

## process-es (PID & PPID)

each and every process initiated gets its own shit to play with -
+ New stack
+ New heap
+ New file descriptors table
+ New virtual memory address space
+ New register context/register store

:::note[file-descriptors table]
everything on your Linux is a file, yes even your camera, ssd, mic, etc is treated as a file. So when a process wants to interact with these files, kernel assigns them some integer value and stores the integer value in a table where the assigned value acts as an index; an array of pointers to the file location tbh; for that particular process.
:::

ParentProcessID OR PPID is the process id of the parent and each parent can spawn as many children as you want (i think there is a limit to which u can cuz otherwise the os would crash or something but u get the idea)

so again as every process gets assigned a new PID, which is just a unique number, it can be greater or lesser than the current PID. as linux doesnt work sequentially; you can check this basic shite out if u don't trust me -


```bash
echo $$   # this will give u the current pid

# run any process to see it gets a new PID eg-

/bin/bash

# then print pid again and notice that they are different
echo $$

```

the pid in the above example will be different cuz u are now under a child process of bash created by bash as the parent.
to kill the new child just kill the parent, sounds soooo gruel, I killed many....wonder if she will still accept me? well leaving that, think what would happen if the parent dies before the child..?


## Zombies and Orphans

so, **zombie process-es** are the ones whose execution is completed but they are still listed in the form of a row in the process table, becuz the parent didn't reap it, or basically never gave a flying birdie about it -> Its dead so it doesn't take any processing power but can make things a mess.

:::note[process table]
It is a single, global data structure inside the kernel. Every process (yours, mine, even kernel's own shit) gets a row in that table and some meta data in its columns

for each process there is a new row in the process table, represented in Linux by a [task_struct object.](https://elixir.bootlin.com/linux/v6.16.3/source/include/linux/sched.h) . lowkey insane piece of code.
:::

they are to be reaped by the parent using the wait() call or the waitpid(). Read the man pages for details of these system calls.


**orphans** on the other hand are the ones who's parents died in a car crash; yeah literally, like the parents are dead so now the child is an orphan, now what happens to the orphan children? well remember god(kernel) he adopts them using his super duper init process.

## Playing with fork -

we are done with most of the theory shite and lets now create our very first fork-

_no need to mug this up_ , its all in the man pages -

- In the parent, fork() returns the child’s PID (a positive number).
- In the child, fork() returns 0.
- If fork() fails, the parent gets -1 and no child is created.

```c

#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>  // for the fork sys call

int main(int argc, char *argv[]) {
  pid_t a = fork();
  if (a == -1) {
    printf("Unsucessfull");
    return 1;
  } else if (a == 0) {
    printf("success");
  }

  return EXIT_SUCCESS;
}

// prints success

```

now lemme tell you one more interesting thing about fork or actually lemme just show it to you and you try to guess what is it-

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
  printf("creating a fork \n");
  pid_t a = fork();
  if (a == -1) {
    printf("Unsucessfull \n");
    return 1;
  }
  printf("success from fork \n");

  return EXIT_SUCCESS;
}

// output -
// creating a fork
// success from fork
// success from fork

```

u must be wondering whydf does this happen; the very easy answer is that - fork just creates a duplicate path to execute shite written after it ; so both the parent and the child execute the instructions; thereby printing two success from the fork

**What `fork()` Actually Does**

- At the moment of the `fork()` call, the **kernel clones the calling process**.

- It creates a new process(child) that is *almost* an identical copy of the parent:
  - Same memory contents (via copy-on-write(tldr for now - the new page from the memory is mapped if only there is change in the content)).
  - Same instruction pointer (right after the `fork()` call).
  - Same file descriptors, same open streams, same stack (copied).

So after `fork()`, there are **two independent processes**.
Both are sitting at **the next instruction after `fork()`**, ready to run.


OKAYSSS.... NOW lets see an easy example of a zombie state where a child has finished but cannot exit -> happens when the parent like a careless idiot doesn't wait for the child and ignores the exit status left by the child in the kernel, so a simple execution would be somewhat like when the parent exits before the child

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
  printf("creating a fork \n");
  pid_t a = fork();
  if (a == -1) {
    printf("Unsucessfull \n");
    return 1;
  }

  if (a == 0) {
    printf("hello from child..\n");
    sleep(3);
//executing and exiting child before the parent to create zombie
  }

  printf("hello from parent..\n");
  return EXIT_SUCCESS;
}

/*   output-

kush@dystopian~ [C v15.2.1-gcc]
$ ./a.out
creating a fork
hello from parent..
hello from child..now exiting from child

kush@dystopian~ [C v15.2.1-gcc]
$ hello from parent..

*/

```
the child is stranded in the above as a 🧟 Zombie and guess what u are demn right 👶 Orphan is just the opposite of this case above
here is just the opposite implementation of the above logic..........so u wont have to move a muscle :)

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>

int main(int argc, char *argv[]) {
  printf("creating a fork \n");
  pid_t a = fork();
  if (a == -1) {
    printf("Unsucessfull \n");
    return 1;
  }

  if (a > 0) {
    printf("hello from parent..\n");
//executing and exiting parent before the child to create orphan
  return EXIT_SUCCESS;

  }

  printf("hello from child..\n");
    sleep(3);

}

/*   output-

kush@dystopian~ [C v15.2.1-gcc]
$ ./a.out
creating a fork
hello from parent..
hello from child..


watch after running this on htop or else that the
child becomes an orphan and the init process
adopts it.
*/

```

*Why should you care?*
- Orphans are not dangerous(why would they be?) — they get adopted and cleaned up.
- Zombies, if left unchecked in large numbers, can fill the process table and prevent new processes from being created.


---
>That’s why Unix programs always wait() on their children, cuz bad parenting creates zombies

```bash
                        fork()
                       ----------
                           |
          +----------------+---------------+
          |                                |
    [Parent continues]              [Child starts]
    a > 0 (PID of child)                a == 0
    getpid() -> parent's PID       getpid() -> child's PID
```
