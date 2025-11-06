import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_SUB } from '../redis/redis.module'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { SEARCH_QUEUE } from '../queues/queues.module'

@Injectable()
export class SearchEventsSubscriber implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SearchEventsSubscriber.name)
  private prefix: string

  constructor(
    @Inject(REDIS_SUB) private readonly sub: Redis,
    @Inject(SEARCH_QUEUE) private readonly queue: Queue,
    config: ConfigService,
  ) {
    this.prefix = config.get<string>('ZINC_INDEX_PREFIX') || 'epop'
  }

  private idx(name: string) { return `${this.prefix}_${name}` }

  async onModuleInit() {
    await this.sub.psubscribe(
      'epop.chat.message.created',
      'epop.chat.message.updated',
      'epop.chat.message.deleted',
      'epop.project.task.created',
      'epop.project.task.updated',
      'epop.project.task.moved',
      'epop.project.task.rescheduled',
      'epop.mail.message.created',
    )
    this.sub.on('pmessage', async (_p, channel, message) => {
      try {
        const evt = JSON.parse(message)
        if (channel === 'epop.chat.message.created') {
          await this.onMessageCreated(evt)
        } else if (channel === 'epop.chat.message.updated') {
          await this.onMessageUpdated(evt)
        } else if (channel === 'epop.chat.message.deleted') {
          await this.onMessageDeleted(evt)
        } else if (channel === 'epop.project.task.created') {
          await this.onTaskCreated(evt)
        } else if (channel === 'epop.project.task.updated' || channel === 'epop.project.task.moved' || channel === 'epop.project.task.rescheduled') {
          await this.onTaskUpdated(evt)
        } else if (channel === 'epop.mail.message.created') {
          await this.onMailCreated(evt)
        }
      } catch (e) {
        this.logger.warn(`search subscriber error: ${String(e)}`)
      }
    })
  }

  async onModuleDestroy() {
    try {
      await this.sub.punsubscribe(
        'epop.chat.message.created',
        'epop.chat.message.updated',
        'epop.chat.message.deleted',
        'epop.project.task.created',
        'epop.project.task.updated',
        'epop.project.task.moved',
        'epop.project.task.rescheduled',
        'epop.mail.message.created',
      )
    } catch {}
  }

  private async onMessageCreated(evt: any) {
    if (!evt?.messageId) return
    await this.queue.add('index_doc', { entity: 'messages', id: String(evt.messageId) }, { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 500, removeOnFail: 1000 })
  }

  private async onMessageUpdated(evt: any) {
    if (!evt?.messageId) return
    await this.queue.add('index_doc', { entity: 'messages', id: String(evt.messageId) }, { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 500, removeOnFail: 1000 })
  }

  private async onMessageDeleted(evt: any) {
    if (!evt?.messageId) return
    await this.queue.add('delete_doc', { entity: 'messages', id: String(evt.messageId) }, { attempts: 3, backoff: { type: 'fixed', delay: 2000 }, removeOnComplete: 500, removeOnFail: 1000 })
  }

  private async onTaskCreated(evt: any) {
    if (!evt?.taskId) return
    await this.queue.add('index_doc', { entity: 'tasks', id: String(evt.taskId) }, { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 500, removeOnFail: 1000 })
  }

  private async onTaskUpdated(evt: any) {
    const id = String(evt?.taskId || evt?.aggregateId || '')
    if (!id) return
    await this.queue.add('index_doc', { entity: 'tasks', id }, { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 500, removeOnFail: 1000 })
  }

  private async onMailCreated(evt: any) {
    if (!evt?.mailId) return
    await this.queue.add('index_doc', { entity: 'mail_messages', id: String(evt.mailId) }, { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 500, removeOnFail: 1000 })
  }
}
