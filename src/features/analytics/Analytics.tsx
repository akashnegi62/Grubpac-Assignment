import { useState, useMemo, useRef } from 'react';
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
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../../components/ui/Button';

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
  
  const [startDate, setStartDate] = useState(() => format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#d1d5db' : '#374151'; // gray-300 : gray-700
  const gridColor = isDark ? '#374151' : '#e5e7eb'; // gray-700 : gray-200

  const handleExport = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    
    try {
      // Dynamically load html2canvas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(window as any).html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canvas = await (window as any).html2canvas(containerRef.current, {
        backgroundColor: isDark ? '#111827' : '#ffffff',
        scale: 2,
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `sprint-analytics-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to export analytics', err);
    } finally {
      setIsExporting(false);
    }
  };

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

  // 3. Sprint Velocity (Completed tasks by Week/Sprint - filtered by date range)
  const velocityData = useMemo(() => {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    
    if (start > end || isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    const completed = tasks.filter(t => {
      if (t.status !== 'Done' || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= start && d <= end;
    });

    const sprints: Record<string, number> = {};
    
    completed.forEach(t => {
      const date = new Date(t.dueDate!);
      const weekStr = `Week of ${format(date, 'MMM d')}`;
      sprints[weekStr] = (sprints[weekStr] || 0) + 1;
    });

    if (Object.keys(sprints).length === 0) {
      return [{ name: 'No tasks', completed: 0 }];
    }

    return Object.entries(sprints)
      .map(([name, completed]) => ({ name, completed }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, startDate, endDate]);

  // 4. Completion Trend (Cumulative completed tasks over date range)
  const trendData = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'Done' && t.dueDate);
    
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    
    if (start > end || isNaN(start.getTime()) || isNaN(end.getTime())) return [];
    
    // Ensure we don't render too many points, limit to 60 days
    const boundedStart = end.getTime() - start.getTime() > 60 * 24 * 60 * 60 * 1000 
      ? subDays(end, 60) 
      : start;

    const days = eachDayOfInterval({ start: boundedStart, end });
    
    let cumulative = completed.filter(t => new Date(t.dueDate!) < boundedStart).length;
    
    return days.map(day => {
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
  }, [tasks, startDate, endDate]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header with Filters & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visualize sprint and task metrics</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 w-32"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-300 w-32"
            />
          </div>

          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export PNG'}
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1 bg-gray-50 dark:bg-gray-950 rounded-xl">
        
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
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 px-2">Completion Trend</h3>
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
