# Frontend Resilience: Error Boundaries & WebSocket Reconnect

## Objective
- Isolasi error per-bagian UI agar crash komponen tidak memutihkan seluruh halaman.
- Ketahanan koneksi WebSocket dengan exponential backoff, manual reconnect, dan UI banner status koneksi.

## Architecture Overview
- `components/system/ErrorBoundary.tsx`: Boundary kelas untuk menangkap error render/生命周期 dan menampilkan fallback per-bagian.
- `lib/stores/connection.store.ts`: Global Zustand store untuk status koneksi: `connected | connecting | disconnected`, `attempts`, `lastError`.
- `components/system/ConnectionBanner.tsx`: Banner global (fixed) untuk menampilkan status koneksi.
- `lib/socket/client.ts`: Singleton Socket.IO client dengan `reconnection: false`; manual reconnect dihook.
- `lib/socket/hooks/use-resilient-socket.ts`: Hook inisialisasi koneksi, manual retry dengan exponential backoff + jitter; update store.
- Integrasi shell: `app/(shell)/layout.tsx` – bungkus `LeftRail` dan `main` dengan `ErrorBoundary`, render `ConnectionBanner`, panggil `useResilientSocket(userId)` sekali.

## Implementation Notes
- Manual reconnect menjaga sinkronisasi UI: store → banner → handler domain events.
- Backoff: `delay = min(max, base * 2^attempt) + jitter(0..20%)`, default `base=500ms`, `max=15000ms`.
- Hook tidak memulai koneksi sampai `userId` tersedia (menghindari anonymous connect).
- Event listener dipasang sekali pada singleton socket; clean-up saat unmount shell.

## Usage
- Bungkus bagian-bagian rapuh dengan `ErrorBoundary`:
```tsx
<ErrorBoundary fallback={<div className="p-3">Sidebar bermasalah.</div>}>
  <Sidebar />
</ErrorBoundary>
```
- Render banner sekali dekat root:
```tsx
<ConnectionBanner />
```
- Mulai koneksi resilient sekali di shell:
```tsx
useResilientSocket(session?.user?.id, '')
```

## SOP: Incident & Recovery
- Jika banner menunjukkan "Terputus":
  - Periksa jaringan/devtools → tab Network.
  - Setelah online, hook otomatis menandai `connecting` lalu `connected` saat sukses.
  - Jika `lastError` berlanjut > 2 menit, refresh halaman (cache tetap aman via Query cache).
- Laporkan error komponen via logger internal (TODO di `componentDidCatch`).

## Testing
- Unit:
  - `components/system/__tests__/ErrorBoundary.test.tsx` – fallback muncul saat child throw; tombol reset memulihkan.
  - `lib/socket/hooks/__tests__/resilience.test.ts` – validasi `computeBackoff` terbatasi `max` dan meningkat; validasi transisi store.
- Manual:
  - DevTools → Offline → lihat banner "disconnected/connecting"; kembali online → banner hilang (status `connected`).

## Environment
- `NEXT_PUBLIC_WS_URL` harus mengarah ke endpoint Socket.IO (lihat `.env.local.example`).

## Acceptance Criteria
- Error komponen di sidebar tidak memutihkan seluruh halaman; fallback terlihat dan dapat di-reset.
- Saat koneksi putus, banner muncul; retry backoff meningkat sampai `max`, tidak mendaftarkan listener ganda; status kembali `connected` saat pulih; banner hilang.
