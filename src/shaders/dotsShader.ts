export const dotsVertexShader = `
  precision mediump float;
  attribute vec4 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  uniform float u_rotation;
  uniform float u_brushShapeScatter;
  
  void main() {
    gl_Position = a_position;
    float angle = u_brushShapeScatter * 6.28318530718; // 2*PI
    float dist = u_brushShapeScatter;
    float offsetX = cos(angle) * dist;
    float offsetY = sin(angle) * dist;
    v_texCoord = a_texCoord + vec2(offsetX, offsetY);
  }
`;

export const dotsFragmentShader = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform vec4 u_color;
  uniform float u_feather;
  uniform float u_aspect;
  uniform float u_opacity;
  uniform float u_rotation;
  uniform float u_dotSpacing;
  uniform float u_dotSize;
  uniform vec2 u_offset;

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = v_texCoord - center + u_offset;
    
    float s = sin(u_rotation);
    float c = cos(u_rotation);
    vec2 rotatedPos = vec2(
      pos.x * c - pos.y * s,
      pos.x * s + pos.y * c
    );
    rotatedPos.x *= u_aspect;
    
    float dist = length(rotatedPos) * 2.0;
    float circle = 1.0 - smoothstep(1.0 - u_feather, 1.0, dist);
    
    float spacing = 10.0 / u_dotSpacing;
    vec2 scaledCoord = v_texCoord * spacing;
    vec2 dotGrid = fract(scaledCoord) - 0.5;
    float dotDist = length(dotGrid);
    
    float dotRadius = u_dotSize * 0.5;
    float dotEdge = dotRadius * 0.1;
    float dot = 1.0 - smoothstep(dotRadius - dotEdge, dotRadius + dotEdge, dotDist);
    
    float alpha = circle * u_opacity * dot;
    gl_FragColor = vec4(u_color.rgb, alpha);
  }
`;