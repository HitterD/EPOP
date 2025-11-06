import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDirectoryAudit1730700000000 implements MigrationInterface {
  name = 'AddDirectoryAudit1730700000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS directory_audit (
        id BIGSERIAL PRIMARY KEY,
        action TEXT NOT NULL,
        actor_id BIGINT NOT NULL,
        target_id BIGINT NOT NULL,
        from_parent_id BIGINT NULL,
        to_parent_id BIGINT NULL,
        details JSONB NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_directory_audit_created_at ON directory_audit (created_at DESC);`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_directory_audit_actor ON directory_audit (actor_id);`)
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_directory_audit_target ON directory_audit (target_id);`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS directory_audit;`)
  }
}
