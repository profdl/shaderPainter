import { createProgram } from '../webgl/programUtils';
import { setupBuffers } from '../webgl/bufferUtils';
import { noiseShader } from './noiseShader';
import { dotsShader } from './dotsShader';
import { ShaderType } from '../../types/canvas';

export class ShaderManager {
  private gl: WebGLRenderingContext;
  private programs: Map<ShaderType, WebGLProgram>;
  private buffers: ReturnType<typeof setupBuffers>;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.programs = new Map();
    
    // Initialize shaders
    this.programs.set('noise', createProgram(gl, noiseShader.vertex, noiseShader.fragment));
    this.programs.set('dots', createProgram(gl, dotsShader.vertex, dotsShader.fragment));
    
    // Setup buffers
    this.buffers = setupBuffers(gl);
  }

  useShader(type: ShaderType): WebGLProgram {
    const program = this.programs.get(type);
    if (!program) {
      throw new Error(`Shader type ${type} not found`);
    }
    
    this.gl.useProgram(program);
    this.setupAttributes(program);
    
    return program;
  }

  private setupAttributes(program: WebGLProgram): void {
    const gl = this.gl;
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
  }

  setUniforms(program: WebGLProgram, uniforms: Record<string, number | number[]>): void {
    const gl = this.gl;
    
    Object.entries(uniforms).forEach(([name, value]) => {
      const location = gl.getUniformLocation(program, name);
      if (location === null) return;

      if (Array.isArray(value)) {
        switch (value.length) {
          case 2:
            gl.uniform2f(location, value[0], value[1]);
            break;
          case 3:
            gl.uniform3f(location, value[0], value[1], value[2]);
            break;
          case 4:
            gl.uniform4f(location, value[0], value[1], value[2], value[3]);
            break;
        }
      } else {
        gl.uniform1f(location, value);
      }
    });
  }
}