/* ============================================================
 *  Lily Scroll Effects - 滚动动画与视差
 *  淡入上移 + 标题发光 + 视差滚动 + 卡片3D悬浮
 * ============================================================ */

(function () {
  'use strict';

  function initScrollAnimations() {
    const fadeElements = document.querySelectorAll(
      '.recent-post-item, .card-widget, .article-content h1, .article-content h2, ' +
      '.article-content h3, .article-content p, .article-content img, ' +
      '.article-content blockquote, .article-content hr, ' +
      '.article-meta, .post-copyright, .flink-item-card, ' +
      '.gallery-item, .music-album-card, .about-section, ' +
      '.lily-hero-content, .lily-social-section, .lily-taste-section'
    );

    fadeElements.forEach(el => {
      el.classList.add('scroll-fade-in');
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    const observerOptions = {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = (index % 6) * 60;
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach(el => {
      observer.observe(el);
    });
  }

  function initParallaxScroll() {
    const parallaxElements = document.querySelectorAll(
      '.lily-parallax-slow, .lily-parallax-medium, .lily-parallax-fast'
    );

    if (parallaxElements.length === 0) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;

      parallaxElements.forEach(el => {
        const speed = el.classList.contains('lily-parallax-slow') ? 0.05
                    : el.classList.contains('lily-parallax-medium') ? 0.1
                    : 0.15;
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const offset = (scrollY - elementTop + window.innerHeight) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  function initTitleGlow() {
    const titles = document.querySelectorAll('.article-content h1, .article-content h2, .article-content h3');

    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('title-glow-active');
        }
      });
    }, { threshold: 0.5 });

    titles.forEach(title => {
      titleObserver.observe(title);
    });
  }

  function initCardHover3D() {
    const cards = document.querySelectorAll(
      '.recent-post-item, .card-widget, .flink-item-card, .gallery-item, .music-album-card'
    );

    cards.forEach(card => {
      card.addEventListener('mouseenter', function () {
        this.style.transition = 'box-shadow 0.4s ease';
      });

      card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * 4;
        const rotateX = ((centerY - y) / centerY) * 4;

        this.style.transform = `translateY(-8px) perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        this.style.transition = 'transform 0.1s ease-out';
      });

      card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) perspective(1200px) rotateX(0) rotateY(0) scale(1)';
        this.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease';
      });
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  function initPageTransition() {
    const links = document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"]):not([href*="javascript"])');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
      if (href.startsWith('#')) return;

      link.addEventListener('click', function (e) {
        const url = new URL(this.href, window.location.href);
        if (url.origin !== window.location.origin) return;

        e.preventDefault();

        const transition = document.createElement('div');
        transition.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--lily-bg-primary, #f5f0fa);
          z-index: 10000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        document.body.appendChild(transition);

        const lily = document.createElement('div');
        lily.innerHTML = '❀';
        lily.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          font-size: 56px;
          color: var(--lily-accent, #8b6fa8);
          z-index: 10001;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
          text-shadow: 0 0 30px currentColor;
        `;
        document.body.appendChild(lily);

        requestAnimationFrame(() => {
          transition.style.opacity = '1';
          lily.style.opacity = '1';
          lily.style.transform = 'translate(-50%, -50%) scale(1) rotate(180deg)';
        });

        setTimeout(() => {
          window.location.href = this.href;
        }, 600);
      });
    });
  }

  function initReadingProgress() {
    let progressBar = document.querySelector('.reading-progress-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'reading-progress-bar';
      progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        width: 0;
        background: linear-gradient(90deg, var(--lily-accent, #8b6fa8), var(--lily-blood, #9a4a6a));
        z-index: 9999;
        transition: width 0.1s linear;
        box-shadow: 0 0 10px var(--lily-accent, #8b6fa8);
      `;
      document.body.appendChild(progressBar);
    }

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  function initStaggerAnimation(selector, delay) {
    const items = document.querySelectorAll(selector);
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(25px)';
      item.style.transition = `opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${index * delay}s, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${index * delay}s`;

      requestAnimationFrame(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      });
    });
  }

  function initNavScrollEffect() {
    const nav = document.querySelector('#nav');
    if (!nav) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;

      if (currentScroll > 100) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  function initAll() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initScrollAnimations();
        initParallaxScroll();
        initTitleGlow();
        initSmoothScroll();
        initCardHover3D();
        initReadingProgress();
        initNavScrollEffect();

        if (document.querySelector('.flink-card-list')) {
          initStaggerAnimation('.flink-card-list .flink-item-card', 0.07);
        }
        if (document.querySelector('.gallery-container')) {
          initStaggerAnimation('.gallery-container .gallery-item', 0.05);
        }
        if (document.querySelector('.lily-social-card')) {
          initStaggerAnimation('.lily-social-card', 0.08);
        }
      });
    } else {
      initScrollAnimations();
      initParallaxScroll();
      initTitleGlow();
      initSmoothScroll();
      initCardHover3D();
      initReadingProgress();
      initNavScrollEffect();
    }

    if (typeof window.pjax !== 'undefined') {
      document.addEventListener('pjax:complete', () => {
        initScrollAnimations();
        initTitleGlow();
        initCardHover3D();
      });
    }
  }

  initAll();
})();
