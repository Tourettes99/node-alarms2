import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeToolbar from './NodeToolbar';
import CustomNode from './CustomNode';
import ActionNode from './ActionNode';
import { Lock, Unlock } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
  action: ActionNode,
};

function WorkflowBuilder({ isDarkMode }: { isDarkMode: boolean }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLocked, setIsLocked] = useState(false);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (isLocked) return;

      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type === 'action' ? 'Action Node' : 'Note Node' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, isLocked],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="relative h-[80vh] rounded-lg overflow-hidden border-2 border-opacity-50
      shadow-xl transition-all duration-300"
      style={{
        borderColor: isDarkMode ? '#2d3748' : '#e2e8f0',
        backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
      }}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`p-2 rounded-full transition-all duration-300 
            ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'}
            hover:scale-110 transform`}
        >
          {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
        </button>
      </div>
      
      <NodeToolbar isDarkMode={isDarkMode} isLocked={isLocked} />
      
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
        className={`${isDarkMode ? 'react-flow-dark' : ''}`}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default WorkflowBuilder;