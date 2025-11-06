import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Message } from './message.entity'
import { User } from './user.entity'

@Entity({ name: 'message_history' })
export class MessageHistory {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message!: Message

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor!: User | null

  @Column('text')
  action!: 'edited' | 'deleted'

  @Column({ name: 'prev_content_json', type: 'jsonb', nullable: true })
  prevContentJson!: any

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
