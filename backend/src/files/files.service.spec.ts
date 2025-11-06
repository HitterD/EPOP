import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { FilesService } from './files.service'
import { FileEntity } from '../entities/file.entity'
import { FileLink } from '../entities/file-link.entity'
import { ConfigService } from '@nestjs/config'
import { NotFoundException } from '@nestjs/common'

describe('FilesService', () => {
  let service: FilesService
  let mockFilesRepo: any
  let mockLinksRepo: any
  let mockConfigService: any

  beforeEach(async () => {
    mockFilesRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    }

    mockLinksRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'link1', ...entity })),
    }

    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, any> = {
          MINIO_ENDPOINT: 'localhost',
          MINIO_PORT: 9000,
          MINIO_USE_SSL: false,
          MINIO_ACCESS_KEY: 'minio',
          MINIO_SECRET_KEY: 'minio123',
          MINIO_BUCKET: 'epop',
        }
        return config[key]
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: getRepositoryToken(FileEntity), useValue: mockFilesRepo },
        { provide: getRepositoryToken(FileLink), useValue: mockLinksRepo },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<FilesService>(FilesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('presign', () => {
    it('should create a file record and return presigned post data', async () => {
      const ownerId = 'user1'
      const filename = 'test.txt'
      mockFilesRepo.save.mockResolvedValue({ id: 'file1', ownerId, filename, s3Key: 'uploads-temp/abc-test.txt' })

      const result = await service.presign(ownerId, filename)

      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('uploadUrl')
      expect(result).toHaveProperty('fields')
      expect(result).toHaveProperty('fileId', 'file1')
      expect(result).toHaveProperty('key')
      expect(result).toHaveProperty('expiresAt')
      expect(result.key).toContain('uploads-temp/')
      expect(mockFilesRepo.save).toHaveBeenCalled()
    })
  })

  describe('attach', () => {
    it('should finalize file and create link', async () => {
      const fileId = 'file1'
      const file = { id: fileId, s3Key: 'uploads-temp/abc-test.txt', filename: 'test.txt' }
      mockFilesRepo.findOne.mockResolvedValue(file)
      mockFilesRepo.save.mockResolvedValue({ ...file, s3Key: 'uploads/file1-test.txt' })
      mockLinksRepo.save.mockResolvedValue({ id: 'link1' })

      const result = await service.attach(fileId, { refTable: 'messages', refId: 'msg1' })

      expect(result).toEqual({ success: true, linkId: 'link1' })
      expect(mockLinksRepo.save).toHaveBeenCalled()
    })

    it('should throw NotFoundException if file not found', async () => {
      mockFilesRepo.findOne.mockResolvedValue(null)

      await expect(service.attach('invalid', { refTable: 'messages', refId: 'msg1' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('get', () => {
    it('should return file by id', async () => {
      const file = { id: 'file1', filename: 'test.txt' }
      mockFilesRepo.findOne.mockResolvedValue(file)

      const result = await service.get('file1')

      expect(result).toEqual(file)
    })

    it('should throw NotFoundException if file not found', async () => {
      mockFilesRepo.findOne.mockResolvedValue(null)

      await expect(service.get('invalid')).rejects.toThrow(NotFoundException)
    })
  })

  describe('listMineCursor', () => {
    it('should return paginated files for user', async () => {
      const userId = 'user1'
      const files = [{ id: '3' }, { id: '2' }, { id: '1' }]
      mockFilesRepo.find.mockResolvedValue([...files, { id: '0' }]) // +1 for hasMore detection

      const result = await service.listMineCursor(userId, 3, null)

      expect(result.items).toHaveLength(3)
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBeDefined()
    })
  })

  describe('purgeTemp', () => {
    it('should delete orphan temp files older than threshold', async () => {
      const rows = [
        { id: 'file1', s3_key: 'uploads-temp/old1.txt' },
        { id: 'file2', s3_key: 'uploads-temp/old2.txt' },
      ]
      mockFilesRepo.query.mockResolvedValue(rows)
      mockFilesRepo.delete.mockResolvedValue({ affected: 1 })

      const result = await service.purgeTemp(24)

      expect(result.deleted).toBe(2)
      expect(mockFilesRepo.delete).toHaveBeenCalledTimes(2)
    })
  })

  describe('confirm', () => {
    it('should finalize temp upload by moving to uploads/ and return file', async () => {
      const fileId = 'file1'
      const filename = 'doc.pdf'
      const tempKey = 'uploads-temp/tmp-doc.pdf'
      const destKey = `uploads/${fileId}-${filename}`
      const file = { id: fileId, filename, s3Key: tempKey }
      mockFilesRepo.findOne.mockResolvedValue(file)
      mockFilesRepo.save.mockResolvedValue({ ...file, s3Key: destKey })
      // Mock S3 client on service
      ;(service as any).s3 = { send: jest.fn().mockResolvedValue({}) }

      const result = await service.confirm(fileId)

      expect(result).toBeDefined()
      expect(mockFilesRepo.save).toHaveBeenCalled()
      expect((service as any).s3.send).toHaveBeenCalled()
    })
  })
})
