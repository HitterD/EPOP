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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const org_unit_entity_1 = require("./org-unit.entity");
let User = class User {
    id;
    email;
    passwordHash;
    displayName;
    orgUnit;
    phoneExt;
    presence;
    isAdmin;
    createdAt;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'citext', unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', type: 'text' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_name', type: 'text' }),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => org_unit_entity_1.OrgUnit, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'org_unit_id' }),
    __metadata("design:type", Object)
], User.prototype, "orgUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_ext', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "phoneExt", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { default: 'offline' }),
    __metadata("design:type", String)
], User.prototype, "presence", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_admin', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isAdmin", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], User);
//# sourceMappingURL=user.entity.js.map