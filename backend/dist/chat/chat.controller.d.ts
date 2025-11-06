import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chat;
    constructor(chat: ChatService);
    list(req: any): Promise<import("../entities/chat.entity").Chat[]>;
    create(req: any, dto: {
        isGroup: boolean;
        title?: string | null;
        participantIds: string[];
    }): Promise<import("../entities/chat.entity").Chat>;
    messages(req: any, chatId: string, limit?: string, beforeId?: string): Promise<import("../entities/message.entity").Message[]>;
    send(req: any, chatId: string, body: {
        content: any;
        delivery?: 'normal' | 'important' | 'urgent';
        rootMessageId?: string | null;
    }): Promise<import("../entities/message.entity").Message>;
    thread(req: any, chatId: string, rootMessageId: string): Promise<import("../entities/message.entity").Message[]>;
    addReaction(req: any, chatId: string, body: {
        messageId: string;
        emoji: string;
    }): Promise<{
        success: boolean;
    }>;
    removeReaction(req: any, chatId: string, body: {
        messageId: string;
        emoji: string;
    }): Promise<{
        success: boolean;
    }>;
    markRead(req: any, chatId: string, messageId: string): Promise<{
        success: boolean;
    }>;
    unread(req: any): Promise<any>;
}
