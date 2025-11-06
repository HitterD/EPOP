import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Worker, JobsOptions, Queue } from 'bullmq'
import nodemailer from 'nodemailer'
import { Counter, register } from 'prom-client'
import { DEAD_QUEUE } from '../queues/queues.module'

@Injectable()
export class EmailWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailWorkerService.name)
  private worker?: Worker
  private transporter?: nodemailer.Transporter
  private emailCounter = new Counter({ name: 'email_send_total', help: 'Total emails attempted', labelNames: ['status'] as any, registers: [register] })

  constructor(private readonly config: ConfigService, @Inject(DEAD_QUEUE) private readonly dead: Queue) {}

  async onModuleInit() {
    const url = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
    const host = this.config.get<string>('SMTP_HOST') || 'localhost'
    const port = this.config.get<number>('SMTP_PORT') || 1025
    const user = this.config.get<string>('SMTP_USER') || ''
    const pass = this.config.get<string>('SMTP_PASS') || ''
    const secure = !!this.config.get<boolean>('SMTP_SECURE')

    this.transporter = nodemailer.createTransport({ host, port, secure, auth: user ? { user, pass } : undefined })

    const concurrency = Number(this.config.get<number>('EMAIL_WORKER_CONCURRENCY') ?? 5)

    this.worker = new Worker(
      'email',
      async (job) => {
        if (!this.transporter) throw new Error('Mailer transporter not initialized')
        const payload = job.data as { to: string; from: string; subject: string; text?: string; html?: string }
        const opts: JobsOptions = job.opts || {}
        try {
          await this.transporter.sendMail({
            from: payload.from,
            to: payload.to,
            subject: payload.subject,
            text: payload.text,
            html: payload.html,
          })
          try { this.emailCounter.inc({ status: 'success' } as any) } catch {}
          return { sent: true }
        } catch (e) {
          this.logger.warn(`email send failed for job ${job.name} (${job.id}): ${String((e as any)?.message || e)}`)
          try { this.emailCounter.inc({ status: 'failed' } as any) } catch {}
          throw e
        }
      },
      { connection: { url }, concurrency },
    )

    this.worker.on('completed', (job) => this.logger.log(`email job ${job.id} done (${job.name})`))
    this.worker.on('failed', async (job, err) => {
      this.logger.warn(`email job ${job?.id} failed: ${err?.message}`)
      try {
        await this.dead.add(
          'email_failed',
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
}
