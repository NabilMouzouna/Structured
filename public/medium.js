/* ============================================================================
   Aramon Medium Physics — engine
   Future home: @aramon-it/medium
   Framework-free, zero dependencies, classic script (works over file://).

   Two ideas carried over from the material study, both load-bearing:

     THE COMPONENT IS THE VESSEL.  Each surface owns a sealed pool. Energy is
     injected only while the pointer is inside that surface, in its own
     coordinates, and never crosses into a neighbour. The component itself never
     moves — it is the glass, not something floating in the glass.

     THE LIQUID PAINTS BELOW THE TEXT.  Always. Nothing here distorts, magnifies
     or moves a glyph. Two more physically faithful implementations were built
     and thrown away over exactly this.

   What is new here is the DIRECTOR. In the study every surface simulated itself,
   so cost grew with component count. Here one loop drives at most `maxActive`
   pools — the most recently touched — and every other surface is inert. Cost is
   O(1) in the number of components, which is the whole reason a dense screen can
   afford this at all.
   ========================================================================= */
(function (global) {
  'use strict';

  /* ---- physics (values verified in the material study — see ../README.md) -- */
  const CELL   = 10;    // px per grid cell. Sets wave speed in SCREEN px.
  const C_WAVE = 0.42;  // must stay under ~0.5 or the integration goes unstable
  const DAMP_V = 0.968; // velocity damping — this number IS the viscosity
  const DAMP_H = 0.984; // displacement decay — return to calm
  const SMOOTH = 0.14;  // light diffusion in the field
  const SMOOTH_PASSES = 1;
  const LX = 0.55, LY = -0.83;   // fixed light direction; shade by slope
  const QUIET = 0.02;

  /* ---- rendering ---------------------------------------------------------- */
  // Render resolution is decoupled from physics resolution. The old CSS
  // blur(7px) smoothed in DISPLAY space; blurring the field instead changes the
  // physics, and blurring the coarse shading amplifies the grid in dim regions.
  // Both were tried. This upsamples and blurs at render resolution instead.
  const SS = 2;
  const BLUR_PASSES = 2;
  const GAIN = 1.5;     // restores the peak brightness the blur spreads out

  const mqReduce = global.matchMedia('(prefers-reduced-motion: reduce)');
  const mqNoHover = global.matchMedia('(hover: none)');

  /* ========================================================================
     TIER — measured, not sniffed from the user agent. A current Mac should get
     the full material even though it is WebKit.
     ===================================================================== */
  function detectTier() {
    const supportsBackdrop =
      (global.CSS && CSS.supports && (CSS.supports('backdrop-filter', 'blur(1px)') ||
                                      CSS.supports('-webkit-backdrop-filter', 'blur(1px)')));
    if (!supportsBackdrop) return 'flat';
    if (mqReduce.matches) return 'flat';

    const conn = navigator.connection;
    if (conn && conn.saveData) return 'flat';

    const cores = navigator.hardwareConcurrency || 8;
    const mem   = navigator.deviceMemory || 8;      // Chromium only; undefined elsewhere
    if (cores <= 4 || mem <= 4) return 'reduced';
    if (mqNoHover.matches) return 'reduced';        // no hover ⇒ no continuous stir anyway

    return 'full';
  }

  /* ========================================================================
     POOL — one sealed simulation, confined to one element.
     ===================================================================== */
  class Pool {
    constructor(el, mode) {
      this.el = el;
      this.mode = mode;              // 'stir' | 'press'
      this.visible = false;
      this.live = false;             // the director decides this
      this.asleep = true;
      this.last = null;
      this.rect = null;

      this.canvas = document.createElement('canvas');
      const layer = document.createElement('span');
      layer.className = 'am-medium__fluid';
      layer.setAttribute('aria-hidden', 'true');
      layer.appendChild(this.canvas);
      el.prepend(layer);
      this.layer = layer;
      this.ctx = this.canvas.getContext('2d');

      this.measure();

      this.onEnter = () => { this.rect = null; director.promote(this); };
      this.onMove = (e) => {
        if (this.mode !== 'stir' || !this.live) return;
        const r = this.bounds();
        this.stir(e.clientX - r.left, e.clientY - r.top, performance.now());
      };
      this.onDown = (e) => {
        director.promote(this);
        const r = this.bounds();
        this.press(e.clientX - r.left, e.clientY - r.top);
      };
      this.onLeave = () => { this.last = null; };

      el.addEventListener('pointerenter', this.onEnter, { passive: true });
      el.addEventListener('pointermove', this.onMove, { passive: true });
      el.addEventListener('pointerdown', this.onDown, { passive: true });
      el.addEventListener('pointerleave', this.onLeave, { passive: true });
    }

    destroy() {
      this.el.removeEventListener('pointerenter', this.onEnter);
      this.el.removeEventListener('pointermove', this.onMove);
      this.el.removeEventListener('pointerdown', this.onDown);
      this.el.removeEventListener('pointerleave', this.onLeave);
      if (this.layer.parentNode) this.layer.parentNode.removeChild(this.layer);
    }

    // Cached bounds. getBoundingClientRect() forces a synchronous layout, so
    // calling it per pointermove cost one layout flush per event, per pool.
    bounds() {
      if (!this.rect) this.rect = this.el.getBoundingClientRect();
      return this.rect;
    }

    measure() {
      const r = this.el.getBoundingClientRect();
      this.rect = r;
      this.cols = Math.max(4, Math.ceil(Math.max(1, r.width) / CELL));
      this.rows = Math.max(4, Math.ceil(Math.max(1, r.height) / CELL));
      const n = this.cols * this.rows;

      this.h_ = new Float32Array(n);
      this.v_ = new Float32Array(n);
      this.tmp = new Float32Array(n);
      this.a_ = new Float32Array(n);

      this.ocols = this.cols * SS;
      this.orows = this.rows * SS;
      const on = this.ocols * this.orows;
      this.o_ = new Float32Array(on);
      this.ob = new Float32Array(on);

      this.canvas.width = this.ocols;
      this.canvas.height = this.orows;
      this.img = this.ctx.createImageData(this.ocols, this.orows);
      const d = this.img.data;
      const cssColor = getComputedStyle(this.el).getPropertyValue('--physics-color').trim();
      const rgb = cssColor.split(',').map((value) => Number.parseInt(value.trim(), 10));
      const red = Number.isFinite(rgb[0]) ? rgb[0] : 230;
      const green = Number.isFinite(rgb[1]) ? rgb[1] : 235;
      const blue = Number.isFinite(rgb[2]) ? rgb[2] : 226;
      for (let i = 0; i < on; i++) { d[i * 4] = red; d[i * 4 + 1] = green; d[i * 4 + 2] = blue; }

      this.asleep = true;
      this.ctx.clearRect(0, 0, this.ocols, this.orows);
    }

    // Settle, don't pause. A pool we merely stop stepping would freeze mid-ripple
    // and still be frozen when it comes back into view.
    reset() {
      this.h_.fill(0); this.v_.fill(0); this.tmp.fill(0);
      this.last = null;
      this.asleep = true;
      this.ctx.clearRect(0, 0, this.ocols, this.orows);
    }

    dent(px, py, amp, radCells) {
      const cx = px / CELL, cy = py / CELL, r2 = radCells * radCells;
      const x0 = Math.max(0, Math.floor(cx - radCells)), x1 = Math.min(this.cols - 1, Math.ceil(cx + radCells));
      const y0 = Math.max(0, Math.floor(cy - radCells)), y1 = Math.min(this.rows - 1, Math.ceil(cy + radCells));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const dx = x - cx, dy = y - cy, d2 = dx * dx + dy * dy;
          if (d2 > r2) continue;
          const f = 1 - d2 / r2;
          this.h_[y * this.cols + x] -= amp * f * f;
        }
      }
      this.asleep = false;
    }

    // Seeded along the whole segment, so a fast flick leaves a continuous trench
    // rather than a dotted line.
    stir(px, py, t) {
      const last = this.last;
      this.last = { x: px, y: py, t: t };
      if (!last) return;
      const dt = Math.max(0.001, (t - last.t) / 1000);
      const dx = px - last.x, dy = py - last.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.6) return;
      const speed = Math.min(1, (dist / dt) / 1600);
      const amp = 0.05 + speed * 0.40;
      const steps = Math.min(16, Math.max(1, Math.round(dist / (CELL * 0.6))));
      for (let i = 1; i <= steps; i++) {
        const f = i / steps;
        this.dent(last.x + dx * f, last.y + dy * f, (amp / steps) * 2.2, 2.0);
      }
    }

    press(px, py) { this.dent(px, py, 2.4, 3.0); }

    step(dtScale) {
      if (this.asleep) return;
      const cols = this.cols, rows = this.rows;
      const H = this.h_, V = this.v_, T = this.tmp;
      const dampV = Math.pow(DAMP_V, dtScale), dampH = Math.pow(DAMP_H, dtScale);

      // Clamped indices at the border make the component's own edges reflect,
      // which is what gives it walls.
      for (let y = 0; y < rows; y++) {
        const yo = y * cols;
        const yu = (y > 0 ? y - 1 : 0) * cols;
        const yd = (y < rows - 1 ? y + 1 : rows - 1) * cols;
        for (let x = 0; x < cols; x++) {
          const xl = x > 0 ? x - 1 : 0, xr = x < cols - 1 ? x + 1 : cols - 1;
          const i = yo + x;
          const lap = (H[yo + xl] + H[yo + xr] + H[yu + x] + H[yd + x]) * 0.25 - H[i];
          V[i] = (V[i] + lap * C_WAVE * dtScale) * dampV;
        }
      }

      let total = 0;
      for (let i = 0, n = cols * rows; i < n; i++) {
        H[i] = (H[i] + V[i] * dtScale) * dampH;
        total += H[i] < 0 ? -H[i] : H[i];
      }

      let src = H, dst = T;
      for (let pass = 0; pass < SMOOTH_PASSES; pass++) {
        for (let y = 0; y < rows; y++) {
          const yo = y * cols;
          const yu = (y > 0 ? y - 1 : 0) * cols;
          const yd = (y < rows - 1 ? y + 1 : rows - 1) * cols;
          for (let x = 0; x < cols; x++) {
            const xl = x > 0 ? x - 1 : 0, xr = x < cols - 1 ? x + 1 : cols - 1;
            const i = yo + x;
            const avg = (src[yo + xl] + src[yo + xr] + src[yu + x] + src[yd + x]) * 0.25;
            dst[i] = src[i] + (avg - src[i]) * SMOOTH;
          }
        }
        const sw = src; src = dst; dst = sw;
      }
      this.h_ = src; this.tmp = dst;

      this.paint();

      if (total < QUIET && !this.last) {
        this.asleep = true;
        this.ctx.clearRect(0, 0, this.ocols, this.orows);
      }
    }

    // Shade by SLOPE, not height — that is what turns a ripple into a ring
    // rather than a bright smudge.
    paint() {
      const cols = this.cols, rows = this.rows;
      const H = this.h_, A = this.a_;

      for (let y = 0; y < rows; y++) {
        const yo = y * cols;
        const yu = (y > 0 ? y - 1 : 0) * cols;
        const yd = (y < rows - 1 ? y + 1 : rows - 1) * cols;
        for (let x = 0; x < cols; x++) {
          const xl = x > 0 ? x - 1 : 0, xr = x < cols - 1 ? x + 1 : cols - 1;
          const i = yo + x;
          const spec = (H[yo + xr] - H[yo + xl]) * LX + (H[yd + x] - H[yu + x]) * LY;
          const a = spec * 1.35 + Math.abs(H[i]) * 0.30;
          A[i] = a > 0 ? a : 0;    // ceiling deferred until after the blur
        }
      }

      // Bilinear upsample to render resolution. Sample points are cell centres,
      // hence the ±0.5; getting that wrong shifts the field half a cell and
      // skews the lighting.
      const ocols = this.ocols, orows = this.orows;
      let O = this.o_, P = this.ob;
      const inv = 1 / SS;
      for (let Y = 0; Y < orows; Y++) {
        const fy = (Y + 0.5) * inv - 0.5;
        let y0 = Math.floor(fy); const ty = fy - y0; if (y0 < 0) y0 = 0;
        const y1 = y0 + 1 < rows ? y0 + 1 : rows - 1;
        const r0 = y0 * cols, r1 = y1 * cols, oro = Y * ocols;
        for (let X = 0; X < ocols; X++) {
          const fx = (X + 0.5) * inv - 0.5;
          let x0 = Math.floor(fx); const tx = fx - x0; if (x0 < 0) x0 = 0;
          const x1 = x0 + 1 < cols ? x0 + 1 : cols - 1;
          const top = A[r0 + x0] + (A[r0 + x1] - A[r0 + x0]) * tx;
          const bot = A[r1 + x0] + (A[r1 + x1] - A[r1 + x0]) * tx;
          O[oro + X] = top + (bot - top) * ty;
        }
      }

      for (let pass = 0; pass < BLUR_PASSES; pass++) {
        for (let Y = 0; Y < orows; Y++) {
          const yo = Y * ocols;
          for (let X = 0; X < ocols; X++) {
            const xl = X > 0 ? X - 1 : 0, xr = X < ocols - 1 ? X + 1 : ocols - 1;
            P[yo + X] = (O[yo + xl] + 2 * O[yo + X] + O[yo + xr]) * 0.25;
          }
        }
        for (let Y = 0; Y < orows; Y++) {
          const yo = Y * ocols;
          const yu = (Y > 0 ? Y - 1 : 0) * ocols;
          const yd = (Y < orows - 1 ? Y + 1 : orows - 1) * ocols;
          for (let X = 0; X < ocols; X++) {
            O[yo + X] = (P[yu + X] + 2 * P[yo + X] + P[yd + X]) * 0.25;
          }
        }
      }

      const d = this.img.data;
      for (let i = 0, n = ocols * orows; i < n; i++) {
        const a = O[i] * GAIN;
        d[i * 4 + 3] = a >= 1 ? 232 : a * 232;
      }
      this.ctx.putImageData(this.img, 0, 0);
    }
  }

  /* ========================================================================
     DIRECTOR — one loop, one budget.
     ===================================================================== */
  const director = {
    pools: [],
    byEl: new WeakMap(),
    order: [],            // most recently touched first
    maxActive: 1,
    tier: 'full',
    rafId: null,
    prev: 0,
    // Watchdog. Measures time spent in OUR step loop — not the rAF interval,
    // which just reports vsync and would look fine no matter how slow we were.
    work: 0, samples: 0, demoted: false,

    promote(pool) {
      const i = this.order.indexOf(pool);
      if (i === 0) return;
      if (i > 0) this.order.splice(i, 1);
      this.order.unshift(pool);
      this.enforce();
    },

    enforce() {
      for (let i = 0; i < this.order.length; i++) {
        const p = this.order[i];
        const shouldBeLive = i < this.maxActive;
        if (p.live !== shouldBeLive) {
          p.live = shouldBeLive;
          if (!shouldBeLive) p.reset();
        }
      }
    },

    frame(now) {
      const dtScale = Math.min(2.5, Math.max(0.2, (now - this.prev) / 16.667));
      this.prev = now;

      const t0 = performance.now();
      for (let i = 0; i < this.order.length && i < this.maxActive; i++) {
        const p = this.order[i];
        if (p.visible && !p.asleep) p.step(dtScale);
      }
      this.work += performance.now() - t0;
      this.samples++;

      // Sustained cost over ~2s of frames means this device cannot afford the
      // full material. Step down once, never oscillate.
      if (!this.demoted && this.samples >= 120) {
        const avg = this.work / this.samples;
        if (avg > 6 && this.tier === 'full') this.setTier('reduced');
        else if (avg > 10) this.setTier('flat');
        this.work = 0; this.samples = 0;
      }

      this.rafId = requestAnimationFrame(this.frame.bind(this));
    },

    start() {
      if (this.rafId !== null || this.tier === 'flat') return;
      this.prev = performance.now();
      this.rafId = requestAnimationFrame(this.frame.bind(this));
    },
    stop() {
      if (this.rafId === null) return;
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    },

    setTier(tier) {
      this.tier = tier;
      this.demoted = tier !== 'full';
      document.documentElement.setAttribute('data-aramon-tier', tier);
      if (tier === 'flat') {
        this.stop();
        this.pools.forEach((p) => p.reset());
      }
    },
  };

  /* ========================================================================
     Observers
     ===================================================================== */
  // Re-measuring synchronously inside the observer callback reallocates the
  // canvas, which can retrigger the observer in the same delivery cycle —
  // WebKit reports that as "ResizeObserver loop completed with undelivered
  // notifications". Two guards: defer the work to the next frame so it lands
  // outside the callback, and skip entirely when the GRID dimensions have not
  // actually changed (a few pixels of resize usually rounds to the same grid).
  let pendingMeasure = null;
  const scheduleMeasure = (pool) => {
    if (!pendingMeasure) {
      pendingMeasure = new Set();
      requestAnimationFrame(() => {
        const batch = pendingMeasure;
        pendingMeasure = null;
        batch.forEach((p) => {
          const r = p.el.getBoundingClientRect();
          const cols = Math.max(4, Math.ceil(Math.max(1, r.width) / CELL));
          const rows = Math.max(4, Math.ceil(Math.max(1, r.height) / CELL));
          if (cols !== p.cols || rows !== p.rows) p.measure();
          else p.rect = r;                 // same grid, just a stale rect
        });
      });
    }
    pendingMeasure.add(pool);
  };

  const ro = global.ResizeObserver ? new ResizeObserver((entries) => {
    entries.forEach((e) => { const p = director.byEl.get(e.target); if (p) scheduleMeasure(p); });
  }) : null;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const p = director.byEl.get(e.target);
      if (!p) return;
      p.visible = e.isIntersecting;
      if (!p.visible) p.reset();
    });
  }, { threshold: 0 });

  // One scroll listener for every pool: scrolling stales every cached rect at once.
  addEventListener('scroll', () => {
    for (const p of director.pools) p.rect = null;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    document.hidden ? director.stop() : director.start();
  });

  /* ========================================================================
     Public API
     ===================================================================== */
  const API = {
    get tier() { return director.tier; },

    configure(opts) {
      if (!opts) return API;
      if (typeof opts.maxActive === 'number') { director.maxActive = Math.max(1, opts.maxActive); director.enforce(); }
      if (opts.tier) director.setTier(opts.tier);
      return API;
    },

    attach(el, opts) {
      if (!el || director.byEl.has(el)) return API;
      document.documentElement.setAttribute('data-aramon-tier', director.tier);
      if (director.tier === 'flat') return API;

      // No hover means no continuous stir — there is nothing to stir with.
      let mode = (opts && opts.mode) || 'stir';
      if (mqNoHover.matches || director.tier === 'reduced') mode = 'press';
      if (mode === 'off') return API;

      const pool = new Pool(el, mode);
      director.pools.push(pool);
      director.byEl.set(el, pool);
      director.order.push(pool);
      director.enforce();
      if (ro) ro.observe(el);
      io.observe(el);
      director.start();
      return API;
    },

    detach(el) {
      const pool = director.byEl.get(el);
      if (!pool) return API;
      pool.destroy();
      director.byEl.delete(el);
      director.pools.splice(director.pools.indexOf(pool), 1);
      const i = director.order.indexOf(pool);
      if (i >= 0) director.order.splice(i, 1);
      if (ro) ro.unobserve(el);
      io.unobserve(el);
      director.enforce();
      return API;
    },

    // Motion is OPT-IN by attribute. A default gets used everywhere by accident;
    // an attribute gets reached for deliberately.
    refresh() {
      document.querySelectorAll('[data-medium-physics]').forEach((el) => {
        API.attach(el, { mode: el.getAttribute('data-medium-physics') || 'stir' });
      });
      return API;
    },
  };

  // Initialisation is deliberately side-effect free. Framework adapters call
  // attach() after hydration, preventing the engine from changing the DOM while
  // React is still reconciling server markup. Non-framework pages can opt in
  // explicitly with AramonMedium.refresh().
  director.tier = detectTier();
  director.demoted = director.tier !== 'full';

  global.AramonMedium = API;
})(window);
