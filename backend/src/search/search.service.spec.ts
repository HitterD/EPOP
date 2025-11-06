import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { SearchService } from './search.service'
import { Message } from '../entities/message.entity'
import { MailMessage } from '../entities/mail-message.entity'
import { FileEntity } from '../entities/file.entity'
import { Task } from '../entities/task.entity'
import { ConfigService } from '@nestjs/config'
import { SEARCH_QUEUE } from '../queues/queues.module'

describe('SearchService', () => {
  let service: SearchService
  let mockMessagesRepo: any
  let mockMailsRepo: any
  let mockFilesRepo: any
  let mockTasksRepo: any
  let mockConfigService: any

  beforeEach(async () => {
    mockMessagesRepo = {
      find: jest.fn(),
      query: jest.fn(),
    }

    mockMailsRepo = {
      find: jest.fn(),
      query: jest.fn(),
    }

    mockFilesRepo = {
      find: jest.fn(),
      query: jest.fn(),
    }

    mockTasksRepo = {
      find: jest.fn(),
      query: jest.fn(),
    }

    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          ZINC_URL: 'http://localhost:4080',
          ZINC_USER: 'admin',
          ZINC_PASS: 'admin',
          ZINC_INDEX_PREFIX: 'epop',
        }
        return config[key]
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Message), useValue: mockMessagesRepo },
        { provide: getRepositoryToken(MailMessage), useValue: mockMailsRepo },
        { provide: getRepositoryToken(FileEntity), useValue: mockFilesRepo },
        { provide: getRepositoryToken(Task), useValue: mockTasksRepo },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SEARCH_QUEUE, useValue: { add: jest.fn() } },
      ],
    }).compile()

    service = module.get<SearchService>(SearchService)
  })

  describe('enqueueBackfill', () => {
    it('should enqueue backfill job', async () => {
      const moduleRef = (service as any)
      const queue = (moduleRef.queue)
      const spy = jest.spyOn(queue, 'add')
      const res = await service.enqueueBackfill('messages')
      expect(res.enqueued).toBe(true)
      expect(spy).toHaveBeenCalledWith('backfill', { entity: 'messages' }, expect.any(Object))
    })
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('backfill', () => {
    it('should index messages', async () => {
      const messages = [
        { id: '1', contentJson: { text: 'Hello' }, sender: { id: 'u1' }, chat: { id: 'c1' }, delivery: 'normal', createdAt: new Date() },
      ]
      mockMessagesRepo.find.mockResolvedValue(messages)

      const result = await service.backfill('messages')

      expect(result).toEqual({ success: true })
      expect(mockMessagesRepo.find).toHaveBeenCalled()
    })

    it('should index files', async () => {
      const files = [
        { id: '1', ownerId: 'u1', filename: 'test.txt', mime: 'text/plain', size: '100', createdAt: new Date() },
      ]
      mockFilesRepo.find.mockResolvedValue(files)

      const result = await service.backfill('files')

      expect(result).toEqual({ success: true })
      expect(mockFilesRepo.find).toHaveBeenCalled()
    })

    it('should index tasks', async () => {
      const tasks = [
        { id: '1', project: { id: 'p1' }, title: 'Task', description: 'Desc', priority: 'high', progress: 50, createdAt: new Date() },
      ]
      mockTasksRepo.find.mockResolvedValue(tasks)

      const result = await service.backfill('tasks')

      expect(result).toEqual({ success: true })
      expect(mockTasksRepo.find).toHaveBeenCalled()
    })
  })

  describe('searchCursor', () => {
    it('should return empty results on ZincSearch error', async () => {
      // Axios will fail due to no actual Zinc instance
      const result = await service.searchCursor('messages', 'test query', 'user1', 20, null)

      expect(result.items).toEqual([])
      expect(result.hasMore).toBe(false)
    })
  })
})
