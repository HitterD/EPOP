import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Project, Task, Bucket } from '@/types'

interface ProjectsState {
  projects: Map<string, Project>
  tasks: Map<string, Task>
  activeProject: string | null
  activeView: 'board' | 'grid' | 'gantt' | 'schedule' | 'charts'
  
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  removeProject: (projectId: string) => void
  
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  removeTask: (taskId: string) => void
  moveTask: (taskId: string, toBucketId: string) => void
  
  setActiveProject: (projectId: string | null) => void
  setActiveView: (view: 'board' | 'grid' | 'gantt' | 'schedule' | 'charts') => void
}

export const useProjectsStore = create<ProjectsState>()(
  immer((set) => ({
    projects: new Map(),
    tasks: new Map(),
    activeProject: null,
    activeView: 'board',

    setProjects: (projects) =>
      set((state) => {
        state.projects = new Map(projects.map((p) => [p.id, p]))
      }),

    addProject: (project) =>
      set((state) => {
        state.projects.set(project.id, project)
      }),

    updateProject: (projectId, updates) =>
      set((state) => {
        const project = state.projects.get(projectId)
        if (project) {
          state.projects.set(projectId, { ...project, ...updates })
        }
      }),

    removeProject: (projectId) =>
      set((state) => {
        state.projects.delete(projectId)
      }),

    setTasks: (tasks) =>
      set((state) => {
        state.tasks = new Map(tasks.map((t) => [t.id, t]))
      }),

    addTask: (task) =>
      set((state) => {
        state.tasks.set(task.id, task)
      }),

    updateTask: (taskId, updates) =>
      set((state) => {
        const task = state.tasks.get(taskId)
        if (task) {
          state.tasks.set(taskId, { ...task, ...updates })
        }
      }),

    removeTask: (taskId) =>
      set((state) => {
        state.tasks.delete(taskId)
      }),

    moveTask: (taskId, toBucketId) =>
      set((state) => {
        const task = state.tasks.get(taskId)
        if (task) {
          state.tasks.set(taskId, { ...task, bucketId: toBucketId })
        }
      }),

    setActiveProject: (projectId) =>
      set((state) => {
        state.activeProject = projectId
      }),

    setActiveView: (view) =>
      set((state) => {
        state.activeView = view
      }),
  }))
)
