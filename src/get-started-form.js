// ====================================================================
// GET STARTED — Multistep Form Modal
// Pure vanilla JS, no React/Tailwind dependencies
// ====================================================================

const STEPS = [
  { id: 'contact',  title: 'Contact Info' },
  { id: 'project',  title: 'Project Type' },
  { id: 'style',    title: 'Style & Finish' },
  { id: 'budget',   title: 'Budget' },
  { id: 'details',  title: 'Details' },
];

let currentStep = 0;
let formData = {
  name: '', email: '', phone: '',
  roomType: '', projectType: '',
  cabinetStyle: '', finishType: '', colorPreference: '',
  budget: '', timeline: '',
  measurements: '', additionalInfo: '',
};

// --- DOM References ---
const modal = document.getElementById('gs-modal');
const overlay = document.getElementById('gs-overlay');
const closeBtn = document.getElementById('gs-close');
const prevBtn = document.getElementById('gs-prev');
const nextBtn = document.getElementById('gs-next');
const progressFill = document.getElementById('gs-progress-fill');
const stepIndicator = document.getElementById('gs-step-indicator');
const stepsContainer = document.getElementById('gs-steps');
const dots = document.querySelectorAll('.gs-dot');

if (modal) {
  // --- Open modal ---
  document.querySelectorAll('#get-started-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // --- Close modal ---
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  // --- Navigation ---
  prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
  nextBtn.addEventListener('click', () => {
    if (currentStep === STEPS.length - 1) {
      handleSubmit();
    } else {
      goToStep(currentStep + 1);
    }
  });

  // --- Dot navigation ---
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i <= currentStep) goToStep(i);
    });
  });

  // --- Input listeners (save data on change) ---
  stepsContainer.addEventListener('input', (e) => {
    const field = e.target.dataset.field;
    if (field) formData[field] = e.target.value;
    updateNextBtn();
  });

  // --- Radio/checkbox click delegation ---
  stepsContainer.addEventListener('click', (e) => {
    const option = e.target.closest('.gs-option');
    if (!option) return;

    const field = option.dataset.field;
    const value = option.dataset.value;
    if (!field || !value) return;

    const group = option.closest('.gs-option-group');
    if (group) {
      group.querySelectorAll('.gs-option').forEach(o => o.classList.remove('selected'));
    }
    option.classList.add('selected');
    formData[field] = value;
    updateNextBtn();
  });

  // Initialize
  goToStep(0);
}

function openModal() {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.add('closing');
  setTimeout(() => {
    modal.classList.remove('active', 'closing');
    document.body.style.overflow = '';
  }, 300);
}

function goToStep(step) {
  if (step < 0 || step >= STEPS.length) return;

  const direction = step > currentStep ? 'forward' : 'backward';
  const panels = stepsContainer.querySelectorAll('.gs-step-panel');

  // Hide current
  if (panels[currentStep]) {
    panels[currentStep].classList.remove('active', 'slide-in-forward', 'slide-in-backward');
    panels[currentStep].classList.add(direction === 'forward' ? 'slide-out-forward' : 'slide-out-backward');
  }

  currentStep = step;

  // Show next
  setTimeout(() => {
    panels.forEach(p => {
      p.classList.remove('active', 'slide-in-forward', 'slide-in-backward', 'slide-out-forward', 'slide-out-backward');
    });
    if (panels[currentStep]) {
      panels[currentStep].classList.add('active', direction === 'forward' ? 'slide-in-forward' : 'slide-in-backward');
    }
  }, 200);

  // Update progress
  progressFill.style.width = `${(currentStep / (STEPS.length - 1)) * 100}%`;

  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.toggle('completed', i < currentStep);
    dot.classList.toggle('active', i === currentStep);
  });

  // Update step indicator
  stepIndicator.textContent = `Step ${currentStep + 1} of ${STEPS.length}: ${STEPS[currentStep].title}`;

  // Update buttons
  prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  nextBtn.querySelector('.gs-btn-text').textContent = currentStep === STEPS.length - 1 ? 'Submit' : 'Next';
  nextBtn.querySelector('.gs-btn-icon').innerHTML = currentStep === STEPS.length - 1
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>';

  // Restore selected options from formData
  restoreSelections();
  updateNextBtn();
}

