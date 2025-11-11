import type { Task, TaskAssignee, KanbanLane } from '@/types/projects';

export const mockAssignees: TaskAssignee[] = [
  { id: '1', name: 'Alice Chen', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { id: '2', name: 'Bob Smith', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { id: '3', name: 'Carol Lee', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol' },
  { id: '4', name: 'Dave Wilson', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave' },
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Design new landing page',
    description: 'Create mockups for the new landing page',
    status: 'in-progress',
    priority: 'high',
    assignees: [mockAssignees[0]],
    startDate: new Date(2024, 0, 1),
    dueDate: new Date(2024, 0, 15),
    progress: 60,
    tags: ['design', 'frontend'],
    estimatedHours: 40,
  },
  {
    id: 't2',
    title: 'Implement authentication',
    description: 'Add OAuth2 support',
    status: 'todo',
    priority: 'critical',
    assignees: [mockAssignees[1], mockAssignees[2]],
    startDate: new Date(2024, 0, 5),
    dueDate: new Date(2024, 0, 20),
    progress: 0,
    dependencies: ['t1'],
    tags: ['backend', 'security'],
    estimatedHours: 60,
  },
  {
    id: 't3',
    title: 'Write API documentation',
    description: 'Document all REST endpoints',
    status: 'review',
    priority: 'medium',
    assignees: [mockAssignees[3]],
    startDate: new Date(2024, 0, 10),
    dueDate: new Date(2024, 0, 25),
    progress: 90,
    tags: ['documentation'],
    estimatedHours: 20,
  },
  {
    id: 't4',
    title: 'Deploy to production',
    description: 'Deploy v2.0 to production',
    status: 'done',
    priority: 'critical',
    assignees: [mockAssignees[1]],
    startDate: new Date(2024, 0, 1),
    dueDate: new Date(2024, 0, 5),
    progress: 100,
    tags: ['devops'],
    estimatedHours: 10,
  },
];

// Generate large dataset for virtualization testing
export const generateMockTasks = (count: number): Task[] => {
  const tasks: Task[] = [];
  const statuses: Task['status'][] = ['todo', 'in-progress', 'review', 'done'];
  const priorities: Task['priority'][] = ['low', 'medium', 'high', 'critical'];
  
  for (let i = 0; i < count; i++) {
    tasks.push({
      id: `task-${i}`,
      title: `Task ${i + 1}: ${['Implement', 'Design', 'Fix', 'Refactor'][i % 4]} feature`,
      description: `Description for task ${i + 1}`,
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      assignees: [mockAssignees[i % mockAssignees.length]],
      startDate: new Date(2024, 0, 1 + (i % 30)),
      dueDate: new Date(2024, 0, 10 + (i % 30)),
      progress: Math.floor(Math.random() * 100),
      tags: ['tag1', 'tag2'],
      estimatedHours: 20 + (i % 40),
    });
  }
  
  return tasks;
};

export const mockKanbanLanes: KanbanLane[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: mockTasks.filter((t) => t.status === 'todo'),
    wipLimit: 5,
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: mockTasks.filter((t) => t.status === 'in-progress'),
    wipLimit: 3,
  },
  {
    id: 'review',
    title: 'Review',
    tasks: mockTasks.filter((t) => t.status === 'review'),
    wipLimit: 2,
  },
  {
    id: 'done',
    title: 'Done',
    tasks: mockTasks.filter((t) => t.status === 'done'),
  },
];
