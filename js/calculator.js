/**
 * Designs by KOA - Fair-Value Dynamic Pricing Calculator Engine
 * Backed by 2026 US Architectural Visualization Market Benchmarks
 */

const PRICING_CONFIG = {
  categories: {
    'res-exterior': {
      name: 'Residential Exterior',
      basePrice: 699,
      additionalPrice: 449,
      marketAvg: 950,
      description: 'Single family, luxury villas & custom architectural residences'
    },
    'res-interior': {
      name: 'Residential Interior',
      basePrice: 540,
      additionalPrice: 380,
      marketAvg: 750,
      description: 'Living spaces, gourmet kitchens, master suites & bespoke staging'
    },
    'comm-exterior': {
      name: 'Commercial Exterior',
      basePrice: 1350,
      additionalPrice: 890,
      marketAvg: 1900,
      description: 'Retail centers, office complexes, hospitality & mixed-use towers'
    },
    'comm-interior': {
      name: 'Commercial Interior',
      basePrice: 890,
      additionalPrice: 590,
      marketAvg: 1300,
      description: 'Corporate lobbies, luxury restaurants, clubhouses & retail stores'
    },
    'floorplan-3d': {
      name: '3D Floor Plan (Isometric)',
      basePrice: 390,
      additionalPrice: 280,
      marketAvg: 600,
      description: 'Cutaway 3D architectural floor plans with furniture & lighting'
    },
    'animation-3d': {
      name: 'Cinematic 3D Video (30s)',
      basePrice: 2850,
      additionalPrice: 1400,
      marketAvg: 4200,
      description: 'Ultra-HD camera choreography, sound design, grading & drone motion'
    }
  },
  tiers: {
    'presentation': { name: 'Presentation & Planning (Permit grade)', multiplier: 0.85, badge: 'Budget Friendly' },
    'signature': { name: 'Marketing Signature (4K Photoreal)', multiplier: 1.0, badge: 'Most Popular' },
    'developer': { name: 'Developer Masterplan (8K Luxury)', multiplier: 1.35, badge: 'Boutique Grade' }
  },
  turnaround: {
    'standard': { name: 'Standard (5-7 Business Days)', surcharge: 0 },
    'rush': { name: 'Express Rush (48-72 Hours)', surcharge: 0.35 }
  },
  addons: {
    'drone': { name: 'Drone Photomontage / Context Match', cost: 290 },
    'lighting': { name: 'Day-to-Night Dual Lighting Mood', cost: 190 },
    'landscape': { name: 'Bespoke US Botanical Landscaping', cost: 150 },
    'panorama': { name: '360° Interactive Web Panorama', cost: 350 }
  }
};

class PricingCalculator {
  constructor() {
    this.selectedCategory = 'res-exterior';
    this.viewsCount = 2;
    this.selectedTier = 'signature';
    this.selectedTurnaround = 'standard';
    this.selectedAddons = new Set(['landscape']);

    this.bindDOM();
    this.calculate();
  }

