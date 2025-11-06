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
var SearchEventsSubscriber_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchEventsSubscriber = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ioredis_1 = __importDefault(require("ioredis"));
const redis_module_1 = require("../redis/redis.module");
const search_service_1 = require("./search.service");
const message_entity_1 = require("../entities/message.entity");
const mail_message_entity_1 = require("../entities/mail-message.entity");
const task_entity_1 = require("../entities/task.entity");
const config_1 = require("@nestjs/config");
let SearchEventsSubscriber = SearchEventsSubscriber_1 = class SearchEventsSubscriber {
    sub;
    search;
    messages;
    mails;
    tasks;
    logger = new common_1.Logger(SearchEventsSubscriber_1.name);
    prefix;
    constructor(sub, search, messages, mails, tasks, config) {
        this.sub = sub;
        this.search = search;
        this.messages = messages;
        this.mails = mails;
        this.tasks = tasks;
        this.prefix = config.get('ZINC_INDEX_PREFIX') || 'epop';
    }
    idx(name) { return `${this.prefix}_${name}`; }
    async onModuleInit() {
        await this.sub.psubscribe('epop.chat.message.created', 'epop.project.task.created', 'epop.mail.message.created');
        this.sub.on('pmessage', async (_p, channel, message) => {
            try {
                const evt = JSON.parse(message);
                if (channel === 'epop.chat.message.created') {
                    await this.onMessageCreated(evt);
                }
                else if (channel === 'epop.project.task.created') {
                    await this.onTaskCreated(evt);
                }
                else if (channel === 'epop.mail.message.created') {
                    await this.onMailCreated(evt);
                }
            }
            catch (e) {
                this.logger.warn(`search subscriber error: ${String(e)}`);
            }
        });
    }
    async onModuleDestroy() {
        try {
            await this.sub.punsubscribe('epop.chat.message.created', 'epop.project.task.created', 'epop.mail.message.created');
        }
        catch { }
    }
    async onMessageCreated(evt) {
        if (!evt?.messageId)
            return;
        const m = await this.messages.findOne({ where: { id: String(evt.messageId) }, relations: { chat: true, sender: true } });
        if (!m)
            return;
        await this.search.indexDoc(this.idx('messages'), m.id, {
            chatId: m.chat?.id,
            senderId: m.sender?.id,
            delivery: m.delivery,
            createdAt: m.createdAt,
            text: JSON.stringify(m.contentJson),
        });
    }
    async onTaskCreated(evt) {
        if (!evt?.taskId)
            return;
        const t = await this.tasks.findOne({ where: { id: String(evt.taskId) }, relations: { project: true } });
        if (!t)
            return;
        await this.search.indexDoc(this.idx('tasks'), t.id, {
            projectId: t.project?.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            progress: t.progress,
            dueAt: t.dueAt,
            createdAt: t.createdAt,
        });
    }
    async onMailCreated(evt) {
        if (!evt?.mailId)
            return;
        const m = await this.mails.findOne({ where: { id: String(evt.mailId) } });
        if (!m)
            return;
        await this.search.indexDoc(this.idx('mail_messages'), m.id, {
            fromUser: m.fromUser,
            toUsers: m.toUsers,
            subject: m.subject,
            bodyHtml: m.bodyHtml,
            folder: m.folder,
            createdAt: m.createdAt,
        });
    }
};
exports.SearchEventsSubscriber = SearchEventsSubscriber;
exports.SearchEventsSubscriber = SearchEventsSubscriber = SearchEventsSubscriber_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_module_1.REDIS_SUB)),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(3, (0, typeorm_1.InjectRepository)(mail_message_entity_1.MailMessage)),
    __param(4, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [ioredis_1.default,
        search_service_1.SearchService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], SearchEventsSubscriber);
//# sourceMappingURL=search.subscriber.js.map