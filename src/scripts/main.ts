import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ===== INIT =====
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

// ===== CUSTOM CURSOR =====
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let fx = 0, fy = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursor, { x: e.clientX, y: e.clientY });
  });

  function animateFollower() {
    fx += (mouseX - fx) * 0.08;
    fy += (mouseY - fy) * 0.08;
    gsap.set(follower, { x: fx, y: fy });
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // hover effect
  document.querySelectorAll('a, button, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor?.classList.remove('hovering'));
  });
}

// ===== PRELOADER =====
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const number = document.getElementById('preloader-number');
  const bar = document.getElementById('preloader-bar');
  if (!preloader || !number || !bar) return;

  let progress = 0;
  const duration = 1800;
  const start = performance.now();

  function updateProgress(now: number) {
    const elapsed = now - start;
    progress = Math.min(elapsed / duration, 1);
    const val = Math.floor(progress * 100);
    number.textContent = String(val);
    bar.style.width = `${val}%`;

    if (progress < 1) {
      requestAnimationFrame(updateProgress);
    } else {
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          preloader.style.display = 'none';
          initHeroAnimation();
        }
      });
    }
  }

  requestAnimationFrame(updateProgress);
}

// ===== THREE.JS PARTICLE BACKGROUND =====
function initWebGL() {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0a0a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 80;

  // Particles
  const count = 2000;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    sizes[i] = Math.random() * 1.5 + 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.4,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Mouse influence
  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animate
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.001;

    // Smooth mouse follow
    mouseX += (targetMouseX - mouseX) * 0.02;
    mouseY += (targetMouseY - mouseY) * 0.02;

    particles.rotation.y = time + mouseX * 0.3;
    particles.rotation.x = mouseY * 0.2;

    // Gentle float
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += Math.sin(time * 2 + i * 0.1) * 0.002;
    }
    pos.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();
}

// ===== HERO ANIMATION =====
function initHeroAnimation() {
  const title = document.getElementById('hero-title');
  if (!title) return;

  // Split into words
  const text = title.innerHTML;
  const words = text.split(/(\s+|<br\/>)/);
  title.innerHTML = words
    .map(w => {
      if (w === '<br/>') return '<br/>';
      if (w.trim() === '') return ' ';
      return `<span class="hero-title-word">${w}</span>`;
    })
    .join('');

  gsap.to('.hero-title-word', {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.06,
  });

  gsap.from('#hero-scroll', {
    opacity: 0,
    y: 20,
    duration: 1,
    delay: 0.8,
    ease: 'power2.out',
  });
}

// ===== MENU TOGGLE =====
function initMenu() {
  const menuBtn = document.getElementById('header-menu-btn');
  const menu = document.getElementById('fullscreen-menu');
  if (!menuBtn || !menu) return;

  let isOpen = false;

  menuBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      menu.classList.add('open');
      menuBtn.querySelector('span')!.textContent = 'Close';
      document.body.style.overflow = 'hidden';
    } else {
      menu.classList.remove('open');
      menuBtn.querySelector('span')!.textContent = 'Menu';
      document.body.style.overflow = '';
    }
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      isOpen = false;
      menu.classList.remove('open');
      menuBtn.querySelector('span')!.textContent = 'Menu';
      document.body.style.overflow = '';
    });
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  // Card reveal
  const cards = document.querySelectorAll('.card-reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach(card => observer.observe(card));

  // Parallax on about section
  gsap.to('#about-title', {
    y: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '#about',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    }
  });
}

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', () => {
  initWebGL();
  initCursor();
  initPreloader();
  initMenu();
  initScrollAnimations();
});
