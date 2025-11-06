import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { SearchService } from './search.service';
import { Message } from '../entities/message.entity';
import { MailMessage } from '../entities/mail-message.entity';
import { Task } from '../entities/task.entity';
import { ConfigService } from '@nestjs/config';
export declare class SearchEventsSubscriber implements OnModuleInit, OnModuleDestroy {
    private readonly sub;
    private readonly search;
    private readonly messages;
    private readonly mails;
    private readonly tasks;
    private readonly logger;
    private prefix;
    constructor(sub: Redis, search: SearchService, messages: Repository<Message>, mails: Repository<MailMessage>, tasks: Repository<Task>, config: ConfigService);
    private idx;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private onMessageCreated;
    private onTaskCreated;
    private onMailCreated;
}
