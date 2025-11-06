import { Repository } from 'typeorm';
import { FileEntity } from '../entities/file.entity';
import { FileLink } from '../entities/file-link.entity';
import { ConfigService } from '@nestjs/config';
export declare class FilesService {
    private readonly files;
    private readonly links;
    private readonly config;
    private s3;
    private bucket;
    constructor(files: Repository<FileEntity>, links: Repository<FileLink>, config: ConfigService);
    presign(ownerId: string | null, filename: string): Promise<{
        url: string;
        fields: {
            [x: string]: string;
        };
        fileId: string;
        key: string;
    }>;
    attach(fileId: string, dto: {
        refTable: 'messages' | 'mail_messages' | 'tasks';
        refId: string;
        filename?: string;
        mime?: string;
        size?: number;
    }): Promise<{
        success: boolean;
        linkId: string;
    }>;
    get(id: string): Promise<FileEntity>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
