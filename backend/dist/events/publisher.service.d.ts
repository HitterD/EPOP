import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import Redis from 'ioredis';
export declare class OutboxPublisherService implements OnModuleInit, OnModuleDestroy {
    private readonly outbox;
    private readonly pub;
    private readonly logger;
    private timer;
    constructor(outbox: OutboxService, pub: Redis);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private tick;
}
