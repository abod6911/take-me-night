import gsap from 'gsap';
import { HERO_DISHES, SIZE_OPTIONS, CRUST_OPTIONS, EXTRA_DIPS, resolveDishImg } from '../assets/foodData.js';

export class CartDrawer {
  constructor() {
    this.cart = [];
    this.orderType = 'pickup'; // 'pickup' or 'delivery'
    this.paymentMethod = 'apple_pay'; // 'apple_pay', 'mada', or 'cash'
    this.customizingPizza = null;

    // DOM Elements
    this.drawer = document.getElementById('cart-drawer');
    this.backdrop = document.getElementById('cart-backdrop');
    this.closeBtn = document.getElementById('cart-close-btn');
    this.cartEmptyState = document.getElementById('cart-empty-state');
    this.cartActiveState = document.getElementById('cart-active-state');
    this.exploreMenuBtn = document.getElementById('cart-explore-menu-btn');
    this.cartItemsList = document.getElementById('cart-items-list');
    this.cartSubtotal = document.getElementById('cart-subtotal');
    this.cartDelivery = document.getElementById('cart-delivery');
    this.cartTotal = document.getElementById('cart-total');
    this.btnTotalLabel = document.getElementById('btn-total-label');
    this.stickyCartBtn = document.getElementById('sticky-cart-btn');
    this.stickyCartCount = document.getElementById('sticky-cart-count');
    this.stickyCartTotal = document.getElementById('sticky-cart-total');
    this.navCartBtn = document.getElementById('nav-cart-btn');
    this.navCartCount = document.getElementById('nav-cart-count');

    // Customizer Modal Elements
    this.customizerModal = document.getElementById('customizer-modal');
    this.customizerBackdrop = document.getElementById('customizer-backdrop');
    this.customizerCloseBtn = document.getElementById('customizer-close');
    this.customizerConfirmBtn = document.getElementById('customizer-confirm-btn');

    // Checkout Form & Tracker
    this.checkoutForm = document.getElementById('cart-checkout-form');
    this.confirmOrderBtn = document.getElementById('confirm-order-btn');
    this.orderTracker = document.getElementById('order-tracker');
    this.whatsappOrderBtn = document.getElementById('whatsapp-order-btn');

    this.isOpen = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderCart();
  }

  bindEvents() {
    // Open drawer triggers
    if (this.stickyCartBtn) {
      this.stickyCartBtn.addEventListener('click', () => this.open());
    }
    if (this.navCartBtn) {
      this.navCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    }

    // Close drawer
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Explore menu button inside empty state
    if (this.exploreMenuBtn) {
      this.exploreMenuBtn.addEventListener('click', () => {
        this.close();
        const menuSec = document.getElementById('the-menu');
        if (menuSec) {
          menuSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Global order trigger buttons (from Hero, Menu, etc.)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.btn-order-trigger');
      if (target) {
        e.preventDefault();
        const pizzaId = target.dataset.pizzaId;
        const pizza = HERO_DISHES.find(p => p.id === pizzaId) || HERO_DISHES[0];
        this.openCustomizer(pizza);
      }
    });

    // Customizer Close
    if (this.customizerCloseBtn) {
      this.customizerCloseBtn.addEventListener('click', () => this.closeCustomizer());
    }
    if (this.customizerBackdrop) {
      this.customizerBackdrop.addEventListener('click', () => this.closeCustomizer());
    }

    // Customizer Confirm Add
    if (this.customizerConfirmBtn) {
      this.customizerConfirmBtn.addEventListener('click', () => {
        this.addCustomizedPizzaToCart();
      });
    }

    // Order Type Segmented Toggle (Pickup vs Fast Delivery)
    const typePills = document.querySelectorAll('.order-type-pill');
    typePills.forEach(pill => {
      pill.addEventListener('click', () => {
        typePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.orderType = pill.dataset.type;
        const addressRow = document.getElementById('delivery-address-row');
        if (addressRow) {
          addressRow.style.display = this.orderType === 'delivery' ? 'block' : 'none';
        }
        this.renderCart();
      });
    });

    // 1-Tap Upsell Dip Chips
    document.querySelectorAll('.cart-upsell-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const dipId = chip.dataset.id;
        const dipName = chip.dataset.name;
        const dipPrice = parseInt(chip.dataset.price, 10);
        this.addDipToCart(dipId, dipName, dipPrice);
      });
    });

