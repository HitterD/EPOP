export declare class DomainOutbox {
    id: string;
    eventName: string;
    aggregateType: string;
    aggregateId: string;
    userId: string | null;
    payload: Record<string, any>;
    createdAt: Date;
    deliveredAt: Date | null;
}
