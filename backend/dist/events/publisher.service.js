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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OutboxPublisherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxPublisherService = void 0;
const common_1 = require("@nestjs/common");
const outbox_service_1 = require("./outbox.service");
const redis_module_1 = require("../redis/redis.module");
const ioredis_1 = __importDefault(require("ioredis"));
const common_2 = require("@nestjs/common");
let OutboxPublisherService = OutboxPublisherService_1 = class OutboxPublisherService {
    outbox;
    pub;
    logger = new common_1.Logger(OutboxPublisherService_1.name);
    timer = null;
    constructor(outbox, pub) {
        this.outbox = outbox;
        this.pub = pub;
    }
    onModuleInit() {
        this.timer = setInterval(() => this.tick().catch(err => this.logger.error(err)), 1000);
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
    }
    async tick() {
        const batch = await this.outbox.getUndelivered(100);
        if (batch.length === 0)
            return;
        const delivered = [];
        for (const evt of batch) {
            try {
                const channel = `epop.${evt.eventName}`;
                await this.pub.publish(channel, JSON.stringify({
                    name: evt.eventName,
                    aggregateType: evt.aggregateType,
                    aggregateId: evt.aggregateId,
                    userId: evt.userId,
                    ...evt.payload,
                }));
                delivered.push(evt.id);
            }
            catch (e) {
                this.logger.warn(`Publish failed for outbox ${evt.id}: ${String(e)}`);
            }
        }
        if (delivered.length)
            await this.outbox.markDelivered(delivered);
    }
};
exports.OutboxPublisherService = OutboxPublisherService;
exports.OutboxPublisherService = OutboxPublisherService = OutboxPublisherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_2.Inject)(redis_module_1.REDIS_PUB)),
    __metadata("design:paramtypes", [outbox_service_1.OutboxService,
        ioredis_1.default])
], OutboxPublisherService);
//# sourceMappingURL=publisher.service.js.map