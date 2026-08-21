import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { notificationService } from '../services/notifications/notificationService';
import { useNotificationStore } from '../stores/notificationStore';
import { useToast } from '../components/ui/Toast';

interface MockNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function useNotificationPolling() {
  const { addNotifications, notifications, loadInitialNotifications } = useNotificationStore();
  const { toast } = useToast();
  const [isReady, setIsReady] = useState(false);
  
  // Keep track of known IDs to avoid triggering toasts for initial load
  const knownIdsRef = useRef<Set<string>>(new Set());

  // Initialize known IDs and load mock data on mount
  useEffect(() => {
    fetch('/mock-data.json')
      .then(res => res.json())
      .then(data => {
        if (data.notifications && data.notifications.length > 0) {
          const mapped = data.notifications.map((n: MockNotification) => ({
            id: `notif-${n.id}`,
            title: n.title,
            body: n.message,
            read: n.read,
            timestamp: new Date(n.createdAt).getTime()
          }));
          loadInitialNotifications(mapped);
          
          // Re-sync knownIdsRef after loading
          useNotificationStore.getState().notifications.forEach(notif => knownIdsRef.current.add(notif.id));
        }
      })
      .catch(err => console.error('Failed to load initial notifications:', err));
      
    notifications.forEach(n => knownIdsRef.current.add(n.id));

    // Delay start of JSONPlaceholder polling to allow user to see real mock data first
    const timer = setTimeout(() => setIsReady(true), 30000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const latest = await notificationService.fetchLatest();
      
      // Check for new notifications
      const newNotifications = latest.filter(n => !knownIdsRef.current.has(n.id));
      
      if (newNotifications.length > 0) {
        // Update store
        addNotifications(newNotifications);
        
        // Update known IDs
        newNotifications.forEach(n => knownIdsRef.current.add(n.id));
        
        // Trigger toast only if panel is closed
        if (!useNotificationStore.getState().isPanelOpen) {
          if (newNotifications.length === 1) {
            toast({
              title: 'New Notification',
              description: newNotifications[0].title,
              type: 'info'
            });
          } else {
            toast({
              title: 'New Notifications',
              description: `You have ${newNotifications.length} new notifications`,
              type: 'info'
            });
          }
        }
      }
      
      return latest;
    },
    enabled: isReady,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false, // Pause polling when tab is hidden
    refetchOnWindowFocus: true, // Resume polling when returning
  });
}
