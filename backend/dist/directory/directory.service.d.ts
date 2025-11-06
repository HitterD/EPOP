import { OrgUnit } from '../entities/org-unit.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export declare class DirectoryService {
    private readonly orgs;
    private readonly users;
    constructor(orgs: Repository<OrgUnit>, users: Repository<User>);
    tree(): Promise<{
        orgTree: any;
    }>;
    create(dto: {
        name: string;
        code?: string | null;
        parentId?: string | null;
    }): Promise<OrgUnit>;
    update(id: string, dto: {
        name?: string;
        code?: string | null;
    }): Promise<OrgUnit>;
    remove(id: string): Promise<OrgUnit>;
    move(id: string, newParentId: string | null): Promise<OrgUnit>;
    usersInOrg(orgId: string): Promise<any>;
    moveUserToOrg(userId: string, orgId: string): Promise<User>;
}
