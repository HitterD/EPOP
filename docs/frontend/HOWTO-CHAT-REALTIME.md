# Chat Realtime (Threads/Reactions/Receipts) — How to Verify

- Start dev: `pnpm dev`
- Open two tabs at `/chat/chat-1`.
- Send a message in tab A. It appears in tab B via WS.
- React to message from tab B (👍). Reaction appears in tab A.
- Click a message in tab B to mark as read (the UI will call receipt API); read count updates in both tabs.
- Kill/restart network (DevTools offline) and confirm reconnect banner shows; after reconnect, messages refetch and remain consistent.

## Notes
- Idempotency: POST message/reaction/read accepts `Idempotency-Key` and returns cached response if retried.
- Ordering: FE sorts by `serverTimestamp`/`createdAt` from server.
