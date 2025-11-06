import { Chat } from './chat.entity';
import { User } from './user.entity';
export declare class ChatParticipant {
    chatId: string;
    userId: string;
    chat: Chat;
    user: User;
    role: string;
    pinned: boolean;
    muted: boolean;
}
