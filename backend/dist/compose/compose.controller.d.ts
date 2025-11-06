import { ComposeService } from './compose.service';
import type { Mailbox } from '../entities/mail-message.entity';
export declare class ComposeController {
    private readonly compose;
    constructor(compose: ComposeService);
    list(req: any, folder?: Mailbox, limit?: string, beforeId?: string): Promise<import("../entities/mail-message.entity").MailMessage[]>;
    send(req: any, body: {
        toUsers: string[];
        subject?: string | null;
        bodyHtml?: string | null;
    }): Promise<import("../entities/mail-message.entity").MailMessage>;
    move(req: any, id: string, folder: Mailbox): Promise<{
        success: boolean;
    }>;
}