    // Interactive Payment Method Cards
    const paymentCards = document.querySelectorAll('.payment-card');
    paymentCards.forEach(card => {
      card.addEventListener('click', () => {
        paymentCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.paymentMethod = card.dataset.method;
      });
    });

    // Checkout Form Submit
    if (this.checkoutForm) {
      this.checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCheckoutSubmit();
      });
    }

    // Reset order
    const resetOrderBtn = document.getElementById('reset-order-btn');
    if (resetOrderBtn) {
      resetOrderBtn.addEventListener('click', () => {
        this.cart = [];
        this.renderCart();
        if (this.orderTracker) this.orderTracker.classList.add('hidden');
        if (this.checkoutForm) this.checkoutForm.classList.remove('hidden');
        this.close();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.customizerModal && !this.customizerModal.classList.contains('hidden')) {
          this.closeCustomizer();
        } else if (this.isOpen) {
          this.close();
        }
      }
    });
  }

  openCustomizer(pizza) {
    this.customizingPizza = pizza;
    const titleEl = document.getElementById('customizer-pizza-title');
    const descEl = document.getElementById('customizer-pizza-desc');
    const imgEl = document.getElementById('customizer-pizza-img');
    const basePriceEl = document.getElementById('customizer-base-price');

    if (titleEl) titleEl.textContent = pizza.name;
    if (descEl) descEl.textContent = pizza.description;
    if (imgEl) imgEl.src = pizza.image;
    if (basePriceEl) basePriceEl.textContent = `${pizza.price} SAR`;

    // Reset option selections to defaults
    document.querySelectorAll('.custom-size-pill').forEach((p, idx) => {
      p.classList.toggle('active', idx === 0);
    });
    document.querySelectorAll('.custom-crust-pill').forEach((p, idx) => {
      p.classList.toggle('active', idx === 0);
    });
    document.querySelectorAll('.custom-dip-chip').forEach(p => {
      p.classList.remove('active');
    });

    this.updateCustomizerTotal();

    // Bind real-time click price updates
    document.querySelectorAll('.custom-size-pill, .custom-crust-pill, .custom-dip-chip').forEach(pill => {
      pill.onclick = () => {
        if (pill.classList.contains('custom-size-pill')) {
          document.querySelectorAll('.custom-size-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
        } else if (pill.classList.contains('custom-crust-pill')) {
          document.querySelectorAll('.custom-crust-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
        } else {
          pill.classList.toggle('active');
        }
        this.updateCustomizerTotal();
      };
    });

    this.customizerModal.classList.remove('hidden');
    this.customizerModal.style.display = 'flex';

    gsap.fromTo('#customizer-dialog',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.6)' }
    );
  }

  updateCustomizerTotal() {
    if (!this.customizingPizza) return;
    let total = this.customizingPizza.price;

    const activeSize = document.querySelector('.custom-size-pill.active');
    if (activeSize && activeSize.dataset.price) {
      total += parseInt(activeSize.dataset.price, 10);
    }

    const activeCrust = document.querySelector('.custom-crust-pill.active');
    if (activeCrust && activeCrust.dataset.price) {
      total += parseInt(activeCrust.dataset.price, 10);
    }

    document.querySelectorAll('.custom-dip-chip.active').forEach(chip => {
      total += parseInt(chip.dataset.price || '0', 10);
    });

    const confirmPriceEl = document.getElementById('customizer-confirm-price');
    if (confirmPriceEl) {
      confirmPriceEl.textContent = `${total} SAR`;
    }
  }

  closeCustomizer() {
    gsap.to('#customizer-dialog', {
      opacity: 0,
      y: 20,
      scale: 0.96,
      duration: 0.2,
      onComplete: () => {
        this.customizerModal.style.display = 'none';
        this.customizerModal.classList.add('hidden');
        this.customizingPizza = null;
      }
    });
  }

  addCustomizedPizzaToCart() {
    if (!this.customizingPizza) return;

    const activeSize = document.querySelector('.custom-size-pill.active');
    const sizeName = activeSize ? activeSize.dataset.name : 'Regular 10"';
    const sizePrice = activeSize ? parseInt(activeSize.dataset.price, 10) : 0;

    const activeCrust = document.querySelector('.custom-crust-pill.active');
    const crustName = activeCrust ? activeCrust.dataset.name : 'Classic Sourdough';
    const crustPrice = activeCrust ? parseInt(activeCrust.dataset.price, 10) : 0;

    const dips = [];
    let dipsPrice = 0;
    document.querySelectorAll('.custom-dip-chip.active').forEach(chip => {
      dips.push(chip.dataset.name);
      dipsPrice += parseInt(chip.dataset.price || '0', 10);
    });

    const itemPrice = this.customizingPizza.price + sizePrice + crustPrice + dipsPrice;

    this.cart.push({
      id: Date.now().toString(),
      pizzaId: this.customizingPizza.id,
      name: this.customizingPizza.name,
      image: this.customizingPizza.image,
      size: sizeName,
      crust: crustName,
      dips: dips,
      price: itemPrice,
      quantity: 1
    });

    this.closeCustomizer();
    this.renderCart();
    this.open();
  }

  addDipToCart(dipId, dipName, dipPrice) {
    const existingDip = this.cart.find(i => i.pizzaId === 'dip_' + dipId);
    if (existingDip) {
      existingDip.quantity += 1;
    } else {
      this.cart.push({
        id: 'dip_' + dipId + '_' + Date.now(),
        pizzaId: 'dip_' + dipId,
        name: dipName,
        image: resolveDishImg('take_me_night.png'),
        size: '1x Dip Pot',
        crust: 'House Blend',
        dips: [],
        price: dipPrice,
        quantity: 1,
        isDip: true
      });
    }
    this.renderCart();
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.drawer.classList.remove('hidden');
    this.drawer.style.display = 'flex';

    gsap.fromTo(this.backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );

    gsap.fromTo('#cart-drawer-panel',
      { x: '100%' },
      { x: '0%', duration: 0.45, ease: 'power3.out' }
    );
  }

  close() {
    if (!this.isOpen) return;
    gsap.to('#cart-drawer-panel', {
      x: '100%',
      duration: 0.3,
      ease: 'power3.in'
    });
    gsap.to(this.backdrop, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        this.drawer.style.display = 'none';
        this.drawer.classList.add('hidden');
        this.isOpen = false;
      }
    });
  }

  renderCart() {
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = this.orderType === 'delivery' && totalItems > 0 ? 15 : 0;
    const finalTotal = subtotal + deliveryFee;

    // Sticky & Nav pills
    if (this.stickyCartCount) this.stickyCartCount.textContent = totalItems;
    if (this.stickyCartTotal) this.stickyCartTotal.textContent = `${finalTotal} SAR`;
    if (this.navCartCount) this.navCartCount.textContent = totalItems;

    if (this.stickyCartBtn) {
      this.stickyCartBtn.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // STATE SWITCHING: Empty vs Active
    if (this.cart.length === 0) {
      if (this.cartEmptyState) this.cartEmptyState.classList.remove('hidden');
      if (this.cartActiveState) this.cartActiveState.classList.add('hidden');
      if (this.orderTracker) this.orderTracker.classList.add('hidden');
      return;
    } else {
      if (this.cartEmptyState) this.cartEmptyState.classList.add('hidden');
      if (this.cartActiveState) this.cartActiveState.classList.remove('hidden');
    }

    if (!this.cartItemsList) return;

    // Render Itemized Pizza & Dip Cards with Quantity Stepper Buttons (- / 1 / +)
    this.cartItemsList.innerHTML = this.cart.map((item, idx) => `
      <div class="flex items-center gap-3.5 p-3.5 bg-[#140D20] rounded-2xl border border-white/10 relative group hover:border-neon-magenta/40 transition-colors">
        <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover shrink-0 border border-neon-magenta/60 shadow-md" onerror="this.onerror=null; this.src='./dishes/take_me_night.png';" />
        <div class="flex-1 min-w-0">
          <h4 class="font-sans font-black text-white text-sm uppercase tracking-wide truncate leading-tight">
            ${item.name}
          </h4>
          <div class="font-mono text-[10px] text-neutral-400 leading-tight mt-0.5">
            ${item.size} • ${item.crust}
            ${item.dips && item.dips.length ? `<br><span class="text-neon-yellow">+ ${item.dips.join(', ')}</span>` : ''}
          </div>
          <div class="flex items-center justify-between mt-2">
            <!-- Stepper controls -->
            <div class="flex items-center gap-2">
              <button type="button" class="cart-stepper-btn stepper-minus" data-idx="${idx}" aria-label="Decrease quantity">−</button>
              <span class="font-sans font-bold text-xs text-white min-w-[14px] text-center">${item.quantity}</span>
              <button type="button" class="cart-stepper-btn stepper-plus" data-idx="${idx}" aria-label="Increase quantity">+</button>
            </div>
            <!-- Item Price -->
            <div class="font-sans font-black text-neon-yellow text-sm">
              ${item.price * item.quantity} SAR
            </div>
          </div>
        </div>
        <button class="cart-remove-btn w-6 h-6 rounded-full bg-white/5 hover:bg-neon-magenta text-neutral-400 hover:text-white text-xs flex items-center justify-center font-bold transition-colors cursor-pointer shrink-0 ml-1" data-idx="${idx}" aria-label="Remove item">
          ✕
        </button>
      </div>
    `).join('');

    // Bind Stepper Minus & Plus buttons
    this.cartItemsList.querySelectorAll('.stepper-minus').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        if (this.cart[idx].quantity > 1) {
          this.cart[idx].quantity -= 1;
        } else {
          this.cart.splice(idx, 1);
        }
        this.renderCart();
      };
    });

    this.cartItemsList.querySelectorAll('.stepper-plus').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        this.cart[idx].quantity += 1;
        this.renderCart();
      };
    });

    // Bind Remove buttons
    this.cartItemsList.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        this.cart.splice(idx, 1);
        this.renderCart();
      };
    });

    // Summary lines update
    if (this.cartSubtotal) this.cartSubtotal.textContent = `${subtotal} SAR`;
    if (this.cartDelivery) this.cartDelivery.textContent = deliveryFee > 0 ? `${deliveryFee} SAR` : 'FREE';
    if (this.cartTotal) this.cartTotal.textContent = `${finalTotal} SAR`;
    if (this.btnTotalLabel) this.btnTotalLabel.textContent = `${finalTotal} SAR`;
  }

  handleCheckoutSubmit() {
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const addressInput = document.getElementById('checkout-address');

    const customerName = nameInput ? nameInput.value : 'Guest';
    const customerPhone = phoneInput ? phoneInput.value : '';
    const customerAddress = addressInput ? addressInput.value : '';

    const orderNum = 'TMN-' + Math.floor(100 + Math.random() * 900);
    const subtotal = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = this.orderType === 'delivery' ? 15 : 0;
    const finalTotal = subtotal + deliveryFee;

    const paymentLabel = this.paymentMethod === 'apple_pay' ? 'Apple Pay' : (this.paymentMethod === 'mada' ? 'Mada' : 'Cash');

    // Build WhatsApp message text
    const itemsLines = this.cart.map(i => `• ${i.quantity}x ${i.name} (${i.size}, ${i.crust}) - ${i.price * i.quantity} SAR`).join('%0A');
    const waText = encodeURI(
      `🍕 *NEW ORDER #${orderNum}* — *take me night*%0A` +
      `*Customer:* ${customerName}%0A` +
      `*Phone:* ${customerPhone}%0A` +
      `*Order Type:* ${this.orderType.toUpperCase()}${this.orderType === 'delivery' ? ` (%0A*Address:* ${customerAddress})` : ''}%0A` +
      `*Payment:* ${paymentLabel}%0A%0A` +
      `*Items:*%0A${itemsLines}%0A%0A` +
      `*Total:* ${finalTotal} SAR (VAT Included)`
    );

    if (this.whatsappOrderBtn) {
      this.whatsappOrderBtn.href = `https://wa.me/966558904421?text=${waText}`;
    }

    const orderNumEl = document.getElementById('tracker-order-number');
    if (orderNumEl) orderNumEl.textContent = `Order #${orderNum}`;

    if (this.cartActiveState) this.cartActiveState.classList.add('hidden');
    if (this.orderTracker) {
      this.orderTracker.classList.remove('hidden');
      gsap.fromTo(this.orderTracker,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }
      );
    }
  }
}
