import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, User, AlignLeft, MessageSquare, Pencil, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useBoardStore, type Task, type Comment, type TaskPriority } from '../../stores/boardStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDrawer({ task, isOpen, onClose }: TaskDrawerProps) {
  const { updateTask } = useBoardStore();
  const { user } = useAuthStore();
  
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('Medium');

  const startEditing = () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditAssignee(task.assignee || '');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setIsEditing(true);
  };

  const handleClose = useCallback(() => {
    setIsEditing(false);
    onClose();
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  if (!isOpen || !task) return null;

  const handleAddComment = () => {
    if (!commentText.trim() || !user) return;
    
    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: user.firstName,
      text: commentText.trim(),
      timestamp: Date.now(),
    };
    
    updateTask(task.id, {
      comments: [...(task.comments || []), newComment]
    });
    
    setCommentText('');
  };

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: editTitle,
      assignee: editAssignee || undefined,
      dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
      description: editDescription || undefined,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const content = (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50 transition-opacity" 
        onClick={handleClose}
      />
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-label="Task Details"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500">{task.id}</span>
            {!isEditing ? (
              <span className={cn(
                "px-2 py-0.5 text-xs font-semibold rounded-full",
                task.priority === 'High' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                task.priority === 'Medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                task.priority === 'Low' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              )}>
                {task.priority}
              </span>
            ) : (
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                className="text-xs rounded-md border-gray-300 dark:border-gray-700 bg-transparent py-1 px-2 dark:text-gray-300"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button variant="ghost" size="icon" onClick={startEditing} aria-label="Edit task">
                <Pencil className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleSaveEdit} className="text-green-600 hover:text-green-700" aria-label="Save task">
                <Check className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Close details">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            {!isEditing ? (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                {task.title}
              </h2>
            ) : (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="font-semibold text-lg"
                placeholder="Task title"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <User className="h-4 w-4" /> Assignee
              </span>
              {!isEditing ? (
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {task.assignee || 'Unassigned'}
                </p>
              ) : (
                <Input
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  placeholder="Assignee name"
                  className="h-8"
                />
              )}
            </div>
            
            <div className="space-y-1">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Due Date
              </span>
              {!isEditing ? (
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                </p>
              ) : (
                <Input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="h-8"
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <AlignLeft className="h-4 w-4" /> Description
            </h3>
            {!isEditing ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            ) : (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full min-h-25 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:focus:ring-gray-300 dark:focus:ring-offset-gray-950"
                placeholder="Add a more detailed description..."
              />
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Comments ({(task.comments || []).length})
            </h3>
            
            <div className="space-y-4">
              {(task.comments || []).map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg dark:bg-gray-800/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{comment.author}</span>
                    <span className="text-xs text-gray-500">{format(new Date(comment.timestamp), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                </div>
              ))}
              
              <div className="flex gap-2 pt-2">
                <Input 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment();
                  }}
                />
                <Button onClick={handleAddComment} disabled={!commentText.trim()}>Post</Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
