import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Message } from './message.entity'
import { User } from './user.entity'

@Entity({ name: 'message_reactions' })
export class MessageReaction {
  @PrimaryColumn({ name: 'message_id', type: 'bigint' })
  messageId!: string

  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId!: string

  @PrimaryColumn({ name: 'emoji', type: 'text' })
  emoji!: string

  @ManyToOne(() => Message, (m) => m.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message!: Message

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
