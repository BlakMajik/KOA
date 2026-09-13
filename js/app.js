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

  // 2. Portfolio Filtering
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

  // 3. Portfolio Lightbox Modal
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
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // 4. Quote / Brief Submission Modal Controls
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
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (quoteCloseBtn) {
    quoteCloseBtn.addEventListener('click', () => {
      quoteModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close modals on outside backdrop click
  window.addEventListener('click', (e) => {
    if (e.target === quoteModal) {
      quoteModal.classList.remove('open');
      document.body.style.overflow = '';
    }
    if (e.target === lightboxModal) {
      lightboxModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // 5. Simulated CAD File Upload Dropzone
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('cadFileInput');
  const fileStatus = document.getElementById('uploadFileStatus');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

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
        handleFileSelect(e.dataTransfer.files[0]);
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

  // 6. Brief Submission Form Handler
  const briefForm = document.getElementById('briefSubmissionForm');
  if (briefForm) {
    briefForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName')?.value || 'Client';
      const email = document.getElementById('clientEmail')?.value || '';
      const phone = document.getElementById('clientPhone')?.value || '';

      if (!email) {
        showToast('Please provide a valid business email.', 'error');
        return;
      }

      // Simulate submission & generation of instant formal quote
      const submitBtn = briefForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        Generating Formal Quote...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        quoteModal.classList.remove('open');
        document.body.style.overflow = '';
        briefForm.reset();
        if (fileStatus) fileStatus.innerHTML = '';

        showToast(`Thank you, ${name}! Your guaranteed fair-value proposal has been generated and dispatched to ${email}. Our US senior lead 3D architect will contact you within 2 business hours.`);
      }, 1200);
    });
  }

  // 7. FAQ Accordion Toggle
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

  // 8. Toast Notification System
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
});
