import { Test, TestingModule } from '@nestjs/testing'
import { SearchWorkerService } from './search.worker'
import { ConfigService } from '@nestjs/config'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Message } from '../entities/message.entity'
import { Task } from '../entities/task.entity'
import { MailMessage } from '../entities/mail-message.entity'
import { FileEntity } from '../entities/file.entity'
import { SearchService } from '../search/search.service'

function mockRepo() {
  return { findOne: jest.fn() }
}

describe('SearchWorkerService (indexOne)', () => {
  let svc: SearchWorkerService
  const searchMock = { indexDoc: jest.fn() }
  const msgRepo = mockRepo()
  const taskRepo = mockRepo()
  const mailRepo = mockRepo()
  const fileRepo = mockRepo()

  beforeEach(async () => {
    jest.resetAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchWorkerService,
        { provide: ConfigService, useValue: { get: jest.fn((k: string) => (k === 'ZINC_INDEX_PREFIX' ? 'epop' : undefined)) } },
        { provide: SearchService, useValue: searchMock },
        { provide: getRepositoryToken(Message), useValue: msgRepo },
        { provide: getRepositoryToken(Task), useValue: taskRepo },
        { provide: getRepositoryToken(MailMessage), useValue: mailRepo },
        { provide: getRepositoryToken(FileEntity), useValue: fileRepo },
      ],
    }).compile()

    svc = module.get(SearchWorkerService)
  })

  it('indexes one message', async () => {
    const now = new Date()
    ;(msgRepo.findOne as jest.Mock).mockResolvedValue({ id: '1', chat: { id: 'c1' }, sender: { id: 'u1' }, delivery: 'normal', createdAt: now, contentJson: { t: 'hi' } })
    await (svc as any).indexOne('messages', '1')
    expect(searchMock.indexDoc).toHaveBeenCalledWith('epop_messages', '1', expect.objectContaining({ chatId: 'c1', senderId: 'u1', delivery: 'normal' }))
  })

  it('indexes one task', async () => {
    const now = new Date()
    ;(taskRepo.findOne as jest.Mock).mockResolvedValue({ id: 't1', project: { id: 'p1' }, title: 'T', description: '', priority: 'high', progress: 10, dueAt: now, createdAt: now })
    await (svc as any).indexOne('tasks', 't1')
    expect(searchMock.indexDoc).toHaveBeenCalledWith('epop_tasks', 't1', expect.objectContaining({ projectId: 'p1', title: 'T' }))
  })

  it('indexes one mail', async () => {
    const now = new Date()
    ;(mailRepo.findOne as jest.Mock).mockResolvedValue({ id: 'm1', fromUser: 'u1', toUsers: ['u2'], subject: 'S', bodyHtml: '<b>hi</b>', folder: 'inbox', createdAt: now })
    await (svc as any).indexOne('mail_messages', 'm1')
    expect(searchMock.indexDoc).toHaveBeenCalledWith('epop_mail_messages', 'm1', expect.objectContaining({ subject: 'S' }))
  })

  it('indexes one file', async () => {
    const now = new Date()
    ;(fileRepo.findOne as jest.Mock).mockResolvedValue({ id: 'f1', ownerId: 'u1', filename: 'a.txt', mime: 'text/plain', size: 1, createdAt: now })
    await (svc as any).indexOne('files', 'f1')
    expect(searchMock.indexDoc).toHaveBeenCalledWith('epop_files', 'f1', expect.objectContaining({ filename: 'a.txt' }))
  })
})
