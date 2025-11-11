# Product Requirement Document (PRD) — EPOP

Generated from repository: HitterD/EPOP (local: `c:/EPop`)

Last indexed: 2025-11-10

---

## Daftar Isi

- [Ringkasan Eksekutif](#ringkasan-eksekutif)
- [Ruang Lingkup](#ruang-lingkup)
- [Persona & Use Cases Kunci](#persona--use-cases-kunci)
- [Arsitektur Produk (Mermaid)](#arsitektur-produk-mermaid)
- [Glossary & Definisi](#glossary--definisi)
- [Fitur per Modul](#fitur-per-modul)
  - [Frontend (Next.js/React)](#frontend-nextjsreact)
  - [Backend/API (NestJS)](#backendapi-nestjs)
  - [Worker/Queue/Scheduler](#workerqueuescheduler)
  - [Auth & Session](#auth--session)
  - [Admin & Directory](#admin--directory)
  - [Storage/NAS](#storagenas)
- [Kebutuhan Fungsional (dengan ID)](#kebutuhan-fungsional-dengan-id)
- [Kebutuhan Non-Fungsional](#kebutuhan-non-fungsional)
- [Matriks Peran & Izin](#matriks-peran--izin)
- [Model Data & Kontrak API](#model-data--kontrak-api)
- [Alur Login & Error Handling (Mermaid Sequence)](#alur-login--error-handling-mermaid-sequence)
- [Konfigurasi & Lingkungan](#konfigurasi--lingkungan)
- [Rencana Rilis (Phased Delivery)](#rencana-rilis-phased-delivery)
- [Uji & Penerimaan](#uji--penerimaan)
- [Risiko & Mitigasi](#risiko--mitigasi)
- [Open Questions / TBD](#open-questions--tbd)
- [Lampiran](#lampiran)
  - [RTM (Requirements Traceability Matrix)](#rtm-requirements-traceability-matrix)

---

## Ringkasan Eksekutif

- **Tujuan produk.** Kolaborasi ala Microsoft Teams: chat real-time, compose/mail, proyek/kanban/gantt, file, directory, notifikasi/PWA, presence, dan pencarian terpadu.
- **Stakeholder utama.** User akhir, Admin organisasi, Operator (workers), Auditor/QA.
- **Scope tinggi.** FE Next.js 14 (App Router) dengan Socket.IO; BE NestJS 11 (REST, Redis, BullMQ, PostgreSQL via TypeORM); Workers BullMQ; penyimpanan objek S3-kompatibel (MinIO) + ZincSearch; Kubernetes/Docker untuk infra.
- **Toolchain (terdeteksi).**
  - Frontend: Next `^14.2.33`, React `^18.3.1`, TS `^5.5.4` (`package.json`).
  - Backend: Nest `^11.x`, TypeORM `^0.3.27`, BullMQ `^5.63.0` (`backend/package.json`).
  - Node: root `engines.node >=18`, status doc merekomendasikan Node 20.x. Assumption: gunakan Node 20.x di CI/Prod, kompatibel Node 18 lokal. Sumber: `package.json`, `EPOP_STATUS_V3(Gemini).md`.

## Ruang Lingkup

- **In-scope.**
  - Frontend SPA (routing `(auth)` dan `(shell)`), PWA, i18n, aksesibilitas.
  - API REST NestJS (`/api[/v1]/*`) untuk auth, chat, projects, files, search, directory, analytics, workflows, calendar, presence, notifications, vitals, health, metrics.
  - Workers: email, search indexing, notification push, antivirus scan, calendar reminder, analytics agregasi, workflow executor.
  - Storage S3-kompatibel (MinIO), opsional secondary (Synology S3) untuk replikasi.
  - ZincSearch untuk pencarian.
- **Out-of-scope.**
  - Video/audio call (belum ada kode). Sumber: `README.md` (Future Enhancements).
  - Integrasi OAuth2/2FA (hanya tertulis di docs; belum ada implementasi penuh). Sumber: `EPOP_STATUS_V3(Gemini).md` (Backlog), `docs/backend/security.md` (rujukan bila ada). Tag: TBD.

## Persona & Use Cases Kunci

- **User.** Login, chat, kirim/terima pesan, unggah/unduh file, cari konten, kelola proyek/tugas, lihat agenda.
- **Admin.** Kelola unit organisasi, impor pengguna bulk (CSV), set kebijakan, melihat analitik ringkas.
- **Operator/Worker.** Memproses antrian email, indexing, scan antivirus, pengingat kalender, push notifikasi.
- **Auditor/QA.** Akses metrik `/metrics`, health `/health`, OpenAPI `/docs-json`, meninjau audit directory.

## Arsitektur Produk (Mermaid)

```mermaid
flowchart LR
  subgraph Client
    FE[Next.js 14 (App Router)]
    SW[Service Worker/PWA]
  end
  subgraph Server
    API[NestJS REST /api(/v1)]
    WS[Socket.IO (server.js)]
    WKR[Workers (BullMQ)]
  end
  subgraph Data Plane
    PG[(PostgreSQL via TypeORM)]
    S3[(MinIO S3 Compatible)]
    ZINC[(ZincSearch)]
    REDIS[(Redis)]
  end
  FE <--> WS
  FE --> API
  API --> PG
  API --> S3
  API --> ZINC
  API --> REDIS
  WKR --> PG
  WKR --> S3
  WKR --> ZINC
  WKR --> REDIS
```

Sumber: `next.config.js` (rewrites ke `http://localhost:4000/api`), `server.js` (Socket.IO), `backend/src/*` modules, `docker-compose*.yml`, `kubernetes/*.yaml`.

## Glossary & Definisi

- **App Router.** Next.js 14 berfolder `app/` dengan `route.ts` untuk API dan `page.tsx` untuk UI.
- **Cursor Pagination.** Pola `limit` + `cursor` (base64) di beberapa endpoint (`projects`, `files`, `search`).
- **Workers.** Proses Node terpisah (`backend/src/workers/*.ts`) konsumsi BullMQ queues.
- **S3 Secondary.** Profil S3 tambahan (opsional) untuk replikasi (Synology/eksternal). Sumber: `backend/.env.example`, `files.service.ts`.

## Fitur per Modul

### Frontend (Next.js/React)

- **Navigasi & route (pages).** Sumber: `app/(auth)/*`, `app/(shell)/*`.
  - `(auth)`: `/login`, `/register`, `/forgot-password`. Sumber: `app/(auth)/*/page.tsx`.
  - `(shell)`: `/dashboard`, `/chat`, `/chat/[chatId]`, `/mail`, `/mail/compose`, `/mail/[folder]`, `/projects`, `/projects/[projectId]` (+ `charts|gantt|grid|timeline`), `/files`, `/directory`, `/analytics`, `/admin/bulk-import`, `/admin/audit`, `/notifications`, `/settings`.
  - **Proteksi route** via `middleware.ts` menggunakan cookie `accessToken`.
- **State global.** Zustand + React Query. Rujukan: `lib/stores/*`, `lib/config/query-client.ts`.
- **Tema & UI.** Tailwind + shadcn/ui. Rujukan: `tailwind.config.ts`, `components/ui/*`.
- **Upload/attachments.** Flow FE -> `/api/files/presign|attach|confirm`, pratayang (PDF, image). Rujukan: `features/files/components/*`, `components/ui/file-dropzone.tsx`.
- **Pencarian.** FE command palette dan halaman `/search`. Rujukan: `components/search/global-search-command.tsx`, `app/(shell)/search/page.tsx`.
- **Auth UI.** `app/(auth)/login/page.tsx` dengan route API mock `app/api/auth/login/route.ts`.
- **PWA.** `next-pwa` konfigurasi, `public/manifest.json`, `app/sw.ts`.

### Backend/API (NestJS)

Catatan: Global prefix `/api`, versi URI default `v1` (lihat `backend/src/main.ts`).

- **Auth (`AuthController`).** Sumber: `backend/src/auth/auth.controller.ts`.
  - POST `/api/v1/auth/login` — set cookie `accessToken`/`refreshToken`, persist sesi di Redis.
  - POST `/api/v1/auth/refresh` — rotasi token, validasi `sess:jti`.
  - POST `/api/v1/auth/logout` — clear cookies.
  - POST `/api/v1/auth/password/forgot` — token reset via Redis + email (outbox/mailer).
  - POST `/api/v1/auth/password/reset` — verifikasi token, update hash argon2.
  - POST `/api/v1/auth/push/subscribe` — simpan subscription per user.
  - GET `/api/v1/auth/sessions` — daftar sesi aktif.
  - DELETE `/api/v1/auth/sessions/:id` — revoke sesi.
  - POST `/api/v1/auth/sessions/revoke-all` — kecuali sesi saat ini.
- **Chat (`ChatController`).** Sumber: `backend/src/chat/chat.controller.ts`.
  - GET `/api/v1/chats` | POST `/api/v1/chats`.
  - GET `/api/v1/chats/:chatId/messages` (paging) | GET `.../cursor`.
  - POST `/api/v1/chats/:chatId/messages` — kirim.
  - GET `/api/v1/chats/:chatId/threads`.
  - POST/DELETE `/api/v1/chats/:chatId/reactions`.
  - POST `/api/v1/chats/:chatId/reads` | POST `.../messages/:messageId/edit` | DELETE `.../messages/:messageId`.
  - GET `/api/v1/chats/unread`.
- **Projects (`ProjectsController`).** Sumber: `backend/src/projects/projects.controller.ts`.
  - GET `/api/v1/projects/mine` | POST `/api/v1/projects`.
  - POST `/api/v1/projects/:projectId/members`.
  - POST `/api/v1/projects/:projectId/buckets` | GET `.../buckets` | POST `.../buckets/:bucketId/reorder`.
  - POST `/api/v1/projects/:projectId/tasks` | GET `.../tasks` | GET `.../tasks/cursor`.
  - POST/PATCH `/api/v1/projects/:projectId/tasks/:taskId/move` | POST `.../tasks/:taskId/comments` | POST `.../tasks/:taskId/reschedule`.
  - GET `/api/v1/projects/:projectId/dependencies` | GET `.../tasks/:taskId/dependencies` | POST `.../dependencies` | DELETE `.../dependencies/:predecessorId/:successorId`.
- **Files (`FilesController`).** Sumber: `backend/src/files/files.controller.ts`.
  - POST `/api/v1/files/presign` | POST `/api/v1/files/attach` | POST `/api/v1/files/:id/confirm`.
  - GET `/api/v1/files/mine/cursor` | GET `/api/v1/files` | GET `/api/v1/files/:id` | GET `/api/v1/files/:id/download`.
  - PATCH `/api/v1/files/:id/status` (admin) | PATCH `/api/v1/files/:id/retention`.
  - POST `/api/v1/files/purge-temp` (admin) | POST `/api/v1/files/purge-retention` (admin) | GET `/api/v1/files/:id/versions`.
- **Directory (`DirectoryController`).** Sumber: `backend/src/directory/directory.controller.ts`.
  - GET `/api/v1/directory/tree` | POST `/api/v1/directory` | PATCH/DELETE `/api/v1/directory/:id` | POST `/api/v1/directory/:id/move`.
  - GET `/api/v1/directory/:id/users` | POST `/api/v1/directory/users/:userId/move`.
  - POST `/api/v1/directory/import/dry-run` | POST `/api/v1/directory/import/commit` (admin, upload CSV via `multer`).
- **Notifications (`NotificationsController`).** Sumber: `backend/src/notifications/notifications.controller.ts`.
  - GET `/api/v1/notifications/prefs|settings` | PUT `/api/v1/notifications/prefs|settings`.
  - POST `/api/v1/notifications/test-email`.
- **Compose/Mail (`ComposeController`).** Sumber: `backend/src/compose/compose.controller.ts`.
  - GET `/api/v1/compose/mails?folder=received|sent|deleted` (paging sederhana).
  - POST `/api/v1/compose/send` | POST `/api/v1/compose/:id/move`.
- **Search (`SearchController`).** Sumber: `backend/src/search/search.controller.ts`.
  - GET `/api/v1/search?q=...&tab=...` (all/messages/files/projects) — akses dibatasi user.
  - PUT `/api/v1/search/index/:entity` (admin backfill) | GET `/api/v1/search/:entity/cursor` (cursor-based).
- **Presence (`PresenceController`).** Sumber: `backend/src/presence/presence.controller.ts`.
  - POST `/api/v1/presence/heartbeat` | GET `/api/v1/presence/me`.
- **Users (`UsersController`).** Sumber: `backend/src/users/users.controller.ts`.
  - GET `/api/v1/users/me` | PATCH `/api/v1/users/me` | POST `/api/v1/users/me/presence`.
- **Me (`MeController`, versioned).** Sumber: `backend/src/users/me.controller.ts`.
  - GET `/api/v1/me/summary`.
- **Calendar (`CalendarController`).** Sumber: `backend/src/calendar/calendar.controller.ts`.
  - GET/POST/PATCH/DELETE `/api/v1/calendar/events`.*
  - GET `/api/v1/calendar/ics/feed?token=...` (publik via token) | POST `/api/v1/calendar/ics/import`.
- **Workflows (`WorkflowsController`).** Sumber: `backend/src/workflows/workflows.controller.ts`.
  - CRUD `/api/v1/workflows` + enable/disable + `POST /run:test`.
- **Analytics (`AnalyticsController`).** Sumber: `backend/src/analytics/analytics.controller.ts`.
  - GET `/api/v1/analytics/summary` | GET `/api/v1/analytics/timeseries`.
- **Admin (`AdminController`).** Sumber: `backend/src/admin/admin.controller.ts`.
  - POST `/api/v1/admin/users/bulk-import` (CSV) | GET `/api/v1/admin/analytics`.
- **Vitals (FE web-vitals) (`VitalsController`, versioned).** Sumber: `backend/src/vitals/vitals.controller.ts`.
  - POST `/api/v1/vitals` (rate-limited, menerima anonim + userId opsional).
- **Health/Observability.**
  - GET `/api/health/live|ready|` — `Terminus` DB ping. Sumber: `backend/src/health/health.controller.ts`.
  - GET `/metrics` — prom-client register (tanpa prefix/versi). Sumber: `backend/src/metrics/metrics.controller.ts`, `main.ts` exclude metrics dari prefix.
  - GET `/api/docs` + `/docs-json` — Swagger/OpenAPI. Sumber: `backend/src/main.ts`.

> Total terdata: ±100 endpoint (lihat ringkasan di akhir). Semua endpoint di atas dilindungi `AuthGuard('jwt')` kecuali yang dinyatakan publik (vitals, ics feed, health, metrics beberapa kasus). RBAC tambahan via `@Roles('admin')` di Files, Directory import, Search backfill, Admin.

### Worker/Queue/Scheduler

- **Queues (BullMQ).** Sumber: `backend/src/queues/queues.module.ts`.
  - `email`, `search`, `notification`, `filescan`, `dead` (DLQ).
- **Workers aktif.** Sumber: `backend/src/workers/worker.module.ts` + file worker.
  - Email: `backend/src/workers/email.worker.ts` — kirim via SMTP; metrics `email_send_total`.
  - Search Indexer: `backend/src/workers/search.worker.ts` — `index_doc|backfill|delete_doc` untuk `messages|mail_messages|files|tasks`.
  - Notification Pusher: `backend/src/workers/notification.worker.ts` (file ada) — push payload.
  - File Scan (ClamAV): `backend/src/workers/file-scan.worker.ts` — stream S3 ke clamd; update status file.
  - Files Lifecycle: `backend/src/workers/files-lifecycle.worker.ts` — housekeeping (ada file).
  - Calendar Reminder: `backend/src/workers/calendar-reminder.worker.ts` — interval 30s, cek event, kirim email/push.
  - Analytics Aggregator: `backend/src/workers/analytics-aggregator.worker.ts` — agregasi harian (file ada).
  - Workflow Executor: `backend/src/workers/workflow-executor.worker.ts` — eksekusi workflow (file ada).
- **Pemicu & retry/backoff.** Ada di masing-masing worker (`attempts`, `backoff` exponential/fixed). Idempoten dicapai via kunci Redis (contoh reminder key) dan natural upsert index di Zinc.

### Auth & Session

- **Metode login.** Cookie httpOnly `accessToken` (±900s) dan `refreshToken` (±14–30 hari); state sesi di Redis: `sess:user:{userId}` (set sid), `sess:data:{sid}`, `sess:jti:{sid}`. Sumber: `auth.controller.ts`.
- **Refresh token.** `POST /auth/refresh` validasi `jti` & rotasi cookies.
- **Logout.** Clear cookies.
- **Proteksi FE.** `middleware.ts` cek `accessToken` → redirect root `/` ke `/dashboard` jika login, else `/login`.
- **Push Subscribe.** `POST /auth/push/subscribe` menyimpan subscription per user (Redis).
- **Password reset.** `forgot` simpan token acak (Redis), `reset` verifikasi + hash `argon2`.

### Admin & Directory

- **Org tree CRUD.** `GET/POST/PATCH/DELETE /directory/*`.
- **Move unit/pengguna.** `POST /directory/:id/move`, `POST /directory/users/:userId/move`.
- **Impor CSV.** `POST /directory/import/dry-run|commit` dengan `multer` memory storage, limit 5MB.
- **Bulk import users.** `/admin/users/bulk-import` CSV validasi.

### Storage/NAS

- **Presign & finalisasi.** `files.service.ts`: `presign()` → `uploads-temp/*` (50MB limit) → `confirm()` copy ke `uploads/<id>-<filename>`.
- **Attach & ACL.** `attach()` link ke `messages|mail_messages|tasks`, validasi MIME allowlist, size limit; `download` cek ACL via query join.
- **Retention & Versioning.** `updateRetention()`, `purgeRetentionExpired()`, `listVersions()`.
- **Antivirus.** Worker `file-scan.worker.ts` (opsional `CLAMAV_ENABLED=true`).
- **Replikasi sekunder.** `replicateToSecondary()` ke S3 secondary jika diaktifkan.

## Kebutuhan Fungsional (dengan ID)

Format: ID · Deskripsi · Sumber · Aktor · Prioritas · Acceptance Criteria (G/W/T)

- **REQ-AUTH-001** · Login dengan cookie httpOnly dan sesi Redis.
  - Sumber: `backend/src/auth/auth.controller.ts` (`login()`), `middleware.ts`.
  - Aktor: User. Prioritas: P0.
  - AC: Given kredensial valid, When POST `/api/v1/auth/login`, Then cookies `accessToken` dan `refreshToken` terset dan FE redirect ke `/dashboard`.
- **REQ-AUTH-002** · Refresh token aman dengan validasi `jti`.
  - Sumber: `auth.controller.ts` (`refresh()`). Aktor: User. P0.
  - AC: Given `refreshToken` valid, When POST `/api/v1/auth/refresh`, Then token baru terset dan `sess:jti:{sid}` diperbarui.
- **REQ-AUTH-003** · Manajemen sesi (list/revoke/revoke-all).
  - Sumber: `auth.controller.ts` (`listSessions()`, `revokeSession()`, `revokeAllSessions()`). Aktor: User. P1.
  - AC: Given login multi-sesi, When GET `/auth/sessions`, Then daftar berisi `isCurrent`; When DELETE id selain current, Then sesi hilang.
- **REQ-FE-001** · Proteksi navigasi via middleware.
  - Sumber: `middleware.ts`. Aktor: User. P0.
  - AC: Given belum login, When akses `/dashboard`, Then redirect ke `/login`; Given sudah login, When akses `/login`, Then redirect `/dashboard`.
- **REQ-FE-002** · Chat UI kirim/terima (realtime via Socket.IO).
  - Sumber: `server.js` (event `chat.message.created`), `features/chat/*`. Aktor: User. P0.
  - AC: Given koneksi WS, When kirim pesan, Then penerima di room menerima event dan UI menampilkan pesan baru.
- **REQ-BE-001** · Chat REST list/send/edit/delete/reactions/reads.
  - Sumber: `chat.controller.ts`. Aktor: User. P0.
  - AC: Given anggota chat, When POST `/:chatId/messages`, Then 201 dan data pesan; Given not member, Then 403. (TBD detail guard di service).
- **REQ-BE-002** · Projects CRUD ringkas, tasks, buckets, dependencies, reschedule.
  - Sumber: `projects.controller.ts`. Aktor: User (member). P0.
  - AC: Given member project, When POST task pada bucket, Then task muncul di list `GET .../tasks`.
- **REQ-BE-003** · Files presign/attach/confirm/download.
  - Sumber: `files.controller.ts`, `files.service.ts`. Aktor: User/Admin. P0.
  - AC: Given presign sukses, When upload PUT ke S3, Then `confirm()` memindah `uploads-temp`→`uploads` dan status `scanning|ready` sesuai AV.
- **REQ-BE-004** · Files retention & versioning.
  - Sumber: `files.service.ts`. Aktor: Admin. P2.
  - AC: Given policy `90d`, When PATCH `/files/:id/retention`, Then properti `retentionExpiresAt` terset.
- **REQ-BE-005** · Directory CRUD + import CSV.
  - Sumber: `directory.controller.ts`. Aktor: Admin. P1.
  - AC: Given file CSV valid, When POST `/directory/import/dry-run`, Then hasil validasi; When `commit`, Then perubahan diterapkan.
- **REQ-BE-006** · Notifications prefs/settings & test email.
  - Sumber: `notifications.controller.ts`. Aktor: User. P2.
  - AC: Given ubah `pushEnabled`, When PUT `/notifications/prefs`, Then GET mengembalikan nilai baru.
- **REQ-BE-007** · Search multi-entitas dengan filter akses.
  - Sumber: `search.controller.ts`, `search.service.ts`. Aktor: User/Admin. P1.
  - AC: Given user X, When GET `/search?tab=files&q=...`, Then hasil hanya file accessible (join checks) dan `total` konsisten.
- **REQ-WRK-001** · Indexer menulis dokumen ke Zinc dan backfill.
  - Sumber: `search.worker.ts`. Aktor: Worker. P1.
  - AC: Given entity baru, When job `index_doc`, Then ada `_doc/{id}` di index prefiks `epop_*`.
- **REQ-WRK-002** · Email worker mengirim via SMTP dan mencatat metrik.
  - Sumber: `email.worker.ts`. Aktor: Worker. P2.
  - AC: Given job valid, When diproses, Then `email_send_total{status="success"}` bertambah.
- **REQ-WRK-003** · Antivirus scanning opsional.
  - Sumber: `file-scan.worker.ts`. Aktor: Worker. P1.
  - AC: Given CLAMAV_ENABLED=true, When job `filescan` diproses, Then status file `ready|infected|failed` diperbarui.
- **REQ-BE-008** · Calendar events CRUD, ICS feed/token, ICS import.
  - Sumber: `calendar.controller.ts`. Aktor: User. P2.
  - AC: Given token valid, When GET `calendar/ics/feed`, Then response `text/calendar`.
- **REQ-BE-009** · Workflows CRUD & run test.
  - Sumber: `workflows.controller.ts`. Aktor: Admin/User (TBD). P2.
  - AC: Given create body valid, When POST `/workflows`, Then record tersimpan dan dapat `enable/disable`.
- **REQ-BE-010** · Vitals endpoint menerima anonim dengan throttle.
  - Sumber: `vitals.controller.ts`. Aktor: FE. P2.
  - AC: Given payload `VitalsDto`, When POST `/vitals`, Then 200 OK dan tersimpan (service).
- **REQ-BE-011** · Health & Metrics.
  - Sumber: `health.controller.ts`, `metrics.controller.ts`. Aktor: Ops. P0.
  - AC: GET `/metrics` kembalikan `text/plain` prom metrics; `/health/ready` DB OK.

> Catatan: beberapa proteksi level service/guard spesifik tidak ditinjau di sini (TBD), namun `AuthGuard('jwt')` dan `@Roles('admin')` terlihat pada controller terkait.

## Kebutuhan Non-Fungsional

- **NFR-001** · Keamanan header & CORS.
  - Sumber: `backend/src/main.ts` (helmet, CORS). AC: Response berisi CSP defaultSrc none; origins sesuai `CORS_ORIGIN`.
- **NFR-002** · Validasi global (DTO whitelist, forbid non-whitelisted, transform).
  - Sumber: `main.ts` ValidationPipe. AC: Payload liar ditolak 400.
- **NFR-003** · Rate limit untuk vitals.
  - Sumber: `vitals.controller.ts` `@Throttle`. AC: >10 req/detik diblokir.
- **NFR-004** · Observabilitas (metrics, tracing id, histograms search, counters).
  - Sumber: `metrics.controller.ts`, `search.service.ts` (prom counters/hist), `trace-id.middleware.ts` (referensi di `main.ts`). AC: `/metrics` memuat metrik.
- **NFR-005** · Performa pencarian p95 ≤ 500ms (Assumption, lihat histogram). Sumber: `search.service.ts` (buckets). AC: Histogram tidak dominan >0.5s (TBD pengukuran).
- **NFR-006** · Aksesibilitas FE (WCAG 2.1 AA praktik). Sumber: `ACCESSIBILITY_AUDIT.md`, komponen a11y di `components/accessibility/*`. AC: E2E tidak mendeteksi critical violations (TBD alat CI).
- **NFR-007** · i18n en/id. Sumber: `messages/`, `i18n.ts`. AC: Teks kunci tersedia dalam en/id.
- **NFR-008** · PWA siap produksi. Sumber: `next.config.js` (next-pwa), `public/manifest.json`. AC: Lighthouse PWA pass (TBD threshold).
- **NFR-009** · Budgets bundle. Sumber: `next.config.js` performance hints. AC: Entrypoint ≤300KB gzip, asset ≤150KB (warning bila lebih).
- **NFR-010** · Idempoten & anti-duplikat pekerjaan.
  - Sumber: kunci Redis di reminder, Zinc index idempotent by id. AC: Run ganda tidak menduplikasi hasil.
- **NFR-011** · Privasi & retensi file. Sumber: `files.service.ts` retention. AC: `purgeRetentionExpired` menghapus sebelum now.
- **NFR-012** · Stabilitas antrian.
  - Sumber: semua workers define `attempts/backoff`. AC: Kegagalan transien retry sesuai kebijakan.

## Matriks Peran & Izin

| Resource/Endpoint | User | Admin |
|---|:---:|:---:|
| `/api/v1/auth/*` (login/refresh/logout/sessions) | Allow | Allow |
| `/api/v1/chats/*` | Allow (anggota chat) | Allow |
| `/api/v1/projects/*` | Allow (member) | Allow |
| `/api/v1/files/presign|attach|confirm|get|download` | Allow | Allow |
| `/api/v1/files/:id/status`, `/files/purge-*` | Deny | Allow |
| `/api/v1/directory/*` CRUD | Deny | Allow |
| `/api/v1/directory/import/*` | Deny | Allow |
| `/api/v1/notifications/prefs|settings|test-email` | Allow | Allow |
| `/api/v1/compose/*` | Allow | Allow |
| `/api/v1/search` (query) | Allow | Allow |
| `/api/v1/search/index/:entity` | Deny | Allow |
| `/api/v1/admin/*` | Deny | Allow |
| `/api/v1/analytics/*` | Allow | Allow |
| `/api/v1/workflows/*` | TBD | TBD |
| `/api/v1/vitals` | Allow (anon OK) | Allow |
| `/metrics`, `/api/health/*`, `/api/docs` | Allow (read-only) | Allow |

Sumber: anotasi `@UseGuards(AuthGuard('jwt'))`, `@Roles('admin')` pada controller.

## Model Data & Kontrak API

- **Entitas utama (TypeORM).** Sumber: `backend/src/entities/*`.
  - `User`, `Chat`, `Message`, `MessageReaction`, `MessageRead`, `Project`, `ProjectMember`, `Task`, `TaskBucket`, `TaskComment`, `FileEntity`, `FileLink`, `MailMessage`, `OrgUnit`, `NotificationPreferencesEntity`, `CalendarEvent`, `Workflow`, `WorkflowRun`, `AnalyticsDaily`.
- **DTO ringkas (contoh).**
  - Auth: `LoginDto` (`backend/src/auth/dto/login.dto` — rujukan path).
  - Projects: `CreateProjectDto`, `CreateTaskDto`, `MoveTaskDto`, `ReorderTasksDto`, `RescheduleTaskDto` (`backend/src/projects/dto/requests.dto`).
  - Chat: `CreateChatDto`, `SendMessageDto`, `EditMessageDto`, `ReactionDto` (`backend/src/chat/dto/requests.dto`).
  - Files: `PresignResponseDto`, `AttachResponseDto` (`backend/src/files/dto/*`).
  - Vitals: `VitalsDto` (`backend/src/vitals/dto/vitals.dto`).
- **Kontrak respons**: disediakan via `@nestjs/swagger` di beberapa endpoint (`ApiOkResponse`). OpenAPI tersedia di `/docs-json`.

## Alur Login & Error Handling (Mermaid Sequence)

```mermaid
sequenceDiagram
  participant FE as Frontend (Next.js)
  participant API as NestJS AuthController
  participant REDIS as Redis (sessions)

  FE->>API: POST /api/v1/auth/login {email, password}
  API->>API: validateUser(email, password)
  API->>REDIS: SADD sess:user:{uid} sid; SET sess:data:{sid}; SET sess:jti:{sid}
  API-->>FE: Set-Cookie accessToken, refreshToken; { success: true }
  FE->>FE: Redirect /dashboard (middleware)

  Note over FE,API: Error paths
  FE->>API: POST /auth/login (invalid)
  API-->>FE: 401 { INVALID_CREDENTIALS }

  FE->>API: POST /api/v1/auth/refresh (refreshToken)
  API->>REDIS: GET sess:jti:{sid} == jti?
  API-->>FE: Set-Cookie accessToken/refreshToken (rotated)
```

Sumber: `backend/src/auth/auth.controller.ts`, `middleware.ts`.

## Konfigurasi & Lingkungan

- **Frontend `.env.local.example`.** Sumber: `/.env.local.example`.
  - `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`.
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_EXPIRY`.
  - Flags: `NEXT_PUBLIC_ENABLE_REGISTRATION`, `NEXT_PUBLIC_ENABLE_PWA`.
  - (Komentar untuk MinIO/Zinc/SMTP/DB sebagai future toggles).
- **Backend `.env.example`.** Sumber: `/backend/.env.example`.
  - App/CORS/PORT; DB (`DB_*`), `REDIS_URL`.
  - MinIO (`MINIO_*`), Secondary S3 (`S3_SECONDARY_*`).
  - Zinc (`ZINC_*`), SMTP, VAPID.
  - Rate limit (`RATE_LIMIT_*`), JWT (`JWT_*`, `COOKIE_DOMAIN`), ICS secret.
  - Workers concurrency; TypeORM logging & slow query threshold.

## Rencana Rilis (Phased Delivery)

- **M1 (MVP):** Auth (login/refresh/logout), Chat list/send, Projects list/create + tasks basic, Files presign/confirm/download, Search query (messages/files/tasks), Directory tree view, Dashboard summary, Vitals/Health/Metrics. Dependency: Redis, MinIO, Zinc, Postgres.
- **M2:** Directory admin (import/move), Notifications prefs + test email, Calendar ICS feed/import & reminders, Retention/versioning files, Workflows CRUD, Analytics summary/timeseries.
- **M3:** Antivirus ClamAV enable, Secondary S3 replication, Advanced search ranking/snippets, Admin bulk-import users, Contract tests CI. (Beberapa sudah ada dasar implementasinya.)

Sumber: `README.md`, `EPOP_STATUS_V3(Gemini).md`, `blueprint.md`.

## Uji & Penerimaan

- **E2E (Playwright).** Sumber: `e2e/*.spec.ts`.
  - Auth redirect/login, Chat messaging, File management, Projects & tasks.
- **Visual tests.** Sumber: `tests/visual/components.visual.spec.ts`.
- **OpenAPI contract (docs).** Sumber: `backend/.github/workflows/backend-ci.yml` (di status doc), `backend/dredd.yml` (repo berisi file Dredd). Tag: sebagian lintasan TBD.

Checklist smoke FE/BE minimal:
- **Auth**: login → dashboard, refresh token bekerja, sesi terdaftar.
- **Chat**: list → send → receive (WS event diterima di tab lain) — TBD test multi-context.
- **Files**: presign→upload→confirm→download; scan AV jika aktif.
- **Search**: tab messages/files/projects mengembalikan hasil sesuai ACL.

## Risiko & Mitigasi

- **Keamanan input & mass assignment.** Mitigasi: ValidationPipe global + DTO (tersedia). Sumber: `main.ts`, `dto/*`.
- **Ketergantungan service eksternal (Zinc/MinIO/Redis).** Mitigasi: retry/backoff di client (Zinc), DLQ.
- **Hydration/SSR mismatch FE.** Mitigasi: `'use client'` pada komponen interaktif; lint strict (lihat `TS_Runtime_Audit.md`).
- **Ukuran unggahan & antivirus.** Mitigasi: limit 50MB, alur scan async, blok download bila infected.

## Open Questions / TBD

- **[TBD-01]** Versi Node baku di prod (18 vs 20). Sumber: `package.json` vs `EPOP_STATUS_V3(Gemini).md` — rekomendasi 20.x.
- **[TBD-02]** Otorisasi detail di service layer (chat membership, project member) — guard service tidak seluruhnya diinspeksi.
- **[TBD-03]** Peran Workflows (admin-only atau user tertentu?) — tidak eksplisit di controller.
- **[TBD-04]** Indeks Zinc untuk `users` belum didukung — FE tab users harus fallback (lihat `search.controller.ts`).
- **[TBD-05]** Integrasi FE API mock (`app/api/*`) vs BE NestJS — di prod diarahkan via `next.config.js` rewrites ke port 4000; perlu konsolidasi.

## Lampiran

### RTM (Requirements Traceability Matrix)

| Requirement ID | File/Route/Komponen | Test/Checklist |
|---|---|---|
| REQ-AUTH-001 | `backend/src/auth/auth.controller.ts@login()` · `middleware.ts` | `e2e/auth-login.spec.ts` |
| REQ-AUTH-002 | `backend/src/auth/auth.controller.ts@refresh()` | Manual: cookie rotasi |
| REQ-AUTH-003 | `backend/src/auth/auth.controller.ts@listSessions|revokeSession|revokeAllSessions` | Manual |
| REQ-FE-001 | `middleware.ts` | `e2e/auth-redirect.spec.ts` |
| REQ-FE-002 | `server.js` (WS) · `features/chat/*` | `e2e/chat-messaging.spec.ts` |
| REQ-BE-001 | `backend/src/chat/chat.controller.ts` | `e2e/chat-messaging.spec.ts` (parsial) |
| REQ-BE-002 | `backend/src/projects/projects.controller.ts` | `e2e/projects-tasks.spec.ts` |
| REQ-BE-003 | `backend/src/files/*` | `e2e/file-management.spec.ts` |
| REQ-BE-004 | `backend/src/files/files.service.ts@updateRetention|purgeRetentionExpired|listVersions` | Manual |
| REQ-BE-005 | `backend/src/directory/directory.controller.ts` | Manual (CSV import) |
| REQ-BE-006 | `backend/src/notifications/notifications.controller.ts` | Manual |
| REQ-BE-007 | `backend/src/search/*` | Manual + logics ACL verified |
| REQ-WRK-001 | `backend/src/workers/search.worker.ts` | Unit `backend/src/workers/search.worker.spec.ts` |
| REQ-WRK-002 | `backend/src/workers/email.worker.ts` | Manual (MailHog) |
| REQ-WRK-003 | `backend/src/workers/file-scan.worker.ts` | Manual (clamd) |
| REQ-BE-008 | `backend/src/calendar/calendar.controller.ts` | Manual (ICS viewer) |
| REQ-BE-009 | `backend/src/workflows/workflows.controller.ts` | Manual |
| REQ-BE-010 | `backend/src/vitals/vitals.controller.ts` | Manual curl |
| NFR-001 | `backend/src/main.ts` | Smoke CORS/headers |
| NFR-002 | `backend/src/main.ts` | Negative DTO tests |
| NFR-004 | `backend/src/metrics/metrics.controller.ts`, `search.service.ts` | `GET /metrics` |

---

Dokumen ini hanya menyatakan fakta yang ditemukan di repo/dokumen. Semua area yang belum terbukti di kode diberi label TBD/Assumption dengan alasan jelas.
