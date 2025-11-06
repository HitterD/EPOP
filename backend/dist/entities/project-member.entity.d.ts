import { Project } from './project.entity';
import { User } from './user.entity';
export declare class ProjectMember {
    projectId: string;
    userId: string;
    project: Project;
    user: User;
    role: string;
}
