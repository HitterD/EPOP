import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { CalendarEvent } from '../entities/calendar-event.entity'
import { createHmac, timingSafeEqual } from 'node:crypto'

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent) private readonly events: Repository<CalendarEvent>,
  ) {}

  async create(ownerId: string, dto: {
    title: string
    startTs: Date
    endTs: Date
    location?: string | null
    source?: string
    projectId?: string | null
    taskId?: string | null
    allDay?: boolean
    reminders?: any
  }) {
    const ev = this.events.create({
      ownerId,
      title: dto.title,
      startTs: dto.startTs,
      endTs: dto.endTs,
      location: dto.location ?? null,
      source: dto.source ?? 'internal',
      projectId: dto.projectId ?? null,
      taskId: dto.taskId ?? null,
      allDay: !!dto.allDay,
      reminders: dto.reminders ?? [],
    })
    return this.events.save(ev)
  }

  async listMyRange(ownerId: string, start: Date, end: Date) {
    // Overlap: start < end AND end > start
    return this.events.find({
      where: { ownerId, startTs: LessThanOrEqual(end), endTs: MoreThanOrEqual(start) },
      order: { startTs: 'ASC' as any },
    })
  }

  async update(ownerId: string, id: string, patch: Partial<CalendarEvent>) {
    const ev = await this.events.findOne({ where: { id } })
    if (!ev) throw new NotFoundException('Event not found')
    if (String(ev.ownerId) !== String(ownerId)) throw new ForbiddenException('Not permitted')
    Object.assign(ev, {
      title: patch.title ?? ev.title,
      startTs: patch.startTs ?? ev.startTs,
      endTs: patch.endTs ?? ev.endTs,
      location: patch.location ?? ev.location,
      source: patch.source ?? ev.source,
      projectId: patch.projectId ?? ev.projectId,
      taskId: patch.taskId ?? ev.taskId,
      allDay: typeof patch.allDay === 'boolean' ? patch.allDay : ev.allDay,
      reminders: patch.reminders ?? ev.reminders,
    })
    return this.events.save(ev)
  }

  async remove(ownerId: string, id: string) {
    const ev = await this.events.findOne({ where: { id } })
    if (!ev) throw new NotFoundException('Event not found')
    if (String(ev.ownerId) !== String(ownerId)) throw new ForbiddenException('Not permitted')
    await this.events.delete({ id })
    return { success: true }
  }

  // Token format: `${userId}.${hmac}` base64url-safe; hmac = HMAC-SHA256(userId|"ics")
  createFeedToken(userId: string, secret: string) {
    const msg = `${userId}|ics`
    const h = createHmac('sha256', secret).update(msg).digest('base64url')
    return `${userId}.${h}`
  }

  verifyFeedToken(token: string, secret: string): string | null {
    const [uid, sig] = String(token || '').split('.')
    if (!uid || !sig) return null
    const expected = createHmac('sha256', secret).update(`${uid}|ics`).digest('base64url')
    try {
      const ok = timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
      return ok ? uid : null
    } catch {
      return null
    }
  }

  async generateIcsForUser(ownerId: string, start: Date, end: Date) {
    const rows = await this.listMyRange(ownerId, start, end)
    const lines: string[] = []
    lines.push('BEGIN:VCALENDAR')
    lines.push('VERSION:2.0')
    lines.push('PRODID:-//EPOP//Calendar//EN')
    for (const r of rows) {
      lines.push('BEGIN:VEVENT')
      lines.push(`UID:epop-${r.id}@epop.local`)
      lines.push(`SUMMARY:${escapeIcsText(r.title)}`)
      if (r.location) lines.push(`LOCATION:${escapeIcsText(r.location)}`)
      const dtStart = toIcsDateTime(r.startTs)
      const dtEnd = toIcsDateTime(r.endTs)
      lines.push(`DTSTART:${dtStart}`)
      lines.push(`DTEND:${dtEnd}`)
      lines.push('END:VEVENT')
    }
    lines.push('END:VCALENDAR')
    return lines.join('\r\n')
  }

  async importIcs(ownerId: string, ics: string) {
    const events = parseIcsBasic(ics)
    let created = 0
    for (const e of events) {
      if (!e.start || !e.end || !e.summary) continue
      const dup = await this.events.findOne({ where: {
        ownerId,
        title: e.summary,
        startTs: e.start,
      } })
      if (dup) continue
      await this.create(ownerId, {
        title: e.summary,
        startTs: e.start,
        endTs: e.end,
        location: e.location ?? null,
        source: 'ics-import',
      })
      created++
    }
    return { created }
  }
}

function toIcsDateTime(d: Date) {
  // UTC basic format
  const iso = d.toISOString().replace(/[-:]/g, '').replace(/\.[0-9]{3}Z$/, 'Z')
  return iso
}

function escapeIcsText(t: string) {
  return String(t).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,|;/g, (m) => `\\${m}`)
}

function parseIcsBasic(ics: string): Array<{ summary?: string; location?: string; start?: Date; end?: Date }> {
  const lines = String(ics || '').split(/\r?\n/)
  const out: Array<{ summary?: string; location?: string; start?: Date; end?: Date }> = []
  let cur: any = null
  for (const raw of lines) {
    const line = raw.trim()
    if (line === 'BEGIN:VEVENT') {
      cur = {}
    } else if (line === 'END:VEVENT') {
      if (cur) out.push(cur)
      cur = null
    } else if (cur) {
      if (line.startsWith('SUMMARY:')) cur.summary = line.substring(8)
      else if (line.startsWith('LOCATION:')) cur.location = line.substring(9)
      else if (line.startsWith('DTSTART')) {
        const dt = line.split(':')[1]
        if (dt) {
          cur.start = parseIcsDate(dt)
        }
      } else if (line.startsWith('DTEND')) {
        const dt = line.split(':')[1]
        if (dt) {
          cur.end = parseIcsDate(dt)
        }
      }
    }
  }
  return out
}

function parseIcsDate(v: string): Date | undefined {
  // Accept forms like 20250102T030000Z or 20250102
  if (!v) return undefined
  if (v.endsWith('Z')) {
    const s = v.replace(/Z$/, '')
    const year = Number(s.slice(0, 4))
    const mon = Number(s.slice(4, 6)) - 1
    const day = Number(s.slice(6, 8))
    const hh = Number(s.slice(9, 11))
    const mm = Number(s.slice(11, 13))
    const ss = Number(s.slice(13, 15))
    return new Date(Date.UTC(year, mon, day, hh, mm, ss))
  }
  if (/^\d{8}$/.test(v)) {
    const year = Number(v.slice(0, 4))
    const mon = Number(v.slice(4, 6)) - 1
    const day = Number(v.slice(6, 8))
    return new Date(Date.UTC(year, mon, day, 0, 0, 0))
  }
  // Fallback
  return new Date(v)
}
