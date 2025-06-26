import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  priorityFilter: number | null;
  onPriorityFilterChange: (priority: number | null) => void;
  dateFilter: 'all' | 'today' | 'tomorrow' | 'this_week' | 'overdue';
  onDateFilterChange: (filter: 'all' | 'today' | 'tomorrow' | 'this_week' | 'overdue') => void;
  showCompleted: boolean;
  onShowCompletedChange: (show: boolean) => void;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  dateFilter,
  onDateFilterChange,
  showCompleted,
  onShowCompletedChange
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const priorityOptions = [
    { value: null, label: 'All Priorities', color: 'text-slate-600' },
    { value: 1, label: 'Low Priority', color: 'text-green-600' },
    { value: 2, label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 3, label: 'High Priority', color: 'text-red-600' }
  ];

  const dateOptions = [
    { value: 'all', label: 'All Dates', icon: '📅' },
    { value: 'today', label: 'Due Today', icon: '🔥' },
    { value: 'tomorrow', label: 'Due Tomorrow', icon: '⏰' },
    { value: 'this_week', label: 'This Week', icon: '📆' },
    { value: 'overdue', label: 'Overdue', icon: '⚠️' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, description, or category..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-200 bg-white/70 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-6 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 ${
            showAdvancedFilters || priorityFilter !== null || dateFilter !== 'all'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'bg-white/70 text-slate-600 hover:bg-white/90 hover:shadow-md border-2 border-slate-200'
          }`}
        >
          <Filter size={20} />
          <span>Filters</span>
          {showAdvancedFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="space-y-6 pt-4 border-t border-slate-200">
          {/* Priority Filter */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Priority Level</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorityOptions.map((option) => (
                <button
                  key={option.value ?? 'all'}
                  onClick={() => onPriorityFilterChange(option.value)}
                  className={`px-4 py-3 rounded-2xl font-medium transition-all duration-200 text-center ${
                    priorityFilter === option.value
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/70 text-slate-600 hover:bg-white/90 hover:shadow-md border-2 border-slate-200'
                  }`}
                >
                  <span className={option.color}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Due Date</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onDateFilterChange(option.value as any)}
                  className={`px-4 py-3 rounded-2xl font-medium transition-all duration-200 text-center ${
                    dateFilter === option.value
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-white/70 text-slate-600 hover:bg-white/90 hover:shadow-md border-2 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-xs">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Show Completed Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Show Completed Tasks</h3>
              <p className="text-xs text-slate-600">Include completed tasks in search results</p>
            </div>
            <button
              onClick={() => onShowCompletedChange(!showCompleted)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 ${
                showCompleted ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ${
                  showCompleted ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Clear All Filters */}
          {(priorityFilter !== null || dateFilter !== 'all' || searchTerm) && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  onSearchChange('');
                  onPriorityFilterChange(null);
                  onDateFilterChange('all');
                }}
                className="px-6 py-3 text-slate-600 bg-white/70 border-2 border-slate-200 rounded-2xl font-medium hover:bg-white/90 hover:border-slate-300 transition-all duration-200 flex items-center space-x-2"
              >
                <X size={16} />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters; 