import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, AlertTriangle, CheckCircle, X } from 'lucide-react';

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

interface ExportImportProps {
  tasks: Task[];
  onImportTasks: (tasks: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => void;
}

const ExportImport: React.FC<ExportImportProps> = ({ tasks, onImportTasks }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToJSON = () => {
    const exportData = tasks.map(task => ({
      title: task.title,
      description: task.description,
      is_completed: task.is_completed,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date,
      completed_at: task.completed_at
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Description', 'Completed', 'Priority', 'Category', 'Due Date', 'Completed At'];
    const csvData = tasks.map(task => [
      task.title,
      task.description || '',
      task.is_completed ? 'Yes' : 'No',
      task.priority === 1 ? 'Low' : task.priority === 2 ? 'Medium' : 'High',
      task.category || '',
      task.due_date || '',
      task.completed_at || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importData: any[];

        if (file.name.endsWith('.json')) {
          importData = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          importData = parseCSV(content);
        } else {
          throw new Error('Unsupported file format. Please use JSON or CSV files.');
        }

        // Validate and transform the data
        const validatedTasks = importData.map((item, index) => {
          if (!item.title) {
            throw new Error(`Task at index ${index} is missing a title`);
          }

          return {
            title: item.title,
            description: item.description || null,
            is_completed: Boolean(item.is_completed),
            priority: item.priority === 'Low' ? 1 : item.priority === 'Medium' ? 2 : item.priority === 'High' ? 3 : Number(item.priority) || 2,
            category: item.category || null,
            due_date: item.due_date || null,
            completed_at: item.completed_at || null
          };
        });

        onImportTasks(validatedTasks);
        setImportSuccess(`Successfully imported ${validatedTasks.length} tasks!`);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Failed to import file');
      }
    };

    reader.readAsText(file);
  };

  const parseCSV = (csvContent: string): any[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  };

  return (
    <>
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Export & Import</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Backup and restore your tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Export Tasks</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Download your tasks in JSON or CSV format for backup or analysis.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={exportToJSON}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FileText size={18} />
                <span>Export as JSON</span>
              </button>
              
              <button
                onClick={exportToCSV}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FileSpreadsheet size={18} />
                <span>Export as CSV</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Import Tasks</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Import tasks from a previously exported JSON or CSV file.
            </p>
            
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Upload size={18} />
              <span>Import Tasks</span>
            </button>
          </div>
        </div>

        {/* Export Summary */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tasks.length}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Tasks</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tasks.filter(t => t.is_completed).length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {tasks.filter(t => !t.is_completed).length}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Import Tasks</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Select a JSON or CSV file</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                  setImportSuccess(null);
                }}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error/Success Messages */}
            {importError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center space-x-3">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 text-sm">{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center space-x-3">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 text-sm">{importSuccess}</span>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-2xl p-6 text-center hover:border-slate-400 dark:hover:border-gray-500 transition-colors duration-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 flex flex-col items-center justify-center space-y-3 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors duration-200"
                >
                  <Upload size={32} className="text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="font-medium">Click to select file</p>
                    <p className="text-sm">or drag and drop</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports JSON and CSV files</p>
                  </div>
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p><strong>Supported formats:</strong> JSON, CSV</p>
                <p><strong>Required fields:</strong> title (all other fields are optional)</p>
                <p><strong>Note:</strong> Imported tasks will be added to your existing tasks</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportImport; 