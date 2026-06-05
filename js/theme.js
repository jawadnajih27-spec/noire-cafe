/**
 * theme.js
 * إدارة الثيم — الخلفية، الألوان، الـ CSS variables
 * تتغير بتغير الكوب النشط
 */

export class ThemeManager {
  constructor() {
    this.current = -1;
  }

  apply(cup) {
    if (this.current === cup.id) return;
    this.current = cup.id;

    // ── خلفية الصفحة ──
    document.body.style.background = cup.bgColor;

    // ── الهالة الشعاعية المركزية ──
    document.getElementById('bg-radial').style.background =
      `radial-gradient(ellipse 65% 65% at 50% 50%, ${cup.radial} 0%, transparent 70%)`;

    // ── صورة الخلفية الاختيارية ──
    const bgImg = document.getElementById('bg-img');
    bgImg.style.backgroundImage = `url('${cup.bg}')`;
    bgImg.classList.add('show');

    // ── CSS variables ──
    document.documentElement.style.setProperty('--gold', cup.gold);

    // ── هالة الكوب ──
    const halo = document.getElementById('halo-' + cup.id);
    if (halo) halo.style.background =
      `radial-gradient(circle, ${cup.halo} 0%, transparent 65%)`;

    // ── لون الشعار ──
    document.querySelector('.logo-name').style.color = cup.gold;
  }
}
