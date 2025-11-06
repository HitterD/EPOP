import { MigrationInterface, QueryRunner } from 'typeorm'

export class FutureWave1Schemas1731100000000 implements MigrationInterface {
  name = 'FutureWave1Schemas1731100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // analytics_daily
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS analytics_daily (
        id BIGSERIAL PRIMARY KEY,
        date DATE NOT NULL,
        metric TEXT NOT NULL,
        scope_type TEXT NOT NULL,
        scope_id BIGINT NULL,
        value BIGINT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date);`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_analytics_daily_metric ON analytics_daily(metric);`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_analytics_daily_scope ON analytics_daily(scope_type, scope_id);`)

    // calendar_events
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id BIGSERIAL PRIMARY KEY,
        owner_id BIGINT NULL,
        title TEXT NOT NULL,
        start_ts TIMESTAMPTZ NOT NULL,
        end_ts TIMESTAMPTZ NOT NULL,
        location TEXT NULL,
        source TEXT NOT NULL DEFAULT 'internal',
        project_id BIGINT NULL,
        task_id BIGINT NULL,
        all_day BOOLEAN NOT NULL DEFAULT false,
        reminders JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_calendar_events_owner_start ON calendar_events(owner_id, start_ts);`)
    await queryRunner.query(`
      ALTER TABLE calendar_events
      ADD CONSTRAINT fk_calendar_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;
    `)
    await queryRunner.query(`
      ALTER TABLE calendar_events
      ADD CONSTRAINT fk_calendar_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
    `)
    await queryRunner.query(`
      ALTER TABLE calendar_events
      ADD CONSTRAINT fk_calendar_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL;
    `)

    // workflows
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT false,
        json_spec JSONB NOT NULL,
        created_by BIGINT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `)
    await queryRunner.query(`
      ALTER TABLE workflows
      ADD CONSTRAINT fk_workflows_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    `)

    // workflow_runs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS workflow_runs (
        id BIGSERIAL PRIMARY KEY,
        workflow_id BIGINT NOT NULL,
        status TEXT NOT NULL,
        started_at TIMESTAMPTZ DEFAULT now(),
        finished_at TIMESTAMPTZ NULL,
        logs JSONB NULL
      );
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON workflow_runs(workflow_id);`)
    await queryRunner.query(`
      ALTER TABLE workflow_runs
      ADD CONSTRAINT fk_workflow_runs_workflow FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE workflow_runs DROP CONSTRAINT IF EXISTS fk_workflow_runs_workflow;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_workflow_runs_workflow;`)
    await queryRunner.query(`DROP TABLE IF EXISTS workflow_runs;`)

    await queryRunner.query(`ALTER TABLE workflows DROP CONSTRAINT IF EXISTS fk_workflows_created_by;`)
    await queryRunner.query(`DROP TABLE IF EXISTS workflows;`)

    await queryRunner.query(`ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS fk_calendar_task;`)
    await queryRunner.query(`ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS fk_calendar_project;`)
    await queryRunner.query(`ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS fk_calendar_owner;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_calendar_events_owner_start;`)
    await queryRunner.query(`DROP TABLE IF EXISTS calendar_events;`)

    await queryRunner.query(`DROP INDEX IF EXISTS idx_analytics_daily_scope;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_analytics_daily_metric;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_analytics_daily_date;`)
    await queryRunner.query(`DROP TABLE IF EXISTS analytics_daily;`)
  }
}
