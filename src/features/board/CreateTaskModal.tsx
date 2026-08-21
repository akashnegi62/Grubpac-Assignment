import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useBoardStore, type Task, type TaskPriority } from '../../stores/boardStore';
import { useAuthStore } from '../../stores/authStore';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
}

export function CreateTaskModal({ isOpen, onClose, onCreate }: CreateTaskModalProps) {
  const { addTask } = useBoardStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: `TASK-${Math.floor(Math.random() * 10000)}`,
      title: title.trim(),
      description: description.trim(),
      status: 'Backlog',
      priority,
      assignee: user?.firstName || 'Unassigned',
      dueDate: new Date().toISOString(),
      comments: []
    };

    addTask(newTask);
    onCreate(newTask);
    
    setTitle('');
    setDescription('');
    setPriority('Medium');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Task Title *
          </label>
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design new landing page"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <Select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            className="flex min-h-25 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:text-gray-100"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any extra details..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
