import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projects;
    constructor(projects: ProjectsService);
    mine(req: any): Promise<import("../entities/project.entity").Project[]>;
    create(req: any, body: {
        name: string;
        description?: string | null;
    }): Promise<import("../entities/project.entity").Project>;
    addMember(req: any, projectId: string, body: {
        userId: string;
        role?: string;
    }): Promise<import("../entities/project-member.entity").ProjectMember>;
    createBucket(req: any, projectId: string, body: {
        name: string;
        position: number;
    }): Promise<import("../entities/task-bucket.entity").TaskBucket>;
    createTask(req: any, projectId: string, body: {
        bucketId?: string | null;
        title: string;
        description?: string | null;
        position: number;
    }): Promise<import("../entities/task.entity").Task>;
    moveTask(req: any, projectId: string, taskId: string, body: {
        bucketId: string | null;
        position: number;
    }): Promise<{
        success: boolean;
    }>;
    comment(req: any, projectId: string, taskId: string, text: string): Promise<import("../entities/task-comment.entity").TaskComment>;
}
