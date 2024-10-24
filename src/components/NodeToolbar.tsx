import React from 'react';
import { FileText, Clock } from 'lucide-react';

const NodeToolbar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
      <div className="flex flex-col gap-4 p-4 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg
        shadow-lg border border-white border-opacity-20">
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'node')}
          className="cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r
            from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
            transition-all duration-300 group">
            <FileText className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform" />
          </div>
        </div>
        
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'action')}
          className="cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r
            from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600
            transition-all duration-300 group">
            <Clock className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeToolbar;