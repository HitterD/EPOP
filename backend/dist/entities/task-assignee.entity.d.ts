import { Task } from './task.entity';
import { User } from './user.entity';
export declare class TaskAssignee {
    taskId: string;
    userId: string;
    task: Task;
    user: User;
}
