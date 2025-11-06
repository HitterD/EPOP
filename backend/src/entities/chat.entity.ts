import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm'
import { User } from './user.entity'
import { ChatParticipant } from './chat-participant.entity'
import { Message } from './message.entity'

@Entity({ name: 'chats' })
export class Chat {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column({ name: 'is_group', type: 'boolean', default: false })
  isGroup!: boolean

  @Column('text', { nullable: true })
  title!: string | null

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date

  @OneToMany(() => ChatParticipant, (p) => p.chat)
  participants!: ChatParticipant[]

  @OneToMany(() => Message, (m) => m.chat)
  messages!: Message[]
}
