import React from 'react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { BrushShape } from './properties/BrushShape';
import { NoiseControls } from './properties/NoiseControls';
import { DotControls } from './properties/DotControls';
import { DynamicsControls } from './properties/DynamicsControls';
import { ShaderParams } from '../types/canvas';

const PropertiesPanel: React.FC = () => {
  const { shaderParams, setShaderParams } = useCanvasContext();

  const handleParamChange = (param: keyof ShaderParams, value: number | boolean | string) => {
    setShaderParams({ [param]: value });
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Shader Type</h3>
          <select
            value={shaderParams.shaderType}
            onChange={(e) => handleParamChange('shaderType', e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 mb-4"
          >
            <option value="noise">Noise</option>
            <option value="dots">Dots</option>
          </select>
        </div>

        <BrushShape 
          params={shaderParams} 
          onChange={handleParamChange} 
        />

        {shaderParams.shaderType === 'noise' ? (
          <NoiseControls 
            params={shaderParams} 
            onChange={handleParamChange} 
          />
        ) : (
          <DotControls 
            params={shaderParams} 
            onChange={handleParamChange} 
          />
        )}

        <DynamicsControls 
          params={shaderParams} 
          onChange={handleParamChange} 
        />
      </div>
    </div>
  );
};

export default PropertiesPanel;