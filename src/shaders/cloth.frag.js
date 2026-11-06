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
  
  // Luxury Color Palette:
  // Crisp Starlight Pearl Off-White: #FBF9FE
  vec3 colorCream = vec3(0.984, 0.976, 0.996);
  
  // Deep Midnight Obsidian Velvet: #0B0713
  vec3 colorMidnight = vec3(0.043, 0.027, 0.075);
  
  // Luminous Electric Magenta (Menu): #E012C4
  vec3 colorMagenta = vec3(0.878, 0.071, 0.769);
  
  // Smoothly interpolate dark tile color
  vec3 darkTileColor = mix(colorMidnight, colorMagenta, clamp(uPaletteShift, 0.0, 1.0));
  
  // Base tile pattern
  bool isDarkTile = (check > 0.5);
  vec3 baseColor = isDarkTile ? darkTileColor : colorCream;
  
  // Lighting vectors
  vec3 norm = normalize(vNormal);
  vec3 viewDir = normalize(-vPosition);
  vec3 lightDir = normalize(vec3(0.35, 0.85, 1.15));
  vec3 halfDir = normalize(lightDir + viewDir);
  
  // Diffuse illumination
  float diff = max(dot(norm, lightDir), 0.0);
  float ambient = 0.68;
  float lighting = ambient + diff * 0.32;
  vec3 litColor = baseColor * lighting;
  
  // Luxury Satin Specular Sheen (Glints on cloth wave crests)
  float specPow = isDarkTile ? 36.0 : 24.0;
  float spec = pow(max(dot(norm, halfDir), 0.0), specPow);
  vec3 specColor = isDarkTile ? vec3(0.95, 0.35, 0.9) * 0.45 : vec3(1.0, 0.98, 0.95) * 0.38;
  litColor += specColor * spec;
  
  // Iridescent Velvet Fresnel Rim Lighting (Neon rim glow on wave edges)
  float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 3.0);
  vec3 rimGlow = isDarkTile 
    ? mix(vec3(0.88, 0.07, 0.77), vec3(1.0, 0.9, 0.0), clamp(uPaletteShift, 0.0, 1.0) * 0.3) * (fresnel * 0.55)
    : vec3(0.95, 0.92, 1.0) * (fresnel * 0.25);
  litColor += rimGlow;
  
  // Deep Trough Ambient Occlusion (Valley Darkening with subtle midnight-violet undertone)
  float valleyOcclusion = smoothstep(-1.2, 0.55, -vElevation);
  vec3 shadowTint = vec3(0.02, 0.006, 0.035);
  vec3 shadedColor = mix(litColor, shadowTint, valleyOcclusion * 0.52);
  
  // Micro-silk fabric weave texture
  float weave = (sin(vUv.x * 700.0) * sin(vUv.y * 700.0)) * 0.016;
  shadedColor += weave;
  
  // Cinematic vignette
  vec2 screenUv = gl_FragCoord.xy / uResolution;
  float vig = 1.0 - smoothstep(0.42, 1.48, length(screenUv - 0.5) * 1.35);
  shadedColor *= mix(0.86, 1.0, vig);

  gl_FragColor = vec4(shadedColor, 1.0);
}
`;
