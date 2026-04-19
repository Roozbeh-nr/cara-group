import './style.css';
import './product.css';
import { products, categoryLabels } from './products.js';
import { productDetails } from './product-details.js';
import { panelsData, categoryLabelsFinishes } from './panels-data.js';
import { doorStylesData, categoryLabelsDoorStyles } from './door-styles-data.js';
// Cabinet images are pre-recolored at the file level (no runtime processing needed)

// --- Sticky Header ---
const header = document.getElementById('site-header');
const banner = document.querySelector('.announcement-banner');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 50;
  header.classList.toggle('scrolled', scrolled);
  if (banner) banner.classList.toggle('scrolled', scrolled);
}, { passive: true });

// --- Get product ID from URL ---
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const product = products.find(p => p.id === productId);
const details = productDetails[productId];

if (!product || !details) {
  document.getElementById('product-info').innerHTML = '<h1>Product not found</h1><p><a href="/shop.html">Back to shop</a></p>';
} else {
  renderProduct(product, details);
  // Cabinet drawings are pre-recolored (gold lines, black internals)
}

function renderProduct(prod, det) {
  // Title
  document.title = `${prod.name} — CARA`;

  // Breadcrumbs
  document.querySelector('#breadcrumbs .container').innerHTML = `
    <a href="/">Home</a> <span>/</span>
    <a href="/shop.html">Shop</a> <span>/</span>
    <a href="/shop.html">${categoryLabels[prod.category]}</a> <span>/</span>
    <span class="current">${prod.name}</span>
  `;

  // Product Media (image)
  document.getElementById('product-media').innerHTML = `
    <div class="media-main">
      <img src="${prod.img}" alt="${prod.name}" id="main-product-img" />
    </div>
    <p class="media-note">Product drawings are not perfectly to scale and do not adjust according to selected dimensions.</p>
  `;

  // Product Info (config + price)
  const isConsultation = det.price === 'BOOK A CONSULTATION';
  const priceHTML = isConsultation
    ? `<div class="product-price consultation">BOOK A CONSULTATION</div>`
    : `<div class="product-price">From <strong>${det.price}</strong> CAD</div>`;

  const widthsHTML = det.widths?.length ? `
    <div class="config-group">
      <label>Width</label>
      <input type="text" class="config-input" placeholder="Type your preferred number" />
    </div>` : '';

  const heightsHTML = det.heights?.length ? `
    <div class="config-group">
      <label>Height</label>
      <input type="text" class="config-input" placeholder="Type your preferred number" />
    </div>` : '';

  const depthsHTML = det.depths?.length ? `
    <div class="config-group">
      <label>Depth</label>
      <input type="text" class="config-input" placeholder="Type your preferred number" />
    </div>` : '';

  document.getElementById('product-info').innerHTML = `
    <h1>${prod.name}</h1>
    ${priceHTML}
    <p class="style-note">Available in all styles and finishes — selection is made at checkout.</p>
    <div class="product-configurator">
      ${widthsHTML}
      ${heightsHTML}
      ${depthsHTML}
      <div class="config-group">
        <label>Door Opening</label>
        <div class="config-options">
          <button class="config-btn active">From the Right</button>
          <button class="config-btn">From the Left</button>
        </div>
      </div>
      <div class="config-group">
        <label>Door Style</label>
        <div class="door-style-selector" id="door-style-selector">
          <button class="config-btn finish-select-btn" id="open-door-style-modal">Select Door Style</button>
        </div>
      </div>
      <div class="config-group">
        <label>Finish / Texture</label>
        <div class="finish-selector" id="finish-selector">
          <button class="config-btn finish-select-btn" id="open-finish-modal">Select Finish</button>
        </div>
      </div>
    </div>
    <div class="product-actions">
      ${isConsultation
        ? '<a href="#" class="btn-primary btn-lg">Book a Consultation</a>'
        : '<button class="btn-primary btn-lg" id="add-to-cart">Add to Cart</button>'}
    </div>
    <div class="product-features">
      <div class="feature"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg> Delivered Pre-Assembled</div>
      <div class="feature"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg> Built With Soft-Close Hardware</div>
      <div class="feature"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg> Manufactured in Canada</div>
    </div>
  `;

  // --- Texture Selector Modal ---
  createFinishModal();
  setupFinishModal();

  // --- Door Style Selector Modal ---
  createDoorStyleModal();
  setupDoorStyleModal();

  // Accordions
  document.getElementById('product-accordions').innerHTML = `
    <div class="accordion" id="acc-desc">
      <button class="accordion-trigger active">
        <span>Product Description</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="accordion-content open">
        <p>${det.desc}</p>
        <div class="detail-specs">
          <p><strong>Width</strong> refers to the width of the cabinet box.</p>
          <p><strong>Depth</strong> refers to the depth of the cabinet box (excludes cabinet doors/fronts).</p>
          <p><strong>Height</strong> refers to the overall height of the cabinet${prod.category === 'base' ? ' (includes leg height of 4.25″, excludes countertop)' : ''}.</p>
          ${det.drawers ? `<p>Drawer quantity = ${det.drawers}</p>` : ''}
          ${det.shelf ? `<p>Adjustable shelf quantity = ${det.shelf}</p>` : ''}
        </div>
      </div>
    </div>
    <div class="accordion" id="acc-included">
      <button class="accordion-trigger">
        <span>Included Components</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="accordion-content">
        <div class="included-grid">
          <div>
            <h4>Included</h4>
            <ul>
              <li>Cabinet Box</li>
              <li>Cabinet Fronts (door/drawer faces)</li>
              <li>Adjustable Legs</li>
              <li>Hinge/Drawer Hardware</li>
              <li>Adjustable Shelves (if applicable)</li>
              <li>Drawer Boxes (if applicable)</li>
              <li>Accessories (if applicable)</li>
              <li>Complimentary Finish Panels (if applicable)</li>
            </ul>
          </div>
          <div>
            <h4>Not Included</h4>
            <ul>
              <li>Toe-Kick Trim</li>
              <li>Side/End Panels</li>
              <li>Handles/Knobs</li>
              <li>Countertops (if applicable)</li>
              <li>Appliances (if applicable)</li>
              <li>Plumbing Fixtures (if applicable)</li>
              <li>Fastening Screws</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="accordion" id="acc-delivery">
      <button class="accordion-trigger">
        <span>Delivery and Lead Time</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="accordion-content">
        <p><strong>Delivery:</strong> We deliver to most locations within the Greater Toronto Area (GTA) without additional shipping charges once our minimum order value is met.</p>
        <p><strong>Lead Time:</strong> All products are made to order with a lead time of 8 weeks. Following your purchase, you will schedule a convenient delivery date.</p>
      </div>
    </div>
  `;

  // Accordion interactions
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      const isOpen = content.classList.contains('open');
      trigger.classList.toggle('active', !isOpen);
      content.classList.toggle('open', !isOpen);
    });
  });

  // Config button interactions
  document.querySelectorAll('.config-group').forEach(group => {
    group.querySelectorAll('.config-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.config-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  // Related products
  const related = products
    .filter(p => p.category === prod.category && p.id !== prod.id)
    .slice(0, 4);

  document.getElementById('related-grid').innerHTML = related.map(r => `
    <a href="/product.html?id=${r.id}" class="related-card">
      <div class="related-img"><img src="${r.img}" alt="${r.name}" loading="lazy" /></div>
      <h4>${r.name}</h4>
    </a>
  `).join('');
}

// --- Finish Selector Modal ---
function createFinishModal() {
  const modal = document.createElement('div');
  modal.id = 'finish-modal';
  modal.className = 'finish-modal-overlay';
  modal.innerHTML = `
    <div class="finish-modal">
      <div class="finish-modal-header">
        <h3>Select a Finish</h3>
        <button class="finish-modal-close" id="close-finish-modal">&times;</button>
      </div>
      <div class="finish-modal-filters">
        ${Object.entries(categoryLabelsFinishes).map(([key, label], i) =>
          `<button class="finish-filter-tab${i === 0 ? ' active' : ''}" data-cat="${key}">${label}</button>`
        ).join('')}
      </div>
      <div class="finish-modal-grid" id="finish-modal-grid"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

function setupFinishModal() {
  const modal = document.getElementById('finish-modal');
  const grid = document.getElementById('finish-modal-grid');
  const openBtn = document.getElementById('open-finish-modal');
  const closeBtn = document.getElementById('close-finish-modal');
  const filterTabs = modal.querySelectorAll('.finish-filter-tab');

  function renderModalGrid(category) {
    const filtered = panelsData.filter(p => p.category === category);
    grid.innerHTML = filtered.map(item => `
      <div class="finish-modal-card" data-name="${item.name}" data-img="${item.img}" data-code="${item.code}">
        <div class="finish-modal-swatch">
          <img src="${item.img}" alt="${item.name}" loading="lazy" />
        </div>
        <span class="finish-modal-name">${item.name}</span>
      </div>
    `).join('');

    // Card click → select finish
    grid.querySelectorAll('.finish-modal-card').forEach(card => {
      card.addEventListener('click', () => {
        const name = card.dataset.name;
        const img = card.dataset.img;
        selectFinish(name, img);
        modal.classList.remove('open');
      });
    });
  }

  // Filter tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderModalGrid(tab.dataset.cat);
    });
  });

  // Open / Close
  openBtn.addEventListener('click', () => {
    modal.classList.add('open');
    // Reset to first category
    filterTabs.forEach(t => t.classList.remove('active'));
    filterTabs[0].classList.add('active');
    renderModalGrid(Object.keys(categoryLabelsFinishes)[0]);
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

function selectFinish(name, img) {
  const selector = document.getElementById('finish-selector');
  selector.innerHTML = `
    <div class="finish-selected">
      <img src="${img}" alt="${name}" class="finish-selected-thumb" />
      <span class="finish-selected-name">${name}</span>
      <button class="config-btn finish-change-btn" id="open-finish-modal">Change</button>
    </div>
  `;
  // Re-bind the change button
  document.getElementById('open-finish-modal').addEventListener('click', () => {
    document.getElementById('finish-modal').classList.add('open');
  });
}

// --- Door Style Selector Modal ---
function createDoorStyleModal() {
  const modal = document.createElement('div');
  modal.id = 'door-style-modal';
  modal.className = 'finish-modal-overlay door-style-modal-overlay';
  modal.innerHTML = `
    <div class="finish-modal door-style-modal">
      <div class="finish-modal-header">
        <h3>Select a Door Style</h3>
        <button class="finish-modal-close" id="close-door-style-modal">&times;</button>
      </div>
      <div class="finish-modal-filters">
        ${Object.entries(categoryLabelsDoorStyles).map(([key, label], i) =>
          `<button class="finish-filter-tab${i === 0 ? ' active' : ''}" data-cat="${key}">${label}</button>`
        ).join('')}
      </div>
      <div class="finish-modal-grid door-style-modal-grid" id="door-style-modal-grid"></div>
    </div>
  `;
  document.body.appendChild(modal);
}

function setupDoorStyleModal() {
  const modal = document.getElementById('door-style-modal');
  const grid = document.getElementById('door-style-modal-grid');
  const openBtn = document.getElementById('open-door-style-modal');
  const closeBtn = document.getElementById('close-door-style-modal');
  const filterTabs = modal.querySelectorAll('.finish-filter-tab');

  function renderModalGrid(category) {
    const filtered = doorStylesData.filter(p => p.category === category);
    grid.innerHTML = filtered.map(item => `
      <div class="finish-modal-card door-style-modal-card" data-name="${item.name}" data-img="${item.img}">
        <div class="finish-modal-swatch door-style-modal-swatch">
          <img src="${item.img}" alt="${item.name}" loading="lazy" />
        </div>
        <span class="finish-modal-name">${item.name}</span>
      </div>
    `).join('');

    // Card click → select door style
    grid.querySelectorAll('.door-style-modal-card').forEach(card => {
      card.addEventListener('click', () => {
        const name = card.dataset.name;
        const img = card.dataset.img;
        selectDoorStyle(name, img);
        modal.classList.remove('open');
      });
    });
  }

  // Filter tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderModalGrid(tab.dataset.cat);
    });
  });

  // Open / Close
  openBtn.addEventListener('click', () => {
    modal.classList.add('open');
    filterTabs.forEach(t => t.classList.remove('active'));
    filterTabs[0].classList.add('active');
    renderModalGrid(Object.keys(categoryLabelsDoorStyles)[0]);
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

function selectDoorStyle(name, img) {
  const selector = document.getElementById('door-style-selector');
  selector.innerHTML = `
    <div class="finish-selected">
      <img src="${img}" alt="${name}" class="finish-selected-thumb door-style-thumb" />
      <span class="finish-selected-name">${name}</span>
      <button class="config-btn finish-change-btn" id="open-door-style-modal">Change</button>
    </div>
  `;
  // Re-bind the change button
  document.getElementById('open-door-style-modal').addEventListener('click', () => {
    document.getElementById('door-style-modal').classList.add('open');
  });
}
