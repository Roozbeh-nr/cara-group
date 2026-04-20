import './style.css';
import './get-started-form.js';

// --- Slideshow Hero (5-second crossfade cycle) ---
(() => {
  const slides = document.querySelectorAll('.slideshow-slide');
  if (slides.length < 2) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
})();

// --- Hero Video Cycle (Dual-video crossfade, no flash) ---
const heroVideoA = document.getElementById('hero-video-a');
const heroVideoB = document.getElementById('hero-video-b');
if (heroVideoA && heroVideoB) {
  const heroSources = ['/videos/hero-1.mp4', '/videos/hero-2.mp4'];
  let heroIdx = 0;
  let currentVideo = heroVideoA;
  let nextVideo = heroVideoB;

  heroVideoA.play();

  function onHeroEnded() {
    heroIdx = (heroIdx + 1) % heroSources.length;
    nextVideo.src = heroSources[heroIdx];
    nextVideo.load();
    nextVideo.addEventListener('canplay', function onReady() {
      nextVideo.removeEventListener('canplay', onReady);
      nextVideo.classList.add('active');
      currentVideo.classList.remove('active');
      nextVideo.play();
      const temp = currentVideo;
      currentVideo = nextVideo;
      nextVideo = temp;
    }, { once: true });
  }

  heroVideoA.addEventListener('ended', onHeroEnded);
  heroVideoB.addEventListener('ended', onHeroEnded);
}

// --- Stagger Testimonials ---
const staggerContainer = document.getElementById('stagger-testimonials');
const staggerPrev = document.getElementById('stagger-prev');
const staggerNext = document.getElementById('stagger-next');

if (staggerContainer && staggerPrev && staggerNext) {
  const CARD_SIZE = window.innerWidth < 640 ? 300 : 420;
  const testimonials = [
    { text: "Incredible quality for the price. The cabinets arrived fully assembled and the soft-close drawers feel premium.", by: "Sarah M., Toronto ON", img: "/images/avatar-sarah.png" },
    { text: "We saved over $8,000 compared to a local quote for the same style. The team was super responsive.", by: "James K., Mississauga ON", img: "/images/avatar-james.png" },
    { text: "I was skeptical ordering cabinets online, but Cara exceeded every expectation. The wood finish is stunning.", by: "Michael R., Ottawa ON", img: "/images/avatar-michael.png" },
    { text: "From order to delivery in 3 weeks. The painted white cabinets are flawless. Highly recommend.", by: "Priya S., Brampton ON", img: "/images/avatar-priya.png" },
    { text: "The Blum hardware makes all the difference. These feel just as good as cabinets twice the price.", by: "David L., Hamilton ON", img: "/images/avatar-david.png" },
    { text: "Our contractor was blown away by the build quality. Clean lines and modern look — exactly what we wanted.", by: "Linda P., Markham ON", img: "/images/avatar-linda.png" },
    { text: "So glad we found Cara. The customization options are incredible and everything fit perfectly.", by: "Andre T., Vaughan ON", img: "/images/avatar-andre.png" },
    { text: "It's just the best. Period. We've recommended Cara to three friends already.", by: "Marina H., London ON", img: "/images/avatar-marina.png" },
    { text: "I'd bet you've saved me 100 hours of showroom visits. The online process is seamless.", by: "Jeremy W., Kingston ON", img: "/images/avatar-jeremy.png" },
    { text: "Took some convincing, but now that we have Cara cabinets, we're never going back.", by: "Pam D., Richmond Hill ON", img: "/images/avatar-pam.png" },
  ];

  let list = [...testimonials];

  function renderCards() {
    staggerContainer.innerHTML = '';
    const half = Math.floor(list.length / 2);
    list.forEach((t, i) => {
      const position = i - half;
      const isCenter = position === 0;
      const card = document.createElement('div');
      card.className = 'stagger-card' + (isCenter ? ' is-center' : '');
      card.style.transform = `translate(-50%, -50%) translateX(${(CARD_SIZE / 1.5) * position}px) translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px) rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)`;
      card.style.zIndex = isCenter ? 10 : Math.max(1, 5 - Math.abs(position));
      card.innerHTML = `<img src="${t.img}" alt="${t.by.split(',')[0]}" class="stagger-avatar" /><h3 class="stagger-quote">"${t.text}"</h3><p class="stagger-author">— ${t.by}</p>`;
      card.addEventListener('click', () => { if (position !== 0) shiftList(position); });
      staggerContainer.appendChild(card);
    });
  }

  function shiftList(steps) {
    const arr = [...list];
    if (steps > 0) { for (let i = 0; i < steps; i++) arr.push(arr.shift()); }
    else { for (let i = 0; i < Math.abs(steps); i++) arr.unshift(arr.pop()); }
    list = arr;
    renderCards();
  }

  staggerPrev.addEventListener('click', () => shiftList(-1));
  staggerNext.addEventListener('click', () => shiftList(1));
  renderCards();
}

