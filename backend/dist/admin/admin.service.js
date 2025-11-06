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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const org_unit_entity_1 = require("../entities/org-unit.entity");
const message_entity_1 = require("../entities/message.entity");
const file_entity_1 = require("../entities/file.entity");
const argon2 = __importStar(require("argon2"));
const sync_1 = require("csv-parse/sync");
let AdminService = class AdminService {
    users;
    orgs;
    messages;
    files;
    constructor(users, orgs, messages, files) {
        this.users = users;
        this.orgs = orgs;
        this.messages = messages;
        this.files = files;
    }
    async bulkImportUsersFromCSV(buffer) {
        if (!buffer || buffer.length === 0)
            throw new common_1.BadRequestException('Missing CSV data');
        let records = [];
        try {
            const content = buffer.toString('utf8');
            records = (0, sync_1.parse)(content, {
                bom: true,
                columns: true,
                skip_empty_lines: true,
                relax_column_count: true,
                trim: true,
            });
        }
        catch (e) {
            throw new common_1.BadRequestException('Invalid CSV format');
        }
        const norm = (v) => String(v ?? '').trim();
        const toLower = (v) => norm(v).toLowerCase();
        let imported = 0;
        for (const rec of records) {
            if (!rec)
                continue;
            const obj = {};
            for (const k of Object.keys(rec))
                obj[toLower(k)] = rec[k];
            const email = toLower(obj['username'] ?? obj['email']);
            if (!email)
                continue;
            const name = norm(obj['name']) || email;
            const pass = norm(obj['password']) || Math.random().toString(36).slice(2);
            const ext = obj['extension'] ? norm(obj['extension']) : null;
            const role = toLower(obj['role']);
            const orgCode = obj['org_unit_code'] ? norm(obj['org_unit_code']) : null;
            let org = null;
            if (orgCode) {
                org = await this.orgs.findOne({ where: { code: orgCode } });
                if (!org)
                    org = await this.orgs.save(this.orgs.create({ name: orgCode, code: orgCode }));
            }
            let user = await this.users.findOne({ where: { email } });
            const passwordHash = await argon2.hash(pass);
            if (!user) {
                user = this.users.create({ email, displayName: name, passwordHash, phoneExt: ext, isAdmin: role === 'admin', orgUnit: org ?? undefined });
            }
            else {
                user.displayName = name;
                user.phoneExt = ext;
                user.isAdmin = role === 'admin';
                user.orgUnit = org ?? null;
                user.passwordHash = passwordHash;
            }
            await this.users.save(user);
            imported++;
        }
        return { imported };
    }
    async analyticsSummary() {
        const messagesPerDay = await this.messages.query(`
      SELECT to_char(created_at::date, 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
      FROM messages
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY day ORDER BY day
    `);
        const activeUsers = await this.users.query(`
      SELECT COUNT(*)::int AS count FROM users WHERE presence <> 'offline'
    `);
        const storage = await this.files.query(`
      SELECT COALESCE(SUM(size::bigint),0)::bigint AS bytes FROM files
    `);
        return {
            messagesPerDay,
            activeUsers: activeUsers?.[0]?.count ?? 0,
            storageBytes: storage?.[0]?.bytes ?? 0,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(org_unit_entity_1.OrgUnit)),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(3, (0, typeorm_1.InjectRepository)(file_entity_1.FileEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map