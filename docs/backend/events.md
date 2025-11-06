# Real-time Events (Socket.IO)

- **Gateway & transport**
  - Redis pub/sub channels: `epop.<eventName>` from outbox publisher.
  - Socket.IO namespace `/ws` with Redis adapter. Source: `backend/src/gateway/socket.gateway.ts`.

- **Naming convention**
  - Dotted: `domain.entity.action` (e.g., `chat.message.created`).
  - Also emitted in colon style for FE compatibility: `chat:message_created`.

- **Rooms**
  - `chat:<chatId>`, `project:<projectId>`, `user:<userId>`; join/leave handlers in `SocketGateway`.

- **Payload shape (standardized in gateway)**
  - `{ ...evt, ids, patch?, ts, actorId, requestId }`
  - `ids` is a set of related IDs; `patch` for partial updates; `ts` ISO string; `actorId` user ID; `requestId` echoes request.

- **Emitted events by module (non-exhaustive)**
  - Chat (`backend/src/chat/chat.service.ts`):
    - `chat.participant.joined`
    - `chat.message.created`
    - `chat.message.updated` (edit)
    - `chat.message.deleted`
    - `chat.message.read`
    - `chat.message.reaction.added`
    - `chat.message.reaction.removed`
  - Projects (`backend/src/projects/projects.service.ts`):
    - `project.task.created`
    - `project.task.moved`
    - `project.task.updated` (various state changes)
    - `project.task.commented`
  - Directory (`backend/src/directory/directory.service.ts`):
    - `directory.unit.moved`
    - `directory.user.moved`
  - Mail/Compose (`backend/src/compose/compose.service.ts`):
    - `mail.message.created`
    - `mail.message.moved`
  - Users/Auth (`backend/src/auth/auth.controller.ts`):
    - `user.password.reset.requested`
    - `user.password.reset.completed`
  - Presence/Notifications (usage):
    - `user.presence.updated` (emitted for urgent messages to trigger notification paths)

- **Ack & delivery**
  - For critical flows, FE may send ack callbacks; server broadcasts via rooms.

- Refer to `backend/src/events/outbox.service.ts` and `backend/src/events/publisher.service.ts` for event persistence and publishing.
