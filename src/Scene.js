import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import ParticleSystem from './ParticleSystem.js';

export default class Scene {
  constructor(container) {
    const mount = document.querySelector('#app');
    this.container = mount || container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 220);
    this.camera.lookAt(0, 0, 0);

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false }) || canvas.getContext('webgl', { antialias: false, alpha: false });
    this.renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: false, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    this.container.appendChild(this.renderer.domElement);

    this.particleSystem = new ParticleSystem(this.scene, this.camera);
    window.particleSystem = this.particleSystem;
    window.particleScene = this.scene;
    this.initPostProcessing();

    window.addEventListener('resize', () => this.onResize());
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.36, 0.5, 0.8));
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    if (this.particleSystem?.onResize) {
      this.particleSystem.onResize();
    }
  }

  start() {
    this.particleSystem.load().then(() => {
      this.loop();
    });
  }

  loop() {
    this.particleSystem.update();
    this.composer.render();
    requestAnimationFrame(() => this.loop());
  }
}
