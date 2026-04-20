import './style.css';

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

// --- Hide announcement banner during slideshow hero ---
(() => {
  const slideshowHero = document.getElementById('slideshow-hero');
  const announcementBanner = document.querySelector('.announcement-banner');
  if (!slideshowHero) return;

  function updateHeaderVisibility() {
    const rect = slideshowHero.getBoundingClientRect();
    const inSlideshow = rect.bottom > 0;
    if (announcementBanner) announcementBanner.classList.toggle('slideshow-hidden', inSlideshow);
  }

  window.addEventListener('scroll', updateHeaderVisibility, { passive: true });
  updateHeaderVisibility();
})();

// --- Hero Video Cycle (Dual-video crossfade, no flash) ---
const heroVideoA = document.getElementById('hero-video-a');
const heroVideoB = document.getElementById('hero-video-b');
if (heroVideoA && heroVideoB) {
  const heroSources = [
    '/videos/hero-1.mp4',
    '/videos/hero-2.mp4',
  ];
  let heroIdx = 0;
  let currentVideo = heroVideoA;
  let nextVideo = heroVideoB;

  heroVideoA.play();

  function queueNextHero() {
    heroIdx = (heroIdx + 1) % heroSources.length;
    nextVideo.src = heroSources[heroIdx];
    nextVideo.load();
  }

  function onHeroEnded() {
    // Preload next in the hidden video
    heroIdx = (heroIdx + 1) % heroSources.length;
    nextVideo.src = heroSources[heroIdx];
    nextVideo.load();

    nextVideo.addEventListener('canplay', function onReady() {
      nextVideo.removeEventListener('canplay', onReady);
      // Crossfade: show next, hide current
      nextVideo.classList.add('active');
      currentVideo.classList.remove('active');
      nextVideo.play();

      // Swap references
      const temp = currentVideo;
      currentVideo = nextVideo;
      nextVideo = temp;
    }, { once: true });
  }

  heroVideoA.addEventListener('ended', onHeroEnded);
  heroVideoB.addEventListener('ended', onHeroEnded);
}


// (Snapping handled by CSS scroll-snap — no JS needed)


// --- Sticky Header ---
const header = document.getElementById('site-header');
const banner = document.querySelector('.announcement-banner');
let lastScrollY = 0;

function updateHeader() {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
    if (banner) banner.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
    if (banner) banner.classList.remove('scrolled');
  }
  lastScrollY = window.scrollY;
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
      card.style.transform = `
        translate(-50%, -50%)
        translateX(${(CARD_SIZE / 1.5) * position}px)
        translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
        rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
      `;
      card.style.zIndex = isCenter ? 10 : Math.max(1, 5 - Math.abs(position));

      card.innerHTML = `
        <img src="${t.img}" alt="${t.by.split(',')[0]}" class="stagger-avatar" />
        <h3 class="stagger-quote">"${t.text}"</h3>
        <p class="stagger-author">— ${t.by}</p>
      `;

      card.addEventListener('click', () => {
        if (position !== 0) shiftList(position);
      });

      staggerContainer.appendChild(card);
    });
  }

  function shiftList(steps) {
    const arr = [...list];
    if (steps > 0) {
      for (let i = 0; i < steps; i++) {
        arr.push(arr.shift());
      }
    } else {
      for (let i = 0; i < Math.abs(steps); i++) {
        arr.unshift(arr.pop());
      }
    }
    list = arr;
    renderCards();
  }

  staggerPrev.addEventListener('click', () => shiftList(-1));
  staggerNext.addEventListener('click', () => shiftList(1));

  renderCards();
}

// --- Video Showcase (Lazy-loaded, dual-video crossfade) ---
const showcaseVideoA = document.getElementById('showcase-video-a');
const showcaseVideoB = document.getElementById('showcase-video-b');
if (showcaseVideoA && showcaseVideoB) {
  const showcaseSources = [
    '/videos/showcase-kitchen.mp4',
    '/videos/showcase-wine-racks.mp4',
  ];
  let scIdx = 0;
  let scCurrent = showcaseVideoA;
  let scNext = showcaseVideoB;
  let showcaseStarted = false;

  // Only load when section is near viewport
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

      const temp = scCurrent;
      scCurrent = scNext;
      scNext = temp;
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
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  });
});

// --- Scroll-Driven Hero → Comparison Overlay ---
const heroWrapper = document.getElementById('hero-wrapper');
const comparisonOverlay = document.getElementById('comparison-overlay');
const heroContent = document.getElementById('hero-content');
const grayscaleOverlay = document.getElementById('hero-grayscale-overlay');
let updateHeroComparison = null;

