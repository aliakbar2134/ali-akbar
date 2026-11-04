// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Mobile nav toggle =====
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

function closeMenu() {
  toggle.classList.remove('is-open');
  links.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
}

toggle.addEventListener('click', () => {
  const open = links.classList.toggle('is-open');
  toggle.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
});

links.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

// ===== Nav hide-on-scroll-down / show-on-scroll-up + shadow =====
const nav = document.getElementById('nav');
let lastY = window.scrollY;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('nav--scrolled', y > 40);

  if (y > lastY && y > 200 && !links.classList.contains('is-open')) {
    nav.classList.add('nav--hidden');
  } else {
    nav.classList.remove('nav--hidden');
  }
  lastY = y;
}, { passive: true });

// ===== Animations =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const loader = document.getElementById('loader');

function hideLoader(onDone) {
  if (!loader) { onDone && onDone(); return; }
  if (hasGsap && !reduceMotion) {
    gsap.to(loader, {
      autoAlpha: 0, duration: 0.45, ease: 'power2.out',
      onComplete: () => { loader.remove(); onDone && onDone(); }
    });
  } else {
    loader.remove();
    onDone && onDone();
  }
}

// Run once the page (fonts, images) is ready, with a cap so slow assets never block the intro.
function whenReady(fn) {
  let fired = false;
  const run = () => { if (!fired) { fired = true; fn(); } };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  setTimeout(run, 2500);
}

// --- Fallback: simple fade-up reveal (no GSAP or reduced motion) ---
function basicReveal() {
  const revealEls = document.querySelectorAll(
    '.section__title, .about__text, .about__stats, .job, .card, .skill-group, .edu__col, .contact__lead, .contact__links'
  );
  if (reduceMotion || !('IntersectionObserver' in window)) return; // leave everything visible
  revealEls.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
}

// Split the hero name into per-letter spans (screen readers still get the full name).
function splitName(el) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  text.split(' ').forEach((word, i, arr) => {
    const w = document.createElement('span');
    w.className = 'word';
    w.setAttribute('aria-hidden', 'true');
    [...word].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'letter';
      s.textContent = ch;
      w.appendChild(s);
    });
    el.appendChild(w);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return el.querySelectorAll('.letter');
}

