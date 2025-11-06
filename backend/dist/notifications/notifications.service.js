"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const redis_module_1 = require("../redis/redis.module");
const ioredis_1 = __importDefault(require("ioredis"));
const webPush = __importStar(require("web-push"));
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const chat_participant_entity_1 = require("../entities/chat-participant.entity");
const typeorm_2 = require("typeorm");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    sub;
    kv;
    config;
    parts;
    logger = new common_1.Logger(NotificationsService_1.name);
    vapidEnabled = false;
    constructor(sub, kv, config, parts) {
        this.sub = sub;
        this.kv = kv;
        this.config = config;
        this.parts = parts;
    }
    async onModuleInit() {
        const pubKey = this.config.get('VAPID_PUBLIC_KEY') || '';
        const privKey = this.config.get('VAPID_PRIVATE_KEY') || '';
        const subject = this.config.get('VAPID_SUBJECT') || 'mailto:admin@epop.local';
        if (pubKey && privKey) {
            webPush.setVapidDetails(subject, pubKey, privKey);
            this.vapidEnabled = true;
        }
        await this.sub.psubscribe('epop.chat.message.created');
        this.sub.on('pmessage', async (_pattern, channel, message) => {
            try {
                if (channel === 'epop.chat.message.created') {
                    const evt = JSON.parse(message);
                    await this.handleChatMessageCreated(evt);
                }
            }
            catch (e) {
                this.logger.warn(`notifications event error: ${String(e)}`);
            }
        });
    }
    async onModuleDestroy() {
        try {
            await this.sub.punsubscribe('epop.chat.message.created');
        }
        catch { }
    }
    async handleChatMessageCreated(evt) {
        if (!evt || !evt.chatId)
            return;
        if (evt.delivery !== 'urgent')
            return;
        const chatId = String(evt.chatId);
        const senderId = evt.userId ? String(evt.userId) : undefined;
        const members = await this.parts.find({ where: { chatId } });
        const targets = members.map(m => m.userId).filter(uid => uid !== senderId);
        await Promise.all(targets.map(uid => this.pushToUser(uid, {
            title: 'Urgent message',
            body: 'You have an urgent message',
            data: { chatId, messageId: evt.messageId },
        })));
    }
    async pushToUser(userId, payload) {
        try {
            const subJson = await this.kv.get(`push:user:${userId}`);
            if (!subJson)
                return;
            if (!this.vapidEnabled)
                return;
            const subscription = JSON.parse(subJson);
            await webPush.sendNotification(subscription, JSON.stringify(payload)).catch(() => undefined);
        }
        catch (e) {
            this.logger.warn(`push failed for user ${userId}: ${String(e)}`);
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_module_1.REDIS_SUB)),
    __param(1, (0, common_1.Inject)(redis_module_1.REDIS_PUB)),
    __param(3, (0, typeorm_1.InjectRepository)(chat_participant_entity_1.ChatParticipant)),
    __metadata("design:paramtypes", [ioredis_1.default,
        ioredis_1.default,
        config_1.ConfigService,
        typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map