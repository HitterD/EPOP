import { MigrationInterface, QueryRunner } from 'typeorm'

export class TasksTimestamptz1730800000002 implements MigrationInterface {
  name = 'TasksTimestamptz1730800000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_due;`)
    await queryRunner.query(`ALTER TABLE tasks ALTER COLUMN start_at TYPE TIMESTAMPTZ USING start_at::timestamptz;`)
    await queryRunner.query(`ALTER TABLE tasks ALTER COLUMN due_at TYPE TIMESTAMPTZ USING due_at::timestamptz;`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_task_due ON tasks(due_at);`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_project_created ON tasks(project_id, created_at);`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_project_created;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_due;`)
    await queryRunner.query(`ALTER TABLE tasks ALTER COLUMN due_at TYPE DATE USING due_at::date;`)
    await queryRunner.query(`ALTER TABLE tasks ALTER COLUMN start_at TYPE DATE USING start_at::date;`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_task_due ON tasks(due_at);`)
  }
}
