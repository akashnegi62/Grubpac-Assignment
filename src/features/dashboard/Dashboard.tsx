import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ListTodo, 
  AlertCircle, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { buttonVariants } from '../../components/ui/Button';
import { format } from 'date-fns';

export function Dashboard() {
  const { tasks } = useBoardStore();
  const { notifications } = useNotificationStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'High' && t.status !== 'Done');
  
  // Sort by due date, taking only tasks that have a date and are not done
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== 'Done' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Current sprint overview and metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <ListTodo className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedTasks}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">High Priority</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{highPriorityTasks.length}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-center gap-3">
          <Link to="/board" className={buttonVariants({ variant: 'outline', className: 'w-full justify-between' })}>
            View Board <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/analytics" className={buttonVariants({ variant: 'outline', className: 'w-full justify-between' })}>
            View Analytics <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden flex flex-col">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Upcoming Deadlines</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming deadlines.</p>
            ) : (
              upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{task.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{task.status}</span>
                      <span className="text-xs text-gray-300 dark:text-gray-700">•</span>
                      <span className="text-xs text-gray-500">{task.assignee || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(task.dueDate!), 'MMM d')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden flex flex-col">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Notifications</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent notifications.</p>
            ) : (
              recentNotifications.map(notification => (
                <div key={notification.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                    <span className="text-xs text-gray-500">
                      {format(new Date(notification.timestamp), 'h:mm a')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{notification.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
