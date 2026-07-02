/* ============================================================
 *  Lily Atmosphere Effects - 终焉之莉莉氛围特效
 *  死亡之雨 + 发光蝴蝶 + 光斑尘埃 + 视差层
 * ============================================================ */

(function () {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'lily-atmosphere-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const rainDrops = [];
  const butterflies = [];
  const dustParticles = [];
  const maxRain = 120;
  const maxButterflies = 8;
  const maxDust = 60;

  let mouseX = width / 2;
  let mouseY = height / 2;
  let scrollY = 0;

  function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  /* ---------- 死亡之雨 ---------- */
  class RainDrop {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20 - Math.random() * 100;
      this.length = Math.random() * 25 + 15;
      this.speed = Math.random() * 8 + 10;
      this.opacity = Math.random() * 0.25 + 0.1;
      this.thickness = Math.random() * 1 + 0.5;
      this.drift = Math.random() * 0.5 - 0.25;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.05 + 0.02;
    }

    update() {
      this.y += this.speed;
      this.wobble += this.wobbleSpeed;
      this.x += this.drift + Math.sin(this.wobble) * 0.3;

      if (this.y > height + 30) {
        this.reset(false);
      }
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
    }

    draw() {
      const dark = isDarkMode();
      const baseColor = dark ? 'rgba(180, 160, 200, ' : 'rgba(200, 190, 220, ';

      ctx.save();
      ctx.strokeStyle = baseColor + this.opacity + ')';
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';

      const gradient = ctx.createLinearGradient(
        this.x, this.y,
        this.x + this.drift * 3, this.y + this.length
      );
      gradient.addColorStop(0, baseColor + '0)');
      gradient.addColorStop(0.3, baseColor + (this.opacity * 0.5) + ')');
      gradient.addColorStop(1, baseColor + this.opacity + ')');

      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.drift * 3, this.y + this.length);
      ctx.stroke();

      ctx.restore();
    }
  }

  /* ---------- 发光蝴蝶 ---------- */
  class Butterfly {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = initial ? Math.random() * width : -50;
      this.y = Math.random() * height * 0.7 + height * 0.1;
      this.size = Math.random() * 8 + 6;
      this.speedX = Math.random() * 0.8 + 0.3;
      this.speedY = 0;
      this.wingPhase = Math.random() * Math.PI * 2;
      this.wingSpeed = Math.random() * 0.15 + 0.1;
      this.floatPhase = Math.random() * Math.PI * 2;
      this.floatSpeed = Math.random() * 0.02 + 0.01;
      this.floatAmount = Math.random() * 40 + 30;
      this.opacity = Math.random() * 0.5 + 0.4;
      this.glowSize = this.size * 3;
      this.targetY = this.y;
      this.changeTimer = Math.random() * 200 + 100;
    }

    update() {
      this.x += this.speedX;
      this.wingPhase += this.wingSpeed;
      this.floatPhase += this.floatSpeed;

      this.changeTimer--;
      if (this.changeTimer <= 0) {
        this.targetY = Math.random() * height * 0.6 + height * 0.15;
        this.changeTimer = Math.random() * 300 + 200;
      }

      const dy = this.targetY - this.y;
      this.speedY += dy * 0.001;
      this.speedY *= 0.95;
      this.y += this.speedY + Math.sin(this.floatPhase) * 0.5;

      const dx = mouseX - this.x;
      const dy2 = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy2 * dy2);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.5;
        this.x -= dx * force * 0.02;
        this.y -= dy2 * force * 0.02;
      }

      if (this.x > width + 80) {
        this.x = -80;
        this.y = Math.random() * height * 0.7 + height * 0.1;
      }
      if (this.x < -80) this.x = width + 80;
      if (this.y < 20) this.y = 20;
      if (this.y > height - 20) this.y = height - 20;
    }

    draw() {
      const dark = isDarkMode();
      const hue = dark ? 270 : 260;
      const sat = dark ? 60 : 50;
      const light = dark ? 80 : 85;

      ctx.save();
      ctx.translate(this.x, this.y);

      const wingFlap = Math.sin(this.wingPhase) * 0.6 + 0.4;

      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.glowSize);
      glowGradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, ${this.opacity * 0.4})`);
      glowGradient.addColorStop(0.5, `hsla(${hue}, ${sat}%, ${light}%, ${this.opacity * 0.1})`);
      glowGradient.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.glowSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `hsla(${hue}, ${sat - 10}%, ${light - 5}%, ${this.opacity * 0.9})`;

      ctx.save();
      ctx.scale(wingFlap, 1);
      this.drawWing(-1, -1);
      ctx.restore();

      ctx.save();
      ctx.scale(wingFlap, 1);
      this.drawWing(1, -1);
      ctx.restore();

      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light - 10}%, ${this.opacity})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.15, this.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawWing(side, dir) {
      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.1);
      ctx.quadraticCurveTo(s * side * 0.8, -s * 0.8, s * side * 0.5, -s * 0.3);
      ctx.quadraticCurveTo(s * side * 0.6, s * 0.2, s * side * 0.3, s * 0.1);
      ctx.quadraticCurveTo(s * side * 0.1, -s * 0.05, 0, -s * 0.1);
      ctx.fill();
    }
  }

  /* ---------- 光斑尘埃 ---------- */
  class DustParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 3 + 1;
      this.speedY = Math.random() * 0.3 + 0.1;
      this.speedX = Math.random() * 0.2 - 0.1;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.03 + 0.01;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.01 + 0.005;
      this.wobbleAmount = Math.random() * 20 + 10;
    }

    update() {
      this.y += this.speedY;
      this.twinkle += this.twinkleSpeed;
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.2;

      const parallaxOffset = scrollY * 0.05;
      const drawY = this.y + parallaxOffset % height;

      if (drawY > height + 30) {
        this.reset(false);
      }
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
    }

    draw() {
      const dark = isDarkMode();
      const parallaxOffset = scrollY * 0.05;
      const drawY = (this.y + parallaxOffset) % (height + 40) - 20;

      const twinkleOpacity = this.opacity * (0.5 + Math.sin(this.twinkle) * 0.5);

      ctx.save();

      const gradient = ctx.createRadialGradient(
        this.x, drawY, 0,
        this.x, drawY, this.size * 3
      );

      if (dark) {
        gradient.addColorStop(0, `rgba(220, 200, 240, ${twinkleOpacity * 0.8})`);
        gradient.addColorStop(0.4, `rgba(200, 180, 230, ${twinkleOpacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(180, 160, 220, 0)');
      } else {
        gradient.addColorStop(0, `rgba(255, 255, 255, ${twinkleOpacity * 0.9})`);
        gradient.addColorStop(0.4, `rgba(240, 235, 250, ${twinkleOpacity * 0.4})`);
        gradient.addColorStop(1, 'rgba(220, 210, 240, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, drawY, this.size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = dark ? `rgba(240, 230, 250, ${twinkleOpacity})` : `rgba(255, 255, 255, ${twinkleOpacity})`;
      ctx.beginPath();
      ctx.arc(this.x, drawY, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /* ---------- 雨溅效果 ---------- */
  function drawRainSplash() {
    const dark = isDarkMode();
    const baseColor = dark ? 'rgba(180, 160, 200, ' : 'rgba(200, 190, 220, ';
    const splashY = height - 10;

    ctx.save();
    for (let i = 0; i < 15; i++) {
      const x = (i * 97 + Date.now() * 0.01) % width;
      const size = 2 + Math.random() * 3;
      const opacity = 0.1 + Math.random() * 0.15;

      ctx.strokeStyle = baseColor + opacity + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x, splashY, size, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- 初始化 ---------- */
  function init() {
    for (let i = 0; i < maxRain; i++) {
      rainDrops.push(new RainDrop());
    }
    for (let i = 0; i < maxButterflies; i++) {
      butterflies.push(new Butterfly());
    }
    for (let i = 0; i < maxDust; i++) {
      dustParticles.push(new DustParticle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (const dust of dustParticles) {
      dust.update();
      dust.draw();
    }

    for (const drop of rainDrops) {
      drop.update();
      drop.draw();
    }

    drawRainSplash();

    for (const butterfly of butterflies) {
      butterfly.update();
      butterfly.draw();
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
  }

  function handleScroll() {
    scrollY = window.scrollY;
  }

  function handleTouchMove(e) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }

  window.addEventListener('resize', handleResize, { passive: true });
  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('scroll', handleScroll, { passive: true });

  init();
  animate();
})();
