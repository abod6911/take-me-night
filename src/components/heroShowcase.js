import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO_DISHES } from '../assets/foodData.js';

gsap.registerPlugin(ScrollTrigger);

export class HeroShowcase {
  constructor(lenis) {
    this.lenis = lenis;
    this.container = document.querySelector('.hero-pin-wrapper');
    this.plates = document.querySelectorAll('.hero-plate-item');
    this.titles = document.querySelectorAll('.hero-title-item');
    this.scripts = document.querySelectorAll('.hero-script-item');
    this.infoIndex = document.getElementById('hero-info-index');
    this.infoTitle = document.getElementById('hero-info-title');
    this.infoDesc = document.getElementById('hero-info-desc');
    this.infoPrice = document.getElementById('hero-info-price');
    this.orderTriggerBtn = document.getElementById('hero-order-trigger');

    this.currentIndex = 0;
    this.init();
  }

  init() {
    this.setupMarquee();
    this.setupScrollTrigger();
    this.setupInteractiveInteractions();

    if (this.orderTriggerBtn) {
      this.orderTriggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentDish = HERO_DISHES[this.currentIndex];
        this.orderTriggerBtn.dataset.pizzaId = currentDish.id;
      });
    }
  }

  setupMarquee() {
    const marqueeTrack = document.querySelector('.hero-ribbon-track');
    if (marqueeTrack) {
      gsap.to(marqueeTrack, {
        xPercent: -50,
        ease: 'none',
        duration: 22,
        repeat: -1
      });
    }
  }

  setupScrollTrigger() {
    const dishCount = HERO_DISHES.length; // 6 pizzas

    // Initial states: plate 0 active, others waiting offscreen right
    this.plates.forEach((plate, i) => {
      if (i === 0) {
        gsap.set(plate, { x: '0vw', y: '0vh', rotation: 0, scale: 1, opacity: 1, pointerEvents: 'auto' });
      } else {
        gsap.set(plate, { x: '65vw', y: '20vh', rotation: 35, scale: 0.85, opacity: 0, pointerEvents: 'none' });
      }
    });

    this.titles.forEach((title, i) => {
      if (i === 0) {
        gsap.set(title, { y: 0, opacity: 1, filter: 'blur(0px)' });
      } else {
        gsap.set(title, { y: 80, opacity: 0, filter: 'blur(6px)' });
      }
    });

    this.scripts.forEach((script, i) => {
      if (i === 0) {
        gsap.set(script, { opacity: 1, y: 0, scale: 1 });
      } else {
        gsap.set(script, { opacity: 0, y: 15, scale: 0.95 });
      }
    });

    // Master Timeline pinned with ScrollTrigger
    // scrub: 0.6 and fastScrollEnd: true ensure 60fps butter-smooth scrolling without lag
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.container,
        start: 'top top',
        end: '+=4200',
        pin: true,
        scrub: 0.6,
        fastScrollEnd: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          this.handleScrubUpdate(self.progress);
        }
      }
    });

    // Diagonal Orbit Transitions across all 6 pizzas:
    // Outgoing Plate: moves along diagonal arc up-left: x: -65vw, y: -35vh, rotation: -35, scale: 0.82
    // Incoming Plate: enters from bottom-right: from x: 65vw, y: 20vh, rotation: 35, scale: 0.85 to x: 0vw, y: 0vh, rotation: 0, scale: 1
    for (let i = 0; i < dishCount - 1; i++) {
      const t = i;

      // Outgoing plate arc up to top-left
      tl.to(this.plates[i], {
        x: '-65vw',
        y: '-35vh',
        rotation: -35,
        scale: 0.82,
        opacity: 0,
        ease: 'power1.inOut'
      }, t);

      // Incoming plate glides in from bottom-right
      tl.fromTo(this.plates[i + 1],
        { x: '65vw', y: '20vh', rotation: 35, scale: 0.85, opacity: 0 },
        { x: '0vw', y: '0vh', rotation: 0, scale: 1, opacity: 1, ease: 'power1.inOut' },
        t
      );

      // Clean Slot-Machine Title Transition with blur elimination (No overlapping stacking)
      tl.to(this.titles[i], {
        y: -80,
        opacity: 0,
        filter: 'blur(6px)',
        ease: 'power2.in'
      }, t);

      tl.fromTo(this.titles[i + 1],
        { y: 80, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', ease: 'power2.out' },
        t + 0.1
      );

      // Script pill badge crossfade
      tl.to(this.scripts[i], { opacity: 0, y: -15, scale: 0.95, ease: 'power2.in' }, t);
      tl.fromTo(this.scripts[i + 1],
        { opacity: 0, y: 15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, ease: 'power2.out' },
        t + 0.1
      );
    }

    this.tl = tl;
  }

  handleScrubUpdate(progress) {
    const dishCount = HERO_DISHES.length;
    // Map scrub progress strictly to the active dish index
    const targetIndex = Math.min(
      Math.max(0, Math.round(progress * (dishCount - 1))),
      dishCount - 1
    );

    if (targetIndex !== this.currentIndex) {
      this.currentIndex = targetIndex;
      this.updateInfoCard(HERO_DISHES[targetIndex]);
    }
  }

  updateInfoCard(dish) {
    if (!dish) return;

    // Instant synchronous DOM update so Card and Plate ALWAYS change at the exact same millisecond
    if (this.infoIndex) this.infoIndex.textContent = `${dish.index} / 06`;
    if (this.infoTitle) this.infoTitle.textContent = dish.name;
    if (this.infoDesc) this.infoDesc.textContent = dish.description;
    if (this.infoPrice) this.infoPrice.innerHTML = `${dish.price} <span class="text-xs text-neon-magenta align-top font-bold">SAR</span>`;

    if (this.orderTriggerBtn) {
      this.orderTriggerBtn.dataset.pizzaId = dish.id;
    }

    // Micro punch animation for crisp visual feedback without delay
    gsap.fromTo([this.infoTitle, this.infoPrice],
      { opacity: 0.6, y: -3 },
      { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
    );
  }

  setupInteractiveInteractions() {
    window.addEventListener('mousemove', (e) => {
      const activePlate = this.plates[this.currentIndex];
      if (!activePlate) return;

      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;

      gsap.to(activePlate, {
        rotationY: normX * 10,
        rotationX: -normY * 10,
        duration: 0.6,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    });
  }
}