function restoreSelections() {
  const panel = stepsContainer.querySelectorAll('.gs-step-panel')[currentStep];
  if (!panel) return;

  // Restore text inputs
  panel.querySelectorAll('input[data-field], textarea[data-field]').forEach(input => {
    const field = input.dataset.field;
    if (formData[field]) input.value = formData[field];
  });

  // Restore radio selections
  panel.querySelectorAll('.gs-option[data-field]').forEach(option => {
    const field = option.dataset.field;
    const value = option.dataset.value;
    if (formData[field] === value) option.classList.add('selected');
  });
}

function updateNextBtn() {
  let valid = false;
  switch (currentStep) {
    case 0: valid = formData.name.trim() !== '' && formData.email.trim() !== ''; break;
    case 1: valid = formData.roomType !== '' && formData.projectType !== ''; break;
    case 2: valid = formData.cabinetStyle !== ''; break;
    case 3: valid = formData.budget !== '' && formData.timeline !== ''; break;
    default: valid = true;
  }
  nextBtn.disabled = !valid;
}

function handleSubmit() {
  const btn = nextBtn;
  btn.disabled = true;
  btn.querySelector('.gs-btn-text').textContent = 'Submitting...';
  btn.querySelector('.gs-btn-icon').innerHTML = '<svg class="gs-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

  // Simulate API call
  setTimeout(() => {
    // Show success
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
    btn.style.display = 'none';
    document.querySelector('.gs-progress').style.display = 'none';
    stepIndicator.textContent = 'Submitted Successfully';

    // Auto-close after 4 seconds
    setTimeout(() => {
      closeModal();
      // Reset form after close animation
      setTimeout(resetForm, 400);
    }, 4000);
  }, 1500);
}

function resetForm() {
  currentStep = 0;
  formData = {
    name: '', email: '', phone: '',
    roomType: '', projectType: '',
    cabinetStyle: '', finishType: '', colorPreference: '',
    budget: '', timeline: '',
    measurements: '', additionalInfo: '',
  };

  // Re-render steps
  stepsContainer.innerHTML = getStepsHTML();
  prevBtn.style.display = '';
  nextBtn.style.display = '';
  nextBtn.disabled = false;
  document.querySelector('.gs-progress').style.display = '';
  goToStep(0);
}

