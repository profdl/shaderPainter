import { useRef, useCallback } from 'react';
import { TextureGenerator } from '../utils/TextureGenerator';
import { ShaderParams, Point } from '../types/canvas';

interface BrushSystemProps {
  textureGenerator: TextureGenerator | null;
  brushSize: number;
  color: string;
  shaderParams: ShaderParams;
}

export const useBrushSystem = ({
  textureGenerator,
  brushSize,
  color,
  shaderParams
}: BrushSystemProps) => {
  const patternCache = useRef<Map<string, HTMLCanvasElement>>(new Map());

  const clearCache = useCallback(() => {
    patternCache.current.clear();
  }, []);

  const generatePattern = useCallback((rotation: number = 0) => {
    if (!textureGenerator) return null;

    const cacheKey = `${rotation.toFixed(2)}_${shaderParams.scatter.toFixed(2)}_${shaderParams.shaderType}_${shaderParams.dotSpacing}_${shaderParams.dotSize}`;
    const cached = patternCache.current.get(cacheKey);
    if (cached) return cached;

    const imageData = textureGenerator.generateTexture(color, {
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
  }, [textureGenerator, color, brushSize, shaderParams]);

  const drawStroke = useCallback((
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    rotation: number = 0
  ) => {
    const pattern = generatePattern(rotation);
    if (!pattern) return;

    ctx.drawImage(
      pattern,
      end.x - brushSize,
      end.y - brushSize,
      brushSize * 2,
      brushSize * 2
    );
  }, [brushSize, generatePattern]);

  return {
    clearCache,
    generatePattern,
    drawStroke
  };
};