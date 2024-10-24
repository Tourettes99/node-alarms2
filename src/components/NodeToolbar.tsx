import React from 'react';
import { FileText, Bell } from 'lucide-react';

interface NodeToolbarProps {
  isDarkMode: boolean;
  isLocked: boolean;
}

function NodeToolbar({ isDarkMode, isLocked }: NodeToolbarProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    if (isLocked) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`absolute left-4 top-4 z-10 p-2 rounded-lg shadow-lg
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
      transition-all duration-300`}>
      <div className="flex gap-2">
        <div
          draggable={!isLocked}
          onDragStart={(e) => onDragStart(e, 'custom')}
          className={`flex items-center gap-2 p-2 rounded cursor-grab
            ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            transition-colors duration-300
            ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FileText size={20} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Note Node</span>
        </div>
        
        <div
          draggable={!isLocked}
          onDragStart={(e) => onDragStart(e, 'action')}
          className={`flex items-center gap-2 p-2 rounded cursor-grab
            ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            transition-colors duration-300
            ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Bell size={20} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
          <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Action Node</span>
        </div>
      </div>
    </div>
  );
}

export default NodeToolbar;