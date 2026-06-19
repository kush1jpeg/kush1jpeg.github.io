---
title: iStream
description: A distributed streaming platform supporting adaptive-bitrate-streaming and VOD.
publishDate: "2026-06-07T11:23:00Z"
---

Twitch-like live streaming platform built entirely from scratch - no managed streaming services, no abstractions.

I Went looking for something that supported adaptive bitrate output while streaming and couldn't find it, so built the whole pipeline myself.

RTMP ingest through MediaMTX, FFmpeg transcoding to HLS ABR with 1080p passthrough and 480p transcode, dynamically autoscaled FFmpeg worker-containers spawned and killed via Dockerode based on live load, a RabbitMQ job queue dispatching transcoding work across the worker pool, segment-level VOD recording with real-time uploads to Cloudflare R2 via a Chokidar file watcher - so disk usage stays flat regardless of stream duration.

On top of that: real-time live chat and super-chats over Socket.io + stream logs with a Redis pub/sub adapter, a Razorpay payment gateway with webhook verification and a reconciliation cron.

For a more comprehensive look-
::github{repo="kush1jpeg/iStream"}

