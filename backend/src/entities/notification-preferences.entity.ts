import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity({ name: 'notification_preferences' })
@Unique(['userId'])
export class NotificationPreferencesEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: string

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled!: boolean

  @Column({ name: 'push_enabled', type: 'boolean', default: true })
  pushEnabled!: boolean

  @Column({ name: 'email_enabled', type: 'boolean', default: false })
  emailEnabled!: boolean

  @Column({ name: 'channels', type: 'jsonb', nullable: true })
  channels!: Array<{ type: 'chat' | 'project' | 'task' | 'system'; id?: string; enabled: boolean }> | null

  @CreateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt!: Date
}
