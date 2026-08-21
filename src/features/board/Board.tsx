import { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Undo2, Filter } from 'lucide-react';
import { useBoardStore, type Task, type TaskStatus } from '../../stores/boardStore';
import { taskService } from '../../services/tasks/taskService';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { Button } from '../../components/ui/Button';
import { TaskDrawer } from './TaskDrawer.tsx';
import { CreateTaskModal } from './CreateTaskModal.tsx';
import { useToast } from '../../components/ui/Toast';

const COLUMNS: TaskStatus[] = ['Backlog', 'In Progress', 'Review', 'Done'];

export function Board() {
  const { 
    tasks, 
    previousTasks,
    filters,
    hasLoadedInitial, 
    setTasks, 
    setFilters,
    moveTask, 
    reorderTask,
    undoLastAction
  } = useBoardStore();
  
  const { toast } = useToast();
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!hasLoadedInitial) {
      taskService.fetchInitialTasks().then((initialTasks) => {
        setTasks(initialTasks);
      });
    }
  }, [hasLoadedInitial, setTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Moving over another task
    if (isOverTask) {
      const activeTaskData = tasks.find(t => t.id === activeId);
      const overTaskData = tasks.find(t => t.id === overId);
      
      if (!activeTaskData || !overTaskData) return;

      if (activeTaskData.status !== overTaskData.status) {
        // Find index of the over task among its peers
        const overStatusTasks = tasks.filter(t => t.status === overTaskData.status);
        const overIndex = overStatusTasks.findIndex(t => t.id === overId);
        
        moveTask(activeId, overTaskData.status, overIndex);
      }
    }

    // Moving over an empty column
    if (isOverColumn) {
      const activeTaskData = tasks.find(t => t.id === activeId);
      const newStatus = overId as TaskStatus;
      
      if (activeTaskData && activeTaskData.status !== newStatus) {
        moveTask(activeId, newStatus);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTaskData = tasks.find(t => t.id === activeId);
    const overTaskData = tasks.find(t => t.id === overId);

    if (activeTaskData && overTaskData && activeTaskData.status === overTaskData.status) {
      // Reordering within the same column
      const statusTasks = tasks.filter(t => t.status === activeTaskData.status);
      const newIndex = statusTasks.findIndex(t => t.id === overId);
      reorderTask(activeId, newIndex);
    }
  };

  // Derive filter options
  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    tasks.forEach(t => t.assignee && assignees.add(t.assignee));
    return Array.from(assignees).sort();
  }, [tasks]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignee && task.assignee !== filters.assignee) return false;
      return true;
    });
  }, [tasks, filters]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sprint Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage tasks and track progress</p>
        </div>
        <div className="flex items-center gap-3">
          {previousTasks && (
            <Button variant="secondary" onClick={undoLastAction} className="gap-2 text-yellow-600 dark:text-yellow-500 hover:text-yellow-700">
              <Undo2 className="h-4 w-4" />
              Undo Move
            </Button>
          )}
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>
      
      {/* Filters Bar */}
      <div className="mb-6 flex items-center gap-4 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 pr-4">
          <Filter className="h-4 w-4" /> Filters
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Priority:</label>
          <select 
            className="text-sm rounded-md border-gray-300 dark:border-gray-700 bg-transparent py-1.5 px-3 dark:text-gray-300"
            value={filters.priority || ''}
            onChange={(e) => setFilters({ priority: e.target.value || null })}
          >
            <option value="">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Assignee:</label>
          <select 
            className="text-sm rounded-md border-gray-300 dark:border-gray-700 bg-transparent py-1.5 px-3 dark:text-gray-300"
            value={filters.assignee || ''}
            onChange={(e) => setFilters({ assignee: e.target.value || null })}
          >
            <option value="">All</option>
            {uniqueAssignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>
        
        {(filters.priority || filters.assignee) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilters({ priority: null, assignee: null })}
            className="ml-auto text-xs"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="inline-flex h-full items-start gap-6 px-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {COLUMNS.map((colStatus) => (
              <Column
                key={colStatus}
                status={colStatus}
                tasks={filteredTasks.filter(t => t.status === colStatus)}
                onTaskClick={setSelectedTask}
              />
            ))}

            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
              {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <TaskDrawer 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />

      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(task: Task) => {
          toast({ title: 'Task created', description: `Added ${task.title} to Backlog`, type: 'success' });
        }}
      />
    </div>
  );
}
