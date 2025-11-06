import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Worker, Queue } from 'bullmq'
import { Message } from '../entities/message.entity'
import { MailMessage } from '../entities/mail-message.entity'
import { FileEntity } from '../entities/file.entity'
import { Task } from '../entities/task.entity'
import { SearchService } from '../search/search.service'
import { DEAD_QUEUE } from '../queues/queues.module'

@Injectable()
export class SearchWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SearchWorkerService.name)
  private worker?: Worker
  private prefix: string

  constructor(
    private readonly config: ConfigService,
    private readonly search: SearchService,
    @InjectRepository(Message) private readonly messages: Repository<Message>,
    @InjectRepository(MailMessage) private readonly mails: Repository<MailMessage>,
    @InjectRepository(FileEntity) private readonly files: Repository<FileEntity>,
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @Inject(DEAD_QUEUE) private readonly dead: Queue,
  ) {
    this.prefix = this.config.get<string>('ZINC_INDEX_PREFIX') || 'epop'
  }

  private idx(name: string) { return `${this.prefix}_${name}` }

  async onModuleInit() {
    const url = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
    const concurrency = Number(this.config.get<number>('SEARCH_WORKER_CONCURRENCY') ?? 5)

    this.worker = new Worker(
      'search',
      async (job) => {
        const name = job.name
        const data = job.data || {}
        if (name === 'index_doc') {
          const entity: 'messages'|'mail_messages'|'files'|'tasks' = data.entity
          const id: string = String(data.id)
          if (!entity || !id) return { skipped: true }
          await this.indexOne(entity, id)
          return { indexed: true }
        }
        if (name === 'backfill') {
          const entity: 'messages'|'mail_messages'|'files'|'tasks' = data.entity
          if (!entity) return { skipped: true }
          await this.search.backfill(entity)
          return { backfilled: true }
        }
        return { skipped: true }
      },
      { connection: { url }, concurrency },
    )

    this.worker.on('completed', (job) => this.logger.log(`search job ${job.id} done (${job.name})`))
    this.worker.on('failed', async (job, err) => {
      this.logger.warn(`search job ${job?.id} failed: ${err?.message}`)
      try {
        await this.dead.add(
          'search_failed',
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

  private async indexOne(entity: 'messages'|'mail_messages'|'files'|'tasks', id: string) {
    if (entity === 'messages') {
      const m = await this.messages.findOne({ where: { id }, relations: { chat: true, sender: true } })
      if (!m) return
      await this.search.indexDoc(this.idx('messages'), m.id, {
        chatId: (m.chat as any)?.id,
        senderId: (m.sender as any)?.id,
        delivery: m.delivery,
        createdAt: m.createdAt,
        text: JSON.stringify(m.contentJson),
      })
      return
    }
    if (entity === 'tasks') {
      const t = await this.tasks.findOne({ where: { id }, relations: { project: true } })
      if (!t) return
      await this.search.indexDoc(this.idx('tasks'), t.id, {
        projectId: (t.project as any)?.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        progress: t.progress,
        dueAt: t.dueAt,
        createdAt: t.createdAt,
      })
      return
    }
    if (entity === 'mail_messages') {
      const mm = await this.mails.findOne({ where: { id } })
      if (!mm) return
      await this.search.indexDoc(this.idx('mail_messages'), mm.id, {
        fromUser: mm.fromUser,
        toUsers: mm.toUsers,
        subject: mm.subject,
        bodyHtml: mm.bodyHtml,
        folder: mm.folder,
        createdAt: mm.createdAt,
      })
      return
    }
    if (entity === 'files') {
      const f = await this.files.findOne({ where: { id } })
      if (!f) return
      await this.search.indexDoc(this.idx('files'), f.id, {
        ownerId: f.ownerId,
        filename: f.filename,
        mime: f.mime,
        size: f.size,
        createdAt: f.createdAt,
      })
      return
    }
  }
}
