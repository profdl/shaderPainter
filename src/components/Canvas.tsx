import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { TextureGenerator } from '../utils/textureGenerator';
import { SplineInterpolator } from '../utils/splineInterpolation';

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
    shaderParams,
    shouldClear
  } = useCanvasContext();

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const textureGeneratorRef = useRef<TextureGenerator | null>(null);
  const splineInterpolatorRef = useRef<SplineInterpolator>(new SplineInterpolator(4, shaderParams.smoothing));
  const accumulatedDistanceRef = useRef(0);
  const spacing = brushSize * shaderParams.spacingMultiplier;
  
  const patternCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  
  useEffect(() => {
    patternCache.current.clear();
    if (textureGeneratorRef.current) {
      textureGeneratorRef.current = new TextureGenerator(brushSize * 2);
    }
  }, [color, brushSize, shaderParams.feather, shaderParams.aspect, shaderParams.noiseScale, 
      shaderParams.noiseStrength, shaderParams.noiseContrast, shaderParams.shaderType,
      shaderParams.dotSize, shaderParams.dotSpacing]);

  useEffect(() => {
    splineInterpolatorRef.current = new SplineInterpolator(4, shaderParams.smoothing);
  }, [shaderParams.smoothing]);

  useEffect(() => {
    if (!canvasRef.current || !offscreenCanvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d', { alpha: false })!;
    const offscreenCtx = offscreenCanvasRef.current.getContext('2d', { alpha: false })!;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    offscreenCtx.fillStyle = 'white';
    offscreenCtx.fillRect(0, 0, width, height);
  }, [shouldClear, width, height]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d', { 
      alpha: false,
      desynchronized: true
    });
    if (!ctx) return;
    
    offscreenCanvasRef.current = document.createElement('canvas');
    offscreenCanvasRef.current.width = width;
    offscreenCanvasRef.current.height = height;
    const offscreenCtx = offscreenCanvasRef.current.getContext('2d', { 
      alpha: false,
      desynchronized: true
    });
    if (!offscreenCtx) return;
    
    offscreenCtx.fillStyle = 'white';
    offscreenCtx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    textureGeneratorRef.current = new TextureGenerator(brushSize * 2);
  }, [width, height]);

  const getTexturePattern = (rotation: number = 0) => {
    if (!textureGeneratorRef.current) return null;

    const cacheKey = `${rotation.toFixed(2)}_${shaderParams.scatter.toFixed(2)}_${shaderParams.shaderType}_${shaderParams.dotSpacing}_${shaderParams.dotSize}`;
    const cached = patternCache.current.get(cacheKey);
    if (cached) return cached;

    const imageData = textureGeneratorRef.current.generateTexture(color, {
      ...shaderParams,
      scatter: shaderParams.scatter * brushSize * 0.1
    }, rotation);

    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = brushSize * 2;
    patternCanvas.height = brushSize * 2;
    const patternCtx = patternCanvas.getContext('2d', { alpha: true })!;
    patternCtx.putImageData(imageData, 0, 0);
    
    patternCache.current.set(cacheKey, patternCanvas);
    return patternCanvas;
  };

  const drawTexture = (ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number = 0) => {
    const pattern = getTexturePattern(rotation);
    if (!pattern) return;

    ctx.drawImage(
      pattern,
      x - brushSize,
      y - brushSize,
      brushSize * 2,
      brushSize * 2
    );
  };

  const drawTextureStroke = (ctx: CanvasRenderingContext2D, interpolatedData: { positions: Float32Array; angles: Float32Array }) => {
    const { positions, angles } = interpolatedData;
    const pointCount = positions.length / 2;
    if (pointCount < 2) return;

    for (let i = 2; i < positions.length; i += 2) {
      const x1 = positions[i - 2], y1 = positions[i - 1];
      const x2 = positions[i], y2 = positions[i + 1];
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      accumulatedDistanceRef.current += distance;
      
      if (accumulatedDistanceRef.current < spacing) continue;

      const angleIndex = Math.floor(i / 2) - 1;
      const rotation = shaderParams.rotateWithStroke ? angles[angleIndex] : 0;

      while (accumulatedDistanceRef.current >= spacing) {
        const t = 1 - (accumulatedDistanceRef.current - spacing) / distance;
        const x = x1 + dx * t;
        const y = y1 + dy * t;
        
        drawTexture(ctx, x, y, rotation);
        
        accumulatedDistanceRef.current -= spacing;
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !offscreenCanvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastPoint({ x, y });
    splineInterpolatorRef.current.clear();
    splineInterpolatorRef.current.addPoint(x, y);
    accumulatedDistanceRef.current = spacing;

    if (tool === 'texture') {
      const ctx = offscreenCanvasRef.current.getContext('2d', { alpha: false })!;
      drawTexture(ctx, x, y, 0);
      
      const displayCtx = canvasRef.current.getContext('2d', { alpha: false })!;
      displayCtx.clearRect(0, 0, width, height);
      displayCtx.drawImage(offscreenCanvasRef.current, 0, 0);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !offscreenCanvasRef.current || !lastPoint) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    splineInterpolatorRef.current.addPoint(x, y);
    const interpolatedData = splineInterpolatorRef.current.getInterpolatedPoints();
    
    if (tool === 'texture') {
      const ctx = offscreenCanvasRef.current.getContext('2d', { alpha: false })!;
      drawTextureStroke(ctx, interpolatedData);
      
      const displayCtx = canvasRef.current.getContext('2d', { alpha: false })!;
      displayCtx.clearRect(0, 0, width, height);
      displayCtx.drawImage(offscreenCanvasRef.current, 0, 0);
    }

    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
    splineInterpolatorRef.current.clear();
    accumulatedDistanceRef.current = 0;
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