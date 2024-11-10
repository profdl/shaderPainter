import React, { useState } from 'react';
import { useCanvasContext } from '../contexts/CanvasContext';

export const ColorPicker = () => {
  const { color, setColor } = useCanvasContext();
  const [showPicker, setShowPicker] = useState(false);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  return (
    <div className="relative">
      <button
        className="w-7 h-7 rounded-lg border-2 border-gray-700"
        style={{ backgroundColor: color }}
        onClick={() => setShowPicker(!showPicker)}
      />
      
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 p-1.5 bg-gray-800 rounded-lg shadow-xl grid grid-cols-5 gap-1">
          {colors.map((c) => (
            <button
              key={c}
              className="w-5 h-5 rounded-lg border border-gray-700 hover:border-blue-500"
              style={{ backgroundColor: c }}
              onClick={() => {
                setColor(c);
                setShowPicker(false);
              }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-5 h-5"
          />
        </div>
      )}
    </div>
  );
};