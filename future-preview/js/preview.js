/**
 * DESIGNS BY KOA - FUTURE ARCHITECTURAL PRACTICE PREVIEW
 * Interactive controller for navigation, portfolio filtering, case study modals,
 * and isolated preview intake form handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreviewBannerModal();
  initMobileNav();
  initPortfolioFilter();
  initCaseStudyModals();
  initPreviewContactForm();
});

/**
 * Preview Info Modal (Explaining Staging Status & Disclaimer)
 */
function initPreviewBannerModal() {
  const infoBtn = document.getElementById('previewInfoBtn');
  const infoModal = document.getElementById('previewInfoModal');
  const closeBtn = document.getElementById('previewInfoClose');

  if (infoBtn && infoModal) {
    infoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      infoModal.classList.add('active');
    });
  }

  if (closeBtn && infoModal) {
    closeBtn.addEventListener('click', () => {
      infoModal.classList.remove('active');
    });
  }

  if (infoModal) {
    infoModal.addEventListener('click', (e) => {
      if (e.target === infoModal) {
        infoModal.classList.remove('active');
      }
    });
  }
}

/**
 * Mobile Navigation Drawer
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('previewMobileToggle');
  const menu = document.getElementById('previewNavMenu');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', () => {
      menu.classList.toggle('active');
      const expanded = menu.classList.contains('active');
      toggleBtn.setAttribute('aria-expanded', expanded);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggleBtn.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('active')) {
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/**
 * Portfolio Category Filter
 */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.case-study-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category || cardCat.includes(category)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/**
 * Case Study Detailed View Modals
 */
