'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface WheelCategory {
  id: string;
  label: string;
  color: string;
  imageUrl: string;
}

const categories: WheelCategory[] = [
  { id: 'wedding', label: 'Wedding', color: '#C9A84C', imageUrl: '/images/categories/wedding.jpg' },
  { id: 'portrait', label: 'Portrait', color: '#D4A5A5', imageUrl: '/images/categories/portrait.jpg' },
  { id: 'commercial', label: 'Commercial', color: '#8A8A7A', imageUrl: '/images/categories/commercial.jpg' },
  { id: 'video', label: 'Video', color: '#F5F5F0', imageUrl: '/images/categories/video.jpg' },
  { id: 'events', label: 'Events', color: '#C9A84C', imageUrl: '/images/categories/events.jpg' },
  { id: 'awards', label: 'Awards', color: '#E8C97A', imageUrl: '/images/categories/awards.jpg' },
];

export default function SpinningWheel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    wheel: THREE.Group;
    particles: THREE.Points;
    animationId: number;
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a, 1);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xc9a84c, 2, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Create wheel
    const wheel = new THREE.Group();

    // Wheel disc
    const discGeometry = new THREE.CylinderGeometry(2.5, 2.5, 0.1, 64);
    const discMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2,
    });
    const disc = new THREE.Mesh(discGeometry, discMaterial);
    disc.rotation.x = Math.PI / 2;
    wheel.add(disc);

    // Category segments
    const segmentAngle = (Math.PI * 2) / categories.length;
    categories.forEach((cat, i) => {
      const segmentGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.8);
      const segmentMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cat.color),
        metalness: 0.6,
        roughness: 0.3,
        emissive: new THREE.Color(cat.color),
        emissiveIntensity: 0.1,
      });
      const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);

      const angle = i * segmentAngle + segmentAngle / 2;
      segment.position.x = Math.cos(angle) * 1.8;
      segment.position.z = Math.sin(angle) * 1.8;
      segment.rotation.y = -angle;
      wheel.add(segment);

      // Segment label (as plane with canvas texture)
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      const ctx = labelCanvas.getContext('2d')!;
      ctx.fillStyle = cat.color;
      ctx.font = 'bold 32px Playfair Display';
      ctx.textAlign = 'center';
      ctx.fillText(cat.label.toUpperCase(), 128, 40);

      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelMaterial = new THREE.MeshBasicMaterial({
        map: labelTexture,
        transparent: true,
      });
      const labelGeometry = new THREE.PlaneGeometry(0.6, 0.15);
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.x = Math.cos(angle) * 2.6;
      label.position.z = Math.sin(angle) * 2.6;
      label.position.y = 0.06;
      label.rotation.y = -angle;
      wheel.add(label);
    });

    // Wheel ring (outer edge)
    const ringGeometry = new THREE.TorusGeometry(2.5, 0.05, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 1,
      roughness: 0.1,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    wheel.add(ring);

    wheel.rotation.x = Math.PI * 0.1;
    wheel.rotation.y = Math.PI * 0.05;
    scene.add(wheel);

    // Particles (bokeh effect)
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 15;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      particleSizes[i] = Math.random() * 0.1 + 0.02;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xc9a84c,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Store refs
    sceneRef.current = { scene, camera, renderer, wheel, particles, animationId: 0 };

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      const { scene, camera, renderer, wheel, particles } = sceneRef.current;

      // Subtle ambient rotation
      wheel.rotation.z += 0.001;
      particles.rotation.y += 0.0003;

      // Floating motion
      wheel.position.y = Math.sin(Date.now() * 0.001) * 0.1;

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.renderer.dispose();
      }
    };
  }, []);

  const spinWheel = () => {
    if (isSpinning || !sceneRef.current) return;
    setIsSpinning(true);

    const { wheel } = sceneRef.current;
    const randomRotation = Math.PI * 2 * (5 + Math.random() * 5); // 5-10 full rotations
    const finalRotation = wheel.rotation.z + randomRotation;

    gsap.to(wheel.rotation, {
      z: finalRotation,
      duration: 4,
      ease: 'power2.out',
      onUpdate: function() {
        // Deceleration effect - slower as it approaches end
        const progress = this.progress();
        if (progress > 0.7) {
          wheel.rotation.x = Math.PI * 0.1 + Math.sin(this.progress() * Math.PI) * 0.1;
        }
      },
      onComplete: () => {
        // Determine selected category
        const normalizedAngle = wheel.rotation.z % (Math.PI * 2);
        const segmentAngle = (Math.PI * 2) / categories.length;
        const selectedIndex = Math.floor((-normalizedAngle + Math.PI / 2 + segmentAngle / 2) / segmentAngle) % categories.length;
        const selected = categories[(selectedIndex + categories.length) % categories.length];
        setSelectedCategory(selected.id);
        setIsSpinning(false);

        // Haptic feedback on mobile
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        // Show content after spin
        setTimeout(() => setShowContent(true), 600);
      },
    });
  };

  return (
    <div ref={containerRef} className="wheel-container">
      <canvas ref={canvasRef} className="wheel-canvas" />

      {/* Overlay UI */}
      <div className="wheel-overlay">
        {!showContent ? (
          <>
            <div className="wheel-prompt">
              <h1 className="wheel-title">
                <span className="text-gradient">Many&apos;s</span> Photography
              </h1>
              <p className="wheel-subtitle">Spin to explore our work</p>
            </div>

            <button
              onClick={spinWheel}
              disabled={isSpinning}
              className="wheel-spin-btn btn btn-primary"
            >
              {isSpinning ? (
                <span className="spinning-text">Spinning...</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-9-9" />
                    <path d="M21 3v9h-9" />
                  </svg>
                  Spin the Wheel
                </>
              )}
            </button>

            <div className="wheel-hint">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              <span>Scroll to explore</span>
            </div>
          </>
        ) : (
          <div className="wheel-result animate-fade-in">
            <span className="wheel-result-label">You selected</span>
            <h2 className="wheel-result-title text-gradient">{selectedCategory}</h2>
            <button
              onClick={() => {
                setShowContent(false);
                setSelectedCategory(null);
              }}
              className="btn btn-outline"
            >
              Spin Again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .wheel-container {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #0a0a0a;
        }

        .wheel-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .wheel-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 10;
        }

        .wheel-overlay > * {
          pointer-events: auto;
        }

        .wheel-prompt {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .wheel-title {
          font-size: clamp(3rem, 10vw, 7rem);
          margin-bottom: var(--space-md);
          opacity: 0;
          animation: fadeInUp 1s var(--ease-out-expo) 0.3s forwards;
        }

        .wheel-subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: var(--color-text-secondary);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0;
          animation: fadeInUp 1s var(--ease-out-expo) 0.5s forwards;
        }

        .wheel-spin-btn {
          opacity: 0;
          animation: fadeInUp 1s var(--ease-out-expo) 0.7s forwards;
          padding: var(--space-lg) var(--space-2xl);
          font-size: 1rem;
        }

        .wheel-spin-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinning-text {
          animation: pulse 1s ease-in-out infinite;
        }

        .wheel-hint {
          position: absolute;
          bottom: var(--space-xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          color: var(--color-text-muted);
          font-size: 0.875rem;
          opacity: 0;
          animation: fadeIn 1s ease-out 1.2s forwards;
        }

        .wheel-result {
          text-align: center;
        }

        .wheel-result-label {
          font-size: 0.875rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--color-text-secondary);
        }

        .wheel-result-title {
          font-size: clamp(3rem, 8vw, 6rem);
          margin: var(--space-md) 0 var(--space-xl);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
