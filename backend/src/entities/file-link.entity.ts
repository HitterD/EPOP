import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { FileEntity } from './file.entity'

@Entity({ name: 'file_links' })
export class FileLink {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file!: FileEntity

  @Column({ name: 'ref_table', type: 'text' })
  refTable!: 'messages' | 'mail_messages' | 'tasks'

  @Column({ name: 'ref_id', type: 'bigint' })
  refId!: string
}
