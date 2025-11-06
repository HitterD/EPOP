"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnableCitext1710000000000 = void 0;
class EnableCitext1710000000000 {
    name = 'EnableCitext1710000000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP EXTENSION IF EXISTS citext`);
    }
}
exports.EnableCitext1710000000000 = EnableCitext1710000000000;
//# sourceMappingURL=1710000000000-EnableCitext.js.map