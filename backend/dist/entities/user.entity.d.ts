import { OrgUnit } from './org-unit.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
    orgUnit?: OrgUnit | null;
    phoneExt: string | null;
    presence: 'available' | 'busy' | 'away' | 'offline';
    isAdmin: boolean;
    createdAt: Date;
}
