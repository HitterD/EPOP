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
exports.Project = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const project_member_entity_1 = require("./project-member.entity");
const task_bucket_entity_1 = require("./task-bucket.entity");
const task_entity_1 = require("./task.entity");
let Project = class Project {
    id;
    name;
    description;
    owner;
    createdAt;
    members;
    buckets;
    tasks;
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], Project.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", Object)
], Project.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_member_entity_1.ProjectMember, (m) => m.project),
    __metadata("design:type", Array)
], Project.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_bucket_entity_1.TaskBucket, (b) => b.project),
    __metadata("design:type", Array)
], Project.prototype, "buckets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (t) => t.project),
    __metadata("design:type", Array)
], Project.prototype, "tasks", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)({ name: 'projects' })
], Project);
//# sourceMappingURL=project.entity.js.map