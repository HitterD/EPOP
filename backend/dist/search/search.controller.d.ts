import { SearchService } from './search.service';
export declare class SearchController {
    private readonly search;
    constructor(search: SearchService);
    query(q: string): Promise<{
        results: any[];
    }>;
    backfill(entity: 'messages' | 'mail_messages' | 'files' | 'tasks'): Promise<{
        success: boolean;
    }>;
}
