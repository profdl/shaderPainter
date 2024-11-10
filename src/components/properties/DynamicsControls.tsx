import React from 'react';
import { Slider } from './Slider';
import { ShaderParams } from '../../types/canvas';

interface DynamicsControlsProps {
  params: ShaderParams;
  onChange: (key: keyof ShaderParams, value: number | boolean) => void;
}

export const DynamicsControls: React.FC<DynamicsControlsProps> = ({ params, onChange }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-900 mb-3">Dynamics</h3>
    <div className="space-y-3">
      <Slider
        label="Flow"
        value={params.flow}
        onChange={(v) => onChange('flow', v)}
        min={0}
        max={1}
        step={0.01}
      />
      <Slider
        label="Scatter"
        value={params.scatter}
        onChange={(v) => onChange('scatter', v)}
        min={0}
        max={1}
        step={0.01}
      />
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="rotateWithStroke"
          checked={params.rotateWithStroke}
          onChange={(e) => onChange('rotateWithStroke', e.target.checked)}
          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        />
        <label htmlFor="rotateWithStroke" className="text-sm text-gray-600">
          Rotate brush shape with stroke
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="rotatePatternWithStroke"
          checked={params.rotatePatternWithStroke}
          onChange={(e) => onChange('rotatePatternWithStroke', e.target.checked)}
          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        />
        <label htmlFor="rotatePatternWithStroke" className="text-sm text-gray-600">
          Rotate pattern with stroke
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="pressureSensitive"
          checked={params.pressureSensitive}
          onChange={(e) => onChange('pressureSensitive', e.target.checked)}
          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
        />
        <label htmlFor="pressureSensitive" className="text-sm text-gray-600">
          Pressure sensitive
        </label>
      </div>
    </div>
  </div>
);