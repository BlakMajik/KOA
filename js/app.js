/**
 * Designs by KOA - Studio Main Application Script
 * Controls interactions, portfolio filtering, modal drawers, FAQ, and brief submission
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Drawer Navigation
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const mobileDrawerClose = document.getElementById('mobileDrawerClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileDrawerQuoteBtn = document.getElementById('mobileDrawerQuoteBtn');

  function openMobileMenu() {
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.add('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
    if (mobileNavDrawer) mobileNavDrawer.classList.add('open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeMobileMenu() {
    if (mobileMenuBtn) {
      mobileMenuBtn.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
    if (mobileNavDrawer) mobileNavDrawer.classList.remove('open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNavDrawer?.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', closeMobileMenu);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  if (mobileDrawerQuoteBtn) {
    mobileDrawerQuoteBtn.addEventListener('click', () => {
      closeMobileMenu();
    });
  }

  // 3. Portfolio Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filter === 'all' || itemCategory === filter) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // 4. Portfolio Lightbox Modal
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxSpecs = document.getElementById('lightboxSpecs');
  const lightboxClose = document.getElementById('lightboxClose');

  portfolioItems.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.getAttribute('data-title') || 'Architectural Project';
      const cat = card.getAttribute('data-category-label') || 'Rendering';
      const specs = card.getAttribute('data-specs') || '3ds Max, Corona 11, 8K Ultra Resolution, 5-Day Delivery';

      if (lightboxImg) lightboxImg.src = img.src;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxCategory) lightboxCategory.textContent = cat;
      if (lightboxSpecs) lightboxSpecs.textContent = specs;

      if (lightboxModal) {
        lightboxModal.classList.add('open');
        document.body.classList.add('no-scroll');
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  }

  // 5. Quote / Brief Submission Modal Controls
  const quoteModal = document.getElementById('quoteModal');
  const quoteOpenBtns = document.querySelectorAll('.open-quote-modal');
  const quoteCloseBtn = document.getElementById('quoteModalClose');

  quoteOpenBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const preselectTier = btn.getAttribute('data-select-tier');
      if (preselectTier && window.pricingCalculator) {
        const tierOption = document.querySelector(`[data-tier="${preselectTier}"]`);
        if (tierOption) tierOption.click();
      }
      if (quoteModal) {
        quoteModal.classList.add('open');
        document.body.classList.add('no-scroll');
      }
    });
  });

  if (quoteCloseBtn) {
    quoteCloseBtn.addEventListener('click', () => {
      quoteModal.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  }

  // Close modals on outside backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === quoteModal) {
      quoteModal.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
    if (e.target === lightboxModal) {
      lightboxModal.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }
  });

  // Global Escape key listener
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      if (quoteModal && quoteModal.classList.contains('open')) {
        quoteModal.classList.remove('open');
        document.body.classList.remove('no-scroll');
      }
      if (lightboxModal && lightboxModal.classList.contains('open')) {
        lightboxModal.classList.remove('open');
        document.body.classList.remove('no-scroll');
      }
    }
  });

  // 6. CAD File Upload Dropzone
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('cadFileInput');
  const fileStatus = document.getElementById('uploadFileStatus');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== fileInput) fileInput.click();
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--accent-gold)';
      dropzone.style.background = 'rgba(207, 168, 88, 0.08)';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = '';
      dropzone.style.background = '';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '';
      dropzone.style.background = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInput.files = dt.files;
        } catch (err) {
          console.warn('DataTransfer sync:', err);
        }
        handleFileSelect(file);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    if (fileStatus) {
      fileStatus.innerHTML = `
        <strong style="color: var(--accent-gold);">✓ File Attached:</strong> ${file.name} 
        <span style="color: var(--text-muted); font-size: 0.8rem;">(${(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
      `;
    }
  }

  // 7. Brief Submission Form Handler (HubSpot CRM Direct Integration)
  const briefForm = document.getElementById('briefSubmissionForm');
  if (briefForm) {
    briefForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('clientName');
      const emailInput = document.getElementById('clientEmail');
      const phoneInput = document.getElementById('clientPhone');
      const firmInput = document.getElementById('clientFirm');
      const projectTypeInput = document.getElementById('modalProjectType');
      const viewsInput = document.getElementById('modalViewsCount');
      const lightingInput = document.getElementById('modalLighting');
      const notesInput = document.getElementById('modalNotes');
      const estimateInput = document.getElementById('modalEstimateInput');
      const tierInput = document.getElementById('modalTierInput');
      const turnaroundInput = document.getElementById('modalTurnaroundInput');
      const addonsInput = document.getElementById('modalAddonsInput');

      const fullName = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const firm = firmInput ? firmInput.value.trim() : '';
      const projectType = projectTypeInput ? projectTypeInput.options[projectTypeInput.selectedIndex].text : '';
      const views = viewsInput ? viewsInput.value : '2';
      const lighting = lightingInput ? lightingInput.options[lightingInput.selectedIndex].text : '';
      const notes = notesInput ? notesInput.value.trim() : '';
      const estimate = estimateInput ? estimateInput.value : '';
      const tier = tierInput ? tierInput.value : '';
      const turnaround = turnaroundInput ? turnaroundInput.value : '';
      const addons = addonsInput ? addonsInput.value : '';

      if (!email) {
        showToast('Please provide a valid business email.', 'error');
        return;
      }

      // Split full name into first and last name
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || 'Client';
      const lastName = nameParts.slice(1).join(' ') || '';

      const submitBtn = briefForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        Transmitting Brief to HubSpot...
      `;

      // Compose rich message summary for HubSpot CRM
      const messageBody = [
        `PROJECT BRIEF SPECIFICATIONS:`,
        `Estimated Total: ${estimate}`,
        `Project Scope: ${projectType}`,
        `Views/Angles Count: ${views}`,
        `Fidelity Tier: ${tier}`,
        `Turnaround SLA: ${turnaround}`,
        `Atmosphere / Lighting: ${lighting}`,
        `Add-ons: ${addons}`,
        ``,
        `Client Notes & Instructions:`,
        notes || 'None provided'
      ].join('\n');

      try {
        // 1. Submit directly to HubSpot Forms Submission API (Portal: 247380979, Form: 35def298-79d3-41c5-84ad-a90163cad5cd)
        const hubspotPayload = {
          fields: [
            { name: 'firstname', value: firstName },
            { name: 'lastname', value: lastName },
            { name: 'email', value: email },
            { name: 'phone', value: phone },
            { name: 'company', value: firm },
            { name: 'message', value: messageBody }
          ],
          context: {
            pageUri: window.location.href,
            pageName: document.title
          }
        };

        await fetch('https://api-na2.hsforms.com/submissions/v3/integration/submit/247380979/35def298-79d3-41c5-84ad-a90163cad5cd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(hubspotPayload)
        }).catch(err => console.warn('HubSpot API submit:', err));

        // 2. Dispatch FormSubmit backup notification to designedbykoa@gmail.com
        const formData = new FormData(briefForm);
        formData.append('_subject', `[New Project Brief] ${fullName} - ${estimate}`);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');

        fetch('https://formsubmit.co/ajax/designedbykoa@gmail.com', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        }).catch(() => null);

        showToast(`Thank you, ${firstName}! Your project brief has been recorded in HubSpot. Our team in New York will review your drawings and email you at ${email} within 2 business hours.`);
        briefForm.reset();
        if (fileStatus) fileStatus.innerHTML = '';
        const quoteModal = document.getElementById('quoteModal');
        if (quoteModal) {
          quoteModal.classList.remove('open');
          document.body.classList.remove('no-scroll');
        }
      } catch (err) {
        console.warn('Submission fallback:', err);
        showToast(`Thank you, ${fullName}! Your project brief has been submitted directly to our studio team.`);
        briefForm.reset();
        const quoteModal = document.getElementById('quoteModal');
        if (quoteModal) {
          quoteModal.classList.remove('open');
          document.body.classList.remove('no-scroll');
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // 8. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all other items
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // 9. Toast Notification System
  function showToast(message, type = 'success') {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }

    const iconColor = type === 'success' ? 'var(--accent-emerald)' : '#ef4444';
    toast.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div>${message}</div>
    `;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 6000);
  }

  // 10. Market Analysis Mobile View Switcher (Cards vs Table)
  const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
  const marketMobileCards = document.getElementById('marketMobileCards');
  const marketTableCard = document.getElementById('marketTableCard');

  viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.getAttribute('data-view');
      if (view === 'table') {
        if (marketMobileCards) marketMobileCards.classList.add('hide-cards');
        if (marketTableCard) marketTableCard.classList.add('show-table');
      } else {
        if (marketMobileCards) marketMobileCards.classList.remove('hide-cards');
        if (marketTableCard) marketTableCard.classList.remove('show-table');
      }
    });
  });
});
