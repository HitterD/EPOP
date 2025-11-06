import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DomainOutbox } from './outbox.entity'
import { In, IsNull, Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { DomainEvent } from './domain-event'
import { EntityManager } from 'typeorm'

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(DomainOutbox)
    private readonly repo: Repository<DomainOutbox>,
  ) {}

  async append(event: Omit<DomainEvent, 'id' | 'timestamp' | 'version'> & { id?: string; timestamp?: string; version?: 1 }, manager?: EntityManager) {
    const payload = event.payload ?? {}
    const entity = this.repo.create({
      eventName: event.name,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      userId: event.userId ?? null,
      payload: {
        id: event.id ?? uuidv4(),
        timestamp: event.timestamp ?? new Date().toISOString(),
        version: 1,
        ...payload,
      },
    })
    if (manager) {
      await manager.getRepository(DomainOutbox).save(entity)
    } else {
      await this.repo.save(entity)
    }
    return entity
  }

  async appendWithManager(manager: EntityManager, event: Omit<DomainEvent, 'version'> & { version?: 1 }) {
    return this.append(event, manager)
  }

  async getUndelivered(limit = 100) {
    return this.repo.find({ where: { deliveredAt: IsNull() }, order: { id: 'ASC' }, take: limit })
  }

  async markDelivered(ids: string[]) {
    if (!ids.length) return
    await this.repo.update({ id: In(ids) }, { deliveredAt: new Date() })
  }
}
