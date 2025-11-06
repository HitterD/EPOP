import { ConfigService } from '@nestjs/config';
export declare class MailerService {
    private readonly config;
    private readonly logger;
    private transporter;
    private from;
    constructor(config: ConfigService);
    sendPasswordReset(email: string, token: string): Promise<boolean>;
}
