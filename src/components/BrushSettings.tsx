import React from 'react';
import { useCanvasContext } from '../contexts/CanvasContext';

export const BrushSettings = () => {
  const { brushSize, setBrushSize, shapeSpacing, setShapeSpacing, tool } = useCanvasContext();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-gray-400">Size</label>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-20"
        />
        <span className="text-xs text-gray-400 w-6">{brushSize}</span>
      </div>

      {['rectangle', 'circle', 'texture'].includes(tool) && (
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-400">Spacing</label>
          <input
            type="range"
            min="1"
            max="50"
            value={shapeSpacing}
            onChange={(e) => setShapeSpacing(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-gray-400 w-6">{shapeSpacing}</span>
        </div>
      )}
    </div>
  );
};