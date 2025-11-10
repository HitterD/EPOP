"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const typeorm_logger_1 = require("./typeorm-logger");
const PORT = Number(process.env.DB_PORT ?? 5432);
const TYPEORM_LOGGING = String(process.env.TYPEORM_LOGGING ?? 'false').toLowerCase() === 'true';
const SLOW_MS = Number(process.env.TYPEORM_SLOW_QUERY_THRESHOLD_MS ?? 200);
const SLOW_LOG_FILE = process.env.TYPEORM_SLOW_QUERY_LOG_FILE ?? 'logs/slow-queries.log';
const IS_TS = (__filename.endsWith('.ts'))
    || String(process.env.TS_NODE || '').toLowerCase() === 'true'
    || String(process.env.TS_NODE_DEV || '').toLowerCase() === 'true'
    || (process.env.NODE_ENV === 'development');
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: isNaN(PORT) ? 5432 : PORT,
    username: process.env.DB_USER ?? 'epop',
    password: process.env.DB_PASS ?? 'epop',
    database: process.env.DB_NAME ?? 'epop',
    entities: IS_TS ? ['src/**/*.entity.ts'] : ['dist/**/*.entity.js'],
    migrations: IS_TS ? ['src/migrations/*.ts'] : ['dist/migrations/*.js'],
    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
    logging: TYPEORM_LOGGING ? ['error', 'warn', 'query'] : ['error', 'warn'],
    maxQueryExecutionTime: TYPEORM_LOGGING ? SLOW_MS : undefined,
    logger: TYPEORM_LOGGING ? new typeorm_logger_1.TypeOrmFileLogger(SLOW_MS, SLOW_LOG_FILE) : 'advanced-console',
});
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map