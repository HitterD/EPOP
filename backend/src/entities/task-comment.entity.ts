import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Task } from './task.entity'
import { User } from './user.entity'

@Entity({ name: 'task_comments' })
export class TaskComment {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => Task, (t) => t.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User | null

  @Column('text', { nullable: true })
  body!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
