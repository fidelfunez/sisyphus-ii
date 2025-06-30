import React, { useMemo } from 'react';
import { CheckCircle, Circle, Trash2, Clock, Calendar, Tag, AlertTriangle, Edit } from 'lucide-react';

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

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const TaskItem: React.FC<TaskItemProps> = React.memo(({ task, onToggle, onDelete, onEdit }) => {
  const priorityColors = {
    1: { bg: 'bg-green-100 dark:bg-green-900/60', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-700', icon: 'bg-green-500 dark:bg-green-400' },
    2: { bg: 'bg-yellow-100 dark:bg-yellow-900/60', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-700', icon: 'bg-yellow-500 dark:bg-yellow-400' },
    3: { bg: 'bg-red-100 dark:bg-red-900/60', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700', icon: 'bg-red-500 dark:bg-red-400' }
  };

  const priorityLabels = {
    1: 'Low',
    2: 'Medium', 
    3: 'High'
  };

  // Memoize expensive date calculations
  const { formatDate, dueStatus, dueText } = useMemo(() => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      return date.toLocaleDateString();
    };

    const getDueDateStatus = (dueDate: string | null) => {
      if (!dueDate) return { status: 'no_due_date', color: 'text-slate-500 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/60' };
      
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return { status: 'overdue', color: 'text-red-600 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/60' };
      } else if (diffDays === 0) {
        return { status: 'due_today', color: 'text-orange-600 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/60' };
      } else if (diffDays === 1) {
        return { status: 'due_tomorrow', color: 'text-yellow-600 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/60' };
      } else if (diffDays <= 7) {
        return { status: 'due_soon', color: 'text-blue-600 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/60' };
      } else {
        return { status: 'due_later', color: 'text-green-600 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/60' };
      }
    };

    const getDueDateText = (dueDate: string | null) => {
      if (!dueDate) return null;
      
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
      } else if (diffDays === 0) {
        return 'Due today';
      } else if (diffDays === 1) {
        return 'Due tomorrow';
      } else if (diffDays <= 7) {
        return `Due in ${diffDays} days`;
      } else {
        return `Due on ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
    };

    return {
      formatDate,
      dueStatus: getDueDateStatus(task.due_date),
      dueText: getDueDateText(task.due_date)
    };
  }, [task.due_date, task.created_at, task.updated_at, task.completed_at]);

  return (
    <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-800 hover:shadow-2xl transition-all duration-200 ease-out group ${
      task.is_completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start space-x-4">
        {/* Enhanced Toggle Button */}
        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-150 ease-out hover:scale-105 ${
            task.is_completed
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-700 dark:to-emerald-800 text-white shadow-lg'
              : 'bg-white/70 dark:bg-gray-800/70 border-2 border-slate-200 dark:border-gray-700 text-slate-400 dark:text-slate-500 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-500 dark:hover:text-blue-400'
          }`}
        >
          {task.is_completed ? (
            <CheckCircle size={20} className="animate-pulse" />
          ) : (
            <Circle size={20} />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold text-slate-900 dark:text-white mb-2 transition-colors duration-200 ${
                task.is_completed ? 'line-through text-slate-500 dark:text-slate-400' : ''
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={`text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 transition-colors duration-200 ${
                  task.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                }`}>
                  {task.description}
                </p>
              )}

              {/* Enhanced Task Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* Priority Badge */}
                <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl border ${
                  priorityColors[task.priority as keyof typeof priorityColors].bg
                } ${
                  priorityColors[task.priority as keyof typeof priorityColors].border
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    priorityColors[task.priority as keyof typeof priorityColors].icon
                  }`}></div>
                  <span className={`font-medium ${
                    priorityColors[task.priority as keyof typeof priorityColors].text
                  }`}>
                    {priorityLabels[task.priority as keyof typeof priorityLabels]} Priority
                  </span>
                </div>

                {/* Category Badge */}
                {task.category && (
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl border bg-purple-50 dark:bg-purple-900/60 border-purple-200 dark:border-purple-700">
                    <Tag size={14} className="text-purple-600 dark:text-purple-300" />
                    <span className="font-medium text-purple-700 dark:text-purple-200">{task.category}</span>
                  </div>
                )}

                {/* Due Date Badge */}
                {task.due_date && (
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl border ${
                    dueStatus.bg
                  }`}>
                    {dueStatus.status === 'overdue' ? (
                      <AlertTriangle size={14} className="text-red-600 dark:text-red-300" />
                    ) : (
                      <Calendar size={14} className={dueStatus.color} />
                    )}
                    <span className={`font-medium ${dueStatus.color}`}>
                      {dueText}
                    </span>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <Clock size={16} />
                  <span>Created {formatDate(task.created_at)}</span>
                </div>

                {/* Completion Date */}
                {task.is_completed && task.completed_at && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-300">
                    <CheckCircle size={16} />
                    <span>Completed {formatDate(task.completed_at)}</span>
                  </div>
                )}

                {/* Last Updated */}
                {task.updated_at && task.updated_at !== task.created_at && (
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                    <Clock size={16} />
                    <span>Updated {formatDate(task.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={onEdit}
                className="p-2 text-slate-400 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all duration-150 ease-out group/edit"
                title="Edit task"
              >
                <Edit size={18} className="group-hover/edit:scale-105 transition-transform duration-150" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-slate-400 dark:text-red-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all duration-150 ease-out group/delete"
                title="Delete task"
              >
                <Trash2 size={18} className="group-hover/delete:scale-105 transition-transform duration-150" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Animation */}
      {task.is_completed && (
        <div className="mt-4 pt-4 border-t border-green-100 dark:border-green-900/40">
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-300">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Task completed successfully!</span>
          </div>
        </div>
      )}

      {/* Overdue Warning */}
      {dueStatus.status === 'overdue' && !task.is_completed && (
        <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/40">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-300">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">This task is overdue! Please complete it soon.</span>
          </div>
        </div>
      )}
    </div>
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem; 