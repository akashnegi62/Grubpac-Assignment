import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { useBoardStore } from '../../stores/boardStore';
import { useThemeStore } from '../../stores/themeStore';

const COLORS = {
  blue: '#3b82f6',
  yellow: '#eab308',
  purple: '#a855f7',
  green: '#22c55e',
  red: '#ef4444',
  gray: '#9ca3af',
};

const PIE_COLORS = [COLORS.blue, COLORS.yellow, COLORS.purple, COLORS.green];

export function Analytics() {
  const { tasks } = useBoardStore();
  const { theme } = useThemeStore();

  const isDark = theme === 'dark';
  const textColor = isDark ? '#d1d5db' : '#374151'; // gray-300 : gray-700
  const gridColor = isDark ? '#374151' : '#e5e7eb'; // gray-700 : gray-200

  // 1. Task Status Distribution
  const statusData = useMemo(() => {
    const counts = { Backlog: 0, 'In Progress': 0, Review: 0, Done: 0 };
    tasks.forEach(t => counts[t.status]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  // 2. Priority Breakdown by Column (Stacked Bar)
  const priorityData = useMemo(() => {
    const cols = ['Backlog', 'In Progress', 'Review', 'Done'];
    return cols.map(status => {
      const colTasks = tasks.filter(t => t.status === status);
      return {
        name: status,
        High: colTasks.filter(t => t.priority === 'High').length,
        Medium: colTasks.filter(t => t.priority === 'Medium').length,
        Low: colTasks.filter(t => t.priority === 'Low').length,
      };
    });
  }, [tasks]);

  // 3. Sprint Velocity (Completed tasks by Week/Sprint - using dueDate as a proxy for sprint completion date)
  const velocityData = useMemo(() => {
    // Group completed tasks by due date week
    const completed = tasks.filter(t => t.status === 'Done' && t.dueDate);
    const sprints: Record<string, number> = {};
    
    completed.forEach(t => {
      // Simulate sprints by grouping due dates into 2-week buckets or just arbitrary names
      // For simplicity, we'll format the week
      const date = new Date(t.dueDate!);
      const weekStr = `Week of ${format(date, 'MMM d')}`;
      sprints[weekStr] = (sprints[weekStr] || 0) + 1;
    });

    // If no completed tasks with dates exist, provide empty fallback
    if (Object.keys(sprints).length === 0) {
      return [{ name: 'Sprint 1', completed: 0 }];
    }

    return Object.entries(sprints)
      .map(([name, completed]) => ({ name, completed }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks]);

  // 4. Completion Trend (Cumulative completed tasks over time)
  const trendData = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'Done' && t.dueDate);
    
    // Create a rolling 7-day window
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
    
    let cumulative = 0;
    return days.map(day => {
      // Find tasks due on or before this day to simulate trend
      const dailyCount = completed.filter(t => {
        const d = startOfDay(new Date(t.dueDate!));
        return d.getTime() === day.getTime();
      }).length;
      
      cumulative += dailyCount;
      return {
        date: format(day, 'MMM dd'),
        completed: cumulative
      };
    });
  }, [tasks]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visualize sprint and task metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Task Status - Pie Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 min-h-75">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 px-2">Task Status Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => percent && percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb', color: textColor }}
                  itemStyle={{ color: textColor }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown - Stacked Bar Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 min-h-75">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 px-2">Priority Breakdown by Column</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb', color: textColor }}
                  cursor={{ fill: isDark ? '#374151' : '#f3f4f6' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="High" stackId="a" fill={COLORS.red} radius={[0, 0, 4, 4]} />
                <Bar dataKey="Medium" stackId="a" fill={COLORS.yellow} />
                <Bar dataKey="Low" stackId="a" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sprint Velocity - Bar Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 min-h-75">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 px-2">Sprint Velocity (Completed Tasks)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb', color: textColor }}
                  cursor={{ fill: isDark ? '#374151' : '#f3f4f6' }}
                />
                <Bar dataKey="completed" fill={COLORS.green} radius={[4, 4, 0, 0]} name="Completed Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Trend - Line Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 min-h-75">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 px-2">Completion Trend (7 Days)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb', color: textColor }}
                />
                <Line type="monotone" dataKey="completed" stroke={COLORS.purple} strokeWidth={3} dot={{ r: 4, fill: COLORS.purple, strokeWidth: 0 }} activeDot={{ r: 6 }} name="Cumulative Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
