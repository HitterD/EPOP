import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFilesLifecycle1730800000001 implements MigrationInterface {
  name = 'AddFilesLifecycle1730800000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE files
      ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS scan_result TEXT,
      ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMPTZ
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_files_status;`)
    await queryRunner.query(`
      ALTER TABLE files
      DROP COLUMN IF EXISTS scanned_at,
      DROP COLUMN IF EXISTS scan_result,
      DROP COLUMN IF EXISTS status
    `)
  }
}
