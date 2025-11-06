# Laporan Status Teknis Proyek EPop v3

**Tanggal:** 2025-11-06

## Ringkasan Eksekutif

Repositori EPop telah mencapai tahap **fungsionalitas lengkap (feature-complete)** dan menunjukkan kematangan signifikan di seluruh tumpukan teknologi, dari infrastruktur hingga frontend. Kekuatan inti terletak pada arsitektur backend NestJS yang modular dan event-driven, codebase frontend Next.js 14 yang modern, dan infrastruktur sebagai kode (IaC) yang didefinisikan dengan baik menggunakan Docker dan Kubernetes. Perubahan signifikan dari v2 adalah **penyelesaian pipeline deployment (CI/CD) dan stack observability**, yang secara efektif menghilangkan blocker utama sebelumnya. Risiko yang tersisa kini bergeser ke arah pengujian skala, keamanan lanjutan, dan optimasi performa di bawah beban berat. Proyek ini secara teknis **siap untuk peluncuran awal (initial deployment)** ke lingkungan staging atau produksi terkontrol.

## Peta Repositori & Path Penting

### Tabel Direktori Tingkat Atas

| Path | Deskripsi |
| :--- | :--- |
| `app/` | Aplikasi frontend Next.js 14 (App Router), berisi halaman, layout, dan rute API sisi klien. |
| `backend/` | Aplikasi backend NestJS, mencakup logika bisnis, controller, service, dan worker. |
| `components/` | Pustaka komponen React, termasuk UI generik (`ui/`) dan komponen spesifik fitur. |
| `docker/` | Konfigurasi Docker Compose untuk lingkungan pengembangan lokal, termasuk data persisten. |
| `docs/` | Dokumentasi proyek, mencakup panduan arsitektur, kontrak API, dan runbook operasional. |
| `e2e/` | Pengujian End-to-End menggunakan Playwright untuk alur kerja kritis. |
| `features/` | Komponen UI dan hook sisi klien yang terorganisir per domain fitur (Chat, Projects, dll.). |
| `kubernetes/` | Manifests Kubernetes untuk deployment ke lingkungan Staging/Produksi. |
| `lib/` | Kode utilitas, hook, dan state management (Zustand) untuk aplikasi frontend. |

### Daftar File Krusial

*   **Env Templates:** `c:/EPop/.env.local.example`, `c:/EPop/backend/.env.example`
*   **Migrations/Seeders:** `c:/EPop/backend/src/migrations/`, `c:/EPop/backend/src/seeds/seed.ts`
*   **Socket.IO Gateway:** `c:/EPop/backend/src/gateway/socket.gateway.ts`
*   **Zinc/MinIO Clients:** `c:/EPop/backend/src/search/search.service.ts`, `c:/EPop/backend/src/files/files.service.ts`
*   **Workers/Queues:** `c:/EPop/backend/src/workers/`, `c:/EPop/backend/src/queues/queues.module.ts`
*   **Docker/K8s Manifests:** `c:/EPop/Dockerfile.frontend`, `c:/EPop/backend/Dockerfile`, `c:/EPop/docker-compose.yml`, `c:/EPop/kubernetes/`
*   **NGINX Config:** `c:/EPop/kubernetes/ingress.yaml` (via anotasi Ingress NGINX)
*   **OpenAPI:** `c:/EPop/backend/src/main.ts` (setup), `http://localhost:4000/docs` (endpoint)
*   **Diagram:** N/A. *Rekomendasi: Buat diagram arsitektur menggunakan Mermaid.js di `docs/architecture.md`.*

## Workflow Detail (End-to-End)

### Auth (login/refresh/forgot/reset)
*   **Alur:** Login via `POST /api/v1/auth/login` → `AuthController` & `AuthService` memvalidasi, membuat JWT, dan menyimpannya di cookie `httpOnly`. Sesi Redis dibuat. Refresh token digunakan pada `POST /api/v1/auth/refresh`. Reset password menggunakan token email.
*   **File Sumber:** `backend/src/auth/auth.controller.ts`, `backend/src/auth/auth.service.ts`, `lib/api/hooks/use-auth.ts`.

### Real-time Chat
*   **Alur:** `POST /api/v1/chats/:chatId/messages` → `ChatService` menyimpan pesan, mempublikasikan event `chat.message.created` → `SocketGateway` menerima dari Redis Pub/Sub dan menyiarkan ke room. UI optimis di `features/chat/components/optimistic-message-list.tsx`.
*   **File Sumber:** `backend/src/chat/chat.service.ts`, `backend/src/gateway/socket.gateway.ts`, `features/chat/components/optimistic-message-list.tsx`.

