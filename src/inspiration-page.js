// ---------- Inspiration Page — Before / After Carousel ----------
const inspViewport = document.getElementById('insp-viewport');

if (inspViewport) {
  const slides = Array.from(inspViewport.querySelectorAll('.insp-slide'));
  const dots = Array.from(inspViewport.querySelectorAll('.insp-dot'));
  const counter = document.getElementById('insp-current');
  const TOTAL = slides.length;
  let current = 0;
  let transitioning = false;
  const COOLDOWN = 800;

  function goTo(idx) {
    if (transitioning || idx === current || idx < 0 || idx >= TOTAL) return;
    transitioning = true;

    const dir = idx > current ? 1 : -1;
    const prev = slides[current];
    const next = slides[idx];

    // Prep next slide off-screen
    next.classList.add(dir > 0 ? 'enter-from-below' : 'enter-from-above');
    next.classList.add('active');

    // Force reflow
    void next.offsetHeight;

    // Remove prep class to trigger transition
    next.classList.remove('enter-from-below', 'enter-from-above');

    // Fade out prev
    prev.classList.add('leaving');

    // Update dots
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));

    // Update counter
    if (counter) counter.textContent = String(idx + 1).padStart(2, '0');

    current = idx;

    setTimeout(() => {
      prev.classList.remove('active', 'leaving');
      transitioning = false;
    }, COOLDOWN);
  }

  // Wheel navigation
  inspViewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 15) return;
    goTo(e.deltaY > 0 ? current + 1 : current - 1);
  }, { passive: false });

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.target, 10) - 1);
    });
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(current - 1);
  });

  // Touch swipe
  let touchY = 0;
  inspViewport.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  inspViewport.addEventListener('touchend', (e) => {
    const diff = touchY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });
}