function getStepsHTML() {
  return `
    <!-- Step 1: Contact Info -->
    <div class="gs-step-panel" data-step="0">
      <h3 class="gs-title">Tell us about yourself</h3>
      <p class="gs-subtitle">Let's start with your contact information</p>
      <div class="gs-fields">
        <div class="gs-field">
          <label for="gs-name">Full Name <span class="gs-required">*</span></label>
          <input type="text" id="gs-name" data-field="name" placeholder="Your full name" />
        </div>
        <div class="gs-field">
          <label for="gs-email">Email Address <span class="gs-required">*</span></label>
          <input type="email" id="gs-email" data-field="email" placeholder="you@example.com" />
        </div>
        <div class="gs-field">
          <label for="gs-phone">Phone Number</label>
          <input type="tel" id="gs-phone" data-field="phone" placeholder="(416) 555-0000" />
        </div>
      </div>
    </div>

    <!-- Step 2: Project Type -->
    <div class="gs-step-panel" data-step="1">
      <h3 class="gs-title">Your Project</h3>
      <p class="gs-subtitle">What type of project are you planning?</p>
      <div class="gs-fields">
        <label class="gs-label">Which room? <span class="gs-required">*</span></label>
        <div class="gs-option-group">
          <div class="gs-option" data-field="roomType" data-value="kitchen">
            <span class="gs-radio"></span><span>Kitchen</span>
          </div>
          <div class="gs-option" data-field="roomType" data-value="bathroom">
            <span class="gs-radio"></span><span>Bathroom</span>
          </div>
          <div class="gs-option" data-field="roomType" data-value="laundry">
            <span class="gs-radio"></span><span>Laundry Room</span>
          </div>
          <div class="gs-option" data-field="roomType" data-value="closet">
            <span class="gs-radio"></span><span>Closet / Storage</span>
          </div>
          <div class="gs-option" data-field="roomType" data-value="other">
            <span class="gs-radio"></span><span>Other</span>
          </div>
        </div>
        <label class="gs-label" style="margin-top:1.5rem;">Is this a… <span class="gs-required">*</span></label>
        <div class="gs-option-group">
          <div class="gs-option" data-field="projectType" data-value="new-build">
            <span class="gs-radio"></span><span>New Build</span>
          </div>
          <div class="gs-option" data-field="projectType" data-value="renovation">
            <span class="gs-radio"></span><span>Renovation</span>
          </div>
          <div class="gs-option" data-field="projectType" data-value="replacement">
            <span class="gs-radio"></span><span>Cabinet Replacement Only</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Style & Finish -->
    <div class="gs-step-panel" data-step="2">
      <h3 class="gs-title">Style & Finish Preferences</h3>
      <p class="gs-subtitle">Tell us about your aesthetic preferences</p>
      <div class="gs-fields">
        <label class="gs-label">Cabinet door style <span class="gs-required">*</span></label>
        <div class="gs-option-group">
          <div class="gs-option" data-field="cabinetStyle" data-value="shaker">
            <span class="gs-radio"></span><span>Shaker</span>
          </div>
          <div class="gs-option" data-field="cabinetStyle" data-value="flat-panel">
            <span class="gs-radio"></span><span>Flat Panel (Slab)</span>
          </div>
          <div class="gs-option" data-field="cabinetStyle" data-value="raised-panel">
            <span class="gs-radio"></span><span>Raised Panel</span>
          </div>
          <div class="gs-option" data-field="cabinetStyle" data-value="not-sure">
            <span class="gs-radio"></span><span>Not sure yet</span>
          </div>
        </div>
        <label class="gs-label" style="margin-top:1.5rem;">Finish type</label>
        <div class="gs-option-group">
          <div class="gs-option" data-field="finishType" data-value="painted">
            <span class="gs-radio"></span><span>Painted</span>
          </div>
          <div class="gs-option" data-field="finishType" data-value="thermofoil">
            <span class="gs-radio"></span><span>Thermofoil</span>
          </div>
          <div class="gs-option" data-field="finishType" data-value="wood-grain">
            <span class="gs-radio"></span><span>Wood Grain</span>
          </div>
          <div class="gs-option" data-field="finishType" data-value="not-sure">
            <span class="gs-radio"></span><span>Not sure</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Budget & Timeline -->
    <div class="gs-step-panel" data-step="3">
      <h3 class="gs-title">Budget & Timeline</h3>
      <p class="gs-subtitle">Let's talk about your investment</p>
      <div class="gs-fields">
        <label class="gs-label">Budget range (CAD) <span class="gs-required">*</span></label>
        <div class="gs-option-group">
          <div class="gs-option" data-field="budget" data-value="under-5000">
            <span class="gs-radio"></span><span>Under $5,000</span>
          </div>
          <div class="gs-option" data-field="budget" data-value="5000-10000">
            <span class="gs-radio"></span><span>$5,000 – $10,000</span>
          </div>
          <div class="gs-option" data-field="budget" data-value="10000-20000">
            <span class="gs-radio"></span><span>$10,000 – $20,000</span>
          </div>
          <div class="gs-option" data-field="budget" data-value="20000-40000">
            <span class="gs-radio"></span><span>$20,000 – $40,000</span>
          </div>
          <div class="gs-option" data-field="budget" data-value="over-40000">
            <span class="gs-radio"></span><span>Over $40,000</span>
          </div>
        </div>
        <label class="gs-label" style="margin-top:1.5rem;">Timeline <span class="gs-required">*</span></label>
        <div class="gs-option-group">
          <div class="gs-option" data-field="timeline" data-value="asap">
            <span class="gs-radio"></span><span>ASAP</span>
          </div>
          <div class="gs-option" data-field="timeline" data-value="1-month">
            <span class="gs-radio"></span><span>Within 1 month</span>
          </div>
          <div class="gs-option" data-field="timeline" data-value="1-3-months">
            <span class="gs-radio"></span><span>1–3 months</span>
          </div>
          <div class="gs-option" data-field="timeline" data-value="flexible">
            <span class="gs-radio"></span><span>Flexible</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 5: Additional Details -->
    <div class="gs-step-panel" data-step="4">
      <h3 class="gs-title">Additional Details</h3>
      <p class="gs-subtitle">Anything else we should know?</p>
      <div class="gs-fields">
        <div class="gs-field">
          <label for="gs-measurements">Approximate kitchen size / measurements</label>
          <input type="text" id="gs-measurements" data-field="measurements" placeholder="e.g. 10' x 12' L-shaped" />
        </div>
        <div class="gs-field">
          <label for="gs-additional">Any other requirements or notes?</label>
          <textarea id="gs-additional" data-field="additionalInfo" placeholder="Tell us about your vision, specific needs, or any questions you have…" rows="4"></textarea>
        </div>
      </div>
    </div>
  `;
}
