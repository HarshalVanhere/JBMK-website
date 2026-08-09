// ═══════════ PAGE PRELOADER ═══════════
const loader = document.createElement('div');
loader.className = 'preloader';
loader.innerHTML = `<div class="loader-inner"><div class="loader-logo"><img src="assets/images/JBMK%20Logo.png" alt="JBMK Logo"></div><div class="loader-bar"><div class="loader-fill"></div></div><div class="loader-text">JBMK Precision Components India Pvt. Ltd.</div></div>`;
document.body.prepend(loader);
window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('loaded');
    document.body.classList.add('page-loaded');
    setTimeout(() => loader.remove(), 800);
  }, 1200);
});

const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ═══════════ COMPONENT LOADER ═══════════
async function loadComponents() {
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');
  const promises = [];

  if (navbarPlaceholder) {
    promises.push(
      fetch('components/navbar.html')
        .then(res => {
          if (!res.ok) throw new Error('Navbar fetch failed');
          return res.text();
        })
        .then(html => {
          navbarPlaceholder.outerHTML = html;
          initNavbar();
        })
        .catch(err => console.error('Failed to load navbar:', err))
    );
  }

  if (footerPlaceholder) {
    promises.push(
      fetch('components/footer.html')
        .then(res => {
          if (!res.ok) throw new Error('Footer fetch failed');
          return res.text();
        })
        .then(html => {
          footerPlaceholder.outerHTML = html;
        })
        .catch(err => console.error('Failed to load footer:', err))
    );
  }

  await Promise.all(promises);
}

// ═══════════ INITIALIZE NAVBAR ═══════════
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (!navbar) return;

  // Scroll Behavior
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

  // Mobile Toggle
  if (mobileToggle && mobileMenu) {
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

  // Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const isProductDetail = currentPath.startsWith('product-detail.html') && href.includes('products.html');
      
      // If we are on home page
      if (currentPath === 'index.html' || currentPath === '') {
        if (href === 'index.html') {
          link.classList.add('nav-active');
        }
      } else if (href === currentPath || isProductDetail) {
        link.classList.add('nav-active');
      } else {
        link.classList.remove('nav-active');
      }
    }
  });

  // Smooth scroll for hash links on the same page
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - navbar.offsetHeight - 10;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// Global mobile dropdown toggle for navbar.html
window.toggleMobileDropdown = function(button) {
  const content = button.nextElementSibling;
  button.classList.toggle('active');
  if (content) {
    content.classList.toggle('active');
  }
};

