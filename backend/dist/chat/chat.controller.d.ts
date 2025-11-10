import type { Request } from 'express';
import { ChatService } from './chat.service';
import { CursorParamsDto } from '../common/dto/cursor.dto';
import { Message } from '../entities/message.entity';
import { Chat } from '../entities/chat.entity';
import { CreateChatDto, EditMessageDto, ReactionDto, SendMessageDto } from './dto/requests.dto';
export declare class ChatController {
    private readonly chat;
    constructor(chat: ChatService);
    list(req: Request & {
        user: {
            userId: string;
        };
    }): Promise<Chat[]>;
    create(req: Request & {
        user: {
            userId: string;
        };
    }, dto: CreateChatDto): Promise<Chat>;
    messages(req: Request & {
        user: {
            userId: string;
        };
    }, chatId: string, limit?: string, beforeId?: string): Promise<(Message & {
        reactionsSummary: Array<{
            emoji: string;
            count: number;
            userIds: string[];
            hasCurrentUser: boolean;
        }>;
        readCount: number;
    })[]>;
    messagesCursor(req: Request & {
        user: {
            userId: string;
        };
    }, chatId: string, params: CursorParamsDto): Promise<{
        items: Message[];
        nextCursor: string | undefined;
        hasMore: boolean;
    }>;
    send(req: Request & {
        user: {
            userId: string;
        };
    }, chatId: string, body: SendMessageDto): Promise<Message>;
    thread(req: Request & {
        user: {
            userId: string;
        };
    }, chatId: string, rootMessageId: string): Promise<Message[]>;
    addReaction(req: Request & {
        user: {
            userId: string;
        };
    }, chatId: string, body: ReactionDto): Promise<{
        success: boolean;
    }>;
    removeReaction(req: Request & {
        user: {
            userId: string;
        };
    }, chatId: string, body: ReactionDto): Promise<{
        success: boolean;
    }>;
    markRead(req: Request & {
        user: {
            userId: string;
        };
    }, chatId: string, messageId: string): Promise<{
        success: boolean;
    }>;
    edit(req: Request & {
        user: {
            userId: string;
        };
    }, chatId: string, messageId: string, dto: EditMessageDto): Promise<{
        success: boolean;
    }>;
    remove(req: Request & {
        user: {
            userId: string;
        };
    }, chatId: string, messageId: string): Promise<{
        success: boolean;
    }>;
    unread(req: Request & {
        user: {
            userId: string;
        };
    }): Promise<any>;
}
