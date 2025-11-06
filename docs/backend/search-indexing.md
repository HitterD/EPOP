# Search & Indexing (ZincSearch)

- **Service**: `backend/src/search/search.service.ts`
  - Zinc base URL from env (`ZINC_URL`), basic auth.
  - Index prefix: `ZINC_INDEX_PREFIX` (default `epop`). Final indices: `<prefix>_messages|mail_messages|files|tasks`.
  - Retry/backoff for transient errors.

- **Permission filtering (ACL)**
  - Results filtered per user with SQL checks:
    - Messages: membership via `chat_participants`.
    - Mail: sender/recipient checks.
    - Tasks: `project_members` membership.
    - Files: owner or linked via messages in chats user can access.

- **Endpoints** (`backend/src/search/search.controller.ts`)
  - `GET /search?q=...` — aggregated across entities.
  - `GET /search/:entity/cursor?q=...` — cursor-based results.
  - `PUT /search/index/:entity` — admin backfill/reindex.

- **Event-driven indexing** (`backend/src/search/search.subscriber.ts`)
  - Listens on Redis channels and indexes created docs:
    - `chat.message.created` → messages
    - `project.task.created` → tasks
    - `mail.message.created` → mail_messages

- **Notes**
  - Deletion/updates should publish corresponding events; implement if needed for full lifecycle.
