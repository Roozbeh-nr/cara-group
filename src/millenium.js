import './style.css';
import './shop.css';
import { doorCollections } from './millenium-data.js';
const milleniumDoors = doorCollections.millenium;

// --- Sticky Header ---
const header = document.getElementById('site-header');
const cursorGlow = document.getElementById('cursor-glow');
const shopSection = document.querySelector('.shop-products');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
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
function renderDoors() {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'products-grid';

  milleniumDoors.forEach((door, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <div class="door-placeholder">
          <span class="door-placeholder-name">${door.name}</span>
        </div>
      </div>
      <div class="product-info">
        <h4>${door.name}</h4>
        <p class="product-features">${door.finish}</p>
        <div class="product-bottom">
          <span class="product-price">MILLENIUM</span>
          <span class="product-configure">View Details</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);

  // Scroll-triggered reveal with stagger
  requestAnimationFrame(() => {
    container.querySelectorAll('.product-card').forEach((card, index) => {
      const stagger = (index % 4) * 0.07;
      card.style.transitionDelay = `${stagger}s`;
      revealObserver.observe(card);
    });
  });
}

// --- Back to Top ---
const btn = document.createElement('button');
btn.id = 'back-to-top';
btn.className = 'back-to-top';
btn.setAttribute('aria-label', 'Back to top');
btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>`;
btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
document.body.appendChild(btn);

window.addEventListener('scroll', () => {
  btn.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });

renderDoors();
