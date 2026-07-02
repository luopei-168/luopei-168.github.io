/* ============================================================
 *  Lily Mouse Particles - 鼠标跟随特效
 *  净化之光 + 百合花痕 + 污秽粒子消散
 * ============================================================ */

(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'lily-mouse-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const trails = [];
  const maxParticles = 60;
  const maxTrails = 20;
  let mouseX = width / 2;
  let mouseY = height / 2;
  let lastMouseX = mouseX;
  let lastMouseY = mouseY;
  let isMoving = false;
  let moveTimer = null;
  let clickBurst = [];

  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function getPurifyColor(alpha) {
    const dark = isDarkMode();
    if (dark) {
      return `rgba(220, 200, 245, ${alpha})`;
    }
    return `rgba(255, 255, 255, ${alpha})`;
  }

  function getAccentColor(alpha) {
    const dark = isDarkMode();
    if (dark) {
      return `rgba(170, 130, 210, ${alpha})`;
    }
    return `rgba(140, 100, 180, ${alpha})`;
  }

  function getImpurityColor(alpha) {
    const dark = isDarkMode();
    if (dark) {
      return `rgba(120, 40, 80, ${alpha})`;
    }
    return `rgba(150, 60, 90, ${alpha})`;
  }

  /* ---------- 主粒子 ---------- */
  class Particle {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type || 'normal';
      this.size = Math.random() * 3 + 1.5;
      this.speedX = (Math.random() - 0.5) * 2.5;
      this.speedY = (Math.random() - 0.5) * 2.5 - 0.8;
      this.life = 1;
      this.decay = Math.random() * 0.012 + 0.008;
      this.glow = Math.random() * 0.5 + 0.5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.08;
      this.isPetal = Math.random() < 0.15;
      this.petalSize = Math.random() * 8 + 5;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += 0.015;
      this.speedX *= 0.98;
      this.life -= this.decay;
      this.rotation += this.rotSpeed;
      this.size *= 0.99;
    }

    draw() {
      if (this.isPetal) {
        this.drawPetal();
      } else {
        this.drawGlow();
      }
    }

    drawGlow() {
      const outerAlpha = this.life * 0.25;
      const innerAlpha = this.life * this.glow;

      ctx.save();

      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 3
      );
      gradient.addColorStop(0, getPurifyColor(innerAlpha * 0.8));
      gradient.addColorStop(0.4, getAccentColor(outerAlpha));
      gradient.addColorStop(1, getAccentColor(0));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = getPurifyColor(innerAlpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawPetal() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.life * 0.7;

      const s = this.petalSize;

      const gradient = ctx.createRadialGradient(0, -s * 0.3, 0, 0, -s * 0.3, s * 0.6);
      gradient.addColorStop(0, getPurifyColor(0.9));
      gradient.addColorStop(0.6, getPurifyColor(0.6));
      gradient.addColorStop(1, getAccentColor(0.3));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.3, s * 0.3, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /* ---------- 拖尾光点 ---------- */
  class TrailPoint {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.life = 1;
      this.size = Math.random() * 2 + 1;
      this.decay = 0.02 + Math.random() * 0.01;
    }

    update() {
      this.life -= this.decay;
      this.size *= 0.97;
    }

    draw() {
      const alpha = this.life * 0.6;
      ctx.save();

      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 2
      );
      gradient.addColorStop(0, getPurifyColor(alpha));
      gradient.addColorStop(1, getAccentColor(0));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /* ---------- 点击爆发效果 ---------- */
  class ClickBurst {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.life = 1;
      this.maxRadius = 60;
      this.rings = 3;
    }

    update() {
      this.life -= 0.025;
    }

    draw() {
      if (this.life <= 0) return;

      ctx.save();

      for (let i = 0; i < this.rings; i++) {
        const progress = 1 - this.life;
        const radius = this.maxRadius * progress * (1 + i * 0.15);
        const alpha = this.life * (0.5 - i * 0.1);

        ctx.strokeStyle = getPurifyColor(alpha);
        ctx.lineWidth = 2 - i * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      const particleCount = 8;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const dist = this.maxRadius * (1 - this.life);
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        const alpha = this.life * 0.8;

        ctx.fillStyle = getAccentColor(alpha);
        ctx.beginPath();
        ctx.arc(px, py, 2 * this.life, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function spawnParticles() {
    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const count = Math.min(Math.floor(distance / 12) + 1, 6);

    for (let i = 0; i < count; i++) {
      if (particles.length < maxParticles) {
        const offsetX = (Math.random() - 0.5) * 12;
        const offsetY = (Math.random() - 0.5) * 12;
        particles.push(new Particle(mouseX + offsetX, mouseY + offsetY));
      }
    }

    if (trails.length < maxTrails) {
      trails.push(new TrailPoint(mouseX, mouseY));
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }

  function spawnClickBurst(x, y) {
    clickBurst.push(new ClickBurst(x, y));
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = trails.length - 1; i >= 0; i--) {
      trails[i].update();
      trails[i].draw();
      if (trails[i].life <= 0) {
        trails.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].life <= 0 || particles[i].size < 0.3) {
        particles.splice(i, 1);
      }
    }

    for (let i = clickBurst.length - 1; i >= 0; i--) {
      clickBurst[i].update();
      clickBurst[i].draw();
      if (clickBurst[i].life <= 0) {
        clickBurst.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  function handleResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;

    if (moveTimer) clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      isMoving = false;
    }, 100);

    spawnParticles();
  }

  function handleMouseDown(e) {
    spawnClickBurst(e.clientX, e.clientY);
  }

  function handleTouchMove(e) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      isMoving = true;

      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        isMoving = false;
      }, 100);

      spawnParticles();
    }
  }

  function handleTouchStart(e) {
    if (e.touches.length > 0) {
      spawnClickBurst(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  window.addEventListener('resize', handleResize, { passive: true });
  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('mousedown', handleMouseDown, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: true });
  document.addEventListener('touchstart', handleTouchStart, { passive: true });

  animate();
})();
