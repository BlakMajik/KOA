/**
 * Designs by KOA - Interactive Before/After CAD vs Render Comparison Slider
 */

class ComparisonSlider {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.slider = this.container.querySelector('.comparison-slider');
    this.beforeLayer = this.container.querySelector('.comparison-before');
    this.handle = this.container.querySelector('.slider-handle');
    this.isDragging = false;

    this.init();
  }

  init() {
    // Initial position: 50%
    this.updatePosition(50);

    // Mouse events
    this.slider.addEventListener('mousedown', (e) => this.startDrag(e));
    window.addEventListener('mouseup', () => this.stopDrag());
    window.addEventListener('mousemove', (e) => this.drag(e));

    // Touch events for mobile/tablet
    this.slider.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
    window.addEventListener('touchend', () => this.stopDrag());
    window.addEventListener('touchmove', (e) => this.drag(e), { passive: false });

    // Keyboard navigation
    this.handle.setAttribute('tabindex', '0');
    this.handle.setAttribute('role', 'slider');
    this.handle.setAttribute('aria-valuenow', '50');
    this.handle.setAttribute('aria-valuemin', '0');
    this.handle.setAttribute('aria-valuemax', '100');
    this.handle.setAttribute('aria-label', 'CAD Wireframe to Photoreal Render Slider');

    this.handle.addEventListener('keydown', (e) => {
      let currentVal = parseFloat(this.handle.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.updatePosition(Math.max(0, currentVal - 5));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.updatePosition(Math.min(100, currentVal + 5));
      }
    });

    // Window resize observer
    window.addEventListener('resize', () => {
      let currentVal = parseFloat(this.handle.getAttribute('aria-valuenow')) || 50;
      this.updatePosition(currentVal);
    });
  }

  startDrag(e) {
    this.isDragging = true;
    this.slider.classList.add('dragging');
    this.updateWithEvent(e);
  }

  stopDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.slider.classList.remove('dragging');
  }

  drag(e) {
    if (!this.isDragging) return;
    if (e.type === 'touchmove' && e.cancelable) {
      e.preventDefault(); // Prevent page scroll while dragging
    }
    this.updateWithEvent(e);
  }

  updateWithEvent(e) {
    const rect = this.slider.getBoundingClientRect();
    const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
    if (clientX === undefined) return;
    const xPos = clientX - rect.left;
    let percentage = (xPos / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    this.updatePosition(percentage);
  }

  updatePosition(percentage) {
    if (this.beforeLayer) {
      this.beforeLayer.style.width = `${percentage}%`;
    }
    if (this.handle) {
      this.handle.style.left = `${percentage}%`;
      this.handle.setAttribute('aria-valuenow', Math.round(percentage));
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new ComparisonSlider('cadComparison');
});
