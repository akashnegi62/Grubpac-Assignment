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
  isPanelOpen: boolean;
  addNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setPanelOpen: (isOpen: boolean) => void;
  loadInitialNotifications: (initial: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isPanelOpen: false,
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
      }),
      setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
      loadInitialNotifications: (initial) => set((state) => {
        if (state.notifications.length > 0) return state; // Only load if empty
        return {
          notifications: initial,
          unreadCount: initial.filter(n => !n.read).length
        };
      })
    }),
    {
      name: 'notification-storage',
      version: 2,
      partialize: (state) => ({ notifications: state.notifications, unreadCount: state.unreadCount }),
    }
  )
);
