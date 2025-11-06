import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ProjectsService } from './projects.service'
import { Project } from '../entities/project.entity'
import { ProjectMember } from '../entities/project-member.entity'
import { Task } from '../entities/task.entity'
import { TaskBucket } from '../entities/task-bucket.entity'
import { TaskComment } from '../entities/task-comment.entity'
import { OutboxService } from '../events/outbox.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'

describe('ProjectsService', () => {
  let service: ProjectsService
  let mockProjectsRepo: any
  let mockMembersRepo: any
  let mockTasksRepo: any
  let mockBucketsRepo: any
  let mockCommentsRepo: any
  let mockOutboxService: any

  beforeEach(async () => {
    mockProjectsRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
    }

    mockMembersRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    }

    mockTasksRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', createdAt: new Date(), ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
    }

    mockBucketsRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
    }

    mockCommentsRepo = {
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: '1', ...entity })),
      find: jest.fn(),
    }

    mockOutboxService = {
      append: jest.fn(() => Promise.resolve()),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockProjectsRepo },
        { provide: getRepositoryToken(ProjectMember), useValue: mockMembersRepo },
        { provide: getRepositoryToken(Task), useValue: mockTasksRepo },
        { provide: getRepositoryToken(TaskBucket), useValue: mockBucketsRepo },
        { provide: getRepositoryToken(TaskComment), useValue: mockCommentsRepo },
        { provide: OutboxService, useValue: mockOutboxService },
      ],
    }).compile()

    service = module.get<ProjectsService>(ProjectsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createProject', () => {
    it('should create project and add creator as owner', async () => {
      const userId = 'user1'
      const dto = { name: 'Test Project', description: 'Description' }
      mockProjectsRepo.save.mockResolvedValue({ id: 'proj1', ...dto })
      mockMembersRepo.save.mockResolvedValue({ id: 'mem1', userId, projectId: 'proj1', role: 'owner' })

      const result = await service.createProject(userId, dto)

      expect(result).toHaveProperty('id', 'proj1')
      expect(mockMembersRepo.save).toHaveBeenCalledWith(expect.objectContaining({ role: 'owner', userId }))
    })
  })

  describe('listMyProjects', () => {
    it('should return projects where user is member', async () => {
      const userId = 'user1'
      const projects = [
        { id: 'proj1', name: 'Project 1' },
        { id: 'proj2', name: 'Project 2' },
      ]
      mockMembersRepo.find.mockResolvedValue([
        { projectId: 'proj1', project: projects[0] },
        { projectId: 'proj2', project: projects[1] },
      ])

      const result = await service.listMyProjects(userId)

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('id', 'proj1')
    })
  })

  describe('getProject', () => {
    it('should return project if user is member', async () => {
      const userId = 'user1'
      const projectId = 'proj1'
      const project = { id: projectId, name: 'Test Project' }
      mockMembersRepo.findOne.mockResolvedValue({ userId, projectId })
      mockProjectsRepo.findOne.mockResolvedValue(project)

      const result = await service.getProject(userId, projectId)

      expect(result).toEqual(project)
    })

    it('should throw ForbiddenException if not a member', async () => {
      mockMembersRepo.findOne.mockResolvedValue(null)

      await expect(service.getProject('user1', 'proj1')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('createTask', () => {
    it('should create task and emit event', async () => {
      const userId = 'user1'
      const projectId = 'proj1'
      const dto = { title: 'Task 1', bucketId: 'bucket1', position: 1 }
      mockMembersRepo.findOne.mockResolvedValue({ userId, projectId, role: 'member' })
      mockTasksRepo.save.mockResolvedValue({ id: 'task1', projectId, ...dto })

      const result = await service.createTask(userId, projectId, dto)

      expect(result).toHaveProperty('id', 'task1')
      expect(mockOutboxService.append).toHaveBeenCalledWith(expect.objectContaining({ name: 'project.task.created' }))
    })

    it('should throw ForbiddenException if not a member', async () => {
      mockMembersRepo.findOne.mockResolvedValue(null)

      await expect(service.createTask('user1', 'proj1', { title: 'Task', position: 1 })).rejects.toThrow(ForbiddenException)
    })
  })

  describe('moveTask', () => {
    it('should move task and emit event', async () => {
      const userId = 'user1'
      const projectId = 'proj1'
      const taskId = 'task1'
      const task = { id: taskId, project: { id: projectId }, title: 'Task', bucketId: 'bucket1', position: 1 }
      mockMembersRepo.findOne.mockResolvedValue({ userId, projectId, role: 'member' })
      mockTasksRepo.findOne.mockResolvedValue(task)
      mockTasksRepo.save.mockResolvedValue({ ...task, bucketId: 'bucket2', position: 2 })

      const result = await service.moveTask(userId, projectId, taskId, { bucketId: 'bucket2', position: 2 })

      expect(result).toEqual({ success: true })
      expect(mockOutboxService.append).toHaveBeenCalledWith(expect.objectContaining({ name: 'project.task.moved' }))
    })

    it('should throw NotFoundException if task not found', async () => {
      mockMembersRepo.findOne.mockResolvedValue({ userId: 'user1', projectId: 'proj1' })
      mockTasksRepo.findOne.mockResolvedValue(null)

      await expect(service.moveTask('user1', 'proj1', 'invalid', { position: 1 })).rejects.toThrow(NotFoundException)
    })
  })

  describe('addMember', () => {
    it('should add member if requester is owner or admin', async () => {
      const ownerId = 'owner1'
      const newUserId = 'user2'
      const projectId = 'proj1'
      mockMembersRepo.findOne.mockResolvedValueOnce({ userId: ownerId, projectId, role: 'owner' })
      mockMembersRepo.findOne.mockResolvedValueOnce(null) // New user not yet member
      mockMembersRepo.save.mockResolvedValue({ id: 'mem2', userId: newUserId, projectId, role: 'member' })

      const result = await service.addMember(ownerId, projectId, { userId: newUserId, role: 'member' })

      expect(result).toHaveProperty('id', 'mem2')
      expect(mockOutboxService.append).toHaveBeenCalled()
    })

    it('should throw ForbiddenException if requester is not owner/admin', async () => {
      mockMembersRepo.findOne.mockResolvedValue({ userId: 'user1', projectId: 'proj1', role: 'member' })

      await expect(service.addMember('user1', 'proj1', { userId: 'user2', role: 'member' })).rejects.toThrow(ForbiddenException)
    })
  })

  describe('listProjectTasksCursor', () => {
    it('should return paginated tasks for project members', async () => {
      const userId = 'user1'
      const projectId = 'proj1'
      mockMembersRepo.findOne.mockResolvedValue({ userId, projectId })
      mockTasksRepo.find.mockResolvedValue([
        { id: 'task3', title: 'Task 3' },
        { id: 'task2', title: 'Task 2' },
        { id: 'task1', title: 'Task 1' },
      ])

      const result = await service.listProjectTasksCursor(userId, projectId, 20, null)

      expect(result.items).toHaveLength(3)
      expect(result.hasMore).toBe(false)
    })

    it('should throw ForbiddenException if not a member', async () => {
      mockMembersRepo.findOne.mockResolvedValue(null)

      await expect(service.listProjectTasksCursor('user1', 'proj1', 20, null)).rejects.toThrow(ForbiddenException)
    })
  })
})
