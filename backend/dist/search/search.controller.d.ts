import type { Request } from 'express';
import { SearchService } from './search.service';
import { CursorParamsDto } from '../common/dto/cursor.dto';
export declare class SearchController {
    private readonly search;
    constructor(search: SearchService);
    query(q: string, tab: 'all' | 'messages' | 'projects' | 'users' | 'files' | undefined, limitStr: string | undefined, offsetStr: string | undefined, req: Request & {
        user?: {
            userId?: string;
        };
    }): Promise<{
        messages: any[];
        files: any[];
        projects: any[];
        users: any[];
        total: number;
        took: number;
    }>;
    backfill(entity: 'messages' | 'mail_messages' | 'files' | 'tasks'): Promise<{
        success: boolean;
    }>;
    cursor(entity: 'messages' | 'mail_messages' | 'files' | 'tasks', q: string, params: CursorParamsDto, req: Request & {
        user?: {
            userId?: string;
        };
    }): Promise<{
        items: {
            [k: string]: unknown;
            _id?: string | number;
            id?: string | number;
            _source?: {
                id?: string | number;
            };
        }[];
        nextCursor: string | undefined;
        hasMore: boolean;
    } | {
        items: never[];
        hasMore: boolean;
    }>;
}
