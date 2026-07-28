const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const devicePixelRatio = window.devicePixelRatio || 1;
const effectiveDPR = Math.min(devicePixelRatio, 1.5);
const MAX_TARGET_WIDTH = 380;
const MAX_TARGET_HEIGHT = 520;
const PARTICLE_STEP = 4;
const TARGET_PARTICLE_COUNT = 12000;
const BRIGHTNESS_THRESHOLD = 245;
const MOUSE_RADIUS = 140;
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
const EXPLODE_POWER = 24;
const FRICTION = 0.92;
const SPRING = 0.032;
const CAMERA_EASE = 0.0025;
const MIN_CAMERA_SCALE = 0.95;
const MAX_CAMERA_SCALE = 1.0;

const hiddenCanvas = document.createElement('canvas');
const hiddenCtx = hiddenCanvas.getContext('2d');
const bgCanvas = document.createElement('canvas');
const bgCtx = bgCanvas.getContext('2d');

const portraitImage = new Image();
portraitImage.crossOrigin = 'anonymous';
portraitImage.src = 'avt.png';

const mouse = { x: 0, y: 0, active: false };
let width = 0;
let height = 0;
let targetWidth = 320;
let targetHeight = 440;
let particleCount = 0;
let positions;
let velocities;
let targets;
let radii;
let zs;
let alphas;
let breathes;
let phaseOffsets;
let colors;
let types;
let explosionDirX;
let explosionDirY;
let exploded = false;
let cameraScale = MIN_CAMERA_SCALE;
let lastTime = 0;
let framePhase = 0;
let animationStarted = false;

const SIN_TABLE = new Float32Array(256);
for (let i = 0; i < 256; i += 1) {
  SIN_TABLE[i] = Math.sin((i / 256) * Math.PI * 2);
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * effectiveDPR);
  canvas.height = Math.floor(height * effectiveDPR);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(effectiveDPR, 0, 0, effectiveDPR, 0, 0);
  createBackgroundCache();
}

function createBackgroundCache() {
  bgCanvas.width = width;
  bgCanvas.height = height;

  bgCtx.fillStyle = '#06030d';
  bgCtx.fillRect(0, 0, width, height);

  const glow = bgCtx.createRadialGradient(width * 0.5, height * 0.3, 0, width * 0.5, height * 0.35, width * 0.9);
  glow.addColorStop(0, 'rgba(128, 90, 255, 0.14)');
  glow.addColorStop(0.4, 'transparent');
  glow.addColorStop(1, 'rgba(4, 4, 10, 0.92)');
  bgCtx.fillStyle = glow;
  bgCtx.fillRect(0, 0, width, height);

  bgCtx.fillStyle = 'rgba(0, 0, 0, 0.24)';
  bgCtx.fillRect(0, 0, width, height);

  const vignette = bgCtx.createRadialGradient(width * 0.5, height * 0.5, width * 0.25, width * 0.5, height * 0.5, width * 0.7);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  bgCtx.fillStyle = vignette;
  bgCtx.fillRect(0, 0, width, height);
}

function resizeHiddenCanvas() {
  const ratio = Math.min(MAX_TARGET_WIDTH / portraitImage.width, MAX_TARGET_HEIGHT / portraitImage.height, 1);
  targetWidth = Math.round(portraitImage.width * ratio);
  targetHeight = Math.round(portraitImage.height * ratio);
  hiddenCanvas.width = targetWidth;
  hiddenCanvas.height = targetHeight;
}

function getImageData() {
  hiddenCtx.clearRect(0, 0, targetWidth, targetHeight);
  hiddenCtx.drawImage(portraitImage, 0, 0, targetWidth, targetHeight);
  return hiddenCtx.getImageData(0, 0, targetWidth, targetHeight);
}

function allocateParticleArrays(count) {
  const size = count * 2;
  positions = positions && positions.length >= size ? positions : new Float32Array(size);
  velocities = velocities && velocities.length >= size ? velocities : new Float32Array(size);
  targets = targets && targets.length >= size ? targets : new Float32Array(size);
  explosionDirX = explosionDirX && explosionDirX.length >= count ? explosionDirX : new Float32Array(count);
  explosionDirY = explosionDirY && explosionDirY.length >= count ? explosionDirY : new Float32Array(count);
  radii = radii && radii.length >= count ? radii : new Float32Array(count);
  zs = zs && zs.length >= count ? zs : new Float32Array(count);
  alphas = alphas && alphas.length >= count ? alphas : new Float32Array(count);
  breathes = breathes && breathes.length >= count ? breathes : new Float32Array(count);
  phaseOffsets = phaseOffsets && phaseOffsets.length >= count ? phaseOffsets : new Uint8Array(count);
  types = types && types.length >= count ? types : new Uint8Array(count);
  colors = colors && colors.length >= count ? colors : new Array(count);
}

