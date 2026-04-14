'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
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
  { radius: 4.4, tubeRadius: 0.045, rotationSpeed: 0.0018, direction: 1, yPosition: -0.6, label: 'WEDDING', tilt: 0.12 },
  { radius: 3.1, tubeRadius: 0.038, rotationSpeed: 0.0032, direction: -1, yPosition: 0.4, label: 'PORTRAIT', tilt: -0.08 },
  { radius: 1.85, tubeRadius: 0.032, rotationSpeed: 0.005, direction: 1, yPosition: 1.35, label: 'COMMERCIAL', tilt: 0.06 },
];

const PHOTOS_PER_TIER = 8;

// Create a photorealistic film photo card
function createFilmPhotoCard(
  categoryIndex: number,
  photoIndex: number,
  size = 512
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size * 1.35;
  const ctx = canvas.getContext('2d')!;
  const W = canvas.width;
  const H = canvas.height;

  // === FILM BASE ===
  // Dark film base color
  ctx.fillStyle = '#0d0b09';
  ctx.fillRect(0, 0, W, H);

  // === EXPOSURE SIMULATION ===
  // Random exposure variation per photo
  const exposureVar = (Math.random() - 0.5) * 0.3;
  const contrast = 1.0 + (Math.random() - 0.5) * 0.15;
  const warmth = Math.random(); // 0 = cool, 1 = warm

  // === PHOTO CONTENT - Cinematic scenes ===
  const sceneTypes = [
    // Wedding
    [
      // Scene 1: Golden hour couple silhouette
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H * 0.7);
        g.addColorStop(0, `rgba(${180 + exposureVar * 50}, ${120 + exposureVar * 30}, ${60 + exposureVar * 20}, 1)`);
        g.addColorStop(0.5, `rgba(${200 + exposureVar * 40}, ${140 + exposureVar * 30}, ${80 + exposureVar * 20}, 1)`);
        g.addColorStop(1, `rgba(${160 + exposureVar * 30}, ${100 + exposureVar * 20}, ${50 + exposureVar * 15}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Sun glow
        const sun = ctx.createRadialGradient(W * 0.7, H * 0.15, 5, W * 0.7, H * 0.15, H * 0.35);
        sun.addColorStop(0, `rgba(255, ${200 + warmth * 40}, ${120 + warmth * 30}, 0.9)`);
        sun.addColorStop(0.3, `rgba(255, ${180 + warmth * 30}, ${100 + warmth * 20}, 0.4)`);
        sun.addColorStop(1, 'rgba(255, 150, 80, 0)');
        ctx.fillStyle = sun;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Silhouette couple
        ctx.fillStyle = 'rgba(20, 15, 10, 0.85)';
        ctx.beginPath();
        ctx.ellipse(W * 0.45, H * 0.62, 35, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(W * 0.52, H * 0.58, 28, 10, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // Dress detail
        ctx.fillStyle = 'rgba(40, 30, 25, 0.9)';
        ctx.beginPath();
        ctx.moveTo(W * 0.45 - 30, H * 0.62);
        ctx.lineTo(W * 0.45 - 50, H * 0.68);
        ctx.lineTo(W * 0.45 + 45, H * 0.68);
        ctx.lineTo(W * 0.45 + 30, H * 0.62);
        ctx.closePath();
        ctx.fill();
      },
      // Scene 2: Rings on vintage book
      () => {
        ctx.fillStyle = '#1a1510';
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Velvet background texture
        for (let i = 0; i < 200; i++) {
          ctx.fillStyle = `rgba(${30 + Math.random() * 20}, ${20 + Math.random() * 10}, ${15 + Math.random() * 10}, 0.3)`;
          ctx.fillRect(Math.random() * W, Math.random() * H * 0.7, 2, 2);
        }
        // Vintage paper
        ctx.fillStyle = '#e8dfd0';
        ctx.fillRect(W * 0.25, H * 0.35, W * 0.5, H * 0.25);
        // Gold ring
        const ringG = ctx.createRadialGradient(W * 0.5, H * 0.47, 2, W * 0.5, H * 0.47, 28);
        ringG.addColorStop(0, '#f5e6c0');
        ringG.addColorStop(0.3, '#c9a84c');
        ringG.addColorStop(0.7, '#8a6a2a');
        ringG.addColorStop(1, '#4a3a1a');
        ctx.fillStyle = ringG;
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.47, 22, 0, Math.PI * 2);
        ctx.arc(W * 0.5, H * 0.47, 15, 0, Math.PI * 2, true);
        ctx.fill();
        // Ring highlight
        ctx.strokeStyle = 'rgba(255, 240, 200, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W * 0.5 - 5, H * 0.47 - 5, 10, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
      },
      // Scene 3: Bridal bouquet close-up
      () => {
        const g = ctx.createRadialGradient(W * 0.5, H * 0.4, 10, W * 0.5, H * 0.4, H * 0.4);
        g.addColorStop(0, `rgba(${240 + exposureVar * 15}, ${230 + exposureVar * 20}, ${220 + exposureVar * 15}, 1)`);
        g.addColorStop(0.4, `rgba(${200 + exposureVar * 20}, ${170 + exposureVar * 20}, ${140 + exposureVar * 15}, 1)`);
        g.addColorStop(1, `rgba(${120 + exposureVar * 15}, ${80 + exposureVar * 15}, ${60 + exposureVar * 10}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Flower petals
        const flowerColors = ['#f8e8e0', '#f0d8d0', '#e8c8b8', '#f0e0d8', '#f8e0e8'];
        for (let i = 0; i < 25; i++) {
          const fx = W * 0.3 + Math.random() * W * 0.4;
          const fy = H * 0.25 + Math.random() * H * 0.4;
          const fr = 15 + Math.random() * 25;
          ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
          ctx.beginPath();
          ctx.ellipse(fx, fy, fr, fr * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
        // Ribbon
        ctx.fillStyle = '#c9a84c';
        ctx.fillRect(W * 0.3, H * 0.6, W * 0.4, 8);
      },
      // Scene 4: First dance with warm uplighting
      () => {
        const g = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.7);
        g.addColorStop(0, `rgba(${40 + exposureVar * 15}, ${30 + exposureVar * 10}, ${20 + exposureVar * 8}, 1)`);
        g.addColorStop(1, `rgba(${80 + exposureVar * 20}, ${50 + exposureVar * 15}, ${30 + exposureVar * 10}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Warm uplighting pools
        for (let i = 0; i < 5; i++) {
          const up = ctx.createRadialGradient(
            W * 0.2 + i * W * 0.15, H * 0.7, 2,
            W * 0.2 + i * W * 0.15, H * 0.7, 80
          );
          up.addColorStop(0, `rgba(255, ${180 + warmth * 50}, ${80 + warmth * 30}, 0.5)`);
          up.addColorStop(1, 'rgba(255, 150, 60, 0)');
          ctx.fillStyle = up;
          ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        }
        // Couple silhouette
        ctx.fillStyle = 'rgba(15, 12, 8, 0.9)';
        ctx.beginPath();
        ctx.ellipse(W * 0.5, H * 0.45, 50, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(W * 0.48, H * 0.38, 25, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();
      },
      // Scene 5: Church aisle with light beams
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${60 + exposureVar * 20}, ${50 + exposureVar * 15}, ${40 + exposureVar * 10}, 1)`);
        g.addColorStop(0.5, `rgba(${140 + exposureVar * 30}, ${110 + exposureVar * 25}, ${80 + exposureVar * 20}, 1)`);
        g.addColorStop(1, `rgba(${200 + exposureVar * 25}, ${160 + exposureVar * 30}, ${100 + exposureVar * 25}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Light beams through windows
        for (let i = 0; i < 4; i++) {
          const beam = ctx.createLinearGradient(W * 0.2 + i * W * 0.2, 0, W * 0.3 + i * W * 0.2, H * 0.7);
          beam.addColorStop(0, `rgba(255, 240, 200, ${0.15 + exposureVar * 0.05})`);
          beam.addColorStop(1, 'rgba(255, 220, 160, 0)');
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(W * 0.15 + i * W * 0.22, 20);
          ctx.lineTo(W * 0.25 + i * W * 0.22, 20);
          ctx.lineTo(W * 0.4 + i * W * 0.15, H * 0.7);
          ctx.lineTo(W * 0.3 + i * W * 0.15, H * 0.7);
          ctx.closePath();
          ctx.fill();
        }
        // Aisle
        ctx.fillStyle = 'rgba(100, 80, 60, 0.4)';
        ctx.fillRect(W * 0.4, H * 0.4, W * 0.2, H * 0.3 - 20);
      },
      // Scene 6: Sunset ceremony silhouette
      () => {
        const g = ctx.createLinearGradient(0, H * 0.2, 0, H * 0.7);
        g.addColorStop(0, `rgba(${255 - exposureVar * 30}, ${120 + exposureVar * 20}, ${60 + exposureVar * 15}, 1)`);
        g.addColorStop(0.4, `rgba(${255 - exposureVar * 20}, ${80 + exposureVar * 15}, ${40 + exposureVar * 10}, 1)`);
        g.addColorStop(1, `rgba(${40 + exposureVar * 10}, ${25 + exposureVar * 8}, ${15 + exposureVar * 5}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Horizon glow
        const horiz = ctx.createRadialGradient(W * 0.5, H * 0.55, 5, W * 0.5, H * 0.55, H * 0.5);
        horiz.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
        horiz.addColorStop(0.5, 'rgba(255, 150, 60, 0.2)');
        horiz.addColorStop(1, 'rgba(255, 100, 40, 0)');
        ctx.fillStyle = horiz;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Couple silhouette
        ctx.fillStyle = 'rgba(10, 8, 5, 0.95)';
        ctx.beginPath();
        ctx.ellipse(W * 0.5, H * 0.58, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      },
      // Scene 7: Wedding details flat lay
      () => {
        ctx.fillStyle = '#f5f0eb';
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Linen texture
        for (let i = 0; i < 500; i++) {
          ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.03})`;
          ctx.beginPath();
          ctx.moveTo(Math.random() * W, Math.random() * H * 0.7);
          ctx.lineTo(Math.random() * W, Math.random() * H * 0.7);
          ctx.stroke();
        }
        // Invitation
        ctx.fillStyle = '#f8f4ef';
        ctx.fillRect(W * 0.15, H * 0.25, W * 0.35, H * 0.2);
        ctx.fillStyle = '#c9a84c';
        ctx.font = `${12 * contrast}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('SAVE THE DATE', W * 0.325, H * 0.35);
        // Wax seal
        const seal = ctx.createRadialGradient(W * 0.75, H * 0.35, 2, W * 0.75, H * 0.35, 20);
        seal.addColorStop(0, '#8a2020');
        seal.addColorStop(1, '#4a1010');
        ctx.fillStyle = seal;
        ctx.beginPath();
        ctx.arc(W * 0.75, H * 0.35, 18, 0, Math.PI * 2);
        ctx.fill();
        // String
        ctx.strokeStyle = '#c9a84c';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(W * 0.75, H * 0.35 + 18);
        ctx.quadraticCurveTo(W * 0.5, H * 0.5, W * 0.5, H * 0.3);
        ctx.stroke();
      },
      // Scene 8: Grand exit with sparklers
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${30 + exposureVar * 10}, ${25 + exposureVar * 8}, ${20 + exposureVar * 6}, 1)`);
        g.addColorStop(1, `rgba(${50 + exposureVar * 15}, ${35 + exposureVar * 10}, ${25 + exposureVar * 8}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Sparkler sparks
        for (let s = 0; s < 8; s++) {
          const sx = W * 0.2 + Math.random() * W * 0.6;
          const sy = H * 0.2 + Math.random() * H * 0.35;
          for (let i = 0; i < 20; i++) {
            const spark = ctx.createRadialGradient(sx, sy, 0, sx, sy, 15 + Math.random() * 20);
            spark.addColorStop(0, `rgba(255, ${220 + Math.random() * 35}, ${100 + Math.random() * 50}, ${0.5 + Math.random() * 0.5})`);
            spark.addColorStop(1, 'rgba(255, 200, 80, 0)');
            ctx.fillStyle = spark;
            ctx.fillRect(sx - 30, sy - 30, 60, 60);
          }
        }
        // Warm bokeh
        for (let i = 0; i < 15; i++) {
          const bx = Math.random() * W;
          const by = Math.random() * H * 0.7;
          const br = 5 + Math.random() * 30;
          const bokeh = ctx.createRadialGradient(bx, by, 0, bx, by, br);
          bokeh.addColorStop(0, `rgba(255, ${200 + Math.random() * 40}, ${100 + Math.random() * 60}, ${0.1 + Math.random() * 0.15})`);
          bokeh.addColorStop(1, 'rgba(255, 180, 80, 0)');
          ctx.fillStyle = bokeh;
          ctx.fillRect(bx - br, by - br, br * 2, br * 2);
        }
      },
    ],
    // Portrait
    [
      // Portrait 1: Moody environmental portrait
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${60 + exposureVar * 15}, ${50 + exposureVar * 12}, ${45 + exposureVar * 10}, 1)`);
        g.addColorStop(0.6, `rgba(${40 + exposureVar * 10}, ${35 + exposureVar * 8}, ${30 + exposureVar * 6}, 1)`);
        g.addColorStop(1, `rgba(${20 + exposureVar * 8}, ${18 + exposureVar * 6}, ${15 + exposureVar * 5}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Dramatic side light
        const light = ctx.createLinearGradient(0, H * 0.2, W, H * 0.8);
        light.addColorStop(0, `rgba(255, 220, 180, ${0.2 + exposureVar * 0.05})`);
        light.addColorStop(0.4, 'rgba(255, 200, 150, 0.05)');
        light.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = light;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Subject hint
        ctx.fillStyle = 'rgba(80, 65, 55, 0.3)';
        ctx.beginPath();
        ctx.ellipse(W * 0.4, H * 0.55, 50, 80, -0.1, 0, Math.PI * 2);
        ctx.fill();
      },
      // Portrait 2: High-key beauty
      () => {
        const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 10, W * 0.5, H * 0.35, H * 0.5);
        g.addColorStop(0, `rgba(${250 + exposureVar * 5}, ${245 + exposureVar * 8}, ${240 + exposureVar * 5}, 1)`);
        g.addColorStop(0.5, `rgba(${230 + exposureVar * 8}, ${220 + exposureVar * 10}, ${210 + exposureVar * 8}, 1)`);
        g.addColorStop(1, `rgba(${180 + exposureVar * 10}, ${170 + exposureVar * 10}, ${160 + exposureVar * 8}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Soft fill
        const fill = ctx.createRadialGradient(W * 0.5, H * 0.3, 5, W * 0.5, H * 0.3, H * 0.5);
        fill.addColorStop(0, 'rgba(255, 250, 245, 0.5)');
        fill.addColorStop(1, 'rgba(255, 250, 245, 0)');
        ctx.fillStyle = fill;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
      },
      // Portrait 3: Cinematic noir
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${15 + exposureVar * 5}, ${12 + exposureVar * 4}, ${10 + exposureVar * 3}, 1)`);
        g.addColorStop(1, `rgba(${30 + exposureVar * 8}, ${20 + exposureVar * 6}, ${15 + exposureVar * 5}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Single rim light
        const rim = ctx.createLinearGradient(W, H * 0.2, W * 0.3, H * 0.8);
        rim.addColorStop(0, `rgba(180, 200, 220, ${0.3 + exposureVar * 0.1})`);
        rim.addColorStop(1, 'rgba(100, 130, 160, 0)');
        ctx.fillStyle = rim;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Shadow face hint
        ctx.fillStyle = 'rgba(40, 35, 30, 0.4)';
        ctx.beginPath();
        ctx.ellipse(W * 0.45, H * 0.5, 45, 70, 0.1, 0, Math.PI * 2);
        ctx.fill();
      },
      // Portrait 4: Golden hour outdoors
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H * 0.7);
        g.addColorStop(0, `rgba(${100 + exposureVar * 30}, ${150 + exposureVar * 30}, ${200 + exposureVar * 20}, 1)`);
        g.addColorStop(0.5, `rgba(${200 + exposureVar * 35}, ${150 + exposureVar * 25}, ${80 + exposureVar * 20}, 1)`);
        g.addColorStop(1, `rgba(${255 - exposureVar * 15}, ${180 + exposureVar * 20}, ${100 + exposureVar * 15}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Subject silhouette
        ctx.fillStyle = 'rgba(30, 20, 15, 0.6)';
        ctx.beginPath();
        ctx.ellipse(W * 0.5, H * 0.55, 40, 65, 0, 0, Math.PI * 2);
        ctx.fill();
      },
      // Portrait 5: Studio beauty light
      () => {
        ctx.fillStyle = `rgba(${200 + exposureVar * 20}, ${195 + exposureVar * 18}, ${190 + exposureVar * 15}, 1)`;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Beauty dish highlight
        const bh = ctx.createRadialGradient(W * 0.45, H * 0.25, 2, W * 0.45, H * 0.25, H * 0.4);
        bh.addColorStop(0, `rgba(255, 250, 245, ${0.6 + exposureVar * 0.1})`);
        bh.addColorStop(0.3, 'rgba(255, 245, 235, 0.2)');
        bh.addColorStop(1, 'rgba(200, 195, 190, 0)');
        ctx.fillStyle = bh;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
      },
      // Portrait 6: Editorial fashion
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${40 + exposureVar * 12}, ${35 + exposureVar * 10}, ${32 + exposureVar * 8}, 1)`);
        g.addColorStop(0.5, `rgba(${80 + exposureVar * 15}, ${70 + exposureVar * 12}, ${65 + exposureVar * 10}, 1)`);
        g.addColorStop(1, `rgba(${20 + exposureVar * 8}, ${18 + exposureVar * 6}, ${15 + exposureVar * 5}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Fashion light
        const fl = ctx.createRadialGradient(W * 0.6, H * 0.2, 2, W * 0.6, H * 0.2, H * 0.5);
        fl.addColorStop(0, `rgba(255, 240, 220, ${0.25 + exposureVar * 0.08})`);
        fl.addColorStop(1, 'rgba(255, 220, 180, 0)');
        ctx.fillStyle = fl;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Figure
        ctx.fillStyle = 'rgba(60, 50, 45, 0.35)';
        ctx.beginPath();
        ctx.moveTo(W * 0.4, H * 0.2);
        ctx.lineTo(W * 0.55, H * 0.2);
        ctx.lineTo(W * 0.6, H * 0.7);
        ctx.lineTo(W * 0.35, H * 0.7);
        ctx.closePath();
        ctx.fill();
      },
      // Portrait 7: Intimate close-up
      () => {
        const g = ctx.createRadialGradient(W * 0.5, H * 0.4, 5, W * 0.5, H * 0.4, H * 0.5);
        g.addColorStop(0, `rgba(${220 + exposureVar * 20}, ${180 + exposureVar * 20}, ${160 + exposureVar * 15}, 1)`);
        g.addColorStop(0.5, `rgba(${160 + exposureVar * 15}, ${120 + exposureVar * 15}, ${100 + exposureVar * 12}, 1)`);
        g.addColorStop(1, `rgba(${80 + exposureVar * 10}, ${60 + exposureVar * 8}, ${50 + exposureVar * 6}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Warm catchlights
        const cl = ctx.createRadialGradient(W * 0.4, H * 0.3, 2, W * 0.4, H * 0.3, 30);
        cl.addColorStop(0, 'rgba(255, 240, 220, 0.4)');
        cl.addColorStop(1, 'rgba(255, 230, 200, 0)');
        ctx.fillStyle = cl;
        ctx.fillRect(W * 0.2, H * 0.15, W * 0.4, H * 0.35);
      },
      // Portrait 8: Urban street style
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${80 + exposureVar * 20}, ${90 + exposureVar * 18}, ${100 + exposureVar * 15}, 1)`);
        g.addColorStop(0.4, `rgba(${60 + exposureVar * 15}, ${70 + exposureVar * 15}, ${80 + exposureVar * 12}, 1)`);
        g.addColorStop(1, `rgba(${30 + exposureVar * 10}, ${35 + exposureVar * 10}, ${40 + exposureVar * 8}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Neon reflections
        const neon = ctx.createLinearGradient(0, H * 0.5, W, H * 0.3);
        neon.addColorStop(0, 'rgba(255, 100, 150, 0.15)');
        neon.addColorStop(0.5, 'rgba(100, 200, 255, 0.1)');
        neon.addColorStop(1, 'rgba(255, 200, 100, 0.12)');
        ctx.fillStyle = neon;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Puddid reflection
        ctx.fillStyle = 'rgba(60, 70, 80, 0.3)';
        ctx.fillRect(20, H * 0.6, W - 40, H * 0.1 - 10);
      },
    ],
    // Commercial
    [
      // Commercial 1: Product hero on clean background
      () => {
        const bg = ctx.createRadialGradient(W * 0.5, H * 0.4, 5, W * 0.5, H * 0.4, H * 0.5);
        bg.addColorStop(0, `rgba(${245 + exposureVar * 10}, ${245 + exposureVar * 10}, ${245 + exposureVar * 10}, 1)`);
        bg.addColorStop(1, `rgba(${220 + exposureVar * 15}, ${220 + exposureVar * 15}, ${220 + exposureVar * 15}, 1)`);
        ctx.fillStyle = bg;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Product
        const prod = ctx.createLinearGradient(W * 0.35, H * 0.25, W * 0.65, H * 0.65);
        prod.addColorStop(0, `rgba(${200 + exposureVar * 15}, ${180 + exposureVar * 15}, ${160 + exposureVar * 12}, 1)`);
        prod.addColorStop(1, `rgba(${120 + exposureVar * 12}, ${100 + exposureVar * 10}, ${80 + exposureVar * 8}, 1)`);
        ctx.fillStyle = prod;
        ctx.beginPath();
        ctx.roundRect(W * 0.3, H * 0.3, W * 0.4, H * 0.3, 8);
        ctx.fill();
        // Reflection
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.beginPath();
        ctx.ellipse(W * 0.5, H * 0.65, W * 0.2, H * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
      },
      // Commercial 2: Food photography
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${60 + exposureVar * 15}, ${45 + exposureVar * 12}, ${35 + exposureVar * 10}, 1)`);
        g.addColorStop(0.5, `rgba(${80 + exposureVar * 18}, ${60 + exposureVar * 15}, ${45 + exposureVar * 12}, 1)`);
        g.addColorStop(1, `rgba(${40 + exposureVar * 10}, ${30 + exposureVar * 8}, ${22 + exposureVar * 6}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Steam
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(W * 0.3 + i * W * 0.1, H * 0.5);
          ctx.bezierCurveTo(W * 0.25 + i * W * 0.1, H * 0.4, W * 0.35 + i * W * 0.1, H * 0.35, W * 0.3 + i * W * 0.1, H * 0.25);
          ctx.stroke();
        }
        // Plate
        ctx.fillStyle = '#f5f0eb';
        ctx.beginPath();
        ctx.ellipse(W * 0.5, H * 0.55, 80, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${180 + exposureVar * 20}, ${120 + exposureVar * 20}, ${60 + exposureVar * 15}, 1)`;
        ctx.beginPath();
        ctx.ellipse(W * 0.5, H * 0.52, 60, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      },
      // Commercial 3: Fashion editorial
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${250 + exposureVar * 5}, ${248 + exposureVar * 5}, ${245 + exposureVar * 5}, 1)`);
        g.addColorStop(1, `rgba(${220 + exposureVar * 10}, ${215 + exposureVar * 10}, ${210 + exposureVar * 8}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Model silhouette
        ctx.fillStyle = 'rgba(180, 160, 140, 0.4)';
        ctx.beginPath();
        ctx.moveTo(W * 0.4, H * 0.2);
        ctx.lineTo(W * 0.6, H * 0.2);
        ctx.lineTo(W * 0.65, H * 0.75);
        ctx.lineTo(W * 0.35, H * 0.75);
        ctx.closePath();
        ctx.fill();
        // Accent
        ctx.fillStyle = '#c9a84c';
        ctx.fillRect(W * 0.35, H * 0.45, W * 0.3, 4);
      },
      // Commercial 4: Interior / architecture
      () => {
        const g = ctx.createLinearGradient(0, H * 0.3, 0, H * 0.7);
        g.addColorStop(0, `rgba(${180 + exposureVar * 25}, ${190 + exposureVar * 22}, ${200 + exposureVar * 18}, 1)`);
        g.addColorStop(0.5, `rgba(${140 + exposureVar * 20}, ${150 + exposureVar * 20}, ${160 + exposureVar * 15}, 1)`);
        g.addColorStop(1, `rgba(${80 + exposureVar * 15}, ${90 + exposureVar * 15}, ${100 + exposureVar * 12}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Window light
        const win = ctx.createLinearGradient(W * 0.6, 0, W * 0.3, H * 0.7);
        win.addColorStop(0, 'rgba(255, 250, 230, 0.4)');
        win.addColorStop(1, 'rgba(255, 250, 230, 0)');
        ctx.fillStyle = win;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Furniture hint
        ctx.fillStyle = 'rgba(100, 80, 60, 0.25)';
        ctx.fillRect(W * 0.2, H * 0.55, W * 0.25, H * 0.1);
      },
      // Commercial 5: Lifestyle / brand story
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${120 + exposureVar * 25}, ${160 + exposureVar * 30}, ${200 + exposureVar * 25}, 1)`);
        g.addColorStop(0.5, `rgba(${200 + exposureVar * 30}, ${180 + exposureVar * 25}, ${140 + exposureVar * 20}, 1)`);
        g.addColorStop(1, `rgba(${255 - exposureVar * 15}, ${180 + exposureVar * 20}, ${100 + exposureVar * 15}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Warm light overlay
        const warm = ctx.createRadialGradient(W * 0.7, H * 0.3, 2, W * 0.7, H * 0.3, H * 0.4);
        warm.addColorStop(0, `rgba(255, 200, 120, ${0.3 + exposureVar * 0.08})`);
        warm.addColorStop(1, 'rgba(255, 180, 100, 0)');
        ctx.fillStyle = warm;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
      },
      // Commercial 6: Corporate headshot style
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${180 + exposureVar * 20}, ${190 + exposureVar * 18}, ${200 + exposureVar * 15}, 1)`);
        g.addColorStop(1, `rgba(${100 + exposureVar * 15}, ${110 + exposureVar * 15}, ${120 + exposureVar * 12}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Key light from left
        const kl = ctx.createRadialGradient(W * 0.2, H * 0.3, 2, W * 0.2, H * 0.3, H * 0.5);
        kl.addColorStop(0, `rgba(255, 250, 240, ${0.35 + exposureVar * 0.1})`);
        kl.addColorStop(1, 'rgba(255, 245, 230, 0)');
        ctx.fillStyle = kl;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
      },
      // Commercial 7: Event / concert
      () => {
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${20 + exposureVar * 8}, ${15 + exposureVar * 6}, ${25 + exposureVar * 8}, 1)`);
        g.addColorStop(1, `rgba(${40 + exposureVar * 12}, ${25 + exposureVar * 10}, ${60 + exposureVar * 15}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Stage lights
        const colors = ['255,80,120', '100,200,255', '255,220,80', '180,100,255'];
        for (let i = 0; i < 4; i++) {
          const sl = ctx.createLinearGradient(W * 0.15 + i * W * 0.25, 20, W * 0.15 + i * W * 0.25, H * 0.7);
          sl.addColorStop(0, `rgba(${colors[i]}, 0.4)`);
          sl.addColorStop(1, `rgba(${colors[i]}, 0)`);
          ctx.fillStyle = sl;
          ctx.beginPath();
          ctx.moveTo(W * 0.1 + i * W * 0.25, 20);
          ctx.lineTo(W * 0.2 + i * W * 0.25, 20);
          ctx.lineTo(W * 0.35 + i * W * 0.2, H * 0.7);
          ctx.lineTo(W * 0.25 + i * W * 0.2, H * 0.7);
          ctx.closePath();
          ctx.fill();
        }
      },
      // Commercial 8: Social media content
      () => {
        // Vibrant gradient
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, `rgba(${255 - exposureVar * 20}, ${100 + exposureVar * 20}, ${150 + exposureVar * 25}, 1)`);
        g.addColorStop(0.5, `rgba(${100 + exposureVar * 25}, ${200 + exposureVar * 30}, ${255 - exposureVar * 30}, 1)`);
        g.addColorStop(1, `rgba(${255 - exposureVar * 15}, ${200 + exposureVar * 25}, ${100 + exposureVar * 20}, 1)`);
        ctx.fillStyle = g;
        ctx.fillRect(20, 20, W - 40, H * 0.7 - 20);
        // Phone frame
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.roundRect(W * 0.3, H * 0.15, W * 0.4, H * 0.5, 12);
        ctx.fill();
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.roundRect(W * 0.33, H * 0.2, W * 0.34, H * 0.4, 8);
        ctx.fill();
        // UI elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(W * 0.36, H * 0.25, W * 0.2, H * 0.02);
        ctx.fillRect(W * 0.36, H * 0.3, W * 0.15, H * 0.02);
      },
    ],
  ];

  const sceneIndex = photoIndex % sceneTypes[categoryIndex].length;
  sceneTypes[categoryIndex][sceneIndex]();

  // === CONTRAST & COLOR CORRECTION ===
  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Contrast
    data[i] = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * contrast + 0.5) * 255));
    data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] / 255 - 0.5) * contrast + 0.5) * 255));
    data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] / 255 - 0.5) * contrast + 0.5) * 255));
    // Warmth
    if (warmth > 0.5) {
      data[i] = Math.min(255, data[i] * (1 + (warmth - 0.5) * 0.1));
      data[i + 2] = Math.max(0, data[i + 2] * (1 - (warmth - 0.5) * 0.05));
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // === FILM BORDER (darker border like real film) ===
  ctx.fillStyle = '#05040302'; // Near-black border
  ctx.fillRect(0, 0, W, 10);
  ctx.fillRect(0, H - 10, W, 10);
  ctx.fillRect(0, 0, 10, H);
  ctx.fillRect(W - 10, 0, 10, H);

  // === FILM PERFORATIONS ===
  const perfY1 = 12;
  const perfY2 = H - 22;
  ctx.fillStyle = '#0a0806';
  for (let px = 18; px < W - 18; px += 26) {
    ctx.fillRect(px, perfY1, 12, 6);
    ctx.fillRect(px, perfY2, 12, 6);
  }

  // === LENS VIGNETTE ===
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.7);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(0.7, 'rgba(0,0,0,0.1)');
  vig.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // === FILM GRAIN ===
  const grainData = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < grainData.data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 18;
    grainData.data[i] = Math.min(255, Math.max(0, grainData.data[i] + grain));
    grainData.data[i + 1] = Math.min(255, Math.max(0, grainData.data[i + 1] + grain));
    grainData.data[i + 2] = Math.min(255, Math.max(0, grainData.data[i + 2] + grain));
  }
  ctx.putImageData(grainData, 0, 0);

  // === SUBTLE PAPER TEXTURE ===
  for (let i = 0; i < 1000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.015})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random(), 1 + Math.random());
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export default function InfinityCarousel({ categories }: InfinityCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    rings: THREE.Group[];
    photoMeshes: Map<string, THREE.Mesh>;
    lightRays: THREE.Mesh;
    dustParticles: THREE.Points;
    bokeh: THREE.Points;
    ground: THREE.Mesh;
    animationId: number;
    isPaused: boolean;
    clock: THREE.Clock;
  } | null>(null);

  const [selectedPhoto, setSelectedPhoto] = useState<CarouselPhoto | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; category: string } | null>(null);

  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());

  const getTexture = useCallback((
    categoryIndex: number,
    photoIndex: number,
    photoId: string
  ): THREE.Texture => {
    const key = `${categoryIndex}-${photoIndex}`;
    if (!textureCache.current.has(key)) {
      const realUrl = categories[categoryIndex]?.photos[photoIndex]?.url;
      if (realUrl) {
        const loader = new THREE.TextureLoader();
        const tex = loader.load(realUrl);
        tex.colorSpace = THREE.SRGBColorSpace;
        textureCache.current.set(key, tex);
      } else {
        textureCache.current.set(key, createFilmPhotoCard(categoryIndex, photoIndex));
      }
    }
    return textureCache.current.get(key)!;
  }, [categories]);

  const initScene = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050404, 0.04);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 10);
    camera.lookAt(0, 0.3, 0);

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
    renderer.toneMappingExposure = 1.15;

    // === CINEMATIC LIGHTING ===
    // Key light (warm golden hour)
    const keyLight = new THREE.SpotLight(0xffd4a3, 4);
    keyLight.position.set(-5, 9, 5);
    keyLight.angle = 0.45;
    keyLight.penumbra = 0.9;
    keyLight.decay = 1.8;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Fill light (cool blue-ish)
    const fillLight = new THREE.PointLight(0x7a9ab5, 1.8, 18);
    fillLight.position.set(6, 4, 3);
    scene.add(fillLight);

    // Rim / hair light (gold)
    const rimLight = new THREE.PointLight(0xd4a84c, 2.5, 14);
    rimLight.position.set(0, -1, -6);
    scene.add(rimLight);

    // Ambient
    scene.add(new THREE.AmbientLight(0x1a1510, 0.6));

    // === VOLUMETRIC GOD RAYS ===
    const raysGeometry = new THREE.ConeGeometry(10, 18, 32, 1, true);
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
          float alpha = (1.0 - vUv.y) * 0.025;
          alpha *= smoothstep(0.0, 0.25, vUv.y);
          float shimmer = 0.55 + 0.45 * sin(uTime * 0.4 + vUv.y * 4.0 + 1.5);
          alpha *= shimmer;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    const lightRays = new THREE.Mesh(raysGeometry, raysMaterial);
    lightRays.position.set(-2.5, 7, -1);
    lightRays.rotation.x = Math.PI;
    scene.add(lightRays);

    // Secondary god ray
    const rays2Geometry = new THREE.ConeGeometry(6, 12, 24, 1, true);
    const rays2Material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xc9a84c) },
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
          float alpha = (1.0 - vUv.y) * 0.015;
          alpha *= smoothstep(0.0, 0.2, vUv.y);
          alpha *= 0.5 + 0.5 * sin(uTime * 0.3 + vUv.y * 3.0);
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    const lightRays2 = new THREE.Mesh(rays2Geometry, rays2Material);
    lightRays2.position.set(3, 6, -2);
    lightRays2.rotation.x = Math.PI;
    lightRays2.rotation.z = 0.3;
    scene.add(lightRays2);

    // === DUST PARTICLES ===
    const dustCount = 600;
    const dustGeom = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustSizes = new Float32Array(dustCount);
    const dustPhase = new Float32Array(dustCount);

    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 30;
      dustPos[i * 3 + 1] = Math.random() * 18 - 3;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 25;
      dustSizes[i] = Math.random() * 0.07 + 0.015;
      dustPhase[i] = Math.random() * Math.PI * 2;
    }
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeom.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
    dustGeom.setAttribute('phase', new THREE.BufferAttribute(dustPhase, 1));

    const dustMat = new THREE.ShaderMaterial({
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
          pos.y += sin(uTime * 0.25 + phase) * 0.35;
          pos.x += cos(uTime * 0.18 + phase * 1.3) * 0.25;
          pos.z += sin(uTime * 0.2 + phase * 0.7) * 0.2;
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (350.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
          vAlpha = 0.25 + 0.35 * sin(uTime * 0.4 + phase);
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
    const dustParticles = new THREE.Points(dustGeom, dustMat);
    scene.add(dustParticles);

    // === BOKEH BACKGROUND ===
    const bokehCount = 35;
    const bokehGeom = new THREE.BufferGeometry();
    const bokehPos = new Float32Array(bokehCount * 3);
    const bokehSz = new Float32Array(bokehCount);

    for (let i = 0; i < bokehCount; i++) {
      bokehPos[i * 3] = (Math.random() - 0.5) * 35;
      bokehPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      bokehPos[i * 3 + 2] = -6 - Math.random() * 18;
      bokehSz[i] = Math.random() * 0.9 + 0.15;
    }
    bokehGeom.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
    bokehGeom.setAttribute('size', new THREE.BufferAttribute(bokehSz, 1));

    const bokehMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float size;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (220.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
          vAlpha = 0.08 + 0.06 * sin(uTime * 0.25 + position.x * 0.5);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.05, d) * vAlpha;
          gl_FragColor = vec4(1.0, 0.88, 0.65, alpha);
        }
      `,
    });
    const bokeh = new THREE.Points(bokehGeom, bokehMat);
    scene.add(bokeh);

    // === GROUND GLOW POOL ===
    const groundGeom = new THREE.PlaneGeometry(35, 35);
    const groundMat = new THREE.ShaderMaterial({
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
          float pulse = 0.55 + 0.45 * sin(uTime * 0.45 - dist * 2.5);
          float alpha = smoothstep(0.5, 0.05, dist) * 0.12 * pulse;
          vec3 color = mix(uColor1, uColor2, vUv.y + sin(uTime * 0.2) * 0.1);
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.5;
    scene.add(ground);

    // === RINGS ===
    const rings: THREE.Group[] = [];
    const photoMeshes = new Map<string, THREE.Mesh>();

    RING_CONFIG.forEach((config, tierIndex) => {
      const tierGroup = new THREE.Group();
      tierGroup.position.y = config.yPosition;
      tierGroup.rotation.x = config.tilt;

      const category = categories[tierIndex];
      const ringColor = new THREE.Color(category?.color || '#c9a84c');

      // Outer glow layers (3 layers for richness)
      const glowLayers = [
        { radiusOffset: 0.18, tubeScale: 4, opacity: 0.06 },
        { radiusOffset: 0.3, tubeScale: 7, opacity: 0.03 },
        { radiusOffset: 0.5, tubeScale: 12, opacity: 0.015 },
      ];
      glowLayers.forEach(({ radiusOffset, tubeScale, opacity }) => {
        const gGeo = new THREE.TorusGeometry(config.radius + radiusOffset, config.tubeRadius * tubeScale, 8, 100);
        const gMat = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity });
        const gRing = new THREE.Mesh(gGeo, gMat);
        gRing.rotation.x = Math.PI / 2;
        tierGroup.add(gRing);
      });

      // Main ring
      const ringGeo = new THREE.TorusGeometry(config.radius, config.tubeRadius, 24, 180);
      const ringMat = new THREE.MeshStandardMaterial({
        color: ringColor,
        metalness: 0.88,
        roughness: 0.12,
        emissive: ringColor,
        emissiveIntensity: 0.18,
      });
      const mainRing = new THREE.Mesh(ringGeo, ringMat);
      mainRing.rotation.x = Math.PI / 2;
      mainRing.castShadow = true;
      tierGroup.add(mainRing);

      // Inner accent ring
      const innerGeo = new THREE.TorusGeometry(config.radius - 0.12, config.tubeRadius * 0.4, 12, 120);
      const innerMat = new THREE.MeshBasicMaterial({ color: ringColor, transparent: true, opacity: 0.45 });
      const innerRing = new THREE.Mesh(innerGeo, innerMat);
      innerRing.rotation.x = Math.PI / 2;
      tierGroup.add(innerRing);

      // Photos
      const photoGroup = new THREE.Group();
      photoGroup.userData = { tierIndex, config };

      const tierPhotos = category?.photos || [];
      const angleStep = (Math.PI * 2) / PHOTOS_PER_TIER;

      tierPhotos.slice(0, PHOTOS_PER_TIER).forEach((photo, photoIndex) => {
        const angle = photoIndex * angleStep;
        const pW = config.radius < 2 ? 0.85 : 1.0;
        const pH = config.radius < 2 ? 1.1 : 1.3;
        const geometry = new THREE.PlaneGeometry(pW, pH);

        const texture = getTexture(tierIndex, photoIndex, photo.id);

        const material = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.08,
          roughness: 0.65,
          emissive: new THREE.Color(category?.color || '#c9a84c'),
          emissiveIntensity: 0.04,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.97,
        });

        const photoMesh = new THREE.Mesh(geometry, material);
        photoMesh.userData = { photo, tierIndex, photoIndex, angle, originalScale: 1 };

        const r = config.radius * 0.91;
        photoMesh.position.x = Math.cos(angle) * r;
        photoMesh.position.z = Math.sin(angle) * r;
        photoMesh.rotation.y = -angle + Math.PI / 2;

        // Slight tilt toward camera
        photoMesh.rotation.x = 0.05;

        photoGroup.add(photoMesh);
        photoMeshes.set(photo.id, photoMesh);
      });

      // If not enough photos, fill with procedural cards
      if (tierPhotos.length < PHOTOS_PER_TIER) {
        for (let pi = tierPhotos.length; pi < PHOTOS_PER_TIER; pi++) {
          const angle = pi * angleStep;
          const pW = config.radius < 2 ? 0.85 : 1.0;
          const pH = config.radius < 2 ? 1.1 : 1.3;
          const geometry = new THREE.PlaneGeometry(pW, pH);
          const texture = getTexture(tierIndex, pi, `fill-${tierIndex}-${pi}`);
          const material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness: 0.08,
            roughness: 0.65,
            emissive: new THREE.Color(category?.color || '#c9a84c'),
            emissiveIntensity: 0.04,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.97,
          });
          const photoMesh = new THREE.Mesh(geometry, material);
          photoMesh.userData = { tierIndex, photoIndex: pi, angle, originalScale: 1 };
          const r = config.radius * 0.91;
          photoMesh.position.x = Math.cos(angle) * r;
          photoMesh.position.z = Math.sin(angle) * r;
          photoMesh.rotation.y = -angle + Math.PI / 2;
          photoMesh.rotation.x = 0.05;
          photoGroup.add(photoMesh);
        }
      }

      tierGroup.add(photoGroup);
      rings.push(tierGroup);
      scene.add(tierGroup);
    });

    // === LENS FLARE (subtle) ===
    // Add when key light is aligned with camera

    sceneRef.current = {
      scene,
      camera,
      renderer,
      rings,
      photoMeshes,
      lightRays,
      dustParticles,
      bokeh,
      ground,
      animationId: 0,
      isPaused: false,
      clock: new THREE.Clock(),
    };

    // === ANIMATE ===
    const animate = () => {
      if (!sceneRef.current) return;
      const { scene, camera, renderer, rings, photoMeshes, lightRays, dustParticles, bokeh, ground, isPaused, clock } = sceneRef.current;
      const elapsed = clock.getElapsedTime();

      if (!isPaused) {
        // Rotate rings with spring-like easing feel
        rings.forEach((ring, tierIndex) => {
          const config = RING_CONFIG[tierIndex];
          ring.rotation.y += config.rotationSpeed * config.direction;
          // Breathing float
          ring.position.y = config.yPosition + Math.sin(elapsed * 0.35 + tierIndex * 1.3) * 0.06;
          ring.rotation.x = config.tilt + Math.sin(elapsed * 0.25 + tierIndex) * 0.015;
        });

        // Update shader time uniforms
        (lightRays.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
        (lightRays2.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
        (dustParticles.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
        (bokeh.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
        (ground.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
      }

      // Smooth camera parallax
      const targetX = mousePos.x * 0.6;
      const targetY = 1.8 + mousePos.y * 0.35;
      camera.position.x += (targetX - camera.position.x) * 0.018;
      camera.position.y += (targetY - camera.position.y) * 0.018;
      camera.lookAt(0, 0.3, 0);

      // Photo hover GSAP animations
      photoMeshes.forEach((mesh, id) => {
        const material = mesh.material as THREE.MeshStandardMaterial;
        const isHovered = hoveredPhoto === id;
        gsap.to(mesh.scale, {
          x: isHovered ? 1.18 : 1,
          y: isHovered ? 1.18 : 1,
          duration: 0.5,
          ease: 'power3.out',
        });
        gsap.to(material, {
          emissiveIntensity: isHovered ? 0.18 : 0.04,
          duration: 0.5,
        });
      });

      renderer.render(scene, camera);
      sceneRef.current.animationId = requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePos({ x: x * 3, y: y * 2 });
      mouse.x = x;
      mouse.y = y;
      raycaster.setFromCamera(mouse, camera);

      const allPhotos = Array.from(photoMeshes.values());
      const intersects = raycaster.intersectObjects(allPhotos);
      const hitId = intersects.length > 0 ? (intersects[0].object as THREE.Mesh).userData.photo?.id || null : null;
      setHoveredPhoto(hitId);
      if (containerRef.current) {
        containerRef.current.style.cursor = hitId ? 'pointer' : 'grab';
      }
    };

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
        if (hit.userData.photo) {
          const p = hit.userData.photo;
          setSelectedPhoto(p);
          // If real image URL, use it; otherwise use the procedural texture
          const tex = hit.material instanceof THREE.MeshStandardMaterial
            ? (hit.material.map as THREE.CanvasTexture | null)
            : null;
          if (tex && tex.image) {
            const cvs = document.createElement('canvas');
            cvs.width = tex.image.width;
            cvs.height = tex.image.height;
            const ctx2 = cvs.getContext('2d')!;
            ctx2.drawImage(tex.image as CanvasImageSource, 0, 0);
            setLightboxImage({ url: cvs.toDataURL(), title: p.title, category: p.category });
          }
        }
      }
    };

    const handleMouseEnter = () => { if (sceneRef.current) sceneRef.current.isPaused = true; };
    const handleMouseLeave = () => {
      if (sceneRef.current) sceneRef.current.isPaused = false;
      setHoveredPhoto(null);
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);
    containerRef.current.addEventListener('mouseenter', handleMouseEnter);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave);

    setIsLoaded(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
        containerRef.current.removeEventListener('mouseenter', handleMouseEnter);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.renderer.dispose();
      }
      textureCache.current.forEach(t => t.dispose());
      textureCache.current.clear();
    };
  }, [categories, getTexture, hoveredPhoto, mousePos]);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#050404', cursor: 'grab' }}>
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', inset: 0 }} />

      {/* Film grain overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        opacity: 0.045,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        mixBlendMode: 'overlay',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 6,
        background: 'radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.75) 100%)',
      }} />

      {/* Subtle warm light from top-left */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 4,
        background: 'radial-gradient(ellipse at 15% 0%, rgba(255,200,120,0.04) 0%, transparent 45%)',
      }} />

      {/* Category labels */}
      {RING_CONFIG.map((config, i) => (
        <div key={config.label} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, calc(-50% + ${(config.yPosition + 3.2) * 42}px))`,
          zIndex: 10,
          pointerEvents: 'none',
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.45em',
            color: categories[i]?.color || '#c9a84c',
            opacity: 0.55,
            textTransform: 'uppercase',
            textShadow: `0 0 25px ${categories[i]?.color || '#c9a84c'}50`,
          }}>
            {config.label}
          </span>
        </div>
      ))}

      {/* Loading state */}
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
            fontSize: '1.1rem',
            color: '#c9a84c',
            letterSpacing: '0.1em',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            Loading...
          </div>
        </div>
      )}

      {/* Brand */}
      <div style={{
        position: 'absolute',
        bottom: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 20,
        pointerEvents: 'none',
      }}>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.6rem, 4.5vw, 3rem)',
          color: '#f5f0eb',
          marginBottom: '0.3rem',
          letterSpacing: '0.06em',
          textShadow: '0 4px 50px rgba(0,0,0,0.95)',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1.2s ease-out 0.4s',
        }}>
          <span style={{ color: '#c9a84c' }}>Many&apos;s</span> Photography
        </h1>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 'clamp(0.55rem, 1.4vw, 0.75rem)',
          color: 'rgba(245,240,235,0.45)',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          textShadow: '0 2px 25px rgba(0,0,0,0.9)',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 1.2s ease-out 0.7s',
        }}>
          Capturing moments that become memories
        </p>
      </div>

      {/* Interaction hint */}
      <div style={{
        position: 'absolute',
        bottom: '36px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        pointerEvents: 'none',
        opacity: isLoaded ? 0.35 : 0,
        transition: 'opacity 0.8s',
      }}>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.65rem',
          color: '#f5f0eb',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          Hover to pause · Click to explore
        </p>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div onClick={() => { setSelectedPhoto(null); setLightboxImage(null); }} style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.96)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); setLightboxImage(null); }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              background: 'none',
              border: 'none',
              color: '#f5f0eb',
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
            maxWidth: '50vw',
            maxHeight: '62vh',
            aspectRatio: '4/5',
            position: 'relative',
            borderRadius: '2px',
            overflow: 'hidden',
            boxShadow: '0 0 100px rgba(201,168,76,0.12), 0 40px 100px rgba(0,0,0,0.7)',
          }}>
            {lightboxImage ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 90vw"
                  priority
                />
              </div>
            ) : (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: '#0d0b09',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
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
                  color: '#f5f0eb',
                }}>
                  {selectedPhoto.title}
                </span>
              </div>
            )}
          </div>
          <p style={{
            position: 'absolute',
            bottom: '24px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.75rem',
            color: 'rgba(245,240,235,0.35)',
            letterSpacing: '0.1em',
          }}>
            Click anywhere to close
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
