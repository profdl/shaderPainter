import React from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import { CanvasProvider } from './contexts/CanvasContext';

function App() {
  return (
    <CanvasProvider>
      <div className="h-screen flex flex-col">
        <div className="flex-1 flex">
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <Canvas width={800} height={600} />
          </div>
          <PropertiesPanel />
        </div>
        <Toolbar />
      </div>
    </CanvasProvider>
  );
}

export default App;