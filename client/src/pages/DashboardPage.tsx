import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, LogOut, Target, BarChart3, Download, Circle, CheckCircle, Zap, Calendar, Users, Tag, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import SearchAndFilters from '../components/SearchAndFilters';
import BulkOperations from '../components/BulkOperations';
import TaskAnalytics from '../components/TaskAnalytics';
import ExportImport from '../components/ExportImport';
import { toast } from 'react-hot-toast';

// Set the base URL for all API requests based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_BASE_URL;

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

type TabType = 'tasks' | 'analytics' | 'export';

const getPreferredTheme = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'overdue'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Bulk operations states
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [showBulkOperations, setShowBulkOperations] = useState(false);

  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    logout();
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/tasks/');
      setTasks(response.data.tasks || []);
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Authentication error:', error.response.status);
        window.location.href = '/login';
        return;
      }
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/tasks/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const addTask = async (taskData: { title: string; description?: string; priority: number; category?: string; due_date?: string }) => {
    try {
      console.log('Creating task with data:', taskData);
      console.log('API Base URL:', API_BASE_URL);
      
      const response = await axios.post('/api/tasks/', taskData);
      console.log('Task creation response:', response.data);
      
      setTasks(prev => [...prev, response.data]);
      setShowTaskForm(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to add task:', error);
      console.error('Error response:', error.response);
      // Show error to user (you can add a toast notification here)
      const errorMessage = error.response?.data?.detail || 'Failed to create task. Please try again.';
      toast.error(errorMessage);
      throw error; // Re-throw to let the form handle it
    }
  };

  const editTask = async (taskData: { title: string; description?: string; priority: number; category?: string; due_date?: string }) => {
    if (!editingTask) return;
    
    try {
      console.log('Updating task with data:', taskData);
      console.log('API Base URL:', API_BASE_URL);
      
      const response = await axios.put(`/api/tasks/${editingTask.id}`, taskData);
      console.log('Task update response:', response.data);
      
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? response.data : task
      ));
      setEditingTask(null);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to update task:', error);
      console.error('Error response:', error.response);
      // Show error to user (you can add a toast notification here)
      const errorMessage = error.response?.data?.detail || 'Failed to update task. Please try again.';
      toast.error(errorMessage);
      throw error; // Re-throw to let the form handle it
    }
  };

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const toggleTask = useCallback(async (taskId: number) => {
    // Use functional state update to get current tasks
    setTasks(prevTasks => {
      const currentTask = prevTasks.find(task => task.id === taskId);
      if (!currentTask) return prevTasks;

      // Optimistic update - immediately update the UI
      const optimisticTask = {
        ...currentTask,
        is_completed: !currentTask.is_completed,
        completed_at: !currentTask.is_completed ? new Date().toISOString() : null
      };

      // Update UI immediately
      const updatedTasks = prevTasks.map(task => 
        task.id === taskId ? optimisticTask : task
      );

      // Make the API call in the background
      axios.post(`/api/tasks/${taskId}/toggle`)
        .then(response => {
          // Update with the actual server response
          setTasks(prev => prev.map(task => 
            task.id === taskId ? response.data : task
          ));
        })
        .catch(error => {
          console.error('Failed to toggle task:', error);
          
          // Revert the optimistic update on error
          setTasks(prev => prev.map(task => 
            task.id === taskId ? currentTask : task
          ));
          
          // Show error to user (you can add a toast notification here)
          toast.error('Failed to update task. Please try again.');
        });

      return updatedTasks;
    });
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, []);

  // Bulk operations
  const handleBulkDelete = useCallback(async (taskIds: number[]) => {
    // Optimistic update - immediately remove tasks from UI
    setTasks(prevTasks => {
      const tasksToDelete = prevTasks.filter(task => taskIds.includes(task.id));
      const updatedTasks = prevTasks.filter(task => !taskIds.includes(task.id));

      // Make API calls in the background
      Promise.all(taskIds.map(id => axios.delete(`/api/tasks/${id}`)))
        .catch(error => {
          console.error('Failed to bulk delete tasks:', error);
          
          // Revert optimistic update on error
          setTasks(prev => [...prev, ...tasksToDelete]);
          toast.error('Failed to delete some tasks. Please try again.');
        });

      return updatedTasks;
    });
  }, []);

  const handleBulkComplete = useCallback(async (taskIds: number[]) => {
    // Optimistic update - immediately mark tasks as completed
    setTasks(prevTasks => {
      const tasksToUpdate = prevTasks.filter(task => taskIds.includes(task.id));
      const updatedTasks = prevTasks.map(task => 
        taskIds.includes(task.id) ? { ...task, is_completed: true, completed_at: new Date().toISOString() } : task
      );

      // Make API calls in the background
      Promise.all(taskIds.map(id => axios.post(`/api/tasks/${id}/toggle`)))
        .catch(error => {
          console.error('Failed to bulk complete tasks:', error);
          
          // Revert optimistic update on error
          setTasks(prev => prev.map(task => {
            const originalTask = tasksToUpdate.find(t => t.id === task.id);
            return originalTask ? originalTask : task;
          }));
          toast.error('Failed to complete some tasks. Please try again.');
        });

      return updatedTasks;
    });
  }, []);

  const handleBulkPriorityChange = useCallback(async (taskIds: number[], priority: number) => {
    // Optimistic update - immediately update priority
    setTasks(prevTasks => {
      const tasksToUpdate = prevTasks.filter(task => taskIds.includes(task.id));
      const updatedTasks = prevTasks.map(task => 
        taskIds.includes(task.id) ? { ...task, priority } : task
      );

      // Make API calls in the background
      Promise.all(taskIds.map(id => axios.put(`/api/tasks/${id}`, { priority })))
        .catch(error => {
          console.error('Failed to bulk change priority:', error);
          
          // Revert optimistic update on error
          setTasks(prev => prev.map(task => {
            const originalTask = tasksToUpdate.find(t => t.id === task.id);
            return originalTask ? originalTask : task;
          }));
          toast.error('Failed to update priority for some tasks. Please try again.');
        });

      return updatedTasks;
    });
  }, []);

  // Import tasks
  const handleImportTasks = async (importedTasks: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const promises = importedTasks.map(task => axios.post('/api/tasks/', task));
      const responses = await Promise.all(promises);
      const newTasks = responses.map(response => response.data);
      setTasks(prev => [...prev, ...newTasks]);
      fetchCategories();
    } catch (error) {
      console.error('Failed to import tasks:', error);
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower)) ||
          (task.category && task.category.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Completion filter
      if (!showCompleted && task.is_completed) return false;

      // Priority filter
      if (priorityFilter !== null && task.priority !== priorityFilter) return false;

      // Category filter
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'uncategorized' && task.category) return false;
        if (categoryFilter !== 'uncategorized' && task.category !== categoryFilter) return false;
      }

      // Date filter
      if (dateFilter !== 'all' && task.due_date) {
        const today = new Date();
        const due = new Date(task.due_date);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today':
            if (diffDays !== 0) return false;
            break;
          case 'tomorrow':
            if (diffDays !== 1) return false;
            break;
          case 'this_week':
            if (diffDays < 0 || diffDays > 7) return false;
            break;
          case 'overdue':
            if (diffDays >= 0) return false;
            break;
        }
      }

      return true;
    });
  }, [tasks, searchTerm, showCompleted, priorityFilter, categoryFilter, dateFilter]);

  const completedCount = tasks.filter(task => task.is_completed).length;
  const pendingCount = tasks.filter(task => !task.is_completed).length;
  const highPriorityCount = tasks.filter(task => !task.is_completed && task.priority === 3).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const overdueCount = tasks.filter(task => {
    if (task.is_completed || !task.due_date) return false;
    const today = new Date();
    const due = new Date(task.due_date);
    return due < today;
  }).length;

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: Target, count: filteredTasks.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'export', label: 'Export/Import', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative">
      {/* Logout Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-700 dark:text-slate-200 text-lg font-medium">Signing out...</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Thank you for using Sisyphus II</p>
          </div>
        </div>
      )}
      
      {/* Enhanced Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" fill="none" className="text-white w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 20L12 4L21 20H3Z" fill="currentColor" />
                  <path d="M9 16L12 12L15 16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sisyphus II</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">Master your daily tasks</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={handleThemeToggle}
                className="p-3 text-slate-600 dark:text-yellow-300 hover:text-slate-900 dark:hover:text-yellow-400 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} className="transition-transform" /> : <Moon size={20} className="transition-transform" />}
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-300">Productivity Master</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Total Tasks</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tasks.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your journey continues</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Pending</p>
                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">{pendingCount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready to conquer</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Circle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Completed</p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">{completedCount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{completionRate}% success rate</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">High Priority</p>
                <p className="text-4xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">{highPriorityCount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Urgent attention needed</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Overdue</p>
                <p className="text-4xl font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">{overdueCount}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Past due date</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-2 shadow-xl border border-white/20 dark:border-gray-700/20 mb-6">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 px-6 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/70 dark:bg-gray-700/70 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:shadow-md'
                  } ${tab.id === 'export' ? 'hidden md:flex' : ''}`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-1 bg-white/20 dark:bg-gray-600/20 rounded-full text-xs font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tasks' && (
          <>
            {/* Search and Filters */}
            <SearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              showCompleted={showCompleted}
              onShowCompletedChange={setShowCompleted}
            />

            {/* Bulk Operations */}
            {showBulkOperations && (
              <BulkOperations
                tasks={filteredTasks}
                selectedTasks={selectedTasks}
                onSelectionChange={setSelectedTasks}
                onBulkDelete={handleBulkDelete}
                onBulkComplete={handleBulkComplete}
                onBulkPriorityChange={handleBulkPriorityChange}
              />
            )}

            {/* Task Controls */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowBulkOperations(!showBulkOperations)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                      showBulkOperations
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                        : 'bg-white/70 dark:bg-gray-700/70 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:shadow-md'
                    }`}
                  >
                    <Users size={18} />
                    <span>Bulk Operations</span>
                  </button>
                  
                  {/* Category Filter */}
                  <div className="relative">
                    <button
                      onClick={() => setCategoryFilter(categoryFilter === 'all' ? 'uncategorized' : 'all')}
                      className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                        categoryFilter !== 'all'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                          : 'bg-white/70 dark:bg-gray-700/70 text-slate-600 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:shadow-md'
                      }`}
                    >
                      <Tag size={18} />
                      <span>
                        {categoryFilter === 'all' ? 'All Categories' : 
                         categoryFilter === 'uncategorized' ? 'Uncategorized' : categoryFilter}
                      </span>
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus size={20} />
                  <span>Add New Task</span>
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-slate-600 dark:text-slate-300 text-lg">Loading your tasks...</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Preparing your productivity journey</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {searchTerm || priorityFilter !== null || dateFilter !== 'all' || categoryFilter !== 'all' 
                      ? 'No tasks match your filters' 
                      : 'No tasks yet'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-lg max-w-md mx-auto">
                    {searchTerm || priorityFilter !== null || dateFilter !== 'all' || categoryFilter !== 'all'
                      ? 'Try adjusting your search or filters to see more tasks.'
                      : 'Start your productivity journey by creating your first task!'
                    }
                  </p>
                  {!searchTerm && priorityFilter === null && dateFilter === 'all' && categoryFilter === 'all' && (
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                    >
                      Create Your First Task
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredTasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onEdit={() => handleEditTask(task)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <TaskAnalytics tasks={tasks} />
        )}

        {activeTab === 'export' && (
          <ExportImport tasks={tasks} onImportTasks={handleImportTasks} />
        )}
      </main>

      {/* Beautiful Footer */}
      <footer className="bg-white/60 dark:bg-gray-900/80 backdrop-blur-xl border-t border-white/20 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Brand Section */}
            <div className="col-span-1 sm:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" fill="none" className="text-white w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 20L12 4L21 20H3Z" fill="currentColor" />
                    <path d="M9 16L12 12L15 16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Sisyphus II</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">Master your daily tasks</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-md">
                Transform your productivity with our intuitive task management system. 
                Built with modern technology and designed for efficiency.
              </p>
            </div>

            {/* Quick Stats */}
            <div>
              <h4 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-3 md:mb-4">Your Progress</h4>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Completion Rate</span>
                  <span className="font-semibold text-green-600 dark:text-green-300 text-sm">{completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Active Tasks</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-300 text-sm">{pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Overdue Tasks</span>
                  <span className="font-semibold text-red-600 dark:text-red-300 text-sm">{overdueCount}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-3 md:mb-4">Quick Actions</h4>
              <div className="space-y-2 md:space-y-3">
                <button
                  onClick={() => {
                    setActiveTab('tasks');
                    setShowTaskForm(true);
                  }}
                  className="w-full text-left px-3 md:px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all duration-200 flex items-center space-x-2 text-sm"
                >
                  <Plus size={14} className="md:w-4 md:h-4" />
                  <span>Add New Task</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="w-full text-left px-3 md:px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/40 rounded-xl transition-all duration-200 flex items-center space-x-2 text-sm"
                >
                  <BarChart3 size={14} className="md:w-4 md:h-4" />
                  <span>View Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className="w-full text-left px-3 md:px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all duration-200 flex items-center space-x-2 text-sm"
                >
                  <Download size={14} className="md:w-4 md:h-4" />
                  <span>Export Tasks</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200 dark:border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 flex flex-col lg:flex-row items-start justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 space-y-2">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                © 2025 Sisyphus II. Built with 🧡 for productivity.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed max-w-xl">
                Sisyphus II was built between Roatán, Honduras 🇭🇳 and The Woodlands, Texas&nbsp;🇺🇸.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed max-w-2xl">
                Dedicated to the people of Honduras, to the builders rising from unlikely places, and to a freer world. ₿
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end lg:ml-8 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6">
                <span className="text-slate-400 dark:text-slate-500 text-sm">React + FastAPI + PostgreSQL</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-600 dark:text-green-300 text-sm font-medium">Live</span>
                </div>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed max-w-xs">
                  Fidel Fúnez C. — Sovereign Builder
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed max-w-xs">
                  Independent Dev, and relentless Bitcoiner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={addTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {/* Edit Task Form Modal */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={editTask}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage; 