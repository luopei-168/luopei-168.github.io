/* ============================================================
 *  Lily Petals Falling - 百合花飘落特效
 *  多层视差 + 大小层次 + 旋转飘落
 * ============================================================ */

(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'lily-petals-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9997;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const petals = [];
  const maxPetals = 35;
  let scrollY = 0;

  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function getPetalColors() {
    const dark = isDarkMode();
    if (dark) {
      return [
        { main: [212, 197, 224], edge: [160, 128, 192] },
        { main: [230, 220, 240], edge: [180, 150, 210] },
        { main: [200, 180, 220], edge: [140, 100, 170] }
      ];
    }
    return [
      { main: [255, 255, 255], edge: [200, 180, 220] },
      { main: [248, 245, 252], edge: [180, 160, 210] },
      { main: [255, 250, 255], edge: [210, 190, 230] }
    ];
  }

  class LilyPetal {
    constructor(layer) {
      this.layer = layer || Math.floor(Math.random() * 3);
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -80 - Math.random() * 100;
      this.size = (Math.random() * 12 + 8) * (1 + this.layer * 0.5);
      this.speedY = (Math.random() * 0.6 + 0.3) * (1 + this.layer * 0.4);
      this.speedX = (Math.random() * 0.4 - 0.2) * (1 + this.layer * 0.3);
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.025 * (1 + this.layer * 0.3);
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.015 + 0.008;
      this.wobbleAmount = (Math.random() * 25 + 15) * (1 + this.layer * 0.3);
      this.type = Math.floor(Math.random() * 3);
      this.opacity = (Math.random() * 0.35 + 0.35) * (1 - this.layer * 0.15);
      this.scaleX = Math.random() * 0.3 + 0.85;
      this.scaleY = Math.random() * 0.3 + 0.85;
      this.tumble = Math.random() * Math.PI * 2;
      this.tumbleSpeed = (Math.random() - 0.5) * 0.01;
    }

    update() {
      this.y += this.speedY;
      this.wobble += this.wobbleSpeed;
      this.tumble += this.tumbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.4 * (1 + this.layer * 0.5);
      this.rotation += this.rotSpeed;

      const parallaxOffset = scrollY * (0.02 + this.layer * 0.02);
      const drawY = this.y + parallaxOffset;

      if (drawY > height + 100) {
        this.reset(false);
      }
      if (this.x < -80) this.x = width + 80;
      if (this.x > width + 80) this.x = -80;
    }

    draw() {
      const colors = getPetalColors()[this.type];
      const parallaxOffset = scrollY * (0.02 + this.layer * 0.02);
      const drawY = this.y + parallaxOffset;

      ctx.save();
      ctx.translate(this.x, drawY);
      ctx.rotate(this.rotation);
      ctx.scale(this.scaleX, this.scaleY);
      ctx.globalAlpha = this.opacity;

      this.drawFlower(colors);

      ctx.restore();
    }

    drawFlower(colors) {
      const s = this.size;
      const petalCount = 6;

      for (let i = 0; i < petalCount; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / petalCount);

        const gradient = ctx.createRadialGradient(
          0, -s * 0.35, 0,
          0, -s * 0.35, s * 0.55
        );
        gradient.addColorStop(0, `rgba(${colors.main[0]}, ${colors.main[1]}, ${colors.main[2]}, ${this.opacity})`);
        gradient.addColorStop(0.6, `rgba(${colors.main[0]}, ${colors.main[1]}, ${colors.main[2]}, ${this.opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(${colors.edge[0]}, ${colors.edge[1]}, ${colors.edge[2]}, ${this.opacity * 0.4})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.35, s * 0.22, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(${colors.edge[0]}, ${colors.edge[1]}, ${colors.edge[2]}, ${this.opacity * 0.25})`;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(s * 0.04, -s * 0.22, 0, -s * 0.45);
        ctx.stroke();

        ctx.restore();
      }

      const centerGradient = ctx.createRadialGradient(
        0, 0, 0,
        0, 0, s * 0.18
      );
      centerGradient.addColorStop(0, `rgba(${colors.edge[0]}, ${colors.edge[1]}, ${colors.edge[2]}, ${this.opacity * 0.8})`);
      centerGradient.addColorStop(0.5, `rgba(${colors.main[0]}, ${colors.main[1]}, ${colors.main[2]}, ${this.opacity * 0.6})`);
      centerGradient.addColorStop(1, `rgba(${colors.edge[0]}, ${colors.edge[1]}, ${colors.edge[2]}, ${this.opacity * 0.5})`);

      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initPetals() {
    for (let i = 0; i < maxPetals; i++) {
      petals.push(new LilyPetal());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let layer = 2; layer >= 0; layer--) {
      for (const petal of petals) {
        if (petal.layer === layer) {
          petal.update();
          petal.draw();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  function handleResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function handleScroll() {
    scrollY = window.scrollY;
  }

  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('scroll', handleScroll, { passive: true });

  initPetals();
  animate();
})();
