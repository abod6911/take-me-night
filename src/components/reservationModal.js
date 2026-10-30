import gsap from 'gsap';

export class ReservationModal {
  constructor(audioSynth) {
    this.audioSynth = audioSynth;
    this.modal = document.getElementById('reservation-modal');
    this.backdrop = document.getElementById('modal-backdrop');
    this.dialog = document.getElementById('modal-dialog');
    this.closeBtn = document.getElementById('modal-close');
    this.form = document.getElementById('reservation-form');
    this.successState = document.getElementById('modal-success');
    this.resetBtn = document.getElementById('modal-reset-btn');
    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.modal) return;

    // Attach click listeners to all buttons with data-reserve or class
    document.querySelectorAll('.btn-reserve-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dishName = btn.dataset.dish || '';
        this.open(dishName);
      });
    });

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.form.reset();
        this.successState.classList.add('hidden');
        this.form.classList.remove('hidden');
        this.close();
      });
    }

    // Interactive button state styling for guest & time selectors
    const optionPills = document.querySelectorAll('.option-pill');
    optionPills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (this.audioSynth) this.audioSynth.playClick();
        const group = pill.dataset.group;
        document.querySelectorAll(`.option-pill[data-group="${group}"]`).forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  }

  open(dishPreselect = '') {
    if (this.isOpen) return;
    this.isOpen = true;
    if (this.audioSynth) this.audioSynth.playClick();

    if (dishPreselect) {
      const noteInput = document.getElementById('res-notes');
      if (noteInput && !noteInput.value) {
        noteInput.value = `Interested in trying: ${dishPreselect}`;
      }
    }

    this.modal.classList.remove('hidden');
    this.modal.style.display = 'flex';

    gsap.fromTo(this.backdrop, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );

    gsap.fromTo(this.dialog, 
      { opacity: 0, y: 40, scale: 0.94 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.5)' }
    );
  }

  close() {
    if (!this.isOpen) return;
    if (this.audioSynth) this.audioSynth.playClick();

    gsap.to(this.dialog, {
      opacity: 0,
      y: 20,
      scale: 0.96,
      duration: 0.25,
      ease: 'power2.in'
    });

    gsap.to(this.backdrop, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        this.modal.style.display = 'none';
        this.modal.classList.add('hidden');
        this.isOpen = false;
      }
    });
  }

  handleSubmit() {
    if (this.audioSynth) this.audioSynth.playClick();

    const nameInput = document.getElementById('res-name');
    const guestActive = document.querySelector('.option-pill[data-group="guests"].active');
    const timeActive = document.querySelector('.option-pill[data-group="time"].active');
    const dateInput = document.getElementById('res-date');

    const guestCount = guestActive ? guestActive.textContent : '2 Guests';
    const timeSlot = timeActive ? timeActive.textContent : '20:00';
    const guestName = nameInput ? nameInput.value : 'Guest';
    const dateVal = dateInput && dateInput.value ? dateInput.value : 'Tonight';

    // Random reference code
    const refCode = 'BRS-' + Math.floor(100000 + Math.random() * 900000);

    const summaryEl = document.getElementById('success-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `Table for <strong>${guestCount}</strong> confirmed for <strong>${guestName}</strong> at <strong>${timeSlot}</strong> (${dateVal}).<br><span class="text-xs text-neutral-400 mt-2 block">Reference: ${refCode}</span>`;
    }

    gsap.to(this.form, {
      opacity: 0,
      y: -10,
      duration: 0.25,
      onComplete: () => {
        this.form.classList.add('hidden');
        this.successState.classList.remove('hidden');
        gsap.fromTo(this.successState,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.5)' }
        );
      }
    });
  }
}
