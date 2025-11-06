import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { TypeOrmFileLogger } from './typeorm-logger'

export const typeOrmRootAsyncOptions: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    port: config.get<number>('DB_PORT'),
    username: config.get<string>('DB_USER'),
    password: config.get<string>('DB_PASS'),
    database: config.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    namingStrategy: new SnakeNamingStrategy(),
    migrations: ['dist/migrations/*.js'],
    migrationsRun: false,
    logging: (String(config.get<string>('TYPEORM_LOGGING') ?? 'false').toLowerCase() === 'true')
      ? ['error', 'warn', 'query']
      : ['error', 'warn'],
    maxQueryExecutionTime: (String(config.get<string>('TYPEORM_LOGGING') ?? 'false').toLowerCase() === 'true')
      ? Number(config.get<number>('TYPEORM_SLOW_QUERY_THRESHOLD_MS') ?? 200)
      : undefined,
    logger: (String(config.get<string>('TYPEORM_LOGGING') ?? 'false').toLowerCase() === 'true')
      ? new TypeOrmFileLogger(
          Number(config.get<number>('TYPEORM_SLOW_QUERY_THRESHOLD_MS') ?? 200),
          config.get<string>('TYPEORM_SLOW_QUERY_LOG_FILE') ?? 'logs/slow-queries.log',
        )
      : 'advanced-console',
  }),
}
