// ═══════════ PAGE PRELOADER ═══════════
const loader = document.createElement('div');
loader.className = 'preloader';
loader.innerHTML = `<div class="loader-inner"><div class="loader-logo"><img src="assets/images/JBMK%20Logo.png" alt="JBMK Logo"></div><div class="loader-bar"><div class="loader-fill"></div></div><div class="loader-text">JBMK Precision Components India Pvt. Ltd.​</div></div>`;
document.body.prepend(loader);
window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('loaded');
    document.body.classList.add('page-loaded');
    setTimeout(() => loader.remove(), 800);
  }, 1200);
});

// ═══════════ NAVBAR ═══════════
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 50);
  if (scrollY > 400) {
    navbar.classList.toggle('nav-hidden', scrollY > lastScroll);
  } else {
    navbar.classList.remove('nav-hidden');
  }
  lastScroll = scrollY;
});

// ═══════════ SCROLL PROGRESS ═══════════
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = pct + '%';
});

// ═══════════ MOBILE MENU ═══════════
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileToggle.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      mobileToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ═══════════ PARTICLE SYSTEM ═══════════
const canvas = document.getElementById('particleCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };

  function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.parentElement.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = null; mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.baseX = this.x;
      this.baseY = this.y;
      this.size = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }
    update(time) {
      // Float movement
      this.x += this.vx;
      this.y += this.vy;
      // Pulse size
      this.currentSize = this.size + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.5;
      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += dx * force * 0.03;
          this.y += dy * force * 0.03;
        }
      }
      // Wrap around
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 12000));
  for (let i = 0; i < particleCount; i++) particles.push(new Particle());

  let time = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time++;
    particles.forEach(p => { p.update(time); p.draw(); });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const opacity = 0.08 * (1 - dist / 130);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(200, 220, 255, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// ═══════════ SCROLL REVEAL ═══════════
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = (entry.target.dataset.delay || 0) + 's';
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ═══════════ TEXT REVEAL ═══════════
document.querySelectorAll('.text-reveal').forEach(el => {
  const words = el.textContent.split(' ');
  el.innerHTML = words.map((w, i) =>
    `<span class="word-wrap"><span class="word" style="transition-delay:${i * 0.08}s">${w}</span></span>`
  ).join(' ');
});
const textObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); textObs.unobserve(e.target); } });
}, { threshold: 0.3 });
document.querySelectorAll('.text-reveal').forEach(el => textObs.observe(el));

// ═══════════ SMOOTH SCROLL ═══════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) {
      const top = t.getBoundingClientRect().top + window.pageYOffset - navbar.offsetHeight - 10;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ═══════════ SPOTLIGHT GLOW ═══════════
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (!isMobile) {
  document.querySelectorAll('.section-dark').forEach(sec => {
    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    sec.appendChild(glow);
    sec.addEventListener('mousemove', e => {
      const r = sec.getBoundingClientRect();
      glow.style.left = (e.clientX - r.left) + 'px';
      glow.style.top = (e.clientY - r.top) + 'px';
      glow.style.opacity = '1';
    });
    sec.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  });
}

// ═══════════ PARALLAX HERO ═══════════
const heroBg = document.querySelector('.hero-bg img');
if (heroBg && !isMobile) {
  window.addEventListener('scroll', () => {
    heroBg.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.15)`;
  });
}

// ═══════════ COUNTERS ═══════════
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const useComma = el.dataset.comma === 'true';
  const duration = 2400;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const e = 1 - Math.pow(1 - p, 4);
    const v = Math.floor(e * target);
    el.textContent = (useComma ? v.toLocaleString() : v) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const cObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number[data-target]').forEach(el => cObs.observe(el));

// ═══════════ CARD INTERACTIONS ═══════════
if (!isMobile) {
  // Shine effect
  document.querySelectorAll('.product-card, .infra-card, .quality-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--shine-x', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--shine-y', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });
  // 3D tilt on infra
  document.querySelectorAll('.infra-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ═══════════ FLOATING SHAPES ═══════════
document.querySelectorAll('.has-floats').forEach(sec => {
  for (let i = 0; i < 5; i++) {
    const shape = document.createElement('div');
    shape.className = 'float-shape';
    shape.style.cssText = `
      left:${Math.random()*90}%;top:${Math.random()*90}%;
      width:${Math.random()*60+20}px;height:${Math.random()*60+20}px;
      animation-delay:${Math.random()*5}s;animation-duration:${Math.random()*8+6}s;
      opacity:${Math.random()*0.06+0.02};
    `;
    sec.appendChild(shape);
  }
});

// ═══════════ MARQUEE FALLBACK ANIMATION ═══════════
(function(){
  const marquee = document.querySelector('.marquee');
  if (!marquee) return;
  const mc = marquee.querySelector('.marquee-content');
  if (!mc) return;
  // Ensure items are duplicated for seamless scroll (HTML already duplicates)
  let speed = 0.6; // px per frame (adjust for speed)
  let offset = 0;
  function step(){
    const singleWidth = mc.scrollWidth / 2 || 0;
    offset += speed;
    if (offset >= singleWidth) offset = 0;
    mc.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(step);
  }
  // Start when content has width
  const startWhenReady = setInterval(() => {
    if (mc.scrollWidth > 0) { clearInterval(startWhenReady); requestAnimationFrame(step); }
  }, 50);
})();

// ═══════════ ACTIVE NAV ═══════════
const secs = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const sy = window.pageYOffset + 120;
  secs.forEach(s => {
    const link = document.querySelector(`.nav-links a[href="#${s.id}"]`);
    if (link) link.classList.toggle('nav-active', sy >= s.offsetTop && sy < s.offsetTop + s.offsetHeight);
  });
});

// ═══════════ FORM ═══════════
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="btn-loader"></span> Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = '✓ Inquiry Sent Successfully!';
      btn.style.background = '#16a34a';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; form.reset(); }, 3000);
    }, 1500);
  });
}

// ═══════════ BACK TO TOP ═══════════
const btt = document.createElement('button');
btt.className = 'back-to-top';
btt.innerHTML = '↑';
document.body.appendChild(btt);
window.addEventListener('scroll', () => { btt.classList.toggle('visible', window.scrollY > 600); });
btt.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

// ═══════════ CURSOR TRAIL ═══════════
if (!isMobile) {
  const trail = [];
  const trailCount = 8;
  for (let i = 0; i < trailCount; i++) {
    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.opacity = (1 - i / trailCount) * 0.35;
    dot.style.width = dot.style.height = (6 - i * 0.5) + 'px';
    document.body.appendChild(dot);
    trail.push({ el: dot, x: 0, y: 0 });
  }
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function moveTrail() {
    trail.forEach((t, i) => {
      const prev = i === 0 ? { x: mx, y: my } : trail[i - 1];
      t.x += (prev.x - t.x) * 0.25;
      t.y += (prev.y - t.y) * 0.25;
      t.el.style.left = t.x + 'px';
      t.el.style.top = t.y + 'px';
    });
    requestAnimationFrame(moveTrail);
  }
  moveTrail();
}
