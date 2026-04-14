'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface CarouselPhoto {
  id: string;
  url: string;
  title: string;
  category: string;
}

interface CarouselCategory {
  id: string;
  label: string;
  color: string;
  photos: CarouselPhoto[];
}

interface InfinityCarouselProps {
  categories: CarouselCategory[];
}

const RING_CONFIG = [
  { radius: 4.2, tubeRadius: 0.06, rotationSpeed: 0.002, direction: 1, yPosition: -0.5, label: 'WEDDING', tilt: 0.15 },
  { radius: 3.0, tubeRadius: 0.05, rotationSpeed: 0.004, direction: -1, yPosition: 0.35, label: 'PORTRAIT', tilt: -0.1 },
  { radius: 1.8, tubeRadius: 0.04, rotationSpeed: 0.006, direction: 1, yPosition: 1.2, label: 'COMMERCIAL', tilt: 0.08 },
];

const PHOTOS_PER_TIER = 8;

export default function InfinityCarousel({ categories }: InfinityCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    rings: THREE.Group[];
    photoMeshes: Map<string, THREE.Mesh>;
    particles: THREE.Points;
    lightRays: THREE.Mesh;
    dustParticles: THREE.Points;
    animationId: number;
    isPaused: boolean;
    clock: THREE.Clock;
  } | null>(null);

  const [selectedPhoto, setSelectedPhoto] = useState<CarouselPhoto | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  // Create rich cinematic texture for photos
  const createCinematicTexture = useCallback((
    color1: string, 
    color2: string, 
    index: number,
    categoryIndex: number
  ): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;

    // Base gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 800);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.5, color2);
    gradient.addColorStop(1, color1);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // Film grain
    const imageData = ctx.getImageData(0, 0, 600, 800);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 20;
      imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + grain));
      imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + grain));
      imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + grain));
    }
    ctx.putImageData(imageData, 0, 0);

    // Light leak effect (random colored glow from corner)
    const leakColors = [
      ['rgba(201, 168, 76, 0.15)', 'rgba(212, 165, 165, 0.08)'],
      ['rgba(212, 165, 165, 0.12)', 'rgba(201, 168, 76, 0.06)'],
      ['rgba(138, 138, 122, 0.1)', 'rgba(201, 168, 76, 0.1)'],
    ];
    const leak = leakColors[categoryIndex % 3];
    const leakGradient = ctx.createRadialGradient(
      Math.random() * 200, Math.random() * 200, 0,
      Math.random() * 200, Math.random() * 200, 400
    );
    leakGradient.addColorStop(0, leak[0]);
    leakGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = leakGradient;
    ctx.fillRect(0, 0, 600, 800);

    // Vignette
    const vignetteGradient = ctx.createRadialGradient(300, 400, 100, 300, 400, 500);
    vignetteGradient.addColorStop(0, 'transparent');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, 600, 800);

    // Category label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.font = '600 14px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(`#${index + 1}`, 300, 420);

    // Subtle frame border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 580, 780);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const initScene = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Deep cinematic fog
    scene.fog = new THREE.FogExp2(0x050404, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 10);
    camera.lookAt(0, 0.2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050404);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // === LIGHTING ===

    // Main key light (warm, from upper left)
    const keyLight = new THREE.SpotLight(0xffd4a3, 3);
    keyLight.position.set(-6, 8, 4);
    keyLight.angle = 0.5;
    keyLight.penumbra = 0.8;
    keyLight.decay = 1.5;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Fill light (cool, from right)
    const fillLight = new THREE.PointLight(0x8a9ba8, 1.5, 15);
    fillLight.position.set(5, 3, 2);
    scene.add(fillLight);

    // Rim light (gold, from behind)
    const rimLight = new THREE.PointLight(0xc9a84c, 2, 12);
    rimLight.position.set(0, -2, -5);
    scene.add(rimLight);

    // Ambient
    const ambientLight = new THREE.AmbientLight(0x1a1510, 0.8);
    scene.add(ambientLight);

    // === VOLUMETRIC GOD RAYS ===
    const raysGeometry = new THREE.ConeGeometry(8, 15, 32, 1, true);
    const raysMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xffd4a3) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          float alpha = (1.0 - vUv.y) * 0.03;
          alpha *= smoothstep(0.0, 0.3, vUv.y);
          alpha *= 0.5 + 0.5 * sin(uTime * 0.5 + vUv.y * 3.0);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    const lightRays = new THREE.Mesh(raysGeometry, raysMaterial);
    lightRays.position.set(-2, 6, -2);
    lightRays.rotation.x = Math.PI;
    scene.add(lightRays);

    // === FLOATING DUST PARTICLES ===
    const dustCount = 500;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    const dustPhases = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 25;
      dustPositions[i * 3 + 1] = Math.random() * 15 - 2;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      dustSizes[i] = Math.random() * 0.06 + 0.01;
      dustPhases[i] = Math.random() * Math.PI * 2;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
    dustGeometry.setAttribute('phase', new THREE.BufferAttribute(dustPhases, 1));

    const dustMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xffd4a3) },
      },
      vertexShader: `
        attribute float size;
        attribute float phase;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.y += sin(uTime * 0.2 + phase) * 0.3;
          pos.x += cos(uTime * 0.15 + phase) * 0.2;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vAlpha = 0.3 + 0.3 * sin(uTime * 0.5 + phase);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustParticles);

    // === BOKEH BACKGROUND CIRCLES ===
    const bokehCount = 30;
    const bokehGeometry = new THREE.BufferGeometry();
    const bokehPositions = new Float32Array(bokehCount * 3);
    const bokehSizes = new Float32Array(bokehCount);

    for (let i = 0; i < bokehCount; i++) {
      bokehPositions[i * 3] = (Math.random() - 0.5) * 30;
      bokehPositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      bokehPositions[i * 3 + 2] = -5 - Math.random() * 15;
      bokehSizes[i] = Math.random() * 0.8 + 0.2;
    }

    bokehGeometry.setAttribute('position', new THREE.BufferAttribute(bokehPositions, 3));
    bokehGeometry.setAttribute('size', new THREE.BufferAttribute(bokehSizes, 1));

    const bokehMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vAlpha = 0.1 + 0.05 * sin(uTime * 0.3 + position.x);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
          gl_FragColor = vec4(1.0, 0.85, 0.6, alpha);
        }
      `,
    });
    const bokeh = new THREE.Points(bokehGeometry, bokehMaterial);
    scene.add(bokeh);

    // === GROUND PLANE WITH GLOW ===
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(0xc9a84c) },
        uColor2: { value: new THREE.Color(0xd4a5a5) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;
        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float pulse = 0.5 + 0.5 * sin(uTime * 0.5 - dist * 3.0);
          float alpha = smoothstep(0.5, 0.0, dist) * 0.15 * pulse;
          vec3 color = mix(uColor1, uColor2, vUv.y);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    scene.add(ground);

    // === RINGS ===
    const rings: THREE.Group[] = [];
    const photoMeshes = new Map<string, THREE.Mesh>();
    const photoGroups: THREE.Group[] = [];

    RING_CONFIG.forEach((config, tierIndex) => {
      const tierGroup = new THREE.Group();
      tierGroup.position.y = config.yPosition;
      tierGroup.rotation.x = config.tilt;

      const category = categories[tierIndex];
      const tierPhotos = category?.photos || [];
      const ringColor = new THREE.Color(category?.color || '#c9a84c');

      // Outer glow ring
      const glowGeometry = new THREE.TorusGeometry(config.radius + 0.2, config.tubeRadius * 3, 8, 100);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.08,
      });
      const glowRing = new THREE.Mesh(glowGeometry, glowMaterial);
      glowRing.rotation.x = Math.PI / 2;
      tierGroup.add(glowRing);

      // Secondary glow
      const glow2Geometry = new THREE.TorusGeometry(config.radius + 0.35, config.tubeRadius * 6, 8, 100);
      const glow2Material = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.04,
      });
      const glow2Ring = new THREE.Mesh(glow2Geometry, glow2Material);
      glow2Ring.rotation.x = Math.PI / 2;
      tierGroup.add(glow2Ring);

      // Main ring with custom material
      const ringGeometry = new THREE.TorusGeometry(config.radius, config.tubeRadius, 20, 150);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: ringColor,
        metalness: 0.85,
        roughness: 0.15,
        emissive: ringColor,
        emissiveIntensity: 0.15,
      });
      const mainRing = new THREE.Mesh(ringGeometry, ringMaterial);
      mainRing.rotation.x = Math.PI / 2;
      mainRing.castShadow = true;
      tierGroup.add(mainRing);

      // Inner accent ring
      const innerRingGeometry = new THREE.TorusGeometry(config.radius - 0.15, config.tubeRadius * 0.5, 12, 100);
      const innerRingMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.4,
      });
      const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial);
      innerRing.rotation.x = Math.PI / 2;
      tierGroup.add(innerRing);

      // Photo group
      const photoGroup = new THREE.Group();
      photoGroup.userData = { tierIndex, config };

      const photosToShow = tierPhotos.length > 0 ? tierPhotos.slice(0, PHOTOS_PER_TIER) : [];
      const angleStep = (Math.PI * 2) / PHOTOS_PER_TIER;

      photosToShow.forEach((photo, photoIndex) => {
        const angle = photoIndex * angleStep;

        const photoWidth = 1.0;
        const photoHeight = 1.35;
        const geometry = new THREE.PlaneGeometry(photoWidth, photoHeight);

        // Create cinematic texture
        const texture = createCinematicTexture(
          tierIndex === 0 ? '#1a1510' : tierIndex === 1 ? '#1a1015' : '#10151a',
          tierIndex === 0 ? '#2a2015' : tierIndex === 1 ? '#251520' : '#152025',
          photoIndex,
          tierIndex
        );

        const material = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.05,
          roughness: 0.7,
          emissive: new THREE.Color(category?.color || '#c9a84c'),
          emissiveIntensity: 0.03,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
        });

        const photoMesh = new THREE.Mesh(geometry, material);
        photoMesh.userData = { photo, tierIndex, photoIndex, angle };

        // Position on ring
        const r = config.radius * 0.92;
        photoMesh.position.x = Math.cos(angle) * r;
        photoMesh.position.z = Math.sin(angle) * r;
        photoMesh.rotation.y = -angle + Math.PI / 2;
        photoMesh.userData.floatOffset = Math.random() * Math.PI * 2;
        photoMesh.userData.originalScale = 1;

        photoGroup.add(photoMesh);
        photoMeshes.set(photo.id, photoMesh);
      });

      tierGroup.add(photoGroup);
      rings.push(tierGroup);
      photoGroups.push(photoGroup);
      scene.add(tierGroup);
    });

    // Store refs
    sceneRef.current = {
      scene,
      camera,
      renderer,
      rings,
      photoMeshes,
      particles: bokeh,
      lightRays,
      dustParticles,
      animationId: 0,
      isPaused: false,
      clock: new THREE.Clock(),
    };

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      const { scene, camera, renderer, rings, photoMeshes, particles, lightRays, dustParticles, isPaused, clock } = sceneRef.current;

      const elapsed = clock.getElapsedTime();

      if (!isPaused) {
        // Rotate rings
        rings.forEach((ring, tierIndex) => {
          const config = RING_CONFIG[tierIndex];
          ring.rotation.y += config.rotationSpeed * config.direction;

          // Floating motion
          ring.position.y = config.yPosition + Math.sin(elapsed * 0.4 + tierIndex * 1.2) * 0.08;

          // Gentle tilt oscillation
          ring.rotation.x = config.tilt + Math.sin(elapsed * 0.3 + tierIndex) * 0.02;
        });

        // Update shader uniforms
        (lightRays.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
        (dustParticles.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
        (particles.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;

        // Ground glow pulse
        const groundMesh = scene.children.find(c => c instanceof THREE.Mesh && c !== lightRays) as THREE.Mesh;
        if (groundMesh && groundMesh.material instanceof THREE.ShaderMaterial) {
          groundMesh.material.uniforms.uTime.value = elapsed;
        }
      }

      // Camera subtle movement following mouse
      if (sceneRef.current && containerRef.current) {
        const targetX = mousePos.x * 0.5;
        const targetY = 1.5 + mousePos.y * 0.3;
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (targetY - camera.position.y) * 0.02;
        camera.lookAt(0, 0.2, 0);
      }

      // Photo hover effects
      photoMeshes.forEach((mesh, id) => {
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (hoveredPhoto === id) {
          gsap.to(mesh.scale, { x: 1.15, y: 1.15, duration: 0.4, ease: 'power2.out' });
          gsap.to(material, { emissiveIntensity: 0.15, duration: 0.4 });
        } else {
          gsap.to(mesh.scale, { x: 1, y: 1, duration: 0.4, ease: 'power2.out' });
          gsap.to(material, { emissiveIntensity: 0.03, duration: 0.4 });
        }
      });

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePos({ x: x * 2, y: y * 1.5 });
    };

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || !sceneRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const allPhotos = Array.from(photoMeshes.values());
      const intersects = raycaster.intersectObjects(allPhotos);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit.userData.photo) setSelectedPhoto(hit.userData.photo);
      }
    };

    const handleMouseMoveInteraction = (e: MouseEvent) => {
      handleMouseMove(e);
      if (!containerRef.current || !sceneRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const allPhotos = Array.from(photoMeshes.values());
      const intersects = raycaster.intersectObjects(allPhotos);
      setHoveredPhoto(intersects.length > 0 ? (intersects[0].object as THREE.Mesh).userData.photo?.id || null : null);
      if (containerRef.current) {
        containerRef.current.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
      }
    };

    const handleMouseEnter = () => { if (sceneRef.current) sceneRef.current.isPaused = true; };
    const handleMouseLeave = () => {
      if (sceneRef.current) sceneRef.current.isPaused = false;
      setHoveredPhoto(null);
    };

    containerRef.current.addEventListener('mousemove', handleMouseMoveInteraction);
    containerRef.current.addEventListener('click', handleClick);
    containerRef.current.addEventListener('mouseenter', handleMouseEnter);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave);

    setIsLoaded(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMoveInteraction);
        containerRef.current.removeEventListener('click', handleClick);
        containerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.renderer.dispose();
      }
    };
  }, [categories, createCinematicTexture, hoveredPhoto, mousePos]);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#050404', cursor: 'grab' }}>

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', inset: 0 }} />

      {/* Film grain overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        mixBlendMode: 'overlay',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 6,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* Light leak flash effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 4,
        background: 'radial-gradient(ellipse at 20% 0%, rgba(201,168,76,0.03) 0%, transparent 50%)',
      }} />

      {/* Category Labels */}
      {RING_CONFIG.map((config, i) => (
        <div key={config.label} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, calc(-50% + ${(config.yPosition + 2.8) * 45}px))`,
          zIndex: 10,
          pointerEvents: 'none',
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.4em',
            color: categories[i]?.color || '#c9a84c',
            opacity: 0.6,
            textTransform: 'uppercase',
            textShadow: `0 0 20px ${categories[i]?.color || '#c9a84c'}40`,
          }}>
            {config.label}
          </span>
        </div>
      ))}

      {/* Loading */}
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050404',
          zIndex: 50,
        }}>
          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.25rem',
            color: '#c9a84c',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            Preparing your experience...
          </div>
        </div>
      )}

      {/* Brand */}
      <div style={{
        position: 'absolute',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 20,
        pointerEvents: 'none',
      }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
          color: '#f5f5f0',
          marginBottom: '0.3rem',
          letterSpacing: '0.05em',
          textShadow: '0 4px 40px rgba(0,0,0,0.9)',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1s ease-out 0.5s',
        }}>
          <span style={{ color: '#c9a84c' }}>Many&apos;s</span> Photography
        </h1>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 'clamp(0.6rem, 1.5vw, 0.8rem)',
          color: 'rgba(245,245,240,0.5)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          textShadow: '0 2px 20px rgba(0,0,0,0.8)',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1s ease-out 0.8s',
        }}>
          Capturing moments that become memories
        </p>
      </div>

      {/* Interaction hint */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        pointerEvents: 'none',
        opacity: isLoaded ? 0.4 : 0,
        transition: 'opacity 0.5s',
      }}>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.7rem',
          color: '#f5f5f0',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          Hover to pause · Click to explore
        </p>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div onClick={() => setSelectedPhoto(null)} style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'none',
              border: 'none',
              color: '#f5f5f0',
              fontSize: '2.5rem',
              cursor: 'pointer',
              zIndex: 10,
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ×
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '55vw',
            maxHeight: '65vh',
            aspectRatio: '4/5',
            position: 'relative',
            borderRadius: '2px',
            overflow: 'hidden',
            boxShadow: '0 0 80px rgba(201,168,76,0.15), 0 30px 80px rgba(0,0,0,0.6)',
          }}>
            {/* Placeholder */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${selectedPhoto.category === 'Wedding' ? '#1a1510' : selectedPhoto.category === 'Portrait' ? '#1a1015' : '#10151a'} 0%, ${selectedPhoto.category === 'Wedding' ? '#2a2015' : selectedPhoto.category === 'Portrait' ? '#251520' : '#152025'} 100%)`,
            }} />
            {/* Content overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: selectedPhoto.category === 'Wedding' ? '#c9a84c' : selectedPhoto.category === 'Portrait' ? '#d4a5a5' : '#8a8a7a',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                {selectedPhoto.category}
              </span>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                color: '#f5f5f0',
                textAlign: 'center',
                padding: '0 20px',
              }}>
                {selectedPhoto.title}
              </span>
            </div>
          </div>
          <p style={{
            position: 'absolute',
            bottom: '30px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.8rem',
            color: 'rgba(245,245,240,0.4)',
          }}>
            Click anywhere to close
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
