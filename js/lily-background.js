/* ============================================================
 *  Lily Background Slideshow - 背景轮播初始化
 *  自动插入背景轮播HTML结构
 * ============================================================ */

(function () {
  'use strict';

  function initBackground() {
    if (document.querySelector('.lily-bg-slideshow')) return;

    const slideshow = document.createElement('div');
    slideshow.className = 'lily-bg-slideshow';

    for (let i = 0; i < 4; i++) {
      const slide = document.createElement('div');
      slide.className = 'bg-slide';
      slideshow.appendChild(slide);
    }

    const overlay = document.createElement('div');
    overlay.className = 'lily-bg-overlay';

    document.body.insertBefore(overlay, document.body.firstChild);
    document.body.insertBefore(slideshow, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackground);
  } else {
    initBackground();
  }

  if (typeof window.pjax !== 'undefined') {
    document.addEventListener('pjax:complete', initBackground);
  }
})();
