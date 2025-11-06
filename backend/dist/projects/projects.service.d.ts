import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { ProjectMember } from '../entities/project-member.entity';
import { TaskBucket } from '../entities/task-bucket.entity';
import { Task } from '../entities/task.entity';
import { TaskComment } from '../entities/task-comment.entity';
import { TaskAssignee } from '../entities/task-assignee.entity';
import { OutboxService } from '../events/outbox.service';
export declare class ProjectsService {
    private readonly projects;
    private readonly members;
    private readonly buckets;
    private readonly tasks;
    private readonly comments;
    private readonly assignees;
    private readonly outbox;
    constructor(projects: Repository<Project>, members: Repository<ProjectMember>, buckets: Repository<TaskBucket>, tasks: Repository<Task>, comments: Repository<TaskComment>, assignees: Repository<TaskAssignee>, outbox: OutboxService);
    myProjects(userId: string): Promise<Project[]>;
    createProject(userId: string, dto: {
        name: string;
        description?: string | null;
    }): Promise<Project>;
    addMember(actorId: string, projectId: string, userId: string, role?: string): Promise<ProjectMember>;
    createBucket(actorId: string, projectId: string, name: string, position: number): Promise<TaskBucket>;
    createTask(actorId: string, dto: {
        projectId: string;
        bucketId?: string | null;
        title: string;
        description?: string | null;
        position: number;
    }): Promise<Task>;
    moveTask(actorId: string, taskId: string, dto: {
        projectId: string;
        bucketId: string | null;
        position: number;
    }): Promise<{
        success: boolean;
    }>;
    comment(actorId: string, taskId: string, body: string): Promise<TaskComment>;
}
