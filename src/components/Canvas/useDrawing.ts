import { MutableRefObject } from 'react';
import { TextureGenerator } from '../../utils/TextureGenerator';
import { ShaderParams } from '../../types/canvas';

interface UseDrawingProps {
  textureGeneratorRef: MutableRefObject<TextureGenerator | null>;
  patternCache: MutableRefObject<Map<string, HTMLCanvasElement>>;
  brushSize: number;
  color: string;
  shaderParams: ShaderParams;
  spacing: number;
  accumulatedDistanceRef: MutableRefObject<number>;
}

export const useDrawing = ({
  textureGeneratorRef,
  patternCache,
  brushSize,
  color,
  shaderParams,
  spacing,
  accumulatedDistanceRef
}: UseDrawingProps) => {
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

  return {
    drawTexture,
    drawTextureStroke
  };
};