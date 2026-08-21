import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { notificationService } from '../services/notifications/notificationService';
import { useNotificationStore } from '../stores/notificationStore';
import { useToast } from '../components/ui/Toast';

export function useNotificationPolling() {
  const { addNotifications, notifications } = useNotificationStore();
  const { toast } = useToast();
  
  // Keep track of known IDs to avoid triggering toasts for initial load
  const knownIdsRef = useRef<Set<string>>(new Set());

  // Initialize known IDs on mount
  useEffect(() => {
    notifications.forEach(n => knownIdsRef.current.add(n.id));
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
        
        // Trigger toast for the newest one (or a summary if many)
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
      
      return latest;
    },
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: false, // Pause polling when tab is hidden
    refetchOnWindowFocus: true, // Resume polling when returning
  });
}
