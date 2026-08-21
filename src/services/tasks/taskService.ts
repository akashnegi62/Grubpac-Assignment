import { type Task } from '../../stores/boardStore';

export const taskService = {
  fetchInitialTasks: async (): Promise<Task[]> => {
    try {
      const response = await fetch('/mock-data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching mock tasks:', error);
      return [];
    }
  }
};
