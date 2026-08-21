import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      addNotifications: (newNotifications) => set((state) => {
        // Simple deduplication based on ID
        const existingIds = new Set(state.notifications.map(n => n.id));
        const filteredNew = newNotifications.filter(n => !existingIds.has(n.id));
        
        const updated = [...filteredNew, ...state.notifications].slice(0, 50); // Keep last 50
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length
        };
      }),
      markAsRead: (id) => set((state) => {
        const updated = state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter(n => !n.read).length
        };
      }),
      markAllAsRead: () => set((state) => {
        const updated = state.notifications.map(n => ({ ...n, read: true }));
        return {
          notifications: updated,
          unreadCount: 0
        };
      })
    }),
    {
      name: 'notification-storage',
    }
  )
);
