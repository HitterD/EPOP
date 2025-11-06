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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../entities/project.entity");
const project_member_entity_1 = require("../entities/project-member.entity");
const task_bucket_entity_1 = require("../entities/task-bucket.entity");
const task_entity_1 = require("../entities/task.entity");
const task_comment_entity_1 = require("../entities/task-comment.entity");
const task_assignee_entity_1 = require("../entities/task-assignee.entity");
const outbox_service_1 = require("../events/outbox.service");
let ProjectsService = class ProjectsService {
    projects;
    members;
    buckets;
    tasks;
    comments;
    assignees;
    outbox;
    constructor(projects, members, buckets, tasks, comments, assignees, outbox) {
        this.projects = projects;
        this.members = members;
        this.buckets = buckets;
        this.tasks = tasks;
        this.comments = comments;
        this.assignees = assignees;
        this.outbox = outbox;
    }
    async myProjects(userId) {
        const rows = await this.members.find({ where: { userId }, relations: { project: true } });
        return rows.map((r) => r.project);
    }
    async createProject(userId, dto) {
        const project = await this.projects.save(this.projects.create({ name: dto.name, description: dto.description ?? null, owner: { id: userId } }));
        await this.members.save(this.members.create({ projectId: project.id, userId }));
        await this.outbox.append({ name: 'project.task.updated', aggregateType: 'project', aggregateId: project.id, userId, payload: { projectId: project.id, action: 'created' } });
        return project;
    }
    async addMember(actorId, projectId, userId, role = 'member') {
        const member = await this.members.save(this.members.create({ projectId, userId, role }));
        await this.outbox.append({ name: 'project.task.updated', aggregateType: 'project', aggregateId: projectId, userId: actorId, payload: { projectId, action: 'member_added', userId } });
        return member;
    }
    async createBucket(actorId, projectId, name, position) {
        const bucket = await this.buckets.save(this.buckets.create({ project: { id: projectId }, name, position }));
        await this.outbox.append({ name: 'project.task.updated', aggregateType: 'project', aggregateId: projectId, userId: actorId, payload: { projectId, action: 'bucket_created', bucketId: bucket.id } });
        return bucket;
    }
    async createTask(actorId, dto) {
        const task = await this.tasks.save(this.tasks.create({ project: { id: dto.projectId }, bucket: dto.bucketId ? { id: dto.bucketId } : null, title: dto.title, description: dto.description ?? null, position: dto.position, createdBy: { id: actorId } }));
        await this.outbox.append({ name: 'project.task.created', aggregateType: 'task', aggregateId: task.id, userId: actorId, payload: { projectId: dto.projectId, bucketId: dto.bucketId ?? null, taskId: task.id } });
        return task;
    }
    async moveTask(actorId, taskId, dto) {
        const task = await this.tasks.findOne({ where: { id: taskId }, relations: { project: true, bucket: true } });
        if (!task || task.project.id !== dto.projectId)
            throw new common_1.NotFoundException('Task not found');
        task.bucket = dto.bucketId ? { id: dto.bucketId } : null;
        task.position = dto.position;
        await this.tasks.save(task);
        await this.outbox.append({ name: 'project.task.moved', aggregateType: 'task', aggregateId: taskId, userId: actorId, payload: { projectId: dto.projectId, bucketId: dto.bucketId, position: dto.position } });
        return { success: true };
    }
    async comment(actorId, taskId, body) {
        const task = await this.tasks.findOne({ where: { id: taskId }, relations: { project: true } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const comment = await this.comments.save(this.comments.create({ task: { id: taskId }, user: { id: actorId }, body }));
        await this.outbox.append({ name: 'project.task.commented', aggregateType: 'task', aggregateId: taskId, userId: actorId, payload: { projectId: task.project.id, taskId, commentId: comment.id } });
        return comment;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(project_member_entity_1.ProjectMember)),
    __param(2, (0, typeorm_1.InjectRepository)(task_bucket_entity_1.TaskBucket)),
    __param(3, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(4, (0, typeorm_1.InjectRepository)(task_comment_entity_1.TaskComment)),
    __param(5, (0, typeorm_1.InjectRepository)(task_assignee_entity_1.TaskAssignee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        outbox_service_1.OutboxService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map