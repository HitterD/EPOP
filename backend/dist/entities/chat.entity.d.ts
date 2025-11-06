import { User } from './user.entity';
import { ChatParticipant } from './chat-participant.entity';
import { Message } from './message.entity';
export declare class Chat {
    id: string;
    isGroup: boolean;
    title: string | null;
    createdBy?: User | null;
    createdAt: Date;
    participants: ChatParticipant[];
    messages: Message[];
}
