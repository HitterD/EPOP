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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const chat_service_1 = require("./chat.service");
let ChatController = class ChatController {
    chat;
    constructor(chat) {
        this.chat = chat;
    }
    async list(req) {
        return this.chat.listChats(req.user.userId);
    }
    async create(req, dto) {
        return this.chat.createChat(req.user.userId, dto);
    }
    async messages(req, chatId, limit, beforeId) {
        const lim = Math.max(1, Math.min(100, Number(limit ?? 20)));
        return this.chat.listMessages(req.user.userId, chatId, lim, beforeId);
    }
    async send(req, chatId, body) {
        return this.chat.sendMessage(req.user.userId, { chatId, content: body.content, delivery: body.delivery, rootMessageId: body.rootMessageId ?? null });
    }
    async thread(req, chatId, rootMessageId) {
        return this.chat.listThreadMessages(req.user.userId, chatId, rootMessageId);
    }
    async addReaction(req, chatId, body) {
        return this.chat.addReaction(req.user.userId, body);
    }
    async removeReaction(req, chatId, body) {
        return this.chat.removeReaction(req.user.userId, body);
    }
    async markRead(req, chatId, messageId) {
        return this.chat.markRead(req.user.userId, messageId);
    }
    async unread(req) {
        return this.chat.unreadPerChat(req.user.userId);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':chatId/messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('beforeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "messages", null);
__decorate([
    (0, common_1.Post)(':chatId/messages'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "send", null);
__decorate([
    (0, common_1.Get)(':chatId/threads'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Query)('rootMessageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "thread", null);
__decorate([
    (0, common_1.Post)(':chatId/reactions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addReaction", null);
__decorate([
    (0, common_1.Delete)(':chatId/reactions'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "removeReaction", null);
__decorate([
    (0, common_1.Post)(':chatId/reads'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Body)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markRead", null);
__decorate([
    (0, common_1.Get)('unread'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "unread", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('chats'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map