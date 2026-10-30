import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

export class Preloader {
  constructor(onComplete) {
    this.onComplete = onComplete;
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

    this.init();
  }

  init() {
    this.initThree();
    this.createStudioEnvironment();
    this.createDiscoBall();
    this.createSparkleParticles();
    this.bindEvents();
    this.animate();

    // Start auto progress bar animation
    if (this.progressBar) {
      requestAnimationFrame(() => {
        this.progressBar.style.width = '100%';
      });
    }

    // Auto progression after 2.8 seconds if user does not click
    this.autoTimer = setTimeout(() => {
      if (!this.isTriggered) {
        this.igniteNight();
      }
    }, 2800);
  }

  initThree() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07040C);

    const aspect = this.width / this.height;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 7.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.45;

    // Ambient light with atmospheric magenta-purple tint
    const ambientLight = new THREE.AmbientLight(0x4a2060, 1.5);
    this.scene.add(ambientLight);

    // Hemisphere light for global silver facet illumination
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x221133, 2.4);
    this.scene.add(hemiLight);

    // Key directional light illuminating front facets
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(2, 4, 6);
    this.scene.add(keyLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 2.2);
    backLight.position.set(-3, -2, -4);
    this.scene.add(backLight);

    // Orbiting PointLights for dazzling colored glints
    // 1. Electric Magenta (#FF14D4)
    this.lightMagenta = new THREE.PointLight(0xFF14D4, 12.0, 32);
    this.lightMagenta.position.set(-4.0, 2.0, 4);
    this.scene.add(this.lightMagenta);

    // 2. Laser Yellow (#FFE600)
    this.lightYellow = new THREE.PointLight(0xFFE600, 10.0, 32);
    this.lightYellow.position.set(4.0, -1.5, 3.5);
    this.scene.add(this.lightYellow);

    // 3. Neon Cyan (#00E5FF)
    this.lightCyan = new THREE.PointLight(0x00E5FF, 7.5, 26);
    this.lightCyan.position.set(-1.0, -3.5, 4.5);
    this.scene.add(this.lightCyan);

    // 4. White Specular Key
    this.lightWhite = new THREE.PointLight(0xFFFFFF, 7.0, 22);
    this.lightWhite.position.set(0.5, 3.5, 4.0);
    this.scene.add(this.lightWhite);
  }

  createStudioEnvironment() {
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      pmremGenerator.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x060309);

      // Studio light orbs simulating neon night club ambiance
      const addLightRig = (color, x, y, z, size) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(size, 16, 16),
          new THREE.MeshBasicMaterial({ color })
        );
        mesh.position.set(x, y, z);
        envScene.add(mesh);
      };

      addLightRig(0xFF14D4, -7, 6, 4, 3.2);  // Electric Magenta
      addLightRig(0xFFE600, 7, -4, 4, 3.0);  // Laser Yellow
      addLightRig(0x00E5FF, -2, -6, 5, 2.5); // Neon Cyan
      addLightRig(0xFFFFFF, 0, 9, 2, 4.0);   // Overhead High Specular
      addLightRig(0xFF14D4, 6, 6, -6, 3.5);  // Back-rim Magenta
      addLightRig(0x9D00FF, -6, -2, -5, 3.0);// Ultraviolet Deep Rim

      const renderTarget = pmremGenerator.fromScene(envScene);
      this.scene.environment = renderTarget.texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('Could not generate studio environment:', e);
    }
  }

  createDiscoBall() {
    this.discoGroup = new THREE.Group();
    // Position disco ball commanding center (centered at ~0.55 in viewport)
    this.discoGroup.position.set(0, 0.55, 0);

    // Sub-group for spinning rotation
    this.spinPivot = new THREE.Group();
    this.discoGroup.add(this.spinPivot);

    // Initial placeholder/fallback faceted mirror sphere
    const sphereGeo = new THREE.SphereGeometry(1.68, 52, 30);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xf2f4fb,
      metalness: 0.98,
      roughness: 0.12,
      flatShading: true,
      envMapIntensity: 3.0
    });
    this.placeholderMesh = new THREE.Mesh(sphereGeo, sphereMat);
    this.spinPivot.add(this.placeholderMesh);
    this.discoBall = this.spinPivot;

    // Suspension Cable stretching up into infinity
    const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, 16, 16);
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2
    });
    this.cable = new THREE.Mesh(cableGeo, cableMat);
    this.cable.position.y = 9.8;
    this.discoGroup.add(this.cable);

    this.scene.add(this.discoGroup);

    // Load actual GLTF 3D Disco Ball Model using GLTFLoader
    this.loadGLTFModel();
  }

  loadGLTFModel() {
    const loader = new GLTFLoader();
    const basePath = import.meta.env.BASE_URL || './';
    const cleanBase = basePath.endsWith('/') ? basePath : basePath + '/';
    const modelUrl = `${cleanBase}models/disco_ball.glb`;

    loader.load(
      modelUrl,
      (gltf) => {
        try {
          const model = gltf.scene;

          // Accurately locate the ball sphere mesh vs total hierarchy
          const sphereMesh = model.getObjectByName('Base_Sphere_DiscoBall_0');
          let centerOffset = new THREE.Vector3();
          let sphereRadius = 1.0;

          if (sphereMesh) {
            const sphereBox = new THREE.Box3().setFromObject(sphereMesh);
            sphereBox.getCenter(centerOffset);
            const sphereSize = new THREE.Vector3();
            sphereBox.getSize(sphereSize);
            sphereRadius = Math.max(sphereSize.x, sphereSize.y, sphereSize.z) * 0.5;
          } else {
            const box = new THREE.Box3().setFromObject(model);
            box.getCenter(centerOffset);
            const size = new THREE.Vector3();
            box.getSize(size);
            sphereRadius = Math.max(size.x, size.y, size.z) * 0.5;
          }

          // Center the sphere precisely inside an inner offset group
          const centeredContainer = new THREE.Group();
          model.position.set(-centerOffset.x, -centerOffset.y, -centerOffset.z);
          centeredContainer.add(model);

          // Target sphere diameter: ~3.38 units (radius ~1.69)
          const targetScale = 3.38 / (sphereRadius * 2 || 1.0);
          centeredContainer.scale.setScalar(targetScale);

          // Apply ultra-reflective PBR disco ball shaders to all model meshes
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              const name = child.name || '';
              const matName = child.material?.name || '';

              if (name.includes('Reflective') || matName.includes('Reflective')) {
                // High-specular disco mirror tiles
                this.tuneReflectiveTilesMaterial(child.material);
              } else if (name.includes('Fix') || name.includes('Chain') || matName.includes('Metal')) {
                // Brass/Gold metallic suspension chain and hook
                this.tuneMetalHangerMaterial(child.material);
              } else if (name.includes('Sphere') || matName.includes('DiscoBall')) {
                // Internal base sphere
                this.tuneBaseSphereMaterial(child.material);
              } else {
                this.tuneGenericMaterial(child.material);
              }
            }
          });

          // Adjust top cable position to match top of model's hanger
          const totalBox = new THREE.Box3().setFromObject(centeredContainer);
          if (this.cable) {
            this.cable.position.y = totalBox.max.y + 7.8;
          }

          // Smoothly cross-fade from placeholder to actual GLTF model
          if (this.placeholderMesh) {
            gsap.to(this.placeholderMesh.scale, {
              x: 0,
              y: 0,
              z: 0,
              duration: 0.45,
              ease: 'power2.out',
              onComplete: () => {
                this.spinPivot.remove(this.placeholderMesh);
                if (this.placeholderMesh.geometry) this.placeholderMesh.geometry.dispose();
                this.placeholderMesh = null;
              }
            });
          }

          centeredContainer.scale.set(0.01, 0.01, 0.01);
          this.spinPivot.add(centeredContainer);
          gsap.to(centeredContainer.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: 0.65,
            ease: 'back.out(1.4)'
          });

          this.gltfModel = centeredContainer;
          this.isModelLoaded = true;
          console.log('✅ GLTF Disco Ball loaded & centered with PBR reflections:', { sphereRadius, targetScale });
        } catch (err) {
          console.warn('Error configuring GLTF disco ball:', err);
        }
      },
      (xhr) => {
        if (xhr.total > 0 && this.progressBar) {
          const percent = (xhr.loaded / xhr.total) * 100;
          this.progressBar.style.width = `${Math.max(20, percent)}%`;
        }
      },
      (error) => {
        console.warn('GLTF load failed, using procedural fallback:', error);
      }
    );
  }

  tuneReflectiveTilesMaterial(mat) {
    if (!mat) return;
    if (Array.isArray(mat)) {
      mat.forEach(m => this.tuneReflectiveTilesMaterial(m));
      return;
    }
    mat.metalness = 0.98;
    mat.roughness = 0.10;
    mat.color = new THREE.Color(0xF0F4FF);
    mat.envMapIntensity = 3.6;
    mat.needsUpdate = true;
  }

  tuneMetalHangerMaterial(mat) {
    if (!mat) return;
    if (Array.isArray(mat)) {
      mat.forEach(m => this.tuneMetalHangerMaterial(m));
      return;
    }
    mat.metalness = 0.92;
    mat.roughness = 0.22;
    mat.color = new THREE.Color(0xE5BA42); // Warm brass gold
    mat.envMapIntensity = 2.4;
    mat.needsUpdate = true;
  }

  tuneBaseSphereMaterial(mat) {
    if (!mat) return;
    if (Array.isArray(mat)) {
      mat.forEach(m => this.tuneBaseSphereMaterial(m));
      return;
    }
    mat.metalness = 0.85;
    mat.roughness = 0.35;
    mat.color = new THREE.Color(0x15121E);
    mat.needsUpdate = true;
  }

  tuneGenericMaterial(mat) {
    if (!mat) return;
    if (Array.isArray(mat)) {
      mat.forEach(m => this.tuneGenericMaterial(m));
      return;
    }
    mat.metalness = Math.max(mat.metalness !== undefined ? mat.metalness : 0.8, 0.85);
    mat.roughness = Math.min(mat.roughness !== undefined ? mat.roughness : 0.2, 0.2);
    mat.needsUpdate = true;
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

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Cursor Parallax
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
      this.discoBall.rotation.y += 0.009;
      // Slight atmospheric sway
      this.discoGroup.rotation.y = this.mouse.x * 0.45;
      this.discoGroup.rotation.x = this.mouse.y * 0.35 + Math.sin(Date.now() * 0.0015) * 0.04;

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

    const tl = gsap.timeline({
      onComplete: () => this.finish()
    });

    // 1. Disco Ball spins rapidly into a glittering blur
    tl.to(this.discoBall.rotation, {
      y: '+=14',
      duration: 0.75,
      ease: 'power2.in'
    }, 0);

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
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.discoBall.rotation);
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
