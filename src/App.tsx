import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import WorkflowBuilder from './components/WorkflowBuilder';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4">
        <header className="py-6 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} 
            bg-clip-text animate-gradient-x`}>
            Workflow Builder
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-all duration-300 
              ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 
              'bg-gray-200 text-gray-900 hover:bg-gray-300'}
              hover:scale-110 transform`}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </header>
        
        <main className="mt-8">
          <WorkflowBuilder isDarkMode={isDarkMode} />
        </main>
      </div>
    </div>
  );
}

export default App;