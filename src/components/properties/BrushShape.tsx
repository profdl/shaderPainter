import React from 'react';
import { Slider } from './Slider';
import { ShaderParams } from '../../types/canvas';

interface BrushShapeProps {
  params: ShaderParams;
  onChange: (key: keyof ShaderParams, value: number) => void;
}

export const BrushShape: React.FC<BrushShapeProps> = ({ params, onChange }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-900 mb-3">Brush Shape</h3>
    <div className="space-y-3">
      <Slider
        label="Spacing Multiplier"
        value={params.spacingMultiplier}
        onChange={(v) => onChange('spacingMultiplier', v)}
        min={0.1}
        max={3}
        step={0.1}
        formatValue={(v) => `${v.toFixed(1)}x`}
      />
      <Slider
        label="Feather Edge"
        value={params.feather}
        onChange={(v) => onChange('feather', v)}
        min={0}
        max={1}
        step={0.01}
      />
      <Slider
        label="Aspect Ratio"
        value={params.aspect}
        onChange={(v) => onChange('aspect', v)}
        min={0.1}
        max={2}
        step={0.1}
      />
      <Slider
        label="Opacity"
        value={params.opacity}
        onChange={(v) => onChange('opacity', v)}
        min={0}
        max={1}
        step={0.01}
      />
      <Slider
        label="Smoothing"
        value={params.smoothing}
        onChange={(v) => onChange('smoothing', v)}
        min={0}
        max={4}
        step={0.1}
        formatValue={(v) => v.toFixed(1)}
      />
      <Slider
        label="Shape Scatter"
        value={params.brushShapeScatter}
        onChange={(v) => onChange('brushShapeScatter', v)}
        min={0}
        max={1}
        step={0.01}
        formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      />
    </div>
  </div>
);