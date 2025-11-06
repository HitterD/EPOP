export declare class OrgUnit {
    id: string;
    parent?: OrgUnit | null;
    children: OrgUnit[];
    name: string;
    code: string | null;
}
