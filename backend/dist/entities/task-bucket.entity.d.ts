import { Project } from './project.entity';
import { Task } from './task.entity';
export declare class TaskBucket {
    id: string;
    project: Project;
    name: string;
    position: number;
    tasks: Task[];
}
