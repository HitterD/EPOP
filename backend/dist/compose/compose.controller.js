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
exports.ComposeController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const compose_service_1 = require("./compose.service");
let ComposeController = class ComposeController {
    compose;
    constructor(compose) {
        this.compose = compose;
    }
    async list(req, folder = 'received', limit, beforeId) {
        const lim = Math.max(1, Math.min(100, Number(limit ?? 50)));
        return this.compose.list(req.user.userId, folder, lim, beforeId);
    }
    async send(req, body) {
        return this.compose.send(req.user.userId, body);
    }
    async move(req, id, folder) {
        return this.compose.move(req.user.userId, id, folder);
    }
};
exports.ComposeController = ComposeController;
__decorate([
    (0, common_1.Get)('mails'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('folder')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('beforeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ComposeController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComposeController.prototype, "send", null);
__decorate([
    (0, common_1.Post)(':id/move'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ComposeController.prototype, "move", null);
exports.ComposeController = ComposeController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('compose'),
    __metadata("design:paramtypes", [compose_service_1.ComposeService])
], ComposeController);
//# sourceMappingURL=compose.controller.js.map