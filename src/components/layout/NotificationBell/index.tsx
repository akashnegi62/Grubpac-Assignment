import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../../stores/notificationStore';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto flex flex-col gap-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No notifications yet</p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-3 rounded-md border text-sm transition-colors cursor-pointer",
                    n.read 
                      ? "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50" 
                      : "border-blue-100 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10"
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">{n.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