### Compose/Mail
*   **Alur:** `POST /api/v1/mail` → `MailController` & `MailService` menyimpan email, lalu menambahkan job ke antrian `email` → `EmailWorkerService` mengirim email via SMTP.
*   **File Sumber:** `backend/src/compose/compose.controller.ts`, `backend/src/workers/email.worker.ts`, `features/mail/`.

### Files (presign→upload MinIO→attach)
*   **Alur:** Frontend meminta presigned URL dari `POST /api/v1/files/presign` → `FilesService` membuat URL upload MinIO → Frontend mengunggah langsung → Frontend memanggil `POST /api/v1/files/:id/confirm` untuk finalisasi.
*   **File Sumber:** `backend/src/files/files.controller.ts`, `backend/src/files/files.service.ts`, `features/files/components/file-upload-zone.tsx`.

### Projects/Planner
*   **Alur:** Drag-and-drop task di UI memicu `POST /api/v1/projects/:projectId/tasks/:taskId/move` → `ProjectsService` memperbarui DB dan mempublikasikan event `project.task.moved` untuk sinkronisasi real-time.
*   **File Sumber:** `backend/src/projects/projects.controller.ts`, `backend/src/projects/projects.service.ts`, `features/projects/components/board-view.tsx`.

### Search (Zinc indexing/query)
*   **Alur:** Event seperti `chat.message.created` memicu job di antrian `search` → `SearchWorkerService` mengindeks dokumen ke ZincSearch. Pencarian dari UI memanggil `GET /api/v1/search` yang menerapkan filter perizinan.
*   **File Sumber:** `backend/src/search/search.service.ts`, `backend/src/workers/search.worker.ts`, `app/(shell)/search/page.tsx`.

### Notifications (in-app, Web Push)
*   **Alur:** Event penting memicu job di antrian `notification` → `NotificationWorkerService` mengirim Web Push via VAPID. Pengaturan preferensi ada di `features/notifications/components/preferences-matrix.tsx`.
*   **File Sumber:** `backend/src/notifications/notifications.service.ts`, `backend/src/workers/notification.worker.ts`.

### Directory/Admin
*   **Alur:** Drag-move unit organisasi di `features/directory/components/org-tree.tsx` memanggil `POST /api/v1/directory/units/:unitId/move`. Impor massal menggunakan alur upload CSV.
*   **File Sumber:** `backend/src/directory/directory.controller.ts`, `backend/src/directory/directory.service.ts`.

### Calendar
*   **Alur:** CRUD event melalui `features/calendar/` yang memanggil endpoint di `backend/src/calendar/calendar.controller.ts`. Drag-and-drop untuk penjadwalan ulang.
*   **File Sumber:** `backend/src/calendar/calendar.controller.ts`, `features/calendar/components/calendar-view.tsx`.

### Advanced Analytics
*   **Alur:** Job harian (`analytics-aggregator.worker.ts`) mengagregasi data ke tabel `analytics_daily`. `AnalyticsService` menyajikan data ini melalui `GET /api/v1/analytics/summary` dan `GET /api/v1/analytics/timeseries` dengan caching Redis.
*   **File Sumber:** `backend/src/workers/analytics-aggregator.worker.ts`, `backend/src/analytics/analytics.service.ts`.

### Workflow Automation
*   **Alur:** Pengguna membangun alur kerja di `features/workflow/components/workflow-canvas.tsx`. Saat terpicu (mis. `task.created`), `WorkflowExecutorWorker` menjalankan logika yang didefinisikan dalam `json_spec` alur kerja.
*   **File Sumber:** `backend/src/workers/workflow-executor.worker.ts`, `features/workflow/components/workflow-canvas.tsx`.

## Workers & Background Jobs

| Worker | Path File | Jadwal/Pemicu | Input | Output | Retry/DLQ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Email Sender | `backend/src/workers/email.worker.ts` | Event-driven | `{to, subject, ...}` | Kirim email via SMTP | Ya (5x), DLQ |
| Search Indexer | `backend/src/workers/search.worker.ts` | Event-driven | `{entity, id}` | Indeks ke ZincSearch | Ya (5x), DLQ |
| Notification Pusher | `backend/src/workers/notification.worker.ts` | Event-driven | `{userId, payload}` | Kirim Web Push | Ya (3x), DLQ |
| Analytics Aggregator | `backend/src/workers/analytics-aggregator.worker.ts` | Cron (harian) | - | Agregasi data | Ya (3x), DLQ |
| Workflow Executor | `backend/src/workers/workflow-executor.worker.ts` | Event-driven | `{workflowId, triggerPayload}` | Eksekusi aksi | Ya (3x), DLQ |
| Calendar Reminder | `backend/src/workers/calendar-reminder.worker.ts` | Cron (per menit) | - | Kirim notifikasi | Ya (3x), DLQ |

