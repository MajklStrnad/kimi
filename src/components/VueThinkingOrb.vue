<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { resolvePreset, MODE_FRAMES, paintFrame } from 'thinking-orbs/engine';

const props = defineProps({
  state: { type: String, default: 'working' },
  size: { type: Number, default: 64 },
  theme: { type: String, default: 'auto' },
  speed: { type: Number, default: 1 },
  paused: { type: Boolean, default: false },
});

const canvasRef = ref(null);
let rafId = 0;
let startTime = 0;
let pausedTime = 0;
let isVisible = true;
let isIntersecting = true;
let ctx = null;
let dpr = 1;

function isDark() {
  if (props.theme === 'dark') return true;
  if (props.theme === 'light') return false;
  // auto
  const root = document.documentElement;
  const data = root.getAttribute('data-theme');
  if (data === 'dark') return true;
  if (data === 'light') return false;
  if (root.classList.contains('dark')) return true;
  if (root.classList.contains('light')) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = props.size * dpr;
  canvas.height = props.size * dpr;
  canvas.style.width = props.size + 'px';
  canvas.style.height = props.size + 'px';
  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}

function draw(timestamp) {
  if (!ctx || !isIntersecting || !isVisible || props.paused) {
    rafId = requestAnimationFrame(draw);
    return;
  }

  if (!startTime) startTime = timestamp - pausedTime;
  const elapsed = (timestamp - startTime) / 1000;

  const dark = isDark();
  const resolved = resolvePreset(props.state, props.size);
  const frameFn = MODE_FRAMES[resolved.mode];
  const t = elapsed * resolved.speed * (props.speed || 1);
  const frame = frameFn(props.size, t, resolved.opts);

  ctx.clearRect(0, 0, props.size, props.size);
  paintFrame(ctx, frame, dark);

  rafId = requestAnimationFrame(draw);
}

function handleVis() {
  if (document.hidden) {
    pausedTime = performance.now() - startTime;
    isVisible = false;
  } else {
    isVisible = true;
    startTime = 0; // will be re-set on next frame
  }
}

let io = null;
let mo = null;

onMounted(() => {
  resize();
  rafId = requestAnimationFrame(draw);

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', handleVis);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) {
    // Render a single representative frame
    const dark = isDark();
    const resolved = resolvePreset(props.state, props.size);
    const frame = MODE_FRAMES[resolved.mode](props.size, 0, resolved.opts);
    paintFrame(ctx, frame, dark);
    return;
  }

  io = new IntersectionObserver(
    ([entry]) => {
      isIntersecting = entry.isIntersecting;
    },
    { threshold: 0 }
  );
  io.observe(canvasRef.value);

  if (props.theme === 'auto') {
    mo = new MutationObserver(() => {
      // isDark() will be re-evaluated on next draw
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
      subtree: true,
    });
  }
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener('resize', resize);
  document.removeEventListener('visibilitychange', handleVis);
  io?.disconnect();
  mo?.disconnect();
});

watch(() => [props.state, props.size], resize);
</script>

<template>
  <canvas ref="canvasRef" :width="size" :height="size" role="img" :aria-label="state + ' orb'"></canvas>
</template>
