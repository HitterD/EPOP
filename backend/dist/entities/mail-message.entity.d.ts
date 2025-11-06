export type Mailbox = 'received' | 'sent' | 'deleted';
export declare class MailMessage {
    id: string;
    fromUser: string | null;
    toUsers: string[];
    subject: string | null;
    bodyHtml: string | null;
    folder: Mailbox;
    createdAt: Date;
}