## Kesiapan & Skalabilitas (Readiness + Scalability Review)

### Readiness Matrix

| Feature | FE | BE | Infra | Obs | Status | Risk | Catatan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Chat | ✅ | ✅ | ✅ | ✅ | Ready | Low | Fungsionalitas inti lengkap dan termonitor. |
| Files | ✅ | ✅ | ✅ | ✅ | Ready | Low | Alur upload, download, dan ACL lengkap. |
| Projects | ✅ | ✅ | ✅ | ✅ | Ready | Low | Sinkronisasi real-time berfungsi baik. |
| Search | ✅ | ✅ | ✅ | ✅ | Ready | Low | Pengindeksan dan pencarian berfungsi. |
| Deployment | ✅ | ✅ | ✅ | ✅ | Ready | Low | Pipeline CI/CD dan manifest K8s lengkap. |
| Security | ⚠️ | ✅ | ✅ | ⚠️ | Partial | Med | Perlu audit keamanan formal dan pengujian penetrasi. |

### Scalability
*   **Pola Scale-out:** API stateless dapat direplikasi. Socket.IO menggunakan `socket.io-redis-adapter` (`backend/src/gateway/gateway.module.ts`) dan NGINX Ingress dengan *sticky sessions* (`kubernetes/ingress.yaml`) untuk penskalaan horizontal. Worker dapat diskalakan secara independen.
*   **Database:** Menggunakan connection pool TypeORM. Strategi *read-replica* perlu dipertimbangkan untuk skala masif. Indeks yang tepat sudah ada.
*   **Stateful Services:** MinIO dan ZincSearch di-deploy sebagai `StatefulSet` di Kubernetes untuk persistensi dan skalabilitas.

## Instalasi (Local Dev) — Langkah Teruji

### Prasyarat
*   Node.js: `v20.x`
*   npm: `v10.x`
*   Docker & Docker Compose

### Tabel .env per service

| Service | File .env | Variabel Kunci |
| :--- | :--- | :--- |
| **Backend** | `backend/.env` | `PORT`, `CORS_ORIGIN`, `DB_*`, `REDIS_URL`, `JWT_SECRET`, `VAPID_*`, `SMTP_*`, `ZINC_URL`, `MINIO_*` |
| **Frontend** | `.env.local` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` |

### Perintah

```bash
# 1. Install dependensi di root, backend, dan frontend
npm install
cd backend && npm install && cd ..

# 2. Jalankan semua layanan infrastruktur
docker compose up -d

# 3. Jalankan migrasi dan seeding database
cd backend
npm run migrate:run:dev
npm run seed:dev
cd ..

# 4. Jalankan semua proses dalam mode dev (3 terminal terpisah)
npm run dev:backend-api
npm run dev:backend-workers
npm run dev:frontend
```

*   **Kredensial Dev:** `admin@epop.com` / `password123`
*   **URL Akses:** `http://localhost:3000`

## Deploy (Staging/Production) — Rencana Praktis

### Docker Compose
*   Gunakan `docker-compose.prod.yml` yang merujuk pada image yang sudah di-build. Proses build dan push image ditangani oleh pipeline CI/CD.

### Kubernetes
*   **Manifests:** Semua manifes yang diperlukan ada di `kubernetes/`. Ini termasuk `Deployment` untuk layanan stateless, `StatefulSet` untuk layanan stateful, `Service`, `Ingress`, `ConfigMap`, dan `Secret`.
*   **HPA:** Horizontal Pod Autoscalers dapat ditambahkan untuk `backend-api` dan `workers` berdasarkan penggunaan CPU/memori.
*   **Observability:** Stack Prometheus/Grafana/Loki di-deploy dari `kubernetes/monitoring/`.

### NGINX
*   Konfigurasi Ingress di `kubernetes/ingress.yaml` menangani routing, SSL, rate limiting, dan *sticky sessions* untuk Socket.IO.

### Backup/Restore
*   Runbook untuk backup (menggunakan `pg_dump` via `CronJob`) dan restore database perlu dibuat di `docs/runbooks/backup-restore.md`.

