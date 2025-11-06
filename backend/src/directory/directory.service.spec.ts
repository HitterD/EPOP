import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { DirectoryService } from './directory.service'
import { OrgUnit } from '../entities/org-unit.entity'
import { User } from '../entities/user.entity'
import { DirectoryAudit } from '../entities/directory-audit.entity'
import { OutboxService } from '../events/outbox.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'

describe('DirectoryService', () => {
  let service: DirectoryService
  let mockOrgUnitsRepo: any
  let mockUsersRepo: any
  let mockAuditRepo: any
  let mockOutboxService: any
  let mockDataSource: any

  beforeEach(async () => {
    mockOrgUnitsRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
    }

    mockUsersRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    }

    mockAuditRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      find: jest.fn(),
    }

    mockOutboxService = {
      append: jest.fn(() => Promise.resolve()),
    }

    mockDataSource = {
      transaction: jest.fn(async (cb) => {
        const mockManager = {
          save: jest.fn((entity) => Promise.resolve(entity)),
          findOne: jest.fn(),
        }
        return cb(mockManager)
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectoryService,
        { provide: getRepositoryToken(OrgUnit), useValue: mockOrgUnitsRepo },
        { provide: getRepositoryToken(User), useValue: mockUsersRepo },
        { provide: getRepositoryToken(DirectoryAudit), useValue: mockAuditRepo },
        { provide: OutboxService, useValue: mockOutboxService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile()

    service = module.get<DirectoryService>(DirectoryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getTree', () => {
    it('should return org unit tree', async () => {
      const units = [
        { id: '1', name: 'Root', parentId: null },
        { id: '2', name: 'Child', parentId: '1' },
      ]
      mockOrgUnitsRepo.find.mockResolvedValue(units)

      const result = await service.getTree()

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('id', '1')
    })
  })

  describe('moveUnit', () => {
    it('should move unit and create audit trail', async () => {
      const actorId = 'admin1'
      const unitId = 'unit1'
      const unit = { id: unitId, name: 'Unit', parentId: 'parent1' }
      mockOrgUnitsRepo.findOne.mockResolvedValue(unit)
      mockOrgUnitsRepo.save.mockResolvedValue({ ...unit, parentId: 'parent2' })

      const result = await service.moveUnit(actorId, unitId, { newParentId: 'parent2' })

      expect(result).toEqual({ success: true })
      expect(mockAuditRepo.save).toHaveBeenCalledWith(expect.objectContaining({ action: 'move_unit', actorId }))
      expect(mockOutboxService.append).toHaveBeenCalledWith(expect.objectContaining({ name: 'directory.unit.moved' }))
    })

    it('should throw NotFoundException if unit not found', async () => {
      mockOrgUnitsRepo.findOne.mockResolvedValue(null)

      await expect(service.moveUnit('admin1', 'invalid', { newParentId: 'parent2' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('moveUser', () => {
    it('should move user to new unit and create audit', async () => {
      const actorId = 'admin1'
      const userId = 'user1'
      const user = { id: userId, email: 'user@test.com', orgUnitId: 'unit1' }
      mockUsersRepo.findOne.mockResolvedValue(user)
      mockUsersRepo.save.mockResolvedValue({ ...user, orgUnitId: 'unit2' })

      const result = await service.moveUser(actorId, userId, { newUnitId: 'unit2' })

      expect(result).toEqual({ success: true })
      expect(mockAuditRepo.save).toHaveBeenCalledWith(expect.objectContaining({ action: 'move_user', actorId }))
      expect(mockOutboxService.append).toHaveBeenCalledWith(expect.objectContaining({ name: 'directory.user.moved' }))
    })

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepo.findOne.mockResolvedValue(null)

      await expect(service.moveUser('admin1', 'invalid', { newUnitId: 'unit2' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('getAuditLog', () => {
    it('should return audit logs with pagination', async () => {
      const logs = [
        { id: '3', action: 'move_user', createdAt: new Date() },
        { id: '2', action: 'move_unit', createdAt: new Date() },
        { id: '1', action: 'create_unit', createdAt: new Date() },
      ]
      mockAuditRepo.find.mockResolvedValue(logs)

      const result = await service.getAuditLog(null, null, 20, null)

      expect(result.items).toHaveLength(3)
      expect(result.items[0]).toHaveProperty('action', 'move_user')
    })
  })

  describe('createUnit', () => {
    it('should create org unit and create audit', async () => {
      const actorId = 'admin1'
      const dto = { name: 'New Unit', parentId: 'parent1' }
      mockOrgUnitsRepo.save.mockResolvedValue({ id: 'unit1', ...dto })

      const result = await service.createUnit(actorId, dto)

      expect(result).toHaveProperty('id', 'unit1')
      expect(mockAuditRepo.save).toHaveBeenCalledWith(expect.objectContaining({ action: 'create_unit', actorId }))
    })
  })
})
