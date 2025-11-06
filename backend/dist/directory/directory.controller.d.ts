import { DirectoryService } from './directory.service';
export declare class DirectoryController {
    private readonly dir;
    constructor(dir: DirectoryService);
    tree(): Promise<{
        orgTree: any;
    }>;
    create(dto: {
        name: string;
        code?: string | null;
        parentId?: string | null;
    }): Promise<import("../entities/org-unit.entity").OrgUnit>;
    update(id: string, dto: {
        name?: string;
        code?: string | null;
    }): Promise<import("../entities/org-unit.entity").OrgUnit>;
    remove(id: string): Promise<import("../entities/org-unit.entity").OrgUnit>;
    move(id: string, parentId: string | null): Promise<import("../entities/org-unit.entity").OrgUnit>;
    users(id: string): Promise<any>;
    moveUser(userId: string, orgId: string): Promise<import("../entities/user.entity").User>;
}
