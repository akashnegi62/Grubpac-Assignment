import { type Task, type TaskStatus, type TaskPriority, type Comment } from '../../stores/boardStore';

interface MockUser { id: number; name: string; }
interface MockComment { id: number; taskId: number; authorId: number; message: string; createdAt: string; }
interface MockTask { id: number; title: string; description: string; status: string; priority: string; assigneeId: number; dueDate?: string; }

export const taskService = {
  fetchInitialTasks: async (): Promise<Task[]> => {
    try {
      const response = await fetch('/mock-data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch mock data');
      }
      const data = await response.json();
      
      const users: MockUser[] = data.users || [];
      const comments: MockComment[] = data.comments || [];
      const rawTasks: MockTask[] = data.tasks || [];

      // Mappings for enums
      const statusMap: Record<string, TaskStatus> = {
        'backlog': 'Backlog',
        'in-progress': 'In Progress',
        'review': 'Review',
        'done': 'Done'
      };

      const priorityMap: Record<string, TaskPriority> = {
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
      };

      return rawTasks.map((t: MockTask) => {
        // Find assignee
        const assignee = users.find((u: MockUser) => u.id === t.assigneeId)?.name;
        
        // Find comments
        const taskComments: Comment[] = comments
          .filter((c: MockComment) => c.taskId === t.id)
          .map((c: MockComment) => ({
            id: `comment-${c.id}`,
            author: users.find((u: MockUser) => u.id === c.authorId)?.name || 'Unknown',
            text: c.message,
            timestamp: new Date(c.createdAt).getTime(),
          }));

        return {
          id: `TASK-${t.id}`,
          title: t.title,
          description: t.description,
          status: statusMap[t.status] || 'Backlog',
          priority: priorityMap[t.priority] || 'Medium',
          assignee: assignee,
          dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : undefined,
          comments: taskComments,
        };
      });
    } catch (error) {
      console.error('Error fetching mock tasks:', error);
      return [];
    }
  }
};
