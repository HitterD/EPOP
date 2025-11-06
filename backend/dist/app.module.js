"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const env_validation_1 = require("./config/env.validation");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_config_1 = require("./database/typeorm.config");
const health_module_1 = require("./health/health.module");
const events_module_1 = require("./events/events.module");
const gateway_module_1 = require("./gateway/gateway.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const directory_module_1 = require("./directory/directory.module");
const chat_module_1 = require("./chat/chat.module");
const files_module_1 = require("./files/files.module");
const compose_module_1 = require("./compose/compose.module");
const projects_module_1 = require("./projects/projects.module");
const search_module_1 = require("./search/search.module");
const notifications_module_1 = require("./notifications/notifications.module");
const admin_module_1 = require("./admin/admin.module");
const presence_module_1 = require("./presence/presence.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, validate: env_validation_1.validate }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    throttlers: [
                        {
                            ttl: Math.max(1, Math.floor((config.get('RATE_LIMIT_WINDOW_MS') ?? 60000) / 1000)),
                            limit: config.get('RATE_LIMIT_MAX') ?? 100,
                        },
                    ],
                }),
            }),
            typeorm_1.TypeOrmModule.forRootAsync(typeorm_config_1.typeOrmRootAsyncOptions),
            health_module_1.HealthModule,
            events_module_1.EventsModule,
            gateway_module_1.GatewayModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            directory_module_1.DirectoryModule,
            chat_module_1.ChatModule,
            files_module_1.FilesModule,
            compose_module_1.ComposeModule,
            projects_module_1.ProjectsModule,
            search_module_1.SearchModule,
            notifications_module_1.NotificationsModule,
            admin_module_1.AdminModule,
            presence_module_1.PresenceModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map