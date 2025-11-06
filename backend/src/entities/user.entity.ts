import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { OrgUnit } from './org-unit.entity'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column({ type: 'citext' as any, unique: true })
  email!: string

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string

  @Column({ name: 'display_name', type: 'text' })
  displayName!: string

  @ManyToOne(() => OrgUnit, { nullable: true })
  @JoinColumn({ name: 'org_unit_id' })
  orgUnit?: OrgUnit | null

  @Column({ name: 'phone_ext', type: 'text', nullable: true })
  phoneExt!: string | null

  @Column('text', { default: 'offline' })
  presence!: 'available' | 'busy' | 'away' | 'offline'

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
