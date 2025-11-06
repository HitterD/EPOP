import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { OrgUnit } from '../entities/org-unit.entity';
import { Message } from '../entities/message.entity';
import { FileEntity } from '../entities/file.entity';
export declare class AdminService {
    private readonly users;
    private readonly orgs;
    private readonly messages;
    private readonly files;
    constructor(users: Repository<User>, orgs: Repository<OrgUnit>, messages: Repository<Message>, files: Repository<FileEntity>);
    bulkImportUsersFromCSV(buffer: Buffer): Promise<{
        imported: number;
    }>;
    analyticsSummary(): Promise<{
        messagesPerDay: any;
        activeUsers: any;
        storageBytes: any;
    }>;
}
