import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    private readonly config;
    constructor(users: Repository<User>, jwt: JwtService, config: ConfigService);
    validateUser(email: string, password: string): Promise<User>;
    signAccessToken(user: User): Promise<string>;
    signRefreshToken(user: User): Promise<string>;
    verifyRefreshToken(token: string): Promise<any>;
}
