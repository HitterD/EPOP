import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AdminService } from './admin.service'
import { User } from '../entities/user.entity'
import { BadRequestException } from '@nestjs/common'

describe('AdminService', () => {
  let service: AdminService
  let mockUsersRepo: any

  beforeEach(async () => {
    mockUsersRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: mockUsersRepo },
      ],
    }).compile()

    service = module.get<AdminService>(AdminService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('parseBulkImportCSV', () => {
    it('should parse valid CSV data', async () => {
      const csvContent = `email,firstName,lastName,role
user1@test.com,John,Doe,member
user2@test.com,Jane,Smith,admin`

      const result = await service.parseBulkImportCSV(csvContent)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        email: 'user1@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'member',
      })
      expect(result[1]).toEqual({
        email: 'user2@test.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'admin',
      })
    })

    it('should throw BadRequestException for invalid CSV', async () => {
      const csvContent = `invalid,header
data1,data2`

      await expect(service.parseBulkImportCSV(csvContent)).rejects.toThrow(BadRequestException)
    })

    it('should validate email format', async () => {
      const csvContent = `email,firstName,lastName,role
invalid-email,John,Doe,member`

      await expect(service.parseBulkImportCSV(csvContent)).rejects.toThrow(BadRequestException)
    })

    it('should handle BOM in CSV', async () => {
      const csvContent = '\uFEFFemail,firstName,lastName,role\nuser@test.com,John,Doe,member'

      const result = await service.parseBulkImportCSV(csvContent)

      expect(result).toHaveLength(1)
      expect(result[0].email).toBe('user@test.com')
    })
  })

  describe('bulkImportUsers', () => {
    it('should import users from parsed data', async () => {
      const rows = [
        { email: 'user1@test.com', firstName: 'John', lastName: 'Doe', role: 'member' },
        { email: 'user2@test.com', firstName: 'Jane', lastName: 'Smith', role: 'admin' },
      ]
      mockUsersRepo.findOne.mockResolvedValue(null) // No existing users
      mockUsersRepo.save.mockResolvedValue({ id: '1' })

      const result = await service.bulkImportUsers(rows, false)

      expect(result.imported).toBe(2)
      expect(result.skipped).toBe(0)
      expect(mockUsersRepo.save).toHaveBeenCalledTimes(2)
    })

    it('should skip existing users', async () => {
      const rows = [
        { email: 'existing@test.com', firstName: 'John', lastName: 'Doe', role: 'member' },
        { email: 'new@test.com', firstName: 'Jane', lastName: 'Smith', role: 'admin' },
      ]
      mockUsersRepo.findOne
        .mockResolvedValueOnce({ id: '1', email: 'existing@test.com' }) // Existing
        .mockResolvedValueOnce(null) // New
      mockUsersRepo.save.mockResolvedValue({ id: '2' })

      const result = await service.bulkImportUsers(rows, false)

      expect(result.imported).toBe(1)
      expect(result.skipped).toBe(1)
      expect(mockUsersRepo.save).toHaveBeenCalledTimes(1)
    })

    it('should run in dry-run mode without saving', async () => {
      const rows = [
        { email: 'user1@test.com', firstName: 'John', lastName: 'Doe', role: 'member' },
      ]
      mockUsersRepo.findOne.mockResolvedValue(null)

      const result = await service.bulkImportUsers(rows, true)

      expect(result.imported).toBe(0)
      expect(result.wouldImport).toBe(1)
      expect(mockUsersRepo.save).not.toHaveBeenCalled()
    })
  })

  describe('getSystemStats', () => {
    it('should return system statistics', async () => {
      mockUsersRepo.query.mockResolvedValue([{ count: '100' }])

      const result = await service.getSystemStats()

      expect(result).toHaveProperty('totalUsers')
      expect(result).toHaveProperty('timestamp')
    })
  })
})
