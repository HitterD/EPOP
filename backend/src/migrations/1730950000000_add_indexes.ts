import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIndexes1730950000000 implements MigrationInterface {
  name = 'AddIndexes1730950000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_messages_chat_created_at ON messages (chat_id, created_at DESC)`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_message_reads_user_message ON message_reads (user_id, message_id)`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_project_bucket_position ON tasks (project_id, bucket_id, position)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_project_bucket_position`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_message_reads_user_message`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_messages_chat_created_at`)
  }
}
