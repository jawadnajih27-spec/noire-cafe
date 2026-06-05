/**
 * carousel.js
 * الدائرة المنحنية — الأكواب تتحرك على قوس منحنٍ في أعلى الشاشة
 * كل كوب يظهر على حدة من اليمين ويختفي من اليسار
 */

export class Carousel {
  constructor(data, onSelect) {
    this.data      = data;          // مصفوفة بيانات الأكواب
    this.onSelect  = onSelect;      // callback عند الضغط على كوب
    this.current   = 0;
    this.locked    = false;
    this.elements  = [];            // عناصر DOM للأكواب

    this._buildDOM();
    this._bindEvents();
  }

  /* ── بناء DOM الأكواب ── */
  _buildDOM() {
    const stage = document.getElementById('carousel-stage');
    this.data.forEach((cup, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'cup-item';
      wrap.id = 'cup-' + i;
      wrap.innerHTML = `
        <div class="cup-halo"></div>
        <img
          src="${cup.image}"
          alt="${cup.label}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="cup-ph" style="display:none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          </svg>
          <span>${cup.slug}.png</span>
        </div>
      `;
      stage.appendChild(wrap);
      this.elements.push(wrap);
    });

    this.layout(false);
    this._setActive(0);
  }

  /* ── حساب المواضع على القوس المنحني ──
     rel = 0  → الكوب النشط (وسط الشاشة)
     rel = 1  → التالي (يمين الشاشة، مخفي جزئياً)
     rel = -1 → السابق (يسار الشاشة، مخفي جزئياً)
     غير ذلك → مخفي تماماً خارج الشاشة
  ──────────────────────────────────────── */
  _getPos(rel) {
    const W  = window.innerWidth;
    const H  = document.getElementById('carousel-stage').offsetHeight;
    const N  = this.data.length;

    /* القوس: الكوب النشط في القمة، الجانبيان أسفل قليلاً */
    const ARC_DEPTH = H * 0.12; /* عمق القوس — كلما زاد كلما بدا الانحناء أوضح */

    /* الكوب النشط */
    if (rel === 0) return {
      x: W / 2,
      y: H - ARC_DEPTH * 0,   /* القمة */
      scale: 1.0,
      opacity: 1,
      blur: 0,
    };

    /* الكوب التالي — يمين */
    if (rel === 1) return {
      x: W * 0.80,
      y: H - ARC_DEPTH * 0.0,
      scale: 0.62,
      opacity: 0.42,
      blur: 3,
    };

    /* الكوب السابق — يسار */
    if (rel === N - 1) return {
      x: W * 0.20,
      y: H - ARC_DEPTH * 0.0,
      scale: 0.62,
      opacity: 0.42,
      blur: 3,
    };

    /* بعيد جداً — مخفي — خارج الشاشة */
    if (rel >= 2 && rel < N - 1) return {
      x: W * 1.3,
      y: H,
      scale: 0.2,
      opacity: 0,
      blur: 0,
    };

    return { x: W / 2, y: H, scale: 0, opacity: 0, blur: 0 };
  }

  /* ── تطبيق المواضع ── */
  layout(animate) {
    const N = this.data.length;
    this.elements.forEach((el, i) => {
      const rel = ((i - this.current) % N + N) % N;
      const pos = this._getPos(rel);

      if (!animate) {
        el.style.transition = 'none';
      } else {
        el.style.transition =
          'left 0.85s cubic-bezier(0.22,1,0.36,1),' +
          'bottom 0.85s cubic-bezier(0.22,1,0.36,1),' +
          'transform 0.85s cubic-bezier(0.22,1,0.36,1),' +
          'opacity 0.65s ease,' +
          'filter 0.65s ease';
      }

      el.style.left      = pos.x + 'px';
      el.style.bottom    = (document.getElementById('carousel-stage').offsetHeight - pos.y) + 'px';
      el.style.transform = `translateX(-50%) scale(${pos.scale})`;
      el.style.opacity   = pos.opacity;
      el.style.filter    = pos.blur ? `blur(${pos.blur}px)` : 'none';
      el.style.zIndex    = rel === 0 ? 15 : rel === 1 || rel === N-1 ? 10 : 5;
      el.style.pointerEvents = rel === 0 ? 'auto' : 'none';
    });
  }

