import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

export type Mailbox = 'received' | 'sent' | 'deleted'

@Entity({ name: 'mail_messages' })
export class MailMessage {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column({ name: 'from_user', type: 'bigint', nullable: true })
  fromUser!: string | null

  @Column({ name: 'to_users', type: 'bigint', array: true })
  toUsers!: string[]

  @Column('text', { nullable: true })
  subject!: string | null

  @Column({ name: 'body_html', type: 'text', nullable: true })
  bodyHtml!: string | null

  @Column({ name: 'folder', type: 'enum', enum: ['received','sent','deleted'], enumName: 'mailbox' })
  folder!: Mailbox

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
