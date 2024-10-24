import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  Connection,
  Edge,
  Node,
  addEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Sun, Moon, Trash2, Lock, Unlock } from 'lucide-react';
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
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const accepted = Cookies.get('cookiesAccepted');
    if (accepted === 'true') {
      setCookiesAccepted(true);
      loadWorkflow();
    }
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

  const deleteWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    if (cookiesAccepted) {
      Cookies.remove('workflow');
    }
  }, [setNodes, setEdges]);

  const toggleLock = useCallback(() => {
    setLocked(!locked);
  }, [locked]);

  return (
    <div className={`h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="absolute top-4 right-4 z-10 flex gap-4">
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

      <NodeToolbar />
      
      <div ref={reactFlowWrapper} className="h-full">
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
        >
          <Background />
          <Controls />
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