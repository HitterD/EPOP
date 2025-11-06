import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { OutboxService } from './outbox.service'
import { REDIS_PUB } from '../redis/redis.module'
import Redis from 'ioredis'
import { Inject } from '@nestjs/common'

@Injectable()
export class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name)
  private timer: NodeJS.Timeout | null = null

  constructor(
    private readonly outbox: OutboxService,
    @Inject(REDIS_PUB) private readonly pub: Redis,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => this.tick().catch(err => this.logger.error(err)), 1000)
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer)
  }

  private async tick() {
    const batch = await this.outbox.getUndelivered(100)
    if (batch.length === 0) return
    const delivered: string[] = []
    for (const evt of batch) {
      try {
        const channel = `epop.${evt.eventName}`
        await this.pub.publish(channel, JSON.stringify({
          name: evt.eventName,
          aggregateType: evt.aggregateType,
          aggregateId: evt.aggregateId,
          userId: evt.userId,
          ...evt.payload,
        }))
        delivered.push(evt.id)
      } catch (e) {
        this.logger.warn(`Publish failed for outbox ${evt.id}: ${String(e)}`)
      }
    }
    if (delivered.length) await this.outbox.markDelivered(delivered)
  }
}