// ═══════════ PRODUCTS CATALOG PAGE RENDERER ═══════════
function renderProductsPage() {
  const container = document.getElementById('products-grid-container');
  if (!container || typeof productsData === 'undefined') return;

  const renderList = (categoryFilter = 'all') => {
    container.innerHTML = '';
    
    Object.keys(productsData).forEach(key => {
      const p = productsData[key];
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return;

      const card = document.createElement('div');
      card.className = 'product-card reveal';
      card.innerHTML = `
        <div class="product-thumb">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="product-body">
          <span class="prod-cat-tag">${p.category === 'automotive' ? 'Automotive Pulley' : 'Engine Component'}</span>
          <h3>${p.name}</h3>
          <p>${p.tagline}</p>
          <div class="product-card-footer">
            <a href="product-detail.html?product=${key}" class="btn btn-outline btn-sm">View Technical Specs</a>
            <a href="contact.html?product=${encodeURIComponent(p.name)}" class="product-link">RFQ</a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Re-bind reveals
    const newReveals = container.querySelectorAll('.reveal');
    newReveals.forEach(el => revealObserver.observe(el));

    // Card interactions
    if (!isMobile) {
      container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--shine-x', ((e.clientX - r.left) / r.width * 100) + '%');
          card.style.setProperty('--shine-y', ((e.clientY - r.top) / r.height * 100) + '%');
        });
      });
    }
  };

  // Set up categories filtering
  const tabs = document.querySelectorAll('.product-filter-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      renderList(filter);
    });
  });

  renderList('all');
}

// ═══════════ PRODUCT DETAILS PAGE RENDERER ═══════════
function renderProductDetailPage() {
  const container = document.getElementById('product-detail-container');
  if (!container || typeof productsData === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product') || 'water-pump-pulley';
  const p = productsData[productId];

  if (!p) {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 120px 20px;">
        <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--primary-900);">Component Not Found</h2>
        <p style="color: var(--neutral-600); margin-bottom: 2rem;">The requested precision component does not exist in our catalog.</p>
        <a href="products.html" class="btn btn-accent">View All Products</a>
      </div>
    `;
    return;
  }

  // Set SEO Meta and Title Dynamically
  document.title = `${p.name} — Technical Specifications | JBMK Precision Components`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', `Technical specifications, material tolerances, and OEM features of ${p.name} from JBMK Precision Components.`);
  }
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', `https://www.jbmkindustries.com/product-detail.html?product=${productId}`);

  // Specifications
  let specsHtml = '';
  Object.keys(p.specs).forEach(key => {
    specsHtml += `
      <tr>
        <td>${key}</td>
        <td>${p.specs[key]}</td>
      </tr>
    `;
  });

  // Features
  let featuresHtml = '';
  p.features.forEach(f => {
    featuresHtml += `<li>${f}</li>`;
  });

  // Applications
  let appsHtml = '';
  p.applications.forEach(a => {
    appsHtml += `<li>${a}</li>`;
  });

  container.innerHTML = `
    <div class="container">
      <div class="breadcrumb reveal" style="margin-bottom: var(--space-8);">
        <a href="index.html">Home</a>
        <span class="sep">/</span>
        <a href="products.html">Products</a>
        <span class="sep">/</span>
        <span>${p.name}</span>
      </div>
      
      <div class="product-detail-grid">
        <!-- Media Column -->
        <div class="product-detail-image reveal">
          <img src="${p.image}" alt="${p.name}" id="mainProductImg" style="transition: opacity 0.2s ease;">
          <div class="product-gallery-thumbs" style="display: flex; gap: 0.5rem; padding: 1rem; border-top: 1px solid var(--gray-200); background: var(--white);">
            <div class="gallery-thumb active" onclick="changeProductImage('${p.image}')" style="width: 70px; height: 70px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid var(--primary); cursor: pointer; transition: all var(--duration);">
              <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="gallery-thumb" onclick="changeProductImage('assets/images/plant_cnc.png')" style="width: 70px; height: 70px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: all var(--duration);">
              <img src="assets/images/plant_cnc.png" alt="CNC Machining" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="gallery-thumb" onclick="changeProductImage('assets/images/plant_quality.png')" style="width: 70px; height: 70px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: all var(--duration);">
              <img src="assets/images/plant_quality.png" alt="Quality Center" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>
        </div>
        
        <!-- Specification Info Column -->
        <div class="product-detail-info reveal" data-delay="0.1">
          <div class="hero-tag" style="margin-bottom: 1rem;"><span class="dot"></span> IATF 16949 Certified Manufacture</div>
          <h2>${p.name}</h2>
          <div class="product-detail-desc">${p.description}</div>
          
          <div class="product-features">
            <h3>Performance Engineering Highlights</h3>
            <ul class="feature-list">
              ${featuresHtml}
            </ul>
          </div>

          <div class="product-specs" style="margin-top: 2rem;">
            <h3>Standard Applications</h3>
            <ul style="list-style-type: disc; padding-left: 1.25rem; font-size: 0.9rem; color: var(--gray-600); display: flex; flex-direction: column; gap: 0.4rem;">
              ${appsHtml}
            </ul>
          </div>

          <div class="product-cta-box" style="margin-top: 2.5rem; text-align: left;">
            <h3 style="color: var(--white);">Request technical consultation</h3>
            <p>Our design and process engineers are ready to review your drawing specs and provide a competitive quote.</p>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;">
              <a href="contact.html?product=${encodeURIComponent(p.name)}" class="btn btn-accent">Request Quote (RFQ)</a>
              <a href="${p.image}" download class="btn btn-outline" style="border-color: rgba(255,255,255,0.3); color: var(--white);">Download Specsheet</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Specs Table -->
      <div class="product-specs reveal" style="margin-top: var(--space-20);">
        <h2>Technical Specification &amp; Geometric Tolerances</h2>
        <div style="margin-top: 1.5rem; overflow-x: auto;">
          <table class="specs-table">
            <tbody>
              ${specsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Related -->
      <div class="related-products reveal">
        <h2>Related Components</h2>
        <div class="products-grid" id="related-grid"></div>
      </div>
    </div>
  `;

  // Render Related
  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    const keys = Object.keys(productsData).filter(k => k !== productId);
    const shuffled = keys.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    shuffled.forEach(key => {
      const rp = productsData[key];
      const card = document.createElement('div');
      card.className = 'product-card reveal';
      card.innerHTML = `
        <div class="product-thumb">
          <img src="${rp.image}" alt="${rp.name}">
        </div>
        <div class="product-body">
          <h3>${rp.name}</h3>
          <p>${rp.tagline}</p>
          <a href="product-detail.html?product=${key}" class="product-link">View Technical Specs →</a>
        </div>
      `;
      relatedGrid.appendChild(card);
    });
  }

  // Re-observe
  container.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

window.changeProductImage = function(src) {
  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) {
    mainImg.style.opacity = 0;
    setTimeout(() => {
      mainImg.src = src;
      mainImg.style.opacity = 1;
    }, 200);
  }
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    const isThis = thumb.querySelector('img').getAttribute('src') === src;
    thumb.classList.toggle('active', isThis);
    thumb.style.borderColor = isThis ? 'var(--primary)' : 'transparent';
  });
};

