"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const outbox_entity_1 = require("./outbox.entity");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
let OutboxService = class OutboxService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async append(event, manager) {
        const payload = event.payload ?? {};
        const entity = this.repo.create({
            eventName: event.name,
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            userId: event.userId ?? null,
            payload: {
                id: event.id ?? (0, uuid_1.v4)(),
                timestamp: event.timestamp ?? new Date().toISOString(),
                version: 1,
                ...payload,
            },
        });
        if (manager) {
            await manager.getRepository(outbox_entity_1.DomainOutbox).save(entity);
        }
        else {
            await this.repo.save(entity);
        }
        return entity;
    }
    async appendWithManager(manager, event) {
        return this.append(event, manager);
    }
    async getUndelivered(limit = 100) {
        return this.repo.find({ where: { deliveredAt: (0, typeorm_2.IsNull)() }, order: { id: 'ASC' }, take: limit });
    }
    async markDelivered(ids) {
        if (!ids.length)
            return;
        await this.repo.update({ id: (0, typeorm_2.In)(ids) }, { deliveredAt: new Date() });
    }
};
exports.OutboxService = OutboxService;
exports.OutboxService = OutboxService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(outbox_entity_1.DomainOutbox)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OutboxService);
//# sourceMappingURL=outbox.service.js.map