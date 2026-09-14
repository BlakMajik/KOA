# Designs by KOA — Future Website Activation & Rollback Manual

This document outlines the standard operating procedure (SOP) for promoting the **Designs by KOA** full-lifecycle residential architecture website from the isolated `/future-preview/` staging environment into the live production website once all architectural licensures and firm entity registrations in NY, NJ, and CT have been officially granted.

---

## 1. Pre-Activation Checklist (Verification of Credentials)

Before initiating activation, ensure all legal, regulatory, and corporate prerequisites are satisfied:

1. **State Licensure Confirmation**:
   - [ ] New York State Registered Architect (RA) license number verified.
   - [ ] New Jersey State Architect license number verified.
   - [ ] Connecticut State Architect license number verified.
   - [ ] NCARB Certificate and AIA membership numbers recorded.
2. **Firm Entity Registration**:
   - [ ] Confirm professional entity registration (e.g., *Designs by KOA Architecture PLLC* or *D.P.C.*) with state boards.
   - [ ] Update legal business entity names across footer disclosures and contract templates.
3. **Prior-Firm & Photography Credits**:
   - [ ] Verify that all prior projects completed under former firms retain clear attribution or have written authorization for marketing use.
   - [ ] Confirm photography licenses and rights for all portfolio imagery.
4. **CRM & Lead Routing**:
   - [ ] Create a dedicated HubSpot form in your portal for architectural inquiries.
   - [ ] Configure email notifications and autoresponders for incoming qualification briefs.

---

## 2. Activation Step-by-Step Guide (Staging to Production)

### Step 1: Replace Production Route Files
Move and promote the preview pages to become the root website files:

| Preview File | Destination (Production) | Action |
|---|---|---|
| `future-preview/index.html` | `index.html` | Replaces legacy archviz 1-page site |
| `future-preview/services/index.html` | `services/index.html` | Promoted to `/services/` |
| `future-preview/projects/index.html` | `projects/index.html` | Promoted to `/projects/` |
| `future-preview/process/index.html` | `process/index.html` | Promoted to `/process/` |
| `future-preview/about/index.html` | `about/index.html` | Promoted to `/about/` |
| `future-preview/contact/index.html` | `contact/index.html` | Promoted to `/contact/` |
| `future-preview/css/preview.css` | `css/architecture.css` | Merged / linked |
| `future-preview/js/preview.js` | `js/architecture.js` | Merged / linked |
| `future-preview/assets/*` | `assets/*` | Promoted assets |

### Step 2: Remove Preview-Only Elements & Warnings
1. **Remove Preview Disclaimer Banner**: Delete `<div class="preview-banner">...</div>` and the preview info modal from all pages.
2. **Remove Compliance Placeholders**: Replace bracketed placeholders like `[License #: Verification Pending]` with official numbers.
3. **Remove Staging Disclosures**: Update footer text to show active licensed entity status.

### Step 3: Enable Public SEO & Sitemap
1. **Remove Noindex Tags**:
   - Replace `<meta name="robots" content="noindex, nofollow">` with:
     ```html
     <meta name="robots" content="index, follow">
     ```
2. **Create `sitemap.xml`**:
   Add public routes to `sitemap.xml`:
   - `https://www.designsbykoa.com/`
   - `https://www.designsbykoa.com/services/`
   - `https://www.designsbykoa.com/projects/`
   - `https://www.designsbykoa.com/process/`
   - `https://www.designsbykoa.com/about/`
   - `https://www.designsbykoa.com/contact/`
3. **Update `robots.txt`**:
   Allow search engine crawlers across all standard routes.

### Step 4: Connect Live HubSpot Form
In `contact/index.html`, swap the simulated preview form handler with the live HubSpot embed:
```html
<script src="https://js-na2.hsforms.net/forms/embed/247380979.js" defer></script>
<div class="hs-form-frame" data-region="na2" data-form-id="YOUR_ARCHITECTURAL_FORM_ID" data-portal-id="247380979"></div>
```

### Step 5: Merge Git Branch
Merge the verified branch `koa-licensed-site-preview` into `main` and push to GitHub:
```bash
git checkout main
git merge koa-licensed-site-preview
git push origin main
```

---

## 3. Immediate Rollback Plan

If an unexpected issue occurs upon activation or if formal licensure filings are delayed, follow this instant rollback procedure:

### Option A: Fast Git Rollback
```bash
# Checkout main and reset to the prior clean commit
git checkout main
git reset --hard HEAD~1
git push origin main --force
```

### Option B: Branch Reversion
Keep the legacy 3D rendering site on a dedicated fallback branch (e.g. `legacy-archviz-site`) to allow one-click branch swapping via GitHub Pages repository settings.
