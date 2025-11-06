"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const outbox_entity_1 = require("./outbox.entity");
const outbox_service_1 = require("./outbox.service");
const publisher_service_1 = require("./publisher.service");
const redis_module_1 = require("../redis/redis.module");
let EventsModule = class EventsModule {
};
exports.EventsModule = EventsModule;
exports.EventsModule = EventsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([outbox_entity_1.DomainOutbox]), redis_module_1.RedisModule],
        providers: [outbox_service_1.OutboxService, publisher_service_1.OutboxPublisherService],
        exports: [outbox_service_1.OutboxService],
    })
], EventsModule);
//# sourceMappingURL=events.module.js.map