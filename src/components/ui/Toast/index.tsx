import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, type }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-105">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function Toast({ title, description, type, onClose }: ToastMessage & { onClose: () => void }) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all mb-4",
        type === 'success' && "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900",
        type === 'error' && "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900",
        type === 'info' && "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900"
      )}
    >
      <div className="flex gap-3">
        {type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
        {type === 'error' && <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
        {type === 'info' && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {description && (
            <p className="text-sm opacity-90 text-gray-700 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 group-hover:opacity-100 dark:hover:text-gray-100"
      >
        <X className="h-4 w-4 p-2 rounded full bg-blue-100" />
      </button>
    </div>
  );
}
