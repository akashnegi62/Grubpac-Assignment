import { useState, useEffect } from 'react';
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
import { Plus } from 'lucide-react';
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
  const { tasks, hasLoadedInitial, setTasks, moveTask, reorderTask } = useBoardStore();
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

  return (
    <div className="h-full w-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sprint Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage tasks and track progress</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
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
                tasks={tasks.filter(t => t.status === colStatus)}
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
