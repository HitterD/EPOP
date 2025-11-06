import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Chat } from './chat.entity'
import { User } from './user.entity'
import { MessageReaction } from './message-reaction.entity'
import { MessageRead } from './message-read.entity'

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => Chat, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat!: Chat

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User | null

  @Column({ name: 'content_json', type: 'jsonb' })
  contentJson!: any

  @Column('text', { default: 'normal' })
  delivery!: 'normal' | 'important' | 'urgent'

  @ManyToOne(() => Message, (m) => m.threadReplies, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'root_message_id' })
  rootMessage?: Message | null

  @OneToMany(() => Message, (m) => m.rootMessage)
  threadReplies!: Message[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'edited_at', type: 'timestamptz', nullable: true })
  editedAt!: Date | null

  @OneToMany(() => MessageReaction, (r) => r.message)
  reactions!: MessageReaction[]

  @OneToMany(() => MessageRead, (r) => r.message)
  reads!: MessageRead[]

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null
}