function randomSpawn() {
  const side = Math.random() * 4;
  if (side < 1) {
    return { x: Math.random() * width, y: -20 - Math.random() * 160 };
  }
  if (side < 2) {
    return { x: Math.random() * width, y: height + 20 + Math.random() * 160 };
  }
  if (side < 3) {
    return { x: -20 - Math.random() * 160, y: Math.random() * height };
  }
  return { x: width + 20 + Math.random() * 160, y: Math.random() * height };
}

function randomType() {
  const roll = Math.random();
  if (roll < 0.45) return 0;
  if (roll < 0.7) return 1;
  if (roll < 0.9) return 2;
  return 3;
}

function createParticles() {
  const imageData = getImageData();
  const targetOffsetX = (width - targetWidth) * 0.5;
  const targetOffsetY = (height - targetHeight) * 0.5;
  const pixels = imageData.data;
  let count = 0;
  const maxParticles = TARGET_PARTICLE_COUNT;

  for (let y = 0; y < targetHeight; y += PARTICLE_STEP) {
    for (let x = 0; x < targetWidth; x += PARTICLE_STEP) {
      const index = (y * targetWidth + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = pixels[index + 3];
      const brightness = (r + g + b) * 0.3333333;

      if (a < 24 || brightness > BRIGHTNESS_THRESHOLD) continue;
      count += 1;
    }
  }

  if (count > maxParticles) {
    const scale = count / maxParticles;
    if (scale > 1) {
      count = Math.floor(count / scale);
    }
  }

  allocateParticleArrays(count);
  particleCount = count;

  const centerX = width * 0.5;
  const centerY = height * 0.5;
  let particleIndex = 0;
  let sampleIndex = 0;
  const step = PARTICLE_STEP;
  const area = targetWidth * targetHeight;

  for (let y = 0; y < targetHeight; y += step) {
    for (let x = 0; x < targetWidth; x += step) {
      const index = (y * targetWidth + x) * 4;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const a = pixels[index + 3];
      const brightness = (r + g + b) * 0.3333333;

      if (a < 24 || brightness > BRIGHTNESS_THRESHOLD) {
        sampleIndex += 1;
        continue;
      }

      if (particleIndex >= count) break;
      const px = targetOffsetX + x;
      const py = targetOffsetY + y;
      const depth = 0.45 + (1 - brightness / 255) * 0.55;
      const radius = 0.7 + depth * 1.8;
      const color = `rgba(${r}, ${g}, ${b}, 1)`;
      const spawn = randomSpawn();
      const type = randomType();
      const phaseOffset = Math.floor(Math.random() * 256);
      const dx = px - centerX;
      const dy = py - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const dirX = dx / dist;
      const dirY = dy / dist;

      const baseIndex = particleIndex * 2;
      positions[baseIndex] = spawn.x;
      positions[baseIndex + 1] = spawn.y;
      velocities[baseIndex] = (Math.random() - 0.5) * 6;
      velocities[baseIndex + 1] = (Math.random() - 0.5) * 6;
      targets[baseIndex] = px;
      targets[baseIndex + 1] = py;

      radii[particleIndex] = radius;
      zs[particleIndex] = depth;
      alphas[particleIndex] = 0.35 + depth * 0.6;
      breathes[particleIndex] = 0.3 + depth * 0.7;
      phaseOffsets[particleIndex] = phaseOffset;
      types[particleIndex] = type;
      colors[particleIndex] = color;
      explosionDirX[particleIndex] = dirX;
      explosionDirY[particleIndex] = dirY;

      particleIndex += 1;
      sampleIndex += 1;
    }
    if (particleIndex >= count) break;
  }
}

function updateParticles(delta) {
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  framePhase = (framePhase + 1) & 255;

  const len = particleCount;
  const SPRING_SCALE = SPRING;
  const FRICTION_SCALE = FRICTION;
  const targetArr = targets;
  const posArr = positions;
  const velArr = velocities;
  const radArr = radii;
  const zArr = zs;
  const alphaArr = alphas;
  const breathArr = breathes;
  const phaseArr = phaseOffsets;
  const dirXArr = explosionDirX;
  const dirYArr = explosionDirY;

  for (let i = 0; i < len; i += 1) {
    const index = i * 2;
    const tx = targetArr[index];
    const ty = targetArr[index + 1];
    let vx = velArr[index];
    let vy = velArr[index + 1];
    const px = posArr[index];
    const py = posArr[index + 1];
    const dz = zArr[i];

    const dx = tx - px;
    const dy = ty - py;
    vx += dx * SPRING_SCALE * dz;
    vy += dy * SPRING_SCALE * dz;

    if (exploded) {
      const force = EXPLODE_POWER * dz;
      vx = dirXArr[i] * force + (Math.random() - 0.5) * 2;
      vy = dirYArr[i] * force + (Math.random() - 0.5) * 2;
    }

    if (mouse.active) {
      const mdx = px - mouse.x;
      const mdy = py - mouse.y;
      const distSq = mdx * mdx + mdy * mdy;
      if (distSq < MOUSE_RADIUS_SQ) {
        const ratio = 1 - distSq / MOUSE_RADIUS_SQ;
        const inv = 1 / Math.sqrt(distSq || 1);
        const strength = ratio * 0.26 * (0.9 + dz);
        vx += mdx * inv * strength;
        vy += mdy * inv * strength;
      }
    }

    const phase = (phaseArr[i] + framePhase) & 255;
    const breathe = breathArr[i];
    vx += SIN_TABLE[phase] * breathe * 0.015 * dz;
    vy += SIN_TABLE[(phase + 64) & 255] * breathe * 0.012 * dz;

    vx *= FRICTION_SCALE;
    vy *= FRICTION_SCALE;
    posArr[index] = px + vx;
    posArr[index + 1] = py + vy;
    velArr[index] = vx;
    velArr[index + 1] = vy;
  }

  exploded = false;
}

function drawParticles() {
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowBlur = 14;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.08)';

  const len = particleCount;
  const colorArr = colors;
  const typeArr = types;
  const posArr = positions;
  const alphaArr = alphas;
  const zArr = zs;
  const radArr = radii;

  for (let i = 0; i < len; i += 1) {
    const index = i * 2;
    ctx.fillStyle = colorArr[i];
    ctx.globalAlpha = alphaArr[i] * (0.8 + zArr[i] * 0.2);

    const x = posArr[index];
    const y = posArr[index + 1];
    const r = radArr[i];
    const type = typeArr[i];

    if (type === 0) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 1) {
      ctx.beginPath();
      ctx.arc(x, y, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 2) {
      ctx.fillRect(x - r * 0.6, y - 0.12, r * 1.2, r * 0.24);
      ctx.fillRect(x - 0.12, y - r * 0.6, r * 0.24, r * 1.2);
    } else {
      ctx.strokeStyle = colorArr[i];
      ctx.lineWidth = Math.max(1, r * 0.7);
      ctx.beginPath();
      ctx.moveTo(x - r, y);
      ctx.lineTo(x + r, y);
      ctx.moveTo(x, y - r);
      ctx.lineTo(x, y + r);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.globalCompositeOperation = 'source-over';
}

function renderFrame() {
  const scale = cameraScale;
  const tx = (width * (1 - scale)) * 0.5;
  const ty = (height * (1 - scale)) * 0.5;
  ctx.setTransform(devicePixelRatio * scale, 0, 0, devicePixelRatio * scale, devicePixelRatio * tx, devicePixelRatio * ty);
  ctx.drawImage(bgCanvas, 0, 0, width / scale, height / scale);
  drawParticles();
}

function animate(timestamp) {
  const delta = Math.min(32, timestamp - lastTime);
  lastTime = timestamp;

  cameraScale += (MAX_CAMERA_SCALE - cameraScale) * CAMERA_EASE;
  updateParticles(delta);
  renderFrame();
  requestAnimationFrame(animate);
}

function resetPortrait() {
  cameraScale = MIN_CAMERA_SCALE;
  createParticles();
}

function explodePortrait() {
  const len = particleCount;
  for (let i = 0; i < len; i += 1) {
    const index = i * 2;
    const force = EXPLODE_POWER * zs[i];
    velocities[index] = explosionDirX[i] * force + (Math.random() - 0.5) * 1.5;
    velocities[index + 1] = explosionDirY[i] * force + (Math.random() - 0.5) * 1.5;
  }
}

window.addEventListener('resize', () => {
  resize();
  if (portraitImage.complete) {
    resizeHiddenCanvas();
    createParticles();
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
  mouse.active = true;
});

canvas.addEventListener('mouseleave', () => {
  mouse.active = false;
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    explodePortrait();
  }
  if (event.key.toLowerCase() === 'r') {
    resetPortrait();
  }
});

function start() {
  resize();
  resizeHiddenCanvas();
  createParticles();
  requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    animate(timestamp);
  });
}

portraitImage.onload = () => {
  if (!animationStarted) {
    animationStarted = true;
    start();
  }
};

portraitImage.onerror = () => {
  console.error('Không thể tải ảnh avt.png');
};
