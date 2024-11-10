import React from 'react';
import { Slider } from './Slider';
import { ShaderParams } from '../../types/canvas';
import { useCanvasContext } from '../../contexts/CanvasContext';

interface DotControlsProps {
  params: ShaderParams;
  onChange: (key: keyof ShaderParams, value: number) => void;
}

export const DotControls: React.FC<DotControlsProps> = ({ params, onChange }) => {
  const { brushSize } = useCanvasContext();

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Dot Pattern</h3>
      <div className="space-y-3">
        <Slider
          label="Dot Size"
          value={params.dotSize}
          onChange={(v) => onChange('dotSize', v)}
          min={0.1}
          max={1}
          step={0.01}
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
          getTooltip={(v) => `${(v * brushSize).toFixed(1)}px`}
        />
        <Slider
          label="Dot Spacing"
          value={params.dotSpacing}
          onChange={(v) => onChange('dotSpacing', v)}
          min={1}
          max={5}
          step={0.1}
          formatValue={(v) => `${(v * 10).toFixed(0)}%`}
          getTooltip={(v) => `${(v * brushSize * 0.1).toFixed(1)}px`}
        />
      </div>
    </div>
  );
};