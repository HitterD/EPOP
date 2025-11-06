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
exports.DomainOutbox = void 0;
const typeorm_1 = require("typeorm");
let DomainOutbox = class DomainOutbox {
    id;
    eventName;
    aggregateType;
    aggregateId;
    userId;
    payload;
    createdAt;
    deliveredAt;
};
exports.DomainOutbox = DomainOutbox;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], DomainOutbox.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_name', type: 'text' }),
    __metadata("design:type", String)
], DomainOutbox.prototype, "eventName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'aggregate_type', type: 'text' }),
    __metadata("design:type", String)
], DomainOutbox.prototype, "aggregateType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'aggregate_id', type: 'bigint' }),
    __metadata("design:type", String)
], DomainOutbox.prototype, "aggregateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], DomainOutbox.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], DomainOutbox.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], DomainOutbox.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'delivered_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], DomainOutbox.prototype, "deliveredAt", void 0);
exports.DomainOutbox = DomainOutbox = __decorate([
    (0, typeorm_1.Entity)({ name: 'domain_outbox' })
], DomainOutbox);
//# sourceMappingURL=outbox.entity.js.map