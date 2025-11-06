import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Workflow } from './workflow.entity'

@Entity({ name: 'workflow_runs' })
@Index('idx_workflow_runs_workflow', ['workflow'])
export class WorkflowRun {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => Workflow, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflow_id' })
  workflow!: Workflow

  @Column('text')
  status!: 'queued' | 'running' | 'completed' | 'failed' | string

  @CreateDateColumn({ name: 'started_at', type: 'timestamptz', default: () => 'now()' })
  startedAt!: Date

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt!: Date | null

  @Column({ name: 'logs', type: 'jsonb', nullable: true })
  logs!: any
}
