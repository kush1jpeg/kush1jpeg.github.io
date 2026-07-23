---
title: "Handling VOD and live via nginx : @iStream"
description: "Using nginx's as an identity-indirection layer keeping streamKeys and R2 signatures server-side while routing both live segments and presigned VOD manifests through a single gateway"
publishDate: "19 July 2026"
coverImage:
   src: "./nginxVodLive.png"
   alt: "coverPage"
tags: ["shelf" , "backend" , "iStream"]
---
for the past few months i've been making my own platform like Twitch called iStream to learn about systems and stuff + eventually/hopefully -> land an internship; 

::github{repo="kush1jpeg/iStream"}

### Problem statement:

iStream currently uses streamKeys inorder to store the files for live streaming on the disk, clean them after pushing them to cloudflare r2, for vod access afterwards; the decision was made for easy routing and effective binding to multiple different services; but theres a Problem that occurs -  VOD and live can't share a naive "just serve files" approach cuz of the streamKey-as-ingest-credential, posing a risk, and why exposing it in a client-facing URL is laughably miserable; impersonation risk during a live stream, whole content access, almost fluffs up the whole point of the key being a point of verification in the ingest server, if i cant send the whole hls path to the frontend, then how will the video player work? this was the whole question; wanting the network hops to be minimal.

### nginx: the Gatekeeper 
i had already been using nginx as a rate-limiter and as a static-server to serve the hls segments from the disk during a live stream , with the help of streamKey, the solution clicked instantly when i remembered that nginx must have some way to send sub requests and something like that; after a 2 min chat with llm, the answer was clear, nginx has auth_request module inbuilt for especially these kind of use cases;

The ngx_http_auth_request_module allows you to implement client authorization based on the result of an internal subrequest, i wired up the config to test out after reading some docs;

### live:static serve
```sh
        # streamId -> key resolution, and then serve the file from the /hls/ directory
        location ~ ^/hls/(?<stream_id>[^/]+)/(?<file>.+)$ {
            auth_request /_resolveLive;
            auth_request_set $stream_key $upstream_http_x_stream_key;
            rewrite ^ /hls-serve/$stream_key/$file break;
        }

        # to get the streamkey
        location = /_resolveLive {
            internal;
            proxy_pass http://job-server:3000/resolve-stream;
            proxy_cache cache;
            proxy_cache_valid 200 60s;
            proxy_cache_key $stream_id;
            proxy_pass_request_body off;
            proxy_set_header Content-Length "";
            proxy_set_header X-Original-URI $request_uri;
        }

        # after redirecting to /hls-serve/ serve the file from the /hls/ directory
        location /hls-serve/ {
            internal;
            alias /hls/;
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Headers *;
            add_header Access-Control-Allow-Methods "GET, OPTIONS";
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }
        }
```

the flow now became something like -


 ![live](/assets/backend/v2.png)

#### bingo problem 
but there is a big problem in this config; 
it looks correct; it seems correct; ask an llm, she says you are good to go;
buttttt............ on running it, the nginx always gave me an empty streamKey, at first i thought it was caching, as claude told me that it may cache the first empty response and then serves the cached response ever after, on doing a curl from the nginx container i was getting the streamKeys but not from the host machine/browser; i initially thought of it to be a networking issue, tried everything llm suggested just to make it work, even started banging my head after every failure just to wake up even the most distant brain cells; but no success;

after spending 25+hours on this,
the mistake was assuming - nginx runs directives top to bottom like normal code!
```sh
auth_request /_resolveLive;
auth_request_set $stream_key $upstream_http_x_stream_key;
rewrite ^ /hls-serve/$stream_key/$file break;
```

The problem is nginx processes directives in phases:

- Rewrite phase
  - return
  - rewrite
- Access phase
  - auth_request
- Content phase
  - try_files
  - static file serving / alias

So my rewrite ran before auth_request had set the headers giving me empty streamKey;

also after reading some blog "static server with proxy using nginx" i got to know about try_files which made the code modular by removing the internal redirect block to the alias;
so the config for live became-

