"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmRootAsyncOptions = void 0;
const config_1 = require("@nestjs/config");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
exports.typeOrmRootAsyncOptions = {
    inject: [config_1.ConfigService],
    useFactory: (config) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
        migrations: ['dist/migrations/*.js'],
        migrationsRun: false,
        logging: ['error', 'warn'],
    }),
};
//# sourceMappingURL=typeorm.config.js.map