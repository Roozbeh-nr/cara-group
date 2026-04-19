import './style.css';
import './shop.css';
import { products, categoryLabels } from './products.js';
// Cabinet images are pre-recolored at the file level (no runtime processing needed)

// --- Price map by category ---
const categoryPrices = {
  base: 1199,
  wall: 899,
  tall: 1599,
  panels: 299,
};

// --- Feature tags by product type ---
function getFeatures(product) {
  const features = [];
  const name = product.name.toLowerCase();
  if (name.includes('door')) features.push('Soft-close door');
  if (name.includes('drawer')) features.push('Soft-close drawers');
  if (name.includes('pull-out') || name.includes('pull out')) features.push('Pull-out shelving');
  if (name.includes('corner') || name.includes('blind') || name.includes('diagonal')) features.push('Corner optimized');
  if (name.includes('shelf') || name.includes('open')) features.push('Open shelving');
  if (name.includes('wine')) features.push('Wine storage');
  if (name.includes('spice')) features.push('Spice organizer');
  if (name.includes('recycle') || name.includes('waste')) features.push('Waste management');
  if (name.includes('tray')) features.push('Tray dividers');
  if (name.includes('appliance') || name.includes('microwave') || name.includes('oven')) features.push('Appliance ready');
  if (features.length === 0) features.push('Adjustable shelving');
  return features.slice(0, 2).join(' · ');
}

// --- Sticky Header + Parallax ---
const header = document.getElementById('site-header');
const parallax1 = document.querySelector('.bg-parallax-1');
const parallax2 = document.querySelector('.bg-parallax-2');
const cursorGlow = document.getElementById('cursor-glow');
const shopSection = document.querySelector('.shop-products');

const banner = document.querySelector('.announcement-banner');

window.addEventListener('scroll', () => {
  // Header scrolled class
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
    if (banner) banner.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
    if (banner) banner.classList.remove('scrolled');
  }

  // Back to top visibility
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    if (window.scrollY > 600) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }
}, { passive: true });

// --- Ambient Cursor Glow ---
if (shopSection && cursorGlow) {
  let cursorRAF = null;
  shopSection.addEventListener('mouseenter', () => {
    cursorGlow.style.opacity = '1';
  });
  shopSection.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
  });
  shopSection.addEventListener('mousemove', (e) => {
    if (cursorRAF) return;
    cursorRAF = requestAnimationFrame(() => {
      cursorGlow.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
      cursorRAF = null;
    });
  }, { passive: true });
}



// --- Back to Top Button ---
function createBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>`;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(btn);
}
createBackToTop();

// --- Intersection Observer for scroll reveal ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

// --- Render Products ---
let currentCategory = 'all';

function renderProducts(category, animate = true) {
  const container = document.getElementById('products-container');

  if (animate && container.children.length > 0) {
    // Fade out existing cards
    container.classList.add('fading-out');
    setTimeout(() => {
      container.classList.remove('fading-out');
      buildProducts(container, category);
    }, 250);
  } else {
    buildProducts(container, category);
  }

  currentCategory = category;
}

function buildProducts(container, category) {
  container.innerHTML = '';

  const filtered = category === 'all' ? products : products.filter(p => p.category === category);

  // Group by category then subcategory
  const grouped = {};
  filtered.forEach(p => {
    const catKey = p.category;
    if (!grouped[catKey]) grouped[catKey] = {};
    if (!grouped[catKey][p.subcategory]) grouped[catKey][p.subcategory] = [];
    grouped[catKey][p.subcategory].push(p);
  });

  for (const [catKey, subcats] of Object.entries(grouped)) {
    const section = document.createElement('div');
    section.className = 'category-section';
    section.id = `category-${catKey}`;

    for (const [subcatName, prods] of Object.entries(subcats)) {
      const grid = document.createElement('div');
      grid.className = 'products-grid';

      prods.forEach((p, i) => {
        const price = categoryPrices[p.category] || 999;
        const features = getFeatures(p);
        const card = document.createElement('a');
        card.className = 'product-card';
        card.href = `/product.html?id=${p.id}`;
        card.dataset.category = p.category;
        card.innerHTML = `
          <div class="product-image">
            <img src="${p.img}" alt="${p.name}" loading="lazy" />
          </div>
          <div class="product-info">
            <h4>${p.name}</h4>
            <p class="product-features">${features}</p>
            <div class="product-bottom">
              <span class="product-price">FROM $${price.toLocaleString()}</span>
              <span class="product-configure">Configure</span>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });

      section.appendChild(grid);
    }

    container.appendChild(section);
  }

  // Scroll-triggered reveal with stagger
  requestAnimationFrame(() => {
    container.querySelectorAll('.product-card').forEach((card, index) => {
      const stagger = (index % 4) * 0.07;
      card.style.transitionDelay = `${stagger}s`;
      revealObserver.observe(card);
    });
    // Cabinet drawings are pre-recolored (gold lines, black internals)
  });
}

// --- Category Filter ---
const filterTabs = document.querySelectorAll('.filter-tab');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.classList.contains('active')) return;
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderProducts(tab.dataset.category);
  });
});

// Initial render
renderProducts('all', false);
