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

interface BoardFilters {
  priority: string | null;
  assignee: string | null;
}

interface BoardState {
  tasks: Task[];
  previousTasks: Task[] | null;
  filters: BoardFilters;
  hasLoadedInitial: boolean;
  setTasks: (tasks: Task[]) => void;
  setFilters: (filters: Partial<BoardFilters>) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus, newIndex?: number) => void;
  reorderTask: (id: string, newIndex: number) => void;
  undoLastAction: () => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      tasks: [],
      previousTasks: null,
      filters: { priority: null, assignee: null },
      hasLoadedInitial: false,
      
      setTasks: (tasks) => set({ tasks, hasLoadedInitial: true, previousTasks: null }),
      
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),

      addTask: (task) => set((state) => ({ 
        previousTasks: state.tasks,
        tasks: [...state.tasks, task] 
      })),
      
      updateTask: (id, updates) => set((state) => ({
        previousTasks: state.tasks,
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      })),
      
      deleteTask: (id) => set((state) => ({
        previousTasks: state.tasks,
        tasks: state.tasks.filter(task => task.id !== id)
      })),
      
      moveTask: (id, newStatus, newIndex) => set((state) => {
        const taskToMove = state.tasks.find(t => t.id === id);
        if (!taskToMove) return state;

        const updatedTask = { ...taskToMove, status: newStatus };
        let newTasks = state.tasks.filter(t => t.id !== id);
        
        if (typeof newIndex === 'number') {
          const statusTasks = newTasks.filter(t => t.status === newStatus);
          const otherTasks = newTasks.filter(t => t.status !== newStatus);
          
          statusTasks.splice(newIndex, 0, updatedTask);
          newTasks = [...otherTasks, ...statusTasks];
        } else {
          newTasks.push(updatedTask);
        }

        return { previousTasks: state.tasks, tasks: newTasks };
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

        return { previousTasks: state.tasks, tasks: newFullTasks };
      }),
      
      undoLastAction: () => set((state) => {
        if (!state.previousTasks) return state;
        return { tasks: state.previousTasks, previousTasks: null };
      })
    }),
    {
      name: 'board-storage',
      version: 1,
    }
  )
);
