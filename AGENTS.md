# Working in the studio (for agents)

The studio at `https://cms.armanckeser.com/cms` is where Armanc and an agent write
posts together. The page and you call the same HTTP API, so you can do anything
the page can: read a draft, edit it, comment on a passage, answer a comment,
publish. `GET /cms/api` lists every route. You don't need anything else.

## Reaching it

It is on the tailnet only. `cms.armanckeser.com` resolves to the Pi's tailnet
address; from the home LAN without Tailscale, pin it to the Pi:

```bash
S=https://cms.armanckeser.com/cms/api
alias st='curl -sS -H "content-type: application/json"'
# Off the tailnet, on the LAN:
alias st='curl -sS -k --resolve cms.armanckeser.com:443:10.0.0.12 -H "content-type: application/json"'
```

Requests are made as Claude unless they send `x-studio-actor: armanc`. Don't send
that header; the writer sees who did what.

## The loop

1. **Listen.** Keep the event stream open while you work; while it's open the
   writer sees "Claude is listening" and comments come to you as they're left:
   `while true; do curl -sN "$S/events?as=claude"; sleep 1; done` (run it under a
   monitor; each `event: thread` with `"change":"created"` or `"replied"` is
   something to look at). The proxy closes the stream every 30 seconds, hence
   the loop; the writer keeps seeing you as listening across those gaps.
2. **Catch up.** `st $S/inbox` lists every thread, across posts, where the writer
   spoke last.
3. **Read the post** before answering: `st $S/posts/<slug>` (meta, body, threads),
   or `?format=svx` for the file as it is on disk.
4. **Say what you're doing.** `st -X POST $S/posts/<slug>/presence -d '{"status":"Reading your comments"}'`
   shows in the header next to your avatar for 90 seconds.
5. **Answer in the thread**, or change the text and say so in the thread:
   - reply: `st -X PATCH $S/posts/<slug>/threads/<id> -d '{"reply":"…"}'`
   - edit: `st -X POST $S/posts/<slug>/edits -d '{"edits":[{"find":"exact text","replace":"new text"}]}'`
     (exact matches, applied in order; a miss returns 409 and changes nothing)
   - resolve when the point is settled: `-d '{"resolved":true}'`
   - start a thread on a passage: `st -X POST $S/posts/<slug>/threads -d '{"quote":"text in the post","body":"…"}'`

Your edits appear in the writer's editor as you make them, with your cursor where
you changed the text, and the rendered page next to it updates.

## Rules

- **The words are Armanc's.** Fix typos, broken links and markup freely. Anything
  that changes what a sentence says goes in a comment as a suggestion, unless he
  asked you to write it. Match his voice when he does ask (plain words, specific
  numbers, no em dashes).
- **Publishing is his call.** `POST $S/posts/<slug>/publish` commits to `main` and
  deploys the public site. Only on an explicit yes for that post.
- Drafts are untracked files on the Pi and never reach GitHub (the repo is public)
  until they're published. Don't commit them from anywhere else.
- New interactive components: write them in a clone of this repo, push to `main`,
  then `st -X POST $S/pull` so the studio has them, then import them in the post.
