import { FileEntity } from './file.entity';
export declare class FileLink {
    id: string;
    file: FileEntity;
    refTable: 'messages' | 'mail_messages' | 'tasks';
    refId: string;
}
