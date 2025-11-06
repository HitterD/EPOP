import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'

@Entity({ name: 'workflows' })
export class Workflow {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column('text')
  name!: string

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive!: boolean

  @Column({ name: 'json_spec', type: 'jsonb' })
  jsonSpec!: any

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt!: Date
}
