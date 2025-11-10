import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
export interface JwtPayload {
    sub: string;
    email?: string;
    name?: string;
    typ?: string;
    sid?: string;
    adm?: boolean;
}
declare const JwtStrategy_base: new (options?: any, verify?: any) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        email: string | undefined;
        name: string | undefined;
        sid: string | undefined;
        adm: boolean;
    }>;
}
export {};
