"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const PORT = Number(process.env.DB_PORT ?? 5432);
const IS_TS = !!process.env.TS_NODE || process.env.NODE_ENV === 'development';
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: isNaN(PORT) ? 5432 : PORT,
    username: process.env.DB_USER ?? 'epop',
    password: process.env.DB_PASS ?? 'epop',
    database: process.env.DB_NAME ?? 'epop',
    entities: ['dist/**/*.entity.js'],
    migrations: [IS_TS ? 'src/migrations/*.ts' : 'dist/migrations/*.js'],
    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
    logging: ['error', 'warn'],
});
exports.default = exports.AppDataSource;
//# sourceMappingURL=data-source.js.map