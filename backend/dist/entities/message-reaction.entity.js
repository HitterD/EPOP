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
exports.MessageReaction = void 0;
const typeorm_1 = require("typeorm");
const message_entity_1 = require("./message.entity");
const user_entity_1 = require("./user.entity");
let MessageReaction = class MessageReaction {
    messageId;
    userId;
    emoji;
    message;
    user;
    createdAt;
};
exports.MessageReaction = MessageReaction;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'message_id', type: 'bigint' }),
    __metadata("design:type", String)
], MessageReaction.prototype, "messageId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id', type: 'bigint' }),
    __metadata("design:type", String)
], MessageReaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'emoji', type: 'text' }),
    __metadata("design:type", String)
], MessageReaction.prototype, "emoji", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => message_entity_1.Message, (m) => m.reactions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'message_id' }),
    __metadata("design:type", message_entity_1.Message)
], MessageReaction.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MessageReaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], MessageReaction.prototype, "createdAt", void 0);
exports.MessageReaction = MessageReaction = __decorate([
    (0, typeorm_1.Entity)({ name: 'message_reactions' })
], MessageReaction);
//# sourceMappingURL=message-reaction.entity.js.map