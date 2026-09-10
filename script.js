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

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll(
  '.section__title, .about__text, .about__stats, .job, .card, .skill-group, .edu__col, .contact__lead, .contact__links'
);
revealEls.forEach((el) => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}
