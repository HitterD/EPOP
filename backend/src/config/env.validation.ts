import { plainToInstance, Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator'

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV?: NodeEnv

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  PORT?: number

  @IsString()
  @IsNotEmpty()
  DB_HOST!: string

  @Type(() => Number)
  @IsNumber()
  DB_PORT!: number

  @IsString()
  @IsNotEmpty()
  DB_USER!: string

  @IsString()
  @IsNotEmpty()
  DB_PASS!: string

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string

  @IsString()
  @IsOptional()
  REDIS_URL?: string

  @IsString()
  @IsOptional()
  MINIO_ENDPOINT?: string

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  MINIO_PORT?: number

  @IsString()
  @IsOptional()
  MINIO_ACCESS_KEY?: string

  @IsString()
  @IsOptional()
  MINIO_SECRET_KEY?: string

  @IsString()
  @IsOptional()
  MINIO_BUCKET?: string

  @IsBoolean()
  @IsOptional()
  MINIO_USE_SSL?: boolean

  @IsString()
  @IsOptional()
  ZINC_URL?: string

  @IsString()
  @IsOptional()
  ZINC_USER?: string

  @IsString()
  @IsOptional()
  ZINC_PASS?: string

  @IsString()
  @IsOptional()
  ZINC_INDEX_PREFIX?: string

  @IsString()
  @IsOptional()
  SMTP_HOST?: string

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  SMTP_PORT?: number

  @IsString()
  @IsOptional()
  SMTP_USER?: string

  @IsString()
  @IsOptional()
  SMTP_PASS?: string

  @IsBoolean()
  @IsOptional()
  SMTP_SECURE?: boolean

  @IsString()
  @IsOptional()
  MAIL_FROM?: string

  @IsString()
  @IsOptional()
  VAPID_PUBLIC_KEY?: string

  @IsString()
  @IsOptional()
  VAPID_PRIVATE_KEY?: string

  @IsString()
  @IsOptional()
  VAPID_SUBJECT?: string

  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  RATE_LIMIT_WINDOW_MS?: number

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  RATE_LIMIT_MAX?: number

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  EMAIL_WORKER_CONCURRENCY?: number

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  SEARCH_WORKER_CONCURRENCY?: number

  // JWT/Auth
  @IsString()
  @IsOptional()
  JWT_ACCESS_SECRET?: string

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  JWT_ACCESS_TTL?: number

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  JWT_REFRESH_TTL?: number

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN?: string

  // TypeORM logging (dev only)
  @IsBoolean()
  @IsOptional()
  TYPEORM_LOGGING?: boolean

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  TYPEORM_SLOW_QUERY_THRESHOLD_MS?: number

  @IsString()
  @IsOptional()
  TYPEORM_SLOW_QUERY_LOG_FILE?: string
}

export function validate(config: Record<string, unknown>) {
  const defaults = {
    NODE_ENV: 'development',
    PORT: 4000,
    DB_HOST: 'localhost',
    DB_PORT: 5432,
    DB_USER: 'epop',
    DB_PASS: 'epop',
    DB_NAME: 'epop',
    REDIS_URL: 'redis://localhost:6379',
    MINIO_ENDPOINT: 'localhost',
    MINIO_PORT: 9000,
    MINIO_ACCESS_KEY: 'minio',
    MINIO_SECRET_KEY: 'minio123',
    MINIO_BUCKET: 'epop',
    MINIO_USE_SSL: false,
    ZINC_URL: 'http://localhost:4080',
    ZINC_USER: 'admin',
    ZINC_PASS: 'admin',
    ZINC_INDEX_PREFIX: 'epop',
    SMTP_HOST: 'localhost',
    SMTP_PORT: 1025,
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_SECURE: false,
    MAIL_FROM: 'noreply@epop.local',
    VAPID_SUBJECT: 'mailto:admin@epop.local',
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX: 100,
    JWT_ACCESS_SECRET: 'dev_access_secret_change',
    JWT_REFRESH_SECRET: 'dev_refresh_secret_change',
    JWT_ACCESS_TTL: 900,
    JWT_REFRESH_TTL: 1209600,
    COOKIE_DOMAIN: 'localhost',
    EMAIL_WORKER_CONCURRENCY: 5,
    SEARCH_WORKER_CONCURRENCY: 5,
    TYPEORM_LOGGING: false,
    TYPEORM_SLOW_QUERY_THRESHOLD_MS: 200,
    TYPEORM_SLOW_QUERY_LOG_FILE: 'logs/slow-queries.log',
    ...config,
  }
  const validated = plainToInstance(EnvironmentVariables, defaults, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validated, { skipMissingProperties: false })
  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validated
}
