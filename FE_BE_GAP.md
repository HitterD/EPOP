# GAP & Improvement Review — Frontend × Backend (EPOP)

## Judul & Ringkasan Eksekutif

Audit sistem EPOP menunjukkan arsitektur yang solid dengan Next.js (FE) dan NestJS (BE) yang didukung oleh Redis, PostgreSQL, MinIO, dan ZincSearch. Implementasi dasar untuk fitur-fitur utama seperti otentikasi, obrolan, dan manajemen proyek sudah ada. Namun, terdapat beberapa celah kritis dalam hal konsistensi kontrak API, strategi real-time, penanganan otorisasi, dan aspek operasional seperti observabilitas dan keamanan. Rekomendasi ini bertujuan untuk menyelaraskan pengalaman pengguna yang diharapkan (Teams-like) dengan kapabilitas backend, memastikan skalabilitas, reliabilitas, dan keamanan untuk deployment self-hosted. Prioritas utama adalah memperkuat fondasi data, real-time, dan otorisasi untuk mencegah masalah di kemudian hari.

## Anchor Assumptions

Evaluasi ini didasarkan pada asumsi teknis berikut:

*   **Cookies httpOnly:** Token otentikasi (access/refresh) disimpan sebagai cookies httpOnly untuk keamanan.
*   **Redis Adapter:** Socket.IO BE menggunakan `@socket.io/redis-adapter` untuk penskalaan horizontal dan Pub/Sub.
*   **Upload Direct-to-MinIO:** Proses unggah file akan menggunakan presigned URLs untuk unggahan langsung dari FE ke MinIO.
*   **ZincSearch sebagai Search Utama:** ZincSearch adalah mesin pencari teks penuh utama untuk semua fitur pencarian global.
*   **PostgreSQL JSONB:** Digunakan untuk penyimpanan data semi-terstruktur yang fleksibel.
*   **TIMESTAMPTZ:** Semua kolom waktu di database menggunakan `TIMESTAMPTZ` dan FE mengirim/menerima dalam format ISO 8601 dengan zona waktu (Z).
*   **Self-hosted:** Semua layanan dan komponen infrastruktur bersifat self-hosted, tanpa ketergantungan pada layanan cloud berbayar.
*   **Idempotency-Key:** Header `Idempotency-Key` akan digunakan untuk operasi POST/PATCH yang berpotensi duplikasi.

## GAP per Domain

### Authentication & Session

**Gaps:**
*   **P1:** Mekanisme revokasi sesi (misal: logout dari semua perangkat) belum jelas.
*   **P1:** Penanganan refresh token yang kedaluwarsa atau disalahgunakan (misal: deteksi pencurian token) belum ada.
*   **P2:** Kebijakan rotasi refresh token belum didefinisikan.
*   **P2:** Implementasi "remember me" atau durasi sesi yang dapat dikonfigurasi.

**Risiko:** Keamanan sesi yang lemah, potensi pembajakan sesi, pengalaman pengguna terganggu saat token kedaluwarsa.

**Aksi BE:**
*   Implementasi endpoint `/auth/revoke-session` yang menghapus refresh token dari database/Redis.
*   Menerapkan deteksi penyalahgunaan refresh token (misal: one-time use refresh token, atau deteksi IP anomali).
*   Definisikan dan implementasikan rotasi refresh token.
*   Tambahkan kolom `expires_at` pada tabel sesi untuk mengelola durasi sesi.

**Aksi FE:**
*   Tambahkan opsi "Logout dari semua perangkat" di pengaturan profil.
*   Tangani respons `401 Unauthorized` dari API refresh token dengan mengarahkan pengguna ke halaman login.
*   Implementasikan opsi "Ingat saya" pada halaman login yang memengaruhi durasi refresh token.

### Authorization (RBAC/ABAC)

