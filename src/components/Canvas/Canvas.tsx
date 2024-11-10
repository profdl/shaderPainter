import React from 'react';
import { useCanvas } from './useCanvas';
import { CanvasProps } from '../../types/canvas';

const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  } = useCanvas({ width, height });

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-300 bg-white cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default Canvas;