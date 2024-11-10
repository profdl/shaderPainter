import { createProgram, setupBuffers } from './webglUtils';
import { noiseVertexShader, noiseFragmentShader } from '../shaders/noiseShader';
import { dotsVertexShader, dotsFragmentShader } from '../shaders/dotsShader';

export class TextureGenerator {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private noiseProgram: WebGLProgram;
  private dotsProgram: WebGLProgram;
  private currentProgram: WebGLProgram;
  private positionBuffer: WebGLBuffer;
  private texCoordBuffer: WebGLBuffer;

  constructor(size: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = size;
    this.canvas.height = size;

    const gl = this.canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL not supported');
    this.gl = gl;

    // Create shader programs
    this.noiseProgram = createProgram(gl, noiseVertexShader, noiseFragmentShader);
    this.dotsProgram = createProgram(gl, dotsVertexShader, dotsFragmentShader);
    this.currentProgram = this.noiseProgram;

    // Create buffers
    const buffers = setupBuffers(gl);
    this.positionBuffer = buffers.positionBuffer;
    this.texCoordBuffer = buffers.texCoordBuffer;
  }

  generateTexture(color: string, options: {
    feather: number;
    aspect: number;
    noiseScale: number;
    noiseStrength: number;
    noiseContrast: number;
    opacity: number;
    scatter: number;
    brushShapeScatter: number;
    shaderType: 'noise' | 'dots';
    dotSize: number;
    dotSpacing: number;
    rotateWithStroke: boolean;
    rotatePatternWithStroke: boolean;
  }, rotation: number = 0): ImageData {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.currentProgram = options.shaderType === 'noise' ? this.noiseProgram : this.dotsProgram;
    gl.useProgram(this.currentProgram);

    const positionLocation = gl.getAttribLocation(this.currentProgram, 'a_position');
    const texCoordLocation = gl.getAttribLocation(this.currentProgram, 'a_texCoord');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;

    gl.uniform4f(gl.getUniformLocation(this.currentProgram, 'u_color'), r, g, b, 1);
    gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_feather'), options.feather);
    gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_aspect'), options.aspect);
    gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_opacity'), options.opacity);
    gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_brushShapeScatter'), options.brushShapeScatter);
    gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_rotation'), options.rotateWithStroke ? rotation : 0);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * options.scatter;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    gl.uniform2f(gl.getUniformLocation(this.currentProgram, 'u_offset'), offsetX, offsetY);

    if (options.shaderType === 'noise') {
      gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_noiseScale'), options.noiseScale);
      gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_noiseStrength'), options.noiseStrength);
      gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_noiseContrast'), options.noiseContrast);
    } else {
      gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_dotSpacing'), options.dotSpacing);
      gl.uniform1f(gl.getUniformLocation(this.currentProgram, 'u_dotSize'), options.dotSize);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const pixels = new Uint8Array(this.canvas.width * this.canvas.height * 4);
    gl.readPixels(0, 0, this.canvas.width, this.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    return new ImageData(
      new Uint8ClampedArray(pixels),
      this.canvas.width,
      this.canvas.height
    );
  }
}