// ═══════════ CONTACT FORM PRODUCT AUTO-SELECT ═══════════
function handleContactFormAutoSelect() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectVal = urlParams.get('product');
  const selectEl = document.getElementById('product');
  if (selectEl && selectVal) {
    for (let i = 0; i < selectEl.options.length; i++) {
      if (selectEl.options[i].text.toLowerCase() === selectVal.toLowerCase()) {
        selectEl.selectedIndex = i;
        break;
      }
    }
  }
}

// ═══════════ SCROLL PROGRESS ═══════════
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  progressBar.style.width = pct + '%';
});

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

// ═══════════ SPOTLIGHT GLOW ═══════════
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

// ═══════════ CARD INTERACTIONS (SHINE/TILT) ═══════════
if (!isMobile) {
  document.querySelectorAll('.product-card, .infra-card, .quality-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--shine-x', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--shine-y', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

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

// ═══════════ LOGO / CERTIFICATE MARQUEE ═══════════
(function(){
  const marquees = document.querySelectorAll('.marquee');
  if (!marquees.length) return;

  marquees.forEach(marquee => {
    const mc = marquee.querySelector('.marquee-content');
    if (!mc) return;

    let speed = 0.6;
    let offset = 0;

    function step(){
      const singleWidth = mc.scrollWidth / 2 || 0;
      offset += speed;
      if (offset >= singleWidth) offset = 0;
      mc.style.transform = `translateX(${-offset}px)`;
      requestAnimationFrame(step);
    }

    const startWhenReady = setInterval(() => {
      if (mc.scrollWidth > 0) {
        clearInterval(startWhenReady);
        requestAnimationFrame(step);
      }
    }, 50);
  });
})();

// ═══════════ CERTIFICATE LIGHTBOX ═══════════
function initCertificateLightbox() {
  const lightbox = document.getElementById('certificateLightbox');
  if (!lightbox) return;

  const lightboxImage = lightbox.querySelector('.certificate-lightbox-image');
  const lightboxTitle = lightbox.querySelector('.certificate-lightbox-title');
  const closeButton = lightbox.querySelector('.certificate-lightbox-close');
  const triggers = document.querySelectorAll('[data-certificate-src]');

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };

  const openLightbox = (src, title) => {
    if (!lightboxImage || !lightboxTitle) return;
    lightboxImage.src = src;
    lightboxImage.alt = title;
    lightboxTitle.textContent = title;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  };

  triggers.forEach(trigger => {
    const activate = () => openLightbox(trigger.dataset.certificateSrc, trigger.dataset.certificateTitle || 'Certificate preview');
    trigger.addEventListener('click', activate);
    trigger.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });

  closeButton?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

// ═══════════ FORM SUBMIT ═══════════
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span class="btn-loader"></span> Sending Inquiry...';
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

// ═══════════ RUN APPLICATION INITIALIZATION ═══════════
loadComponents().then(() => {
  if (document.getElementById('products-grid-container')) {
    renderProductsPage();
  }
  if (document.getElementById('product-detail-container')) {
    renderProductDetailPage();
  }
  if (document.getElementById('contactForm')) {
    handleContactFormAutoSelect();
  }
  initCertificateLightbox();
});
