import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, Calendar, Tag, CheckCircle, Edit } from 'lucide-react';

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

interface TaskFormProps {
  onSubmit: (taskData: { title: string; description?: string; priority: number; category?: string; due_date?: string }) => void;
  onCancel: () => void;
  task?: Task; // Optional task for editing mode
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, task }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(2);
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Predefined categories for quick selection
  const predefinedCategories = [
    'Work', 'Personal', 'Health', 'Finance', 'Learning', 
    'Home', 'Shopping', 'Travel', 'Family', 'Hobbies'
  ];

  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategory(task.category || '');
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category: category.trim() || undefined,
        due_date: dueDate || undefined
      });
      // Form will be closed by parent component on success
    } catch (error: any) {
      console.error('Failed to save task:', error);
      // Don't close the form on error, let user try again
      // The error is already handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 1, label: 'Low', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { value: 2, label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { value: 3, label: 'High', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  ];

  const isEditing = !!task;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              isEditing 
                ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}>
              {isEditing ? <Edit className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-slate-600">
                {isEditing ? 'Update your task details' : 'Add a new task to your productivity journey'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all duration-200 group"
          >
            <X size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Title */}
          <div className="space-y-3">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-900">
              Task Title *
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                className={`w-full px-4 py-4 text-lg border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  errors.title 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-slate-200 bg-white/70 focus:border-blue-500 hover:border-slate-300'
                }`}
                placeholder="What needs to be done?"
                disabled={isSubmitting}
              />
              {errors.title && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">{errors.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Task Description */}
          <div className="space-y-3">
            <label htmlFor="description" className="block text-sm font-semibold text-slate-900">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-4 text-lg border-2 border-slate-200 bg-white/70 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 resize-none"
              placeholder="Add more details about this task..."
              disabled={isSubmitting}
            />
          </div>

          {/* Category and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                Category (Optional)
              </label>
              <div className="space-y-3">
                {/* Custom Category Input */}
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-200 bg-white/70 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300"
                    placeholder="Enter category..."
                    disabled={isSubmitting}
                  />
                </div>
                
                {/* Predefined Categories */}
                <div className="flex flex-wrap gap-2">
                  {predefinedCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        category === cat
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      disabled={isSubmitting}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Due Date Selection */}
            <div className="space-y-3">
              <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-900">
                Due Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-200 bg-white/70 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300"
                  disabled={isSubmitting}
                />
              </div>
              {dueDate && (
                <p className="text-xs text-slate-500">
                  Due on {new Date(dueDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center group ${
                    priority === option.value
                      ? `${option.bg} ${option.border} ${option.color} shadow-lg scale-105`
                      : 'bg-white/70 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white/90'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      priority === option.value ? option.color.replace('text-', 'bg-') : 'bg-slate-300'
                    }`}></div>
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-xs opacity-75">
                      {option.value === 1 && 'Take your time'}
                      {option.value === 2 && 'Standard priority'}
                      {option.value === 3 && 'Urgent attention'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-8 py-3 text-slate-600 bg-white/70 border-2 border-slate-200 rounded-2xl font-medium hover:bg-white/90 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-500/20 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className={`px-8 py-3 rounded-2xl font-medium focus:outline-none focus:ring-4 transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                isEditing
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 focus:ring-orange-500/20'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  {isEditing ? <Edit size={20} /> : <CheckCircle size={20} />}
                  <span>{isEditing ? 'Update Task' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm; 