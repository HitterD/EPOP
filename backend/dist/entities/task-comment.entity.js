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
exports.TaskComment = void 0;
const typeorm_1 = require("typeorm");
const task_entity_1 = require("./task.entity");
const user_entity_1 = require("./user.entity");
let TaskComment = class TaskComment {
    id;
    task;
    user;
    body;
    createdAt;
};
exports.TaskComment = TaskComment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", String)
], TaskComment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, (t) => t.comments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'task_id' }),
    __metadata("design:type", task_entity_1.Task)
], TaskComment.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Object)
], TaskComment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], TaskComment.prototype, "body", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz', default: () => 'now()' }),
    __metadata("design:type", Date)
], TaskComment.prototype, "createdAt", void 0);
exports.TaskComment = TaskComment = __decorate([
    (0, typeorm_1.Entity)({ name: 'task_comments' })
], TaskComment);
//# sourceMappingURL=task-comment.entity.js.map