  /* ── تحديد الكوب النشط ── */
  _setActive(idx) {
    this.elements.forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    // تحديث dots
    document.querySelectorAll('.ndot').forEach((d, i) => {
      d.classList.toggle('on', i === idx);
    });
    // تحديث counter
    const N = this.data.length;
    document.getElementById('counter').textContent =
      String(idx + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
  }

  /* ── التنقل ── */
  go(dir) {
    if (this.locked) return;
    this.locked = true;
    const N = this.data.length;
    this.current = (this.current + dir + N) % N;
    this.layout(true);
    this._setActive(this.current);
    setTimeout(() => { this.locked = false; }, 900);
  }

  goTo(idx) {
    if (this.locked || idx === this.current) return;
    this.locked = true;
    this.current = idx;
    this.layout(true);
    this._setActive(idx);
    setTimeout(() => { this.locked = false; }, 900);
  }

  /* ── إخفاء الكاروسيل عند فتح البطاقة ── */
  hide() {
    const stage = document.getElementById('carousel-stage');
    stage.style.transition = 'opacity .5s ease, transform .5s ease';
    stage.style.opacity    = '0';
    stage.style.transform  = 'translateY(-30px)';
    stage.style.pointerEvents = 'none';
    document.getElementById('nav-dots').style.opacity = '0';
    document.getElementById('nav-dots').style.pointerEvents = 'none';
    document.getElementById('swipe-hint').style.opacity = '0';
  }

  /* ── إظهار الكاروسيل عند الإغلاق ── */
  show() {
    const stage = document.getElementById('carousel-stage');
    stage.style.transition = 'opacity .6s ease, transform .6s ease';
    stage.style.opacity    = '1';
    stage.style.transform  = 'translateY(0)';
    stage.style.pointerEvents = 'auto';
    document.getElementById('nav-dots').style.opacity      = '1';
    document.getElementById('nav-dots').style.pointerEvents = 'auto';
  }

  /* ── أحداث الضغط والسحب ── */
  _bindEvents() {
    // ضغط على الكوب النشط
    this.elements.forEach((el, i) => {
      el.addEventListener('click', () => {
        if (i === this.current && !this.locked) {
          this.onSelect(i);
        }
      });
    });

    // Dots
    document.querySelectorAll('.ndot').forEach(d => {
      d.addEventListener('click', () => {
        this.goTo(parseInt(d.dataset.i));
      });
    });

    // Swipe
    let tx = 0;
    document.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 48) this.go(dx > 0 ? -1 : 1);
    }, { passive: true });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  this.go(-1);
      if (e.key === 'ArrowRight') this.go(1);
    });

    // Resize
    window.addEventListener('resize', () => this.layout(false));
  }

  /* ── الطفو ── */
  startFloat() {
    const offsets = this.data.map((_, i) => i * (Math.PI * 2 / this.data.length));
    let t = 0;
    const N = this.data.length;
    const tick = () => {
      t += 0.007;
      this.elements.forEach((el, i) => {
        const rel = ((i - this.current) % N + N) % N;
        if (rel !== 0) { requestAnimationFrame(tick); return; }
        // طفو خفيف للكوب النشط فقط
        const fy = Math.sin(t + offsets[i]) * 8;
        const fr = Math.sin(t * 0.6 + offsets[i]) * 1.2;
        const stage = document.getElementById('carousel-stage');
        const H = stage.offsetHeight;
        const pos = this._getPos(0);
        el.style.bottom    = (H - pos.y + fy) + 'px';
        el.style.transform = `translateX(-50%) scale(${pos.scale}) rotate(${fr}deg)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
