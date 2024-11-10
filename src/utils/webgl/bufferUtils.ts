export function setupBuffers(gl: WebGLRenderingContext) {
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1,
  ]);

  const texCoords = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1,
  ]);

  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) throw new Error('Failed to create position buffer');

  const texCoordBuffer = gl.createBuffer();
  if (!texCoordBuffer) throw new Error('Failed to create texCoord buffer');

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

  return {
    positionBuffer,
    texCoordBuffer
  };
}