**Gaps:**
*   **P0:** Tidak ada sistem RBAC/ABAC yang terdefinisi secara eksplisit untuk mengontrol akses ke fitur dan data (misal: admin directory, project visibility, chat moderation).
*   **P1:** Guard/middleware otorisasi belum diterapkan secara konsisten di semua endpoint BE.
*   **P1:** FE tidak memiliki mekanisme untuk menyembunyikan/menonaktifkan elemen UI berdasarkan peran/izin pengguna.

**Risiko:** Pelanggaran data, akses tidak sah ke fitur sensitif, pengalaman pengguna yang tidak konsisten.

**Aksi BE:**
*   Definisikan peran (misal: `admin`, `member`, `guest`) dan izin (misal: `project:create`, `user:read`, `chat:moderate`).
*   Implementasikan guard otorisasi NestJS (`@UseGuards(RolesGuard)`) yang memeriksa peran/izin pengguna dari token atau database.
*   Pastikan semua endpoint API dilindungi oleh guard otorisasi yang sesuai.

**Aksi FE:**
*   Buat `AuthContext` atau `AuthStore` yang menyimpan peran/izin pengguna.
*   Gunakan hook atau komponen pembungkus untuk mengkondisikan rendering UI berdasarkan izin pengguna (misal: `<IfCan action="project:create">...</IfCan>`).
*   Tangani respons `403 Forbidden` dari BE dengan menampilkan pesan kesalahan yang informatif.

### API Design & Contracts (OpenAPI, cursor pagination, Idempotency-Key)

**Gaps:**
*   **P0:** Spesifikasi OpenAPI (Swagger) belum dihasilkan atau dikelola untuk semua endpoint BE.
*   **P1:** Konsistensi pagination (offset vs. cursor) belum diterapkan secara universal; preferensi cursor pagination untuk list yang besar.
*   **P1:** Header `Idempotency-Key` belum diimplementasikan untuk operasi POST/PATCH yang kritikal (misal: kirim pesan, buat proyek).
*   **P2:** Standardisasi format respons error (error envelope) belum ada.

**Risiko:** Kesulitan integrasi FE-BE, performa buruk pada list besar, duplikasi data, penanganan error yang tidak konsisten.

**Aksi BE:**
*   Integrasikan `@nestjs/swagger` untuk menghasilkan spesifikasi OpenAPI secara otomatis.
*   Implementasikan cursor-based pagination untuk semua endpoint list (misal: `/messages`, `/tasks`, `/files`).
*   Tambahkan middleware untuk memproses header `Idempotency-Key` pada operasi POST/PATCH.
*   Definisikan dan implementasikan struktur respons error standar (misal: `{ code: string, message: string, details?: any }`).

**Aksi FE:**
*   Gunakan generator klien OpenAPI untuk menghasilkan tipe dan klien API.
*   Adaptasi komponen list untuk menggunakan cursor pagination (misal: `useInfiniteQuery` dari TanStack Query).
*   Sertakan header `Idempotency-Key` yang dihasilkan klien untuk operasi yang relevan.
*   Implementasikan penanganan error global berdasarkan format error envelope.

### Real-time (penamaan event, payload, reconcile optimistik)

**Gaps:**
*   **P0:** Penamaan event Socket.IO belum distandardisasi (misal: `entity:action` seperti `chat:message_created`).
*   **P0:** Strategi rekonsiliasi optimistik di FE belum didefinisikan secara jelas untuk semua event real-time.
*   **P1:** Payload event real-time belum distandardisasi dan mungkin tidak mencakup semua data yang dibutuhkan FE untuk rekonsiliasi.
*   **P1:** Mekanisme `ack` (acknowledgement) untuk event kritikal belum diterapkan.

**Risiko:** Inkonsistensi data antara FE dan BE, UX yang buruk (laggy/flashy), kesulitan debugging, kehilangan event.

