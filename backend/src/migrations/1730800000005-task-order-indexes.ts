import { MigrationInterface, QueryRunner } from 'typeorm'

export class TaskOrderIndexes1730800000005 implements MigrationInterface {
  name = 'TaskOrderIndexes1730800000005'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_tasks_project_bucket_pos ON tasks(project_id, bucket_id, position);`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS ix_tasks_project_nullbucket_pos ON tasks(project_id, position) WHERE bucket_id IS NULL;`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS ix_tasks_project_bucket_pos ON tasks(project_id, bucket_id, position) WHERE bucket_id IS NOT NULL;`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS ix_tasks_project_bucket_pos;`)
    await queryRunner.query(`DROP INDEX IF EXISTS ix_tasks_project_nullbucket_pos;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tasks_project_bucket_pos;`)
  }
}
