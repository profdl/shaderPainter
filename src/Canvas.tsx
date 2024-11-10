import React, { useRef, useEffect, useState } from 'react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { TextureGenerator } from '../utils/textureGenerator';

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    color,
    brushSize,
    tool,
    shaderParams
  } = useCanvasContext();

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const textureGeneratorRef = useRef<TextureGenerator | null>(null);
  const spacing = brushSize * 0.5; // Adjust this value to control spacing

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    offscreenCanvasRef.current = document.createElement('canvas');
    offscreenCanvasRef.current.width = width;
    offscreenCanvasRef.current.height = height;
    const offscreenCtx = offscreenCanvasRef.current.getContext('2d');
    if (!offscreenCtx) return;
    
    offscreenCtx.fillStyle = 'white';
    offscreenCtx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    textureGeneratorRef.current = new TextureGenerator(brushSize * 2);
  }, [width, height]);

  useEffect(() => {
    if (textureGeneratorRef.current) {
      textureGeneratorRef.current = new TextureGenerator(brushSize * 2);
    }
  }, [brushSize]);

  const getTexturePattern = () => {
    if (!textureGeneratorRef.current) return null;

    const imageData = textureGeneratorRef.current.generateTexture(color, shaderParams);

    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = brushSize * 2;
    patternCanvas.height = brushSize * 2;
    const patternCtx = patternCanvas.getContext('2d');
    if (!patternCtx) return null;

    patternCtx.putImageData(imageData, 0, 0);
    return patternCanvas;
  };

  const drawTexture = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const pattern = getTexturePattern();
    if (!pattern) return;

    ctx.drawImage(
      pattern,
      x - brushSize,
      y - brushSize,
      brushSize * 2,
      brushSize * 2
    );
  };

  const drawTextureStroke = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < spacing) {
      drawTexture(ctx, endX, endY);
      return;
    }

    const steps = Math.floor(distance / spacing);
    const xStep = dx / steps;
    const yStep = dy / steps;

    for (let i = 1; i <= steps; i++) {
      const x = startX + xStep * i;
      const y = startY + yStep * i;
      drawTexture(ctx, x, y);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !offscreenCanvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastPoint({ x, y });

    const ctx = offscreenCanvasRef.current.getContext('2d');
    if (!ctx) return;

    if (tool === 'texture') {
      drawTexture(ctx, x, y);
      
      const displayCtx = canvasRef.current.getContext('2d');
      if (displayCtx) {
        displayCtx.clearRect(0, 0, width, height);
        displayCtx.drawImage(offscreenCanvasRef.current, 0, 0);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !offscreenCanvasRef.current || !lastPoint) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = offscreenCanvasRef.current.getContext('2d');
    if (!ctx) return;

    if (tool === 'texture') {
      drawTextureStroke(ctx, lastPoint.x, lastPoint.y, x, y);
      
      const displayCtx = canvasRef.current.getContext('2d');
      if (displayCtx) {
        displayCtx.clearRect(0, 0, width, height);
        displayCtx.drawImage(offscreenCanvasRef.current, 0, 0);
      }
    }

    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-300 bg-white cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

export default Canvas;