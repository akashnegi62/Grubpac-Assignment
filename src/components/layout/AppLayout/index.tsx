import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { useThemeStore } from '../../../stores/themeStore';
import { ToastProvider } from '../../ui/Toast';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useThemeStore();

  // Apply theme to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100 overflow-hidden font-sans">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <div className="flex flex-1 flex-col overflow-hidden w-full relative">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
            <div className="mx-auto max-w-7xl h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
