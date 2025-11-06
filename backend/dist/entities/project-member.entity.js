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
exports.ProjectMember = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("./project.entity");
const user_entity_1 = require("./user.entity");
let ProjectMember = class ProjectMember {
    projectId;
    userId;
    project;
    user;
    role;
};
exports.ProjectMember = ProjectMember;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'project_id', type: 'bigint' }),
    __metadata("design:type", String)
], ProjectMember.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id', type: 'bigint' }),
    __metadata("design:type", String)
], ProjectMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, (p) => p.members, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'project_id' }),
    __metadata("design:type", project_entity_1.Project)
], ProjectMember.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ProjectMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { default: 'member' }),
    __metadata("design:type", String)
], ProjectMember.prototype, "role", void 0);
exports.ProjectMember = ProjectMember = __decorate([
    (0, typeorm_1.Entity)({ name: 'project_members' })
], ProjectMember);
//# sourceMappingURL=project-member.entity.js.map