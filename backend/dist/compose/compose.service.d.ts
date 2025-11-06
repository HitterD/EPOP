import { Repository } from 'typeorm';
import { MailMessage, Mailbox } from '../entities/mail-message.entity';
import { OutboxService } from '../events/outbox.service';
export declare class ComposeService {
    private readonly mails;
    private readonly outbox;
    constructor(mails: Repository<MailMessage>, outbox: OutboxService);
    list(userId: string, folder: Mailbox, limit?: number, beforeId?: string): Promise<MailMessage[]>;
    send(fromUser: string, dto: {
        toUsers: string[];
        subject?: string | null;
        bodyHtml?: string | null;
    }): Promise<MailMessage>;
    move(userId: string, id: string, folder: Mailbox): Promise<{
        success: boolean;
    }>;
}
