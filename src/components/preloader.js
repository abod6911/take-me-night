import * as THREE from 'three';
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

    this.init();
  }

  init() {
    this.initThree();
    this.createDiscoBall();
    this.createSparkleParticles();
    this.bindEvents();
    this.animate();

    // Smooth progress bar over 10 seconds of ambient viewing
    if (this.progressBar) {
      this.progressBar.style.transition = 'width 10s linear';
      requestAnimationFrame(() => {
        this.progressBar.style.width = '100%';
      });
    }

    // Generous 10-second ambient timer so user can enjoy the 3D scene and click/tap when ready
    this.autoTimer = setTimeout(() => {
      if (!this.isTriggered) {
        this.igniteNight();
      }
    }, 10000);
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
    this.renderer.toneMappingExposure = 1.35;

    // Ambient light with atmospheric magenta-purple tint
    const ambientLight = new THREE.AmbientLight(0x4a2060, 1.4);
    this.scene.add(ambientLight);

    // Hemisphere light for global silver facet illumination
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x221133, 2.2);
    this.scene.add(hemiLight);

    // Key directional light illuminating front facets
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(2, 4, 6);
    this.scene.add(keyLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.3);
    backLight.position.set(-3, -2, -4);
    this.scene.add(backLight);

    // Orbiting PointLights for dazzling colored glints
    // 1. Electric Magenta (#FF14D4)
    this.lightMagenta = new THREE.PointLight(0xFF14D4, 8.0, 26);
    this.lightMagenta.position.set(-4.0, 2.0, 4);
    this.scene.add(this.lightMagenta);

    // 2. Laser Yellow (#FFE600)
    this.lightYellow = new THREE.PointLight(0xFFE600, 7.0, 26);
    this.lightYellow.position.set(4.0, -1.5, 3.5);
    this.scene.add(this.lightYellow);

    // 3. Neon Cyan (#00E5FF)
    this.lightCyan = new THREE.PointLight(0x00E5FF, 5.0, 22);
    this.lightCyan.position.set(-1.0, -3.5, 4.5);
    this.scene.add(this.lightCyan);

    // 4. White Specular Key
    this.lightWhite = new THREE.PointLight(0xFFFFFF, 5.5, 20);
    this.lightWhite.position.set(0.5, 3.5, 4.0);
    this.scene.add(this.lightWhite);
  }

  createDiscoBall() {
    this.discoGroup = new THREE.Group();
    // Position disco ball commanding center (centered at ~0.65 in viewport)
    this.discoGroup.position.set(0, 0.65, 0);

    // Faceted Mirror Sphere Geometry (54 x 32 creates sharp, glittering square mirrored facets)
    const sphereGeo = new THREE.SphereGeometry(1.72, 54, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.94,
      roughness: 0.11,
      flatShading: true
    });
    this.discoBall = new THREE.Mesh(sphereGeo, sphereMat);
    this.discoGroup.add(this.discoBall);

    // Metallic Brass Cap, Ring and Suspension Cable stretching up
    const capGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.18, 32);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.18
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 1.80;
    this.discoGroup.add(cap);

    const ringGeo = new THREE.TorusGeometry(0.18, 0.035, 16, 32);
    const ring = new THREE.Mesh(ringGeo, capMat);
    ring.position.y = 2.0;
    ring.rotation.y = Math.PI / 4;
    this.discoGroup.add(ring);

    const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, 14, 16);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.position.y = 9.0;
    this.discoGroup.add(cable);

    this.scene.add(this.discoGroup);
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
      if (this.discoBall) {
        this.discoBall.rotation.y += 0.009;
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

    const tl = gsap.timeline({
      onComplete: () => this.finish()
    });

    // 1. Disco Ball spins rapidly into a glittering blur
    if (this.discoBall) {
      tl.to(this.discoBall.rotation, {
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
    gsap.killTweensOf(this.camera.position);
    if (this.discoBall) gsap.killTweensOf(this.discoBall.rotation);
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
