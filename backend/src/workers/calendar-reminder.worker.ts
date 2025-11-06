import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CalendarEvent } from '../entities/calendar-event.entity'
import { NotificationPreferencesEntity } from '../entities/notification-preferences.entity'
import { User } from '../entities/user.entity'
import { MailerService } from '../mailer/mailer.service'
import { Queue } from 'bullmq'
import { NOTIFICATION_QUEUE } from '../queues/queues.module'
import { REDIS_PUB } from '../redis/redis.module'
import Redis from 'ioredis'

@Injectable()
export class CalendarReminderWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CalendarReminderWorker.name)
  private timer?: NodeJS.Timeout

  constructor(
    @InjectRepository(CalendarEvent) private readonly events: Repository<CalendarEvent>,
    @InjectRepository(NotificationPreferencesEntity) private readonly prefs: Repository<NotificationPreferencesEntity>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly mailer: MailerService,
    @Inject(NOTIFICATION_QUEUE) private readonly notify: Queue,
    @Inject(REDIS_PUB) private readonly kv: Redis,
  ) {}

  onModuleInit() {
    // scan every 30s for reminders due in next 2 minutes
    this.timer = setInterval(() => this.tick().catch((e) => this.logger.warn(String(e))), 30 * 1000)
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer)
  }

  private async tick() {
    const now = new Date()
    const aheadMs = 2 * 60 * 1000
    const windowStart = new Date(now.getTime() - 60 * 1000) // tolerate slight delay
    const windowEnd = new Date(now.getTime() + aheadMs)

    // Find events that overlap with our window on any reminder time
    const rows = await this.events
      .createQueryBuilder('e')
      .select(['e.id', 'e.ownerId', 'e.title', 'e.startTs', 'e.location', 'e.reminders'])
      .where('e.start_ts BETWEEN :ws AND :we', { ws: new Date(now.getTime() - 60 * 60 * 1000), we: new Date(now.getTime() + 24 * 60 * 60 * 1000) })
      .orderBy('e.start_ts', 'ASC')
      .limit(1000)
      .getMany()

    for (const ev of rows) {
      const reminders = Array.isArray((ev as any).reminders) ? (ev as any).reminders : []
      if (!reminders.length) continue
      for (const r of reminders) {
        const minutes = Number(r?.minutes ?? NaN)
        if (!isFinite(minutes) || minutes < 0) continue
        const scheduled = new Date(new Date(ev.startTs).getTime() - minutes * 60 * 1000)
        if (scheduled >= windowStart && scheduled <= windowEnd) {
          await this.dispatchReminder(ev, minutes)
        }
      }
    }
  }

  private async dispatchReminder(ev: CalendarEvent, minutes: number) {
    const key = `reminder:ev:${ev.id}:min:${minutes}`
    const ok = await (this.kv as any).set(key, '1', { NX: true, EX: 3 * 60 * 60 })
    if (ok !== 'OK') return

    const user = ev.ownerId ? await this.users.findOne({ where: { id: String(ev.ownerId) } }) : null
    if (!user) return
    const p = await this.prefs.findOne({ where: { userId: String(user.id) } })
    const when = new Date(ev.startTs).toISOString()

    // Email channel
    if (p?.emailEnabled && user.email) {
      try { await this.mailer.sendReminderEmail(user.email, { title: ev.title, start: when, location: ev.location || null }) } catch {}
    }

    // Push channel
    if (p?.pushEnabled) {
      try {
        await this.notify.add(
          'push',
          { userId: String(user.id), payload: { title: 'Event Reminder', body: `${ev.title} starts at ${when}`, data: { eventId: ev.id } } },
          { priority: 5, attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 500 },
        )
      } catch {}
    }
  }
}
