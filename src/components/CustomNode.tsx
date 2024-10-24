import React, { useState, useCallback, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { Paperclip, Link as LinkIcon } from 'lucide-react';
import Linkify from 'linkify-react';

interface CustomNodeProps {
  data: {
    label: string;
    notes?: string;
    files?: File[];
    links?: string[];
  };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const [notes, setNotes] = useState(data.notes || '');
  const [files, setFiles] = useState<File[]>(data.files || []);
  const [links, setLinks] = useState<string[]>(data.links || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleAddLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      setLinks((prev) => [...prev, url]);
    }
  }, []);

  return (
    <div className="relative p-4 rounded-xl bg-white dark:bg-gray-800 shadow-xl min-w-[200px]
      rgb-border-glow group transition-all duration-300">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />

      <div className="absolute inset-0 rounded-xl rgb-gradient-bg opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes here..."
          className="w-full p-2 rounded bg-transparent border border-gray-300 dark:border-gray-600
            focus:border-purple-500 dark:focus:border-purple-500 outline-none resize-none
            text-gray-800 dark:text-gray-200"
          rows={3}
        />

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20
              text-purple-600 dark:text-purple-400 transition-all duration-300"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            onClick={handleAddLink}
            className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20
              text-purple-600 dark:text-purple-400 transition-all duration-300"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                📎 {file.name}
              </div>
            ))}
          </div>
        )}

        {links.length > 0 && (
          <div className="mt-2 space-y-1">
            {links.map((link, index) => (
              <div key={index} className="text-sm">
                <Linkify options={{ target: '_blank' }}>
                  {link}
                </Linkify>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomNode;