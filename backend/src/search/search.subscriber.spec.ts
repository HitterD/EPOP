import { Test, TestingModule } from '@nestjs/testing'
import { SearchEventsSubscriber } from './search.subscriber'
import { REDIS_SUB } from '../redis/redis.module'
import { ConfigService } from '@nestjs/config'
import { SEARCH_QUEUE } from '../queues/queues.module'

describe('SearchEventsSubscriber (queue)', () => {
  let sub: SearchEventsSubscriber
  const addMock = jest.fn()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchEventsSubscriber,
        { provide: REDIS_SUB, useValue: {} },
        { provide: SEARCH_QUEUE, useValue: { add: addMock } },
        { provide: ConfigService, useValue: { get: jest.fn(() => undefined) } },
      ],
    }).compile()

    sub = module.get(SearchEventsSubscriber)
    addMock.mockReset()
  })

  it('enqueues message index job', async () => {
    await (sub as any).onMessageCreated({ messageId: '123' })
    expect(addMock).toHaveBeenCalledWith(
      'index_doc',
      expect.objectContaining({ entity: 'messages', id: '123' }),
      expect.any(Object),
    )
  })

  it('enqueues task index job', async () => {
    await (sub as any).onTaskCreated({ taskId: 't1' })
    expect(addMock).toHaveBeenCalledWith(
      'index_doc',
      expect.objectContaining({ entity: 'tasks', id: 't1' }),
      expect.any(Object),
    )
  })

  it('enqueues mail index job', async () => {
    await (sub as any).onMailCreated({ mailId: 'm1' })
    expect(addMock).toHaveBeenCalledWith(
      'index_doc',
      expect.objectContaining({ entity: 'mail_messages', id: 'm1' }),
      expect.any(Object),
    )
  })
})
