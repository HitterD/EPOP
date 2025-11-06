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
exports.MailMessage = void 0;
const typeorm_1 = require("typeorm");
let MailMessage = class MailMessage {
    id;
    fromUser;
    toUsers;
    subject;
    bodyHtml;
    folder;
    createdAt;
};
exports.MailMessage = MailMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], MailMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_user', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], MailMessage.prototype, "fromUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_users', type: 'bigint', array: true }),
    __metadata("design:type", Array)
], MailMessage.prototype, "toUsers", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], MailMessage.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'body_html', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], MailMessage.prototype, "bodyHtml", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'folder', type: 'enum', enum: ['received', 'sent', 'deleted'], enumName: 'mailbox' }),
    __metadata("design:type", String)
], MailMessage.prototype, "folder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], MailMessage.prototype, "createdAt", void 0);
exports.MailMessage = MailMessage = __decorate([
    (0, typeorm_1.Entity)({ name: 'mail_messages' })
], MailMessage);
//# sourceMappingURL=mail-message.entity.js.map