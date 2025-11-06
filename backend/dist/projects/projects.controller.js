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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const projects_service_1 = require("./projects.service");
let ProjectsController = class ProjectsController {
    projects;
    constructor(projects) {
        this.projects = projects;
    }
    async mine(req) {
        return this.projects.myProjects(req.user.userId);
    }
    async create(req, body) {
        return this.projects.createProject(req.user.userId, body);
    }
    async addMember(req, projectId, body) {
        return this.projects.addMember(req.user.userId, projectId, body.userId, body.role ?? 'member');
    }
    async createBucket(req, projectId, body) {
        return this.projects.createBucket(req.user.userId, projectId, body.name, body.position);
    }
    async createTask(req, projectId, body) {
        return this.projects.createTask(req.user.userId, { projectId, bucketId: body.bucketId ?? null, title: body.title, description: body.description ?? null, position: body.position });
    }
    async moveTask(req, projectId, taskId, body) {
        return this.projects.moveTask(req.user.userId, taskId, { projectId, bucketId: body.bucketId, position: body.position });
    }
    async comment(req, projectId, taskId, text) {
        return this.projects.comment(req.user.userId, taskId, text);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "mine", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':projectId/members'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Post)(':projectId/buckets'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createBucket", null);
__decorate([
    (0, common_1.Post)(':projectId/tasks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createTask", null);
__decorate([
    (0, common_1.Post)(':projectId/tasks/:taskId/move'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('taskId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "moveTask", null);
__decorate([
    (0, common_1.Post)(':projectId/tasks/:taskId/comments'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('taskId')),
    __param(3, (0, common_1.Body)('body')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "comment", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map