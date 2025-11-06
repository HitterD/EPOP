import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'calendar_events' })
@Index('idx_calendar_events_owner_start', ['ownerId', 'startTs'])
export class CalendarEvent {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column({ name: 'owner_id', type: 'bigint', nullable: true })
  ownerId!: string | null

  @Column('text')
  title!: string

  @Column({ name: 'start_ts', type: 'timestamptz' })
  startTs!: Date

  @Column({ name: 'end_ts', type: 'timestamptz' })
  endTs!: Date

  @Column({ type: 'text', nullable: true })
  location!: string | null

  @Column({ type: 'text', default: 'internal' })
  source!: string

  @Column({ name: 'project_id', type: 'bigint', nullable: true })
  projectId!: string | null

  @Column({ name: 'task_id', type: 'bigint', nullable: true })
  taskId!: string | null

  @Column({ name: 'all_day', type: 'boolean', default: false })
  allDay!: boolean

  @Column({ name: 'reminders', type: 'jsonb', default: () => "'[]'::jsonb" })
  reminders!: any

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
