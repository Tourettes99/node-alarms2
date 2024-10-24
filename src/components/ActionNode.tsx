import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface ActionNodeProps {
  isConnectable?: boolean;
}

function ActionNode({ isConnectable = true }: ActionNodeProps) {
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  const handleSchedule = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (scheduledDate && scheduledTime) {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      
      if (scheduledDateTime > now) {
        const timeoutMs = scheduledDateTime.getTime() - now.getTime();
        
        // Request notification permission if needed
        if (Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
        
        setTimeout(() => {
          const message = "Workflow executed successfully!";
          new Notification("Workflow Notification", {
            body: message,
            icon: "/workflow-icon.png"
          });
        }, timeoutMs);
      }
    }
  };

  return (
    <div className="px-4 py-2 shadow-lg rounded-md bg-gradient-to-r from-blue-500 to-purple-500
      text-white min-w-[200px] group relative animate-border-glow-action">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3" 
        isConnectable={isConnectable}
      />
      
      <div className="space-y-2">
        <h3 className="font-semibold">Schedule Action</h3>
        
        <div>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full p-1 rounded bg-white/10 border border-white/20
              focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
        
        <div>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full p-1 rounded bg-white/10 border border-white/20
              focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
        
        <button
          onClick={handleSchedule}
          className="w-full py-1 px-2 rounded bg-white/20 hover:bg-white/30
            transition-colors duration-300"
        >
          Schedule Workflow
        </button>
      </div>
    </div>
  );
}

export default ActionNode;