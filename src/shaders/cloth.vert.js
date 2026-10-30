export const clothVertexShader = /* glsl */ `
uniform float uTime;
uniform float uScrollDelta;
uniform float uScrollProgress;
uniform vec2 uMouse;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;

// Multi-wave sinusoidal and undulating cloth displacement
float getElevation(vec2 pos) {
  float freq1 = 0.35;
  float freq2 = 0.45;
  float freq3 = 0.70;
  
  float wave1 = sin(pos.x * freq1 + uTime * 1.1 + pos.y * 0.22) * 0.70;
  float wave2 = cos(pos.y * freq2 - uTime * 0.85 + pos.x * 0.26) * 0.52;
  float wave3 = sin((pos.x + pos.y) * freq3 + uTime * 1.35) * 0.32;
  
  // Mouse reactive wave
  float distToMouse = length(pos - uMouse * 6.0);
  float mouseRipple = sin(distToMouse * 1.3 - uTime * 2.2) * exp(-distToMouse * 0.28) * 0.18;
  
  // Scroll velocity ripple
  float scrollWave = sin(pos.y * 0.4 - uTime * 1.8) * (uScrollDelta * 0.05);
  
  return wave1 + wave2 + wave3 + mouseRipple + scrollWave;
}

void main() {
  vUv = uv;
  vec3 pos = position;
  
  float elevation = getElevation(pos.xy);
  pos.z += elevation;
  vElevation = elevation;
  
  // Calculate dynamic surface normals via finite differences
  float eps = 0.04;
  float elevX = getElevation(pos.xy + vec2(eps, 0.0));
  float elevY = getElevation(pos.xy + vec2(0.0, eps));
  vec3 dX = vec3(eps, 0.0, elevX - elevation);
  vec3 dY = vec3(0.0, eps, elevY - elevation);
  vec3 computedNormal = normalize(cross(dX, dY));
  
  vNormal = normalMatrix * computedNormal;
  vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;
