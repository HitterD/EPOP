import { PresenceService } from './presence.service';
export declare class PresenceController {
    private readonly presence;
    constructor(presence: PresenceService);
    heartbeat(req: any, ttl?: number): Promise<{
        ok: boolean;
        ttl: number;
    }>;
    me(req: any): Promise<{
        userId: string;
        online: boolean;
    }>;
}
