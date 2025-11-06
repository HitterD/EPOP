import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { MailerService } from '../mailer/mailer.service';
export declare class AuthController {
    private readonly auth;
    private readonly config;
    private readonly redis;
    private readonly users;
    private readonly mailer;
    constructor(auth: AuthService, config: ConfigService, redis: Redis, users: Repository<User>, mailer: MailerService);
    private cookieOpts;
    login(dto: LoginDto, res: Response): Promise<{
        success: boolean;
    }>;
    refresh(req: Request, res: Response): Promise<{
        success: boolean;
    }>;
    logout(res: Response): Promise<{
        success: boolean;
    }>;
    forgot(email: string): Promise<{
        success: boolean;
    }>;
    reset(body: {
        email: string;
        token: string;
        password: string;
    }): Promise<{
        success: boolean;
    }>;
    subscribePush(req: any, body: any): Promise<{
        success: boolean;
    }>;
}
