import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Project } from './project.entity'
import { User } from './user.entity'

@Entity({ name: 'project_members' })
export class ProjectMember {
  @PrimaryColumn({ name: 'project_id', type: 'bigint' })
  projectId!: string

  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId!: string

  @ManyToOne(() => Project, (p) => p.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column('text', { default: 'member' })
  role!: string
}
