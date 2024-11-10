import React, { createContext, useContext, useState } from 'react';
import { ShaderParams } from '../types/canvas';

interface CanvasContextType {
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  tool: string;
  setTool: (tool: string) => void;
  shaderParams: ShaderParams;
  setShaderParams: (params: Partial<ShaderParams>) => void;
  clearCanvas: () => void;
  shouldClear: number;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [color, setColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(30);
  const [tool, setTool] = useState('texture');
  const [shouldClear, setShouldClear] = useState(0);
  const [shaderParams, setShaderParams] = useState<ShaderParams>({
    feather: 0.00,
    aspect: 2.00,
    noiseScale: 10,
    noiseStrength: 1.00,
    noiseContrast: 1.99,
    noiseRoughness: 0.50,
    noiseDetail: 0.50,
    opacity: 0.15,
    flow: 1.00,
    scatter: 0.00,
    brushShapeScatter: 0.00,
    rotateWithStroke: false,
    rotatePatternWithStroke: false,
    pressureSensitive: false,
    hueVariation: 0.0,
    saturationVariation: 0.0,
    brightnessVariation: 0.0,
    spacingMultiplier: 0.1,
    smoothing: 0.5,
    shaderType: 'noise',
    dotSize: 0.5,
    dotSpacing: 2.5
  });

  const updateShaderParams = (newParams: Partial<ShaderParams>) => {
    setShaderParams(prev => ({ ...prev, ...newParams }));
  };

  const clearCanvas = () => {
    setShouldClear(prev => prev + 1);
  };

  return (
    <CanvasContext.Provider
      value={{
        color,
        setColor,
        brushSize,
        setBrushSize,
        tool,
        setTool,
        shaderParams,
        setShaderParams: updateShaderParams,
        clearCanvas,
        shouldClear
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
};