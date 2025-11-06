import { Message } from './message.entity';
import { User } from './user.entity';
export declare class MessageReaction {
    messageId: string;
    userId: string;
    emoji: string;
    message: Message;
    user: User;
    createdAt: Date;
}
