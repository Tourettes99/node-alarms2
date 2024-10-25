import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
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
        
        summary += `\n\nStep ${index + 1}:`;
        if (notes?.trim()) summary += `\n📝 Notes: ${notes}`;
        if (files?.length) summary += `\n📎 Files: ${files.map((f: any) => f.name).join(', ')}`;
        if (links?.length) summary += `\n🔗 Links: ${links.join('\n🔗 ')}`;
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
            new Notification('Workflow Steps', {
              body: `Your workflow is ready!${getWorkflowSummary()}`,
              icon: '/notification-icon.png',
              tag: id,
              requireInteraction: true
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Workflow Steps', {
                  body: `Your workflow is ready!${getWorkflowSummary()}`,
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

  const handleDateTimeSelect = (newDate: Date) => {
    setScheduledTime(newDate);
    saveToLocalStorage(newDate, false);
    setShowDatePicker(false);
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
            
            <button
              onClick={() => setShowDatePicker(true)}
              className="w-full p-3 rounded-lg bg-transparent border border-gray-300 dark:border-gray-600
                hover:border-blue-400 dark:hover:border-blue-400 focus:border-blue-500 
                dark:focus:border-blue-500 outline-none text-gray-800 dark:text-gray-200 
                text-center transition-colors duration-300"
            >
              {scheduledTime ? format(scheduledTime, 'PPpp') : 'Tap to select date and time'}
            </button>
          </div>

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

      {showDatePicker && (
        <DateTimePicker
          initialDate={scheduledTime || new Date()}
          onSelect={handleDateTimeSelect}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

const DateTimePicker: React.FC<{
  initialDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}> = ({ initialDate, onSelect, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [view, setView] = useState<'date' | 'time'>('date');

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleDateSelect = (year: number, month: number, day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    newDate.setMonth(month);
    newDate.setDate(day);
    setSelectedDate(newDate);
    setView('time');
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    setSelectedDate(newDate);
    onSelect(newDate);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {view === 'date' ? 'Select Date' : 'Select Time'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {view === 'date' ? (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {generateCalendarDays().map((day, index) => (
                <button
                  key={index}
                  onClick={() => day && handleDateSelect(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    day
                  )}
                  disabled={!day}
                  className={`p-2 rounded-lg text-center ${
                    day
                      ? 'hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer'
                      : 'cursor-default'
                  } ${
                    day === selectedDate.getDate()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {hours.map(hour => (
                <button
                  key={hour}
                  onClick={() => handleTimeSelect(hour, selectedDate.getMinutes())}
                  className={`p-2 rounded-lg ${
                    hour === selectedDate.getHours()
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {hour.toString().padStart(2, '0')}:00
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {minutes.map(minute => (
                <button
                  key={minute}
                  onClick={() => handleTimeSelect(selectedDate.getHours(), minute)}
                  className={`p-2 rounded-lg ${
                    minute === selectedDate.getMinutes()
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  :{minute.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionNode;