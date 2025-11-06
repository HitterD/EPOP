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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../entities/message.entity");
const mail_message_entity_1 = require("../entities/mail-message.entity");
const file_entity_1 = require("../entities/file.entity");
const task_entity_1 = require("../entities/task.entity");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
const node_http_1 = require("node:http");
const node_https_1 = require("node:https");
let SearchService = SearchService_1 = class SearchService {
    messages;
    mails;
    files;
    tasks;
    config;
    logger = new common_1.Logger(SearchService_1.name);
    client;
    prefix;
    constructor(messages, mails, files, tasks, config) {
        this.messages = messages;
        this.mails = mails;
        this.files = files;
        this.tasks = tasks;
        this.config = config;
        const baseURL = this.config.get('ZINC_URL') || 'http://localhost:4080';
        const user = this.config.get('ZINC_USER') || 'admin';
        const pass = this.config.get('ZINC_PASS') || 'admin';
        this.prefix = this.config.get('ZINC_INDEX_PREFIX') || 'epop';
        const httpAgent = new node_http_1.Agent({ keepAlive: true, keepAliveMsecs: 20000, maxSockets: 128 });
        const httpsAgent = new node_https_1.Agent({ keepAlive: true, keepAliveMsecs: 20000, maxSockets: 128 });
        this.client = axios_1.default.create({
            baseURL,
            auth: { username: user, password: pass },
            timeout: 180000,
            httpAgent,
            httpsAgent,
            transitional: { clarifyTimeoutError: true },
        });
        this.client.interceptors.response.use(undefined, async (error) => {
            const cfg = error.config || {};
            cfg.__retries = (cfg.__retries ?? 0) + 1;
            const retriable = (error.code === 'ECONNRESET' ||
                error.code === 'ETIMEDOUT' ||
                error.code === 'ESOCKETTIMEDOUT' ||
                error.code === 'EAI_AGAIN' ||
                (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout')));
            if (cfg.__retries <= 5 && retriable) {
                const base = 300;
                const delay = Math.max(100, base * Math.pow(2, cfg.__retries));
                await new Promise((r) => setTimeout(r, delay));
                return this.client(cfg);
            }
            return Promise.reject(error);
        });
    }
    idx(name) { return `${this.prefix}_${name}`; }
    async searchAll(q) {
        const indices = [this.idx('messages'), this.idx('mail_messages'), this.idx('files'), this.idx('tasks')];
        const results = [];
        for (const index of indices) {
            try {
                const { data } = await this.client.post(`/api/${index}/_search`, { query: q, search_type: 'match', from: 0, max_results: 50 });
                results.push({ index, hits: data?.hits || [] });
            }
            catch (e) {
                this.logger.warn(`search failed for ${index}: ${String(e?.message || e)}`);
            }
        }
        return { results };
    }
    async backfill(entity) {
        if (entity === 'messages') {
            const rows = await this.messages.find({ relations: { sender: true, chat: true } });
            for (const m of rows) {
                await this.indexDoc(this.idx('messages'), m.id, {
                    chatId: m.chat?.id,
                    senderId: m.sender?.id,
                    delivery: m.delivery,
                    createdAt: m.createdAt,
                    text: JSON.stringify(m.contentJson),
                });
            }
        }
        else if (entity === 'mail_messages') {
            const rows = await this.mails.find();
            for (const m of rows) {
                await this.indexDoc(this.idx('mail_messages'), m.id, {
                    fromUser: m.fromUser,
                    toUsers: m.toUsers,
                    subject: m.subject,
                    bodyHtml: m.bodyHtml,
                    folder: m.folder,
                    createdAt: m.createdAt,
                });
            }
        }
        else if (entity === 'files') {
            const rows = await this.files.find();
            for (const f of rows) {
                await this.indexDoc(this.idx('files'), f.id, {
                    ownerId: f.ownerId,
                    filename: f.filename,
                    mime: f.mime,
                    size: f.size,
                    createdAt: f.createdAt,
                });
            }
        }
        else if (entity === 'tasks') {
            const rows = await this.tasks.find({ relations: { project: true } });
            for (const t of rows) {
                await this.indexDoc(this.idx('tasks'), t.id, {
                    projectId: t.project?.id,
                    title: t.title,
                    description: t.description,
                    priority: t.priority,
                    progress: t.progress,
                    dueAt: t.dueAt,
                    createdAt: t.createdAt,
                });
            }
        }
        return { success: true };
    }
    async indexDoc(index, id, body) {
        try {
            await this.client.post(`/api/${index}/_doc/${id}`, body);
            return true;
        }
        catch (e) {
            this.logger.warn(`index ${index}/${id} failed: ${String(e?.message || e)}`);
            return false;
        }
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(mail_message_entity_1.MailMessage)),
    __param(2, (0, typeorm_1.InjectRepository)(file_entity_1.FileEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], SearchService);
//# sourceMappingURL=search.service.js.map