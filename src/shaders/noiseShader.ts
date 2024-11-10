export const noiseVertexShader = `
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

export const noiseFragmentShader = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform vec4 u_color;
  uniform float u_feather;
  uniform float u_aspect;
  uniform float u_noiseScale;
  uniform float u_noiseStrength;
  uniform float u_noiseContrast;
  uniform float u_opacity;
  uniform float u_rotation;
  uniform vec2 u_offset;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

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
    
    float n = noise(v_texCoord * u_noiseScale) * 2.0 - 1.0;
    n = n * u_noiseStrength;
    n = (n + 1.0) * 0.5;
    n = pow(n, u_noiseContrast);
    
    float alpha = circle * u_opacity * n;
    gl_FragColor = vec4(u_color.rgb, alpha);
  }
`;