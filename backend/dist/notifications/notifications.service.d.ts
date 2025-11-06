import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { ChatParticipant } from '../entities/chat-participant.entity';
import { Repository } from 'typeorm';
export declare class NotificationsService implements OnModuleInit, OnModuleDestroy {
    private readonly sub;
    private readonly kv;
    private readonly config;
    private readonly parts;
    private readonly logger;
    private vapidEnabled;
    constructor(sub: Redis, kv: Redis, config: ConfigService, parts: Repository<ChatParticipant>);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private handleChatMessageCreated;
    private pushToUser;
}
