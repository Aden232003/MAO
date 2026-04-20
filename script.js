/* ══════════════════════════════════════
   MAO — Script
   ══════════════════════════════════════ */

/* ── Config ── */
// Replace with your deployed Google Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyBGmMN55X7z-pGHGKjY_22d7zHETYSFwz1jVQilzI1UfrSUBLbu7g9BXnEtbxzpk02hg/exec';

/* ── Clarity: capture ref param + UTM tags ── */
const params = new URLSearchParams(window.location.search);
const ref = params.get('ref');
if (ref && typeof clarity === 'function') {
  clarity('set', 'ref', ref);
}
['utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
  const val = params.get(key);
  if (val && typeof clarity === 'function') clarity('set', key, val);
});

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

/* ── Form Submission Helper ──
   Apps Script web apps return opaque responses under mode:'no-cors' — we
   can't tell a 403 (dead deployment) from a 200. We health-check first
   with a CORS GET so we never fake a success redirect on a dead endpoint. */
async function endpointIsAlive() {
  if (!APPS_SCRIPT_URL) return false;
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
    });
    if (!res.ok) return false;
    // Apps Script deployments with "Anyone" access redirect to
    // script.googleusercontent.com and return JSON. A locked deployment
    // redirects to docs.google.com/accounts → not OK and/or HTML body.
    const text = await res.text();
    return /"status"\s*:\s*"ok"/.test(text) || text.trim().startsWith('{');
  } catch {
    return false;
  }
}

async function submitToSheet(formData) {
  if (!APPS_SCRIPT_URL) {
    console.warn('No Apps Script URL configured — running in demo mode.');
    return { demo: true };
  }
  // Actual submit: text/plain keeps it a simple request (no preflight)
  // while Apps Script still receives the JSON via e.postData.contents.
  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(formData),
  });
  return { ok: true };
}

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
  const email = vaultForm.querySelector('input[name="email"]').value;

  try {
    await submitToSheet({
      form_type: 'vault_unlock',
      email,
      source: 'vault_page1'
    });

    vaultFeedback.textContent = APPS_SCRIPT_URL
      ? 'Unlocked. The documents are yours.'
      : 'Unlocked (demo mode — deploy Apps Script to capture emails).';
    vaultFeedback.className = 'vault-feedback success';
    unlockVault();
    vaultForm.reset();
  } catch {
    unlockVault();
    vaultFeedback.textContent = 'Docs unlocked. Email capture needs Apps Script endpoint.';
    vaultFeedback.className = 'vault-feedback error';
  }
});

/* ── Application Form ── */
const applyForm = document.getElementById('apply-form');
const applyFeedback = document.getElementById('apply-feedback');

function showApplyError(msg) {
  if (!applyFeedback) return;
  applyFeedback.innerHTML = msg;
  applyFeedback.className = 'vault-feedback error';
}

applyForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = applyForm.querySelector('button[type="submit"]');
  const originalBtnText = btn.textContent;
  btn.textContent = 'Submitting...';
  btn.disabled = true;
  if (applyFeedback) {
    applyFeedback.textContent = '';
    applyFeedback.className = 'vault-feedback';
  }

  const fd = new FormData(applyForm);
  const data = {
    form_type: 'beta_application',
    full_name: fd.get('full_name'),
    email: fd.get('email'),
    instagram: fd.get('instagram'),
    phone: fd.get('phone'),
    current_status: fd.get('current_status'),
    income_range: fd.get('income_range'),
    pain_point: fd.get('pain_point'),
    why_join: fd.get('why_join'),
    source: 'page1_apply'
  };

  // 1. Health-check the endpoint first so we never silently lose a
  //    submission to a dead deployment.
  const alive = await endpointIsAlive();
  if (!alive) {
    showApplyError(
      'Submission endpoint is temporarily down. ' +
      'DM <a href="https://instagram.com/aden_gomes" target="_blank" ' +
      'style="color:var(--accent);text-decoration:underline;">' +
      '@aden_gomes</a> on Instagram with “MAO” and we’ll onboard you directly.'
    );
    btn.textContent = originalBtnText;
    btn.disabled = false;
    return;
  }

  try {
    await submitToSheet(data);

    // Tag Clarity session with applicant identity
    if (typeof clarity === 'function') {
      clarity('identify', data.email, null, null, data.full_name);
      clarity('set', 'applicant_name', data.full_name);
      clarity('set', 'applicant_email', data.email);
      clarity('set', 'applicant_ig', data.instagram);
      clarity('set', 'applicant_status', data.current_status);
      clarity('event', 'application_submitted');
    }

    // Store name for page 2 personalization
    sessionStorage.setItem('mao-applicant-name', data.full_name);

    // Redirect to post-apply page
    window.location.href = './apply-success.html';

  } catch {
    showApplyError(
      'Submission failed. Please try again, or DM ' +
      '<a href="https://instagram.com/aden_gomes" target="_blank" ' +
      'style="color:var(--accent);text-decoration:underline;">@aden_gomes</a> ' +
      'on Instagram with “MAO”.'
    );
    btn.textContent = originalBtnText;
    btn.disabled = false;
  }
});
