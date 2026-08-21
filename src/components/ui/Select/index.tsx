import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            'flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-900',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
    );
  }
);

Select.displayName = 'Select';
