import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Chat } from './chat.entity'
import { User } from './user.entity'

@Entity({ name: 'chat_participants' })
export class ChatParticipant {
  @PrimaryColumn({ name: 'chat_id', type: 'bigint' })
  chatId!: string

  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId!: string

  @ManyToOne(() => Chat, (c) => c.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat!: Chat

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text', { default: 'member' })
  role!: string

  @Column('boolean', { default: false })
  pinned!: boolean

  @Column('boolean', { default: false })
  muted!: boolean
}
