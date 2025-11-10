import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Worker, Queue } from 'bullmq'
import { REDIS_PUB } from '../redis/redis.module'
import Redis from 'ioredis'
// Use require to avoid type issues in ts-node dev
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webPush = require('web-push')
import { DEAD_QUEUE } from '../queues/queues.module'

@Injectable()
export class NotificationWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationWorkerService.name)
  private worker?: Worker
  private vapidEnabled = false

  constructor(
    private readonly config: ConfigService,
    @Inject(REDIS_PUB) private readonly kv: Redis,
    @Inject(DEAD_QUEUE) private readonly dead: Queue,
  ) {}

  async onModuleInit() {
    const url = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'

    const pubKey = this.config.get<string>('VAPID_PUBLIC_KEY') || ''
    const privKey = this.config.get<string>('VAPID_PRIVATE_KEY') || ''
    const subject = this.config.get<string>('VAPID_SUBJECT') || 'mailto:admin@epop.local'
    if (pubKey && privKey) {
      webPush.setVapidDetails(subject, pubKey, privKey)
      this.vapidEnabled = true
    } else {
      this.logger.warn('VAPID keys not configured; push notifications will be skipped')
    }

    const concurrency = Number(this.config.get<number>('NOTIFICATION_WORKER_CONCURRENCY') ?? 5)

    this.worker = new Worker(
      'notification',
      async (job) => {
        const name = job.name
        if (name === 'push') {
          const data = job.data as { userId: string; payload: any }
          const userId = String(data?.userId || '')
          const payload = data?.payload
          if (!userId || !payload) return { skipped: true }
          return await this.pushToUser(userId, payload)
        }
        return { skipped: true }
      },
      { connection: { url }, concurrency },
    )

    this.worker.on('completed', (job) => this.logger.log(`notification job ${job.id} done (${job.name})`))
    this.worker.on('failed', async (job, err) => {
      this.logger.warn(`notification job ${job?.id} failed: ${err?.message}`)
      try {
        await this.dead.add(
          'notification_failed',
          {
            name: job?.name,
            id: job?.id,
            data: job?.data,
            attemptsMade: job?.attemptsMade ?? 0,
            failedReason: err?.message || String(err),
          },
          { removeOnComplete: 1000, removeOnFail: 2000 },
        )
      } catch {}
    })
  }

  async onModuleDestroy() {
    await this.worker?.close().catch(() => undefined)
  }

  private async pushToUser(userId: string, payload: any) {
    try {
      if (!this.vapidEnabled) return { sent: false, reason: 'vapid_disabled' }
      const subJson = await this.kv.get(`push:user:${userId}`)
      if (!subJson) return { sent: false, reason: 'no_subscription' }
      const subscription = JSON.parse(subJson)
      await webPush.sendNotification(subscription, JSON.stringify(payload))
      return { sent: true }
    } catch (e) {
      this.logger.warn(`push failed for user ${userId}: ${String((e as any)?.message || e)}`)
      throw e
    }
  }
}
