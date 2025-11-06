import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly admin;
    constructor(admin: AdminService);
    bulk(file: Express.Multer.File): Promise<{
        imported: number;
    }>;
    analytics(): Promise<{
        messagesPerDay: any;
        activeUsers: any;
        storageBytes: any;
    }>;
}
