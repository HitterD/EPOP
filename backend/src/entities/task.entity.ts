import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Project } from './project.entity'
import { TaskBucket } from './task-bucket.entity'
import { User } from './user.entity'
import { TaskAssignee } from './task-assignee.entity'
import { TaskComment } from './task-comment.entity'

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => Project, (p) => p.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project

  @ManyToOne(() => TaskBucket, (b) => b.tasks, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bucket_id' })
  bucket!: TaskBucket | null

  @Column('text')
  title!: string

  @Column('text', { nullable: true })
  description!: string | null

  @Column('text', { default: 'medium' })
  priority!: 'low' | 'medium' | 'high' | string

  @Column('text', { default: 'not_started' })
  progress!: 'not_started' | 'in_progress' | 'completed' | 'late' | string

  @Column({ name: 'start_at', type: 'timestamptz', nullable: true })
  startAt!: Date | null

  @Column({ name: 'due_at', type: 'timestamptz', nullable: true })
  dueAt!: Date | null

  @Column('int')
  position!: number

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date

  @OneToMany(() => TaskAssignee, (a) => a.task)
  assignees!: TaskAssignee[]

  @OneToMany(() => TaskComment, (c) => c.task)
  comments!: TaskComment[]
}
