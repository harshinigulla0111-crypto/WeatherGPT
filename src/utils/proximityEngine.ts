/**
 * Global Proximity & Magnetic Hover Engine for WeatherGPT
 * Ultra-performant (uses requestAnimationFrame & direct CSS variable updates).
 * Bypasses React re-renders for buttery 60fps interaction.
 */

let isEngineRunning = false;
let mouseX = -1000;
let mouseY = -1000;

export function initProximityEngine(): void {
  if (typeof window === 'undefined' || isEngineRunning) return;

  const isTouch = window.matchMedia('(hover: none)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouch || isReducedMotion) {
    return;
  }

  isEngineRunning = true;

  window.addEventListener(
    'mousemove',
    (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      scheduleUpdate();
    },
    { passive: true }
  );

  window.addEventListener(
    'mouseleave',
    () => {
      mouseX = -1000;
      mouseY = -1000;
      scheduleUpdate();
    },
    { passive: true }
  );
}

let animFrameId: number | null = null;

function scheduleUpdate(): void {
  if (animFrameId !== null) return;
  animFrameId = requestAnimationFrame(updateProximityState);
}

function updateProximityState(): void {
  animFrameId = null;

  const elements = document.querySelectorAll<HTMLElement>(
    '.proximity-card, .proximity-btn, .magnetic-btn, [data-proximity]'
  );

  const RADIUS = 110; // ~80-120px range

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top > window.innerHeight ||
      rect.right < 0 ||
      rect.left > window.innerWidth
    ) {
      return;
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const isMagnetic = el.classList.contains('magnetic-btn') || el.hasAttribute('data-magnetic');

    const isDirectlyOver =
      mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;

    if (isDirectlyOver || dist < RADIUS + Math.max(rect.width, rect.height) / 2) {
      // Distance from closest edge of element box
      const closestX = Math.max(rect.left, Math.min(mouseX, rect.right));
      const closestY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
      const edgeDx = mouseX - closestX;
      const edgeDy = mouseY - closestY;
      const edgeDist = Math.sqrt(edgeDx * edgeDx + edgeDy * edgeDy);

      let intensity = 0;
      if (isDirectlyOver) {
        intensity = 1.0;
      } else if (edgeDist <= RADIUS) {
        intensity = Math.pow(1 - edgeDist / RADIUS, 1.2);
      }

      // Cursor position inside element (percentage for radial highlight spotlight)
      const relativeX = Math.max(0, Math.min(100, ((mouseX - rect.left) / rect.width) * 100));
      const relativeY = Math.max(0, Math.min(100, ((mouseY - rect.top) / rect.height) * 100));

      el.style.setProperty('--proximity', intensity.toFixed(3));
      el.style.setProperty('--mouse-x', `${relativeX.toFixed(1)}%`);
      el.style.setProperty('--mouse-y', `${relativeY.toFixed(1)}%`);

      if (isMagnetic && intensity > 0) {
        const magPull = isDirectlyOver ? 3.5 : intensity * 2.5;
        const normDx = dist > 0 ? (dx / dist) * magPull : 0;
        const normDy = dist > 0 ? (dy / dist) * magPull : 0;
        el.style.setProperty('--mag-x', `${normDx.toFixed(1)}px`);
        el.style.setProperty('--mag-y', `${normDy.toFixed(1)}px`);
      } else {
        el.style.setProperty('--mag-x', '0px');
        el.style.setProperty('--mag-y', '0px');
      }
    } else {
      if (el.style.getPropertyValue('--proximity') !== '0') {
        el.style.setProperty('--proximity', '0');
        el.style.setProperty('--mag-x', '0px');
        el.style.setProperty('--mag-y', '0px');
      }
    }
  });
}
