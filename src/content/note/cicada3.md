---
title: CICADA3.steg
description: "A Steganography tool inspired by the Cicada3301 puzzles on 4chan in 2012"
publishDate: "2025-04-03T11:23:00Z"
---


A terminal-based Steganography tool inspired by the legendary Cicada 3301 puzzles that surfaced on 4chan in 2012, to hide encrypted message inside images.

Instead of standard LSB encoding, I designed a custom algorithm that targets the ones-place digit of the smallest RGB channel per pixel - making detection non-trivial.
Messages are XOR-encrypted before binary encoding, then embedded across pixel data. Supports multiple image formats via ImageMagick conversion pipeline.

Packaged a full Windows installer using Inno Setup that automatically links static libraries and configures system PATH environment variables, so end users run it globally from any directory without manual setup.

For a more comprehensive look-
::github{repo="kush1jpeg/CICADA3"}
