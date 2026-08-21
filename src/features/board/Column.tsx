import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type Task, type TaskStatus } from '../../stores/boardStore';
import { TaskCard } from './TaskCard';
import { cn } from '../../lib/utils';

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function Column({ status, tasks, onTaskClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  return (
    <div className="flex h-full w-80 min-w-80 flex-col rounded-xl bg-gray-100/50 p-4 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {status}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div 
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-3 overflow-y-auto pb-4 transition-colors",
          isOver && "bg-gray-100 dark:bg-gray-800/50 rounded-lg"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        
        {/* Empty placeholder to ensure droppable area has height when empty */}
        {tasks.length === 0 && (
          <div className="h-full w-full rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 opacity-50 flex items-center justify-center text-sm text-gray-500">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