**Aksi BE:**
*   Definisikan konvensi penamaan event Socket.IO (misal: `domain:entity_action`, `chat:message_created`, `project:task_updated`).
*   Pastikan payload event mencakup ID unik, timestamp, dan data yang cukup untuk rekonsiliasi FE.
*   Gunakan `socket.emit(event, payload, ackCallback)` untuk event yang memerlukan konfirmasi pengiriman.
*   Implementasikan `socket.io-redis-adapter` untuk Pub/Sub event antar instance BE.

**Aksi FE:**
*   Gunakan `useSocketEvent` hook untuk mendengarkan event dengan penamaan yang konsisten.
*   Implementasikan strategi optimistik update untuk pesan obrolan, status tugas, dll., dengan rollback jika terjadi kesalahan.
*   Gunakan `queryClient.invalidateQueries` atau `queryClient.setQueryData` untuk memperbarui cache TanStack Query berdasarkan event real-time.
*   Kirim `ackCallback` saat mengirim event kritikal ke BE.

### Messaging/Chat (threads, reads/reactions aggregate, attachment)

**Gaps:**
*   **P0:** Agregasi status "read" (siapa yang sudah membaca) dan "reactions" (jumlah/jenis reaksi) belum dioptimalkan untuk performa.
*   **P1:** Penanganan attachment dalam obrolan (preview, download, metadata) belum terintegrasi penuh dengan modul Files.
*   **P1:** Sinkronisasi status "typing indicator" dan "presence" antar klien belum mulus.
*   **P2:** Fitur "edit/delete message" dengan riwayat perubahan.

**Risiko:** Performa buruk pada obrolan dengan banyak pesan/reaksi, UX yang tidak lengkap, inkonsistensi data.

**Aksi BE:**
*   Optimalkan query untuk agregasi `read_by` dan `reactions` (misal: menggunakan view terwujud atau kolom agregat).
*   Endpoint API untuk mengelola attachment obrolan yang terhubung ke MinIO (misal: `POST /chats/{chatId}/messages/{messageId}/attachments`).
*   Implementasikan event Socket.IO untuk `typing_start`/`typing_stop` dan `presence_update`.
*   Tambahkan kolom `edited_at` dan `deleted_at` pada skema pesan, serta tabel `message_history`.

**Aksi FE:**
*   Komponen `MessageBubble` menampilkan agregasi reaksi dan status baca.
*   Integrasikan komponen `FileUpload` dan `FilePreview` untuk attachment obrolan.
*   Implementasikan `useDebounce` untuk `typing_start`/`typing_stop` event.
*   UI untuk mengedit/menghapus pesan dengan indikator "Edited".

### Compose/Mail ↔ Files linkage (sanitasi HTML, folder ops)

**Gaps:**
*   **P0:** Sanitasi HTML yang ketat untuk konten email/compose untuk mencegah XSS.
*   **P1:** Operasi folder email (pindah, arsip, hapus) belum terstandardisasi dan terintegrasi.
*   **P1:** Linkage antara attachment email dan modul Files belum otomatis (misal: attachment email otomatis muncul di "My Files").
*   **P2:** Fitur "Send as Mail" dari chat compose belum sepenuhnya terimplementasi.

**Risiko:** Kerentanan XSS, manajemen email yang tidak efisien, duplikasi file, UX yang terfragmentasi.

**Aksi BE:**
*   Gunakan library sanitasi HTML (misal: `dompurify` di BE jika memungkinkan, atau pastikan validasi input yang ketat) pada konten email/compose.
*   Endpoint API untuk operasi folder email (misal: `PATCH /mail/{messageId}/move-to-folder`).
*   Saat attachment diunggah melalui compose/mail, secara otomatis buat entri di tabel `files` dengan `context_type='mail'` dan `context_id={messageId}`.