function initCaseStudyModals() {
  const openButtons = document.querySelectorAll('[data-case-study-target]');
  const modal = document.getElementById('caseStudyModal');
  const closeBtn = document.getElementById('caseStudyClose');

  if (!modal) return;

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const studyId = btn.getAttribute('data-case-study-target');
      loadCaseStudyData(studyId);
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

/**
 * Case Study Data Repository & Loader
 */
const caseStudyData = {
  'hudson-valley': {
    title: 'Hudson Valley Hillside Residence',
    category: 'New Construction & Steep Slope Architecture',
    location: 'Garrison, NY (Hudson Highlands)',
    scale: '5,800 SF Custom Residence',
    clientObjective: 'Design a private, multi-generational family retreat that maximizes Hudson River views while minimizing environmental site impact.',
    challenges: 'A 28% site slope, shallow bedrock ledge, local steep-slope zoning restrictions, and strict ridgeline visual preservation guidelines requiring custom variance presentation.',
    founderRole: 'Lead Architectural Designer & Zoning Specialist [Attributed Experience]',
    credits: 'Prior professional experience of founder. Former Firm / Prime Architect: [Placeholder: ABC Architecture NYC]. Renderings & 3D Spatial Studies by Designs by KOA.',
    approach: 'Engineered a stepped two-volume massing anchored into the bedrock. Floor-to-ceiling high-performance triple-glazed curtain walls frame the river valley, while a cantilevered living pavilion sits over the natural slope without extensive grading. Represented project before the Town Planning Board and Zoning Board of Adjustment to secure necessary slope and height variances.',
    services: ['Site Feasibility & Topographical Analysis', 'Schematic Design & 3D VR Simulation', 'Zoning Variance Representation', 'Structural & Geotechnical Coordination', 'Full Construction Documents'],
    outcome: 'Unanimous Planning Board approval in one hearing cycle; zero disturbance to neighboring watershed buffer.',
    image: 'assets/hudson_valley_estate.jpg'
  },
  'greenwich-estate': {
    title: 'Greenwich Historic Manor Contemporary Addition',
    category: 'Additions, Renovations & Historic Review',
    location: 'Greenwich, CT (Back Country)',
    scale: '3,200 SF Glass & Bronze Pavilion Addition + 6,500 SF Main House Renovation',
    clientObjective: 'Add a light-filled contemporary entertaining wing and master suite without compromising the architectural integrity of a 1928 stone manor.',
    challenges: 'Floor Area Ratio (FAR) caps, strict Greenwich Historic District Commission review, and integrating modern high-span steel structures with unreinforced historic stone masonry.',
    founderRole: 'Project Architect & Historic Preservation Coordinator [Attributed Experience]',
    credits: 'Prior professional experience of founder. Former Firm: [Placeholder: Greenwich Heritage Architects]. Structural Consultant: [Placeholder: Tri-State Engineering].',
    approach: 'Created a discreet, bronze-trimmed glass breezeway that clearly demarcates the historic masonry from the modern glass pavilion. Developed detailed 3D shadow and sightline simulations for the Historic Commission, demonstrating zero negative visual impact from public roadways.',
    services: ['Historic District Commission Presentation', 'Zoning FAR Calculations', 'Structural Retrofit Detailing', 'Material & Envelope Detailing', 'Contractor Bidding & Value Engineering'],
    outcome: 'Received Historic Commission Certificate of Appropriateness; seamless thermal connection between eras.',
    image: 'assets/greenwich_estate_addition.jpg'
  },
  'coastal-sound': {
    title: 'Long Island Sound Resilient Coastal Home',
    category: 'New Construction & Coastal Permitting',
    location: 'Westport, CT',
    scale: '4,600 SF High-Performance Waterfront Residence',
    clientObjective: 'Construct a resilient, modern waterfront home with panoramic coastal vistas, resistant to severe coastal storms and tidal surges.',
    challenges: 'FEMA VE Flood Zone requirements, Coastal Area Management (CAM) Act compliance, tidal wetland setback buffers, and strict height limitations from the base flood elevation.',
    founderRole: 'Lead Designer & Coastal Permitting Lead [Attributed Experience]',
    credits: 'Prior professional experience of founder. Collaborating Coastal Engineer: [Placeholder: Marine Civil Partners].',
    approach: 'Designed an architectural concrete plinth base supporting an elevated timber and glass superstructure. Cantilevered ipe wood decks float over tidal rock formations. Implemented hurricane-rated impact glass and permeable site drainage to manage stormwater runoff on-site.',
    services: ['Coastal Area Management (CAM) Permitting', 'FEMA Flood Zone Elevation Detailing', '3D Wind & Solar Modeling', 'High-Performance Envelope Design', 'Construction Administration'],
    outcome: 'Full DEEP (CT Department of Energy and Environmental Protection) clearance; survived 100-year storm simulation testing.',
    image: 'assets/coastal_residence.jpg'
  },
  'tribeca-loft': {
    title: 'Tribeca Historic Warehouse Spatial Transformation',
    category: 'Additions, Renovations & Interior Architecture',
    location: 'New York, NY (Tribeca Historic District)',
    scale: '4,200 SF Double-Height Duplex Loft',
    clientObjective: 'Reconfigure a historic 19th-century cast-iron warehouse interior into an open, gallery-grade living space with private mezzanine suites.',
    challenges: 'NYC Department of Buildings (DOB) Landmark Preservation Commission (LPC) approvals, structural floor opening penetrations, and maintaining acoustic isolation.',
    founderRole: 'Architectural Project Lead & Interior Detailer [Attributed Experience]',
    credits: 'Prior professional experience of founder. Former Firm / Collaborator: [Placeholder: Manhattan Design Group].',
    approach: 'Retained exposed timber beams and cast-iron columns while inserting a minimalist cantilevered steel-and-oak staircase with frameless glass guardrails. Engineered a structural steel mezzanine bridge to connect private suites without disrupting natural daylight from 14-foot arched windows.',
    services: ['NYC DOB & LPC Filing', 'Structural Steel Modification Detailing', 'Custom Millwork & Lighting Architecture', 'Acoustic Engineering Coordination', 'Construction Oversight'],
    outcome: 'Seamless NYC DOB sign-off with zero landmark objections; delivered on budget.',
    image: 'assets/tribeca_loft.jpg'
  }
};

function loadCaseStudyData(id) {
  const data = caseStudyData[id];
  if (!data) return;

  const modalBody = document.getElementById('caseStudyModalBody');
  if (!modalBody) return;

  // Resolve image relative to current page location
  let imgPath = data.image;
  if (!window.location.pathname.endsWith('/future-preview/') && !window.location.pathname.endsWith('/future-preview/index.html')) {
    imgPath = '../' + data.image;
  }

  modalBody.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <span class="compliance-tag" style="margin-bottom: 0.75rem;">${data.category}</span>
      <h2 class="title-section" style="margin-top: 0.5rem; margin-bottom: 0.25rem;">${data.title}</h2>
      <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-gold);">${data.location} &bull; ${data.scale}</p>
    </div>

    <div style="border-radius: var(--radius-md); overflow: hidden; margin-bottom: 2rem; border: 1px solid var(--border-medium); max-height: 380px;">
      <img src="${imgPath}" alt="${data.title}" style="width: 100%; height: 380px; object-fit: cover;">
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
      <div class="problem-box">
        <h5>Client Objective & Challenge</h5>
        <p><strong>Goal:</strong> ${data.clientObjective}</p>
        <p style="margin-top: 0.5rem;"><strong>Obstacle:</strong> ${data.challenges}</p>
      </div>
      <div class="solution-box">
        <h5>Architectural & Zoning Solution</h5>
        <p>${data.approach}</p>
      </div>
    </div>

    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.5rem;">
      <h4 style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-gold); text-transform: uppercase; margin-bottom: 0.5rem;">Services Performed & Approvals</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        ${data.services.map(s => `<span class="step-pill" style="color: var(--text-primary); border-color: var(--border-medium);">${s}</span>`).join('')}
      </div>
      <p style="font-size: 0.85rem; color: var(--accent-emerald); margin-top: 0.75rem; font-weight: 600;">Outcome: ${data.outcome}</p>
    </div>

    <div class="prior-firm-credit" style="width: 100%; box-sizing: border-box; font-size: 0.75rem; line-height: 1.5;">
      <strong>Attribution & Professional Role:</strong> ${data.founderRole}<br>
      <strong>Project Credits:</strong> ${data.credits}
    </div>
  `;
}

/**
 * Isolated Preview Consultation Form Handler
 * Validates form, prevents live CRM lead contamination, and presents simulated intake dialog.
 */
function initPreviewContactForm() {
  const form = document.getElementById('previewIntakeForm');
  const modal = document.getElementById('previewSubmissionModal');
  const closeBtn = document.getElementById('previewSubClose');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Perform basic client-side validation
    const firstName = form.querySelector('#firstName')?.value.trim();
    const lastName = form.querySelector('#lastName')?.value.trim();
    const email = form.querySelector('#email')?.value.trim();
    const phone = form.querySelector('#phone')?.value.trim();
    const location = form.querySelector('#projectLocation')?.value.trim();
    const scope = form.querySelector('#projectScope')?.value;

    if (!firstName || !lastName || !email || !location || !scope) {
      alert('Please complete all required fields (Name, Email, Location, and Project Scope).');
      return;
    }

    // Populate confirmation modal with simulated intake data
    const summaryEl = document.getElementById('simulatedIntakeSummary');
    if (summaryEl) {
      const budget = form.querySelector('input[name="budget"]:checked')?.value || 'Not specified';
      const timeline = form.querySelector('#timeline')?.value || 'Flexible';
      
      summaryEl.innerHTML = `
        <div style="background: rgba(8,9,12,0.7); padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.85rem; line-height: 1.6;">
          <p><strong>Client:</strong> ${firstName} ${lastName} (${email} &bull; ${phone || 'No phone provided'})</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Scope:</strong> ${scope}</p>
          <p><strong>Budget Tier:</strong> ${budget}</p>
          <p><strong>Timeline:</strong> ${timeline}</p>
        </div>
      `;
    }

    if (modal) {
      modal.classList.add('active');
    }

    form.reset();
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}
