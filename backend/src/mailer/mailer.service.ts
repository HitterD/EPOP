import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'
import { EMAIL_QUEUE } from '../queues/queues.module'

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)
  private from: string

  constructor(private readonly config: ConfigService, @Inject(EMAIL_QUEUE) private readonly queue: Queue) {
    this.from = this.config.get<string>('MAIL_FROM') || 'noreply@epop.local'
  }

  async sendPasswordReset(email: string, token: string) {
    try {
      const subject = 'EPOP Password Reset'
      const text = `Use this token to reset your password: ${token}`
      await this.queue.add(
        'password_reset',
        { to: email, from: this.from, subject, text },
        { priority: 1, attempts: 5, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 1000 },
      )
      return true
    } catch (e) {
      this.logger.warn(`queue password reset failed: ${String(e)}`)
      return false
    }
  }

  async sendGeneric(to: string, subject: string, text: string) {
    try {
      await this.queue.add(
        'generic',
        { to, from: this.from, subject, text },
        { priority: 5, attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 1000 },
      )
      return true
    } catch (e) {
      this.logger.warn(`queue generic email failed: ${String(e)}`)
      return false
    }
  }
}
