import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Project } from './project.entity'
import { Task } from './task.entity'

@Entity({ name: 'task_buckets' })
export class TaskBucket {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => Project, (p) => p.buckets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project

  @Column('text')
  name!: string

  @Column('int')
  position!: number

  @OneToMany(() => Task, (t) => t.bucket)
  tasks!: Task[]
}
