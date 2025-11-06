import { MigrationInterface, QueryRunner } from 'typeorm'

export class EnableCitext1710000000000 implements MigrationInterface {
  name = 'EnableCitext1710000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP EXTENSION IF EXISTS citext`)
  }
}
