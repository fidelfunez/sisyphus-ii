import React, { useState } from 'react';
import { CheckSquare, Square, Trash2, CheckCircle, Zap, AlertTriangle, X } from 'lucide-react';

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

interface BulkOperationsProps {
  tasks: Task[];
  selectedTasks: number[];
  onSelectionChange: (taskIds: number[]) => void;
  onBulkDelete: (taskIds: number[]) => void;
  onBulkComplete: (taskIds: number[]) => void;
  onBulkPriorityChange: (taskIds: number[], priority: number) => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  tasks,
  selectedTasks,
  onSelectionChange,
  onBulkDelete,
  onBulkComplete,
  onBulkPriorityChange
}) => {
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const allTaskIds = tasks.map(task => task.id);
  const selectedCount = selectedTasks.length;
  const isAllSelected = selectedCount === tasks.length && tasks.length > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < tasks.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allTaskIds);
    }
  };

  const handleSelectTask = (taskId: number) => {
    if (selectedTasks.includes(taskId)) {
      onSelectionChange(selectedTasks.filter(id => id !== taskId));
    } else {
      onSelectionChange([...selectedTasks, taskId]);
    }
  };

  const handleBulkDelete = () => {
    onBulkDelete(selectedTasks);
    setShowDeleteConfirm(false);
    setShowBulkMenu(false);
    onSelectionChange([]);
  };

  const handleBulkComplete = () => {
    onBulkComplete(selectedTasks);
    setShowBulkMenu(false);
    onSelectionChange([]);
  };

  const handleBulkPriorityChange = (priority: number) => {
    onBulkPriorityChange(selectedTasks, priority);
    setShowBulkMenu(false);
  };

  if (tasks.length === 0) return null;

  return (
    <>
      {/* Bulk Selection Bar */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-white/20 dark:border-gray-700/20 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              {isAllSelected ? (
                <CheckSquare size={20} className="text-blue-600 dark:text-blue-400" />
              ) : isPartiallySelected ? (
                <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded"></div>
                </div>
              ) : (
                <Square size={20} className="text-slate-400 dark:text-slate-500" />
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </span>
            </button>
            
            {selectedCount > 0 && (
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {selectedCount > 0 && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Zap size={16} />
                <span>Bulk Actions ({selectedCount})</span>
              </button>
              
              <button
                onClick={() => onSelectionChange([])}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions Menu */}
        {showBulkMenu && selectedCount > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={handleBulkComplete}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircle size={16} />
                <span>Mark as Complete</span>
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete Selected</span>
              </button>
              
              <div className="relative">
                <select
                  onChange={(e) => handleBulkPriorityChange(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-gray-700/70 border-2 border-slate-200 dark:border-gray-600 rounded-xl font-medium text-slate-700 dark:text-white hover:border-slate-300 dark:hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Change Priority</option>
                  <option value={1}>Low Priority</option>
                  <option value={2}>Medium Priority</option>
                  <option value={3}>High Priority</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Selection Checkboxes */}
      <div className="space-y-2 mb-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center space-x-3 p-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-600/20 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200"
          >
            <button
              onClick={() => handleSelectTask(task.id)}
              className="flex-shrink-0"
            >
              {selectedTasks.includes(task.id) ? (
                <CheckSquare size={20} className="text-blue-600 dark:text-blue-400" />
              ) : (
                <Square size={20} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium text-slate-900 dark:text-white truncate ${
                task.is_completed ? 'line-through text-slate-500 dark:text-slate-400' : ''
              }`}>
                {task.title}
              </h4>
              {task.category && (
                <p className="text-xs text-slate-500 dark:text-slate-400">Category: {task.category}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.priority === 1 ? 'bg-green-100 text-green-700' :
                task.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {task.priority === 1 ? 'Low' : task.priority === 2 ? 'Medium' : 'High'}
              </span>
              
              {task.is_completed && (
                <CheckCircle size={16} className="text-green-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Tasks</h3>
                <p className="text-slate-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete {selectedCount} selected task{selectedCount !== 1 ? 's' : ''}?
            </p>
            
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 text-slate-600 bg-white/70 border-2 border-slate-200 rounded-2xl font-medium hover:bg-white/90 hover:border-slate-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Delete {selectedCount}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkOperations; 