import React from 'react';
import { FileText, Clock } from 'lucide-react';

interface NodeToolbarProps {
  onTouchStart: (event: React.TouchEvent, nodeType: string) => void;
}

const NodeToolbar: React.FC<NodeToolbarProps> = ({ onTouchStart }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="fixed md:absolute left-4 top-[70px] md:top-1/2 md:-translate-y-1/2 z-10">
      <div className="flex md:flex-col gap-4 p-4 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg
        shadow-lg border border-white border-opacity-20">
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'node')}
          onTouchStart={(e) => onTouchStart(e, 'node')}
          className="cursor-grab active:cursor-grabbing touch-none"
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
          onTouchStart={(e) => onTouchStart(e, 'action')}
          className="cursor-grab active:cursor-grabbing touch-none"
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