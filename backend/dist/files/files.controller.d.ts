import { FilesService } from './files.service';
export declare class FilesController {
    private readonly files;
    constructor(files: FilesService);
    presign(req: any, body: {
        filename: string;
    }): Promise<{
        url: string;
        fields: {
            [x: string]: string;
        };
        fileId: string;
        key: string;
    }>;
    attach(body: {
        fileId: string;
        refTable: 'messages' | 'mail_messages' | 'tasks';
        refId: string;
        filename?: string;
        mime?: string;
        size?: number;
    }): Promise<{
        success: boolean;
        linkId: string;
    }>;
    get(id: string): Promise<import("../entities/file.entity").FileEntity>;
}
