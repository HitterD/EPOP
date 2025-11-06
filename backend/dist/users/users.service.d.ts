import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { OrgUnit } from '../entities/org-unit.entity';
export declare class UsersService {
    private readonly users;
    private readonly orgs;
    constructor(users: Repository<User>, orgs: Repository<OrgUnit>);
    me(userId: string): Promise<User>;
    updateMe(userId: string, dto: Partial<Pick<User, 'displayName' | 'phoneExt'>>): Promise<User>;
    setPresence(userId: string, presence: User['presence']): Promise<User>;
    moveUser(userId: string, orgUnitId: string): Promise<User>;
}
