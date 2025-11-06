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

  async sendHtml(to: string, subject: string, html: string) {
    try {
      await this.queue.add(
        'generic',
        { to, from: this.from, subject, html },
        { priority: 5, attempts: 3, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 1000 },
      )
      return true
    } catch (e) {
      this.logger.warn(`queue html email failed: ${String(e)}`)
      return false
    }
  }

  async sendTestEmail(to: string) {
    const subject = 'EPOP Test Email'
    const html = this.renderTemplate('test', { to })
    return this.sendHtml(to, subject, html)
  }

  async sendReminderEmail(to: string, model: { title: string; start: string; location?: string | null }) {
    const subject = `Reminder: ${model.title}`
    const html = this.renderTemplate('reminder', model)
    return this.sendHtml(to, subject, html)
  }

  private renderTemplate(name: 'test'|'reminder', model: Record<string, any>) {
    if (name === 'test') {
      return `<!doctype html><html><body><h2>EPOP Test Email</h2><p>This is a test email for <b>${escapeHtml(model.to || '')}</b>.</p><p>It works! 🎉</p></body></html>`
    }
    if (name === 'reminder') {
      const title = escapeHtml(model.title || '')
      const start = escapeHtml(model.start || '')
      const location = model.location ? `<p><b>Location:</b> ${escapeHtml(model.location)}</p>` : ''
      return `<!doctype html><html><body><h2>Event Reminder</h2><p><b>${title}</b></p><p><b>Starts:</b> ${start}</p>${location}</body></html>`
    }
    return `<html><body><p>No template</p></body></html>`
  }
}

function escapeHtml(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
