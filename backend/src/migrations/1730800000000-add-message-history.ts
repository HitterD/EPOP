import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMessageHistory1730800000000 implements MigrationInterface {
  name = 'AddMessageHistory1730800000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS message_history (
        id BIGSERIAL PRIMARY KEY,
        message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
        actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        prev_content_json JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_message_history_message ON message_history(message_id, created_at);
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_message_history_message;`)
    await queryRunner.query(`DROP TABLE IF EXISTS message_history;`)
  }
}
