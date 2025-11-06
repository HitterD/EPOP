import { Message } from './message.entity';
import { User } from './user.entity';
export declare class MessageRead {
    messageId: string;
    userId: string;
    message: Message;
    user: User;
    readAt: Date;
}
