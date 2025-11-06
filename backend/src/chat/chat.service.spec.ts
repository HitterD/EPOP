import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ChatService } from './chat.service'
import { Chat } from '../entities/chat.entity'
import { ChatParticipant } from '../entities/chat-participant.entity'
import { Message } from '../entities/message.entity'
import { MessageReaction } from '../entities/message-reaction.entity'
import { MessageRead } from '../entities/message-read.entity'
import { MessageHistory } from '../entities/message-history.entity'
import { OutboxService } from '../events/outbox.service'
import { REDIS_PUB } from '../redis/redis.module'
import { ForbiddenException, NotFoundException } from '@nestjs/common'

describe('ChatService', () => {
  let service: ChatService
  let mockChatsRepo: any
  let mockParticipantsRepo: any
  let mockMessagesRepo: any
  let mockReactionsRepo: any
  let mockReadsRepo: any
  let mockHistoryRepo: any
  let mockOutboxService: any
  let mockRedis: any

  beforeEach(async () => {
    mockChatsRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
    }

    mockParticipantsRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
    }

    mockMessagesRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', createdAt: new Date(), ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    }

    mockReactionsRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      findOne: jest.fn(),
      remove: jest.fn(),
    }

    mockReadsRepo = {
      save: jest.fn((entity) => Promise.resolve(entity)),
      findOne: jest.fn(),
    }

    mockHistoryRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
    }

    mockOutboxService = {
      append: jest.fn(() => Promise.resolve()),
    }

    mockRedis = {
      del: jest.fn(() => Promise.resolve()),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(Chat), useValue: mockChatsRepo },
        { provide: getRepositoryToken(ChatParticipant), useValue: mockParticipantsRepo },
        { provide: getRepositoryToken(Message), useValue: mockMessagesRepo },
        { provide: getRepositoryToken(MessageReaction), useValue: mockReactionsRepo },
        { provide: getRepositoryToken(MessageRead), useValue: mockReadsRepo },
        { provide: getRepositoryToken(MessageHistory), useValue: mockHistoryRepo },
        { provide: OutboxService, useValue: mockOutboxService },
        { provide: REDIS_PUB, useValue: mockRedis },
      ],
    }).compile()

    service = module.get<ChatService>(ChatService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sendMessage', () => {
    it('should create message and emit event', async () => {
      const userId = 'user1'
      const chatId = 'chat1'
      mockParticipantsRepo.findOne.mockResolvedValue({ userId, chatId })
      mockMessagesRepo.save.mockResolvedValue({ id: 'msg1', chatId, senderId: userId, contentJson: { text: 'Hello' }, delivery: 'normal' })

      const result = await service.sendMessage(userId, { chatId, content: { text: 'Hello' } })

      expect(result).toHaveProperty('id', 'msg1')
      expect(mockOutboxService.append).toHaveBeenCalledWith(expect.objectContaining({ name: 'chat.message.created' }))
    })

    it('should throw ForbiddenException if not a member', async () => {
      mockParticipantsRepo.findOne.mockResolvedValue(null)

      await expect(service.sendMessage('user1', { chatId: 'chat1', content: { text: 'Hi' } })).rejects.toThrow(ForbiddenException)
    })

    it('should sanitize HTML content in messages', async () => {
      const userId = 'user1'
      const chatId = 'chat1'
      mockParticipantsRepo.findOne.mockResolvedValue({ userId, chatId })
      mockMessagesRepo.save.mockImplementation((dto) => Promise.resolve({ id: 'msg1', ...dto }))

      await service.sendMessage(userId, { chatId, content: { html: '<script>alert("xss")</script><p>Safe</p>' } })

      const savedContent = mockMessagesRepo.save.mock.calls[0][0].contentJson
      expect(savedContent.html).not.toContain('<script>')
      expect(savedContent.html).toContain('<p>Safe</p>')
    })
  })

  describe('editMessage', () => {
    it('should update message and create history', async () => {
      const userId = 'user1'
      const messageId = 'msg1'
      const message = { id: messageId, chat: { id: 'chat1' }, sender: { id: userId }, contentJson: { text: 'Old' } }
      mockMessagesRepo.findOne.mockResolvedValue(message)
      mockParticipantsRepo.findOne.mockResolvedValue({ userId, chatId: 'chat1' })
      mockMessagesRepo.save.mockResolvedValue({ ...message, contentJson: { text: 'New' }, editedAt: new Date() })

      const result = await service.editMessage(userId, messageId, { content: { text: 'New' } })

      expect(result).toEqual({ success: true })
      expect(mockHistoryRepo.save).toHaveBeenCalled()
      expect(mockOutboxService.append).toHaveBeenCalledWith(expect.objectContaining({ name: 'chat.message.updated' }))
    })

    it('should throw NotFoundException if message not found', async () => {
      mockMessagesRepo.findOne.mockResolvedValue(null)

      await expect(service.editMessage('user1', 'invalid', { content: { text: 'Edit' } })).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException if not the sender', async () => {
      const message = { id: 'msg1', chat: { id: 'chat1' }, sender: { id: 'otherUser' }, contentJson: { text: 'Old' } }
      mockMessagesRepo.findOne.mockResolvedValue(message)
      mockParticipantsRepo.findOne.mockResolvedValue({ userId: 'user1', chatId: 'chat1' })

      await expect(service.editMessage('user1', 'msg1', { content: { text: 'Hack' } })).rejects.toThrow(ForbiddenException)
    })
  })

  describe('addReaction', () => {
    it('should add reaction to message', async () => {
      const userId = 'user1'
      const messageId = 'msg1'
      const message = { id: messageId, chat: { id: 'chat1' } }
      mockMessagesRepo.findOne.mockResolvedValue(message)
      mockParticipantsRepo.findOne.mockResolvedValue({ userId, chatId: 'chat1' })
      mockReactionsRepo.findOne.mockResolvedValue(null)
      mockReactionsRepo.save.mockResolvedValue({ id: 'react1', emoji: '👍' })

      const result = await service.addReaction(userId, { messageId, emoji: '👍' })

      expect(result).toHaveProperty('id', 'react1')
      expect(mockOutboxService.append).toHaveBeenCalled()
    })
  })

  describe('deleteMessage', () => {
    it('should soft delete message and emit event', async () => {
      const userId = 'user1'
      const messageId = 'msg1'
      const message = { id: messageId, chat: { id: 'chat1' }, sender: { id: userId }, deletedAt: null }
      mockMessagesRepo.findOne.mockResolvedValue(message)
      mockParticipantsRepo.findOne.mockResolvedValue({ userId, chatId: 'chat1' })
      mockMessagesRepo.save.mockResolvedValue({ ...message, deletedAt: new Date() })

      const result = await service.deleteMessage(userId, messageId)

      expect(result).toEqual({ success: true })
      expect(mockHistoryRepo.save).toHaveBeenCalled()
      expect(mockOutboxService.append).toHaveBeenCalled()
    })
  })
})