```sh
        # streamId -> key resolution, and then serve the file from the /hls/ directory
        location ~ ^/hls/(?<stream_id>[^/]+)/(?<file>.+)$ {
            auth_request /_resolveLive;
            auth_request_set $stream_key $upstream_http_x_stream_key;
            add_header X-Debug-Key $stream_key always;
            try_files /__never_exists__ /hls-serve/live/$stream_key/$file;
        }

        # to get the streamkey
        location = /_resolveLive {
            internal;
            proxy_pass http://job-server:3000/resolve-stream;
            proxy_pass_request_body off;
            proxy_set_header Content-Length "";
            proxy_set_header X-Original-URI $request_uri;
        }
```


### VOD - r2
the flow worked perfectly but the main problem still remained, VOD retrieval which is not lying in the disk but rather on the cloudflare servers(r2), and also the bucket is private so i cannot just directly fetch the urls; had the bucket not been using streamKeys as their naming convention but rather a uuid, i would have made the bucket public and just sent the uuid sent back to the client and client would then directly fetch from the r2, no middle man involved;

but because of the streamKeys bucket is private, i am tensed, life is difficult and dull.
(also because i want it to be pvt so no apps/websites can use my archive's)

Pre-signed urls seemed like the only way to access the bucket, apart from that -  spinning up a cloudflare worker and having it connect to the bucket every new request(which is just total idiocy cause the worker wouldn't add any benefit in speed, apart from increasing the work, and having me generate more api-keys.

so i created a flow similar to live-serve, with a little change; As soon as the nginx hits the sub-request to backend, it receives a Pre-signed url(X-Vod-Url).The client only ever talks to nginx and nginx is the one talking to R2, no redirect, no second client-side request, no exposed signed URL to breach the security of exactly 0 users;

```sh
        location ~ ^/vod/(?<stream_id>[^/]+)/(?<file>.+)$ {
            auth_request /_resolveVod;
            auth_request_set $vod_url $upstream_http_x_vod_url;
            proxy_ssl_server_name on;
            proxy_pass $vod_url;

            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Headers *;
            add_header Access-Control-Allow-Methods "GET, OPTIONS";
        }
        location = /_resolveVod {
            internal;
            proxy_pass http://backend:4000/resolve-vod;
            proxy_cache cache;
            proxy_cache_valid 200 5m;
            proxy_cache_key $request_uri;
            proxy_pass_request_body off;
            proxy_set_header Content-Length "";
            proxy_set_header X-Original-URI $request_uri;
        }
```


the flow now became something like -

 ![vod](/assets/backend/v3.png)

if i would have used redirecting, it hands the client a live signed URL (leaks nothing sensitive, but breaks HLS's cascading manifest references, since one signature covers one object). Proxying keeps nginx as the byte-relay so the client never sees R2 at all, and every nested segment reference resolves correctly through the same indirection, without ever handing out a raw r2 path.

### known Issues:

- Single-instance nginx serving all byte traffic from one region : Right now, every .ts file physically flows through one nginx container running on one machine, in one place. A person in Bihar and another in london both pull bytes through that same box, over whatever distance separates them from it, inducing latency;

  answer to this is No CDN edge distribution for VOD delivery - fixes issue 1, a CDN's whole job is caching content at edge nodes physically distributed near viewers, so repeat requests for the same segment, a  common case for VOD serve.

- Session-scoped tokens instead of per file resolve, it's less about performance and more about a gap I don't currently have an answer for: revocation. Right now, authorization happens per file  and every segment gets its own signature, checked independently. There's no way to cut off access mid playback if I ever needed to ban someone, a particular disturbing/not socially acceptable piece of content, whatever. A session token would flip this: issue one signed token when playback starts, scoped to that VOD, and every subsequent segment request;

- This is a difficult but interesting idea that my llm suggested, i am including it for pure pleasure, manifest-rewriting instead of full proxying. Right now every single file under a VOD master manifest, each variant playlist, every segment= independently triggers auth_request and gets proxied byte-for-byte through nginx. 

  Instead, only the first request (master.m3u8) should hit the resolve step; nginx would fetch that manifest from R2 server-side, parse it, and rewrite every relative reference inside it into a fully-signed, directly-fetchable R2 URL, recursively, since the variant playlists also list relative segment paths. After that one rewritten manifest goes out, the player follows those signed URLs straight to R2's edge for everything else. nginx stops being in the byte-relay business entirely and the hls fetches directly;