if (heroWrapper && comparisonOverlay) {
  let cachedVh = window.innerHeight;
  let isOverlayVisible = false;
  let lastProgress = -1;

  // Recalculate vh on resize
  window.addEventListener('resize', () => { cachedVh = window.innerHeight; }, { passive: true });

  updateHeroComparison = () => {
    const scrolled = -heroWrapper.getBoundingClientRect().top;

    // Transition zone: first 80vh of scroll does the animation
    // After that, the comparison just stays visible (dwell time)
    const transitionZone = cachedVh * 0.6;
    const progress = Math.max(0, Math.min(1, scrolled / transitionZone));

    // Skip if nothing changed (avoids unnecessary style writes)
    if (Math.abs(progress - lastProgress) < 0.005) return;
    lastProgress = progress;

    // Desaturate via overlay opacity (GPU-composited, no video re-processing)
    if (grayscaleOverlay) {
      grayscaleOverlay.style.opacity = progress;
    }

    // Slide overlay up: starts at translateY(100%), ends at translateY(0%)
    comparisonOverlay.style.transform = `translateY(${100 * (1 - progress)}%)`;
    comparisonOverlay.style.opacity = progress;

    const shouldBeVisible = progress > 0.05;
    if (shouldBeVisible !== isOverlayVisible) {
      isOverlayVisible = shouldBeVisible;
      comparisonOverlay.classList.toggle('visible', shouldBeVisible);
    }

    // Fade out hero text as comparison slides in
    heroContent.style.opacity = Math.max(0, 1 - progress * 1.5);
    heroContent.style.transform = `translateY(${-progress * 40}px)`;
  };

  updateHeroComparison(); // init
}

// --- Scroll-Activated Quality Section ---
const qualitySection = document.querySelector('.quality-scroll');
let updateQualityStep = null;
if (qualitySection) {
  const totalSteps = 4;
  const images = qualitySection.querySelectorAll('.quality-slide-img');
  const steps = qualitySection.querySelectorAll('.quality-step');
  const dots = qualitySection.querySelectorAll('.quality-dot');
  let currentStep = -1;

  updateQualityStep = () => {
    const rect = qualitySection.getBoundingClientRect();
    const sectionHeight = qualitySection.offsetHeight;
    const scrolled = -rect.top; // how far we've scrolled into the section
    const stepHeight = sectionHeight / 3.5; // matches 300vh section

    // Calculate which step we're on
    let step = Math.floor(scrolled / stepHeight);
    step = Math.max(0, Math.min(totalSteps - 1, step));

    if (step !== currentStep) {
      currentStep = step;

      // Update images
      images.forEach(img => img.classList.remove('active'));
      if (images[step]) images[step].classList.add('active');

      // Update text
      steps.forEach(s => s.classList.remove('active'));
      if (steps[step]) steps[step].classList.add('active');

      // Update dots
      dots.forEach(d => d.classList.remove('active'));
      if (dots[step]) dots[step].classList.add('active');
    }
  };

  updateQualityStep(); // init
}

// --- Scroll-Activated How It Works Section ---
const hiwSection = document.querySelector('.how-it-works-scroll');
let updateHIW = null;
if (hiwSection) {
  const hiwSteps = hiwSection.querySelectorAll('.hiw-step');
  const hiwImgs = hiwSection.querySelectorAll('.hiw-img');
  let currentHiwStep = -1;

  updateHIW = () => {
    const rect = hiwSection.getBoundingClientRect();
    const sectionHeight = hiwSection.offsetHeight;
    const scrolled = -rect.top;
    const stepHeight = sectionHeight / 3.5;

    let step = Math.floor(scrolled / stepHeight);
    step = Math.max(0, Math.min(3, step));

    if (step !== currentHiwStep) {
      currentHiwStep = step;
      hiwSteps.forEach(s => s.classList.remove('active'));
      hiwImgs.forEach(img => img.classList.remove('active'));
      if (hiwSteps[step]) hiwSteps[step].classList.add('active');
      if (hiwImgs[step]) hiwImgs[step].classList.add('active');
    }
  };
  updateHIW();
}

// --- Single Unified Scroll Handler (rAF throttled) ---
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateHeader();
      if (updateHeroComparison) updateHeroComparison();
      if (typeof updateQualityStep === 'function') updateQualityStep();
      if (updateHIW) updateHIW();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

// --- Intersection Observer for Reveal Animations ---
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add reveal animations to key elements (NOT comparison-cards — they're in the hero overlay now)
document.querySelectorAll('.style-card, .gallery-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});

// Add stagger to cards in grids
document.querySelectorAll('.styles-grid').forEach(grid => {
  const children = grid.children;
  Array.from(children).forEach((child, index) => {
    child.style.transitionDelay = `${index * 0.12}s`;
  });
});

// Style for revealed elements (added via JS to avoid flash of unstyled content)
const style = document.createElement('style');
style.textContent = `
  .revealed {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

