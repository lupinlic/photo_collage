import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw';
import fragmentShader from './shaders/fragment.glsl?raw';
import avatarUrl from '../avt.png';

const PARTICLE_MAX = 160000;
const PARTICLE_STEP = 1;
const BRIGHTNESS_THRESHOLD = 238;
const SPAWN_RADIUS = 24;
const IMAGE_SCALE = 0.48;

export default class ParticleSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.geometry = new THREE.BufferGeometry();
    this.material = null;
    this.points = null;
    this.time = 0;
    this.mouse = new THREE.Vector2(-9999, -9999);
    this.textTimer = 0;
    this.textLetters = 0;
    this.textRevealSpeed = 0.56;
    this.textPoints = null;
    this.textGeometry = null;
    this.uniforms = {
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(-9999, -9999) },
      uExplode: { value: 0.0 },
      uZoom: { value: 1.65 },
      uTextProgress: { value: 0.0 },
    };

    window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    window.addEventListener('mouseleave', () => this.onMouseLeave());
    window.addEventListener('keydown', (event) => this.onKeyDown(event));
  }

  async load() {
    const image = await this.loadImage(avatarUrl);
    const portraitData = this.sampleImage(image);
    const portraitCount = this.buildPortrait(portraitData);
    console.log('drawgirl particle count:', portraitCount);
    this.buildMaterial();
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
    this.buildText('Lan Anh');
    if (this.textGeometry) {
      this.textPoints = new THREE.Points(this.textGeometry, this.material);
      this.textPoints.frustumCulled = false;
      this.scene.add(this.textPoints);
    }
  }

  onResize() {
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = src;
      image.onload = () => resolve(image);
      image.onerror = reject;
    });
  }

  sampleImage(image) {
    const canvas = document.createElement('canvas');
    const ratio = Math.min(240 / image.width, 320 / image.height, 1);
    canvas.width = Math.round(image.width * ratio);
    canvas.height = Math.round(image.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const positions = [];
    const colors = [];
    const targets = [];
    const randoms = [];
    const depths = [];
    const phases = [];

    for (let y = 0; y < canvas.height; y += PARTICLE_STEP) {
      for (let x = 0; x < canvas.width; x += PARTICLE_STEP) {
        const index = (y * canvas.width + x) * 4;
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        const a = imageData[index + 3];
        const brightness = (r + g + b) / 3;
        if (a < 16 || brightness > BRIGHTNESS_THRESHOLD) continue;

        const tx = (x - canvas.width * 0.5) * IMAGE_SCALE;
        const ty = -(y - canvas.height * 0.5) * IMAGE_SCALE;
        const tz = (1 - brightness / 255) * 20;

        const angle = Math.random() * Math.PI * 2;
        const radius = SPAWN_RADIUS + Math.random() * 60;
        const sx = Math.cos(angle) * radius;
        const sy = Math.sin(angle) * radius;
        const sz = (Math.random() - 0.5) * 120;

        positions.push(sx, sy, sz);
        targets.push(tx, ty, tz);
        colors.push(r / 255, g / 255, b / 255);
        randoms.push(Math.random());
        depths.push(tz * 0.06);
        phases.push(Math.random() * Math.PI * 2);
      }
    }

    return { positions, targets, colors, randoms, depths, phases };
  }

  buildPortrait(data) {
    const count = Math.min(data.positions.length / 3, PARTICLE_MAX);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.positions.slice(0, count * 3)), 3));
    this.geometry.setAttribute('target', new THREE.BufferAttribute(new Float32Array(data.targets.slice(0, count * 3)), 3));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(data.colors.slice(0, count * 3)), 3));
    this.geometry.setAttribute('random', new THREE.BufferAttribute(new Float32Array(data.randoms.slice(0, count)), 1));
    this.geometry.setAttribute('depth', new THREE.BufferAttribute(new Float32Array(data.depths.slice(0, count)), 1));
    this.geometry.setAttribute('phase', new THREE.BufferAttribute(new Float32Array(data.phases.slice(0, count)), 1));
    this.geometry.setAttribute('sizeScale', new THREE.BufferAttribute(new Float32Array(count).map(() => 0.92 + Math.random() * 0.54), 1));
    this.geometry.setAttribute('alphaScale', new THREE.BufferAttribute(new Float32Array(count).map(() => 0.58 + Math.random() * 0.42), 1));
    this.geometry.setAttribute('moveStart', new THREE.BufferAttribute(new Float32Array(count).fill(0.0), 1));
    this.geometry.setAttribute('isText', new THREE.BufferAttribute(new Float32Array(count).fill(0.0), 1));
    this.geometry.setAttribute('letterIndex', new THREE.BufferAttribute(new Float32Array(count).fill(0.0), 1));
    this.geometry.setDrawRange(0, count);
    this.geometry.computeBoundingSphere();
    return count;
  }

  buildMaterial() {
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: false,
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });
  }

  buildText(text) {
    const data = this.sampleText(text);
    if (data.positions.length === 0) return;

    this.textGeometry = new THREE.BufferGeometry();
    const count = data.positions.length / 3;
    this.textGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.positions), 3));
    this.textGeometry.setAttribute('target', new THREE.BufferAttribute(new Float32Array(data.targets), 3));
    this.textGeometry.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(data.colors), 3));
    this.textGeometry.setAttribute('random', new THREE.BufferAttribute(new Float32Array(data.randoms), 1));
    this.textGeometry.setAttribute('depth', new THREE.BufferAttribute(new Float32Array(data.depths), 1));
    this.textGeometry.setAttribute('phase', new THREE.BufferAttribute(new Float32Array(data.phases), 1));
    this.textGeometry.setAttribute('sizeScale', new THREE.BufferAttribute(new Float32Array(data.sizeScale), 1));
    this.textGeometry.setAttribute('alphaScale', new THREE.BufferAttribute(new Float32Array(data.alphaScale), 1));
    this.textGeometry.setAttribute('moveStart', new THREE.BufferAttribute(new Float32Array(data.moveStart), 1));
    this.textGeometry.setAttribute('isText', new THREE.BufferAttribute(new Float32Array(data.isText), 1));
    this.textGeometry.setAttribute('letterIndex', new THREE.BufferAttribute(new Float32Array(data.letterIndex), 1));
    this.textGeometry.setDrawRange(0, count);
    this.textGeometry.computeBoundingSphere();

    this.textLetters = data.letterCount;
    this.textPoints = new THREE.Points(this.textGeometry, this.material);
    this.textPoints.frustumCulled = false;
  }

  sampleText(text) {
    const canvas = document.createElement('canvas');
    const width = 620;
    const height = 140;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 110px sans-serif';

    const metrics = [];
    let x = 0;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      const m = ctx.measureText(ch);
      metrics.push({ char: ch, x, width: m.width });
      x += m.width;
    }

    const offsetX = (width - x) * 0.5;
    const offsetY = height * 0.5;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, offsetX, offsetY);

    const img = ctx.getImageData(0, 0, width, height).data;
    const positions = [];
    const targets = [];
    const colors = [];
    const randoms = [];
    const depths = [];
    const phases = [];
    const sizeScale = [];
    const alphaScale = [];
    const moveStart = [];
    const isText = [];
    const letterIndex = [];

    let letterCount = 0;
    const letterRanges = metrics.reduce((arr, entry) => {
      if (entry.char !== ' ') {
        arr.push({ x: offsetX + entry.x, width: entry.width });
      }
      return arr;
    }, []);
    letterCount = letterRanges.length;

    const sampleStep = 3;
    for (let y = 0; y < height; y += sampleStep) {
      for (let xx = 0; xx < width; xx += sampleStep) {
        const idx = (y * width + xx) * 4;
        const alpha = img[idx + 3];
        if (alpha < 80) continue;

        const tx = (xx - width * 0.5) * 0.16 + 95;
        const ty = -(y - height * 0.5) * 0.16 + 12;
        const tz = 0.8;
        const px = tx + (Math.random() - 0.5) * 80;
        const py = ty + (Math.random() - 0.5) * 34;
        const pz = (Math.random() - 0.5) * 60;

        const charIndex = letterRanges.findIndex((range) => xx >= range.x && xx <= range.x + range.width);
        const indexValue = charIndex >= 0 ? charIndex + 1 : 0;

        positions.push(px, py, pz);
        targets.push(tx, ty, tz);
        colors.push(1.0, 0.98, 0.92);
        randoms.push(Math.random());
        depths.push(0.0);
        phases.push(Math.random() * Math.PI * 2);
        sizeScale.push(1.0 + Math.random() * 0.6);
        alphaScale.push(0.92 + Math.random() * 0.08);
        moveStart.push(this.time);
        isText.push(1.0);
        letterIndex.push(indexValue);
      }
    }

    return {
      positions,
      targets,
      colors,
      randoms,
      depths,
      phases,
      sizeScale,
      alphaScale,
      moveStart,
      isText,
      letterIndex,
      letterCount,
    };
  }

  update() {
    this.time += 0.018;
    this.textTimer += 0.018;
    if (this.textLetters > 0) {
      this.uniforms.uTextProgress.value = Math.min(this.textTimer * this.textRevealSpeed, this.textLetters + 0.5);
    }
    this.uniforms.uTime.value = this.time;
    this.uniforms.uMouse.value.copy(this.mouse);
    this.uniforms.uZoom.value += (1.0 - this.uniforms.uZoom.value) * 0.0018;
  }

  onMouseMove(event) {

    this.mouse.x = (event.clientX / window.innerWidth) * 2.0 - 1.0;
    this.mouse.y = -((event.clientY / window.innerHeight) * 2.0 - 1.0);
  }

  onMouseLeave() {
    this.mouse.set(-9999, -9999);
  }

  onKeyDown(event) {
    if (event.code === 'Space') {
      this.uniforms.uExplode.value = 1.0;
      setTimeout(() => {
        this.uniforms.uExplode.value = 0.0;
      }, 1000);
    }
  }
}
