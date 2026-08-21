
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, LineChart, LogOut, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAuthStore } from '../../../stores/authStore';
import { Button } from '../../ui/Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/board', label: 'Sprint Board', icon: KanbanSquare },
  { path: '/analytics', label: 'Analytics', icon: LineChart },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout } = useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out dark:border-gray-800 dark:bg-gray-900 md:static md:flex md:translate-x-0",
          isOpen ? "translate-x-0 flex" : "-translate-x-full hidden"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 md:hidden border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">SprintDesk</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          <div className="mb-4 hidden md:block">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Menu
            </span>
          </div>
          
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) => cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" 
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
