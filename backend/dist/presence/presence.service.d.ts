import Redis from 'ioredis';
export declare class PresenceService {
    private readonly redis;
    constructor(redis: Redis);
    heartbeat(userId: string, ttlSeconds?: number): Promise<{
        ok: boolean;
        ttl: number;
    }>;
    get(userId: string): Promise<{
        userId: string;
        online: boolean;
    }>;
}
