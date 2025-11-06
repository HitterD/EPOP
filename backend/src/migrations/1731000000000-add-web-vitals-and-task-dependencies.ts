import { MigrationInterface, QueryRunner } from "typeorm"

export class AddWebVitalsAndTaskDependencies1731000000000 implements MigrationInterface {
  name = 'AddWebVitalsAndTaskDependencies1731000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // web_vitals
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS web_vitals (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NULL,
        metric_name VARCHAR(50) NOT NULL,
        metric_value DECIMAL(10,2) NOT NULL,
        rating VARCHAR(20) NOT NULL,
        delta DECIMAL(10,2) NULL,
        metric_id VARCHAR(100) NULL,
        navigation_type VARCHAR(20) NULL,
        url TEXT NOT NULL,
        user_agent TEXT NULL,
        metadata JSONB NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals (metric_name)`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON web_vitals (created_at)`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON web_vitals (rating)`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_web_vitals_url ON web_vitals (url)`)
    await queryRunner.query(`
      ALTER TABLE web_vitals
      ADD CONSTRAINT fk_web_vitals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    `)

    // task_dependencies
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id BIGSERIAL PRIMARY KEY,
        predecessor_id BIGINT NOT NULL,
        successor_id BIGINT NOT NULL,
        lag_days INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT uq_task_dependencies UNIQUE (predecessor_id, successor_id)
      );
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_task_deps_predecessor ON task_dependencies (predecessor_id)`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_task_deps_successor ON task_dependencies (successor_id)`)
    await queryRunner.query(`
      ALTER TABLE task_dependencies
      ADD CONSTRAINT fk_task_deps_predecessor FOREIGN KEY (predecessor_id) REFERENCES tasks(id) ON DELETE CASCADE
    `)
    await queryRunner.query(`
      ALTER TABLE task_dependencies
      ADD CONSTRAINT fk_task_deps_successor FOREIGN KEY (successor_id) REFERENCES tasks(id) ON DELETE CASCADE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drop fks first
    await queryRunner.query(`ALTER TABLE task_dependencies DROP CONSTRAINT IF EXISTS fk_task_deps_successor`)
    await queryRunner.query(`ALTER TABLE task_dependencies DROP CONSTRAINT IF EXISTS fk_task_deps_predecessor`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_deps_successor`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_task_deps_predecessor`)
    await queryRunner.query(`DROP TABLE IF EXISTS task_dependencies`)

    await queryRunner.query(`ALTER TABLE web_vitals DROP CONSTRAINT IF EXISTS fk_web_vitals_user`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_web_vitals_url`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_web_vitals_rating`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_web_vitals_created_at`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_web_vitals_metric_name`)
    await queryRunner.query(`DROP TABLE IF EXISTS web_vitals`)
  }
}
