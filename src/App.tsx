import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  Connection,
  Edge,
  Node,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Sun, Moon, Trash2, Lock, Unlock, Menu } from 'lucide-react';
import Cookies from 'js-cookie';
import NodeToolbar from './components/NodeToolbar';
import CustomNode from './components/CustomNode';
import ActionNode from './components/ActionNode';
import { WorkflowData, NodeData } from './types';
import CookieConsent from './components/CookieConsent';

const nodeTypes = {
  custom: CustomNode,
  action: ActionNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [locked, setLocked] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const accepted = Cookies.get('cookiesAccepted');
    if (accepted === 'true') {
      setCookiesAccepted(true);
      loadWorkflow();
    }

    // Set initial toolbar visibility based on screen size
    const handleResize = () => {
      setShowToolbar(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadWorkflow = () => {
    const savedWorkflow = Cookies.get('workflow');
    if (savedWorkflow) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedWorkflow);
      setNodes(savedNodes);
      setEdges(savedEdges);
    }
  };

  const saveWorkflow = useCallback(() => {
    if (cookiesAccepted) {
      const workflow = { nodes, edges };
      Cookies.set('workflow', JSON.stringify(workflow), { expires: 365 });
    }
  }, [nodes, edges, cookiesAccepted]);

  useEffect(() => {
    if (cookiesAccepted) {
      saveWorkflow();
    }
  }, [nodes, edges, saveWorkflow, cookiesAccepted]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return; // Handle touch events without data

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: type === 'action' ? 'action' : 'custom',
        position,
        data: { label: type === 'action' ? 'Action Node' : 'Node' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  // Handle touch events for mobile
  const onTouchStart = useCallback((event: React.TouchEvent, nodeType: string) => {
    const touch = event.touches[0];
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    // Create ghost image
    const ghost = element.cloneNode(true) as HTMLElement;
    ghost.style.position = 'fixed';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touchLoc = e.touches[0];
      ghost.style.position = 'fixed';
      ghost.style.top = `${touchLoc.clientY - rect.height/2}px`;
      ghost.style.left = `${touchLoc.clientX - rect.width/2}px`;
      ghost.style.opacity = '0.7';
      ghost.style.zIndex = '1000';
    };
    
    const onTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (reactFlowWrapper.current) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: touch.clientX - bounds.left,
          y: touch.clientY - bounds.top,
        };
        
        const newNode = {
          id: `${nodeType}-${Date.now()}`,
          type: nodeType === 'action' ? 'action' : 'custom',
          position,
          data: { label: nodeType === 'action' ? 'Action Node' : 'Node' },
        };
        
        setNodes((nds) => nds.concat(newNode));
      }
      
      document.body.removeChild(ghost);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  }, [setNodes]);

  const deleteWorkflow = useCallback(() => {
    if (window.confirm('Are you sure you want to delete the entire workflow?')) {
      setNodes([]);
      setEdges([]);
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('node-') || key.startsWith('action-'))) {
          localStorage.removeItem(key);
        }
      }
      
      if (cookiesAccepted) {
        Cookies.remove('workflow');
      }
    }
  }, [setNodes, setEdges]);

  const toggleLock = useCallback(() => {
    setLocked(!locked);
  }, [locked]);

  return (
    <div className={`h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 
        border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setShowToolbar(!showToolbar)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? 
              <Sun className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : 
              <Moon className="w-6 h-6 text-gray-600" />
            }
          </button>
          <button
            onClick={toggleLock}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {locked ? 
              <Lock className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : 
              <Unlock className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            }
          </button>
          <button
            onClick={deleteWorkflow}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Trash2 className="w-6 h-6 text-red-500" />
          </button>
        </div>
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:flex absolute top-4 right-4 z-10 gap-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-opacity-20 backdrop-blur-lg hover:bg-opacity-30 transition-all duration-300
            dark:bg-white dark:bg-opacity-10 dark:hover:bg-opacity-20"
        >
          {darkMode ? <Sun className="w-6 h-6 text-white" /> : <Moon className="w-6 h-6" />}
        </button>
        <button
          onClick={toggleLock}
          className="p-2 rounded-full bg-opacity-20 backdrop-blur-lg hover:bg-opacity-30 transition-all duration-300
            dark:bg-white dark:bg-opacity-10 dark:hover:bg-opacity-20"
        >
          {locked ? 
            <Lock className="w-6 h-6 text-white" /> : 
            <Unlock className="w-6 h-6 text-white" />
          }
        </button>
        <button
          onClick={deleteWorkflow}
          className="p-2 rounded-full bg-red-500 bg-opacity-20 backdrop-blur-lg hover:bg-opacity-30 transition-all duration-300"
        >
          <Trash2 className="w-6 h-6 text-red-500" />
        </button>
      </div>

      {showToolbar && <NodeToolbar onTouchStart={onTouchStart} />}
      
      <div ref={reactFlowWrapper} className="h-full pt-[60px] md:pt-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={locked ? null : 'Backspace'}
          minZoom={0.2}
          maxZoom={4}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {!cookiesAccepted && (
        <CookieConsent onAccept={() => {
          setCookiesAccepted(true);
          Cookies.set('cookiesAccepted', 'true', { expires: 365 });
        }} />
      )}
    </div>
  );
}

export default App;