import { useRef, useEffect, useState } from 'react';
import { useCanvasContext } from '../../contexts/CanvasContext';
import { TextureGenerator } from '../../utils/TextureGenerator';
import { SplineInterpolator } from '../../utils/SplineInterpolator';
import { CanvasProps, Point } from '../../types/canvas';
import { useDrawing } from './useDrawing';

export const useCanvas = ({ width, height }: CanvasProps) => {
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
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const textureGeneratorRef = useRef<TextureGenerator | null>(null);
  const splineInterpolatorRef = useRef<SplineInterpolator>(
    new SplineInterpolator(4, shaderParams.smoothing)
  );
  const accumulatedDistanceRef = useRef(0);
  const spacing = brushSize * shaderParams.spacingMultiplier;
  
  const patternCache = useRef<Map<string, HTMLCanvasElement>>(new Map());

  const { drawTexture, drawTextureStroke } = useDrawing({
    textureGeneratorRef,
    patternCache,
    brushSize,
    color,
    shaderParams,
    spacing,
    accumulatedDistanceRef
  });

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

  useEffect(() => {
    if (!canvasRef.current || !offscreenCanvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d', { alpha: false })!;
    const offscreenCtx = offscreenCanvasRef.current.getContext('2d', { alpha: false })!;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    offscreenCtx.fillStyle = 'white';
    offscreenCtx.fillRect(0, 0, width, height);
  }, [shouldClear, width, height]);

  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !offscreenCanvasRef.current) return;
    
    const point = getMousePosition(e);
    setIsDrawing(true);
    setLastPoint(point);
    splineInterpolatorRef.current.clear();
    splineInterpolatorRef.current.addPoint(point.x, point.y);
    accumulatedDistanceRef.current = spacing;

    if (tool === 'texture') {
      const ctx = offscreenCanvasRef.current.getContext('2d', { alpha: false })!;
      drawTexture(ctx, point.x, point.y, 0);
      
      const displayCtx = canvasRef.current.getContext('2d', { alpha: false })!;
      displayCtx.clearRect(0, 0, width, height);
      displayCtx.drawImage(offscreenCanvasRef.current, 0, 0);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current || !offscreenCanvasRef.current || !lastPoint) return;

    const point = getMousePosition(e);
    splineInterpolatorRef.current.addPoint(point.x, point.y);
    const interpolatedData = splineInterpolatorRef.current.getInterpolatedPoints();
    
    if (tool === 'texture') {
      const ctx = offscreenCanvasRef.current.getContext('2d', { alpha: false })!;
      drawTextureStroke(ctx, interpolatedData);
      
      const displayCtx = canvasRef.current.getContext('2d', { alpha: false })!;
      displayCtx.clearRect(0, 0, width, height);
      displayCtx.drawImage(offscreenCanvasRef.current, 0, 0);
    }

    setLastPoint(point);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPoint(null);
    splineInterpolatorRef.current.clear();
    accumulatedDistanceRef.current = 0;
  };

  const handleMouseLeave = handleMouseUp;

  return {
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  };
};