**Aksi FE:**
*   Gunakan library sanitasi HTML (misal: `dompurify` di FE) saat menampilkan konten email.
*   UI untuk memindahkan email antar folder.
*   Tampilkan attachment email dari modul Files.
*   Implementasikan toggle "Send as Mail" di chat compose yang membuka dialog compose mail dengan pre-fill.

### Files/MinIO (presign flow, lifecycle, optional AV)

**Gaps:**
*   **P0:** Implementasi presigned URL untuk unggah langsung ke MinIO belum lengkap.
*   **P1:** Kebijakan siklus hidup file (retensi, penghapusan) belum didefinisikan.
*   **P1:** Integrasi pemindaian antivirus (AV) opsional untuk file yang diunggah.
*   **P2:** Versi file dan riwayat perubahan.

**Risiko:** Beban BE yang tidak perlu, penyimpanan yang tidak terkontrol, risiko keamanan dari file berbahaya, kehilangan riwayat file.

**Aksi BE:**
*   Endpoint API `POST /files/presigned-upload` yang menghasilkan URL unggah presigned MinIO.
*   Implementasikan webhook MinIO atau cron job untuk memicu pemindaian AV (misal: ClamAV) setelah unggah.
*   Definisikan dan terapkan kebijakan siklus hidup file (misal: hapus file setelah X hari jika tidak terhubung ke entitas).
*   Tambahkan kolom `version` dan tabel `file_versions`.

**Aksi FE:**
*   Gunakan URL presigned untuk mengunggah file langsung ke MinIO.
*   Tampilkan status pemindaian AV (misal: "Scanning...", "Clean", "Infected").
*   UI untuk melihat riwayat versi file.

### Projects/Planner (sinkron lintas Board/Grid/Gantt/Schedule, timezone, ordering)

**Gaps:**
*   **P0:** Sinkronisasi real-time antar tampilan Board, Grid, Gantt, dan Schedule belum terjamin konsisten.
*   **P1:** Penanganan zona waktu (timezone) untuk tanggal/waktu tugas belum konsisten di seluruh tampilan.
*   **P1:** Mekanisme pengurutan (ordering) tugas dalam Board/Grid belum fleksibel dan persisten.
*   **P2:** Validasi dependensi tugas (misal: tugas anak tidak bisa selesai sebelum induk).

**Risiko:** Inkonsistensi data, kebingungan pengguna, kesalahan penjadwalan, UX yang buruk.

**Aksi BE:**
*   Pastikan setiap perubahan tugas memicu event Socket.IO (`project:task_updated`, `project:task_moved`) dengan payload lengkap.
*   Simpan semua tanggal/waktu tugas sebagai `TIMESTAMPTZ` di database.
*   Tambahkan kolom `order_index` pada tabel `tasks` untuk pengurutan kustom.
*   Implementasikan validasi dependensi tugas pada operasi PATCH/POST tugas.

**Aksi FE:**
*   Setiap tampilan (Board, Grid, Gantt, Schedule) harus mendengarkan event Socket.IO `project:task_updated`/`project:task_moved` dan memperbarui state lokal secara optimistik.
*   Gunakan library tanggal/waktu yang mendukung zona waktu (misal: `date-fns-tz`) dan selalu tampilkan dalam zona waktu pengguna.
*   Implementasikan drag-and-drop dengan pembaruan `order_index` secara optimistik.
*   UI untuk menampilkan dan mengelola dependensi tugas.

### Directory & Admin (org tree drag-move transactional + audit; bulk import dry-run)

**Gaps:**
*   **P0:** Operasi drag-and-drop untuk memindahkan pengguna/unit organisasi belum bersifat transaksional dan tidak memiliki jejak audit.
*   **P1:** Fitur bulk import pengguna/unit organisasi dengan mode dry-run belum ada.
*   **P1:** Integrasi dengan sistem kehadiran (presence) untuk menampilkan status pengguna di pohon organisasi.
*   **P2:** Pencarian dan filter dalam pohon organisasi yang besar.

