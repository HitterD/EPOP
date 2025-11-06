import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Message } from './message.entity'
import { User } from './user.entity'

@Entity({ name: 'message_reads' })
export class MessageRead {
  @PrimaryColumn({ name: 'message_id', type: 'bigint' })
  messageId!: string

  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId!: string

  @ManyToOne(() => Message, (m) => m.reads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message!: Message

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ name: 'read_at', type: 'timestamptz' })
  readAt!: Date
}
