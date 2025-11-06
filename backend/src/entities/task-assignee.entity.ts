import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Task } from './task.entity'
import { User } from './user.entity'

@Entity({ name: 'task_assignees' })
export class TaskAssignee {
  @PrimaryColumn({ name: 'task_id', type: 'bigint' })
  taskId!: string

  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId!: string

  @ManyToOne(() => Task, (t) => t.assignees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