**Risiko:** Inkonsistensi data organisasi, kesulitan melacak perubahan, kesalahan impor data, UX yang buruk.

**Aksi BE:**
*   Implementasikan endpoint `PATCH /directory/users/{userId}/move` atau `PATCH /directory/units/{unitId}/move` yang bersifat transaksional.
*   Catat setiap perubahan struktur organisasi ke tabel audit.
*   Endpoint `POST /directory/import/dry-run` dan `POST /directory/import/commit`.
*   Integrasikan status kehadiran dari modul `presence` ke data pengguna direktori.

**Aksi FE:**
*   Pastikan operasi drag-and-drop di `DirectoryTreeEditor` memanggil API transaksional.
*   Tampilkan jejak audit perubahan organisasi.
*   UI untuk bulk import dengan pratinjau dry-run.
*   Tampilkan status kehadiran pengguna di pohon organisasi.

### Search (ZincSearch indexing lifecycle + permission filtering)

**Gaps:**
*   **P0:** Siklus hidup indexing ZincSearch (kapan data diindeks, diperbarui, dihapus) belum terdefinisi.
*   **P0:** Filter izin (permission filtering) pada hasil pencarian belum diimplementasikan.
*   **P1:** Relevansi hasil pencarian dan penyorotan (highlighting) belum dioptimalkan.
*   **P2:** Pencarian faset (faceted search) untuk memfilter hasil.

**Risiko:** Hasil pencarian yang tidak akurat/kedaluwarsa, pelanggaran data (pengguna melihat hasil yang tidak seharusnya), UX pencarian yang buruk.

**Aksi BE:**
*   Implementasikan event listener (misal: dari PostgreSQL `LISTEN/NOTIFY` atau CDC) untuk memicu indexing/de-indexing di ZincSearch.
*   Saat melakukan pencarian di ZincSearch, sertakan filter berdasarkan izin pengguna yang sedang login.
*   Konfigurasi ZincSearch untuk relevansi yang lebih baik dan penyorotan hasil.

**Aksi FE:**
*   Kirim parameter izin pengguna saat melakukan pencarian.
*   Tampilkan hasil pencarian dengan penyorotan.
*   UI untuk filter faset.

### Notifications Matrix (aturan per kanal, deduplikasi)

**Gaps:**
*   **P0:** Aturan notifikasi per kanal (chat, proyek, email) dan per pengguna belum dapat dikonfigurasi.
*   **P1:** Mekanisme deduplikasi notifikasi untuk mencegah spam (misal: beberapa reaksi pada pesan yang sama tidak menghasilkan banyak notifikasi).
*   **P1:** Integrasi notifikasi email (NodeMailer) untuk notifikasi kritikal/ringkasan.
*   **P2:** Notifikasi "silent" atau "do not disturb".

**Risiko:** Pengguna kewalahan dengan notifikasi, notifikasi yang tidak relevan, kehilangan notifikasi penting.

**Aksi BE:**
*   Tabel `user_notification_settings` untuk menyimpan preferensi notifikasi per kanal/tipe.
*   Implementasikan logika deduplikasi notifikasi sebelum mengirim (misal: dalam 5 menit, hanya satu notifikasi untuk "X bereaksi pada pesan Anda").
*   Integrasikan NodeMailer untuk mengirim notifikasi email berdasarkan preferensi pengguna.

**Aksi FE:**
*   UI di `NotificationSettings` untuk mengelola preferensi notifikasi per kanal.
*   Tampilkan notifikasi yang sudah dideduplikasi.
*   UI untuk mengelola mode "silent".

### Observability (traceId, metrics/SLI, error envelope)

**Gaps:**
*   **P0:** `traceId` belum disebarkan secara konsisten di seluruh request (FE -> BE -> DB -> ZincSearch).
*   **P1:** Metrik aplikasi (SLI/SLO) belum didefinisikan dan diekspos (misal: Prometheus).
*   **P1:** Logging terstruktur (JSON) dengan konteks yang kaya (userId, requestId, dll.).
*   **P2:** Integrasi dengan Loki untuk agregasi log.

