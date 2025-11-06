export declare class FileEntity {
    id: string;
    ownerId: string | null;
    filename: string;
    mime: string | null;
    size: string | null;
    s3Key: string;
    createdAt: Date;
}
