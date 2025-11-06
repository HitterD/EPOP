import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'org_units' })
export class OrgUnit {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => OrgUnit, (o) => o.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: OrgUnit | null

  @OneToMany(() => OrgUnit, (o) => o.parent)
  children!: OrgUnit[]

  @Column('text')
  name!: string

  @Column('text', { unique: true, nullable: true })
  code!: string | null
}
