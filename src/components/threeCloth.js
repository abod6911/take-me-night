import * as THREE from 'three';
import { clothVertexShader } from '../shaders/cloth.vert.js';
import { clothFragmentShader } from '../shaders/cloth.frag.js';

export class ThreeCloth {
  constructor(container) {
    this.container = container;
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);
    this.scrollDelta = 0;
    this.targetScrollDelta = 0;
    this.lastScrollY = window.scrollY;
    this.paletteShift = 0.0;
    this.targetPaletteShift = 0.0;

    this.init();
    this.bindEvents();
  }

  init() {
    // Scene & Perspective Camera with steep overhead vantage
    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(46, aspect, 0.1, 100);
    // Steep overhead perspective looking down onto tablecloth
    this.camera.position.set(0, -0.6, 6.8);
    this.camera.lookAt(0, 0.2, 0);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false, // Solid background
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Large Plane Geometry to guarantee 100% viewport coverage at all times (Zero black horizon)
    const geometry = new THREE.PlaneGeometry(36, 32, 180, 160);

    this.uniforms = {
      uTime: { value: 0 },
      uScrollDelta: { value: 0 },
      uScrollProgress: { value: 0 },
      uPaletteShift: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader: clothVertexShader,
      fragmentShader: clothFragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
      wireframe: false
    });

    this.clothMesh = new THREE.Mesh(geometry, this.material);
    // Steep overhead tilt (~65°-70°) and slight Z-axis rotation (~ -8 deg) for dynamic diagonal grid lines
    this.clothMesh.rotation.x = -0.72;
    this.clothMesh.rotation.z = -0.14; // ~ -8 degrees diagonal slant
    this.clothMesh.position.set(0, 0.2, 0);
    this.scene.add(this.clothMesh);

    // Directional & Ambient Scene Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeed6, 0.7);
    dirLight.position.set(6, 12, 8);
    this.scene.add(dirLight);

    this.clock = new THREE.Clock();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - this.lastScrollY;
      this.targetScrollDelta = Math.max(Math.min(delta * 0.35, 3.0), -3.0);
      this.lastScrollY = currentScrollY;
    }, { passive: true });
  }

  setPaletteShift(val) {
    this.targetPaletteShift = Math.max(0, Math.min(1, val));
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.uniforms.uResolution.value.set(width, height);
  }

  update() {
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth interpolations
    this.mouse.lerp(this.targetMouse, 0.05);
    this.scrollDelta += (this.targetScrollDelta - this.scrollDelta) * 0.1;
    this.targetScrollDelta *= 0.92;
    this.paletteShift += (this.targetPaletteShift - this.paletteShift) * 0.08;

    // Update uniforms
    this.uniforms.uTime.value = elapsedTime;
    this.uniforms.uMouse.value.copy(this.mouse);
    this.uniforms.uScrollDelta.value = this.scrollDelta;
    this.uniforms.uPaletteShift.value = this.paletteShift;

    this.renderer.render(this.scene, this.camera);
  }
}
