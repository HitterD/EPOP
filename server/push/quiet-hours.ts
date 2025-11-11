export interface QuietHours {
  enabled: boolean
  start: string
  end: string
  timezone?: string
}

function toMinutes(s: string): number {
  const [h, m] = s.split(':').map((x) => parseInt(x, 10))
  return (h % 24) * 60 + (m % 60)
}

export function isQuietNow(now: Date, qh?: QuietHours): boolean {
  if (!qh || !qh.enabled) return false
  const start = toMinutes(qh.start)
  const end = toMinutes(qh.end)
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes()
  if (start <= end) return mins >= start && mins < end
  return mins >= start || mins < end
}
