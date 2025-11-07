import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Chat, Message } from '@/types'

interface ChatState {
  chats: Map<string, Chat>
  messages: Map<string, Message[]>
  activeChat: string | null
  typingUsers: Map<string, Set<string>>
  
  setChats: (chats: Chat[]) => void
  addChat: (chat: Chat) => void
  updateChat: (chatId: string, updates: Partial<Chat>) => void
  
  setMessages: (chatId: string, messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  removeMessage: (messageId: string) => void
  
  setActiveChat: (chatId: string | null) => void
  
  addTypingUser: (chatId: string, userId: string) => void
  removeTypingUser: (chatId: string, userId: string) => void
  
  incrementUnread: (chatId: string) => void
  clearUnread: (chatId: string) => void
}

export const useChatStore = create<ChatState>()(
  immer((set) => ({
    chats: new Map(),
    messages: new Map(),
    activeChat: null,
    typingUsers: new Map(),

    setChats: (chats) =>
      set((state) => {
        state.chats = new Map(chats.map((chat) => [chat.id, chat]))
      }),

    addChat: (chat) =>
      set((state) => {
        state.chats.set(chat.id, chat)
      }),

    updateChat: (chatId, updates) =>
      set((state) => {
        const chat = state.chats.get(chatId)
        if (chat) {
          state.chats.set(chatId, { ...chat, ...updates })
        }
      }),

    setMessages: (chatId, messages) =>
      set((state) => {
        state.messages.set(chatId, messages)
      }),

    addMessage: (message) =>
      set((state) => {
        const chatMessages = state.messages.get(message.chatId) || []
        state.messages.set(message.chatId, [...chatMessages, message])
        
        // Update last message in chat
        const chat = state.chats.get(message.chatId)
        if (chat) {
          state.chats.set(message.chatId, {
            ...chat,
            lastMessage: message,
            updatedAt: message.createdAt,
          })
        }
      }),

    updateMessage: (messageId, updates) =>
      set((state) => {
        state.messages.forEach((messages, chatId) => {
          const index = messages.findIndex((m) => m.id === messageId)
          if (index !== -1) {
            const merged = { ...(messages[index] as Message), ...(updates as Partial<Message>) } as Message
            messages[index] = merged
            state.messages.set(chatId, [...messages])
          }
        })
      }),

    removeMessage: (messageId) =>
      set((state) => {
        state.messages.forEach((messages, chatId) => {
          const filtered = messages.filter((m) => m.id !== messageId)
          if (filtered.length !== messages.length) {
            state.messages.set(chatId, filtered)
          }
        })
      }),

    setActiveChat: (chatId) =>
      set((state) => {
        state.activeChat = chatId
      }),

    addTypingUser: (chatId, userId) =>
      set((state) => {
        if (!state.typingUsers.has(chatId)) {
          state.typingUsers.set(chatId, new Set())
        }
        state.typingUsers.get(chatId)!.add(userId)
      }),

    removeTypingUser: (chatId, userId) =>
      set((state) => {
        state.typingUsers.get(chatId)?.delete(userId)
      }),

    incrementUnread: (chatId) =>
      set((state) => {
        const chat = state.chats.get(chatId)
        if (chat) {
          state.chats.set(chatId, {
            ...chat,
            unreadCount: chat.unreadCount + 1,
          })
        }
      }),

    clearUnread: (chatId) =>
      set((state) => {
        const chat = state.chats.get(chatId)
        if (chat) {
          state.chats.set(chatId, { ...chat, unreadCount: 0 })
        }
      }),
  }))
)
