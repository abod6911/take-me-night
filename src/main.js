import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { ThreeCloth } from './components/threeCloth.js';
import { Preloader } from './components/preloader.js';
import { HeroShowcase } from './components/heroShowcase.js';
import { MenuGrid } from './components/menuGrid.js';
import { CartDrawer } from './components/cartDrawer.js';

gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.initLenis();
    this.init3DCloth();
    this.initPreloader();
    this.initHero();
    this.initMenu();
    this.initCart();
    this.initFooterKineticText();
    this.bindGlobalEvents();
  }

  initLenis() {
    this.lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  init3DCloth() {
    const webglContainer = document.getElementById('webgl-container');
    if (webglContainer) {
      this.threeCloth = new ThreeCloth(webglContainer);

      // Render loop
      const animate = () => {
        this.threeCloth.update();
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }

  initPreloader() {
    this.preloader = new Preloader(() => {
      this.onIntroComplete();
    });
  }

  onIntroComplete() {
    // Reveal completed: trigger instant coordinated entrance
    gsap.fromTo('.neon-sign-badge, .vertical-barcode-strip, .hero-ribbon-container, .hero-info-card, .fixed-chrome .nav-pill',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.22, stagger: 0.02, ease: 'power2.out' }
    );
  }

  initHero() {
    this.heroShowcase = new HeroShowcase(this.lenis);
  }

  initMenu() {
    this.menuGrid = new MenuGrid(this.threeCloth);
  }

  initCart() {
    this.cartDrawer = new CartDrawer();
  }

  initFooterKineticText() {
    const footerTitle = document.querySelector('.footer-giant-title');
    if (footerTitle) {
      // Split characters for kinetic slot-machine stagger effect
      const text = footerTitle.textContent.trim();
      footerTitle.innerHTML = '';
      
      const chars = text.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className = 'inline-block transition-transform will-change-transform';
        footerTitle.appendChild(span);
        return span;
      });

      gsap.fromTo(chars,
        {
          yPercent: 100,
          rotateX: -60,
          opacity: 0
        },
        {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          stagger: 0.03,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerTitle,
            start: 'top 85%'
          }
        }
      );
    }
  }

  bindGlobalEvents() {
    // Smooth scroll for nav menu button
    const navMenuBtn = document.getElementById('nav-menu-btn');
    if (navMenuBtn) {
      navMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const menuSec = document.getElementById('the-menu');
        if (menuSec && this.lenis) {
          this.lenis.scrollTo(menuSec, { offset: 0, duration: 1.3 });
        } else if (menuSec) {
          menuSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
