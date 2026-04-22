import './style.css';

// ====================================================================
// GET STARTED PAGE — Form Controller (no modal, inline on page)
// ====================================================================

const STEPS = [
  { id: 'contact',  title: 'Contact Info' },
  { id: 'rooms',    title: 'Rooms' },
  { id: 'budget',   title: 'Budget' },
  { id: 'timeline', title: 'Timeline' },
  { id: 'details',  title: 'Details' },
];

let currentStep = 0;
let formData = {
  name: '', email: '', phone: '',
  roomTypes: [],  // multi-select array
  budget: '', timeline: '',
  additionalInfo: '',
};

const prevBtn = document.getElementById('gs-prev');
const nextBtn = document.getElementById('gs-next');
const progressFill = document.getElementById('gs-progress-fill');
const stepIndicator = document.getElementById('gs-step-indicator');
const stepsContainer = document.getElementById('gs-steps');
const dots = document.querySelectorAll('.gs-dot');

if (stepsContainer) {
  // Navigation
  prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
  nextBtn.addEventListener('click', () => {
    if (currentStep === STEPS.length - 1) handleSubmit();
    else goToStep(currentStep + 1);
  });

  // Dot navigation
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { if (i <= currentStep) goToStep(i); });
  });

  // Input listeners
  stepsContainer.addEventListener('input', (e) => {
    const field = e.target.dataset.field;
    if (field) formData[field] = e.target.value;
    updateNextBtn();
  });

  // Option click delegation — supports both single-select and multi-select
  stepsContainer.addEventListener('click', (e) => {
    const option = e.target.closest('.gs-option');
    if (!option) return;
    const field = option.dataset.field;
    const value = option.dataset.value;
    if (!field || !value) return;

    const group = option.closest('.gs-option-group');
    const isMulti = group && group.dataset.multi === 'true';

    if (isMulti) {
      // Toggle selection
      option.classList.toggle('selected');
      // Rebuild array from selected options
      const selected = [];
      group.querySelectorAll('.gs-option.selected').forEach(o => selected.push(o.dataset.value));
      formData[field] = selected;
    } else {
      // Single select — clear others in group
      if (group) group.querySelectorAll('.gs-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      formData[field] = value;
    }
    updateNextBtn();
  });

  goToStep(0);
}

let confirmationShown = false;

function goToStep(step) {
  if (step < 0 || step >= STEPS.length) return;
  const direction = step > currentStep ? 'forward' : 'backward';
  const panels = stepsContainer.querySelectorAll('.gs-step-panel');

  // Show confirmation banner when leaving step 1 for the first time
  if (currentStep === 0 && step === 1 && !confirmationShown) {
    confirmationShown = true;
    showConfirmationBanner();
  }

  if (panels[currentStep]) {
    panels[currentStep].classList.remove('active', 'slide-in-forward', 'slide-in-backward');
    panels[currentStep].classList.add(direction === 'forward' ? 'slide-out-forward' : 'slide-out-backward');
  }

  currentStep = step;

  setTimeout(() => {
    panels.forEach(p => p.classList.remove('active', 'slide-in-forward', 'slide-in-backward', 'slide-out-forward', 'slide-out-backward'));
    if (panels[currentStep]) panels[currentStep].classList.add('active', direction === 'forward' ? 'slide-in-forward' : 'slide-in-backward');
  }, 200);

  progressFill.style.width = `${(currentStep / (STEPS.length - 1)) * 100}%`;
  dots.forEach((dot, i) => {
    dot.classList.toggle('completed', i < currentStep);
    dot.classList.toggle('active', i === currentStep);
  });
  stepIndicator.textContent = `Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep].title}`;
  prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.querySelector('.gs-btn-text').textContent = currentStep === STEPS.length - 1 ? 'Submit' : 'Next';
  nextBtn.querySelector('.gs-btn-icon').innerHTML = currentStep === STEPS.length - 1
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>';

  restoreSelections();
  updateNextBtn();
}

function showConfirmationBanner() {
  const banner = document.getElementById('gs-confirmation-banner');
  if (banner) {
    banner.classList.add('visible');
    setTimeout(() => banner.classList.remove('visible'), 6000);
  }
}

function restoreSelections() {
  const panel = stepsContainer.querySelectorAll('.gs-step-panel')[currentStep];
  if (!panel) return;
  panel.querySelectorAll('input[data-field], textarea[data-field]').forEach(input => {
    if (formData[input.dataset.field]) input.value = formData[input.dataset.field];
  });
  panel.querySelectorAll('.gs-option[data-field]').forEach(option => {
    const field = option.dataset.field;
    const value = option.dataset.value;
    if (Array.isArray(formData[field])) {
      // Multi-select: check if value is in the array
      if (formData[field].includes(value)) option.classList.add('selected');
    } else {
      if (formData[field] === value) option.classList.add('selected');
    }
  });
}

function updateNextBtn() {
  let valid = false;
  switch (currentStep) {
    case 0: valid = formData.name.trim() !== '' && formData.email.trim() !== ''; break;
    case 1: valid = formData.roomTypes.length > 0; break;
    case 2: valid = formData.budget !== ''; break;
    case 3: valid = formData.timeline !== ''; break;
    default: valid = true;
  }
  nextBtn.disabled = !valid;
}

function handleSubmit() {
  nextBtn.disabled = true;
  nextBtn.querySelector('.gs-btn-text').textContent = 'Submitting...';
  nextBtn.querySelector('.gs-btn-icon').innerHTML = '<svg class="gs-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

  setTimeout(() => {
    stepsContainer.innerHTML = `
      <div class="gs-success active">
        <div class="gs-success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h3>Thank you!</h3>
        <p>We've received your information and will be in touch within 24 hours to discuss your project.</p>
      </div>
    `;
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    document.querySelector('.gs-progress').style.display = 'none';
    stepIndicator.textContent = 'Submitted Successfully';
  }, 1500);
}

