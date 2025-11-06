import { Task } from './task.entity';
import { User } from './user.entity';
export declare class TaskComment {
    id: string;
    task: Task;
    user: User | null;
    body: string | null;
    createdAt: Date;
}
