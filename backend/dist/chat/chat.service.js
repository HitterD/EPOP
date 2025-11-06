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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_entity_1 = require("../entities/chat.entity");
const chat_participant_entity_1 = require("../entities/chat-participant.entity");
const message_entity_1 = require("../entities/message.entity");
const message_reaction_entity_1 = require("../entities/message-reaction.entity");
const message_read_entity_1 = require("../entities/message-read.entity");
const outbox_service_1 = require("../events/outbox.service");
let ChatService = class ChatService {
    chats;
    participants;
    messages;
    reactions;
    reads;
    outbox;
    constructor(chats, participants, messages, reactions, reads, outbox) {
        this.chats = chats;
        this.participants = participants;
        this.messages = messages;
        this.reactions = reactions;
        this.reads = reads;
        this.outbox = outbox;
    }
    async listChats(userId) {
        const rows = await this.participants.find({ where: { userId }, relations: { chat: true } });
        return rows.map((r) => r.chat);
    }
    async listThreadMessages(userId, chatId, rootMessageId) {
        const isMember = await this.participants.findOne({ where: { chatId, userId } });
        if (!isMember)
            throw new common_1.ForbiddenException();
        const items = await this.messages.find({ where: { chat: { id: chatId }, rootMessage: { id: rootMessageId } }, order: { id: 'ASC' }, relations: { sender: true } });
        return items;
    }
    async createChat(createdBy, dto) {
        const chat = await this.chats.save(this.chats.create({ isGroup: dto.isGroup, title: dto.title ?? null, createdBy: { id: createdBy } }));
        const parts = Array.from(new Set([createdBy, ...dto.participantIds]));
        await this.participants.save(parts.map((uid) => this.participants.create({ chatId: chat.id, userId: uid })));
        await this.outbox.append({ name: 'chat.participant.joined', aggregateType: 'chat', aggregateId: chat.id, userId: createdBy, payload: { chatId: chat.id, userId: createdBy } });
        return chat;
    }
    async listMessages(userId, chatId, limit = 20, beforeId) {
        const isMember = await this.participants.findOne({ where: { chatId, userId } });
        if (!isMember)
            throw new common_1.ForbiddenException();
        const where = { chat: { id: chatId } };
        if (beforeId)
            where.id = (0, typeorm_2.LessThan)(beforeId);
        const items = await this.messages.find({ where, order: { id: 'DESC' }, take: limit, relations: { sender: true } });
        return items.reverse();
    }
    async sendMessage(userId, dto) {
        const isMember = await this.participants.findOne({ where: { chatId: dto.chatId, userId } });
        if (!isMember)
            throw new common_1.ForbiddenException();
        const msg = await this.messages.save(this.messages.create({ chat: { id: dto.chatId }, sender: { id: userId }, contentJson: dto.content, delivery: dto.delivery ?? 'normal', rootMessage: dto.rootMessageId ? { id: dto.rootMessageId } : null }));
        await this.outbox.append({ name: 'chat.message.created', aggregateType: 'message', aggregateId: msg.id, userId, payload: { chatId: dto.chatId, messageId: msg.id, delivery: msg.delivery } });
        if (msg.delivery === 'urgent') {
            await this.outbox.append({ name: 'user.presence.updated', aggregateType: 'user', aggregateId: userId, userId, payload: { notify: 'urgent', chatId: dto.chatId, messageId: msg.id } });
        }
        return msg;
    }
    async addReaction(userId, dto) {
        const message = await this.messages.findOne({ where: { id: dto.messageId }, relations: { chat: true } });
        if (!message)
            throw new common_1.NotFoundException('Message not found');
        const isMember = await this.participants.findOne({ where: { chatId: message.chat.id, userId } });
        if (!isMember)
            throw new common_1.ForbiddenException();
        await this.reactions.save(this.reactions.create({ messageId: dto.messageId, userId, emoji: dto.emoji }));
        await this.outbox.append({ name: 'chat.message.reaction.added', aggregateType: 'message', aggregateId: dto.messageId, userId, payload: { chatId: message.chat.id, emoji: dto.emoji } });
        return { success: true };
    }
    async removeReaction(userId, dto) {
        const message = await this.messages.findOne({ where: { id: dto.messageId }, relations: { chat: true } });
        if (!message)
            throw new common_1.NotFoundException('Message not found');
        const isMember = await this.participants.findOne({ where: { chatId: message.chat.id, userId } });
        if (!isMember)
            throw new common_1.ForbiddenException();
        await this.reactions.delete({ messageId: dto.messageId, userId, emoji: dto.emoji });
        await this.outbox.append({ name: 'chat.message.reaction.removed', aggregateType: 'message', aggregateId: dto.messageId, userId, payload: { chatId: message.chat.id, emoji: dto.emoji } });
        return { success: true };
    }
    async markRead(userId, messageId) {
        const message = await this.messages.findOne({ where: { id: messageId }, relations: { chat: true } });
        if (!message)
            throw new common_1.NotFoundException('Message not found');
        const isMember = await this.participants.findOne({ where: { chatId: message.chat.id, userId } });
        if (!isMember)
            throw new common_1.ForbiddenException();
        await this.reads.save(this.reads.create({ messageId, userId, readAt: new Date() }));
        await this.outbox.append({ name: 'chat.message.read', aggregateType: 'message', aggregateId: messageId, userId, payload: { chatId: message.chat.id } });
        return { success: true };
    }
    async unreadPerChat(userId) {
        const rows = await this.messages.query(`
      SELECT m.chat_id, COUNT(*) AS unread
      FROM messages m
      LEFT JOIN message_reads r 
        ON r.message_id = m.id AND r.user_id = $1
      JOIN chat_participants p
        ON p.chat_id = m.chat_id AND p.user_id = $1
      WHERE r.message_id IS NULL AND m.sender_id <> $1
      GROUP BY m.chat_id;`, [userId]);
        return rows;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_participant_entity_1.ChatParticipant)),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(3, (0, typeorm_1.InjectRepository)(message_reaction_entity_1.MessageReaction)),
    __param(4, (0, typeorm_1.InjectRepository)(message_read_entity_1.MessageRead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        outbox_service_1.OutboxService])
], ChatService);
//# sourceMappingURL=chat.service.js.map