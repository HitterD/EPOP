import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private readonly health;
    private readonly db;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator);
    live(): {
        status: string;
    };
    readiness(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
