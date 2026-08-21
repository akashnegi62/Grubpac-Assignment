import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, AlignLeft } from 'lucide-react';
import { type Task } from '../../stores/boardStore';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const priorityColors = {
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        "group relative flex cursor-grab flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-blue-500 z-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
          {task.title}
        </h4>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full", priorityColors[task.priority])}>
          {task.priority}
        </span>
        
        {task.description && (
          <AlignLeft className="h-4 w-4 text-gray-400" />
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3.5 w-3.5" />
          {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
        </div>

        {task.assignee && (
          <div 
            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            title={task.assignee}
          >
            {task.assignee.charAt(0).toUpperCase()}
          </div>
        )}
        {!task.assignee && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <User className="h-3.5 w-3.5" />
            Unassigned
          </div>
        )}
      </div>
    </div>
  );
}
