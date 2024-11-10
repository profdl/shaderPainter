import { useCallback } from 'react';
import { Point } from '../types/canvas';

interface RenderPipelineProps {
  width: number;
  height: number;
  drawStroke: (ctx: CanvasRenderingContext2D, start: Point, end: Point, rotation: number) => void;
}

export const useRenderPipeline = ({
  width,
  height,
  drawStroke
}: RenderPipelineProps) => {
  const createContext = useCallback((canvas: HTMLCanvasElement) => {
    return canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    });
  }, []);

  const clearCanvas = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const copyCanvas = useCallback((
    source: CanvasRenderingContext2D,
    target: CanvasRenderingContext2D
  ) => {
    target.clearRect(0, 0, width, height);
    target.drawImage(source.canvas, 0, 0);
  }, [width, height]);

  const renderStroke = useCallback((
    ctx: CanvasRenderingContext2D,
    points: { positions: Float32Array; angles: Float32Array }
  ) => {
    const { positions, angles } = points;
    for (let i = 2; i < positions.length; i += 2) {
      const start = { x: positions[i - 2], y: positions[i - 1] };
      const end = { x: positions[i], y: positions[i + 1] };
      const angleIndex = Math.floor(i / 2) - 1;
      drawStroke(ctx, start, end, angles[angleIndex]);
    }
  }, [drawStroke]);

  return {
    createContext,
    clearCanvas,
    copyCanvas,
    renderStroke
  };
};