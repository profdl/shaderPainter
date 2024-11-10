import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue?: (value: number) => string;
  getTooltip?: (value: number) => string;
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  formatValue = (v: number) => v.toFixed(2),
  getTooltip
}) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="text-xs text-gray-500">
        <span>{formatValue(value)}</span>
        {getTooltip && (
          <span className="ml-1 text-gray-400">({getTooltip(value)})</span>
        )}
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-blue-500"
    />
  </div>
);