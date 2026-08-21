import { type Notification } from '../../stores/notificationStore';

let offset = 0;

export const notificationService = {
  fetchLatest: async (): Promise<Notification[]> => {
    try {
      // Fetch 1 post at a time based on the offset
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_start=${offset}&_limit=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      
      offset += 1; // Increment offset for the next poll
      
      return data.map((post: { id: number, title: string, body: string }) => ({
        id: `notif-api-${post.id}`,
        title: post.title.substring(0, 40) + '...',
        body: post.body,
        read: false,
        timestamp: Date.now(), // Real-time timestamp
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
};