// --- Video Showcase (Lazy-loaded) ---
const showcaseVideoA = document.getElementById('showcase-video-a');
const showcaseVideoB = document.getElementById('showcase-video-b');
if (showcaseVideoA && showcaseVideoB) {
  const showcaseSources = ['/videos/showcase-kitchen.mp4', '/videos/showcase-wine-racks.mp4'];
  let scIdx = 0, scCurrent = showcaseVideoA, scNext = showcaseVideoB, showcaseStarted = false;

  const showcaseSection = document.getElementById('showcase-scroll');
  if (showcaseSection) {
    const lazyObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !showcaseStarted) {
        showcaseStarted = true;
        showcaseVideoA.src = showcaseSources[0];
        showcaseVideoA.load();
        showcaseVideoA.play();
        lazyObserver.disconnect();
      }
    }, { rootMargin: '200px' });
    lazyObserver.observe(showcaseSection);
  }

  function onShowcaseEnded() {
    scIdx = (scIdx + 1) % showcaseSources.length;
    scNext.src = showcaseSources[scIdx];
    scNext.load();
    scNext.addEventListener('canplay', function onReady() {
      scNext.removeEventListener('canplay', onReady);
      scNext.classList.add('active');
      scCurrent.classList.remove('active');
      scNext.play();
      const temp = scCurrent; scCurrent = scNext; scNext = temp;
    }, { once: true });
  }

  showcaseVideoA.addEventListener('ended', onShowcaseEnded);
  showcaseVideoB.addEventListener('ended', onShowcaseEnded);
}

// --- Smooth Scroll for Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    }
  });
});


// ====================================================================
// PERFORMANCE-OPTIMIZED SCROLL SYSTEM
// Uses cached offsets + window.scrollY to avoid getBoundingClientRect()
// All reads are batched before writes to prevent layout thrashing
// ====================================================================

const header = document.getElementById('site-header');
const headerBanner = document.querySelector('.announcement-banner');
const heroWrapper = document.getElementById('hero-wrapper');
const comparisonOverlay = document.getElementById('comparison-overlay');
const heroContent = document.getElementById('hero-content');
const grayscaleOverlay = document.getElementById('hero-grayscale-overlay');
const qualitySection = document.querySelector('.quality-scroll');
const hiwSection = document.querySelector('.how-it-works-scroll');

// Cache section offsets — recalculated only on resize
let sectionCache = {};
let cachedVh = window.innerHeight;

function cacheSectionOffsets() {
  cachedVh = window.innerHeight;
  const scrollY = window.scrollY;

  if (heroWrapper) {
    const rect = heroWrapper.getBoundingClientRect();
    sectionCache.hero = { top: rect.top + scrollY, height: heroWrapper.offsetHeight };
  }
  if (qualitySection) {
    const rect = qualitySection.getBoundingClientRect();
    sectionCache.quality = { top: rect.top + scrollY, height: qualitySection.offsetHeight };
  }
  if (hiwSection) {
    const rect = hiwSection.getBoundingClientRect();
    sectionCache.hiw = { top: rect.top + scrollY, height: hiwSection.offsetHeight };
  }
}

// Calculate offsets on load and resize (debounced)
cacheSectionOffsets();
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(cacheSectionOffsets, 250);
}, { passive: true });

// Quality section elements
let qualityImages, qualitySteps, qualityDots, currentQualityStep = -1;
if (qualitySection) {
  qualityImages = qualitySection.querySelectorAll('.quality-slide-img');
  qualitySteps = qualitySection.querySelectorAll('.quality-step');
  qualityDots = qualitySection.querySelectorAll('.quality-dot');
}

