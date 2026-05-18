/* ══════════════════════════════════════
   MAO — Free Workshop Page
   - Unified checkout card with refundable-enrollment upgrade toggle
   - Working-directory unlock state via localStorage
   ══════════════════════════════════════ */

const WS_KEYS = {
  workshop: 'mao-workshop-unlocked',
  applicantTicket: 'mao-applicant-ticket'
};

/* ── Cursor glow (mirrors index.html) ── */
const wsGlow = document.getElementById('cursorGlow');
if (wsGlow && window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', e => {
    wsGlow.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
  });
}

/* ── Forward Clarity ref/utm tags (mirrors script.js) ── */
const wsParams = new URLSearchParams(window.location.search);
['ref', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
  const val = wsParams.get(key);
  if (val && typeof clarity === 'function') clarity('set', key, val);
});

/* ── Unlock detection ──
   The inline <head> script flips `html[data-mao-unlocked="true"]` before
   paint to prevent FOUC. We mirror it here only to react to changes in
   another tab (storage event) after the page has loaded. */
function applyUnlockState() {
  const unlocked =
    localStorage.getItem(WS_KEYS.workshop) === 'true' ||
    localStorage.getItem(WS_KEYS.applicantTicket) === 'true';
  if (unlocked) document.documentElement.dataset.maoUnlocked = 'true';
  else delete document.documentElement.dataset.maoUnlocked;
}
window.addEventListener('storage', applyUnlockState);

/* ── Scroll Reveal (mirrors script.js — styles.css applies opacity:0 to
      .section-inner until JS adds .visible). The directory tree opts out
      via its own `opacity:1 !important` rule so it's visible on first paint. */
const wsRevealEls = document.querySelectorAll(
  '.section-inner, .about-layout, .compare-blocks, .feature-rail'
);
const wsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      wsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
wsRevealEls.forEach(el => wsObserver.observe(el));

/* ── FAQ: only one open at a time ── */
const faqItems = document.querySelectorAll('.ws-faq-item');
faqItems.forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach(other => {
        if (other !== item) other.open = false;
      });
    }
  });
});

/* ══════════════════════════════════════
   Unified checkout card
   Default = Tier 1 (₹1,999, working directory only).
   Upgrade checkbox = Tier 2 (₹5,000 base / ₹5,125 charged, refundable
   enrollment + working directory).
   ══════════════════════════════════════ */
const card        = document.getElementById('ws-checkout-card');
const upgradeCb   = document.getElementById('ws-upgrade-toggle');
const cta         = document.getElementById('ws-cta');
const ctaText     = document.getElementById('ws-cta-text');
const priceEl     = document.getElementById('ws-price');
const priceStrike = document.getElementById('ws-price-strike');
const priceTag    = document.getElementById('ws-price-tag');
const titleEl     = document.getElementById('ws-checkout-title');
const eyebrowEl   = document.getElementById('ws-checkout-eyebrow');
const ctaMeta     = document.getElementById('ws-cta-meta');
const navCta      = document.getElementById('ws-nav-cta');
const mobileCta   = document.getElementById('ws-mobile-cta');

const RZP_TIER_1 = card?.dataset.rzpTier1;
const RZP_TIER_2 = card?.dataset.rzpTier2;

const VIEWS = {
  1: {
    eyebrow:   'Optional',
    title:     "If you want the files, they're here.",
    priceMain: '₹1,999',
    priceTag:  'Razorpay · UPI / Cards / EMI supported · One-time, lifetime access',
    ctaText:   'Download the directory — ₹1,999',
    ctaHref:   RZP_TIER_1,
    ctaMeta:   'Secure checkout via Razorpay. Instant download.',
    navCta:    '₹1,999',
    mobileCta: 'Download the directory — ₹1,999',
    upgraded:  false
  },
  2: {
    eyebrow:   'Optional + Refundable Enrollment',
    title:     'Directory + Applicant Ticket',
    priceMain: '₹5,000',
    priceTag:  '+ 2.5% gateway · ₹5,125 charged at checkout · ₹3,000 refundable for 30 days',
    ctaText:   'Download + Enroll Refundably — ₹5,000',
    ctaHref:   RZP_TIER_2,
    ctaMeta:   'Secure checkout via Razorpay. Instant access + Aden reaches out.',
    navCta:    '₹5,000',
    mobileCta: 'Download + Enroll — ₹5,000',
    upgraded:  true
  }
};

function applyView(tier) {
  const v = VIEWS[tier];
  if (!v || !card) return;

  card.classList.toggle('is-upgraded', v.upgraded);
  if (priceEl)     priceEl.textContent     = v.priceMain;
  if (priceTag)    priceTag.textContent    = v.priceTag;
  if (titleEl)     titleEl.textContent     = v.title;
  if (eyebrowEl)   eyebrowEl.textContent   = v.eyebrow;
  if (ctaText)     ctaText.textContent     = v.ctaText;
  if (ctaMeta)     ctaMeta.textContent     = v.ctaMeta;
  if (cta) {
    cta.href = v.ctaHref || '#';
    cta.dataset.tier = String(tier);
  }
  if (navCta) {
    navCta.querySelector('span:last-child').textContent = v.navCta;
  }
  if (mobileCta)   mobileCta.textContent   = v.mobileCta;
}

upgradeCb?.addEventListener('change', () => {
  applyView(upgradeCb.checked ? 2 : 1);
  if (typeof clarity === 'function') {
    clarity('event', upgradeCb.checked ? 'workshop_upgrade_on' : 'workshop_upgrade_off');
  }
});

/* Initial paint (defensive — markup already starts in tier-1 state) */
if (card) applyView(1);

/* ── CTA click tracking + Tier-2 handoff to existing deposit-thanks page ──
   Tier 2 reuses the existing ₹5,000 Razorpay link (s4Vuhjl) which redirects
   to /deposit-thanks. We set a flag here so that page knows to ALSO surface
   the workshop-zip download (alongside its "priority queue" messaging). */
cta?.addEventListener('click', () => {
  const tier = cta.dataset.tier;
  try {
    if (tier === '2') {
      localStorage.setItem('mao-workshop-via-deposit', '1');
    }
  } catch (_) { /* private mode */ }
  if (typeof clarity === 'function') {
    clarity('event', 'workshop_checkout_click_tier_' + tier);
  }
});