**Risiko:** Kesulitan debugging, identifikasi masalah performa yang lambat, kurangnya visibilitas operasional.

**Aksi BE:**
*   Implementasikan middleware untuk menghasilkan dan menyebarkan `traceId` di setiap request.
*   Integrasikan library metrik (misal: `prom-client`) untuk mengekspos metrik kustom.
*   Gunakan logger terstruktur (misal: `pino` atau `winston` dengan format JSON) dan tambahkan konteks relevan.

**Aksi FE:**
*   Sertakan `traceId` di setiap request API.
*   Implementasikan error boundary React dan kirim log error ke BE dengan konteks yang relevan.

### Performance & Caching (ETag, Redis cache, SWR policy)

**Gaps:**
*   **P0:** Header `ETag` atau `Last-Modified` belum diimplementasikan untuk endpoint GET yang sering diakses.
*   **P1:** Pemanfaatan Redis cache untuk data yang jarang berubah atau hasil komputasi yang mahal belum optimal.
*   **P1:** Kebijakan SWR/React Query (stale-while-revalidate) belum dikonfigurasi secara optimal di FE.
*   **P2:** Cache-busting untuk aset statis yang lebih agresif.

**Risiko:** Beban BE yang tidak perlu, latensi tinggi, penggunaan bandwidth yang boros, UX yang lambat.

**Aksi BE:**
*   Implementasikan header `ETag` atau `Last-Modified` pada respons GET.
*   Gunakan Redis untuk caching hasil query database yang sering diakses (misal: data profil pengguna, konfigurasi).
*   Gunakan `Cache-Control` header yang sesuai.

**Aksi FE:**
*   Konfigurasi `staleTime` dan `cacheTime` pada TanStack Query secara strategis.
*   Gunakan `If-None-Match` header saat melakukan request GET dengan ETag.
*   Implementasikan strategi SWR untuk data yang sering diperbarui secara real-time.

### Data Model & Indexing (FK, composite/GIN, soft delete)

**Gaps:**
*   **P0:** Konsistensi penggunaan `TIMESTAMPTZ` untuk semua kolom waktu.
*   **P1:** Indeks komposit dan GIN (untuk JSONB) belum diterapkan secara optimal.
*   **P1:** Strategi soft delete (kolom `deleted_at`) belum diterapkan secara konsisten di semua tabel.
*   **P2:** Normalisasi skema database untuk mengurangi redundansi dan meningkatkan integritas data.

**Risiko:** Performa query yang buruk, inkonsistensi data, kesulitan pemulihan data, integritas data yang lemah.

**Aksi BE:**
*   Pastikan semua kolom tanggal/waktu menggunakan `TIMESTAMPTZ`.
*   Identifikasi dan buat indeks komposit yang relevan (misal: `(chat_id, created_at)` untuk pesan).
*   Buat indeks GIN pada kolom JSONB yang sering dicari.
*   Tambahkan kolom `deleted_at TIMESTAMPTZ NULL` ke tabel yang memerlukan soft delete.

**Aksi FE:**
*   Pastikan semua input tanggal/waktu dikirim ke BE dalam format ISO 8601 dengan zona waktu (Z).
*   Filter data yang `deleted_at` tidak null secara default.

### i18n/A11y & UX polish

**Gaps:**
*   **P0:** Implementasi i18n (internasionalisasi) belum lengkap.
*   **P1:** Audit aksesibilitas (A11y) belum dilakukan.
*   **P1:** Konsistensi desain dan micro-interaksi (UX polish) belum optimal.
*   **P2:** Dukungan untuk tema kustom atau mode kontras tinggi.

**Risiko:** Pengalaman pengguna yang terbatas, tidak inklusif, dan kurang profesional.

