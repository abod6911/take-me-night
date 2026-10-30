export const clothVertexShader = /* glsl */ `
uniform float uTime;
uniform float uScrollDelta;
uniform float uScrollProgress;
uniform vec2 uMouse;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;

// Primary undulating cloth displacement
float getElevation(vec2 pos) {
  float wave1 = sin(pos.x * 0.35 + uTime * 1.1 + pos.y * 0.22) * 0.70;
  float wave2 = cos(pos.y * 0.45 - uTime * 0.85 + pos.x * 0.26) * 0.52;
  float wave3 = sin((pos.x + pos.y) * 0.70 + uTime * 1.35) * 0.32;
  
  // Mouse reactive wave
  float distToMouse = length(pos - uMouse * 6.0);
  float mouseRipple = sin(distToMouse * 1.3 - uTime * 2.2) * exp(-distToMouse * 0.28) * 0.18;
  
  // Scroll velocity ripple
  float scrollWave = sin(pos.y * 0.4 - uTime * 1.8) * (uScrollDelta * 0.05);
  
  return wave1 + wave2 + wave3 + mouseRipple + scrollWave;
}

// Optimized normal elevation function (eliminates redundant exponential evaluations)
float getNormalElevation(vec2 pos) {
  float wave1 = sin(pos.x * 0.35 + uTime * 1.1 + pos.y * 0.22) * 0.70;
  float wave2 = cos(pos.y * 0.45 - uTime * 0.85 + pos.x * 0.26) * 0.52;
  float wave3 = sin((pos.x + pos.y) * 0.70 + uTime * 1.35) * 0.32;
  return wave1 + wave2 + wave3;
}

void main() {
  vUv = uv;
  vec3 pos = position;
  
  float elevation = getElevation(pos.xy);
  pos.z += elevation;
  vElevation = elevation;
  
  // Dynamic surface normals computed with high efficiency
  float eps = 0.04;
  float baseElev = getNormalElevation(pos.xy);
  float elevX = getNormalElevation(pos.xy + vec2(eps, 0.0));
  float elevY = getNormalElevation(pos.xy + vec2(0.0, eps));
  vec3 dX = vec3(eps, 0.0, elevX - baseElev);
  vec3 dY = vec3(0.0, eps, elevY - baseElev);
  vec3 computedNormal = normalize(cross(dX, dY));
  
  vNormal = normalMatrix * computedNormal;
  vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;
