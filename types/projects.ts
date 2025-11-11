export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectViewMode = 'kanban' | 'gantt' | 'table';
export type GanttZoomLevel = 'day' | 'week' | 'month';

export interface TaskAssignee {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: TaskAssignee[];
  startDate: Date;
  dueDate: Date;
  progress: number;
  dependencies?: string[];
  tags?: string[];
  estimatedHours?: number;
}

export interface KanbanLane {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  wipLimit?: number;
}

export interface GanttBar {
  taskId: string;
  x: number;
  width: number;
  y: number;
  color: string;
}

export interface ProjectViewSwitcherProps {
  view: ProjectViewMode;
  onViewChange: (view: ProjectViewMode) => void;
}

export interface KanbanBoardProps {
  lanes: KanbanLane[];
  onMove: (taskId: string, toLane: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

export interface GanttChartProps {
  tasks: Task[];
  zoom: GanttZoomLevel;
  onZoomChange: (zoom: GanttZoomLevel) => void;
  onTaskClick: (task: Task) => void;
}

export interface ProjectTableProps {
  tasks: Task[];
  onSort: (column: string) => void;
  onFilter: (filters: Record<string, any>) => void;
  onTaskClick: (task: Task) => void;
}

export interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: () => void;
}

export interface FilterBarProps {
  filters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}