// HIW section elements
let hiwSteps, hiwImgs, currentHiwStep = -1;
if (hiwSection) {
  hiwSteps = hiwSection.querySelectorAll('.hiw-step');
  hiwImgs = hiwSection.querySelectorAll('.hiw-img');
}

// Hero state
let lastHeroProgress = -1;
let isOverlayVisible = false;

// Slideshow banner state
const slideshowHero = document.getElementById('slideshow-hero');
let slideshowBottom = 0;
if (slideshowHero) {
  slideshowBottom = slideshowHero.getBoundingClientRect().bottom + window.scrollY;
}

// --- SINGLE UNIFIED SCROLL HANDLER ---
// Reads scrollY ONCE, does all math with cached offsets, then writes
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(onScroll);
    scrollTicking = true;
  }
}, { passive: true });

function onScroll() {
  // === ONE READ ===
  const scrollY = window.scrollY;

  // === ALL WRITES (no layout reads from here on) ===

  // 1. Header
  if (scrollY > 50) {
    header.classList.add('scrolled');
    if (headerBanner) headerBanner.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
    if (headerBanner) headerBanner.classList.remove('scrolled');
  }

  // 1b. Slideshow banner hide
  if (slideshowHero && headerBanner) {
    headerBanner.classList.toggle('slideshow-hidden', scrollY < slideshowBottom);
  }

  // 2. Hero comparison overlay
  if (heroWrapper && comparisonOverlay && sectionCache.hero) {
    const heroScrolled = scrollY - sectionCache.hero.top;
    const transitionZone = cachedVh * 0.6;
    const progress = Math.max(0, Math.min(1, heroScrolled / transitionZone));

    if (Math.abs(progress - lastHeroProgress) >= 0.005) {
      lastHeroProgress = progress;

      if (grayscaleOverlay) grayscaleOverlay.style.opacity = progress;
      comparisonOverlay.style.transform = `translateY(${100 * (1 - progress)}%)`;
      comparisonOverlay.style.opacity = progress;
      heroContent.style.opacity = Math.max(0, 1 - progress * 1.5);
      heroContent.style.transform = `translateY(${-progress * 40}px)`;

      const shouldBeVisible = progress > 0.05;
      if (shouldBeVisible !== isOverlayVisible) {
        isOverlayVisible = shouldBeVisible;
        comparisonOverlay.classList.toggle('visible', shouldBeVisible);
      }
    }
  }

  // 3. Quality section steps
  if (qualitySection && sectionCache.quality) {
    const qScrolled = scrollY - sectionCache.quality.top;
    const stepHeight = sectionCache.quality.height / 4.5;
    let step = Math.floor(qScrolled / stepHeight);
    step = Math.max(0, Math.min(3, step));

    if (step !== currentQualityStep) {
      currentQualityStep = step;
      qualityImages.forEach(img => img.classList.remove('active'));
      qualitySteps.forEach(s => s.classList.remove('active'));
      qualityDots.forEach(d => d.classList.remove('active'));
      if (qualityImages[step]) qualityImages[step].classList.add('active');
      if (qualitySteps[step]) qualitySteps[step].classList.add('active');
      if (qualityDots[step]) qualityDots[step].classList.add('active');
    }
  }

  // 4. How It Works steps
  if (hiwSection && sectionCache.hiw) {
    const hScrolled = scrollY - sectionCache.hiw.top;
    const stepHeight = sectionCache.hiw.height / 4.5;
    let step = Math.floor(hScrolled / stepHeight);
    step = Math.max(0, Math.min(3, step));

    if (step !== currentHiwStep) {
      currentHiwStep = step;
      hiwSteps.forEach(s => s.classList.remove('active'));
      hiwImgs.forEach(img => img.classList.remove('active'));
      if (hiwSteps[step]) hiwSteps[step].classList.add('active');
      if (hiwImgs[step]) hiwImgs[step].classList.add('active');
    }
  }

  scrollTicking = false;
}

// Initial call
onScroll();

// --- Intersection Observer for Reveal Animations ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.style-card, .gallery-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});

document.querySelectorAll('.styles-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, index) => {
    child.style.transitionDelay = `${index * 0.12}s`;
  });
});

const style = document.createElement('style');
style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);