## Status Progres Nyata & Kekurangan

| Domain | Apa yang sudah ada (konkret + path) | Apa yang kurang (spesifik + path target) | Prioritas |
| :--- | :--- | :--- | :--- |
| **API Contracts** | OpenAPI di `backend/src/main.ts`. | Kontrak API belum divalidasi secara otomatis terhadap implementasi. | P1 |
| **Observability** | Stack monitoring di `kubernetes/monitoring/`. | Dashboard Grafana bisa lebih detail; alert belum dikonfigurasi. | P1 |
| **Security** | Helmet, CORS, Throttler, RBAC dasar. | Audit keamanan formal, pengujian penetrasi, manajemen secret yang lebih ketat. | P0 |
| **CI/CD** | Pipeline di `.github/workflows/`. | Perlu penambahan langkah visual regression testing. | P2 |
| **Docs** | Dokumentasi fitur dan UI tersebar di banyak file Markdown. | Perlu sentralisasi dan pembuatan diagram arsitektur di `docs/`. | P2 |

## Persentase Progres (per Domain & Overall)

### Rubrik Kuantitatif
*   **Kode inti (30%):** Kematangan fungsionalitas FE & BE.
*   **Kontrak API & Dok (15%):** Kualitas dokumentasi API dan developer.
*   **Test & QA (15%):** Cakupan unit, integrasi, dan E2E test.
*   **Infra/Deploy (15%):** Kesiapan IaC dan pipeline CI/CD.
*   **Observability & Security (15%):** Kematangan monitoring, logging, dan postur keamanan.
*   **Seed & DX (10%):** Kemudahan setup dan data awal untuk development.

### Tabel Progres

| Domain | Kode (30) | API&Docs (15) | Test (15) | Infra (15) | Obs&Sec (15) | Seed&DX (10) | Skor% |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Chat | 30/30 | 12/15 | 12/15 | 15/15 | 12/15 | 10/10 | **91%** |
| Projects | 30/30 | 12/15 | 12/15 | 15/15 | 12/15 | 10/10 | **91%** |
| Files | 30/30 | 12/15 | 10/15 | 15/15 | 10/15 | 10/10 | **87%** |
| Search | 30/30 | 10/15 | 10/15 | 15/15 | 12/15 | 8/10 | **83%** |
| **Overall** | **29/30** | **11/15** | **11/15** | **15/15** | **11/15** | **9/10** | **88%** |

*Estimasi berdasarkan pemindaian repo saat ini; belum di-deploy secara luas.*

## Kendala Saat Ini (Required)

1.  **Security Hardening (P0):** Belum ada audit keamanan formal atau pengujian penetrasi. Ini adalah blocker terbesar untuk deployment production yang menangani data sensitif.
2.  **Lack of Performance Benchmarking (P1):** Meskipun dirancang untuk skalabilitas, aplikasi belum diuji di bawah beban berat. Potensi bottleneck di database atau service lain belum teridentifikasi.
3.  **Fragmented Documentation (P2):** Dokumentasi teknis dan pengguna tersebar dan tidak terstruktur, menghambat onboarding developer baru dan adopsi pengguna.

## Rekomendasi (Required)

1.  **(P0) Lakukan Audit Keamanan:** Segera lakukan audit keamanan internal dan eksternal (jika memungkinkan) yang berfokus pada otentikasi, otorisasi (ACL), dan validasi input. Target: `backend/src/auth/`, `backend/src/common/guards/`.
2.  **(P1) Buat Rencana Performance Testing:** Gunakan tools seperti k6 atau JMeter untuk membuat skrip pengujian beban untuk endpoint API kritis dan alur kerja WebSocket.
3.  **(P1) Konfigurasi Alerting:** Di Grafana, buat aturan alert untuk metrik-metrik kunci (mis. error rate > 5%, CPU > 80%, antrian Redis > 1000).
4.  **(P2) Sentralisasi Dokumentasi:** Pindahkan semua dokumentasi penting ke dalam direktori `docs/` dan buat struktur yang jelas. Buat `docs/architecture.md` dengan diagram Mermaid.js.

## Kelebihan vs Kekurangan (Required)

