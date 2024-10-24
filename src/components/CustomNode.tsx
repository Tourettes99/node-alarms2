import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import Linkify from 'linkify-react';

interface CustomNodeProps {
  data: {
    label: string;
    content?: string;
    files?: File[];
  };
  isConnectable?: boolean;
}

function CustomNode({ data, isConnectable = true }: CustomNodeProps) {
  const [content, setContent] = useState(data.content || '');
  const [files, setFiles] = useState<File[]>(data.files || []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      className="px-4 py-2 shadow-lg rounded-md bg-white dark:bg-gray-800
        border-2 border-gray-200 dark:border-gray-700
        hover:shadow-xl transition-all duration-300
        group relative min-w-[200px]
        animate-border-glow"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3" 
        isConnectable={isConnectable}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3" 
        isConnectable={isConnectable}
      />
      
      <div className="mb-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Add your notes here..."
          className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white
            focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          rows={3}
        />
      </div>

      <div className="text-sm dark:text-gray-300">
        <Linkify options={{ target: '_blank' }}>
          {content}
        </Linkify>
      </div>

      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, index) => (
            <div key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              📎 {file.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomNode;