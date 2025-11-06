"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = exports.REDIS_SUB = exports.REDIS_PUB = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
exports.REDIS_PUB = Symbol('REDIS_PUB');
exports.REDIS_SUB = Symbol('REDIS_SUB');
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.REDIS_PUB,
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const url = config.get('REDIS_URL') ?? 'redis://localhost:6379';
                    return new ioredis_1.default(url, { lazyConnect: false, maxRetriesPerRequest: null });
                },
            },
            {
                provide: exports.REDIS_SUB,
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const url = config.get('REDIS_URL') ?? 'redis://localhost:6379';
                    return new ioredis_1.default(url, { lazyConnect: false, maxRetriesPerRequest: null });
                },
            },
        ],
        exports: [exports.REDIS_PUB, exports.REDIS_SUB],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map