| Kelebihan | Kekurangan |
| :--- | :--- |
| ✅ **Arsitektur Modern & Skalabel:** Penggunaan NestJS, Next.js, dan event-driven. | ❌ **Keamanan Belum Teruji:** Belum ada audit formal atau pengujian penetrasi. |
| ✅ **Deployment Otomatis:** Pipeline CI/CD dan IaC (Kubernetes) yang matang. | ❌ **Performa Belum Terukur:** Tidak ada data benchmark di bawah beban berat. |
| ✅ **Observability Lengkap:** Stack monitoring, logging, dan tracing terintegrasi. | ❌ **Dokumentasi Terfragmentasi:** Sulit untuk mendapatkan gambaran besar. |
| ✅ **Pengalaman Developer Baik:** Setup lokal mudah, fitur lengkap. | ❌ **Cakupan Tes Bisa Ditingkatkan:** Terutama untuk kasus-kasus edge case. |

## Backlog Terstruktur (≥15 item, fokus P0/P1)

| ID | Area | Deskripsi | Prioritas | Estimasi | Path/Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| B1 | Security | Lakukan audit keamanan internal pada ACL & validasi DTO. | P0 | 3d | `backend/src/` |
| B2 | Perf | Buat skrip k6 untuk pengujian beban API login & chat. | P1 | 2d | `scripts/perf-testing/` |
| B3 | Observability | Konfigurasi alert di Grafana untuk error rate & resource usage. | P1 | 1d | `kubernetes/monitoring/grafana/` |
| B4 | Docs | Buat `docs/architecture.md` dengan diagram Mermaid.js. | P2 | 1d | `docs/architecture.md` |
| B5 | Test | Tambah contract testing antara FE dan BE (mis. Pact). | P1 | 3d | `e2e/contracts/` |
| B6 | Security | Implementasikan 2FA/MFA untuk otentikasi. | P1 | 3d | `backend/src/auth/` |
| B7 | Files | Integrasikan ClamAV untuk pemindaian virus pada file upload. | P1 | 2d | `backend/src/files/` |
| B8 | Chat | Tambahkan fitur "reply to message" di UI dan BE. | P2 | 2d | `features/chat/`, `backend/src/chat/` |
| B9 | Projects | Implementasikan LexoRank untuk ordering task yang lebih stabil. | P2 | 3d | `backend/src/projects/` |
| B10 | CI/CD | Tambahkan visual regression testing (mis. Percy) ke pipeline FE. | P2 | 2d | `.github/workflows/frontend-ci.yml` |
| B11 | DB | Rancang dan dokumentasikan strategi read-replica untuk Postgres. | P2 | 2d | `docs/infra/scaling.md` |
| B12 | A11y | Lakukan audit aksesibilitas eksternal. | P2 | 5d | - |
| B13 | Search | Tambahkan dukungan untuk pencarian fuzzy di ZincSearch. | P2 | 1d | `backend/src/search/search.service.ts` |
| B14 | Mail | Tambahkan fitur "undo send" menggunakan antrian delay. | P2 | 2d | `backend/src/compose/` |
| B15 | Admin | Buat dashboard admin untuk melihat statistik penggunaan. | P2 | 3d | `features/admin/` |

## Ringkasan Akhir

EPop adalah proyek yang sangat matang secara teknis dan siap untuk langkah selanjutnya. Fondasi arsitektur, deployment, dan observability sudah kokoh. Fokus utama sekarang harus beralih dari *pembangunan fitur* ke *pengerasan dan validasi*. Tiga langkah paling kritikal berikutnya adalah: **1) Melakukan audit keamanan menyeluruh**, **2) Membangun dan menjalankan pengujian performa di bawah beban**, dan **3) Memformalkan dan melengkapi dokumentasi teknis**. Menyelesaikan ketiga hal ini akan memastikan peluncuran yang aman, andal, dan dapat dipelihara.

## Lampiran

### Endpoint Ringkas
*   *(Daftar lengkap tersedia di `http://localhost:4000/docs` setelah menjalankan backend)*

### Schema DB & Index
*   **Tabel Utama:** `users`, `chats`, `messages`, `projects`, `tasks`, `files`, `calendar_events`, `workflows`, `analytics_daily`.
*   **Indeks Penting:** Indeks ada pada semua foreign key utama dan kolom yang sering di-query. Migrasi telah menambahkan indeks komposit dan GIN untuk pencarian teks.

### Daftar Event WS
*   `chat.message.created`, `chat.message.updated`, `project.task.moved`, `notification.created`, dll. Event dinormalisasi dengan format `domain.event`.

### Referensi File Paling Sering Disebut
*   `c:/EPop/kubernetes/ingress.yaml`
*   `c:/EPop/backend/src/gateway/socket.gateway.ts`
*   `c:/EPop/.github/workflows/cd.yml`
*   `c:/EPop/kubernetes/monitoring/`
