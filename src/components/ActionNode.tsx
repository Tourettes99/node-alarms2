import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bell, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useReactFlow } from 'reactflow';

interface ActionNodeProps {
  id: string;
  data: {
    label: string;
    scheduledTime?: Date;
  };
}

const ActionNode: React.FC<ActionNodeProps> = ({ id, data }) => {
  const [scheduledTime, setScheduledTime] = useState<Date | null>(data.scheduledTime || null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { getNodes, getEdges } = useReactFlow();

  useEffect(() => {
    const savedData = localStorage.getItem(`action-${id}`);
    if (savedData) {
      const { scheduledTime: savedTime, isScheduled: savedScheduled } = JSON.parse(savedData);
      setScheduledTime(savedTime ? new Date(savedTime) : null);
      setIsScheduled(savedScheduled || false);
    }
  }, [id]);

  const saveToLocalStorage = (time: Date | null, scheduled: boolean) => {
    localStorage.setItem(`action-${id}`, JSON.stringify({
      scheduledTime: time,
      isScheduled: scheduled
    }));
  };

  const getConnectedNodes = () => {
    const nodes = getNodes();
    const edges = getEdges();
    const connectedNodes = [];
    let currentNodeId = id;

    while (true) {
      const incomingEdge = edges.find(edge => edge.target === currentNodeId);
      if (!incomingEdge) break;
      
      const sourceNode = nodes.find(node => node.id === incomingEdge.source);
      if (!sourceNode) break;

      connectedNodes.unshift(sourceNode);
      currentNodeId = sourceNode.id;
    }

    return connectedNodes;
  };

  const getWorkflowSummary = () => {
    const connectedNodes = getConnectedNodes();
    let summary = '';

    connectedNodes.forEach((node, index) => {
      const nodeData = localStorage.getItem(`node-${node.id}`);
      if (nodeData) {
        const { notes, files, links } = JSON.parse(nodeData);
        
        summary += `\n\nNode ${index + 1}:`;
        if (notes) summary += `\nNotes: ${notes}`;
        if (files?.length) summary += `\nFiles: ${files.map((f: any) => f.name).join(', ')}`;
        if (links?.length) summary += `\nLinks: ${links.join(', ')}`;
      }
    });

    return summary || '\n\nNo connected nodes found.';
  };

  const scheduleNotification = () => {
    if (scheduledTime) {
      const now = new Date();
      const timeUntilNotification = scheduledTime.getTime() - now.getTime();

      if (timeUntilNotification > 0) {
        setIsScheduled(true);
        saveToLocalStorage(scheduledTime, true);

        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('Workflow Notification', {
              body: `Your workflow has been triggered!${getWorkflowSummary()}`,
              icon: '/notification-icon.png',
              tag: id,
              requireInteraction: true
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Workflow Notification', {
                  body: `Your workflow has been triggered!${getWorkflowSummary()}`,
                  icon: '/notification-icon.png',
                  tag: id,
                  requireInteraction: true
                });
              }
            });
          }
          setIsScheduled(false);
          saveToLocalStorage(scheduledTime, false);
        }, timeUntilNotification);
      }
    }
  };

  return (
    <div className="relative p-4 rounded-xl bg-white dark:bg-gray-800 shadow-xl min-w-[280px]
      rgb-border-glow group transition-all duration-300">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />

      <div className="absolute inset-0 rounded-xl rgb-gradient-bg opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Schedule Action</span>
        </div>

        <div className="w-full space-y-3">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Select Date & Time</span>
            </div>
            <DatePicker
              selected={scheduledTime}
              onChange={(date: Date) => {
                setScheduledTime(date);
                saveToLocalStorage(date, false);
                setIsPickerOpen(false);
              }}
              onCalendarOpen={() => setIsPickerOpen(true)}
              onCalendarClose={() => setIsPickerOpen(false)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full p-3 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600
                focus:border-blue-500 dark:focus:border-blue-500 outline-none
                text-gray-800 dark:text-gray-200 text-center cursor-pointer hover:border-blue-400
                transition-colors duration-300"
              placeholderText="Click to select date and time"
              calendarClassName="date-picker-calendar"
              popperClassName="date-picker-popper"
              popperModifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ]}
              open={isPickerOpen}
            />
          </div>

          {scheduledTime && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Scheduled for: {format(scheduledTime, 'PPpp')}
            </div>
          )}

          <button
            onClick={scheduleNotification}
            disabled={!scheduledTime || isScheduled}
            className={`w-full px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2
              ${isScheduled 
                ? 'bg-green-500 text-white cursor-not-allowed'
                : scheduledTime
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
              }`}
          >
            <Clock className="w-4 h-4" />
            {isScheduled ? 'Scheduled' : 'Schedule Notification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionNode;