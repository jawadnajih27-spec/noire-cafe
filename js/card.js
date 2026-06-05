/**
 * card.js
 * فتح بطاقة المنتج:
 * 1. الكوب يخرج من الكاروسيل ويكبر في المنتصف
 * 2. الاسم يظهر خلفه
 * 3. التمرير يُشغّل قسم المكونات ثم المميزات
 */

export class Card {
  constructor(data, themeManager) {
    this.data    = data;
    this.theme   = themeManager;
    this.opened  = -1;
    this.onClose = null; // callback للكاروسيل

    this._buildScrollPages();
    this._bindScrollEvents();
  }

  /* ── بناء صفحات التمرير ── */
  _buildScrollPages() {
    const sc = document.getElementById('scroll-container');
    sc.innerHTML = `
      <!-- صفحة 1: hero ثابت -->
      <div class="scroll-page" id="sp-hero"></div>

      <!-- صفحة 2: المكونات -->
      <div class="scroll-page" id="sp-ingredients">
        <div class="info-panel" id="panel-ingredients">
          <div class="ip-label">المكونات</div>
          <h2 class="ip-title">تركيبة <em>أصيلة</em><br/>بعناية</h2>
          <div class="ip-rows" id="rows-ingredients"></div>
        </div>
      </div>

      <!-- صفحة 3: المميزات + الجلسات -->
      <div class="scroll-page" id="sp-features">
        <div class="info-panel" id="panel-features">
          <div class="ip-label">المميزات</div>
          <h2 class="ip-title">مثالي <em>لكل</em><br/>جلسة</h2>
          <div class="ip-rows" id="rows-features"></div>
          <div class="sessions-row" id="sessions-row"></div>
          <button class="ip-btn" id="order-btn">اطلب الآن ←</button>
        </div>
      </div>
    `;
  }

  /* ── فتح بطاقة الكوب ── */
  open(idx) {
    this.opened = idx;
    const cup   = this.data[idx];

    // ── 1. ملء بيانات صفحات التمرير ──
    this._fillPanels(cup);

    // ── 2. إظهار الكوب البطل ──
    const heroCup = document.getElementById('hero-cup');
    heroCup.innerHTML = `
      <img src="${cup.image}" alt="${cup.label}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
      <div class="cup-ph" style="display:none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        </svg>
        <span>${cup.slug}.png</span>
      </div>
    `;
    setTimeout(() => heroCup.classList.add('show'), 50);

    // ── 3. إظهار الاسم خلف الكوب ──
    const heroName = document.getElementById('hero-name');
    heroName.innerHTML = cup.name
      .map(line => `<span class="hero-name-line">${line}</span>`)
      .join('');
    setTimeout(() => heroName.classList.add('show'), 200);

    // ── 4. إظهار كوب التمرير (مخفي حتى نمرر) ──
    this._buildScrollCup(cup);

    // ── 5. إظهار scroll hint ──
    setTimeout(() => {
      document.getElementById('scroll-hint').classList.add('show');
    }, 1200);

    // ── 6. إظهار حاوية التمرير ──
    setTimeout(() => {
      const sc = document.getElementById('scroll-container');
      sc.classList.add('show');
      sc.scrollTop = 0;
    }, 600);

    // ── 7. إظهار زر الإغلاق ──
    document.getElementById('close-btn').classList.add('show');
  }

  /* ── بناء صورة الكوب في التمرير ── */
  _buildScrollCup(cup) {
    const sc = document.getElementById('scroll-cup');
    sc.innerHTML = `
      <img src="${cup.image}" alt="${cup.label}"
           onerror="this.style.display='none'"/>
    `;
  }

  /* ── ملء بيانات الأقسام ── */
  _fillPanels(cup) {
    // مكونات
    document.getElementById('rows-ingredients').innerHTML =
      cup.ingredients.map(r => `
        <div class="ip-row">
          <h4>${r.title}</h4>
          <p>${r.desc}</p>
        </div>
      `).join('');

    // مميزات
    document.getElementById('rows-features').innerHTML =
      cup.features.map(r => `
        <div class="ip-row">
          <h4>${r.title}</h4>
          <p>${r.desc}</p>
        </div>
      `).join('');

    // جلسات
    document.getElementById('sessions-row').innerHTML =
      cup.sessions.map(s => `<span class="session-tag">${s}</span>`).join('');
  }

  /* ── إغلاق البطاقة ── */
  close() {
    if (this.opened === -1) return;
    this.opened = -1;

    // إخفاء الكوب البطل
    document.getElementById('hero-cup').classList.remove('show');
    document.getElementById('hero-name').classList.remove('show');
    document.getElementById('scroll-hint').classList.remove('show');

    // إخفاء حاوية التمرير
    const sc = document.getElementById('scroll-container');
    sc.classList.remove('show');
    setTimeout(() => { sc.scrollTop = 0; }, 400);

    // إخفاء كوب التمرير
    const scrollCup = document.getElementById('scroll-cup');
    scrollCup.classList.remove('show');
    scrollCup.style.left      = '50%';
    scrollCup.style.top       = '50%';
    scrollCup.style.transform = 'translate(-50%,-50%) scale(0.8)';

    // إخفاء زر الإغلاق
    document.getElementById('close-btn').classList.remove('show');

    // callback للكاروسيل
    setTimeout(() => {
      if (this.onClose) this.onClose();
    }, 200);
  }

  /* ── أحداث التمرير ── */
  _bindScrollEvents() {
    const sc = document.getElementById('scroll-container');

    sc.addEventListener('scroll', () => {
      const scrollY  = sc.scrollTop;
      const pageH    = window.innerHeight;
      const progress = scrollY / pageH; // 0=hero, 1=ingredients, 2=features

      this._updateScrollCup(progress);
      this._updatePanels(progress);
    }, { passive: true });
  }

  /* ── تحريك الكوب بين الأقسام ── */
  _updateScrollCup(progress) {
    const sc   = document.getElementById('scroll-cup');
    const W    = window.innerWidth;
    const H    = window.innerHeight;

    if (progress < 0.05) {
      // قسم الـ hero — كوب التمرير مخفي (الكوب البطل يأخذ مكانه)
      sc.classList.remove('show');
      return;
    }

    sc.classList.add('show');

    let x, y, scaleVal;

    if (progress < 1.0) {
      // الانتقال من hero إلى ingredients
      const t = Math.max(0, Math.min(1, (progress - 0.05) / 0.9));
      // يبدأ من المنتصف ويذهب لليمين
      x      = W * (0.5  + t * 0.25);   // 50% → 75%
      y      = H * (0.5  - t * 0.05);   // يرتفع قليلاً
      scaleVal = 0.85 - t * 0.18;        // يصغر
    } else if (progress < 2.0) {
      // الانتقال من ingredients إلى features
      const t = Math.max(0, Math.min(1, progress - 1.0));
      // من اليمين إلى اليسار
      x      = W * (0.75 - t * 0.55);   // 75% → 20%
      y      = H * 0.48;
      scaleVal = 0.67;
    } else {
      x      = W * 0.20;
      y      = H * 0.48;
      scaleVal = 0.67;
    }

    sc.style.left      = x + 'px';
    sc.style.top       = y + 'px';
    sc.style.transform = `translate(-50%,-50%) scale(${scaleVal.toFixed(3)})`;
  }

  /* ── إظهار/إخفاء الأقسام ── */
  _updatePanels(progress) {
    // قسم المكونات: يظهر عند progress ≥ 0.85
    const pIngr = document.getElementById('panel-ingredients');
    const pFeat = document.getElementById('panel-features');

    if (progress >= 0.85 && progress < 1.9) {
      if (!pIngr.classList.contains('show')) {
        pIngr.classList.add('show');
        this._animateRows('rows-ingredients');
      }
      pFeat.classList.remove('show');
    } else if (progress >= 1.85) {
      if (!pFeat.classList.contains('show')) {
        pFeat.classList.add('show');
        this._animateRows('rows-features');
        this._animateSessions();
        setTimeout(() => {
          document.getElementById('order-btn').classList.add('show');
        }, 600);
      }
      pIngr.classList.remove('show');
      document.getElementById('scroll-hint').classList.remove('show');
    } else {
      pIngr.classList.remove('show');
      pFeat.classList.remove('show');
    }
  }

  /* ── تأثير ظهور الصفوف ── */
  _animateRows(containerId) {
    const rows = document.querySelectorAll('#' + containerId + ' .ip-row');
    rows.forEach((row, i) => {
      setTimeout(() => row.classList.add('show'), i * 120);
    });
  }

  /* ── تأثير ظهور الجلسات ── */
  _animateSessions() {
    const tags = document.querySelectorAll('.session-tag');
    tags.forEach((tag, i) => {
      setTimeout(() => tag.classList.add('show'), 300 + i * 80);
    });
  }
}
