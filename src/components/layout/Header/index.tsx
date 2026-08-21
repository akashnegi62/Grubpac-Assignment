
import { Menu, Moon, Sun } from 'lucide-react';
import { NotificationBell } from '../NotificationBell';
import { useThemeStore } from '../../../stores/themeStore';
import { Button } from '../../ui/Button';
import { useAuthStore } from '../../../stores/authStore';

import { useNotificationPolling } from '../../../hooks/useNotificationPolling';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  
  // Start polling for notifications when header mounts
  useNotificationPolling();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="font-bold text-xl text-blue-600 dark:text-blue-400 hidden md:block">
          SprintDesk
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-gray-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600" />
          )}
        </Button>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-200">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium hidden sm:block dark:text-gray-200">
              {user.username}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
