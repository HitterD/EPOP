export type DomainEventName = 'chat.message.created' | 'chat.message.updated' | 'chat.message.read' | 'chat.message.reaction.added' | 'chat.message.reaction.removed' | 'chat.thread.created' | 'chat.participant.joined' | 'chat.participant.left' | 'project.task.created' | 'project.task.updated' | 'project.task.moved' | 'project.task.commented' | 'files.file.uploaded' | 'files.file.linked' | 'mail.message.created' | 'mail.message.moved' | 'user.presence.updated';
export interface DomainEvent<T = any> {
    id: string;
    name: DomainEventName;
    aggregateType: 'message' | 'chat' | 'task' | 'file' | 'mail' | 'user' | 'project';
    aggregateId: string;
    userId?: string;
    timestamp: string;
    version: 1;
    payload: T;
}
