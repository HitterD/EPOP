import { Test, TestingModule } from '@nestjs/testing'
import { MailerService } from './mailer.service'
import { ConfigService } from '@nestjs/config'
import { EMAIL_QUEUE } from '../queues/queues.module'

describe('MailerService (queue)', () => {
  let service: MailerService
  const addMock = jest.fn()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        { provide: ConfigService, useValue: { get: jest.fn((k: string) => (k === 'MAIL_FROM' ? 'noreply@epop.local' : undefined)) } },
        { provide: EMAIL_QUEUE, useValue: { add: addMock } },
      ],
    }).compile()

    service = module.get(MailerService)
    addMock.mockReset()
  })

  it('queues password reset email', async () => {
    const ok = await service.sendPasswordReset('user@example.com', 'tok')
    expect(ok).toBe(true)
    expect(addMock).toHaveBeenCalledWith(
      'password_reset',
      expect.objectContaining({ to: 'user@example.com', subject: expect.any(String) }),
      expect.objectContaining({ attempts: expect.any(Number) }),
    )
  })

  it('queues generic email', async () => {
    const ok = await service.sendGeneric('user@example.com', 'Hi', 'Body')
    expect(ok).toBe(true)
    expect(addMock).toHaveBeenCalledWith(
      'generic',
      expect.objectContaining({ to: 'user@example.com', subject: 'Hi' }),
      expect.any(Object),
    )
  })
})