**Aksi BE:**
*   Endpoint untuk mengambil string terjemahan (jika diperlukan, atau FE mengelola sepenuhnya).

**Aksi FE:**
*   Integrasikan library i18n (misal: `next-i18next` atau `react-i18next`).
*   Lakukan audit aksesibilitas (misal: menggunakan Lighthouse, Axe DevTools) dan perbaiki masalah yang ditemukan.
*   Perbaiki detail desain dan tambahkan micro-interaksi yang halus.

### Security (CSP, rate limit, size limit, MIME snifﬁng, sanitasi server-side)

**Gaps:**
*   **P0:** Kebijakan Keamanan Konten (CSP) belum diterapkan.
*   **P0:** Rate limiting pada endpoint API yang rentan terhadap serangan brute-force/DDoS.
*   **P1:** Batasan ukuran payload (size limit) untuk request POST/PUT.
*   **P1:** Header `X-Content-Type-Options: nosniff` untuk mencegah MIME sniffing.
*   **P1:** Sanitasi input server-side yang ketat untuk semua data yang diterima.

**Risiko:** Serangan XSS, DDoS, injeksi data berbahaya, kebocoran informasi.

**Aksi BE:**
*   Konfigurasi CSP melalui header HTTP.
*   Implementasikan rate limiting (misal: `nestjs-throttler`) pada endpoint otentikasi dan unggah file.
*   Konfigurasi batasan ukuran payload di server (misal: `express.json({ limit: '10mb' })`).
*   Tambahkan header `X-Content-Type-Options: nosniff` pada semua respons.
*   Gunakan library validasi skema (misal: `class-validator` dengan `zod` di FE) dan sanitasi input.

**Aksi FE:**
*   Pastikan semua input pengguna divalidasi di sisi klien sebelum dikirim ke BE.
*   Tangani respons `429 Too Many Requests` dari rate limiter.

## Consolidated Improvement Backlog (Tabel)

| ID | Area | Gap | Priority | FE Action | BE Action |
|----|------|-----|----------|-----------|-----------|
| 1  | Auth | Revokasi sesi | P1 | Tambah opsi "Logout dari semua perangkat" | Implementasi endpoint `/auth/revoke-session` |
| 2  | Auth | Deteksi pencurian refresh token | P1 | Tangani `401 Unauthorized` dari refresh token | Terapkan deteksi penyalahgunaan refresh token |
| 3  | AuthZ | Sistem RBAC/ABAC | P0 | Buat `AuthContext` untuk izin UI | Definisikan peran/izin, terapkan guard otorisasi |
| 4  | API | Spesifikasi OpenAPI | P0 | Gunakan generator klien OpenAPI | Integrasikan `@nestjs/swagger` |
| 5  | API | Cursor pagination | P1 | Adaptasi komponen list untuk cursor pagination | Implementasikan cursor-based pagination |
| 6  | API | Idempotency-Key | P1 | Sertakan header `Idempotency-Key` | Tambah middleware untuk `Idempotency-Key` |
| 7  | RT   | Penamaan event Socket.IO | P0 | Gunakan `useSocketEvent` dengan konvensi | Definisikan konvensi penamaan event |
| 8  | RT   | Rekonsiliasi optimistik | P0 | Implementasi optimistik update dengan rollback | Pastikan payload event lengkap untuk rekonsiliasi |
| 9  | Chat | Agregasi read/reactions | P0 | Tampilkan agregasi reaksi dan status baca | Optimalkan query untuk agregasi `read_by` dan `reactions` |
| 10 | Mail | Sanitasi HTML | P0 | Gunakan library sanitasi HTML saat menampilkan | Gunakan library sanitasi HTML pada konten email |
| 11 | Files | Presigned URL MinIO | P0 | Gunakan URL presigned untuk unggah langsung | Endpoint `POST /files/presigned-upload` |
| 12 | Proj | Sinkronisasi lintas tampilan | P0 | Dengarkan event Socket.IO dan update state | Pastikan setiap perubahan tugas memicu event Socket.IO |
| 13 | Dir  | Drag-move transaksional | P0 | Pastikan operasi drag-and-drop memanggil API transaksional | Implementasikan endpoint `PATCH /directory/users/{userId}/move` transaksional |
| 14 | Search | Permission filtering | P0 | Kirim parameter izin pengguna saat pencarian | Sertakan filter izin pada query ZincSearch |
| 15 | Notif | Aturan per kanal | P0 | UI di `NotificationSettings` untuk preferensi | Tabel `user_notification_settings` |
| 16 | Obs  | `traceId` konsisten | P0 | Sertakan `traceId` di setiap request API | Middleware untuk menghasilkan dan menyebarkan `traceId` |
| 17 | Sec  | CSP | P0 | - | Konfigurasi CSP melalui header HTTP |
| 18 | Sec  | Rate limiting | P0 | Tangani `429 Too Many Requests` | Implementasikan rate limiting pada endpoint rentan |

