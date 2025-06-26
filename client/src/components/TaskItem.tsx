import React from 'react';
import { CheckCircle, Circle, Trash2, Edit3, Clock, Calendar, Zap, Tag, AlertTriangle } from 'lucide-react';

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
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const priorityColors = {
    1: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: 'bg-green-500' },
    2: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'bg-yellow-500' },
    3: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: 'bg-red-500' }
  };

  const priorityLabels = {
    1: 'Low',
    2: 'Medium', 
    3: 'High'
  };

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
    if (!dueDate) return { status: 'no_due_date', color: 'text-slate-500', bg: 'bg-slate-100' };
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'overdue', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (diffDays === 0) {
      return { status: 'due_today', color: 'text-orange-600', bg: 'bg-orange-100' };
    } else if (diffDays === 1) {
      return { status: 'due_tomorrow', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else if (diffDays <= 7) {
      return { status: 'due_soon', color: 'text-blue-600', bg: 'bg-blue-100' };
    } else {
      return { status: 'due_later', color: 'text-green-600', bg: 'bg-green-100' };
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

  const dueStatus = getDueDateStatus(task.due_date);
  const dueText = getDueDateText(task.due_date);

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group ${
      task.is_completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start space-x-4">
        {/* Enhanced Toggle Button */}
        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${
            task.is_completed
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'
              : 'bg-white/70 border-2 border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500'
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
              <h3 className={`text-lg font-semibold text-slate-900 mb-2 transition-all duration-200 ${
                task.is_completed ? 'line-through text-slate-500' : ''
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className={`text-slate-600 mb-4 line-clamp-2 transition-all duration-200 ${
                  task.is_completed ? 'line-through text-slate-400' : ''
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
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl border bg-purple-50 border-purple-200">
                    <Tag size={14} className="text-purple-600" />
                    <span className="font-medium text-purple-700">{task.category}</span>
                  </div>
                )}

                {/* Due Date Badge */}
                {task.due_date && (
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-2xl border ${
                    dueStatus.bg
                  }`}>
                    {dueStatus.status === 'overdue' ? (
                      <AlertTriangle size={14} className="text-red-600" />
                    ) : (
                      <Calendar size={14} className={dueStatus.color} />
                    )}
                    <span className={`font-medium ${dueStatus.color}`}>
                      {dueText}
                    </span>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center space-x-2 text-slate-500">
                  <Clock size={16} />
                  <span>Created {formatDate(task.created_at)}</span>
                </div>

                {/* Completion Date */}
                {task.is_completed && task.completed_at && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle size={16} />
                    <span>Completed {formatDate(task.completed_at)}</span>
                  </div>
                )}

                {/* Last Updated */}
                {task.updated_at && task.updated_at !== task.created_at && (
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Clock size={16} />
                    <span>Updated {formatDate(task.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={onDelete}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group/delete"
                title="Delete task"
              >
                <Trash2 size={18} className="group-hover/delete:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Animation */}
      {task.is_completed && (
        <div className="mt-4 pt-4 border-t border-green-100">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Task completed successfully!</span>
          </div>
        </div>
      )}

      {/* Overdue Warning */}
      {dueStatus.status === 'overdue' && !task.is_completed && (
        <div className="mt-4 pt-4 border-t border-red-100">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">This task is overdue! Please complete it soon.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem; 