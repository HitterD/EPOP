import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MailMessage } from '../entities/mail-message.entity';
import { FileEntity } from '../entities/file.entity';
import { Task } from '../entities/task.entity';
import { ConfigService } from '@nestjs/config';
export declare class SearchService {
    private readonly messages;
    private readonly mails;
    private readonly files;
    private readonly tasks;
    private readonly config;
    private readonly logger;
    private client;
    private prefix;
    constructor(messages: Repository<Message>, mails: Repository<MailMessage>, files: Repository<FileEntity>, tasks: Repository<Task>, config: ConfigService);
    private idx;
    searchAll(q: string): Promise<{
        results: any[];
    }>;
    backfill(entity: 'messages' | 'mail_messages' | 'files' | 'tasks'): Promise<{
        success: boolean;
    }>;
    indexDoc(index: string, id: string, body: any): Promise<boolean>;
}
