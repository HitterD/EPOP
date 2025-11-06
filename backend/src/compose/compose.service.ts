import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MailMessage, Mailbox } from '../entities/mail-message.entity'
import { OutboxService } from '../events/outbox.service'
import { sanitizeHtml } from '../common/utils/sanitize-html'

@Injectable()
export class ComposeService {
  constructor(
    @InjectRepository(MailMessage) private readonly mails: Repository<MailMessage>,
    private readonly outbox: OutboxService,
  ) {}

  async list(userId: string, folder: Mailbox, limit = 50, beforeId?: string) {
    const qb = this.mails.createQueryBuilder('m')
    if (folder === 'sent') {
      qb.where('m.from_user = :userId', { userId })
    } else if (folder === 'received') {
      qb.where(':userId = ANY(m.to_users)', { userId })
    } else {
      qb.where('(m.from_user = :userId OR :userId = ANY(m.to_users)) AND m.folder = :folder', { userId, folder: 'deleted' })
    }
    if (beforeId) qb.andWhere('m.id < :beforeId', { beforeId })
    qb.orderBy('m.id', 'DESC').limit(limit)
    return qb.getMany()
  }

  async send(fromUser: string, dto: { toUsers: string[]; subject?: string | null; bodyHtml?: string | null }) {
    const clean = sanitizeHtml(dto.bodyHtml ?? null)
    const msg = await this.mails.save(this.mails.create({ fromUser, toUsers: dto.toUsers, subject: dto.subject ?? null, bodyHtml: clean, folder: 'sent' }))
    await this.outbox.append({ name: 'mail.message.created', aggregateType: 'mail', aggregateId: msg.id, userId: fromUser, payload: { mailId: msg.id, toUsers: dto.toUsers } })
    return msg
  }

  async move(userId: string, id: string, folder: Mailbox) {
    const msg = await this.mails.findOne({ where: { id } })
    if (!msg) throw new NotFoundException('Mail not found')
    msg.folder = folder
    await this.mails.save(msg)
    await this.outbox.append({ name: 'mail.message.moved', aggregateType: 'mail', aggregateId: id, userId, payload: { folder } })
    return { success: true }
  }
}
