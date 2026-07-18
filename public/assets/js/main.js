/* ==========================================================
   VOX PAINT STUDIO — routeur single-page + transitions
   Gère le passage entre les vues (accueil / commissions / avis)
   sans recharger la page, via le hash de l'URL (#accueil, etc).
   ========================================================== */

(function () {
  const DEFAULT_ROUTE = 'accueil';
  const pages = Array.from(document.querySelectorAll('.page'));
  const navLinks = document.querySelectorAll('[data-route]');
  const navLinksPanel = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const scanfx = document.querySelector('.scanfx');
  const viewport = document.getElementById('viewport');

  const routeExists = (name) => pages.some((p) => p.dataset.page === name);

  function currentRoute() {
    const hash = window.location.hash.replace('#', '');
    return routeExists(hash) ? hash : DEFAULT_ROUTE;
  }

  function setActiveNav(route) {
    navLinks.forEach((link) => {
      if (link.dataset.route === route) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function triggerScanFx() {
    if (!scanfx) return;
    scanfx.classList.remove('active');
    // force reflow so the animation can restart
    void scanfx.offsetWidth;
    scanfx.classList.add('active');
  }

  function showRoute(route, { animate = true, updateHash = false } = {}) {
    const target = pages.find((p) => p.dataset.page === route);
    if (!target) return;
    const current = pages.find((p) => !p.hidden);

    if (updateHash && window.location.hash !== `#${route}`) {
      history.pushState({ route }, '', `#${route}`);
    }

    setActiveNav(route);

    // close mobile menu if open
    if (navLinksPanel && navLinksPanel.classList.contains('open')) {
      navLinksPanel.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!animate || prefersReduced || !current || current === target) {
      pages.forEach((p) => { p.hidden = p !== target; });
      target.classList.remove('leaving');
      if (viewport) viewport.scrollIntoView({ block: 'start', behavior: 'auto' });
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    // animate out current page, then swap and animate in the new one
    current.classList.add('leaving');
    triggerScanFx();

    window.setTimeout(() => {
      current.hidden = true;
      current.classList.remove('leaving');
      target.hidden = false;
      // restart the page-in animation
      target.style.animation = 'none';
      void target.offsetWidth;
      target.style.animation = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 260);
  }

  // nav clicks
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const route = link.dataset.route;
      if (!routeExists(route)) return;
      e.preventDefault();
      showRoute(route, { animate: true, updateHash: true });
    });
  });

  // back/forward browser buttons
  window.addEventListener('popstate', () => {
    showRoute(currentRoute(), { animate: true, updateHash: false });
  });

  // mobile menu toggle
  if (navToggle && navLinksPanel) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinksPanel.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // initial load
  showRoute(currentRoute(), { animate: false, updateHash: false });
})();