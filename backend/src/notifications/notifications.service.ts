import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { REDIS_SUB, REDIS_PUB } from '../redis/redis.module'
import Redis from 'ioredis'
import { InjectRepository } from '@nestjs/typeorm'
import { ChatParticipant } from '../entities/chat-participant.entity'
import { Repository } from 'typeorm'
import { NotificationPreferencesEntity } from '../entities/notification-preferences.entity'
import { User } from '../entities/user.entity'
import { MailerService } from '../mailer/mailer.service'
import { Queue } from 'bullmq'
import { NOTIFICATION_QUEUE } from '../queues/queues.module'

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    @Inject(REDIS_SUB) private readonly sub: Redis,
    @Inject(REDIS_PUB) private readonly kv: Redis,
    @InjectRepository(ChatParticipant) private readonly parts: Repository<ChatParticipant>,
    @InjectRepository(NotificationPreferencesEntity) private readonly prefs: Repository<NotificationPreferencesEntity>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly mailer: MailerService,
    @Inject(NOTIFICATION_QUEUE) private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    await this.sub.psubscribe('epop.chat.message.created')
    this.sub.on('pmessage', async (_pattern, channel, message) => {
      try {
        if (channel === 'epop.chat.message.created') {
          const evt = JSON.parse(message)
          await this.handleChatMessageCreated(evt)
        }
      } catch (e) {
        this.logger.warn(`notifications event error: ${String(e)}`)
      }
    })
  }

  async onModuleDestroy() {
    try { await this.sub.punsubscribe('epop.chat.message.created') } catch {}
  }

  private async handleChatMessageCreated(evt: any) {
    if (!evt || !evt.chatId) return
    if (evt.delivery !== 'urgent') return
    const chatId: string = String(evt.chatId)
    const senderId: string | undefined = evt.userId ? String(evt.userId) : undefined
    // Dedup within short window per message
    const dedupKey = `notify:dedup:chat:${chatId}:msg:${evt.messageId ?? ''}`
    const set = await (this.kv as any).set(dedupKey, '1', { NX: true, EX: 60 })
    if (set !== 'OK') return
    const members = await this.parts.find({ where: { chatId } })
    const targets = members.map(m => m.userId).filter(uid => uid !== senderId)
    await Promise.all(
      targets.map((uid) =>
        this.queue.add(
          'push',
          { userId: String(uid), payload: { title: 'Urgent message', body: 'You have an urgent message', data: { chatId, messageId: evt.messageId } } },
          { priority: 5, attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 1000 },
        ),
      ),
    )
    // Optional email channel
    await Promise.all(targets.map(async (uid) => {
      try {
        const p = await this.prefs.findOne({ where: { userId: String(uid) } })
        if (p && p.emailEnabled) {
          const user = await this.users.findOne({ where: { id: String(uid) } })
          const email = user?.email
          const emailKey = `notify:dedup:email:${uid}:chat:${chatId}:msg:${evt.messageId ?? ''}`
          const ok = await (this.kv as any).set(emailKey, '1', { NX: true, EX: 300 })
          if (ok === 'OK' && email) {
            await this.mailer.sendGeneric(email, 'Urgent message', `You have an urgent message in chat ${chatId}`)
          }
        }
      } catch {}
    }))
  }
}
