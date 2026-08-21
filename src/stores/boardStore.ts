import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';

export type TaskStatus = 'Backlog' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: string;
  description?: string;
  comments?: Comment[];
}

interface BoardState {
  tasks: Task[];
  hasLoadedInitial: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus, newIndex?: number) => void;
  reorderTask: (id: string, newIndex: number) => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      tasks: [],
      hasLoadedInitial: false,
      setTasks: (tasks) => set({ tasks, hasLoadedInitial: true }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      moveTask: (id, newStatus, newIndex) => set((state) => {
        const taskIndex = state.tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return state;

        const updatedTasks = [...state.tasks];
        const task = { ...updatedTasks[taskIndex], status: newStatus };
        
        // Remove from old position
        updatedTasks.splice(taskIndex, 1);
        
        if (newIndex !== undefined) {
          // Insert at specific index among tasks of the new status
          // Find the absolute insertion index in the full array
          const statusTasks = updatedTasks.filter(t => t.status === newStatus);
          
          if (newIndex >= statusTasks.length) {
            // Append at the end
            updatedTasks.push(task);
          } else {
            const targetTask = statusTasks[newIndex];
            const absoluteTargetIndex = updatedTasks.findIndex(t => t.id === targetTask.id);
            updatedTasks.splice(absoluteTargetIndex, 0, task);
          }
        } else {
          // Default to end
          updatedTasks.push(task);
        }

        return { tasks: updatedTasks };
      }),
      reorderTask: (id, newIndex) => set((state) => {
        const taskIndex = state.tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return state;
        
        const task = state.tasks[taskIndex];
        const statusTasks = state.tasks.filter(t => t.status === task.status);
        
        const oldStatusIndex = statusTasks.findIndex(t => t.id === id);
        if (oldStatusIndex === newIndex) return state;

        // Use arrayMove on the filtered tasks, then reconstruct the full array
        const reorderedStatusTasks = arrayMove(statusTasks, oldStatusIndex, newIndex);
        
        const newFullTasks = state.tasks.map(t => {
          if (t.status === task.status) {
            // Replace with the correctly ordered item
            return reorderedStatusTasks.shift()!;
          }
          return t;
        });

        return { tasks: newFullTasks };
      }),
    }),
    {
      name: 'board-storage',
    }
  )
);
