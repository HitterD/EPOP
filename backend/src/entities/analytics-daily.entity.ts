import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'analytics_daily' })
@Index('idx_analytics_daily_date', ['day'])
@Index('idx_analytics_daily_metric', ['metric'])
@Index('idx_analytics_daily_scope', ['scopeType', 'scopeId'])
export class AnalyticsDaily {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column({ name: 'date', type: 'date' })
  day!: string

  @Column('text')
  metric!: string

  @Column({ name: 'scope_type', type: 'text' })
  scopeType!: string

  @Column({ name: 'scope_id', type: 'bigint', nullable: true })
  scopeId!: string | null

  @Column({ type: 'bigint', default: 0 })
  value!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