// Hero intro timeline: bubble pop, letters grow in one by one, copy slides up, talk button wiggles + pulses.
function heroIntro() {
  const letters = splitName(document.querySelector('.hero__name'));
  const talkLabel = document.querySelector('.talk__label');
  const talkPulse = document.querySelector('.talk__pulse');

  gsap.set('.callout', { scale: 0 });
  gsap.set(letters, { scale: 0, opacity: 0, y: 30 });
  gsap.set(['.hero__title', '.hero__tagline'], { opacity: 0, y: 70 });
  gsap.set('.hero__blurb', { opacity: 0, y: 100 });
  gsap.set(['.hero__cta .btn', '.talk', '.hero__meta li'], { opacity: 0, y: 20 });


  const tl = gsap.timeline({ paused: true, delay: 0.15 });
  tl.to('.callout', { scale: 1, duration: 1, ease: 'elastic.out(1, 0.3)' })
    .to(letters, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(2.2)', stagger: 0.06 }, '-=0.6')
    .to(['.hero__title', '.hero__tagline'], { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 }, '-=0.3')
    .to('.hero__blurb', { opacity: 1, y: 0, duration: 1, ease: 'back.out(1.7)' }, '-=0.5')
    .to('.hero__cta .btn', { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.6')
    .to('.talk', { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')
    // the wiggle + pulse ring, like the original "talk" button
    .to(talkLabel, { scale: 0.8, rotation: 16, duration: 0.4, ease: 'back.out(1.7)' })
    .to(talkPulse, { scale: 0.9, opacity: 1, duration: 0.5 }, '-=0.6')
    .to(talkLabel, { scale: 1, rotation: 0, duration: 1.2, ease: 'elastic.out(2.5, 0.5)' })
    .to(talkPulse, { scale: 2.2, opacity: 0, duration: 1.1, ease: 'power2.out' }, '-=1.2')
    .to('.hero__meta li', { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, '-=1');

  // Keep the pulse ring breathing every few seconds after the intro (the portrait stays still).
  tl.add(() => {
    gsap.timeline({ repeat: -1, repeatDelay: 2.5 })
      .fromTo(talkPulse, { scale: 0.9, opacity: 0.55 }, { scale: 2.2, opacity: 0, duration: 1.3, ease: 'power2.out' });
  });
  return tl;
}

// Count stat numbers up from 0 when they scroll into view ("50%" -> 0..50 + "%").
function countUpStats() {
  document.querySelectorAll('.stat__num').forEach((el) => {
    const m = el.textContent.trim().match(/^(\d+)(.*)$/);
    if (!m) return;
    const end = parseInt(m[1], 10);
    const suffix = m[2];
    const obj = { v: 0 };
    el.textContent = '0' + suffix;
    gsap.to(obj, {
      v: end, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; }
    });
  });
}

function scrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Section titles slide in from the left.
  gsap.utils.toArray('.section__title').forEach((t) => {
    gsap.from(t, {
      opacity: 0, x: -40, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: t, start: 'top 85%', once: true }
    });
  });

  gsap.from('.about__text', {
    opacity: 0, y: 40, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.about__text', start: 'top 85%', once: true }
  });
  // Fade up only (no scale), then hand transform back to CSS so the hover lift works.
  gsap.from('.stat', {
    opacity: 0, y: 30, duration: 0.6, ease: 'power3.out', stagger: 0.12, clearProps: 'transform',
    scrollTrigger: { trigger: '.about__stats', start: 'top 85%', once: true }
  });
  countUpStats();

  // Experience cards alternate in from left / right.
  gsap.utils.toArray('.job').forEach((job, i) => {
    gsap.from(job, {
      opacity: 0, x: i % 2 ? 80 : -80, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: job, start: 'top 85%', once: true }
    });
  });

  // Project cards pop in as a staggered batch.
  gsap.set('.card', { opacity: 0, y: 50 });
  ScrollTrigger.batch('.card', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12, overwrite: true,
      clearProps: 'transform' // let the CSS hover lift take over afterwards
    })
  });

  // Skills: on desktop the section pins and the groups play in as you scroll (like the original
  // "what I do" section). On smaller screens it is a plain staggered reveal.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const groups = gsap.utils.toArray('.skill-group');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#skills',
        start: 'top top',
        end: '+=' + groups.length * 35 + '%',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1
      }
    });
    groups.forEach((g, i) => {
      tl.from(g, { opacity: 0, x: i % 2 ? 120 : -120, y: i % 2 ? 0 : -50, scale: 0.85, duration: 1 }, i * 0.6)
        .from(g.querySelectorAll('li'), { opacity: 0, y: 14, stagger: 0.04, duration: 0.5 }, i * 0.6 + 0.4);
    });
  });
  mm.add('(max-width: 860px)', () => {
    gsap.utils.toArray('.skill-group').forEach((g) => {
      gsap.from(g, {
        opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: g, start: 'top 88%', once: true }
      });
    });
  });

  gsap.utils.toArray('.edu__col').forEach((c, i) => {
    gsap.from(c, {
      opacity: 0, y: 40, duration: 0.8, delay: i * 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: c, start: 'top 85%', once: true }
    });
  });

  gsap.from(['.contact__lead', '.contact__actions', '.contact__links'], {
    opacity: 0, y: 30, duration: 0.7, stagger: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 75%', once: true }
  });
}

if (hasGsap && !reduceMotion) {
  const intro = heroIntro(); // sets hidden start states now, while the loader covers the page
  scrollAnimations();
  whenReady(() => hideLoader(() => {
    intro.play();
    ScrollTrigger.refresh();
  }));
} else {
  whenReady(() => hideLoader());
  basicReveal();
}
