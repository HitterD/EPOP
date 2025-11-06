import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNotificationPreferences1730800000004 implements MigrationInterface {
  name = 'AddNotificationPreferences1730800000004'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        channels JSONB,
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `)
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS ux_notification_prefs_user ON notification_preferences(user_id);`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS ux_notification_prefs_user;`)
    await queryRunner.query(`DROP TABLE IF EXISTS notification_preferences;`)
  }
}
