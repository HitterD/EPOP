import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'
import { ProjectMember } from './project-member.entity'
import { TaskBucket } from './task-bucket.entity'
import { Task } from './task.entity'

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column('text')
  name!: string

  @Column('text', { nullable: true })
  description!: string | null

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner!: User | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date

  @OneToMany(() => ProjectMember, (m) => m.project)
  members!: ProjectMember[]

  @OneToMany(() => TaskBucket, (b) => b.project)
  buckets!: TaskBucket[]

  @OneToMany(() => Task, (t) => t.project)
  tasks!: Task[]
}
