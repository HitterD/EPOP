import { MigrationInterface, QueryRunner } from 'typeorm'

export class PerfIndexes1730900000000 implements MigrationInterface {
  name = 'PerfIndexes1730900000000'

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE INDEX IF NOT EXISTS idx_messages_chat_created_desc ON messages (chat_id, created_at DESC)`)
    await q.query(`CREATE INDEX IF NOT EXISTS idx_message_reads_user_msg ON message_reads (user_id, message_id)`)
    await q.query(`CREATE INDEX IF NOT EXISTS idx_files_owner_created ON files (owner_id, created_at)`)
    await q.query(`CREATE INDEX IF NOT EXISTS idx_messages_content_json_gin ON messages USING GIN (content_json)`)
    await q.query(`CREATE INDEX IF NOT EXISTS idx_mail_to_users_gin ON mail_messages USING GIN (to_users)`)
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS idx_mail_to_users_gin`)
    await q.query(`DROP INDEX IF EXISTS idx_messages_content_json_gin`)
    await q.query(`DROP INDEX IF EXISTS idx_files_owner_created`)
    await q.query(`DROP INDEX IF EXISTS idx_message_reads_user_msg`)
    await q.query(`DROP INDEX IF EXISTS idx_messages_chat_created_desc`)
  }
}
