export const clothFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uPaletteShift; // 0.0 = Midnight Black & Off-White, 1.0 = Electric Magenta & Off-White
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vElevation;

void main() {
  // Density of the tablecloth checkered grid
  vec2 gridCount = vec2(36.0, 26.0);
  vec2 uvGrid = vUv * gridCount;
  
  // Checkerboard parity
  vec2 gridFloor = floor(uvGrid);
  float check = mod(gridFloor.x + gridFloor.y, 2.0);
  
  // Brand color palette:
  // Crisp Starlight Off-White: #F8F6FA
  vec3 colorCream = vec3(0.9725, 0.9647, 0.9804);
  
  // Deep Midnight Black (Hero): #0B0711
  vec3 colorMidnight = vec3(0.0431, 0.0275, 0.0667);
  
  // Electric Magenta (Menu): #D411B8
  vec3 colorMagenta = vec3(0.8314, 0.0667, 0.7216);
  
  // Smoothly interpolate dark tile color
  vec3 darkTileColor = mix(colorMidnight, colorMagenta, clamp(uPaletteShift, 0.0, 1.0));
  
  // Base tile pattern
  vec3 baseColor = (check > 0.5) ? darkTileColor : colorCream;
  
  // Directional lighting from top-right
  vec3 norm = normalize(vNormal);
  vec3 lightDir = normalize(vec3(0.3, 0.8, 1.1));
  float diff = max(dot(norm, lightDir), 0.0);
  
  // Surface illumination
  float ambient = 0.70;
  float lighting = ambient + diff * 0.30;
  vec3 litColor = baseColor * lighting;
  
  // Deep Trough Ambient Occlusion (Valley Darkening) with subtle purple-pink undertone
  float valleyOcclusion = smoothstep(-1.2, 0.6, -vElevation);
  vec3 shadowTint = vec3(0.03, 0.008, 0.04);
  vec3 shadedColor = mix(litColor, shadowTint, valleyOcclusion * 0.48);
  
  // Subtle cloth fabric weave noise
  float weave = sin(vUv.x * 650.0) * sin(vUv.y * 650.0) * 0.018;
  shadedColor += weave;
  
  // Atmospheric edge vignette
  vec2 screenUv = gl_FragCoord.xy / uResolution;
  float vig = 1.0 - smoothstep(0.4, 1.45, length(screenUv - 0.5) * 1.35);
  shadedColor *= mix(0.88, 1.0, vig);

  gl_FragColor = vec4(shadedColor, 1.0);
}
`;
