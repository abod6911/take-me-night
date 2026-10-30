import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MENU_DISHES } from '../assets/foodData.js';

gsap.registerPlugin(ScrollTrigger);

export class MenuGrid {
  constructor(threeCloth) {
    this.threeCloth = threeCloth;
    this.section = document.getElementById('the-menu');
    this.gridContainer = document.getElementById('menu-grid-container');

    this.init();
  }

  init() {
    this.renderCards();
    this.setupScrollTriggers();
    this.setupCardMicroInteractions();
  }

  renderCards() {
    if (!this.gridContainer) return;

    this.gridContainer.innerHTML = '';

    MENU_DISHES.forEach((dish, idx) => {
      const isCol2 = idx % 2 === 1;

      const cardWrapper = document.createElement('div');
      cardWrapper.className = `menu-card-wrapper relative group ${isCol2 ? 'md:mt-12 col-2-card' : 'col-1-card'}`;

      cardWrapper.innerHTML = `
        <!-- Laser Yellow backing offset card (10px down & 10px right) -->
        <div class="menu-card-backing"></div>
        
        <!-- Main Electric Magenta card body -->
        <div class="menu-card-front">
          
          <!-- Protruding circular black plate overlapping outside left edge -->
          <div class="menu-plate-col">
            <div class="menu-plate-disc">
              <img 
                src="${dish.image}" 
                alt="${dish.name}" 
                class="w-full h-full object-cover rounded-full"
                loading="lazy"
                decoding="async"
                width="200"
                height="200"
                onerror="this.onerror=null; this.src='./dishes/${dish.id}.png';"
              />
            </div>
          </div>

          <!-- Card Content Column -->
          <div class="flex-1 flex flex-col justify-between z-10 w-full min-w-0">
            
            <div class="flex items-start justify-between gap-2 mb-2">
              <div>
                <span class="inline-block px-2 py-0.5 rounded-full bg-black/40 text-neon-yellow font-mono text-[9px] font-bold uppercase tracking-wider mb-1">
                  ${dish.badge}
                </span>
                <h3 class="font-display font-black text-2xl sm:text-3xl tracking-tight uppercase leading-none text-white drop-shadow-sm">
                  ${dish.name}
                </h3>
              </div>
              <!-- Index badge -->
              <div class="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center font-mono text-xs text-white/95 shrink-0">
                ${dish.index}
              </div>
            </div>

            <!-- Description text -->
            <p class="font-mono text-xs sm:text-sm text-[#F8F6FA]/95 leading-relaxed mb-6 font-normal">
              ${dish.description}
            </p>

            <!-- Bottom Row: Laser Yellow Price & Order Button -->
            <div class="flex items-center justify-between pt-4 border-t border-white/20 gap-3">
              <div class="font-display font-black text-2xl sm:text-3xl text-neon-yellow tracking-tight">
                ${dish.price} <span class="text-xs text-white align-top font-bold">SAR</span>
              </div>
              <button 
                type="button" 
                class="btn-order-trigger bg-neon-yellow text-[#0B0711] hover:bg-white font-display font-black text-xs sm:text-sm tracking-wider uppercase px-5 sm:px-6 py-2.5 rounded-full shadow-lg transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                data-pizza-id="${dish.id}"
              >
                ADD TO ORDER +
              </button>
            </div>

          </div>
        </div>
      `;

      this.gridContainer.appendChild(cardWrapper);
    });
  }

  setupScrollTriggers() {
    // 1. Smoothly morph 3D background shader to Electric Magenta (#D411B8 & #F8F6FA)
    if (this.section && this.threeCloth) {
      ScrollTrigger.create({
        trigger: this.section,
        start: 'top 80%',
        end: 'bottom 20%',
        onUpdate: (self) => {
          this.threeCloth.setPaletteShift(self.progress);
        }
      });
    }

    // 2. Parallax vertical stagger between Column 1 and Column 2 on desktop
    if (window.innerWidth >= 768) {
      const col2Cards = document.querySelectorAll('.col-2-card');
      col2Cards.forEach((card) => {
        gsap.to(card, {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      });
    }

    // 3. Staggered card entrance reveal
    const cards = document.querySelectorAll('.menu-card-wrapper');
    gsap.fromTo(cards, 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: this.gridContainer,
          start: 'top 85%'
        }
      }
    );
  }

  setupCardMicroInteractions() {
    const cards = document.querySelectorAll('.menu-card-front');
    cards.forEach(card => {
      let rect = null;
      let rafId = null;

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
      }, { passive: true });

      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `perspective(1000px) rotateX(${-y * 0.015}deg) rotateY(${x * 0.015}deg) translateY(-2px)`;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = '';
        rect = null;
      }, { passive: true });
    });
  }
}
