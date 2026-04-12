/**
 * Antigravity Design System - Visual Logic
 * Handles GSAP animations, spatial depth, and paralax background.
 */

export const Antigravity = {
  init() {
    this.createParalaxBackground();
    this.initMouseTrack();
  },

  createParalaxBackground() {
    const bg = document.getElementById('paralax-bg');
    if (!bg) return;

    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 300 + 100;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      bg.appendChild(p);

      // Random floating movement
      gsap.to(p, {
        x: 'random(-100, 100)',
        y: 'random(-100, 100)',
        duration: 'random(10, 20)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  },

  initMouseTrack() {
    // Mouse interaction for paralax
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      
      gsap.to('.particle', {
        x: (i) => x * (i * 0.2 + 1),
        y: (i) => y * (i * 0.2 + 1),
        duration: 1,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  },

  animateEntrance(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Staggered reveal for all elements with .gsap-reveal
    const elements = container.querySelectorAll('.gsap-reveal');
    if (elements.length > 0) {
      gsap.fromTo(elements, 
        { 
          opacity: 0, 
          y: 40,
          scale: 0.95,
          filter: 'blur(10px)'
        }, 
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.8, 
          stagger: 0.1, 
          ease: 'power3.out' 
        }
      );
    }

    // Individual card entrance if needed
    const glassCards = container.querySelectorAll('.glass');
    gsap.fromTo(glassCards, 
      { opacity: 0, x: -20 }, 
      { opacity: 1, x: 0, duration: 1, stagger: 0.15, ease: 'expo.out' }
    );
  },

  initTilt(element) {
    if (!element) return;
    
    element.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = element.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      gsap.to(element, {
        rotateY: x * 10,
        rotateX: -y * 10,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  }
};
