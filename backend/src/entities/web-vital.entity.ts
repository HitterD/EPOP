import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'

@Entity({ name: 'web_vitals' })
export class WebVital {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null

  @Column({ name: 'metric_name', type: 'varchar', length: 50 })
  metricName!: string

  @Column({ name: 'metric_value', type: 'decimal', precision: 10, scale: 2 })
  metricValue!: number

  @Column({ type: 'varchar', length: 20 })
  rating!: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  delta!: number | null

  @Column({ name: 'metric_id', type: 'varchar', length: 100, nullable: true })
  metricId!: string | null

  @Column({ name: 'navigation_type', type: 'varchar', length: 20, nullable: true })
  navigationType!: string | null

  @Column({ type: 'text' })
  url!: string

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any> | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
