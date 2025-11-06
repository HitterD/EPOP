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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MailerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
let MailerService = MailerService_1 = class MailerService {
    config;
    logger = new common_1.Logger(MailerService_1.name);
    transporter = null;
    from;
    constructor(config) {
        this.config = config;
        const host = this.config.get('SMTP_HOST') || 'localhost';
        const port = this.config.get('SMTP_PORT') || 1025;
        const user = this.config.get('SMTP_USER') || '';
        const pass = this.config.get('SMTP_PASS') || '';
        const secure = !!this.config.get('SMTP_SECURE');
        this.from = this.config.get('MAIL_FROM') || 'noreply@epop.local';
        try {
            this.transporter = nodemailer_1.default.createTransport({ host, port, secure, auth: user ? { user, pass } : undefined });
        }
        catch (e) {
            this.logger.warn(`Mailer transport init failed: ${String(e)}`);
            this.transporter = null;
        }
    }
    async sendPasswordReset(email, token) {
        if (!this.transporter)
            return false;
        try {
            const subject = 'EPOP Password Reset';
            const text = `Use this token to reset your password: ${token}`;
            await this.transporter.sendMail({ from: this.from, to: email, subject, text });
            return true;
        }
        catch (e) {
            this.logger.warn(`sendPasswordReset failed: ${String(e)}`);
            return false;
        }
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = MailerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailerService);
//# sourceMappingURL=mailer.service.js.map