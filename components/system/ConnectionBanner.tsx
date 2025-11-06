"use client";
import { useConnectionStore } from "@/lib/stores/connection.store";

export default function ConnectionBanner() {
  const { status, attempts } = useConnectionStore();
  if (status === "connected") return null;
  return (
    <div
      className="fixed top-0 inset-x-0 z-50 text-center text-sm py-1 bg-amber-100 text-amber-900 border-b border-amber-200"
      role="status"
      aria-live="polite"
    >
      {status === "connecting"
        ? `Menyambung kembali… (percobaan ${attempts})`
        : `Terputus. Mencoba menyambung kembali… (percobaan ${attempts})`}
    </div>
  );
}
