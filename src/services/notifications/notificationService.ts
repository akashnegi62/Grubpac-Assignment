import { type Notification } from '../../stores/notificationStore';

export const notificationService = {
  fetchLatest: async (): Promise<Notification[]> => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      
      return data.map((post: { id: number, title: string, body: string }) => ({
        id: `notif-${post.id}`,
        title: post.title.substring(0, 40) + '...',
        body: post.body,
        read: false,
        timestamp: Date.now(), // Simulated timestamp
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
};
