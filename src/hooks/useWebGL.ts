import { useEffect, useRef } from 'react';
import { ShaderManager } from '../utils/shaders/ShaderManager';
import { TextureGenerator } from '../utils/TextureGenerator';

export const useWebGL = (size: number) => {
  const textureGeneratorRef = useRef<TextureGenerator | null>(null);
  const shaderManagerRef = useRef<ShaderManager | null>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Enable extensions
    gl.getExtension('OES_standard_derivatives');
    gl.getExtension('EXT_shader_texture_lod');

    shaderManagerRef.current = new ShaderManager(gl);
    textureGeneratorRef.current = new TextureGenerator(size);

    return () => {
      // Cleanup WebGL resources
      if (gl) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  }, [size]);

  return {
    textureGenerator: textureGeneratorRef.current,
    shaderManager: shaderManagerRef.current
  };
};