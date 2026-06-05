/**
 * cursor.js
 * cursor مخصص مع ring يتبع بتأخير ناعم
 */

export function initCursor() {
  const cur  = document.getElementById('cur');
  const ring = document.getElementById('cur-ring');
  if (!cur || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px';
    cur.style.top  = my + 'px';
  });

  (function raf() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(raf);
  })();

  // تكبير الـ ring عند hover على عناصر تفاعلية
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('button, .cup-item, a, .ndot');
    if (el) {
      ring.style.width        = '54px';
      ring.style.height       = '54px';
      ring.style.borderColor  = 'rgba(255,255,255,.55)';
    } else {
      ring.style.width        = '36px';
      ring.style.height       = '36px';
      ring.style.borderColor  = 'rgba(255,255,255,.28)';
    }
  });
}
