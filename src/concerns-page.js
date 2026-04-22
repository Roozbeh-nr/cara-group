/* =============================================
   CONCERNS PAGE — Fixed Viewport Carousel
   Wheel events swap slides with animations.
   No scrolling — single viewport.
   ============================================= */

import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.cc-slide');
  const totalSlides = slides.length;
  let currentSlide = 0;
  let isTransitioning = false;
  const TRANSITION_DURATION = 700; // ms, match CSS
  const COOLDOWN = 900; // ms cooldown between transitions

  function goToSlide(targetIndex) {
    if (isTransitioning || targetIndex === currentSlide) return;
    if (targetIndex < 0 || targetIndex >= totalSlides) return;

    isTransitioning = true;
    const direction = targetIndex > currentSlide ? 'down' : 'up';
    const outSlide = slides[currentSlide];
    const inSlide = slides[targetIndex];

    // Set direction-based exit/enter classes
    outSlide.classList.add(direction === 'down' ? 'exit-up' : 'exit-down');
    outSlide.classList.remove('active');

    inSlide.classList.add(direction === 'down' ? 'enter-from-below' : 'enter-from-above');
    // Force reflow so transition triggers
    void inSlide.offsetWidth;
    inSlide.classList.add('active');
    inSlide.classList.remove('enter-from-below', 'enter-from-above');

    currentSlide = targetIndex;

    setTimeout(() => {
      outSlide.classList.remove('exit-up', 'exit-down');
      isTransitioning = false;
    }, TRANSITION_DURATION);
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  }

  // Wheel listener — one slide per scroll gesture with cooldown
  const viewport = document.getElementById('cc-viewport');
  let lastWheelTime = 0;

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastWheelTime < COOLDOWN) return; // ignore rapid scrolls
    if (isTransitioning) return;

    if (e.deltaY > 5) {
      nextSlide();
      lastWheelTime = now;
    } else if (e.deltaY < -5) {
      prevSlide();
      lastWheelTime = now;
    }
  }, { passive: false });

  // Touch support
  let touchStartY = 0;
  viewport.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    }
  });

  // Character split animation for headings
  slides.forEach((slide) => {
    const heading = slide.querySelector('.cc-heading');
    if (!heading) return;

    const text = heading.textContent;
    heading.textContent = '';
    heading.setAttribute('aria-label', text);

    const words = text.split(' ');
    let charIndex = 0;

    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'cc-word';

      word.split('').forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'cc-char';
        charSpan.textContent = char;
        charSpan.style.transitionDelay = `${0.35 + charIndex * 0.025}s`;
        wordSpan.appendChild(charSpan);
        charIndex++;
      });

      heading.appendChild(wordSpan);

      if (wordIdx < words.length - 1) {
        const space = document.createElement('span');
        space.className = 'cc-char';
        space.innerHTML = '&nbsp;';
        space.style.transitionDelay = `${0.35 + charIndex * 0.025}s`;
        heading.appendChild(space);
        charIndex++;
      }
    });
  });
});
