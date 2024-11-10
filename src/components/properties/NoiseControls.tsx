import React from 'react';
import { Slider } from './Slider';
import { ShaderParams } from '../../types/canvas';

interface NoiseControlsProps {
  params: ShaderParams;
  onChange: (key: keyof ShaderParams, value: number) => void;
}

export const NoiseControls: React.FC<NoiseControlsProps> = ({ params, onChange }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-900 mb-3">Noise Texture</h3>
    <div className="space-y-3">
      <Slider
        label="Scale"
        value={params.noiseScale}
        onChange={(v) => onChange('noiseScale', v)}
        min={1}
        max={50}
        step={1}
        formatValue={(v) => v.toFixed(0)}
      />
      <Slider
        label="Strength"
        value={params.noiseStrength}
        onChange={(v) => onChange('noiseStrength', v)}
        min={0}
        max={1}
        step={0.01}
      />
      <Slider
        label="Contrast"
        value={params.noiseContrast}
        onChange={(v) => onChange('noiseContrast', v)}
        min={0}
        max={2}
        step={0.01}
      />
      <Slider
        label="Roughness"
        value={params.noiseRoughness}
        onChange={(v) => onChange('noiseRoughness', v)}
        min={0}
        max={1}
        step={0.01}
      />
      <Slider
        label="Detail"
        value={params.noiseDetail}
        onChange={(v) => onChange('noiseDetail', v)}
        min={0}
        max={1}
        step={0.01}
      />
    </div>
  </div>
);