import React from 'react';
import { Box, Trash2 } from 'lucide-react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { HexColorPicker } from 'react-colorful';

const Toolbar: React.FC = () => {
  const { color, setColor, brushSize, setBrushSize, tool, setTool, clearCanvas } = useCanvasContext();
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  return (
    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-center gap-8 px-4">
      <div className="relative">
        <button
          className="w-8 h-8 rounded border border-gray-300"
          style={{ backgroundColor: color }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />
        {showColorPicker && (
          <div className="absolute bottom-full left-0 mb-2">
            <HexColorPicker color={color} onChange={setColor} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          className={`p-2 rounded ${tool === 'texture' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
          onClick={() => setTool('texture')}
        >
          <Box size={20} />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-red-500 transition-colors"
          onClick={clearCanvas}
          title="Clear canvas"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Size:</label>
        <input
          type="range"
          min="1"
          max="100"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-gray-600">{brushSize}px</span>
      </div>
    </div>
  );
};

export default Toolbar;