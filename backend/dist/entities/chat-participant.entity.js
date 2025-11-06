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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatParticipant = void 0;
const typeorm_1 = require("typeorm");
const chat_entity_1 = require("./chat.entity");
const user_entity_1 = require("./user.entity");
let ChatParticipant = class ChatParticipant {
    chatId;
    userId;
    chat;
    user;
    role;
    pinned;
    muted;
};
exports.ChatParticipant = ChatParticipant;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'chat_id', type: 'bigint' }),
    __metadata("design:type", String)
], ChatParticipant.prototype, "chatId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id', type: 'bigint' }),
    __metadata("design:type", String)
], ChatParticipant.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_entity_1.Chat, (c) => c.participants, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'chat_id' }),
    __metadata("design:type", chat_entity_1.Chat)
], ChatParticipant.prototype, "chat", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ChatParticipant.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { default: 'member' }),
    __metadata("design:type", String)
], ChatParticipant.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], ChatParticipant.prototype, "pinned", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], ChatParticipant.prototype, "muted", void 0);
exports.ChatParticipant = ChatParticipant = __decorate([
    (0, typeorm_1.Entity)({ name: 'chat_participants' })
], ChatParticipant);
//# sourceMappingURL=chat-participant.entity.js.map