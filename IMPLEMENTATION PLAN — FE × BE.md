IMPLEMENTATION PLAN — FE × BE (berdasarkan FE_BE_GAP.md)

Catatan: Bagian ini menurunkan seluruh rekomendasi di atas menjadi tasklist eksekusi yang dapat di-run lintas tim. Setiap task ditandai [P0|P1|P2] dan kolom status default TODO. Update status seiring progres.

✅ Definition of Done (DoD)

Semua P0 lulus Acceptance Checks yang sudah ditulis di dokumen ini.

OpenAPI tervalidasi, kontrak dikunci via CI (contract tests) dan FE typegen sinkron.

Event WS distandardisasi dan didokumentasikan.

Seed data tersedia agar dashboard tidak kosong.

/docs diperbarui otomatis pada setiap PR merge.

🧩 Tasklist — Frontend (Next.js 14, React, Zustand, SVAR)
ID	Task	Priority	Status
FE-1	Konsolidasi auth client: cookie httpOnly only, intercept 401→refresh→retry, hard logout on fail	P0	DONE
FE-2	Session Center: halaman daftar sesi & revoke	P1	DONE
FE-3	RBAC UI gating: AuthStore + <IfCan/> wrapper	P0	DONE
FE-4	Migrasi semua list ke cursor pagination (useInfiniteQuery)	P0	DONE
FE-5	Tambahkan Idempotency-Key pada POST/PATCH rawan duplikasi	P0	DONE
FE-6	Socket event bus (useDomainEvents) + reconcile optimistik tempId→serverId	P0	DONE
FE-7	Chat: Thread side‑pane + virtualized stream; reactions/read counters	P0	DONE
FE-8	Chat: Attachment preview (mime heuristics) + typing/presence debounced	P1	DONE
FE-9	Compose/Mail: Editor + HTML sanitize render, folder ops (move/restore/bulk)	P0	DONE
FE-10	Compose/Mail: Toggle “Send as Mail” dari chat compose + autolink files	P1	DONE
FE-11	Files: Presign upload direct→MinIO; status (pending/scanning/ready)	P0	DONE
FE-12	Projects: Sinkron lintas Board/Grid/Gantt/Schedule dari task.updated	P0	DONE
FE-13	Projects: Drag reorder + rollback; TZ via date-fns-tz	P1	DONE
FE-14	Directory: Tree drag‑move → update & audit viewer; Bulk import UI (dry-run)	P0	DONE
FE-15	Search: Tabs (Messages/Projects/Users/Files), highlight, filters; hormati ACL	P0	DONE
FE-16	Notifications: Center + Settings; Web Push subscribe/store	P1	DONE
FE-17	Observability: kirim X-Request-Id; ErrorBoundary dengan traceId	P1	DONE
FE-18	Performance: SWR policy (staleTime/cacheTime), ETag handling	P1	TODO
FE-19	i18n/A11y: next-intl + audit Axe; focus traps & shortcuts	P2	TODO
🧱 Tasklist — Backend (NestJS, PostgreSQL, Redis, MinIO, Zinc)
ID	Task	Priority	Status
BE-1	Auth: refresh‑token rotation + sesi per device; /auth/sessions & revoke	P0	DONE
BE-2	Auth: Password‑reset tokens one‑time + expiry + audit	P0	DONE
BE-3	RBAC: Definisi peran/izin; RolesGuard/Policy di semua endpoint	P0	DONE
BE-4	API: OpenAPI 3.1 + error envelope konsisten	P0	DONE
BE-5	API: cursor pagination universal; helper & DTO	P0	DONE
BE-6	API: Idempotency-Key middleware (Redis TTL 24h)	P0	DONE
BE-7	WS: Standarisasi nama event (domain.event) + payload {ids, patch, ts, actorId}	P0	DONE
BE-8	Chat: Aggregates reads/reactions (MV/materialized view) + edit/delete + history	P0	DONE
BE-9	Chat: Typing/presence events + rate limit/debounce	P1	DONE
BE-10	Mail: Sanitize HTML server‑side; folder ops endpoint	P0	DONE
BE-11	Files: POST /files/presign + POST /files/attach (linkage konsisten)	P0	DONE
BE-12	Files: Lifecycle policy (temp→finalize/purge) + optional ClamAV hook	P1	DONE
BE-13	Projects: TIMESTAMPTZ konsisten; order_index + events task.updated/moved	P0	DONE
BE-14	Directory: Transactional move + audit; Import dry‑run/commit	P0	DONE
BE-15	Search: Indexers + permission filters; /search/reindex/:entity	P0	DONE
BE-16	Notifications: Settings table + dedup window + NodeMailer + Web Push	P1	DONE
BE-17	Observability: traceId middleware, structured logs, Prometheus metrics	P0	DONE
BE-18	Performance: ETag/Last‑Modified; Redis cache for aggregates	P1	DONE
BE-19	Data: Indexes (composite/GIN), soft‑delete kolom deleted_at	P1	DONE
BE-20	Security: CSP headers, rate‑limit (throttler), payload size & nosniff	P0	DONE
BE-21	CI/CD & Seed: Seeder penuh; contract tests; smoke tests pipeline	P0	DONE
📚 Struktur Dokumentasi yang Harus Dibuat/Diupdate (/docs)

