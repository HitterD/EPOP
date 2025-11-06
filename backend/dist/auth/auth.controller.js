"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const common_2 = require("@nestjs/common");
const redis_module_1 = require("../redis/redis.module");
const ioredis_1 = __importDefault(require("ioredis"));
const argon2 = __importStar(require("argon2"));
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const typeorm_2 = require("typeorm");
const mailer_service_1 = require("../mailer/mailer.service");
const swagger_1 = require("@nestjs/swagger");
let AuthController = class AuthController {
    auth;
    config;
    redis;
    users;
    mailer;
    constructor(auth, config, redis, users, mailer) {
        this.auth = auth;
        this.config = config;
        this.redis = redis;
        this.users = users;
        this.mailer = mailer;
    }
    cookieOpts(maxAgeSeconds) {
        const domain = this.config.get('COOKIE_DOMAIN') || 'localhost';
        const secure = (this.config.get('NODE_ENV') || 'development') === 'production';
        return {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            domain,
            path: '/',
            maxAge: maxAgeSeconds * 1000,
        };
    }
    async login(dto, res) {
        const user = await this.auth.validateUser(dto.email, dto.password);
        const accessToken = await this.auth.signAccessToken(user);
        const refreshToken = await this.auth.signRefreshToken(user);
        const accessTtl = this.config.get('JWT_ACCESS_TTL') ?? 900;
        const refreshTtl = this.config.get('JWT_REFRESH_TTL') ?? 1209600;
        res.cookie('accessToken', accessToken, this.cookieOpts(accessTtl));
        res.cookie('refreshToken', refreshToken, this.cookieOpts(refreshTtl));
        return { success: true };
    }
    async refresh(req, res) {
        const token = req.cookies?.refreshToken;
        if (!token)
            throw new common_1.UnauthorizedException('Missing refresh token');
        const payload = await this.auth.verifyRefreshToken(token);
        if (payload.typ !== 'refresh')
            throw new common_1.UnauthorizedException('Invalid token');
        const accessTtl = this.config.get('JWT_ACCESS_TTL') ?? 900;
        const refreshTtl = this.config.get('JWT_REFRESH_TTL') ?? 1209600;
        const user = await this.users.findOne({ where: { id: payload.sub } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const accessToken = await this.auth.signAccessToken(user);
        const refreshToken = await this.auth.signRefreshToken(user);
        res.cookie('accessToken', accessToken, this.cookieOpts(accessTtl));
        res.cookie('refreshToken', refreshToken, this.cookieOpts(refreshTtl));
        return { success: true };
    }
    async logout(res) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return { success: true };
    }
    async forgot(email) {
        const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        await this.redis.set(`pwdreset:${email}`, token, 'EX', 1800);
        await this.mailer.sendPasswordReset(email, token);
        return { success: true };
    }
    async reset(body) {
        const saved = await this.redis.get(`pwdreset:${body.email}`);
        if (!saved || saved !== body.token)
            throw new common_1.UnauthorizedException('Invalid reset token');
        const user = await this.users.findOne({ where: { email: body.email } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        user.passwordHash = await argon2.hash(body.password);
        await this.users.save(user);
        await this.redis.del(`pwdreset:${body.email}`);
        return { success: true };
    }
    async subscribePush(req, body) {
        const userId = req.user.userId;
        await this.redis.set(`push:user:${userId}`, JSON.stringify(body));
        return { success: true };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('password/forgot'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgot", null);
__decorate([
    (0, common_1.Post)('password/reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "reset", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('push/subscribe'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "subscribePush", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __param(2, (0, common_2.Inject)(redis_module_1.REDIS_PUB)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService,
        ioredis_1.default,
        typeorm_2.Repository,
        mailer_service_1.MailerService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map