## Acceptance Checks untuk P0

*   **Idempotency:** Re-send `POST /messages` dengan `Idempotency-Key` yang sama tidak menduplikasi pesan; respons `200 OK` atau `202 Accepted` dengan payload asli.
*   **Real-time Project Sync:** Memindahkan task di Board memicu event `project:task_moved` dan menyinkronkan tampilan Grid/Gantt/Schedule dalam <1 detik pada klien lain yang terhubung ke proyek yang sama.
*   **Authorization Guard:** Mengakses `/admin/directory` sebagai non-admin menghasilkan `403 Forbidden` dari BE dan UI menyembunyikan/menonaktifkan tautan "Directory".
*   **File Upload Presigned:** Unggah file dari FE langsung ke MinIO berhasil tanpa melalui BE, dan BE mencatat metadata file setelah konfirmasi unggah.
*   **Search ACL:** Pencarian global untuk "dokumen rahasia" oleh pengguna non-admin tidak mengembalikan hasil dari proyek/chat yang tidak memiliki izin akses.
*   **Notification Preferences:** Mengubah preferensi notifikasi di `NotificationSettings` (misal: mematikan notifikasi chat) segera berlaku dan tidak ada notifikasi chat yang diterima.
*   **TraceId Propagation:** Log BE untuk request API yang berasal dari FE menunjukkan `traceId` yang sama di seluruh alur (request masuk, query DB, panggilan ZincSearch).
*   **CSP Enforcement:** Browser memblokir eksekusi skrip inline atau pemuatan sumber daya dari domain yang tidak diizinkan oleh kebijakan CSP.

## Endpoint Normalization (Contoh)

```http
# GET dengan Cursor Pagination dan Filtering
GET /api/v1/messages?chatId=123&cursor=eyJpZCI6IjEyMyIsImNyZWF0ZWRBdCI6IjIwMjMtMTAtMjZUMTA6MDA6MDAuMDAwWiJ9&limit=20&filter[senderId]=user456&filter[hasAttachment]=true
Accept: application/json
Authorization: Bearer <token>

# POST dengan Idempotency-Key
POST /api/v1/messages
Idempotency-Key: a1b2c3d4-e5f6-7890-1234-567890abcdef
Content-Type: application/json
Authorization: Bearer <token>

{
  "chatId": "chat-abc",
  "content": "Halo tim, ini pesan penting!",
  "attachments": ["file-xyz"]
}

# PATCH untuk memindahkan task dengan Idempotency-Key
PATCH /api/v1/projects/proj-123/tasks/task-456
Idempotency-Key: f0e9d8c7-b6a5-4321-fedc-ba9876543210
Content-Type: application/json
Authorization: Bearer <token>

{
  "bucketId": "bucket-new",
  "orderIndex": 5
}