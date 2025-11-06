import { User } from './user.entity';
import { ProjectMember } from './project-member.entity';
import { TaskBucket } from './task-bucket.entity';
import { Task } from './task.entity';
export declare class Project {
    id: string;
    name: string;
    description: string | null;
    owner: User | null;
    createdAt: Date;
    members: ProjectMember[];
    buckets: TaskBucket[];
    tasks: Task[];
}
