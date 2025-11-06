import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Task } from './task.entity'

@Entity({ name: 'task_dependencies' })
@Unique(['predecessor', 'successor'])
export class TaskDependency {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'predecessor_id' })
  predecessor!: Task

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'successor_id' })
  successor!: Task

  @Column('int', { name: 'lag_days', default: 0 })
  lagDays!: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
