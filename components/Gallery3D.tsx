"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Gallery3D.module.css";

const IMAGES = [
  "/academy/photo1.jpg",
  "/academy/photo2.jpg",
  // "/academy/photo3.jpg", // removed
  "/academy/photo4.jpg",
  "/academy/photo5.jpg",
  "/academy/photo6.jpg",
  "/academy/photo7.jpg",
  "/academy/photo8.jpg",
  "/academy/photo9.jpg",
  "/academy/photo10.jpg",
  "/academy/photo11.jpg",
  "/academy/photo12.jpg",
  "/academy/photo13.jpg",
  "/academy/photo14.jpg",
  "/academy/photo15.jpg",
  "/academy/photo16.jpg",
  "/academy/photo17.jpg",
  "/academy/photo18.jpg",
  "/academy/photo19.jpg",
];

const Gallery3D = () => {
  const stageRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const cardElsRef = useRef<(HTMLElement | null)[]>([]);
  const imgElsRef = useRef<(HTMLImageElement | null)[]>([]);

  const [loading, setLoading] = useState(true);

  // Keep interaction + animation state out of React render loop
  const stateRef = useRef({
    isEntering: true,
    dragging: false,
    lastX: 0,
    lastT: 0,
    lastDelta: 0,
    vX: 0,
    scrollX: 0,
    vwHalf: 0,
    cardW: 300,
    cardH: 400,
    step: 300 + 28,
    track: 0,
    rafId: 0 as number | 0,
    bgRafId: 0 as number | 0,
    lastTime: 0,
    lastBgDraw: 0,
    bgFastUntil: 0,
    activeIndex: -1,
  });

  const positionsRef = useRef<Float32Array | null>(null);

  const paletteRef = useRef<Array<{ c1: [number, number, number]; c2: [number, number, number] }>>([]);
  const gradCurrentRef = useRef({ r1: 240, g1: 240, b1: 240, r2: 235, g2: 235, b2: 235 });
  const gradTargetRef = useRef({ r1: 240, g1: 240, b1: 240, r2: 235, g2: 235, b2: 235 });

  const images = useMemo(() => IMAGES, []);
  const scrollLeftRef = useRef<() => void>(() => {});
  const scrollRightRef = useRef<() => void>(() => {});

  useEffect(() => {
    const stage = stageRef.current;
    const cardsRoot = cardsRef.current;
    const canvas = bgCanvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false }) ?? null;
    if (!stage || !cardsRoot || !canvas || !ctx) return;

    const mod = (n: number, m: number) => ((n % m) + m) % m;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    const MAX_ROTATION = 28;
    const MAX_DEPTH = 140;
    const MIN_SCALE = 0.92;
    const SCALE_RANGE = 0.1;
    const GAP = 28;
    const FRICTION = 0.9;
    const DRAG_SENS = 1.0;

    const computeTransformComponents = (screenX: number) => {
      const s = stateRef.current;
      const norm = clamp(screenX / Math.max(1, s.vwHalf), -1, 1);
      const absNorm = Math.abs(norm);
      const invNorm = 1 - absNorm;
      const ry = -norm * MAX_ROTATION;
      const tz = invNorm * MAX_DEPTH;
      const scale = MIN_SCALE + invNorm * SCALE_RANGE;
      return { norm, absNorm, invNorm, ry, tz, scale };
    };

    const transformForScreenX = (screenX: number) => {
      const { ry, tz, scale } = computeTransformComponents(screenX);
      return {
        transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
        z: tz,
      };
    };

    const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      if (max === min) return [0, 0, l];

      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      const h =
        max === r
          ? (g - b) / d + (g < b ? 6 : 0)
          : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;

      return [h * 60, s, l];
    };

    const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
      h = ((h % 360) + 360) % 360;
      h /= 360;
      let r: number;
      let g: number;
      let b: number;

      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    const fallbackFromIndex = (idx: number) => {
      const h = (idx * 37) % 360;
      const s = 0.65;
      const c1 = hslToRgb(h, s, 0.52);
      const c2 = hslToRgb(h, s, 0.72);
      return { c1, c2 };
    };

    const extractColors = (img: HTMLImageElement, idx: number) => {
      try {
        const MAX = 48;
        const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
        const tw = ratio >= 1 ? MAX : Math.max(16, Math.round(MAX * ratio));
        const th = ratio >= 1 ? Math.max(16, Math.round(MAX / ratio)) : MAX;

        const c = document.createElement("canvas");
        c.width = tw;
        c.height = th;
        const cctx = c.getContext("2d");
        if (!cctx) return fallbackFromIndex(idx);
        cctx.drawImage(img, 0, 0, tw, th);
        const data = cctx.getImageData(0, 0, tw, th).data;

        const H_BINS = 36;
        const S_BINS = 5;
        const SIZE = H_BINS * S_BINS;
        const wSum = new Float32Array(SIZE);
        const rSum = new Float32Array(SIZE);
        const gSum = new Float32Array(SIZE);
        const bSum = new Float32Array(SIZE);

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3] / 255;
          if (a < 0.05) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const [h, s, l] = rgbToHsl(r, g, b);
          if (l < 0.1 || l > 0.92 || s < 0.08) continue;
          const w = a * (s * s) * (1 - Math.abs(l - 0.5) * 0.6);

          const hi = clamp(Math.floor((h / 360) * H_BINS), 0, H_BINS - 1);
          const si = clamp(Math.floor(s * S_BINS), 0, S_BINS - 1);
          const bidx = hi * S_BINS + si;

          wSum[bidx] += w;
          rSum[bidx] += r * w;
          gSum[bidx] += g * w;
          bSum[bidx] += b * w;
        }

        let pIdx = -1;
        let pW = 0;
        for (let i = 0; i < SIZE; i++) {
          if (wSum[i] > pW) {
            pW = wSum[i];
            pIdx = i;
          }
        }
        if (pIdx < 0 || pW <= 0) return fallbackFromIndex(idx);
        const pHue = Math.floor(pIdx / S_BINS) * (360 / H_BINS);

        let sIdx = -1;
        let sW = 0;
        for (let i = 0; i < SIZE; i++) {
          const w = wSum[i];
          if (w <= 0) continue;
          const h = Math.floor(i / S_BINS) * (360 / H_BINS);
          let dh = Math.abs(h - pHue);
          dh = Math.min(dh, 360 - dh);
          if (dh >= 25 && w > sW) {
            sW = w;
            sIdx = i;
          }
        }

        const avgRGB = (binIdx: number): [number, number, number] => {
          const w = wSum[binIdx] || 1e-6;
          return [
            Math.round(rSum[binIdx] / w),
            Math.round(gSum[binIdx] / w),
            Math.round(bSum[binIdx] / w),
          ];
        };

        const [pr, pg, pb] = avgRGB(pIdx);
        const [h1, s1Raw] = rgbToHsl(pr, pg, pb);
        const s1 = clamp(s1Raw * 1.15, 0.45, 1);
        const c1 = hslToRgb(h1, s1, 0.5);

        let c2: [number, number, number];
        if (sIdx >= 0 && sW >= pW * 0.6) {
          const [sr, sg, sb] = avgRGB(sIdx);
          const [h2, s2Raw] = rgbToHsl(sr, sg, sb);
          const s2 = clamp(s2Raw * 1.05, 0.45, 1);
          c2 = hslToRgb(h2, s2, 0.72);
        } else {
          c2 = hslToRgb(h1, s1, 0.72);
        }

        return { c1, c2 };
      } catch {
        return fallbackFromIndex(idx);
      }
    };

    const resizeBG = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = canvas.clientWidth || stage.clientWidth;
      const h = canvas.clientHeight || stage.clientHeight;
      const tw = Math.floor(w * dpr);
      const th = Math.floor(h * dpr);
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw;
        canvas.height = th;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const setActiveGradient = (idx: number) => {
      const s = stateRef.current;
      if (idx < 0 || idx >= images.length || idx === s.activeIndex) return;
      s.activeIndex = idx;
      const pal = paletteRef.current[idx] ?? { c1: [240, 240, 240], c2: [235, 235, 235] };
      gradTargetRef.current = {
        r1: pal.c1[0],
        g1: pal.c1[1],
        b1: pal.c1[2],
        r2: pal.c2[0],
        g2: pal.c2[1],
        b2: pal.c2[2],
      };
      s.bgFastUntil = performance.now() + 800;
    };

    const updateCarouselTransforms = () => {
      const s = stateRef.current;
      const n = images.length;
      const positions = positionsRef.current;
      if (!positions || n === 0) return;
      const half = s.track / 2;
      let closestIdx = -1;
      let closestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < n; i++) {
        const cardEl = cardElsRef.current[i];
        if (!cardEl) continue;
        let pos = i * s.step - s.scrollX;
        if (pos < -half) pos += s.track;
        if (pos > half) pos -= s.track;
        positions[i] = pos;

        const dist = Math.abs(pos);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      const prevIdx = (closestIdx - 1 + n) % n;
      const nextIdx = (closestIdx + 1) % n;

      for (let i = 0; i < n; i++) {
        const el = cardElsRef.current[i];
        if (!el) continue;
        const pos = positions[i];
        const norm = clamp(pos / Math.max(1, s.vwHalf), -1, 1);
        const { transform, z } = transformForScreenX(pos);

        el.style.transform = transform;
        el.style.zIndex = String(1000 + Math.round(z));
        const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
        const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1);
        el.style.filter = `blur(${blur.toFixed(2)}px)`;
      }

      if (closestIdx !== stateRef.current.activeIndex) {
        setActiveGradient(closestIdx);
      }
    };

    const tick = (t: number) => {
      const s = stateRef.current;
      const dt = s.lastTime ? (t - s.lastTime) / 1000 : 0;
      s.lastTime = t;

      s.scrollX = mod(s.scrollX + s.vX * dt, s.track);
      const decay = Math.pow(FRICTION, dt * 60);
      s.vX *= decay;
      if (Math.abs(s.vX) < 0.02) s.vX = 0;

      updateCarouselTransforms();
      s.rafId = window.requestAnimationFrame(tick);
    };

    const drawBackground = () => {
      const s = stateRef.current;
      const now = performance.now();
      const minInterval = now < s.bgFastUntil ? 16 : 33;
      if (now - s.lastBgDraw < minInterval) {
        s.bgRafId = window.requestAnimationFrame(drawBackground);
        return;
      }

      s.lastBgDraw = now;
      resizeBG();

      const w = canvas.clientWidth || stage.clientWidth;
      const h = canvas.clientHeight || stage.clientHeight;

      // Smoothly approach target colors (simple tween)
      const cur = gradCurrentRef.current;
      const tgt = gradTargetRef.current;
      const alpha = now < s.bgFastUntil ? 0.14 : 0.08;
      cur.r1 += (tgt.r1 - cur.r1) * alpha;
      cur.g1 += (tgt.g1 - cur.g1) * alpha;
      cur.b1 += (tgt.b1 - cur.b1) * alpha;
      cur.r2 += (tgt.r2 - cur.r2) * alpha;
      cur.g2 += (tgt.g2 - cur.g2) * alpha;
      cur.b2 += (tgt.b2 - cur.b2) * alpha;

      ctx.fillStyle = "#f6f7f9";
      ctx.fillRect(0, 0, w, h);

      const time = now * 0.0002;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const a1 = Math.min(w, h) * 0.35;
      const a2 = Math.min(w, h) * 0.28;
      const x1 = cx + Math.cos(time) * a1;
      const y1 = cy + Math.sin(time * 0.8) * a1 * 0.4;
      const x2 = cx + Math.cos(-time * 0.9 + 1.2) * a2;
      const y2 = cy + Math.sin(-time * 0.7 + 0.7) * a2 * 0.5;
      const r1 = Math.max(w, h) * 0.75;
      const r2 = Math.max(w, h) * 0.65;

      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      g1.addColorStop(0, `rgba(${cur.r1.toFixed(0)},${cur.g1.toFixed(0)},${cur.b1.toFixed(0)},0.85)`);
      g1.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      g2.addColorStop(0, `rgba(${cur.r2.toFixed(0)},${cur.g2.toFixed(0)},${cur.b2.toFixed(0)},0.70)`);
      g2.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      s.bgRafId = window.requestAnimationFrame(drawBackground);
    };

    const cancelLoops = () => {
      const s = stateRef.current;
      if (s.rafId) window.cancelAnimationFrame(s.rafId);
      if (s.bgRafId) window.cancelAnimationFrame(s.bgRafId);
      s.rafId = 0;
      s.bgRafId = 0;
    };

    const startLoops = () => {
      cancelLoops();
      const s = stateRef.current;
      s.lastTime = 0;
      s.lastBgDraw = 0;
      updateCarouselTransforms();
      s.bgRafId = window.requestAnimationFrame(drawBackground);
      s.rafId = window.requestAnimationFrame((t) => {
        updateCarouselTransforms();
        tick(t);
      });
    };

    const waitForImages = async () => {
      const promises = images.map((_, i) => {
        const img = imgElsRef.current[i];
        if (!img || img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
      });
      await Promise.all(promises);
    };

    const decodeAllImages = async () => {
      const tasks = images.map((_, i) => {
        const img = imgElsRef.current[i];
        if (!img) return Promise.resolve();
        if (typeof img.decode === "function") {
          return img.decode().catch(() => {});
        }
        return Promise.resolve();
      });
      await Promise.allSettled(tasks);
    };

    const measure = () => {
      const s = stateRef.current;
      const sample = cardElsRef.current[0];
      if (!sample) return;
      const r = sample.getBoundingClientRect();
      s.cardW = r.width || s.cardW;
      s.cardH = r.height || s.cardH;
      s.step = s.cardW + GAP;
      s.track = images.length * s.step;
      s.vwHalf = window.innerWidth * 0.5;
      positionsRef.current = new Float32Array(images.length);
    };

    const warmupCompositing = async () => {
      const s = stateRef.current;
      const original = s.scrollX;
      const stepSize = s.step * 0.5;
      const numSteps = Math.ceil(s.track / stepSize);
      for (let i = 0; i < numSteps; i++) {
        s.scrollX = mod(original + i * stepSize, s.track);
        updateCarouselTransforms();
        if (i % 3 === 0) await new Promise((r) => requestAnimationFrame(r));
      }
      s.scrollX = original;
      updateCarouselTransforms();
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
    };

    const animateEntry = async () => {
      await new Promise((r) => requestAnimationFrame(r));
      const s = stateRef.current;
      const n = images.length;
      const half = s.track / 2;
      const viewportWidth = window.innerWidth;
      const visible: Array<{ i: number; screenX: number }> = [];

      for (let i = 0; i < n; i++) {
        let pos = i * s.step - s.scrollX;
        if (pos < -half) pos += s.track;
        if (pos > half) pos -= s.track;
        if (Math.abs(pos) < viewportWidth * 0.6) visible.push({ i, screenX: pos });
      }

      visible.sort((a, b) => a.screenX - b.screenX);
      const start = performance.now();

      visible.forEach(({ i, screenX }) => {
        const el = cardElsRef.current[i];
        if (!el) return;
        const { ry, tz, scale: baseScale } = computeTransformComponents(screenX);
        const START_SCALE = 0.92;
        const START_Y = 40;
        el.style.opacity = "0";
        el.style.transform =
          `translate3d(${screenX}px,-50%,${tz}px) ` +
          `rotateY(${ry}deg) ` +
          `scale(${START_SCALE}) ` +
          `translateY(${START_Y}px)`;
        // stash baseScale on dataset for animation loop
        (el as HTMLElement).dataset.baseScale = String(baseScale);
        (el as HTMLElement).dataset.ry = String(ry);
        (el as HTMLElement).dataset.tz = String(tz);
      });

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      await new Promise<void>((resolve) => {
        const frame = () => {
          const now = performance.now();
          let done = true;
          visible.forEach(({ i, screenX }, idx) => {
            const el = cardElsRef.current[i];
            if (!el) return;
            const delay = idx * 50;
            const t = clamp((now - start - delay) / 600, 0, 1);
            if (t < 1) done = false;
            const e = easeOutCubic(t);

            const ry = Number((el as HTMLElement).dataset.ry ?? "0");
            const tz = Number((el as HTMLElement).dataset.tz ?? "0");
            const baseScale = Number((el as HTMLElement).dataset.baseScale ?? "1");

            const START_SCALE = 0.92;
            const START_Y = 40;
            const currentScale = START_SCALE + (baseScale - START_SCALE) * e;
            const currentY = START_Y * (1 - e);
            el.style.opacity = String(e);

            if (t >= 0.999) {
              const { transform } = transformForScreenX(screenX);
              el.style.transform = transform;
            } else {
              el.style.transform =
                `translate3d(${screenX}px,-50%,${tz}px) ` +
                `rotateY(${ry}deg) ` +
                `scale(${currentScale}) ` +
                `translateY(${currentY}px)`;
            }
          });

          if (done) resolve();
          else requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
    };

    const onResize = () => {
      const s = stateRef.current;
      const prevStep = s.step || 1;
      const ratio = s.scrollX / (images.length * prevStep);
      measure();
      s.scrollX = mod(ratio * s.track, s.track);
      updateCarouselTransforms();
      resizeBG();
    };

    let resizeTimer: number | undefined;
    const onWindowResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(onResize, 80);
    };

    const scrollLeft = () => {
      const s = stateRef.current;
      s.scrollX = mod(s.scrollX - s.step, s.track);
      updateCarouselTransforms();
    };

    const scrollRight = () => {
      const s = stateRef.current;
      s.scrollX = mod(s.scrollX + s.step, s.track);
      updateCarouselTransforms();
    };

    scrollLeftRef.current = scrollLeft;
    scrollRightRef.current = scrollRight;

    const onDragStart = (e: DragEvent) => e.preventDefault();

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(`.${styles.arrowLeft}, .${styles.arrowRight}`)) return;
      if (stateRef.current.isEntering) return;
      stateRef.current.dragging = true;
      stateRef.current.lastX = e.clientX;
      stateRef.current.lastT = performance.now();
      stateRef.current.lastDelta = 0;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add(styles.dragging);
    };

    const onPointerMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const now = performance.now();
      const dx = e.clientX - s.lastX;
      const dt = Math.max(1, now - s.lastT) / 1000;
      s.scrollX = mod(s.scrollX - dx * DRAG_SENS, s.track);
      s.lastDelta = dx / dt;
      s.lastX = e.clientX;
      s.lastT = now;
    };

    const onPointerUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      s.dragging = false;
      try {
        stage.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      s.vX = -s.lastDelta * DRAG_SENS;
      stage.classList.remove(styles.dragging);
    };

    const onVisibility = () => {
      if (document.hidden) cancelLoops();
      else startLoops();
    };

    const init = async () => {
      stage.classList.add(styles.carouselMode);

      measure();
      updateCarouselTransforms();
      resizeBG();

      await waitForImages();
      await decodeAllImages();

      // Force paint
      images.forEach((_, i) => {
        const img = imgElsRef.current[i];
        if (img) void img.offsetHeight;
      });

      paletteRef.current = images.map((_, i) => {
        const img = imgElsRef.current[i];
        if (!img) {
          const fb = fallbackFromIndex(i);
          return { c1: fb.c1, c2: fb.c2 };
        }
        return extractColors(img, i);
      });

      // Set initial gradient to the centered card
      const s = stateRef.current;
      const half = s.track / 2;
      let closestIdx = 0;
      let closestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < images.length; i++) {
        let pos = i * s.step - s.scrollX;
        if (pos < -half) pos += s.track;
        if (pos > half) pos -= s.track;
        const d = Math.abs(pos);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      }
      setActiveGradient(closestIdx);

      // Warmup
      await warmupCompositing();

      // Background baseline
      const w = canvas.clientWidth || stage.clientWidth;
      const h = canvas.clientHeight || stage.clientHeight;
      ctx.fillStyle = "#f6f7f9";
      ctx.fillRect(0, 0, w, h);

      setLoading(false);
      await new Promise((r) => setTimeout(r, 50));
      await animateEntry();

      stateRef.current.isEntering = false;
      startLoops();
    };

    stage.addEventListener("dragstart", onDragStart);
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", onWindowResize);
    document.addEventListener("visibilitychange", onVisibility);

    void init();

    return () => {
      cancelLoops();
      stage.removeEventListener("dragstart", onDragStart as EventListener);
      stage.removeEventListener("pointerdown", onPointerDown as EventListener);
      stage.removeEventListener("pointermove", onPointerMove as EventListener);
      stage.removeEventListener("pointerup", onPointerUp as EventListener);
      stage.removeEventListener("pointercancel", onPointerUp as EventListener);
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [images]);

  return (
    <main
      ref={(el) => {
        stageRef.current = el;
      }}
      className={styles.stage}
      aria-live="polite"
    >
      <div className={`${styles.loader} ${loading ? "" : styles.loaderHide}`} aria-label="Loading" aria-live="assertive">
        <div className={styles.loaderContent}>
          <div className={styles.loaderRing} aria-hidden="true" />
        </div>
      </div>

      <canvas ref={bgCanvasRef} className={styles.bg} aria-hidden="true" />

      <section
        ref={(el) => {
          cardsRef.current = el;
        }}
        className={styles.cards}
        aria-label="Infinite carousel of images"
      >
        {images.map((src, i) => (
          <article
            key={`${src}-${i}`}
            className={styles.card}
            ref={(el: HTMLElement | null) => {
              cardElsRef.current[i] = el;
            }}
          >
            <img
              ref={(el) => {
                imgElsRef.current[i] = el;
              }}
              className={styles.cardImg}
              src={src}
              alt={`Gallery image ${i + 1}`}
              draggable={false}
              decoding="async"
              loading="eager"
            />
          </article>
        ))}
      </section>

      <button
        className={styles.arrowLeft}
        onClick={() => scrollLeftRef.current()}
        aria-label="Scroll left"
      >
        &#8592;
      </button>
      <button
        className={styles.arrowRight}
        onClick={() => scrollRightRef.current()}
        aria-label="Scroll right"
      >
        &#8594;
      </button>
    </main>
  );
};

export default Gallery3D;