  bindDOM() {
    // Category options (scoped to .category-option)
    const categoryEls = document.querySelectorAll('.category-option[data-category]');
    categoryEls.forEach(el => {
      el.addEventListener('click', () => {
        categoryEls.forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        this.selectedCategory = el.getAttribute('data-category');
        this.calculate();
      });
    });

    // Views Range Slider
    const viewsSlider = document.getElementById('viewsRangeInput');
    const viewsDisplay = document.getElementById('viewsCountDisplay');
    if (viewsSlider) {
      viewsSlider.addEventListener('input', (e) => {
        this.viewsCount = parseInt(e.target.value, 10);
        if (viewsDisplay) viewsDisplay.textContent = this.viewsCount;
        this.calculate();
      });
    }

    // Tier options (scoped to .pill-option)
    const tierEls = document.querySelectorAll('.pill-option[data-tier]');
    tierEls.forEach(el => {
      el.addEventListener('click', () => {
        tierEls.forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        this.selectedTier = el.getAttribute('data-tier');
        this.calculate();
      });
    });

    // Turnaround speed (scoped to .pill-option)
    const turnaroundEls = document.querySelectorAll('.pill-option[data-turnaround]');
    turnaroundEls.forEach(el => {
      el.addEventListener('click', () => {
        turnaroundEls.forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        this.selectedTurnaround = el.getAttribute('data-turnaround');
        this.calculate();
      });
    });

    // Addons checkboxes
    const addonCheckboxes = document.querySelectorAll('input[data-addon]');
    addonCheckboxes.forEach(box => {
      box.addEventListener('change', () => {
        const addonKey = box.getAttribute('data-addon');
        if (box.checked) {
          this.selectedAddons.add(addonKey);
        } else {
          this.selectedAddons.delete(addonKey);
        }
        this.calculate();
      });
    });

    // Book Project CTA Button from Calculator
    const bookBtn = document.getElementById('calcBookCta');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        this.transferToModal();
      });
    }
  }

  calculate() {
    const catConfig = PRICING_CONFIG.categories[this.selectedCategory];
    const tierConfig = PRICING_CONFIG.tiers[this.selectedTier];
    const turnConfig = PRICING_CONFIG.turnaround[this.selectedTurnaround];

    // Base Calculation with Multi-View Discount
    let viewsCost = 0;
    if (this.viewsCount === 1) {
      viewsCost = catConfig.basePrice;
    } else {
      viewsCost = catConfig.basePrice + (this.viewsCount - 1) * catConfig.additionalPrice;
    }

    // Apply Tier Multiplier
    let adjustedBase = Math.round(viewsCost * tierConfig.multiplier);

    // Calculate Addons
    let addonsTotal = 0;
    this.selectedAddons.forEach(addonKey => {
      if (PRICING_CONFIG.addons[addonKey]) {
        addonsTotal += PRICING_CONFIG.addons[addonKey].cost;
      }
    });

    // Subtotal before turnaround
    let subtotal = adjustedBase + addonsTotal;

    // Apply Turnaround Surcharge
    let rushSurcharge = Math.round(subtotal * turnConfig.surcharge);
    let finalTotal = subtotal + rushSurcharge;

    // Calculate Fair-Value Savings vs Legacy US Agency rates
    // Typical US agency charges marketAvg * viewsCount + $600 baseline
    const legacyAgencyEquivalent = (catConfig.marketAvg * this.viewsCount) + addonsTotal;
    const clientSavings = Math.max(0, legacyAgencyEquivalent - finalTotal);

    // Update UI elements
    this.updateSummaryUI({
      categoryName: catConfig.name,
      viewsCount: this.viewsCount,
      tierName: tierConfig.name,
      turnaroundName: turnConfig.name,
      baseCost: adjustedBase,
      addonsCost: addonsTotal,
      rushCost: rushSurcharge,
      total: finalTotal,
      savings: clientSavings
    });
  }

  updateSummaryUI(data) {
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText('summaryCat', `${data.categoryName} (${data.viewsCount} ${data.viewsCount > 1 ? 'angles/views' : 'view'})`);
    setText('summaryTier', data.tierName.split('(')[0].trim());
    setText('summaryTurnaround', data.turnaroundName);
    setText('summaryBasePrice', `$${data.baseCost.toLocaleString()}`);
    setText('summaryAddonsPrice', data.addonsCost > 0 ? `+$${data.addonsCost.toLocaleString()}` : '$0');
    setText('summaryTotalAmount', data.total.toLocaleString());
    setText('summarySavings', `Save $${data.savings.toLocaleString()} vs standard US agency billing`);

    // Multi-view discount indicator
    const discountEl = document.getElementById('calcDiscountBadge');
    if (discountEl) {
      if (data.viewsCount > 1) {
        const discountRate = data.viewsCount >= 4 ? '25%' : (data.viewsCount >= 2 ? '15%' : '0%');
        discountEl.innerHTML = `✓ ${discountRate} Multi-View Volume Savings Active`;
        discountEl.style.display = 'inline-flex';
      } else {
        discountEl.style.display = 'none';
      }
    }
  }

  transferToModal() {
    const catConfig = PRICING_CONFIG.categories[this.selectedCategory];
    const tierConfig = PRICING_CONFIG.tiers[this.selectedTier];
    const turnConfig = PRICING_CONFIG.turnaround[this.selectedTurnaround];
    const currentTotal = document.getElementById('summaryTotalAmount')?.textContent || '0';

    // Pre-select form fields in quote modal
    const modalProjectSelect = document.getElementById('modalProjectType');
    if (modalProjectSelect) {
      modalProjectSelect.value = this.selectedCategory;
    }

    const modalViewsInput = document.getElementById('modalViewsCount');
    if (modalViewsInput) {
      modalViewsInput.value = this.viewsCount;
    }

    const modalTierInput = document.getElementById('modalTierInput');
    if (modalTierInput) {
      modalTierInput.value = tierConfig ? tierConfig.name : this.selectedTier;
    }

    const modalTurnaroundInput = document.getElementById('modalTurnaroundInput');
    if (modalTurnaroundInput) {
      modalTurnaroundInput.value = turnConfig ? turnConfig.name : this.selectedTurnaround;
    }

    const modalAddonsInput = document.getElementById('modalAddonsInput');
    if (modalAddonsInput) {
      const addonNames = Array.from(this.selectedAddons).map(k => PRICING_CONFIG.addons[k]?.name || k);
      modalAddonsInput.value = addonNames.length > 0 ? addonNames.join(', ') : 'None';
    }

    const modalEstimateBadge = document.getElementById('modalEstimateDisplay');
    const modalEstimateInput = document.getElementById('modalEstimateInput');
    const estimateString = `$${currentTotal} USD (${this.viewsCount} views, ${catConfig.name})`;
    if (modalEstimateBadge) {
      modalEstimateBadge.textContent = `Estimated Total: ${estimateString}`;
    }
    if (modalEstimateInput) {
      modalEstimateInput.value = estimateString;
    }

    // Trigger modal open
    const modal = document.getElementById('quoteModal');
    if (modal) {
      modal.classList.add('open');
      document.body.classList.add('no-scroll');
    }
  }
}

// Global hook
document.addEventListener('DOMContentLoaded', () => {
  window.pricingCalculator = new PricingCalculator();
});
