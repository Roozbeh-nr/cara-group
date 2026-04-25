import './style.css';
import './shop.css';
import { doorCollections } from './millenium-data.js';

// --- Sticky Header ---
const header = document.getElementById('site-header');
const cursorGlow = document.getElementById('cursor-glow');
const shopSection = document.querySelector('.shop-products');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) header.classList.add('scrolled');
  else header.classList.remove('scrolled');

  const backBtn = document.getElementById('back-to-top');
  if (backBtn) backBtn.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });

// --- Ambient Cursor Glow ---
if (shopSection && cursorGlow) {
  let cursorRAF = null;
  shopSection.addEventListener('mouseenter', () => { cursorGlow.style.opacity = '1'; });
  shopSection.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
  shopSection.addEventListener('mousemove', (e) => {
    if (cursorRAF) return;
    cursorRAF = requestAnimationFrame(() => {
      cursorGlow.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
      cursorRAF = null;
    });
  }, { passive: true });
}

// --- Scroll Reveal Observer ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

// --- Render Door Products ---
let currentCollection = 'millenium';

function renderDoors(collection, animate = true) {
  const container = document.getElementById('products-container');
  const doors = doorCollections[collection] || [];

  if (animate && container.children.length > 0) {
    container.classList.add('fading-out');
    setTimeout(() => {
      container.classList.remove('fading-out');
      buildDoors(container, doors, collection);
    }, 250);
  } else {
    buildDoors(container, doors, collection);
  }

  currentCollection = collection;
}

function buildDoors(container, doors, collection) {
  container.innerHTML = '';

  if (doors.length === 0) {
    container.innerHTML = `<div class="doors-coming-soon"><p>Coming Soon</p><span>The ${collection.charAt(0).toUpperCase() + collection.slice(1)} collection is being prepared.</span></div>`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'products-grid doors-grid-portrait';

  doors.forEach((door) => {
    const card = document.createElement('div');
    card.className = 'product-card door-card-portrait';
    card.innerHTML = `
      <div class="product-image door-image-portrait">
        <img src="${door.img}" alt="${door.name}" loading="lazy" />
      </div>
      <div class="product-info">
        <h4>${door.name}</h4>
        <div class="product-bottom">
          <span class="product-price">Eco Veneer RENOLIT</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);

  requestAnimationFrame(() => {
    container.querySelectorAll('.product-card').forEach((card, index) => {
      const stagger = (index % 4) * 0.07;
      card.style.transitionDelay = `${stagger}s`;
      revealObserver.observe(card);
    });
  });
}

// --- Collection Filter ---
const filterTabs = document.querySelectorAll('.filter-tab');

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.classList.contains('active')) return;
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderDoors(tab.dataset.collection);
  });
});

// --- Back to Top ---
const btn = document.createElement('button');
btn.id = 'back-to-top';
btn.className = 'back-to-top';
btn.setAttribute('aria-label', 'Back to top');
btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>`;
btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
document.body.appendChild(btn);

// Initial render
renderDoors('millenium', false);
