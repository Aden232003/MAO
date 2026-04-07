/* ── Cursor Glow ── */
const glow = document.getElementById('cursorGlow');
if (glow && window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', e => {
    glow.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
  });
}

/* ── Scroll Reveal ── */
const revealEls = document.querySelectorAll('.section-inner, .about-layout, .compare-blocks, .feature-rail');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => observer.observe(el));

/* ── Vault Form ── */
const VAULT_KEY = 'mao-vault-unlocked';
const vaultForm = document.getElementById('vault-form');
const vaultDocs = document.getElementById('vault-docs');
const vaultFeedback = document.getElementById('vault-feedback');

const unlockVault = () => {
  localStorage.setItem(VAULT_KEY, 'true');
  if (vaultDocs) vaultDocs.dataset.locked = 'false';
};

if (localStorage.getItem(VAULT_KEY) === 'true') unlockVault();

vaultForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const endpoint = vaultForm.action;
  try {
    if (!endpoint.includes('your-form-id')) {
      await fetch(endpoint, { method: 'POST', body: new FormData(vaultForm), headers: { Accept: 'application/json' } });
      vaultFeedback.textContent = 'Unlocked. The documents are yours.';
    } else {
      vaultFeedback.textContent = 'Unlocked (demo mode — connect Formspree to capture emails).';
    }
    vaultFeedback.className = 'vault-feedback success';
    unlockVault();
    vaultForm.reset();
  } catch {
    unlockVault();
    vaultFeedback.textContent = 'Docs unlocked. Email capture needs a Formspree endpoint.';
    vaultFeedback.className = 'vault-feedback error';
  }
});

/* ── Application Form ── */
const applyForm = document.getElementById('apply-form');
const applyFeedback = document.getElementById('apply-feedback');

applyForm?.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const endpoint = applyForm.action;
    if (!endpoint.includes('your-form-id')) {
      await fetch(endpoint, { method: 'POST', body: new FormData(applyForm), headers: { Accept: 'application/json' } });
      applyFeedback.textContent = "You're on the list. Aden will reach out personally.";
    } else {
      applyFeedback.textContent = "Demo submit. Connect Formspree before launch.";
    }
    applyFeedback.className = 'vault-feedback success';
    applyForm.reset();
  } catch {
    applyFeedback.textContent = 'Submission failed. Check the form endpoint.';
    applyFeedback.className = 'vault-feedback error';
  }
});
