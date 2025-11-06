import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './config/env.validation';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmRootAsyncOptions } from './database/typeorm.config';
import { HealthModule } from './health/health.module';
import { EventsModule } from './events/events.module';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DirectoryModule } from './directory/directory.module';
import { ChatModule } from './chat/chat.module';
import { FilesModule } from './files/files.module';
import { ComposeModule } from './compose/compose.module';
import { ProjectsModule } from './projects/projects.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { PresenceModule } from './presence/presence.module';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { LastModifiedInterceptor } from './common/interceptors/last-modified.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MetricsModule } from './metrics/metrics.module';
import { VitalsModule } from './vitals/vitals.module';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { QueuesModule } from './queues/queues.module';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CalendarModule } from './calendar/calendar.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { WorkflowsModule } from './workflows/workflows.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: Math.max(1, Math.floor((config.get<number>('RATE_LIMIT_WINDOW_MS') ?? 60000) / 1000)),
            limit: config.get<number>('RATE_LIMIT_MAX') ?? 100,
          },
        ],
      } as any),
    }),
    TypeOrmModule.forRootAsync(typeOrmRootAsyncOptions),
    HealthModule,
    EventsModule,
    GatewayModule,
    AuthModule,
    UsersModule,
    DirectoryModule,
    ChatModule,
    FilesModule,
    ComposeModule,
    ProjectsModule,
    SearchModule,
    NotificationsModule,
    AdminModule,
    PresenceModule,
    MetricsModule,
    QueuesModule,
    VitalsModule,
    CalendarModule,
    AnalyticsModule,
    WorkflowsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LastModifiedInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
