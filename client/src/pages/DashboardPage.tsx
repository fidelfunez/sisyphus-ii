import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, LogOut, Target, BarChart3, Download, Circle, CheckCircle, Zap, Calendar, Users, Tag } from 'lucide-react';
import axios from 'axios';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import SearchAndFilters from '../components/SearchAndFilters';
import BulkOperations from '../components/BulkOperations';
import TaskAnalytics from '../components/TaskAnalytics';
import ExportImport from '../components/ExportImport';

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

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
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
      alert(errorMessage); // Replace with a proper toast notification
      throw error; // Re-throw to let the form handle it
    }
  };

  const toggleTask = async (taskId: number) => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/toggle`);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Bulk operations
  const handleBulkDelete = async (taskIds: number[]) => {
    try {
      await Promise.all(taskIds.map(id => axios.delete(`/api/tasks/${id}`)));
      setTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
    } catch (error) {
      console.error('Failed to bulk delete tasks:', error);
    }
  };

  const handleBulkComplete = async (taskIds: number[]) => {
    try {
      await Promise.all(taskIds.map(id => axios.post(`/api/tasks/${id}/toggle`)));
      setTasks(prev => prev.map(task => 
        taskIds.includes(task.id) ? { ...task, is_completed: true, completed_at: new Date().toISOString() } : task
      ));
    } catch (error) {
      console.error('Failed to bulk complete tasks:', error);
    }
  };

  const handleBulkPriorityChange = async (taskIds: number[], priority: number) => {
    try {
      await Promise.all(taskIds.map(id => axios.put(`/api/tasks/${id}`, { priority })));
      setTasks(prev => prev.map(task => 
        taskIds.includes(task.id) ? { ...task, priority } : task
      ));
    } catch (error) {
      console.error('Failed to bulk change priority:', error);
    }
  };

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
  const filteredTasks = tasks.filter(task => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-sm">
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
                <h1 className="text-2xl font-bold text-slate-900">Sisyphus II</h1>
                <p className="text-sm text-slate-600">Master your daily tasks</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-slate-500">Productivity Master</p>
              </div>
              <button
                onClick={logout}
                className="p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
              >
                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Tasks</p>
                <p className="text-4xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{tasks.length}</p>
                <p className="text-xs text-slate-500 mt-1">Your journey continues</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
                <p className="text-4xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">{pendingCount}</p>
                <p className="text-xs text-slate-500 mt-1">Ready to conquer</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Circle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Completed</p>
                <p className="text-4xl font-bold text-green-600 group-hover:text-green-700 transition-colors">{completedCount}</p>
                <p className="text-xs text-slate-500 mt-1">{completionRate}% success rate</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">High Priority</p>
                <p className="text-4xl font-bold text-red-600 group-hover:text-red-700 transition-colors">{highPriorityCount}</p>
                <p className="text-xs text-slate-500 mt-1">Urgent attention needed</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Overdue</p>
                <p className="text-4xl font-bold text-red-600 group-hover:text-red-700 transition-colors">{overdueCount}</p>
                <p className="text-xs text-slate-500 mt-1">Past due date</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-2 shadow-xl border border-white/20 mb-6">
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
                      : 'bg-white/70 text-slate-600 hover:bg-white/90 hover:shadow-md'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-bold">
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
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowBulkOperations(!showBulkOperations)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                      showBulkOperations
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                        : 'bg-white/70 text-slate-600 hover:bg-white/90 hover:shadow-md'
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
                          : 'bg-white/70 text-slate-600 hover:bg-white/90 hover:shadow-md'
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
                  <p className="text-slate-600 text-lg">Loading your tasks...</p>
                  <p className="text-slate-500 text-sm mt-2">Preparing your productivity journey</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {searchTerm || priorityFilter !== null || dateFilter !== 'all' || categoryFilter !== 'all' 
                      ? 'No tasks match your filters' 
                      : 'No tasks yet'}
                  </h3>
                  <p className="text-slate-600 text-lg max-w-md mx-auto">
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
      <footer className="bg-white/60 backdrop-blur-xl border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" fill="none" className="text-white w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 20L12 4L21 20H3Z" fill="currentColor" />
                    <path d="M9 16L12 12L15 16" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Sisyphus II</h3>
                  <p className="text-slate-600">Master your daily tasks</p>
                </div>
              </div>
              <p className="text-slate-600 max-w-md">
                Transform your productivity with our intuitive task management system. 
                Built with modern technology and designed for efficiency.
              </p>
            </div>

            {/* Quick Stats */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Your Progress</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Completion Rate</span>
                  <span className="font-semibold text-green-600">{completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Active Tasks</span>
                  <span className="font-semibold text-blue-600">{pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Overdue Tasks</span>
                  <span className="font-semibold text-red-600">{overdueCount}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setActiveTab('tasks');
                    setShowTaskForm(true);
                  }}
                  className="w-full text-left px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add New Task</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="w-full text-left px-4 py-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <BarChart3 size={16} />
                  <span>View Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className="w-full text-left px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Export Tasks</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col md:flex-row items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-500 text-sm mb-2">
                © 2025 Sisyphus II. Built with 🧡 for productivity.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xl mb-1">
                Sisyphus II was built between Roatán, Honduras 🇭🇳 and The Woodlands, Texas&nbsp;🇺🇸.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                Dedicated to the people of Honduras, to the builders rising from unlikely places, and to a freer world. ₿
              </p>
            </div>
            <div className="flex flex-col items-end mt-4 md:mt-0 md:ml-8">
              <div className="flex items-center space-x-6 mb-2">
                <span className="text-slate-400 text-sm">React + FastAPI + PostgreSQL</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 text-sm font-medium">Live</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs text-right leading-relaxed max-w-xs">
                Fidel Fúnez C. — Sovereign Builder
              </p>
              <p className="text-slate-400 text-xs text-right leading-relaxed max-w-xs">
                Independent Dev, and relentless Bitcoiner.
              </p>
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
    </div>
  );
};

export default DashboardPage; 