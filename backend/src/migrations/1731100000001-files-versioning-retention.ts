import { MigrationInterface, QueryRunner } from 'typeorm'

export class FilesVersioningRetention1731100000001 implements MigrationInterface {
  name = 'FilesVersioningRetention1731100000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE files
      ADD COLUMN IF NOT EXISTS s3_version_id TEXT,
      ADD COLUMN IF NOT EXISTS retention_policy TEXT,
      ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMPTZ
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_files_retention_expires ON files(retention_expires_at);`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_files_retention_expires;`)
    await queryRunner.query(`
      ALTER TABLE files
      DROP COLUMN IF EXISTS retention_expires_at,
      DROP COLUMN IF EXISTS retention_policy,
      DROP COLUMN IF EXISTS s3_version_id
    `)
  }
}
