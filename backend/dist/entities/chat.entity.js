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
exports.Chat = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const chat_participant_entity_1 = require("./chat-participant.entity");
const message_entity_1 = require("./message.entity");
let Chat = class Chat {
    id;
    isGroup;
    title;
    createdBy;
    createdAt;
    participants;
    messages;
};
exports.Chat = Chat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], Chat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_group', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Chat.prototype, "isGroup", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], Chat.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", Object)
], Chat.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], Chat.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_participant_entity_1.ChatParticipant, (p) => p.chat),
    __metadata("design:type", Array)
], Chat.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (m) => m.chat),
    __metadata("design:type", Array)
], Chat.prototype, "messages", void 0);
exports.Chat = Chat = __decorate([
    (0, typeorm_1.Entity)({ name: 'chats' })
], Chat);
//# sourceMappingURL=chat.entity.js.map