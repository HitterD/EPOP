import { DomainOutbox } from './outbox.entity';
import { Repository } from 'typeorm';
import { DomainEvent } from './domain-event';
import { EntityManager } from 'typeorm';
export declare class OutboxService {
    private readonly repo;
    constructor(repo: Repository<DomainOutbox>);
    append(event: Omit<DomainEvent, 'id' | 'timestamp' | 'version'> & {
        id?: string;
        timestamp?: string;
        version?: 1;
    }, manager?: EntityManager): Promise<DomainOutbox>;
    appendWithManager(manager: EntityManager, event: Omit<DomainEvent, 'version'> & {
        version?: 1;
    }): Promise<DomainOutbox>;
    getUndelivered(limit?: number): Promise<DomainOutbox[]>;
    markDelivered(ids: string[]): Promise<void>;
}
