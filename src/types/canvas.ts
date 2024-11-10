export type ShaderType = 'noise' | 'dots';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasProps {
  width: number;
  height: number;
}

export interface ShaderParams {
  feather: number;
  aspect: number;
  noiseScale: number;
  noiseStrength: number;
  noiseContrast: number;
  noiseRoughness: number;
  noiseDetail: number;
  opacity: number;
  flow: number;
  scatter: number;
  brushShapeScatter: number;
  rotateWithStroke: boolean;
  rotatePatternWithStroke: boolean;
  pressureSensitive: boolean;
  hueVariation: number;
  saturationVariation: number;
  brightnessVariation: number;
  spacingMultiplier: number;
  smoothing: number;
  shaderType: ShaderType;
  dotSize: number;
  dotSpacing: number;
}