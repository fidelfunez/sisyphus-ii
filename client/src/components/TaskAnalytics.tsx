import React from 'react';
import { TrendingUp, Calendar, Target, Award, Clock, BarChart3, PieChart, Activity } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: number;
  category: string | null;
  due_date: string | null;
  user_id: number;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
}

interface TaskAnalyticsProps {
  tasks: Task[];
}

const TaskAnalytics: React.FC<TaskAnalyticsProps> = ({ tasks }) => {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.is_completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Priority distribution
  const priorityStats = {
    low: tasks.filter(task => task.priority === 1).length,
    medium: tasks.filter(task => task.priority === 2).length,
    high: tasks.filter(task => task.priority === 3).length
  };

  // Category distribution
  const categoryStats = tasks.reduce((acc, task) => {
    const category = task.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Weekly completion trend (last 4 weeks)
  const getWeekStats = () => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (now.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekTasks = tasks.filter(task => 
        task.completed_at && 
        new Date(task.completed_at) >= weekStart && 
        new Date(task.completed_at) <= weekEnd
      ).length;
      
      weeks.push({
        week: i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i} weeks ago`,
        count: weekTasks
      });
    }
    
    return weeks;
  };

  // Overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (task.is_completed || !task.due_date) return false;
    const today = new Date();
    const due = new Date(task.due_date);
    return due < today;
  }).length;

  // Average completion time (for completed tasks with due dates)
  const getAverageCompletionTime = () => {
    const completedWithDueDate = tasks.filter(task => 
      task.is_completed && task.due_date && task.completed_at
    );
    
    if (completedWithDueDate.length === 0) return null;
    
    const totalDays = completedWithDueDate.reduce((sum, task) => {
      const due = new Date(task.due_date!);
      const completed = new Date(task.completed_at!);
      const diffTime = Math.abs(completed.getTime() - due.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return Math.round(totalDays / completedWithDueDate.length);
  };

  const averageCompletionTime = getAverageCompletionTime();
  const weekStats = getWeekStats();

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Task Analytics</h2>
          <p className="text-sm text-slate-600">Your productivity insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Completion Rate */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{completionRate}%</span>
          </div>
          <h3 className="text-sm font-semibold text-green-800 mb-1">Completion Rate</h3>
          <p className="text-xs text-green-600">{completedTasks} of {totalTasks} tasks completed</p>
        </div>

        {/* Average Completion Time */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {averageCompletionTime !== null ? `${averageCompletionTime}d` : 'N/A'}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-blue-800 mb-1">Avg. Completion Time</h3>
          <p className="text-xs text-blue-600">Days from due date</p>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{overdueTasks}</span>
          </div>
          <h3 className="text-sm font-semibold text-red-800 mb-1">Overdue Tasks</h3>
          <p className="text-xs text-red-600">Need attention</p>
        </div>

        {/* Productivity Score */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {Math.min(100, Math.round(completionRate + (overdueTasks === 0 ? 20 : 0) + (averageCompletionTime !== null && averageCompletionTime <= 0 ? 15 : 0)))}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-purple-800 mb-1">Productivity Score</h3>
          <p className="text-xs text-purple-600">Based on completion & timeliness</p>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <span>Priority Distribution</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-700">Low Priority</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{priorityStats.low}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-slate-700">Medium Priority</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{priorityStats.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-slate-700">High Priority</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{priorityStats.high}</span>
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Weekly Completion Trend</span>
          </h3>
          <div className="space-y-3">
            {weekStats.map((week, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{week.week}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (week.count / Math.max(...weekStats.map(w => w.count))) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 w-8 text-right">{week.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span>Category Breakdown</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(categoryStats)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="bg-white/80 rounded-xl p-3 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{category}</span>
                    <span className="text-sm font-semibold text-slate-700">{count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(count / Math.max(...Object.values(categoryStats))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAnalytics; 