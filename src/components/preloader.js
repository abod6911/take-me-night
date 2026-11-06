import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

// Base URL resolution for universal hosting (GitHub Pages & custom domains)
const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || './';
const cleanBase = BASE.endsWith('/') ? BASE : BASE + '/';

export class Preloader {
  constructor(onComplete, onTransitionStart) {
    this.onComplete = onComplete;
    this.onTransitionStart = onTransitionStart;
    this.container = document.getElementById('preloader');
    this.canvas = document.getElementById('preloader-canvas');
    this.neonBadge = document.getElementById('preloader-neon-badge');
    this.igniteBtn = document.getElementById('preloader-ignite-btn');
    this.progressBar = document.getElementById('preloader-bar');
    this.skipBtn = document.getElementById('preloader-skip');
    
    this.isTriggered = false;
    this.isRunning = true;
    this.autoTimer = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isModelLoaded = false;
    this.gltfModel = null;

    this.init();
  }

  init() {
    this.initThree();
    this.createStudioEnvironment();
    this.createSparkleParticles();
    this.createInstancedDiscoBall();
    this.loadGltfModel();
    this.bindEvents();
    this.animate();

    // Auto progression after 12 seconds of idle viewing if user does not click
    this.autoTimer = setTimeout(() => {
      if (!this.isTriggered) {
        this.igniteNight();
      }
    }, 12000);
  }

