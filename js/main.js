/**
 * main.js
 * المنسق الرئيسي — يحمل البيانات ويربط كل الوحدات
 */

import { Carousel }      from './carousel.js';
import { Card }          from './card.js';
import { ThemeManager }  from './theme.js';
import { initCursor }    from './cursor.js';

/* ═══════════════════════════════════════════
   BOOT
═══════════════════════════════════════════ */
async function boot() {
  /* ── تحميل البيانات ── */
  const res  = await fetch('data/data.json');
  const json = await res.json();
  const cups = json.cups;

  /* ── تهيئة الوحدات ── */
  const theme    = new ThemeManager();
  const card     = new Card(cups, theme);
  const carousel = new Carousel(cups, onCupSelected);

  /* ── Cursor ── */
  initCursor();

  /* ── تطبيق الثيم الأول ── */
  theme.apply(cups[0]);

  /* ── بدء الطفو ── */
  carousel.startFloat();

  /* ── مزامنة الثيم مع تغيير الكوب ── */
  const origGo   = carousel.go.bind(carousel);
  const origGoTo = carousel.goTo.bind(carousel);

  carousel.go = function(dir) {
    origGo(dir);
    setTimeout(() => theme.apply(cups[carousel.current]), 100);
  };
  carousel.goTo = function(idx) {
    origGoTo(idx);
    setTimeout(() => theme.apply(cups[carousel.current]), 100);
  };

  /* ── callback إغلاق البطاقة ── */
  card.onClose = () => {
    carousel.show();
    theme.apply(cups[carousel.current]);
  };

  /* ── زر الإغلاق ── */
  document.getElementById('close-btn').addEventListener('click', () => {
    card.close();
  });

  /* ── Escape ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') card.close();
  });

  /* ── Swipe hint: إخفاء بعد 3.5s ── */
  setTimeout(() => {
    document.getElementById('swipe-hint').style.opacity = '0';
  }, 3500);

  /* ═══ onCupSelected ═══ */
  function onCupSelected(idx) {
    theme.apply(cups[idx]);
    carousel.hide();
    card.open(idx);
  }
}

/* ── تشغيل عند جاهزية الـ DOM ── */
document.addEventListener('DOMContentLoaded', boot);
