import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'domain_outbox' })
export class DomainOutbox {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column({ name: 'event_name', type: 'text' })
  eventName!: string

  @Column({ name: 'aggregate_type', type: 'text' })
  aggregateType!: string

  @Column({ name: 'aggregate_id', type: 'bigint' })
  aggregateId!: string

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId!: string | null

  @Column({ type: 'jsonb' })
  payload!: Record<string, any>

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt!: Date | null
}