Frontend

/docs/frontend/shell.md

/docs/frontend/auth.md

/docs/frontend/chat.md

/docs/frontend/compose.md

/docs/frontend/projects.md

/docs/frontend/files.md

/docs/frontend/search.md

/docs/frontend/directory.md

/docs/frontend/notifications.md

Backend

/docs/backend/api.md (OpenAPI export)

/docs/backend/modules.md (Auth, Users, Directory, Chat, Compose, Files, Projects, Search, Notifications)

/docs/backend/events.md (daftar event domain.event + payload)

/docs/backend/data-model.md (ERD, indeks, soft delete)

/docs/backend/search-indexing.md

/docs/backend/observability.md

/docs/backend/security.md

/docs/backend/seeding.md

Infra & Ops

/docs/infra/compose.md

/docs/infra/kubernetes.md (Ingress sticky, TLS)

/docs/infra/nginx.md (rate limit, gzip/brotli, CSP passthrough)

/docs/infra/monitoring.md (Prometheus/Grafana/Loki)

/docs/runbooks/backup-restore.md

/docs/runbooks/oncall.md

Setiap task FE/BE yang selesai wajib meng‑update dokumen yang relevan di atas dalam PR yang sama (DoR/DoD CI gate).

 🧪 Acceptance Checks (ringkas, P0)

 Idempotensi POST/PATCH; Project real‑time <1s; AuthZ guard /admin/directory; MinIO presign flow; Search ACL; Notification preferences; TraceId propagation; CSP enforced.

 📝 TODO Tasklist (Next Actions)

 - [BE-4] OpenAPI docs: add explicit DTOs for directory/search/admin ops; publish /docs-json in CI. Status: DONE
 - [BE-8] Chat aggregates: keep Redis cache; consider MV/background job for large rooms. Status: DONE
 - [BE-13] Projects: finalize indexes and event coverage for task.updated/moved; validate order invariants. Status: DONE
 - [BE-18] Performance: add caches for hot aggregates; verify Last-Modified applied globally. Status: DONE
 - [BE-19] Data: expand indexes; review soft-delete coverage across entities. Status: DONE
 - [BE-21] CI/CD & Seed: end-to-end smoke tests and contract tests; wire migrations+seed in CI. Status: DONE
 - [FE-18] Performance: SWR policy (staleTime/cacheTime), ETag handling. Status: TODO
 - [FE-19] i18n/A11y: next-intl + Axe audit; focus traps & shortcuts. Status: TODO

 🔁 Tahapan Eksekusi (Wave Planning)

Wave‑1 (Foundation, semua P0 kontrak): BE‑4..7..11..14..15..17..20..21 + FE‑1..6..11..14..15

Wave‑2 (Chat/Compose/Projects real‑time): BE‑8..10..13 + FE‑7..9..12..13

Wave‑3 (Search/Notifications/Perf/Obs): BE‑15..16..18..19 + FE‑16..17..18

Wave‑4 (Polish & i18n/a11y): FE‑19 + BE finishing touches

Tandai setiap item di tabel di atas saat selesai dan link-kan PR/commit.