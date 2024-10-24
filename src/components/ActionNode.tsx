import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bell } from 'lucide-react';

interface ActionNodeProps {
  data: {
    label: string;
    scheduledTime?: Date;
  };
}

const ActionNode: React.FC<ActionNodeProps> = ({ data }) => {
  const [scheduledTime, setScheduledTime] = useState<Date | null>(data.scheduledTime || null);

  const scheduleNotification = () => {
    if (scheduledTime) {
      const now = new Date();
      const timeUntilNotification = scheduledTime.getTime() - now.getTime();

      if (timeUntilNotification > 0) {
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('Workflow Notification', {
              body: 'Your workflow has been triggered!',
              icon: '/notification-icon.png'
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Workflow Notification', {
                  body: 'Your workflow has been triggered!',
                  icon: '/notification-icon.png'
                });
              }
            });
          }
        }, timeUntilNotification);
      }
    }
  };

  return (
    <div className="relative p-4 rounded-xl bg-white dark:bg-gray-800 shadow-xl min-w-[200px]
      rgb-border-glow group transition-all duration-300">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />

      <div className="absolute inset-0 rounded-xl rgb-gradient-bg opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex flex-col items-center gap-3">
        <Bell className="w-6 h-6 text-blue-500" />
        
        <DatePicker
          selected={scheduledTime}
          onChange={(date: Date) => {
            setScheduledTime(date);
            scheduleNotification();
          }}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          className="w-full p-2 rounded bg-transparent border border-gray-300 dark:border-gray-600
            focus:border-blue-500 dark:focus:border-blue-500 outline-none
            text-gray-800 dark:text-gray-200 text-center"
          placeholderText="Select date and time"
        />
      </div>
    </div>
  );
};

export default ActionNode;