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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceService = void 0;
const common_1 = require("@nestjs/common");
const redis_module_1 = require("../redis/redis.module");
const ioredis_1 = __importDefault(require("ioredis"));
let PresenceService = class PresenceService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async heartbeat(userId, ttlSeconds = 60) {
        const key = `presence:user:${userId}`;
        await this.redis.set(key, '1', 'EX', ttlSeconds);
        return { ok: true, ttl: ttlSeconds };
    }
    async get(userId) {
        const exists = await this.redis.exists(`presence:user:${userId}`);
        return { userId, online: exists === 1 };
    }
};
exports.PresenceService = PresenceService;
exports.PresenceService = PresenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_module_1.REDIS_PUB)),
    __metadata("design:paramtypes", [ioredis_1.default])
], PresenceService);
//# sourceMappingURL=presence.service.js.map