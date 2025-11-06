import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'files' })
export class FileEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @Column({ name: 'owner_id', type: 'bigint', nullable: true })
  ownerId!: string | null

  @Column('text')
  filename!: string

  @Column('text', { nullable: true })
  mime!: string | null

  @Column('bigint', { nullable: true })
  size!: string | null

  @Column({ name: 's3_key', type: 'text' })
  s3Key!: string

  @Column({ name: 's3_version_id', type: 'text', nullable: true })
  s3VersionId!: string | null

  @Column('text', { default: 'pending' })
  status!: 'pending' | 'scanning' | 'ready' | 'infected' | 'failed'

  @Column({ name: 'scan_result', type: 'text', nullable: true })
  scanResult!: string | null

  @Column({ name: 'scanned_at', type: 'timestamptz', nullable: true })
  scannedAt!: Date | null

  @Column({ name: 'retention_policy', type: 'text', nullable: true })
  retentionPolicy!: string | null

  @Column({ name: 'retention_expires_at', type: 'timestamptz', nullable: true })
  retentionExpiresAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt!: Date
}
