import { MigrationInterface, QueryRunner } from 'typeorm'

export class AnalyticsUnique1731100000002 implements MigrationInterface {
  name = 'AnalyticsUnique1731100000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'uq_analytics_daily_date_metric_scope'
      ) THEN
        CREATE UNIQUE INDEX uq_analytics_daily_date_metric_scope
        ON analytics_daily(date, metric, scope_type, scope_id);
      END IF;
      END $$;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS uq_analytics_daily_date_metric_scope;`)
  }
}
