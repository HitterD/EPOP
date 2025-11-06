import { MigrationInterface, QueryRunner } from 'typeorm'

export class DataIndexesSoftDelete1730800000003 implements MigrationInterface {
  name = 'DataIndexesSoftDelete1730800000003'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted_at);`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at);`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_root ON messages(root_message_id);`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_root;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_chat_created;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_deleted;`)
    // keep column for compatibility
  }
}
