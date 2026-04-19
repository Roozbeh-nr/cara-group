import './style.css';
import './door-styles.css';
import { doorStylesData, categoryLabelsDoorStyles } from './door-styles-data.js';

// --- DOM ---
const container = document.getElementById('door-styles-container');
const filterTabs = document.querySelectorAll('.filter-tab');

function renderDoorStyles(category) {
  const filtered = doorStylesData.filter(p => p.category === category);

  container.innerHTML = `
    <div class="door-styles-grid">
      ${filtered.map(item => `
        <div class="door-style-card" data-category="${item.category}">
          <div class="door-style-swatch">
            <img src="${item.img}" alt="${item.name}" loading="lazy" />
          </div>
          <div class="door-style-info">
            <h4 class="door-style-name">${item.name}</h4>
            <span class="door-style-type">${categoryLabelsDoorStyles[item.category]}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// --- Filter Logic ---
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderDoorStyles(tab.dataset.category);
  });
});

// --- Ambient Cursor Glow (matches shop/finishes pages) ---
const cursorGlow = document.getElementById('cursor-glow');
const section = document.querySelector('.door-styles-products');
if (section && cursorGlow) {
  let cursorRAF = null;
  section.addEventListener('mouseenter', () => {
    cursorGlow.style.opacity = '1';
  });
  section.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
  });
  section.addEventListener('mousemove', (e) => {
    if (cursorRAF) return;
    cursorRAF = requestAnimationFrame(() => {
      cursorGlow.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
      cursorRAF = null;
    });
  }, { passive: true });
}

// --- Header Scroll Behavior (matches main page) ---
const siteHeader = document.getElementById('site-header');
const banner = document.querySelector('.announcement-banner');
if (siteHeader) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    siteHeader.classList.toggle('scrolled', scrolled);
    if (banner) {
      banner.style.transform = scrolled ? 'translateY(-100%)' : 'translateY(0)';
      banner.style.position = scrolled ? 'fixed' : 'relative';
      banner.style.top = '0';
      banner.style.left = '0';
      banner.style.right = '0';
      banner.style.zIndex = '1001';
      banner.style.transition = 'transform 0.3s ease';
    }
  });
}

// Initial render — show first category (shaker)
renderDoorStyles('shaker');