  initThree() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07040C);

    const isMobile = this.width < 768;
    const aspect = this.width / this.height;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 0, isMobile ? 11.2 : 7.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.6;

    // Ambient light with atmospheric magenta-purple tint
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    this.scene.add(ambientLight);

    // Hemisphere light for global silver facet illumination
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x332244, 3.2);
    this.scene.add(hemiLight);

    // Key directional light illuminating front facets
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
    keyLight.position.set(2, 4, 6);
    this.scene.add(keyLight);

    // Front fill light illuminating mirror tiles across the equator
    const fillLight = new THREE.DirectionalLight(0xf5f8ff, 2.8);
    fillLight.position.set(0, 0, 7.5);
    this.scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 2.2);
    backLight.position.set(-3, -2, -4);
    this.scene.add(backLight);

    // Orbiting PointLights for dazzling colored glints
    // 1. Electric Magenta (#FF14D4)
    this.lightMagenta = new THREE.PointLight(0xFF14D4, 11.0, 32);
    this.lightMagenta.position.set(-4.0, 2.0, 4);
    this.scene.add(this.lightMagenta);

    // 2. Laser Yellow (#FFE600)
    this.lightYellow = new THREE.PointLight(0xFFE600, 10.0, 32);
    this.lightYellow.position.set(4.0, -1.5, 3.5);
    this.scene.add(this.lightYellow);

    // 3. Neon Cyan (#00E5FF)
    this.lightCyan = new THREE.PointLight(0x00E5FF, 8.5, 28);
    this.lightCyan.position.set(-1.0, -3.5, 4.5);
    this.scene.add(this.lightCyan);

    // 4. Pure Diamond White Specular Key
    this.lightWhite = new THREE.PointLight(0xFFFFFF, 8.0, 26);
    this.lightWhite.position.set(0.5, 3.5, 4.0);
    this.scene.add(this.lightWhite);
  }

  createStudioEnvironment() {
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      // Radiant studio ambient background (never pitch black!)
      envScene.background = new THREE.Color(0x282038);

      // Studio light panels simulating softboxes and neon rim lights
      const addPanel = (color, x, y, z, width, height) => {
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(width, height),
          new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
        );
        mesh.position.set(x, y, z);
        mesh.lookAt(0, 0, 0);
        envScene.add(mesh);
      };

      // Bright white studio softbox reflection panels (gives mirror tiles pure silver shine!)
      addPanel(0xffffff, 0, 8, 4, 14, 10);      // Overhead main softbox
      addPanel(0xf5f8ff, -7, 2, 5, 8, 14);    // Left silver fill
      addPanel(0xf5f8ff, 7, 2, 5, 8, 14);     // Right silver fill
      addPanel(0xffffff, 0, -6, 4, 10, 6);     // Bottom silver bounce
      addPanel(0xffffff, 0, 0, 8, 12, 10);     // Front high-key softbox

      // Colored neon accents reflecting off mirror edges
      addPanel(0xFF14D4, -6, 4, -4, 7, 10);    // Back magenta rim
      addPanel(0xFFE600, 6, -3, -4, 7, 10);    // Back yellow rim
      addPanel(0x00E5FF, 0, 6, -6, 10, 6);     // Top cyan rim

      const renderTarget = pmremGenerator.fromScene(envScene);
      this.scene.environment = renderTarget.texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('Could not generate studio reflection environment:', e);
    }
  }

  createSparkleParticles() {
    const particleCount = 420;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colMagenta = new THREE.Color(0xFF14D4);
    const colYellow = new THREE.Color(0xFFE600);
    const colWhite = new THREE.Color(0xFFFFFF);
    const colCyan = new THREE.Color(0x00E5FF);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3.8 + Math.random() * 11.5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      let c = colWhite;
      const rand = Math.random();
      if (rand > 0.6) c = colMagenta;
      else if (rand > 0.3) c = colYellow;
      else if (rand > 0.15) c = colCyan;

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom star diamond sparkle texture
    const starTex = this.createStarTexture();
    const material = new THREE.PointsMaterial({
      size: 0.36,
      vertexColors: true,
      map: starTex,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    // 4-point diamond cross beam
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(32, 2); ctx.lineTo(32, 62);
    ctx.moveTo(2, 32); ctx.lineTo(62, 32);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  createInstancedDiscoBall() {
    const isMobile = this.width < 768;
    this.discoGroup = new THREE.Group();
    this.discoGroup.position.set(0, isMobile ? 0.35 : 0.65, 0);

    // Spinning pivot group
    this.spinPivot = new THREE.Group();
    this.discoGroup.add(this.spinPivot);
    this.discoBall = this.spinPivot;

    const R = 1.72;

    // 1. Dark core backing sphere
    const coreGeo = new THREE.SphereGeometry(R * 0.992, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x14101e,
      roughness: 0.85,
      metalness: 0.1
    });
    this.proceduralCore = new THREE.Mesh(coreGeo, coreMat);
    this.spinPivot.add(this.proceduralCore);

    // 2. Thousands of Real 3D Physical Square Mirror Tiles with High Specular Sheen
    const tileW = 0.095;
    const tileH = 0.088;
    const tileD = 0.012;
    const tileGeo = new THREE.BoxGeometry(tileW, tileH, tileD);
    const tileMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.94,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 4.2
    });

    const numRows = 36;
    const matrices = [];
    const dummy = new THREE.Object3D();

    for (let r = 1; r < numRows - 1; r++) {
      const phi = (r / (numRows - 1) - 0.5) * Math.PI * 0.94; // -85 deg to +85 deg
      const ringY = R * Math.sin(phi);
      const ringR = R * Math.cos(phi);
      const circumference = 2 * Math.PI * ringR;
      const countInRing = Math.max(8, Math.floor(circumference / (tileW * 1.04)));

      for (let i = 0; i < countInRing; i++) {
        const theta = (i / countInRing) * Math.PI * 2 + (r % 2 === 0 ? Math.PI / countInRing : 0);
        const x = ringR * Math.cos(theta);
        const z = ringR * Math.sin(theta);
        const y = ringY;

        dummy.position.set(x, y, z);
        dummy.lookAt(x * 2, y * 2, z * 2);
        // Subtle micro-tilt so individual facets twinkle and catch light
        dummy.rotation.x += (Math.sin(i * 13 + r * 7) * 0.5) * 0.035;
        dummy.rotation.y += (Math.cos(i * 7 + r * 13) * 0.5) * 0.035;
        dummy.updateMatrix();
        matrices.push(dummy.matrix.clone());
      }
    }

    this.instancedMesh = new THREE.InstancedMesh(tileGeo, tileMat, matrices.length);
    for (let i = 0; i < matrices.length; i++) {
      this.instancedMesh.setMatrixAt(i, matrices[i]);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    this.spinPivot.add(this.instancedMesh);

    // 3. Polished 24k Gold Hardware (Cap, Loop, Hanging Chain)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe5ba42,
      metalness: 0.95,
      roughness: 0.18,
      envMapIntensity: 2.5
    });

    // Top brass mounting cap
    const hookGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.18, 32);
    this.proceduralHook = new THREE.Mesh(hookGeo, goldMat);
    this.proceduralHook.position.y = R + 0.08;
    this.spinPivot.add(this.proceduralHook);

    // Top loop
    const loopGeo = new THREE.TorusGeometry(0.18, 0.035, 16, 32);
    this.proceduralLoop = new THREE.Mesh(loopGeo, goldMat);
    this.proceduralLoop.position.y = R + 0.28;
    this.proceduralLoop.rotation.y = Math.PI / 4;
    this.spinPivot.add(this.proceduralLoop);

    // Hanging chain links extending upward to ceiling
    this.proceduralChain = new THREE.Group();
    const linkGeo = new THREE.TorusGeometry(0.10, 0.022, 12, 24);
    for (let k = 0; k < 24; k++) {
      const link = new THREE.Mesh(linkGeo, goldMat);
      link.position.y = R + 0.38 + k * 0.16;
      link.rotation.y = (k % 2 === 0) ? 0 : Math.PI / 2;
      this.proceduralChain.add(link);
    }
    this.discoGroup.add(this.proceduralChain);

    this.scene.add(this.discoGroup);

    // Visible immediately from frame 0
    this.spinPivot.scale.set(1, 1, 1);
    this.isModelLoaded = true;

    // Fill progress bar smoothly
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
      setTimeout(() => {
        if (this.progressBar) {
          this.progressBar.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          this.progressBar.style.width = '100%';
        }
      }, 50);
    }
    console.log('✅ Instant Thousand-Facet Mirror Disco Ball loaded on Frame 0!');
  }

  loadGltfModel() {
    const loader = new GLTFLoader();
    const modelUrl = `${cleanBase}models/disco_ball.glb`;

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        console.log('✨ Authentic 3D GLTF Disco Ball Model Loaded via GLTFLoader!');

        // Upgrade GLTF PBR materials for maximum diamond mirror shine
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            if (child.name.includes('Reflective') || (child.material && child.material.name === 'Reflective')) {
              child.material = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0.98,
                roughness: 0.03,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                envMapIntensity: 4.5
              });
            } else if (child.name.includes('Metal') || child.name.includes('Chain') || child.name.includes('Fix') || (child.material && child.material.name === 'Metal')) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xe5ba42,
                metalness: 0.95,
                roughness: 0.18,
                envMapIntensity: 2.8
              });
            } else if (child.name.includes('Base_Sphere') || (child.material && child.material.name === 'DiscoBall')) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0x14101e,
                roughness: 0.9,
                metalness: 0.1
              });
            }
          }
        });

        // The sphere in disco_ball.glb is naturally centered at (0, 0, 0) with radius 12.27
        const sphereRadius = 12.27;
        const targetRadius = 1.72;
        const targetScale = targetRadius / sphereRadius;

        this.gltfModel = model;

        // Graceful cross-fade: add GLTF model into spinPivot and fade out procedural tiles
        model.scale.set(0.01, 0.01, 0.01);
        this.spinPivot.add(model);

        gsap.to(model.scale, {
          x: targetScale,
          y: targetScale,
          z: targetScale,
          duration: 0.6,
          ease: 'power2.out',
          onComplete: () => {
            // Hide procedural fallback meshes once GLTF model is fully active
            if (this.instancedMesh) this.instancedMesh.visible = false;
            if (this.proceduralCore) this.proceduralCore.visible = false;
            if (this.proceduralHook) this.proceduralHook.visible = false;
            if (this.proceduralLoop) this.proceduralLoop.visible = false;
            if (this.proceduralChain) this.proceduralChain.visible = false;
          }
        });
      },
      undefined,
      (err) => {
        console.warn('GLTF disco ball loading fallback to high-quality procedural instanced mesh:', err);
      }
    );
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Cursor / Touch Parallax
    window.addEventListener('pointermove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const triggerIgnite = () => {
      if (this.isTriggered) return;
      this.igniteNight();
    };

    if (this.container) this.container.addEventListener('click', triggerIgnite);
    if (this.igniteBtn) this.igniteBtn.addEventListener('click', triggerIgnite);
    if (this.neonBadge) this.neonBadge.addEventListener('click', triggerIgnite);
    window.addEventListener('wheel', triggerIgnite, { passive: true });
    window.addEventListener('touchstart', triggerIgnite, { passive: true });
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') triggerIgnite();
      if (e.key === 'Escape') this.forceFinish();
    });

    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.forceFinish();
      });
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    const isMobile = this.width < 768;
    this.camera.position.set(0, 0, isMobile ? 11.2 : 7.8);
    if (this.discoGroup) {
      this.discoGroup.position.set(0, isMobile ? 0.35 : 0.65, 0);
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    if (!this.isRunning) return;

    // Smooth cursor parallax lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    if (!this.isTriggered) {
      // Gentle constant rotation of mirror ball
      if (this.spinPivot) {
        this.spinPivot.rotation.y += 0.009;
      }
      // Slight atmospheric sway
      if (this.discoGroup) {
        this.discoGroup.rotation.y = this.mouse.x * 0.45;
        this.discoGroup.rotation.x = this.mouse.y * 0.35 + Math.sin(Date.now() * 0.0015) * 0.04;
      }

      // Particles slow counter-rotation
      if (this.particles) {
        this.particles.rotation.y -= 0.003;
        this.particles.rotation.x += 0.0015;
      }

      // Orbiting light dynamics
      const time = performance.now() * 0.0015;
      this.lightMagenta.position.x = Math.sin(time) * 5.2;
      this.lightMagenta.position.z = Math.cos(time) * 4.6;
      this.lightYellow.position.x = Math.cos(time * 0.85) * 5.2;
      this.lightYellow.position.y = Math.sin(time * 0.9) * 3.6;
      this.lightCyan.position.y = Math.cos(time * 0.7) * 3.8;
      this.lightCyan.position.z = Math.sin(time * 0.7) * 4.8;
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  igniteNight() {
    this.isTriggered = true;
    if (this.autoTimer) clearTimeout(this.autoTimer);
    if (this.onTransitionStart) this.onTransitionStart();

    const tl = gsap.timeline({
      onComplete: () => this.finish()
    });

    // 1. Disco Ball spins rapidly into a glittering blur
    if (this.spinPivot) {
      tl.to(this.spinPivot.rotation, {
        y: '+=14',
        duration: 0.75,
        ease: 'power2.in'
      }, 0);
    }

    // 2. Camera zoom-through straight into the mirror ball
    tl.to(this.camera.position, {
      z: 1.1,
      y: 0.5,
      duration: 0.75,
      ease: 'expo.in'
    }, 0);

    // 3. Volumetric neon light bloom intensifies
    tl.to([this.lightMagenta, this.lightYellow, this.lightCyan, this.lightWhite], {
      intensity: 24,
      duration: 0.75,
      ease: 'power2.in'
    }, 0);

    // 4. UI controls fade out cleanly
    const ui = document.getElementById('preloader-ui');
    if (ui) {
      tl.to(ui, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in'
      }, 0);
    }

    // 5. Container dissolves into 3D tablecloth
    tl.to(this.container, {
      opacity: 0,
      duration: 0.65,
      ease: 'power2.inOut'
    }, '-=0.35');
  }

  forceFinish() {
    if (this.autoTimer) clearTimeout(this.autoTimer);
    if (this.onTransitionStart) this.onTransitionStart();
    gsap.killTweensOf(this.camera.position);
    if (this.spinPivot) gsap.killTweensOf(this.spinPivot.rotation);
    if (this.container) {
      gsap.to(this.container, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => this.finish()
      });
    } else {
      this.finish();
    }
  }

  finish() {
    this.isRunning = false;
    if (this.container) {
      this.container.style.display = 'none';
      this.container.style.pointerEvents = 'none';
    }

    // Free Three.js WebGL resources
    try {
      this.scene.clear();
      this.renderer.dispose();
    } catch (e) {
      // Ignored
    }

    if (this.onComplete) {
      this.onComplete();
    }
  }
}
