import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'directory_audit' })
export class DirectoryAudit {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column('text')
  action!: 'unit_moved' | 'unit_created' | 'unit_updated' | 'unit_deleted' | 'user_moved'

  @Column({ name: 'actor_id', type: 'bigint' })
  actorId!: string

  @Column({ name: 'target_id', type: 'bigint' })
  targetId!: string

  @Column({ name: 'from_parent_id', type: 'bigint', nullable: true })
  fromParentId!: string | null

  @Column({ name: 'to_parent_id', type: 'bigint', nullable: true })
  toParentId!: string | null

  @Column({ name: 'details', type: 'jsonb', nullable: true })
  details!: Record<string, any> | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
