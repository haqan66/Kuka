var Xa = Object.defineProperty;
var Qa = (t, e, o) =>
  e in t ? Xa(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : (t[e] = o);
var u = (t, e, o) => Qa(t, typeof e != "symbol" ? e + "" : e, o);
(function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const l of document.querySelectorAll('link[rel="modulepreload"]')) a(l);
  new MutationObserver((l) => {
    for (const n of l)
      if (n.type === "childList")
        for (const i of n.addedNodes) i.tagName === "LINK" && i.rel === "modulepreload" && a(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function o(l) {
    const n = {};
    return (
      l.integrity && (n.integrity = l.integrity),
      l.referrerPolicy && (n.referrerPolicy = l.referrerPolicy),
      l.crossOrigin === "use-credentials"
        ? (n.credentials = "include")
        : l.crossOrigin === "anonymous"
          ? (n.credentials = "omit")
          : (n.credentials = "same-origin"),
      n
    );
  }
  function a(l) {
    if (l.ep) return;
    l.ep = !0;
    const n = o(l);
    fetch(l.href, n);
  }
})();
const c = 720,
  b = 1560,
  To = 1450,
  it = 0.999,
  Fa = 0.86,
  at = 0.55,
  Mo = 26,
  Po = 150,
  La = 0.8,
  xa = 900,
  Yt = 620,
  ga = 0.35,
  Ma = 620,
  Pa = 2600,
  Ft = 850,
  Eo = 1150,
  J = 46,
  se = c - 46,
  x = 260,
  D = 1120,
  Aa = 1310,
  _a = 250,
  $a = 3,
  el = 15,
  tl = 5,
  ol = 1,
  al = 1,
  ll = [
    { hits: 3, multiplier: 2, label: "COMBO x2" },
    { hits: 5, multiplier: 3, label: "COMBO x3" },
    { hits: 8, multiplier: 5, label: "COMBO x5" },
  ],
  Io = 2600,
  qo = [
    { day: 1, label: "+100 Jeton", coins: 100 },
    { day: 2, label: "+1 Top", shots: 1 },
    { day: 3, label: "+200 Jeton", coins: 200 },
    { day: 4, label: "+2 Top", shots: 2 },
    { day: 5, label: "Bonus Top", shots: 1, bonusBall: !0 },
    { day: 6, label: "+500 Jeton", coins: 500 },
    { day: 7, label: "Özel Oyuncak Şansı", randomToy: !0, coins: 100 },
  ],
  Wo = {
    balls: [
      { id: "gold_ball", name: "Altın Top", price: 500, ballType: "gold" },
      { id: "bonus_ball", name: "Bonus Top", price: 350, ballType: "bonus" },
      { id: "fire_ball", name: "Ateş Topu", price: 800, ballType: "fire" },
      { id: "ice_ball", name: "Buz Topu", price: 800, ballType: "ice" },
    ],
    boosts: [
      { id: "extra_shots_3", name: "3 Atış Hakkı", price: 150, shots: 3 },
      { id: "extra_shots_10", name: "10 Atış Hakkı", price: 400, shots: 10 },
    ],
  },
  Yo = "kuka_kazan_save_v1",
  ka = { COMMON: 350, RARE: 900, EPIC: 2200, LEGENDARY: 6e3 };
class nl {
  constructor() {
    u(this, "listeners", {});
  }
  on(e, o) {
    var a;
    return (((a = this.listeners)[e] ?? (a[e] = [])).push(o), () => this.off(e, o));
  }
  off(e, o) {
    const a = this.listeners[e];
    if (!a) return;
    const l = a.indexOf(o);
    l >= 0 && a.splice(l, 1);
  }
  emit(e, o) {
    const a = this.listeners[e];
    a && [...a].forEach((l) => l(o));
  }
  clear() {
    this.listeners = {};
  }
}
const Re = new nl();
class il {
  constructor() {
    u(this, "scenes", new Map());
    u(this, "current", null);
  }
  register(e) {
    this.scenes.set(e.name, e);
  }
  goto(e) {
    if (this.current?.name === e) return;
    const o = this.scenes.get(e);
    if (!o) {
      console.error(`[SceneManager] Unknown scene: ${e}`);
      return;
    }
    (this.current?.exit(), (this.current = o), o.enter(), Re.emit("sceneChange", { scene: e }));
  }
  update(e) {
    this.current?.update(e);
  }
  render(e) {
    this.current?.render(e);
  }
  onPointerDown(e) {
    this.current?.onPointerDown?.(e);
  }
  onPointerMove(e) {
    this.current?.onPointerMove?.(e);
  }
  onPointerUp(e) {
    this.current?.onPointerUp?.(e);
  }
  get currentName() {
    return this.current?.name;
  }
}
const V = new il(),
  ke = class ke {
    constructor() {
      u(this, "ctx", null);
      u(this, "master", null);
      u(this, "enabled", !0);
      u(this, "musicEnabled", !0);
      u(this, "musicNodes", []);
      u(this, "musicPlaying", !1);
      u(this, "musicGain", null);
      u(this, "musicTimer", null);
      u(this, "nextEighthTime", 0);
      u(this, "eighthIndex", 0);
    }
    ensureCtx() {
      if (this.ctx) return this.ctx;
      try {
        const e = window.AudioContext || window.webkitAudioContext;
        ((this.ctx = new e()),
          (this.master = this.ctx.createGain()),
          (this.master.gain.value = 0.65),
          this.master.connect(this.ctx.destination));
      } catch (e) {
        return (console.warn("[AudioManager] WebAudio unavailable", e), null);
      }
      return this.ctx;
    }
    unlock() {
      const e = this.ensureCtx();
      e && e.state === "suspended" && e.resume();
    }
    tone(e, o, a = {}) {
      if (!this.enabled) return;
      const l = this.ensureCtx();
      if (!l || !this.master) return;
      const n = l.currentTime + (a.delay ?? 0),
        i = l.createOscillator(),
        s = l.createGain();
      ((i.type = a.type ?? "sine"),
        i.frequency.setValueAtTime(e, n),
        a.freqEnd !== void 0 && i.frequency.exponentialRampToValueAtTime(Math.max(1, a.freqEnd), n + o),
        a.detune && (i.detune.value = a.detune),
        s.gain.setValueAtTime(a.startGain ?? 0.25, n),
        s.gain.exponentialRampToValueAtTime(Math.max(1e-4, a.endGain ?? 1e-4), n + o),
        i.connect(s),
        s.connect(this.master),
        i.start(n),
        i.stop(n + o + 0.02));
    }
    noiseBurst(e, o = {}) {
      if (!this.enabled) return;
      const a = this.ensureCtx();
      if (!a || !this.master) return;
      const l = a.currentTime + (o.delay ?? 0),
        n = Math.floor(a.sampleRate * e),
        i = a.createBuffer(1, n, a.sampleRate),
        s = i.getChannelData(0);
      for (let d = 0; d < n; d++) s[d] = (Math.random() * 2 - 1) * (1 - d / n);
      const r = a.createBufferSource();
      r.buffer = i;
      const f = a.createBiquadFilter();
      ((f.type = "lowpass"), (f.frequency.value = o.filterFreq ?? 2e3));
      const h = a.createGain();
      (h.gain.setValueAtTime(o.startGain ?? 0.3, l),
        h.gain.exponentialRampToValueAtTime(1e-4, l + e),
        r.connect(f),
        f.connect(h),
        h.connect(this.master),
        r.start(l));
    }
    play(e) {
      switch (e) {
        case "throw":
          this.tone(280, 0.16, { type: "triangle", freqEnd: 520, startGain: 0.22 });
          break;
        case "hitKuka":
          (this.tone(180, 0.1, { type: "square", freqEnd: 90, startGain: 0.28 }),
            this.noiseBurst(0.08, { startGain: 0.2, filterFreq: 1400 }));
          break;
        case "knockdown":
          (this.tone(150, 0.28, { type: "sawtooth", freqEnd: 60, startGain: 0.22 }),
            this.noiseBurst(0.2, { startGain: 0.18, filterFreq: 900, delay: 0.03 }));
          break;
        case "hole":
          (this.tone(520, 0.12, { type: "sine", freqEnd: 880, startGain: 0.2 }),
            this.tone(880, 0.16, { type: "sine", freqEnd: 1320, startGain: 0.16, delay: 0.08 }));
          break;
        case "penalty":
          (this.tone(320, 0.22, { type: "sawtooth", freqEnd: 90, startGain: 0.3 }),
            this.tone(210, 0.26, { type: "square", freqEnd: 60, startGain: 0.22, delay: 0.05 }),
            this.noiseBurst(0.22, { startGain: 0.22, filterFreq: 600 }));
          break;
        case "bonus":
          [660, 880, 1100].forEach((o, a) =>
            this.tone(o, 0.14, { type: "square", startGain: 0.18, delay: a * 0.06 }),
          );
          break;
        case "coin":
          this.tone(988, 0.08, { type: "square", freqEnd: 1500, startGain: 0.18 });
          break;
        case "reward":
          [523, 659, 784, 1046].forEach((o, a) =>
            this.tone(o, 0.22, { type: "triangle", startGain: 0.2, delay: a * 0.1 }),
          );
          break;
        case "button":
          this.tone(440, 0.05, { type: "square", startGain: 0.12, freqEnd: 600 });
          break;
        case "combo":
          this.tone(700, 0.1, { type: "sawtooth", startGain: 0.2, freqEnd: 1e3 });
          break;
        case "bigwin":
          ([523, 659, 784, 988, 1318].forEach((o, a) =>
            this.tone(o, 0.3, { type: "triangle", startGain: 0.22, delay: a * 0.09 }),
          ),
            this.noiseBurst(0.4, { startGain: 0.12, filterFreq: 3e3, delay: 0.05 }));
          break;
        case "swoosh":
          this.noiseBurst(0.18, { startGain: 0.15, filterFreq: 2500 });
          break;
        case "wallThud":
          (this.tone(90, 0.22, { type: "sawtooth", freqEnd: 40, startGain: 0.32 }),
            this.noiseBurst(0.15, { startGain: 0.25, filterFreq: 700 }));
          break;
        case "unlock":
          this.tone(392, 0.12, { type: "sine", startGain: 0.2, freqEnd: 784 });
          break;
      }
    }
    static midi(e) {
      return 440 * Math.pow(2, (e - 69) / 12);
    }
    musicNote(e, o, a, l, n) {
      const i = this.ctx;
      if (!i || !this.musicGain) return;
      const s = i.createOscillator(),
        r = i.createGain();
      ((s.type = l),
        s.frequency.setValueAtTime(e, o),
        r.gain.setValueAtTime(1e-4, o),
        r.gain.exponentialRampToValueAtTime(n, o + 0.02),
        r.gain.exponentialRampToValueAtTime(1e-4, o + a),
        s.connect(r),
        r.connect(this.musicGain),
        s.start(o),
        s.stop(o + a + 0.05));
    }
    scheduleMusic() {
      const e = this.ctx;
      if (!e || !this.musicPlaying) return;
      const o = ke.EIGHTH;
      for (; this.nextEighthTime < e.currentTime + 0.25;) {
        const a = this.nextEighthTime,
          l = Math.floor(this.eighthIndex / 6) % ke.MELODY.length,
          n = this.eighthIndex % 6,
          i = Math.floor(n / 2),
          s = n % 2 === 0,
          r = ke.MELODY[l][n];
        if (r !== null) {
          const f = n === 0 && ke.MELODY[l][2] === null ? o * 5.4 : o * 1.7;
          (this.musicNote(ke.midi(r), a, f, "triangle", 0.075),
            this.musicNote(ke.midi(r + 12), a, f * 0.5, "sine", 0.022));
        }
        if (s) {
          const [f, h] = ke.CHORDS[l];
          i === 0
            ? this.musicNote(ke.midi(f), a, o * 1.5, "sine", 0.085)
            : h.forEach((d) => this.musicNote(ke.midi(d), a, o * 0.85, "triangle", 0.03));
        }
        ((this.nextEighthTime += o), this.eighthIndex++);
      }
    }
    startMusic() {
      if (!this.musicEnabled || this.musicPlaying) return;
      const e = this.ensureCtx();
      !e ||
        !this.master ||
        (e.state === "suspended" && e.resume(),
        (this.musicGain = e.createGain()),
        (this.musicGain.gain.value = 0),
        this.musicGain.connect(this.master),
        this.musicGain.gain.linearRampToValueAtTime(0.55, e.currentTime + 1.2),
        (this.musicPlaying = !0),
        (this.eighthIndex = 0),
        (this.nextEighthTime = e.currentTime + 0.12),
        this.scheduleMusic(),
        (this.musicTimer = window.setInterval(() => this.scheduleMusic(), 60)));
    }
    stopMusic() {
      if (
        (this.musicTimer !== null && (window.clearInterval(this.musicTimer), (this.musicTimer = null)),
        this.musicGain && this.ctx)
      ) {
        const e = this.musicGain;
        try {
          (e.gain.cancelScheduledValues(this.ctx.currentTime),
            e.gain.setValueAtTime(e.gain.value, this.ctx.currentTime),
            e.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.25),
            window.setTimeout(() => e.disconnect(), 400));
        } catch {}
      }
      ((this.musicGain = null),
        this.musicNodes.forEach(({ osc: e }) => {
          try {
            e.stop();
          } catch {}
        }),
        (this.musicNodes = []),
        (this.musicPlaying = !1));
    }
    setEnabled(e) {
      this.enabled = e;
    }
    setMusicEnabled(e) {
      ((this.musicEnabled = e), e || this.stopMusic());
    }
  };
(u(ke, "MELODY", [
  [72, null, 76, null, 79, null],
  [81, null, 79, null, 76, null],
  [77, null, 81, null, 84, null],
  [83, null, 81, null, 79, null],
  [72, null, 76, null, 79, null],
  [81, null, 79, null, 76, null],
  [74, null, 77, null, 81, null],
  [79, null, null, null, null, null],
  [76, 77, 79, null, 76, null],
  [80, null, 76, null, 72, null],
  [81, null, 84, null, 81, null],
  [77, null, 79, null, 81, null],
  [84, null, 83, null, 81, null],
  [79, null, 77, null, 74, null],
  [72, null, 76, null, 79, null],
  [72, null, null, null, null, null],
]),
  u(ke, "CHORDS", [
    [36, [60, 64, 67]],
    [33, [57, 60, 64]],
    [29, [53, 57, 60]],
    [31, [55, 59, 62]],
    [36, [60, 64, 67]],
    [33, [57, 60, 64]],
    [26, [50, 53, 57]],
    [31, [55, 59, 62]],
    [36, [60, 64, 67]],
    [28, [52, 56, 59]],
    [33, [57, 60, 64]],
    [29, [53, 57, 60]],
    [36, [60, 64, 67]],
    [31, [55, 59, 62]],
    [36, [60, 64, 67]],
    [36, [60, 64, 67]],
  ]),
  u(ke, "EIGHTH", 0.2));
let Ao = ke;
const z = new Ao();
class sl {
  constructor(e, o) {
    u(this, "activePointerId", null);
    u(this, "handleDown", (e) => {
      if ((e.preventDefault(), this.activePointerId !== null)) return;
      ((this.activePointerId = e.pointerId), z.unlock());
      const { x: o, y: a } = this.toLogical(e.clientX, e.clientY);
      V.onPointerDown({ x: o, y: a, id: e.pointerId });
    });
    u(this, "handleMove", (e) => {
      if (this.activePointerId !== e.pointerId) return;
      e.preventDefault();
      const { x: o, y: a } = this.toLogical(e.clientX, e.clientY);
      V.onPointerMove({ x: o, y: a, id: e.pointerId });
    });
    u(this, "handleUp", (e) => {
      if (this.activePointerId !== e.pointerId) return;
      (e.preventDefault(), (this.activePointerId = null));
      const { x: o, y: a } = this.toLogical(e.clientX, e.clientY);
      V.onPointerUp({ x: o, y: a, id: e.pointerId });
    });
    ((this.canvas = e),
      (this.getScale = o),
      e.addEventListener("pointerdown", this.handleDown, { passive: !1 }),
      e.addEventListener("pointermove", this.handleMove, { passive: !1 }),
      e.addEventListener("pointerup", this.handleUp, { passive: !1 }),
      e.addEventListener("pointercancel", this.handleUp, { passive: !1 }),
      e.addEventListener("pointerleave", this.handleUp, { passive: !1 }));
  }
  toLogical(e, o) {
    const a = this.canvas.getBoundingClientRect(),
      { scale: l, offsetX: n, offsetY: i } = this.getScale(),
      s = (e - a.left - n) / l,
      r = (o - a.top - i) / l;
    return { x: s, y: r };
  }
}
class rl {
  constructor(e) {
    u(this, "canvas");
    u(this, "ctx");
    u(this, "scale", 1);
    u(this, "offsetX", 0);
    u(this, "offsetY", 0);
    u(this, "lastTime", 0);
    u(this, "running", !1);
    u(this, "input");
    u(this, "errorCount", 0);
    u(this, "loop", (e) => {
      if (!this.running) return;
      const o = (e - this.lastTime) / 1e3;
      this.lastTime = e;
      const a = Math.min(o, 1 / 20);
      try {
        V.update(a);
        const l = this.ctx;
        (l.save(),
          (l.fillStyle = "#0d0619"),
          l.fillRect(0, 0, this.canvas.width, this.canvas.height),
          l.translate(this.offsetX, this.offsetY),
          l.scale(this.scale, this.scale),
          l.beginPath(),
          l.rect(0, 0, c, b),
          l.clip(),
          V.render(l),
          l.restore());
      } catch (l) {
        try {
          this.ctx.restore();
        } catch {}
        this.errorCount++ < 20 && console.error("[Engine] kare render/update hatası (atlandı):", l);
      }
      requestAnimationFrame(this.loop);
    });
    this.canvas = e;
    const o = e.getContext("2d", { alpha: !1 });
    if (!o) throw new Error("2D context alınamadı");
    ((this.ctx = o),
      this.resize(),
      window.addEventListener("resize", () => this.resize()),
      window.addEventListener("orientationchange", () => this.resize()),
      (this.input = new sl(e, () => ({ scale: this.scale, offsetX: this.offsetX, offsetY: this.offsetY }))));
  }
  resize() {
    const e = Math.min(window.devicePixelRatio || 1, 2.5),
      o = this.canvas.parentElement,
      a = o.clientWidth || window.innerWidth,
      l = o.clientHeight || window.innerHeight;
    this.scale = Math.min(a / c, l / b);
    const n = c * this.scale,
      i = b * this.scale;
    ((this.offsetX = (a - n) / 2),
      (this.offsetY = (l - i) / 2),
      (this.canvas.style.width = `${a}px`),
      (this.canvas.style.height = `${l}px`),
      (this.canvas.width = Math.round(a * e)),
      (this.canvas.height = Math.round(l * e)),
      this.ctx.setTransform(e, 0, 0, e, 0, 0));
  }
  start() {
    ((this.running = !0), (this.lastTime = performance.now()), requestAnimationFrame(this.loop));
  }
  stop() {
    this.running = !1;
  }
}
const fl = "modulepreload",
  hl = function (t, e) {
    return new URL(t, e).href;
  },
  Co = {},
  Sa = function (e, o, a) {
    let l = Promise.resolve();
    if (o && o.length > 0) {
      const i = document.getElementsByTagName("link"),
        s = document.querySelector("meta[property=csp-nonce]"),
        r = s?.nonce || s?.getAttribute("nonce");
      l = Promise.allSettled(
        o.map((f) => {
          if (((f = hl(f, a)), f in Co)) return;
          Co[f] = !0;
          const h = f.endsWith(".css"),
            d = h ? '[rel="stylesheet"]' : "";
          if (!!a)
            for (let A = i.length - 1; A >= 0; A--) {
              const S = i[A];
              if (S.href === f && (!h || S.rel === "stylesheet")) return;
            }
          else if (document.querySelector(`link[href="${f}"]${d}`)) return;
          const g = document.createElement("link");
          if (
            ((g.rel = h ? "stylesheet" : fl),
            h || (g.as = "script"),
            (g.crossOrigin = ""),
            (g.href = f),
            r && g.setAttribute("nonce", r),
            document.head.appendChild(g),
            h)
          )
            return new Promise((A, S) => {
              (g.addEventListener("load", A),
                g.addEventListener("error", () => S(new Error(`Unable to preload CSS for ${f}`))));
            });
        }),
      );
    }
    function n(i) {
      const s = new Event("vite:preloadError", { cancelable: !0 });
      if (((s.payload = i), window.dispatchEvent(s), !s.defaultPrevented)) throw i;
    }
    return l.then((i) => {
      for (const s of i || []) s.status === "rejected" && n(s.reason);
      return e().catch(n);
    });
  };
/*! Capacitor: https://capacitorjs.com/ - MIT License */ const dl = (t) => {
    const e = new Map();
    e.set("web", { name: "web" });
    const o = t.CapacitorPlatforms || { currentPlatform: { name: "web" }, platforms: e },
      a = (n, i) => {
        o.platforms.set(n, i);
      },
      l = (n) => {
        o.platforms.has(n) && (o.currentPlatform = o.platforms.get(n));
      };
    return ((o.addPlatform = a), (o.setPlatform = l), o);
  },
  ul = (t) => (t.CapacitorPlatforms = dl(t)),
  Ra = ul(
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
        ? self
        : typeof window < "u"
          ? window
          : typeof global < "u"
            ? global
            : {},
  );
Ra.addPlatform;
Ra.setPlatform;
var st;
(function (t) {
  ((t.Unimplemented = "UNIMPLEMENTED"), (t.Unavailable = "UNAVAILABLE"));
})(st || (st = {}));
class Lt extends Error {
  constructor(e, o, a) {
    (super(e), (this.message = e), (this.code = o), (this.data = a));
  }
}
const pl = (t) => {
    var e, o;
    return t?.androidBridge
      ? "android"
      : !(
            (o = (e = t?.webkit) === null || e === void 0 ? void 0 : e.messageHandlers) === null ||
            o === void 0
          ) && o.bridge
        ? "ios"
        : "web";
  },
  cl = (t) => {
    var e, o, a, l, n;
    const i = t.CapacitorCustomPlatform || null,
      s = t.Capacitor || {},
      r = (s.Plugins = s.Plugins || {}),
      f = t.CapacitorPlatforms,
      h = () => (i !== null ? i.name : pl(t)),
      d = ((e = f?.currentPlatform) === null || e === void 0 ? void 0 : e.getPlatform) || h,
      y = () => d() !== "web",
      g = ((o = f?.currentPlatform) === null || o === void 0 ? void 0 : o.isNativePlatform) || y,
      A = (N) => {
        const Q = Ue.get(N);
        return !!(Q?.platforms.has(d()) || G(N));
      },
      S = ((a = f?.currentPlatform) === null || a === void 0 ? void 0 : a.isPluginAvailable) || A,
      R = (N) => {
        var Q;
        return (Q = s.PluginHeaders) === null || Q === void 0 ? void 0 : Q.find((q) => q.name === N);
      },
      G = ((l = f?.currentPlatform) === null || l === void 0 ? void 0 : l.getPluginHeader) || R,
      C = (N) => t.console.error(N),
      te = (N, Q, q) => Promise.reject(`${q} does not have an implementation of "${Q}".`),
      Ue = new Map(),
      B = (N, Q = {}) => {
        const q = Ue.get(N);
        if (q)
          return (
            console.warn(`Capacitor plugin "${N}" already registered. Cannot register plugins twice.`),
            q.proxy
          );
        const w = d(),
          I = G(N);
        let $;
        const ne = async () => (
            !$ && w in Q
              ? ($ = typeof Q[w] == "function" ? ($ = await Q[w]()) : ($ = Q[w]))
              : i !== null &&
                !$ &&
                "web" in Q &&
                ($ = typeof Q.web == "function" ? ($ = await Q.web()) : ($ = Q.web)),
            $
          ),
          re = (ue, Pe) => {
            var Ee, He;
            if (I) {
              const Be = I?.methods.find((Ke) => Pe === Ke.name);
              if (Be)
                return Be.rtype === "promise"
                  ? (Ke) => s.nativePromise(N, Pe.toString(), Ke)
                  : (Ke, Rt) => s.nativeCallback(N, Pe.toString(), Ke, Rt);
              if (ue) return (Ee = ue[Pe]) === null || Ee === void 0 ? void 0 : Ee.bind(ue);
            } else {
              if (ue) return (He = ue[Pe]) === null || He === void 0 ? void 0 : He.bind(ue);
              throw new Lt(`"${N}" plugin is not implemented on ${w}`, st.Unimplemented);
            }
          },
          ie = (ue) => {
            let Pe;
            const Ee = (...He) => {
              const Be = ne().then((Ke) => {
                const Rt = re(Ke, ue);
                if (Rt) {
                  const mt = Rt(...He);
                  return ((Pe = mt?.remove), mt);
                } else throw new Lt(`"${N}.${ue}()" is not implemented on ${w}`, st.Unimplemented);
              });
              return (ue === "addListener" && (Be.remove = async () => Pe()), Be);
            };
            return (
              (Ee.toString = () => `${ue.toString()}() { [capacitor code] }`),
              Object.defineProperty(Ee, "name", { value: ue, writable: !1, configurable: !1 }),
              Ee
            );
          },
          Ne = ie("addListener"),
          Zo = ie("removeListener"),
          Ja = (ue, Pe) => {
            const Ee = Ne({ eventName: ue }, Pe),
              He = async () => {
                const Ke = await Ee;
                Zo({ eventName: ue, callbackId: Ke }, Pe);
              },
              Be = new Promise((Ke) => Ee.then(() => Ke({ remove: He })));
            return (
              (Be.remove = async () => {
                (console.warn("Using addListener() without 'await' is deprecated."), await He());
              }),
              Be
            );
          },
          Qt = new Proxy(
            {},
            {
              get(ue, Pe) {
                switch (Pe) {
                  case "$$typeof":
                    return;
                  case "toJSON":
                    return () => ({});
                  case "addListener":
                    return I ? Ja : Ne;
                  case "removeListener":
                    return Zo;
                  default:
                    return ie(Pe);
                }
              },
            },
          );
        return (
          (r[N] = Qt),
          Ue.set(N, { name: N, proxy: Qt, platforms: new Set([...Object.keys(Q), ...(I ? [w] : [])]) }),
          Qt
        );
      },
      oe = ((n = f?.currentPlatform) === null || n === void 0 ? void 0 : n.registerPlugin) || B;
    return (
      s.convertFileSrc || (s.convertFileSrc = (N) => N),
      (s.getPlatform = d),
      (s.handleError = C),
      (s.isNativePlatform = g),
      (s.isPluginAvailable = S),
      (s.pluginMethodNoop = te),
      (s.registerPlugin = oe),
      (s.Exception = Lt),
      (s.DEBUG = !!s.DEBUG),
      (s.isLoggingEnabled = !!s.isLoggingEnabled),
      (s.platform = s.getPlatform()),
      (s.isNative = s.isNativePlatform()),
      s
    );
  },
  yl = (t) => (t.Capacitor = cl(t)),
  Mt = yl(
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
        ? self
        : typeof window < "u"
          ? window
          : typeof global < "u"
            ? global
            : {},
  ),
  Dt = Mt.registerPlugin;
Mt.Plugins;
class Jt {
  constructor(e) {
    ((this.listeners = {}),
      (this.retainedEventArguments = {}),
      (this.windowListeners = {}),
      e &&
        (console.warn(
          `Capacitor WebPlugin "${e.name}" config object was deprecated in v3 and will be removed in v4.`,
        ),
        (this.config = e)));
  }
  addListener(e, o) {
    let a = !1;
    (this.listeners[e] || ((this.listeners[e] = []), (a = !0)), this.listeners[e].push(o));
    const n = this.windowListeners[e];
    (n && !n.registered && this.addWindowListener(n), a && this.sendRetainedArgumentsForEvent(e));
    const i = async () => this.removeListener(e, o);
    return Promise.resolve({ remove: i });
  }
  async removeAllListeners() {
    this.listeners = {};
    for (const e in this.windowListeners) this.removeWindowListener(this.windowListeners[e]);
    this.windowListeners = {};
  }
  notifyListeners(e, o, a) {
    const l = this.listeners[e];
    if (!l) {
      if (a) {
        let n = this.retainedEventArguments[e];
        (n || (n = []), n.push(o), (this.retainedEventArguments[e] = n));
      }
      return;
    }
    l.forEach((n) => n(o));
  }
  hasListeners(e) {
    return !!this.listeners[e].length;
  }
  registerWindowListener(e, o) {
    this.windowListeners[o] = {
      registered: !1,
      windowEventName: e,
      pluginEventName: o,
      handler: (a) => {
        this.notifyListeners(o, a);
      },
    };
  }
  unimplemented(e = "not implemented") {
    return new Mt.Exception(e, st.Unimplemented);
  }
  unavailable(e = "not available") {
    return new Mt.Exception(e, st.Unavailable);
  }
  async removeListener(e, o) {
    const a = this.listeners[e];
    if (!a) return;
    const l = a.indexOf(o);
    (this.listeners[e].splice(l, 1),
      this.listeners[e].length || this.removeWindowListener(this.windowListeners[e]));
  }
  addWindowListener(e) {
    (window.addEventListener(e.windowEventName, e.handler), (e.registered = !0));
  }
  removeWindowListener(e) {
    e && (window.removeEventListener(e.windowEventName, e.handler), (e.registered = !1));
  }
  sendRetainedArgumentsForEvent(e) {
    const o = this.retainedEventArguments[e];
    o &&
      (delete this.retainedEventArguments[e],
      o.forEach((a) => {
        this.notifyListeners(e, a);
      }));
  }
}
const No = (t) =>
    encodeURIComponent(t)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape),
  Ho = (t) => t.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
class vl extends Jt {
  async getCookies() {
    const e = document.cookie,
      o = {};
    return (
      e.split(";").forEach((a) => {
        if (a.length <= 0) return;
        let [l, n] = a.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
        ((l = Ho(l).trim()), (n = Ho(n).trim()), (o[l] = n));
      }),
      o
    );
  }
  async setCookie(e) {
    try {
      const o = No(e.key),
        a = No(e.value),
        l = `; expires=${(e.expires || "").replace("expires=", "")}`,
        n = (e.path || "/").replace("path=", ""),
        i = e.url != null && e.url.length > 0 ? `domain=${e.url}` : "";
      document.cookie = `${o}=${a || ""}${l}; path=${n}; ${i};`;
    } catch (o) {
      return Promise.reject(o);
    }
  }
  async deleteCookie(e) {
    try {
      document.cookie = `${e.key}=; Max-Age=0`;
    } catch (o) {
      return Promise.reject(o);
    }
  }
  async clearCookies() {
    try {
      const e = document.cookie.split(";") || [];
      for (const o of e)
        document.cookie = o.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async clearAllCookies() {
    try {
      await this.clearCookies();
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
Dt("CapacitorCookies", { web: () => new vl() });
const gl = async (t) =>
    new Promise((e, o) => {
      const a = new FileReader();
      ((a.onload = () => {
        const l = a.result;
        e(l.indexOf(",") >= 0 ? l.split(",")[1] : l);
      }),
        (a.onerror = (l) => o(l)),
        a.readAsDataURL(t));
    }),
  Ml = (t = {}) => {
    const e = Object.keys(t);
    return Object.keys(t)
      .map((l) => l.toLocaleLowerCase())
      .reduce((l, n, i) => ((l[n] = t[e[i]]), l), {});
  },
  Pl = (t, e = !0) =>
    t
      ? Object.entries(t)
          .reduce((a, l) => {
            const [n, i] = l;
            let s, r;
            return (
              Array.isArray(i)
                ? ((r = ""),
                  i.forEach((f) => {
                    ((s = e ? encodeURIComponent(f) : f), (r += `${n}=${s}&`));
                  }),
                  r.slice(0, -1))
                : ((s = e ? encodeURIComponent(i) : i), (r = `${n}=${s}`)),
              `${a}&${r}`
            );
          }, "")
          .substr(1)
      : null,
  Al = (t, e = {}) => {
    const o = Object.assign({ method: t.method || "GET", headers: t.headers }, e),
      l = Ml(t.headers)["content-type"] || "";
    if (typeof t.data == "string") o.body = t.data;
    else if (l.includes("application/x-www-form-urlencoded")) {
      const n = new URLSearchParams();
      for (const [i, s] of Object.entries(t.data || {})) n.set(i, s);
      o.body = n.toString();
    } else if (l.includes("multipart/form-data") || t.data instanceof FormData) {
      const n = new FormData();
      if (t.data instanceof FormData)
        t.data.forEach((s, r) => {
          n.append(r, s);
        });
      else for (const s of Object.keys(t.data)) n.append(s, t.data[s]);
      o.body = n;
      const i = new Headers(o.headers);
      (i.delete("content-type"), (o.headers = i));
    } else (l.includes("application/json") || typeof t.data == "object") && (o.body = JSON.stringify(t.data));
    return o;
  };
class kl extends Jt {
  async request(e) {
    const o = Al(e, e.webFetchExtra),
      a = Pl(e.params, e.shouldEncodeUrlParams),
      l = a ? `${e.url}?${a}` : e.url,
      n = await fetch(l, o),
      i = n.headers.get("content-type") || "";
    let { responseType: s = "text" } = n.ok ? e : {};
    i.includes("application/json") && (s = "json");
    let r, f;
    switch (s) {
      case "arraybuffer":
      case "blob":
        ((f = await n.blob()), (r = await gl(f)));
        break;
      case "json":
        r = await n.json();
        break;
      case "document":
      case "text":
      default:
        r = await n.text();
    }
    const h = {};
    return (
      n.headers.forEach((d, y) => {
        h[y] = d;
      }),
      { data: r, headers: h, status: n.status, url: n.url }
    );
  }
  async get(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: "GET" }));
  }
  async post(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: "POST" }));
  }
  async put(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: "PUT" }));
  }
  async patch(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: "PATCH" }));
  }
  async delete(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: "DELETE" }));
  }
}
Dt("CapacitorHttp", { web: () => new kl() });
const Bo = Dt("Preferences", {
  web: () =>
    Sa(() => Promise.resolve().then(() => Bs), void 0, import.meta.url).then((t) => new t.PreferencesWeb()),
});
function ft() {
  return {
    name: "Oyuncu",
    nameSet: !1,
    coins: _a,
    tickets: $a,
    gems: el,
    shots: tl,
    currentLevel: 1,
    levelStars: {},
    highestUnlockedLevel: 1,
    toys: {},
    dailyStreak: 0,
    lastDailyClaim: 0,
    lastPlayed: Date.now(),
    soundOn: !0,
    musicOn: !0,
    vibrationOn: !0,
    ownedBalls: ["normal"],
    selectedBall: "normal",
    referredBy: null,
    totalScore: 0,
    createdAt: Date.now(),
    claimedAchievements: [],
    claimedStarMilestones: [],
    bestTourScore: 0,
    lastDailyChallenge: "",
    dailyChallengeScore: 0,
    stats: {
      shotsFired: 0,
      holesHit: 0,
      kukasKnocked: 0,
      levelsWon: 0,
      bestCombo: 0,
      bestScore: 0,
      perfectShots: 0,
    },
  };
}
class Sl {
  constructor() {
    u(this, "state", ft());
    u(this, "saveTimer", null);
    u(this, "loaded", !1);
  }
  async load() {
    try {
      const { value: e } = await Bo.get({ key: Yo });
      if (e) {
        const o = JSON.parse(e);
        this.state = { ...ft(), ...o };
      } else this.state = ft();
    } catch (e) {
      (console.warn("[SaveManager] load failed, using default state", e), (this.state = ft()));
    }
    return ((this.loaded = !0), this.state);
  }
  get() {
    return this.state;
  }
  update(e) {
    (e(this.state), this.scheduleSave());
  }
  scheduleSave() {
    (this.saveTimer !== null && window.clearTimeout(this.saveTimer),
      (this.saveTimer = window.setTimeout(() => this.saveNow(), 400)));
  }
  async saveNow() {
    if (this.loaded) {
      this.state.lastPlayed = Date.now();
      try {
        await Bo.set({ key: Yo, value: JSON.stringify(this.state) });
      } catch (e) {
        console.warn("[SaveManager] save failed", e);
      }
    }
  }
  async resetAll() {
    ((this.state = ft()), await this.saveNow());
  }
}
const U = new Sl(),
  Rl = {
    tap: 10,
    bounce: 8,
    hit: 18,
    knock: [22, 30, 22],
    score: [14, 24, 30],
    win: [30, 40, 30, 40, 60],
    fail: [60, 50, 60],
  };
class ml {
  constructor() {
    u(this, "supported", typeof navigator < "u" && typeof navigator.vibrate == "function");
    u(this, "enabled", !0);
  }
  setEnabled(e) {
    ((this.enabled = e), e || this.stop());
  }
  get isSupported() {
    return this.supported;
  }
  play(e) {
    if (!(!this.supported || !this.enabled))
      try {
        navigator.vibrate(Rl[e]);
      } catch {}
  }
  stop() {
    if (this.supported)
      try {
        navigator.vibrate(0);
      } catch {}
  }
}
const pe = new ml();
class zl {
  get coins() {
    return U.get().coins;
  }
  get tickets() {
    return U.get().tickets;
  }
  get shots() {
    return U.get().shots;
  }
  get gems() {
    return U.get().gems;
  }
  addCoins(e) {
    (U.update((o) => (o.coins = Math.max(0, o.coins + e))),
      e > 0 && z.play("coin"),
      Re.emit("coinsChanged", { coins: this.coins, delta: e }));
  }
  spendCoins(e) {
    return this.coins < e
      ? !1
      : (U.update((o) => (o.coins -= e)), Re.emit("coinsChanged", { coins: this.coins, delta: -e }), !0);
  }
  addTickets(e) {
    U.update((o) => (o.tickets = Math.max(0, o.tickets + e)));
  }
  addGems(e) {
    (U.update((o) => (o.gems = Math.max(0, o.gems + e))), e > 0 && z.play("unlock"));
  }
  spendGems(e) {
    return this.gems < e ? !1 : (U.update((o) => (o.gems -= e)), !0);
  }
  addShots(e) {
    (U.update((o) => (o.shots = Math.max(0, o.shots + e))), Re.emit("shotsChanged", { shots: this.shots }));
  }
  spendShot() {
    return this.shots <= 0
      ? !1
      : (U.update((e) => (e.shots -= 1)), Re.emit("shotsChanged", { shots: this.shots }), !0);
  }
}
const K = new zl(),
  v = {
    bgNightTop: "#1a0f2e",
    bgNightBottom: "#3a1b52",
    woodDark: "#5c3a21",
    woodMid: "#7a4a28",
    woodLight: "#9a6a3c",
    woodPlank: "#8a5a30",
    tentRed: "#c0392b",
    tentRedDark: "#8e2a1f",
    tentCream: "#f4e3c1",
    tentGold: "#e0a940",
    bulbYellow: "#ffe066",
    bulbOrange: "#ff9f40",
    kukaRed: "#e74c3c",
    kukaRedDark: "#a83226",
    kukaYellow: "#f1c40f",
    kukaYellowDark: "#b8930b",
    kukaBlue: "#3498db",
    kukaBlueDark: "#215d8a",
    kukaGreen: "#2ecc71",
    kukaGreenDark: "#1e8a4e",
    kukaBonus: "#9b59b6",
    kukaBonusDark: "#6c3a83",
    ballNormal: "#f2f2f2",
    ballNormalShade: "#c9c9c9",
    ballGold: "#ffd700",
    ballGoldShade: "#b8860b",
    ballBonus: "#ff6ec7",
    ballBonusShade: "#c23f92",
    ballFire: "#ff8a3d",
    ballFireShade: "#b8360f",
    ballIce: "#bdeeff",
    ballIceShade: "#4a95c2",
    coinGold: "#ffcc33",
    coinGoldDark: "#c98d00",
    uiPurple: "#5b2a86",
    uiPurpleDark: "#3c1a5c",
    uiPink: "#ff4d94",
    uiTeal: "#1fc8db",
    uiOrange: "#ff8c42",
    uiCream: "#fff4e0",
    uiWhite: "#ffffff",
    uiDanger: "#e63950",
    uiSuccess: "#3fce7e",
    rarityCommon: "#9aa0a6",
    rarityRare: "#3ba0ff",
    rarityEpic: "#b04fe0",
    rarityLegendary: "#ffb020",
    shadow: "rgba(0,0,0,0.35)",
  };
function ma(t) {
  if (t.startsWith("#")) {
    const o = t.replace("#", "");
    return [
      parseInt(o.substring(0, 2), 16),
      parseInt(o.substring(2, 4), 16),
      parseInt(o.substring(4, 6), 16),
    ];
  }
  const e = t.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return e ? [Number(e[1]), Number(e[2]), Number(e[3])] : [0, 0, 0];
}
function p(t, e) {
  const [o, a, l] = ma(t);
  return `rgba(${o}, ${a}, ${l}, ${e})`;
}
function O(t, e) {
  const [o, a, l] = ma(t);
  return `rgb(${Math.min(255, Math.max(0, o + e))}, ${Math.min(255, Math.max(0, a + e))}, ${Math.min(255, Math.max(0, l + e))})`;
}
function j(t, e) {
  return O(t, -e);
}
function rt(t) {
  switch (t) {
    case "RARE":
      return v.rarityRare;
    case "EPIC":
      return v.rarityEpic;
    case "LEGENDARY":
      return v.rarityLegendary;
    default:
      return v.rarityCommon;
  }
}
const jl = {
  item_pin_yellow: "./sprites/item_pin_yellow.png",
  item_pin_blue: "./sprites/item_pin_blue.png",
  item_pin_green: "./sprites/item_pin_green.png",
  item_pin_bonus: "./sprites/item_pin_bonus.png",
  bg_stand: "./sprites/bg_stand.jpg",
  item_ball_gold: "./sprites/item_ball_gold.png",
  item_ball_wood: "./sprites/item_ball_wood.png",
  item_coins: "./sprites/item_coins.png",
  item_pin: "./sprites/item_pin.png",
  item_ticket: "./sprites/item_ticket.png",
  logo: "./sprites/logo.png",
  toy_butterfly: "./sprites/toy_butterfly.png",
  toy_cat: "./sprites/toy_cat.png",
  toy_cupcake: "./sprites/toy_cupcake.png",
  toy_elephant: "./sprites/toy_elephant.png",
  toy_fairy: "./sprites/toy_fairy.png",
  toy_heart: "./sprites/toy_heart.png",
  toy_lollipop: "./sprites/toy_lollipop.png",
  toy_magic_wand: "./sprites/toy_magic_wand.png",
  toy_swan: "./sprites/toy_swan.png",
};
class Ul {
  constructor() {
    u(this, "images", new Map());
    u(this, "ready", new Set());
    u(this, "started", !1);
  }
  preload() {
    if (this.started) return Promise.resolve();
    this.started = !0;
    const e = Object.entries(jl).map(
      ([o, a]) =>
        new Promise((l) => {
          const n = new Image();
          ((n.onload = () => {
            (this.ready.add(o), l());
          }),
            (n.onerror = () => l()),
            (n.src = a),
            this.images.set(o, n));
        }),
    );
    return Promise.all(e).then(() => {});
  }
  get(e) {
    return this.ready.has(e) ? (this.images.get(e) ?? null) : null;
  }
  has(e) {
    return this.ready.has(e);
  }
  draw(e, o, a, l, n, i = {}) {
    const s = this.get(o);
    if (!s || !s.naturalWidth) return !1;
    const r = i.fit ?? "contain";
    let f;
    r === "height"
      ? (f = n / s.naturalHeight)
      : r === "width"
        ? (f = n / s.naturalWidth)
        : (f = Math.min(n / s.naturalWidth, n / s.naturalHeight));
    const h = s.naturalWidth * f,
      d = s.naturalHeight * f;
    return (
      e.save(),
      i.alpha !== void 0 && (e.globalAlpha = i.alpha),
      i.rotation
        ? (e.translate(a, l), e.rotate(i.rotation), e.drawImage(s, -h / 2, -d / 2, h, d))
        : e.drawImage(s, a - h / 2, l - d / 2, h, d),
      e.restore(),
      !0
    );
  }
}
const Oe = new Ul();
function m(t, e, o, a, l, n) {
  const i = Math.min(n, a / 2, l / 2);
  (t.beginPath(),
    t.moveTo(e + i, o),
    t.arcTo(e + a, o, e + a, o + l, i),
    t.arcTo(e + a, o + l, e, o + l, i),
    t.arcTo(e, o + l, e, o, i),
    t.arcTo(e, o, e + a, o, i),
    t.closePath());
}
function Oo(t, e, o, a, l, n = {}) {
  const i = n.radius ?? 18;
  if (
    (t.save(),
    n.shadow !== !1 && ((t.shadowColor = v.shadow), (t.shadowBlur = 14), (t.shadowOffsetY = 6)),
    m(t, e, o, a, l, i),
    n.fillTop && n.fillBottom)
  ) {
    const s = t.createLinearGradient(0, o, 0, o + l);
    (s.addColorStop(0, n.fillTop), s.addColorStop(1, n.fillBottom), (t.fillStyle = s));
  } else t.fillStyle = n.fill ?? v.uiPurple;
  (t.fill(),
    (t.shadowColor = "transparent"),
    n.stroke && ((t.lineWidth = n.lineWidth ?? 3), (t.strokeStyle = n.stroke), t.stroke()),
    t.restore());
}
function bl(t, e) {
  const o = e.disabled ? "#8a8a92" : (e.colorTop ?? v.uiPink),
    a = e.disabled ? "#5c5c66" : (e.colorBottom ?? j(e.colorTop ?? v.uiPink, 40)),
    l = e.pressed ? 3 : 0,
    n = e.radius ?? 20;
  (t.save(),
    m(t, e.x, e.y + 6, e.w, e.h, n),
    (t.fillStyle = j(a, 25)),
    t.fill(),
    t.translate(0, l),
    Oo(t, e.x, e.y, e.w, e.h - 6, {
      fillTop: O(o, 20),
      fillBottom: a,
      radius: n,
      stroke: p("#ffffff", 0.35),
      lineWidth: 2,
      shadow: !1,
    }),
    m(t, e.x + 6, e.y + 5, e.w - 12, e.h * 0.32, n * 0.6),
    (t.fillStyle = p("#ffffff", 0.22)),
    t.fill(),
    (t.fillStyle = e.textColor ?? v.uiWhite),
    (t.font = `700 ${e.fontSize ?? 28}px 'Segoe UI', sans-serif`),
    (t.textAlign = "center"),
    (t.textBaseline = "middle"),
    (t.shadowColor = "rgba(0,0,0,0.4)"),
    (t.shadowBlur = 3));
  const i = e.x + e.w / 2,
    s = e.y + (e.h - 6) / 2,
    r = e.icon ? `${e.icon}  ${e.label}` : e.label;
  (t.fillText(r, i, s), t.restore());
}
function W(t, e, o, a, l, n) {
  return t >= o && t <= o + l && e >= a && e <= a + n;
}
function P(t, e, o, a, l = {}) {
  (t.save(),
    (t.font = `${l.weight ?? 700} ${l.size ?? 22}px 'Segoe UI', sans-serif`),
    (t.textAlign = l.align ?? "center"),
    (t.textBaseline = "middle"),
    l.shadow !== !1 && ((t.shadowColor = "rgba(0,0,0,0.45)"), (t.shadowBlur = 5), (t.shadowOffsetY = 2)),
    l.outline &&
      ((t.lineWidth = l.outlineWidth ?? 5),
      (t.strokeStyle = l.outline),
      (t.lineJoin = "round"),
      t.strokeText(e, o, a)),
    (t.fillStyle = l.color ?? v.uiWhite),
    t.fillText(e, o, a),
    t.restore());
}
function Tl(t, e, o, a) {
  t.save();
  const l = t.createRadialGradient(e - a * 0.3, o - a * 0.3, a * 0.1, e, o, a);
  (l.addColorStop(0, "#ffffff"),
    l.addColorStop(1, v.ballNormalShade),
    t.beginPath(),
    t.arc(e, o, a, 0, Math.PI * 2),
    (t.fillStyle = l),
    t.fill(),
    (t.strokeStyle = "#9a9a9a"),
    (t.lineWidth = 1.5),
    t.stroke(),
    t.restore());
}
function Ol(t, e, o = c, a = 260) {
  const l = t.createLinearGradient(0, e, 0, e + a);
  (l.addColorStop(0, v.woodMid),
    l.addColorStop(1, v.woodDark),
    (t.fillStyle = l),
    t.fillRect(0, e, o, a),
    t.save(),
    (t.strokeStyle = p("#000000", 0.18)),
    (t.lineWidth = 3));
  for (let n = 1; n < 8; n++) {
    const i = (o / 8) * n;
    (t.beginPath(), t.moveTo(i, e), t.lineTo(i, e + a), t.stroke());
  }
  t.restore();
}
function Gl(t, e, o, a, l, n, i = 14) {
  (t.save(),
    (t.strokeStyle = p("#000000", 0.4)),
    (t.lineWidth = 2),
    t.beginPath(),
    t.moveTo(e, o),
    t.quadraticCurveTo(e + a / 2, o + i, e + a, o),
    t.stroke());
  for (let s = 0; s < l; s++) {
    const r = s / (l - 1),
      f = e + a * r,
      h = o + i * 4 * r * (1 - r),
      y = (Math.sin(n * 6 + s * 1.3) + 1) / 2 > 0.3,
      g = s % 2 === 0 ? v.bulbYellow : v.bulbOrange;
    if (y) {
      const A = t.createRadialGradient(f, h, 0, f, h, 14);
      (A.addColorStop(0, p(g, 0.65)),
        A.addColorStop(1, p(g, 0)),
        (t.fillStyle = A),
        t.beginPath(),
        t.arc(f, h, 14, 0, Math.PI * 2),
        t.fill());
    }
    (t.beginPath(), t.arc(f, h, 5, 0, Math.PI * 2), (t.fillStyle = y ? g : j(g, 60)), t.fill());
  }
  t.restore();
}
function Kl(t, e, o, a, l) {
  const i = a / 10;
  (t.save(), t.beginPath(), t.moveTo(e, o), t.lineTo(e + a, o), t.lineTo(e + a, o + l * 0.55));
  for (let r = 9; r >= 0; r--) {
    const f = e + r * i;
    t.quadraticCurveTo(f + i / 2, o + l * 1.05, f, o + l * 0.55);
  }
  (t.closePath(), t.clip(), (t.fillStyle = v.tentCream), t.fillRect(e, o, a, l));
  for (let r = 0; r < 10; r++) r % 2 === 0 && ((t.fillStyle = v.tentRed), t.fillRect(e + r * i, o, i, l));
  const s = t.createLinearGradient(0, o, 0, o + l);
  (s.addColorStop(0, "rgba(0,0,0,0)"),
    s.addColorStop(1, "rgba(0,0,0,0.25)"),
    (t.fillStyle = s),
    t.fillRect(e, o, a, l),
    t.restore(),
    (t.strokeStyle = v.tentGold),
    (t.lineWidth = 3),
    t.beginPath(),
    t.moveTo(e, o + 2),
    t.lineTo(e + a, o + 2),
    t.stroke());
}
function wl(t, e, o, a, l) {
  t.save();
  const n = t.createLinearGradient(0, o, 0, o + l);
  (n.addColorStop(0, v.woodLight),
    n.addColorStop(1, v.woodDark),
    (t.fillStyle = n),
    t.fillRect(e, o, a, l),
    (t.strokeStyle = "rgba(0,0,0,0.25)"),
    (t.lineWidth = 2));
  const i = 6;
  for (let s = 1; s < i; s++) {
    const r = e + (a / i) * s;
    (t.beginPath(), t.moveTo(r, o), t.lineTo(r, o + l), t.stroke());
  }
  ((t.fillStyle = v.tentGold), t.fillRect(e, o, a, 6), t.restore());
}
function Go(t, e, o, a, l) {
  (t.save(), t.beginPath(), t.rect(e, o, a, l), t.clip());
  const n = t.createLinearGradient(0, o, 0, o + l);
  (n.addColorStop(0, "#4a1f16"),
    n.addColorStop(0.55, "#3a170f"),
    n.addColorStop(1, "#280e09"),
    (t.fillStyle = n),
    t.fillRect(e, o, a, l));
  const i = a / 14;
  for (let r = 0; r < 14; r++)
    r % 2 === 0 && ((t.fillStyle = p("#ffffff", 0.028)), t.fillRect(e + r * i, o, i, l));
  const s = t.createLinearGradient(0, o, 0, o + l * 0.75);
  (s.addColorStop(0, p("#ffb45e", 0.1)),
    s.addColorStop(1, p("#ffb45e", 0)),
    (t.fillStyle = s),
    t.fillRect(e, o, a, l),
    t.restore());
}
function Vl(t, e, o, a, l) {
  const n = a - o,
    i = (s, r) => {
      (t.save(),
        t.beginPath(),
        t.moveTo(s, o),
        t.lineTo(s + r * l, o),
        t.quadraticCurveTo(s + r * l * 0.7, o + n * 0.5, s + r * l * 0.95, a),
        t.lineTo(s, a),
        t.closePath());
      const f = t.createLinearGradient(s, 0, s + r * l, 0);
      (f.addColorStop(0, j(v.tentRed, 45)),
        f.addColorStop(0.45, v.tentRedDark),
        f.addColorStop(1, j(v.tentRed, 30)),
        (t.fillStyle = f),
        t.fill(),
        t.clip());
      for (let h = 1; h < 5; h++) {
        const d = s + r * (l * (h / 5));
        (t.beginPath(),
          t.moveTo(d, o),
          t.quadraticCurveTo(d - r * 6, o + n * 0.5, d + r * 4, a),
          (t.lineWidth = 10),
          (t.strokeStyle = p("#000000", 0.22)),
          t.stroke(),
          t.beginPath(),
          t.moveTo(d + r * 6, o),
          t.quadraticCurveTo(d, o + n * 0.5, d + r * 10, a),
          (t.lineWidth = 4),
          (t.strokeStyle = p("#ff8a6a", 0.1)),
          t.stroke());
      }
      t.restore();
    };
  (i(0, 1), i(e, -1));
}
function Zl(t, e, o, a, l) {
  (t.save(), (t.globalCompositeOperation = "lighter"));
  const n = t.createLinearGradient(0, o, 0, a);
  (n.addColorStop(0, p("#ffd79a", 0.16)),
    n.addColorStop(0.6, p("#ffb45e", 0.06)),
    n.addColorStop(1, p("#ffb45e", 0)),
    (t.fillStyle = n),
    t.beginPath(),
    t.moveTo(e - l * 0.28, o),
    t.lineTo(e + l * 0.28, o),
    t.lineTo(e + l, a),
    t.lineTo(e - l, a),
    t.closePath(),
    t.fill(),
    t.restore());
}
function za(t, e, o) {
  t.save();
  const a = t.createRadialGradient(
    e / 2,
    o * 0.45,
    Math.min(e, o) * 0.34,
    e / 2,
    o * 0.45,
    Math.max(e, o) * 0.78,
  );
  (a.addColorStop(0, "rgba(0,0,0,0)"),
    a.addColorStop(1, "rgba(0,0,0,0.34)"),
    (t.fillStyle = a),
    t.fillRect(0, 0, e, o),
    t.restore());
}
function El(t, e, o, a, l = 12) {
  t.save();
  const n = t.createLinearGradient(0, o, 0, o + l);
  (n.addColorStop(0, O(v.woodMid, 12)),
    n.addColorStop(1, v.woodDark),
    (t.fillStyle = n),
    m(t, e, o, a, l, 4),
    t.fill(),
    (t.fillStyle = p("#ffd9a0", 0.25)),
    t.fillRect(e, o, a, 2));
  const i = t.createLinearGradient(0, o + l, 0, o + l + 18);
  (i.addColorStop(0, "rgba(0,0,0,0.35)"),
    i.addColorStop(1, "rgba(0,0,0,0)"),
    (t.fillStyle = i),
    t.fillRect(e, o + l, a, 18),
    t.restore());
}
function Ko(t, e, o, a, l, n) {
  const s = [v.tentRed, v.bulbYellow, v.uiTeal, v.uiPink, "#7ad86b"];
  (t.save(),
    t.beginPath(),
    t.moveTo(e, o),
    t.quadraticCurveTo(e + a / 2, o + 26 * 2, e + a, o),
    (t.strokeStyle = p("#2a1a10", 0.85)),
    (t.lineWidth = 2.5),
    t.stroke());
  for (let r = 0; r < l; r++) {
    const f = (r + 0.5) / l,
      h = e + a * f,
      d = o + 2 * 26 * f * (1 - f) * 2,
      y = Math.sin(n * 1.6 + r * 0.7) * 2.5,
      g = (a / l) * 0.72,
      A = 26;
    (t.save(),
      t.translate(h + y, d),
      t.beginPath(),
      t.moveTo(-g / 2, 0),
      t.lineTo(g / 2, 0),
      t.lineTo(0, A),
      t.closePath());
    const S = t.createLinearGradient(0, 0, 0, A),
      R = s[r % s.length];
    (S.addColorStop(0, O(R, 12)),
      S.addColorStop(1, j(R, 22)),
      (t.fillStyle = S),
      t.fill(),
      (t.strokeStyle = p("#000000", 0.25)),
      (t.lineWidth = 1),
      t.stroke(),
      t.restore());
  }
  t.restore();
}
const M = {
  bgTop: "#3a1811",
  bgBottom: "#1c0b07",
  panelTop: "#5c2a1a",
  panelBottom: "#2a1109",
  cardTop: "#4a2216",
  cardBottom: "#22100a",
  gold: "#e8b23c",
  goldLight: "#ffd97a",
  cream: "#fff3d6",
  red: "#c0392b",
  redLight: "#e74c3c",
  green: "#27ae60",
  greenLight: "#2ecc71",
  blue: "#3a8fc7",
};
function je(t, e = 0) {
  const o = t.createLinearGradient(0, 0, 0, b);
  (o.addColorStop(0, M.bgTop),
    o.addColorStop(1, M.bgBottom),
    (t.fillStyle = o),
    t.fillRect(0, 0, c, b),
    t.save());
  for (let a = 0; a < 3; a++) {
    const l = c * (0.2 + a * 0.3),
      n = b * (0.18 + a * 0.3),
      i = 320,
      s = t.createRadialGradient(l, n, 10, l, n, i);
    (s.addColorStop(0, p("#ffb45e", 0.1 + 0.03 * Math.sin(e + a))),
      s.addColorStop(1, "rgba(0,0,0,0)"),
      (t.fillStyle = s),
      t.fillRect(l - i, n - i, i * 2, i * 2));
  }
  t.restore();
}
function le(t, e, o, a, l, n = 18) {
  t.save();
  const i = t.createLinearGradient(0, o, 0, o + l);
  (i.addColorStop(0, M.panelTop),
    i.addColorStop(1, M.panelBottom),
    m(t, e, o, a, l, n),
    (t.fillStyle = i),
    t.fill(),
    (t.strokeStyle = M.gold),
    (t.lineWidth = 3),
    m(t, e, o, a, l, n),
    t.stroke(),
    (t.strokeStyle = p(M.goldLight, 0.3)),
    (t.lineWidth = 1),
    m(t, e + 4, o + 4, a - 8, l - 8, n - 4),
    t.stroke(),
    t.restore());
}
function de(t, e, o, a, l, n = 26) {
  const s = e - a / 2,
    r = o - 46 / 2,
    f = 22;
  (t.save(),
    (t.fillStyle = j(M.red, 32)),
    [-1, 1].forEach((d) => {
      t.beginPath();
      const y = e + d * (a / 2 - 4);
      (t.moveTo(y, r + 6),
        t.lineTo(y + d * f, r + 2),
        t.lineTo(y + d * f, r + 46 - 2),
        t.lineTo(y, r + 46 - 6),
        t.closePath(),
        t.fill());
    }));
  const h = t.createLinearGradient(0, r, 0, r + 46);
  (h.addColorStop(0, M.redLight),
    h.addColorStop(1, j(M.red, 18)),
    m(t, s, r, a, 46, 8),
    (t.fillStyle = h),
    t.fill(),
    (t.strokeStyle = M.gold),
    (t.lineWidth = 2.5),
    m(t, s, r, a, 46, 8),
    t.stroke(),
    P(t, l, e, o + 1, { size: n, color: "#ffffff", weight: 900, outline: j(M.red, 55), outlineWidth: 4 }),
    t.restore());
}
function Me(t, e, o, a, l, n = {}) {
  const i = n.radius ?? 14;
  t.save();
  const s = t.createLinearGradient(0, o, 0, o + l);
  (s.addColorStop(0, n.locked ? "#1c0d08" : M.cardTop),
    s.addColorStop(1, n.locked ? "#100704" : M.cardBottom),
    m(t, e, o, a, l, i),
    (t.fillStyle = s),
    t.fill(),
    n.selected
      ? ((t.strokeStyle = M.goldLight),
        (t.lineWidth = 3.5),
        (t.shadowColor = p(M.goldLight, 0.8)),
        (t.shadowBlur = 12))
      : ((t.strokeStyle = p(M.gold, n.locked ? 0.25 : 0.55)), (t.lineWidth = 2)),
    m(t, e, o, a, l, i),
    t.stroke(),
    t.restore());
}
function Le(t, e, o, a, l = 18, n = "coin") {
  t.save();
  const i = String(a),
    s = 34 + i.length * l * 0.62,
    r = l * 1.9;
  (m(t, e - s / 2, o - r / 2, s, r, r / 2),
    (t.fillStyle = "rgba(0,0,0,0.45)"),
    t.fill(),
    (t.strokeStyle = p(n === "gem" ? "#7fd4ff" : n === "ticket" ? "#ff8fb8" : M.gold, 0.8)),
    (t.lineWidth = 2),
    m(t, e - s / 2, o - r / 2, s, r, r / 2),
    t.stroke());
  const f = l * 0.55,
    h = e - s / 2 + f + 6;
  if (n !== "coin") {
    (P(t, n === "gem" ? "💎" : "🎟", h, o + 1, { size: l * 1.05, shadow: !1 }),
      P(t, i, h + f + 4 + (s - f * 2 - 14) / 2 - 2, o, {
        size: l,
        color: n === "gem" ? "#bfe9ff" : "#ffd0e2",
        weight: 900,
      }),
      t.restore());
    return;
  }
  const d = t.createRadialGradient(h - f * 0.3, o - f * 0.3, 1, h, o, f);
  (d.addColorStop(0, "#ffe9a0"),
    d.addColorStop(1, "#c98d00"),
    t.beginPath(),
    t.arc(h, o, f, 0, Math.PI * 2),
    (t.fillStyle = d),
    t.fill(),
    (t.strokeStyle = "#8a6100"),
    (t.lineWidth = 1.2),
    t.stroke(),
    P(t, i, h + f + 4 + (s - f * 2 - 14) / 2 - 2, o, { size: l, color: M.goldLight, weight: 900 }),
    t.restore());
}
function Il(t, e, o, a, l, n, i) {
  const s = [],
    f = (a - 8 * (n.length - 1)) / n.length;
  return (
    n.forEach((h, d) => {
      const y = e + d * (f + 8),
        g = d === i;
      t.save();
      const A = t.createLinearGradient(0, o, 0, o + l);
      (g
        ? (A.addColorStop(0, M.redLight), A.addColorStop(1, j(M.red, 20)))
        : (A.addColorStop(0, "#3a1c12"), A.addColorStop(1, "#1c0d08")),
        m(t, y, o, f, l, 10),
        (t.fillStyle = A),
        t.fill(),
        (t.strokeStyle = g ? M.goldLight : p(M.gold, 0.4)),
        (t.lineWidth = g ? 3 : 1.5),
        m(t, y, o, f, l, 10),
        t.stroke(),
        P(t, h, y + f / 2, o + l / 2, {
          size: Math.min(16, f / (h.length * 0.55)),
          color: g ? "#ffffff" : p(M.cream, 0.75),
          weight: 800,
        }),
        t.restore(),
        s.push({ x: y, y: o, w: f, h: l }));
    }),
    s
  );
}
function ja(t, e, o, a) {
  (t.save(),
    t.beginPath(),
    t.arc(e, o, a, 0, Math.PI * 2),
    (t.fillStyle = M.green),
    t.fill(),
    (t.strokeStyle = "#ffffff"),
    (t.lineWidth = 2),
    t.stroke(),
    t.beginPath(),
    t.moveTo(e - a * 0.42, o),
    t.lineTo(e - a * 0.1, o + a * 0.36),
    t.lineTo(e + a * 0.46, o - a * 0.34),
    (t.strokeStyle = "#ffffff"),
    (t.lineWidth = a * 0.28),
    (t.lineCap = "round"),
    (t.lineJoin = "round"),
    t.stroke(),
    t.restore());
}
function Ua(t, e, o, a) {
  t.save();
  const l = a,
    n = a * 0.8;
  ((t.strokeStyle = p(M.cream, 0.65)),
    (t.lineWidth = Math.max(2, a * 0.13)),
    t.beginPath(),
    t.arc(e, o - n * 0.34, l * 0.3, Math.PI, 0),
    t.stroke(),
    m(t, e - l / 2, o - n * 0.1, l, n * 0.72, 4),
    (t.fillStyle = p(M.cream, 0.75)),
    t.fill(),
    t.restore());
}
function ct(t, e, o, a, l = 900) {
  (t.save(), (t.font = `${l} ${a}px 'Segoe UI', sans-serif`));
  const n = t.measureText(e).width;
  return (t.restore(), n <= o ? a : Math.max(10, Math.floor(a * (o / n))));
}
function Y(t, e, o, a, l, n, i, s = {}) {
  const r = i === "green" ? M.green : i === "gold" ? M.gold : i === "red" ? M.red : M.blue;
  (t.save(), s.disabled && (t.globalAlpha = 0.45));
  const f = t.createLinearGradient(0, o, 0, o + l);
  (f.addColorStop(0, O(r, 18)),
    f.addColorStop(1, j(r, 26)),
    m(t, e, o, a, l, l * 0.28),
    (t.fillStyle = f),
    t.fill(),
    (t.strokeStyle = p("#ffffff", 0.55)),
    (t.lineWidth = 2.5),
    m(t, e, o, a, l, l * 0.28),
    t.stroke(),
    m(t, e + 5, o + 4, a - 10, l * 0.36, l * 0.18),
    (t.fillStyle = p("#ffffff", 0.22)),
    t.fill());
  const h = s.icon ? `${s.icon}  ${n}` : n;
  (P(t, h, e + a / 2, o + l / 2, {
    size: ct(t, h, a - 36, l * 0.42, 900),
    color: "#ffffff",
    weight: 900,
    outline: j(r, 55),
    outlineWidth: 3,
  }),
    t.restore());
}
let ql = 0;
const ee = (t) => `${t}_${ql++}`,
  We = "#d4382f",
  Ye = "#d9a441",
  Je = "#3f7fd4",
  yt = "#4aa84a",
  ko = "#8b5cc7";
function _(t, e, o, a, l = 52) {
  return { id: ee("hole"), x: t, y: e, radius: l, score: o, ringColor: a };
}
function ba(t, e, o, a, l = 44, n = 900) {
  return { id: ee("hole"), x: t, y: e, radius: l, score: o, ringColor: a, magnet: n };
}
function Ta(t, e, o, a, l = 44, n = -700) {
  return { id: ee("hole"), x: t, y: e, radius: l, score: o, ringColor: a, magnet: n };
}
function Oa(t, e, o, a, l = 48, n = 2.4, i = 0.55) {
  return { id: ee("hole"), x: t, y: e, radius: l, score: o, ringColor: a, gate: { period: n, openRatio: i } };
}
function Et(t, e, o, a, l, n = 48) {
  return { id: ee("hole"), x: t, y: e, radius: n, score: o, ringColor: a, seq: l };
}
function It(t, e, o, a, l = 26, n) {
  return {
    id: ee("kuka"),
    kind: n ? "movingKuka" : "kuka",
    color: a,
    x: t,
    y: e,
    radius: l,
    score: o,
    moving: n,
  };
}
function Se(t, e, o, a, l = {}) {
  const n = l.spacingX ?? 0.118,
    i = l.spacingY ?? 0.05,
    s = l.radius ?? 25,
    r = ["red", "yellow", "green", "blue"],
    f = [];
  let h = 0;
  for (let d = 0; d < o; d++) {
    const y = o - d,
      g = e - d * i;
    for (let A = 0; A < y; A++) {
      const S = t + (A - (y - 1) / 2) * n,
        R = l.bonusTop && d === o - 1 && y === 1,
        G = h % 3 === 2 ? "slim" : h % 4 === 1 ? "wide" : "classic",
        C = G === "slim" ? Math.round(a * 1.5) : G === "wide" ? Math.round(a * 0.8) : a,
        te = G === "slim" ? s * 0.8 : G === "wide" ? s * 1.18 : s;
      (f.push(
        R
          ? { ...Ga(S, g, a * 3, s), face: 2, hat: 3 }
          : {
              ...It(S, g, C, r[h % r.length], te),
              shape: G,
              face: (h * 2 + d) % 5,
              hat: h % 4 === 0 ? 1 : h % 5 === 3 ? 2 : 0,
            },
      ),
        h++);
    }
  }
  return f;
}
function Wl(t, e, o, a, l) {
  return {
    id: ee("kuka"),
    kind: l ? "movingKuka" : "kuka",
    color: "bonus",
    x: t,
    y: e,
    radius: 44,
    score: o,
    moving: l,
    shape: "wide",
    face: 3,
    hat: 3,
    boss: { hp: a },
  };
}
function Ga(t, e, o, a = 26, l) {
  return { id: ee("kuka"), kind: "bonus", color: "bonus", x: t, y: e, radius: a, score: o, moving: l };
}
function Qe(t, e, o, a = 1, l = "#6b4bb0") {
  return { id: ee("decor"), toy: t, x: e, y: o, scale: a, pedestal: l };
}
function xe(t, e, o, a, l) {
  return { id: ee("obs"), x: t, y: e, width: o, height: a, kind: "crate", moving: l };
}
function Xe(t, e, o, a, l = 2, n) {
  return { id: ee("obs"), x: t, y: e, width: o, height: a, kind: "shield", durability: l, moving: n };
}
function tt(t, e, o, a, l = 2.2) {
  return { id: ee("obs"), x: t, y: e, width: o, height: a, kind: "spinner", spinSpeed: l };
}
function Yl(t, e, o, a) {
  return { id: ee("obs"), x: t, y: e, width: o, height: a, kind: "curtain" };
}
function qt(t, e, o, a, l) {
  return { id: ee("obs"), x: t, y: e, width: o, height: a, kind: "bouncer", moving: l };
}
function So(t, e, o = 54, a = 74) {
  return { id: ee("obs"), x: t, y: e, width: o, height: a, kind: "bell" };
}
function Ka(t, e, o, a, l, n = 900) {
  return { id: ee("obs"), x: t, y: e, width: o, height: a, kind: "fan", windAngle: l, windForce: n };
}
function wa(t, e, o, a, l = 76) {
  const n = ee("obs"),
    i = ee("obs");
  return [
    { id: n, x: t, y: e, width: l, height: l, kind: "portal", linkId: i },
    { id: i, x: o, y: a, width: l, height: l, kind: "portal", linkId: n },
  ];
}
function Va(t, e, o = 70, a) {
  return { id: ee("obs"), x: t, y: e, width: o, height: o, kind: "bumper", moving: a };
}
function Cl(t, e, o, a) {
  return { id: ee("obs"), x: t, y: e, width: o, height: a, kind: "sticky" };
}
function ot(t, e, o, a = 74, l = 82) {
  return { id: ee("obs"), x: t, y: e, width: a, height: l, kind: "slingshot", kickAngle: o };
}
function Ro(t, e, o = 3, a = 0.1) {
  const l = [];
  for (let n = 0; n < o; n++) {
    const i = t + (n - (o - 1) / 2) * a;
    l.push({ id: ee("obs"), x: i, y: e, width: 56, height: 30, kind: "dropTarget" });
  }
  return l;
}
function mo(t, e, o = 3, a = 0.14) {
  const l = [];
  for (let n = 0; n < o; n++) {
    const i = t + (n - (o - 1) / 2) * a;
    l.push({ id: ee("obs"), x: i, y: e, width: 62, height: 46, kind: "rollover" });
  }
  return l;
}
function Za(t, e, o = 72, a = 64) {
  return { id: ee("obs"), x: t, y: e, width: o, height: a, kind: "splitter" };
}
const xt = () => [
    _(0.26, 0.16, 50, We, 62),
    _(0.5, 0.14, 100, Ye, 44),
    _(0.74, 0.16, 50, Je, 62),
    _(0.5, 0.3, 150, yt, 36),
  ],
  Ie = () => [
    Qe("cat", 0.11, 0.5, 1.05, "#8b5cc7"),
    Qe("heart", 0.89, 0.5, 1, "#c0392b"),
    Qe("elephant", 0.12, 0.72, 0.95, "#2e86c1"),
    Qe("swan", 0.88, 0.72, 0.95, "#27ae60"),
  ],
  Nl = [
    {
      id: 1,
      name: "İlk Atışlar",
      shots: 6,
      targetScore: 300,
      kukas: Se(0.5, 0.5, 2, 25),
      holes: [_(0.5, 0.2, 100, Ye, 48), _(0.26, 0.34, 50, We, 64)],
      obstacles: [],
      decor: Ie(),
    },
    {
      id: 2,
      name: "Üçlü Hedef",
      shots: 7,
      targetScore: 400,
      kukas: Se(0.5, 0.5, 2, 25),
      holes: [_(0.28, 0.17, 50, We, 62), _(0.5, 0.15, 100, Ye, 46), _(0.72, 0.17, 50, Je, 62)],
      obstacles: [],
      decor: Ie(),
    },
    {
      id: 3,
      name: "Panayır Standı",
      shots: 7,
      targetScore: 850,
      kukas: Se(0.5, 0.5, 3, 30),
      holes: xt(),
      obstacles: [xe(0.5, 0.72, 96, 66)],
      decor: Ie(),
    },
    {
      id: 4,
      name: "Hepsini Devir",
      goal: { kind: "clearAll" },
      shots: 8,
      targetScore: 700,
      kukas: Se(0.5, 0.5, 2, 35),
      holes: xt(),
      obstacles: [tt(0.5, 0.62, 132, 20, 2.2), xe(0.2, 0.76, 84, 62)],
      decor: Ie(),
    },
    {
      id: 5,
      name: "Zincirleme",
      goal: { kind: "chain", chain: 3 },
      shots: 8,
      targetScore: 1050,
      kukas: Se(0.5, 0.5, 3, 30, { bonusTop: !0 }),
      holes: xt(),
      obstacles: [
        ot(0.13, 0.8, -Math.PI / 2.6),
        ot(0.87, 0.8, -Math.PI + Math.PI / 2.6),
        qt(0.5, 0.7, 104, 68),
        xe(0.24, 0.78, 80, 60),
        xe(0.76, 0.78, 80, 60),
      ],
      decor: Ie(),
    },
    {
      id: 6,
      name: "Mıknatıs Delik",
      shots: 9,
      targetScore: 800,
      kukas: Se(0.5, 0.5, 2, 35, { bonusTop: !0 }),
      holes: [_(0.26, 0.16, 50, We, 62), ba(0.5, 0.13, 150, Ye, 40), _(0.74, 0.16, 50, Je, 62)],
      obstacles: [Xe(0.5, 0.5, 96, 58, 2), tt(0.28, 0.68, 110, 18, -2), xe(0.74, 0.74, 82, 60)],
      decor: Ie(),
    },
    {
      id: 7,
      goal: { kind: "timed", seconds: 60 },
      name: "Kapaklı Hedef",
      shots: 9,
      targetScore: 950,
      kukas: Se(0.5, 0.5, 3, 35),
      holes: [_(0.24, 0.17, 50, We, 60), Oa(0.5, 0.14, 200, Ye, 46, 2.4, 0.5), _(0.76, 0.17, 50, Je, 60)],
      obstacles: [...Ro(0.5, 0.88, 3), So(0.86, 0.42), qt(0.5, 0.72, 100, 64), xe(0.18, 0.74, 80, 60)],
      decor: Ie(),
    },
    {
      id: 8,
      name: "Sırayla Vur",
      shots: 10,
      targetScore: 1450,
      kukas: Se(0.5, 0.5, 3, 40, { bonusTop: !0 }),
      holes: [
        Et(0.24, 0.17, 100, We, 1, 54),
        Et(0.5, 0.13, 100, Ye, 2, 46),
        Et(0.76, 0.17, 100, Je, 3, 54),
        _(0.5, 0.3, 150, yt, 38),
      ],
      obstacles: [
        Xe(0.5, 0.52, 96, 56, 2, { axis: "x", range: 0.2, speed: 1.2 }),
        tt(0.26, 0.7, 116, 18, 2.6),
        tt(0.74, 0.7, 116, 18, -2.6),
        Va(0.5, 0.86, 70),
      ],
      decor: Ie(),
    },
    {
      id: 9,
      goal: { kind: "forbidden", avoid: "red" },
      name: "Dar Geçit",
      shots: 10,
      targetScore: 1900,
      kukas: Se(0.5, 0.5, 3, 40, { bonusTop: !0 }),
      holes: [
        _(0.2, 0.14, 100, We, 56),
        _(0.5, 0.12, 150, Ye, 40),
        _(0.8, 0.14, 100, Je, 56),
        _(0.35, 0.28, 200, yt, 32),
        _(0.65, 0.28, 200, ko, 32),
      ],
      obstacles: [
        ...mo(0.5, 0.36, 3),
        Xe(0.35, 0.55, 84, 54, 2),
        Xe(0.65, 0.55, 84, 54, 2),
        Za(0.5, 0.66, 76, 66),
        qt(0.5, 0.82, 108, 62, { axis: "x", range: 0.18, speed: 1.4 }),
      ],
      decor: Ie(),
    },
    {
      id: 10,
      name: "Boss Bölümü",
      shots: 12,
      targetScore: 2450,
      bigReward: !0,
      kukas: [...Se(0.28, 0.5, 2, 45), ...Se(0.72, 0.5, 2, 45), Ga(0.5, 0.4, 150)],
      holes: [
        _(0.18, 0.13, 100, We, 56),
        Ta(0.5, 0.11, 400, Ye, 36, -650),
        _(0.82, 0.13, 100, Je, 56),
        _(0.32, 0.28, 150, yt, 44),
        _(0.68, 0.28, 150, ko, 44),
      ],
      obstacles: [
        ot(0.13, 0.8, -Math.PI / 2.6),
        ot(0.87, 0.8, -Math.PI + Math.PI / 2.6),
        ...Ro(0.5, 0.88, 3),
        ...mo(0.5, 0.34, 3),
        tt(0.5, 0.48, 150, 20, 3),
        So(0.87, 0.4),
        Ka(0.5, 0.66, 210, 120, 0, 780),
        Xe(0.22, 0.6, 80, 54, 3),
        Xe(0.78, 0.6, 80, 54, 3),
        ...wa(0.14, 0.78, 0.86, 0.78),
      ],
      decor: Ie(),
    },
  ];
function Hl(t) {
  let e = t;
  return () => {
    ((e |= 0), (e = (e + 1831565813) | 0));
    let o = Math.imul(e ^ (e >>> 15), 1 | e);
    return ((o = (o + Math.imul(o ^ (o >>> 7), 61 | o)) ^ o), ((o ^ (o >>> 14)) >>> 0) / 4294967296);
  };
}
const zt = [We, Ye, Je, yt, ko],
  Do = [
    "Panayır Çılgınlığı",
    "Gece Nöbeti",
    "Ampul Işıkları",
    "Kadife Perde",
    "Şanslı Stant",
    "Karnaval Rüzgarı",
    "Yıldız Avı",
    "Fırlatma Ustası",
    "Altın Saat",
    "Son Şans",
    "Gizemli Stant",
    "Renkli Rüya",
    "Panayır Efsanesi",
    "Usta Nişancı",
    "Gece Yarısı Turu",
  ],
  De = ["cat", "heart", "elephant", "swan", "butterfly", "cupcake", "fairy", "lollipop", "magic_wand"];
function fe(t, e, o) {
  return Math.max(e, Math.min(o, t));
}
const Jo = [50, 100, 150, 200, 250, 300];
function Bl(t, e, o) {
  if (o) return { kind: "score" };
  if (t % 13 === 0) return { kind: "oneShot" };
  switch (t % 7) {
    case 1:
      return { kind: "clearAll" };
    case 2:
      return { kind: "chain", chain: fe(2 + Math.floor(e / 25), 2, 5) };
    case 3:
      return { kind: "sequence", rounds: 1 };
    case 4:
      return { kind: "timed", seconds: Math.round(fe(60 - e * 0.25, 30, 60)) };
    case 5:
      return { kind: "rescue", locks: fe(2 + Math.floor(e / 35), 2, 4) };
    case 6:
      return { kind: "forbidden", avoid: Qo[e % Qo.length] };
    default:
      return { kind: "score" };
  }
}
const Xo = {
    clearAll: "Hepsini Devir",
    sequence: "Sıralı Hedef",
    chain: "Zincir",
    rescue: "Kurtarma",
    oneShot: "Tek Atış",
    forbidden: "Yasaklı Renk",
    timed: "Saatli Panayır",
  },
  Qo = ["red", "blue", "yellow", "green"];
function Ea(t) {
  const e = t - 10,
    o = Hl(t * 7919 + 13),
    a = t % 10 === 0,
    l = Bl(t, e, a),
    n = Math.round(fe(3 + e / 12, 3, 7)),
    i = fe(56 - e * 0.34, 30, 56),
    s = fe(Math.floor(e / 15), 0, Jo.length - 1),
    r = Jo[s],
    f = l.kind === "oneShot" ? 1 : Math.round(fe(7 + e / 4, 7, 20)) + (a ? 2 : 0),
    h = [],
    d = Math.min(n, 3 + (e > 30 ? 1 : 0));
  for (let q = 0; q < d; q++) {
    const w = d === 1 ? 0.5 : 0.2 + (0.6 * q) / (d - 1),
      I = Math.abs(w - 0.5) < 0.06,
      $ = 0.13 + (q % 2) * 0.02,
      ne = I ? r * 2 : r,
      re = I ? i * 0.76 : i * 1.15,
      ie = zt[q % zt.length],
      Ne = o();
    e >= 65 && I && Ne < 0.3
      ? h.push(Ta(w, $, Math.round(ne * 1.6), ie, re))
      : e >= 30 && I && Ne < 0.55
        ? h.push(ba(w, $, ne, ie, re))
        : e >= 20 && Ne < 0.28
          ? h.push(Oa(w, $, Math.round(ne * 1.4), ie, re, 2 + o() * 1.6, 0.45 + o() * 0.2))
          : h.push(_(w, $, ne, ie, re));
  }
  const y = l.kind === "sequence" ? Math.max(3, n - d) : n - d,
    g = l.kind === "sequence" || (e >= 25 && t % 5 === 0 && y >= 2);
  for (let q = 0; q < y; q++) {
    const w = y === 1 ? 0.5 : 0.28 + (0.44 * q) / Math.max(1, y - 1),
      I = 0.26 + (q % 2) * 0.03,
      $ = zt[(q + 3) % zt.length];
    g ? h.push(Et(w, I, r + 50, $, q + 1, i * 0.72)) : h.push(_(w, I, r + 50, $, i * 0.6));
  }
  const A = fe(Math.floor(e / 9) + 1 + (a ? 1 : 0), 1, 5),
    S = [];
  for (let q = 0; q < A; q++) {
    const w = 0.26 + (0.48 * q) / Math.max(1, A - 1 || 1),
      I = fe(0.56 + (q % 3) * 0.1, 0.56, 0.84),
      $ =
        e > 20 && o() < 0.5
          ? {
              axis: "x",
              range: Math.min(0.1 + o() * 0.12, Math.min(w - 0.2, 0.8 - w)),
              speed: (1 + o()) * (o() < 0.5 ? 1 : -1),
            }
          : void 0,
      ne = 76 + o() * 34,
      re = 54 + o() * 20,
      ie = o();
    if (e >= 70 && ie < 0.08) S.push(Cl(w, fe(I + 0.06, 0.5, 0.84), ne * 1.3, re * 0.8));
    else if (e >= 60 && ie < 0.15) S.push(Za(w, fe(I - 0.06, 0.4, 0.7)));
    else if (e >= 50 && ie < 0.22)
      S.push(Ka(w, I, ne * 2.1, re * 2, o() < 0.5 ? 0 : Math.PI, 700 + o() * 400));
    else if (e >= 35 && ie < 0.3) S.push(Va(w, fe(I + 0.05, 0.5, 0.86), 62 + o() * 16, $));
    else if (e >= 55 && ie < 0.38) S.push(So(w, fe(I - 0.12, 0.3, 0.6)));
    else if (e >= 45 && ie < 0.5) S.push(Yl(w, I, ne * 1.1, re * 1.5));
    else if (e >= 18 && ie < 0.52) S.push(qt(w, I, ne, re, $));
    else if (e >= 8 && ie < 0.72) {
      const Ne = (1.8 + Math.min(e, 70) * 0.02) * (o() < 0.5 ? 1 : -1);
      S.push(tt(w, I, ne * 1.25, 18, Ne));
    } else e >= 4 && ie < 0.88 ? S.push(Xe(w, I, ne, re, e >= 45 ? 3 : 2, $)) : S.push(xe(w, I, ne, re, $));
  }
  const R = 25 + Math.floor(e / 4) * 5,
    G = fe(2 + Math.floor(e / 30), 2, 3),
    C = e >= 55 ? [...Se(0.3, 0.5, 2, R), ...Se(0.7, 0.5, 2, R)] : Se(0.5, 0.5, G, R, { bonusTop: G >= 3 });
  if (
    (e >= 15 && S.push(ot(0.13, 0.8, -Math.PI / 2.6), ot(0.87, 0.8, -Math.PI + Math.PI / 2.6)),
    e >= 25 && t % 3 === 0 && S.push(...Ro(0.5, 0.88, 3)),
    e >= 35 && t % 4 === 0 && S.push(...mo(0.5, 0.36, 3)),
    e >= 40 && t % 7 === 0 && S.push(...wa(0.16, 0.72, 0.84, 0.72)),
    a)
  ) {
    const q = fe(2 + Math.floor(e / 25), 2, 5);
    ((C.length = 0),
      C.push(
        It(0.2, 0.52, R, "red"),
        It(0.8, 0.52, R, "blue"),
        Wl(0.5, 0.44, R * 6, q, { axis: "x", range: 0.12, speed: 0.9 }),
      ));
  }
  if (l.kind === "rescue") {
    const q = l.locks ?? 2;
    for (let w = 0; w < q; w++) {
      const I = 0.5 + (w - (q - 1) / 2) * 0.18;
      S.push(Xe(I, 0.62, 78, 58, 2));
    }
  }
  l.kind === "forbidden" &&
    l.avoid &&
    (C.some((w) => w.color === l.avoid) || C.push(It(0.5, 0.44, R, l.avoid)));
  const te = C.reduce((q, w) => q + w.score, 0),
    Ue = h.reduce((q, w) => q + w.score, 0) + te;
  let B = fe(1.15 + e * 0.018, 1.15, 2.3) * (a ? 1.15 : 1);
  l.kind === "oneShot"
    ? (B = 0.3)
    : l.kind === "timed"
      ? (B *= 0.6)
      : l.kind !== "score" && l.kind !== "forbidden" && (B *= 0.55);
  const oe = Math.max(50, Math.round((Ue * B) / 50) * 50),
    N = [
      Qe(De[t % De.length], 0.1, 0.5, 1),
      Qe(De[(t + 3) % De.length], 0.9, 0.5, 1, "#c0392b"),
      Qe(De[(t + 6) % De.length], 0.12, 0.73, 0.9, "#2e86c1"),
      Qe(De[(t + 1) % De.length], 0.88, 0.73, 0.9, "#27ae60"),
    ],
    Q = a ? `Boss Bölümü ${t}` : Xo[l.kind] ? `${Xo[l.kind]} ${t}` : `${Do[e % Do.length]} ${t}`;
  return {
    id: t,
    name: Q,
    shots: f,
    targetScore: oe,
    kukas: C,
    holes: h,
    obstacles: S,
    decor: N,
    bigReward: a,
    goal: l,
  };
}
const Dl = Array.from({ length: 90 }, (t, e) => Ea(e + 11)),
  Ct = [...Nl, ...Dl];
function Ia(t, e, o) {
  const a = 11 + (Math.abs(t) % 90),
    l = Ea(a),
    n = fe(o, 0.6, 1.8);
  return {
    ...l,
    id: l.id,
    name: e,
    shots: Math.max(4, Math.round(l.shots * (1 / n))),
    targetScore: Math.max(50, Math.round((l.targetScore * n) / 50) * 50),
    bigReward: !1,
  };
}
function qa(t = new Date()) {
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function Jl(t) {
  let e = 2166136261;
  for (let o = 0; o < t.length; o++) ((e ^= t.charCodeAt(o)), (e = Math.imul(e, 16777619)));
  return e >>> 0;
}
function Xl(t = new Date()) {
  const e = qa(t);
  return Ia(Jl(e), "Günlük Meydan Okuma", 1.25);
}
function Ql(t = Date.now()) {
  return [0, 1, 2].map((e) => Ia(t + e * 977, `Panayır Turu ${e + 1}/3`, 0.9 + e * 0.35));
}
function Fo(t) {
  return Ct.find((e) => e.id === t) ?? Ct[0];
}
function Lo(t) {
  const e = 50 + t.id * 10,
    o = t.id > 10 ? Math.round(20 * Math.pow(1.05, t.id - 10)) : 0,
    a = t.bigReward ? 500 : 0;
  return e + o + a;
}
const Z = {
  pendingToy: null,
  rewardReturnScene: "mainMenu",
  nameReturnScene: "mainMenu",
  mode: "campaign",
  customLevel: null,
  tourLevels: [],
  tourIndex: 0,
  tourScore: 0,
  tourCarryShots: 0,
};
function vt() {
  ((Z.mode = "campaign"),
    (Z.customLevel = null),
    (Z.tourLevels = []),
    (Z.tourIndex = 0),
    (Z.tourScore = 0),
    (Z.tourCarryShots = 0));
}
class Fl {
  constructor() {
    u(this, "current", Fo(1));
  }
  loadLevel(e) {
    return ((this.current = Fo(e)), this.current);
  }
  loadCustom(e) {
    return ((this.current = e), this.current);
  }
  get shotsForLevel() {
    return this.current.shots;
  }
  isUnlocked(e) {
    return e <= U.get().highestUnlockedLevel;
  }
  completeLevel(e) {
    e &&
      Z.mode === "campaign" &&
      U.update((o) => {
        this.current.id >= o.highestUnlockedLevel &&
          this.current.id < Ct.length &&
          (o.highestUnlockedLevel = this.current.id + 1);
      });
  }
  get totalLevels() {
    return Ct.length;
  }
}
const E = new Fl(),
  he = {
    bear_brown: {
      id: "bear_brown",
      name: "Kahverengi Ayıcık",
      rarity: "COMMON",
      color: "#8a5a30",
      accent: "#5c3a21",
      weight: 30,
      emoji: "🧸",
    },
    rabbit_white: {
      id: "rabbit_white",
      name: "Beyaz Tavşan",
      rarity: "COMMON",
      color: "#f5f0ea",
      accent: "#e8a0b8",
      weight: 28,
      emoji: "🐰",
    },
    dog: {
      id: "dog",
      name: "Köpek",
      rarity: "COMMON",
      color: "#d9b98a",
      accent: "#7a4a28",
      weight: 26,
      emoji: "🐶",
    },
    duck: {
      id: "duck",
      name: "Ördek",
      rarity: "COMMON",
      color: "#ffd84d",
      accent: "#f0921f",
      weight: 27,
      emoji: "🦆",
    },
    lion_cub: {
      id: "lion_cub",
      name: "Aslan Yavrusu",
      rarity: "COMMON",
      color: "#f0b74d",
      accent: "#b5701f",
      weight: 24,
      emoji: "🦁",
    },
    fox: {
      id: "fox",
      name: "Tilki",
      rarity: "RARE",
      color: "#e8722c",
      accent: "#fff4e0",
      weight: 16,
      emoji: "🦊",
    },
    penguin: {
      id: "penguin",
      name: "Penguen",
      rarity: "RARE",
      color: "#2b2b3a",
      accent: "#f5f5f5",
      weight: 15,
      emoji: "🐧",
    },
    robot: {
      id: "robot",
      name: "Robot",
      rarity: "RARE",
      color: "#7f8c9a",
      accent: "#1fc8db",
      weight: 14,
      emoji: "🤖",
    },
    owl: {
      id: "owl",
      name: "Baykuş",
      rarity: "RARE",
      color: "#a97b4a",
      accent: "#f5e2b8",
      weight: 14,
      emoji: "🦉",
    },
    elephant: {
      id: "elephant",
      name: "Fil",
      rarity: "RARE",
      color: "#9fb3c4",
      accent: "#ffc4d6",
      weight: 13,
      emoji: "🐘",
    },
    panda: {
      id: "panda",
      name: "Panda",
      rarity: "EPIC",
      color: "#f5f5f5",
      accent: "#232323",
      weight: 7,
      emoji: "🐼",
    },
    dino: {
      id: "dino",
      name: "Dinozor",
      rarity: "EPIC",
      color: "#3fae5c",
      accent: "#245c33",
      weight: 6,
      emoji: "🦖",
    },
    koala: {
      id: "koala",
      name: "Koala",
      rarity: "EPIC",
      color: "#b8c0c8",
      accent: "#6b7278",
      weight: 6,
      emoji: "🐨",
    },
    deer: {
      id: "deer",
      name: "Geyik",
      rarity: "EPIC",
      color: "#c98a52",
      accent: "#fff4e0",
      weight: 6,
      emoji: "🦌",
    },
    lamb: {
      id: "lamb",
      name: "Kuzu",
      rarity: "EPIC",
      color: "#faf6f0",
      accent: "#3a2e2a",
      weight: 5,
      emoji: "🐑",
    },
    swan: {
      id: "swan",
      name: "Kuğu",
      rarity: "EPIC",
      color: "#d9c8f0",
      accent: "#f0921f",
      weight: 5,
      emoji: "🦢",
    },
    lollipop: {
      id: "lollipop",
      name: "Lolipop",
      rarity: "RARE",
      color: "#ff8ac4",
      accent: "#6ed0e8",
      weight: 15,
      emoji: "🍭",
    },
    cupcake: {
      id: "cupcake",
      name: "Kapkek",
      rarity: "RARE",
      color: "#f7c2d6",
      accent: "#a9713e",
      weight: 14,
      emoji: "🧁",
    },
    unicorn: {
      id: "unicorn",
      name: "Tek Boynuzlu At",
      rarity: "LEGENDARY",
      color: "#f3e7fb",
      accent: "#ff9ed8",
      weight: 2,
      emoji: "🦄",
    },
    cat: {
      id: "cat",
      name: "Sevimli Kedi",
      rarity: "LEGENDARY",
      color: "#f4b9c8",
      accent: "#ffffff",
      weight: 2,
      emoji: "🐱",
    },
    heart: {
      id: "heart",
      name: "Kalp",
      rarity: "LEGENDARY",
      color: "#ff5a7e",
      accent: "#ffd0dc",
      weight: 2,
      emoji: "❤️",
    },
    butterfly: {
      id: "butterfly",
      name: "Kelebek",
      rarity: "LEGENDARY",
      color: "#c98bff",
      accent: "#ffe27a",
      weight: 2,
      emoji: "🦋",
    },
    magic_wand: {
      id: "magic_wand",
      name: "Sihirli Değnek",
      rarity: "LEGENDARY",
      color: "#ffd84d",
      accent: "#ff8ac4",
      weight: 2,
      emoji: "🪄",
    },
    fairy: {
      id: "fairy",
      name: "Peri Kızı",
      rarity: "LEGENDARY",
      color: "#e6b8f5",
      accent: "#ffe27a",
      weight: 1,
      emoji: "🧚",
    },
    bear_gold: {
      id: "bear_gold",
      name: "Altın Ayı",
      rarity: "LEGENDARY",
      color: "#ffd700",
      accent: "#b8860b",
      weight: 1,
      emoji: "🏆",
    },
    strawberry: {
      id: "strawberry",
      name: "Çilek",
      rarity: "COMMON",
      color: "#ef4f66",
      accent: "#3fae5c",
      weight: 26,
      emoji: "🍓",
    },
    star_plush: {
      id: "star_plush",
      name: "Yıldız Yastık",
      rarity: "COMMON",
      color: "#ffe08a",
      accent: "#ffb84d",
      weight: 25,
      emoji: "⭐",
    },
    monkey_jester: {
      id: "monkey_jester",
      name: "Soytarı Maymun",
      rarity: "RARE",
      color: "#c9a06a",
      accent: "#c0392b",
      weight: 15,
      emoji: "🐵",
    },
    otter_pilot: {
      id: "otter_pilot",
      name: "Pilot Su Samuru",
      rarity: "RARE",
      color: "#8a6a4a",
      accent: "#7ad3e8",
      weight: 14,
      emoji: "🦦",
    },
    giraffe_rocking: {
      id: "giraffe_rocking",
      name: "Sallanan Zürafa",
      rarity: "RARE",
      color: "#e8c078",
      accent: "#c0392b",
      weight: 13,
      emoji: "🦒",
    },
    cloud: {
      id: "cloud",
      name: "Pofuduk Bulut",
      rarity: "RARE",
      color: "#fdf6fb",
      accent: "#ffb6d5",
      weight: 13,
      emoji: "☁️",
    },
    lion_knit: {
      id: "lion_knit",
      name: "Örgü Aslan",
      rarity: "EPIC",
      color: "#e0b070",
      accent: "#b8823a",
      weight: 7,
      emoji: "🦁",
    },
    dragon: {
      id: "dragon",
      name: "Ejderha",
      rarity: "EPIC",
      color: "#f08a6c",
      accent: "#6ed0e8",
      weight: 6,
      emoji: "🐉",
    },
    hamster_astro: {
      id: "hamster_astro",
      name: "Astronot Hamster",
      rarity: "EPIC",
      color: "#e8c89a",
      accent: "#dfe8f0",
      weight: 6,
      emoji: "🐹",
    },
    owl_steampunk: {
      id: "owl_steampunk",
      name: "Mekanik Baykuş",
      rarity: "EPIC",
      color: "#b08d57",
      accent: "#f5e2b8",
      weight: 6,
      emoji: "🦉",
    },
    cupcake_monster: {
      id: "cupcake_monster",
      name: "Kapkek Canavarı",
      rarity: "EPIC",
      color: "#f7e6c8",
      accent: "#6ed0e8",
      weight: 5,
      emoji: "👾",
    },
    bear_heart: {
      id: "bear_heart",
      name: "Kalpli Ayıcık",
      rarity: "EPIC",
      color: "#c8a075",
      accent: "#ffd75e",
      weight: 5,
      emoji: "💛",
    },
    carousel_horse: {
      id: "carousel_horse",
      name: "Atlıkarınca Atı",
      rarity: "EPIC",
      color: "#f3ecfb",
      accent: "#c9a8e8",
      weight: 5,
      emoji: "🎠",
    },
    bunny_flower: {
      id: "bunny_flower",
      name: "Çiçekli Tavşan",
      rarity: "EPIC",
      color: "#fdf3f6",
      accent: "#ff9ec4",
      weight: 5,
      emoji: "🌸",
    },
    snow_globe: {
      id: "snow_globe",
      name: "Kar Küresi",
      rarity: "LEGENDARY",
      color: "#d8ecf8",
      accent: "#ffd75e",
      weight: 2,
      emoji: "🔮",
    },
    bear_galaxy: {
      id: "bear_galaxy",
      name: "Galaksi Ayısı",
      rarity: "LEGENDARY",
      color: "#9b7fe0",
      accent: "#7ae8ff",
      weight: 1,
      emoji: "🌌",
    },
  },
  ge = [
    "bear_brown",
    "rabbit_white",
    "dog",
    "duck",
    "lion_cub",
    "fox",
    "penguin",
    "robot",
    "owl",
    "elephant",
    "panda",
    "dino",
    "koala",
    "deer",
    "lamb",
    "swan",
    "lollipop",
    "cupcake",
    "unicorn",
    "cat",
    "heart",
    "butterfly",
    "magic_wand",
    "fairy",
    "bear_gold",
    "strawberry",
    "star_plush",
    "monkey_jester",
    "otter_pilot",
    "giraffe_rocking",
    "cloud",
    "lion_knit",
    "dragon",
    "hamster_astro",
    "owl_steampunk",
    "cupcake_monster",
    "bear_heart",
    "carousel_horse",
    "bunny_flower",
    "snow_globe",
    "bear_galaxy",
  ];
function Ll(t) {
  const e = t.map((l) => he[l]),
    o = e.reduce((l, n) => l + n.weight, 0);
  let a = Math.random() * o;
  for (const l of e) if (((a -= l.weight), a <= 0)) return l.id;
  return e[e.length - 1].id;
}
class xl {
  list() {
    const e = U.get().toys;
    return ge.map((o) => ({ id: o, owned: !!e[o], data: e[o] ?? null }));
  }
  ownedCount() {
    const e = U.get().toys;
    return ge.filter((o) => !!e[o]).length;
  }
  get totalCount() {
    return ge.length;
  }
  defOf(e) {
    return he[e];
  }
}
const ve = new xl();
function _l(t) {
  return Object.values(t.levelStars ?? {}).reduce((e, o) => e + o, 0);
}
const $l = [
  {
    id: "first_level",
    name: "İLK ADIM",
    desc: "İlk bölümü tamamla",
    icon: "🎯",
    target: 1,
    progress: (t) => Math.min(1, t.highestUnlockedLevel - 1),
    reward: { coins: 50 },
  },
  {
    id: "toys_5",
    name: "OYUNCAK AVCISI",
    desc: "5 farklı oyuncak topla",
    icon: "🧸",
    target: 5,
    progress: (t) => Object.keys(t.toys).length,
    reward: { coins: 100 },
  },
  {
    id: "toys_15",
    name: "KOLEKSİYON USTASI",
    desc: "15 farklı oyuncak topla",
    icon: "🎁",
    target: 15,
    progress: (t) => Object.keys(t.toys).length,
    reward: { gems: 5 },
  },
  {
    id: "toys_all",
    name: "TÜM OYUNCAKLAR",
    desc: `${ge.length} oyuncağın tamamını topla`,
    icon: "🏆",
    target: ge.length,
    progress: (t) => Object.keys(t.toys).length,
    reward: { gems: 15 },
  },
  {
    id: "stars_30",
    name: "YILDIZ TOPLAYICI",
    desc: "Toplamda 30 yıldız kazan",
    icon: "⭐",
    target: 30,
    progress: (t) => _l(t),
    reward: { coins: 150 },
  },
  {
    id: "level_50",
    name: "PANAYIR EFSANESİ",
    desc: "50. bölümü aç",
    icon: "🎪",
    target: 50,
    progress: (t) => Math.min(50, t.highestUnlockedLevel),
    reward: { gems: 10 },
  },
  {
    id: "level_100",
    name: "YÜZ BÖLÜM",
    desc: "Tüm 100 bölümü aç",
    icon: "👑",
    target: 100,
    progress: (t) => Math.min(100, t.highestUnlockedLevel),
    reward: { gems: 25 },
  },
  {
    id: "score_10000",
    name: "PUAN KRALI",
    desc: "Toplam 10.000 puana ulaş",
    icon: "💯",
    target: 1e4,
    progress: (t) => Math.min(1e4, t.totalScore),
    reward: { coins: 200 },
  },
  {
    id: "streak_7",
    name: "SADIK OYUNCU",
    desc: "7 günlük giriş serisi yap",
    icon: "🔥",
    target: 7,
    progress: (t) => Math.min(7, t.dailyStreak),
    reward: { gems: 5 },
  },
  {
    id: "rich_5000",
    name: "ZENGİN TÜCCAR",
    desc: "Aynı anda 5000 jetona sahip ol",
    icon: "💰",
    target: 5e3,
    progress: (t) => Math.min(5e3, t.coins),
    reward: { gems: 3 },
  },
];
class en {
  list() {
    const e = U.get(),
      o = new Set(e.claimedAchievements ?? []);
    return $l.map((a) => {
      const l = a.progress(e);
      return { def: a, progress: l, done: l >= a.target, claimed: o.has(a.id) };
    });
  }
  claimableCount() {
    return this.list().filter((e) => e.done && !e.claimed).length;
  }
  claim(e) {
    const o = this.list().find((l) => l.def.id === e);
    if (!o || !o.done || o.claimed) return !1;
    const { reward: a } = o.def;
    return (
      a.coins && K.addCoins(a.coins),
      a.gems && K.addGems(a.gems),
      a.tickets && K.addTickets(a.tickets),
      U.update((l) => {
        (l.claimedAchievements || (l.claimedAchievements = []),
          l.claimedAchievements.includes(e) || l.claimedAchievements.push(e));
      }),
      !0
    );
  }
}
const _e = new en(),
  zo = [
    { id: "holes_5", type: "holes", desc: "5 delik vur", icon: "🎯", target: 5, reward: { coins: 100 } },
    { id: "holes_15", type: "holes", desc: "15 delik vur", icon: "🎯", target: 15, reward: { coins: 220 } },
    { id: "levels_1", type: "levels", desc: "1 bölüm tamamla", icon: "🏁", target: 1, reward: { coins: 90 } },
    {
      id: "levels_3",
      type: "levels",
      desc: "3 bölüm tamamla",
      icon: "🏁",
      target: 3,
      reward: { coins: 250 },
    },
    {
      id: "score_500",
      type: "score",
      desc: "500 puan topla",
      icon: "💯",
      target: 500,
      reward: { coins: 120 },
    },
    {
      id: "score_1500",
      type: "score",
      desc: "1500 puan topla",
      icon: "💯",
      target: 1500,
      reward: { coins: 300 },
    },
    { id: "shots_10", type: "shots", desc: "10 top fırlat", icon: "🏐", target: 10, reward: { coins: 80 } },
    { id: "shots_25", type: "shots", desc: "25 top fırlat", icon: "🏐", target: 25, reward: { coins: 180 } },
    { id: "combo_3", type: "combo", desc: "3 kombo yap", icon: "✨", target: 3, reward: { tickets: 1 } },
  ];
function tn() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function on(t) {
  const e = [...zo];
  let o = t;
  const a = () => ((o = (o * 1103515245 + 12345) & 2147483647), o / 2147483647);
  for (let i = e.length - 1; i > 0; i--) {
    const s = Math.floor(a() * (i + 1));
    [e[i], e[s]] = [e[s], e[i]];
  }
  const l = [],
    n = new Set();
  for (const i of e) {
    if (l.length >= 3) break;
    n.has(i.type) || (l.push(i), n.add(i.type));
  }
  for (const i of e) {
    if (l.length >= 3) break;
    l.includes(i) || l.push(i);
  }
  return l;
}
class an {
  ensureToday() {
    const e = U.get(),
      o = tn();
    if (e.missions?.day === o) return;
    const a = Array.from(o).reduce((n, i) => n + i.charCodeAt(0), 0) * 7919 + e.createdAt,
      l = on(a).map((n) => ({ id: n.id, progress: 0 }));
    U.update((n) => {
      n.missions = { day: o, tasks: l, claimed: [] };
    });
  }
  list() {
    this.ensureToday();
    const o = U.get().missions,
      a = new Set(o.claimed);
    return o.tasks
      .map((l) => {
        const n = zo.find((i) => i.id === l.id);
        return n
          ? { def: n, progress: l.progress, done: l.progress >= n.target, claimed: a.has(l.id) }
          : null;
      })
      .filter((l) => l !== null);
  }
  claimableCount() {
    return this.list().filter((e) => e.done && !e.claimed).length;
  }
  progressType(e, o) {
    (this.ensureToday(),
      U.update((a) => {
        const l = a.missions;
        for (const n of l.tasks) {
          if (l.claimed.includes(n.id)) continue;
          const i = zo.find((s) => s.id === n.id);
          !i || i.type !== e || (n.progress = Math.min(i.target, n.progress + o));
        }
      }));
  }
  recordHoleHit() {
    this.progressType("holes", 1);
  }
  recordLevelComplete() {
    this.progressType("levels", 1);
  }
  recordScore(e) {
    e > 0 && this.progressType("score", e);
  }
  recordShot() {
    this.progressType("shots", 1);
  }
  recordCombo() {
    this.progressType("combo", 1);
  }
  claim(e) {
    const o = this.list().find((l) => l.def.id === e);
    if (!o || !o.done || o.claimed) return !1;
    const { reward: a } = o.def;
    return (
      a.coins && K.addCoins(a.coins),
      a.tickets && K.addTickets(a.tickets),
      U.update((l) => {
        l.missions.claimed.push(e);
      }),
      !0
    );
  }
}
const ce = new an(),
  ln = [
    { stars: 5, coins: 250, label: "İlk Adımlar" },
    { stars: 12, coins: 400, tickets: 1, label: "Acemi Atıcı" },
    { stars: 20, toy: "strawberry", label: "Çilek Ödülü" },
    { stars: 30, coins: 700, gems: 1, label: "Panayır Çırağı" },
    { stars: 45, coins: 1e3, tickets: 2, label: "Usta Adayı" },
    { stars: 60, toy: "star_plush", label: "Yıldız Yastık" },
    { stars: 80, coins: 1500, gems: 2, label: "Keskin Nişancı" },
    { stars: 100, toy: "monkey_jester", label: "Soytarı Maymun" },
    { stars: 125, coins: 2200, tickets: 3, label: "Panayır Yıldızı" },
    { stars: 150, toy: "dragon", gems: 3, label: "Ejderha Avcısı" },
    { stars: 180, coins: 3e3, gems: 3, label: "Efsane Yolu" },
    { stars: 210, toy: "hamster_astro", label: "Astronot Hamster" },
    { stars: 240, coins: 4500, tickets: 5, label: "Panayır Kralı" },
    { stars: 270, toy: "snow_globe", gems: 5, label: "Kar Küresi" },
    { stars: 300, toy: "bear_galaxy", coins: 8e3, gems: 10, label: "MÜKEMMEL!" },
  ];
function nn(t) {
  return t <= 15
    ? ["COMMON"]
    : t <= 35
      ? ["COMMON", "RARE"]
      : t <= 60
        ? ["RARE", "EPIC"]
        : t <= 85
          ? ["EPIC", "LEGENDARY"]
          : ["LEGENDARY"];
}
class sn {
  awardFromPool(e) {
    const o = Ll(e.length ? e : Object.keys(he));
    return (this.grant(o), o);
  }
  awardForLevel(e) {
    const o = nn(e),
      a = U.get().toys,
      l = ge.filter((s) => o.includes(he[s].rarity)),
      n = l.filter((s) => !a[s]),
      i = n.length ? n : l.length ? l : ge;
    return this.awardFromPool(i);
  }
  grant(e) {
    const o = Date.now();
    (U.update((a) => {
      const l = a.toys[e];
      l
        ? ((l.count += 1), (l.lastWonAt = o))
        : (a.toys[e] = { id: e, count: 1, firstWonAt: o, lastWonAt: o });
    }),
      Re.emit("toyWon", { toyId: e }));
  }
}
const kt = new sn();
class rn {
  totalStars() {
    const e = U.get().levelStars ?? {};
    return Object.values(e).reduce((o, a) => o + a, 0);
  }
  list() {
    const e = this.totalStars(),
      o = new Set(U.get().claimedStarMilestones ?? []);
    return ln.map((a, l) => ({ milestone: a, index: l, reached: e >= a.stars, claimed: o.has(a.stars) }));
  }
  claimableCount() {
    return this.list().filter((e) => e.reached && !e.claimed).length;
  }
  next() {
    return this.list().find((e) => !e.reached) ?? null;
  }
  claim(e) {
    const o = this.list().find((l) => l.milestone.stars === e);
    if (!o || !o.reached || o.claimed) return !1;
    const a = o.milestone;
    return (
      a.coins && K.addCoins(a.coins),
      a.gems && K.addGems(a.gems),
      a.tickets && K.addTickets(a.tickets),
      a.toy && kt.grant(a.toy),
      U.update((l) => {
        (l.claimedStarMilestones || (l.claimedStarMilestones = []),
          l.claimedStarMilestones.includes(e) || l.claimedStarMilestones.push(e));
      }),
      !0
    );
  }
}
const Ve = new rn();
class St {
  constructor() {
    u(this, "particles", []);
  }
  spawnBurst(e, o, a, l) {
    const n = l.speed ?? [80, 260],
      i = l.size ?? [3, 7],
      s = l.life ?? [0.4, 0.9],
      r = l.spread ?? Math.PI * 2,
      f = l.angle ?? 0;
    for (let h = 0; h < a; h++) {
      const d = f + (Math.random() - 0.5) * r,
        y = n[0] + Math.random() * (n[1] - n[0]),
        g = s[0] + Math.random() * (s[1] - s[0]);
      this.particles.push({
        x: e,
        y: o,
        vx: Math.cos(d) * y,
        vy: Math.sin(d) * y,
        life: g,
        maxLife: g,
        size: i[0] + Math.random() * (i[1] - i[0]),
        color: l.colors[Math.floor(Math.random() * l.colors.length)],
        gravity: l.gravity ?? 420,
        shape: l.shape ?? "circle",
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        fade: !0,
      });
    }
  }
  spawnConfetti(e, o, a = 40) {
    this.spawnBurst(e, o, a, {
      colors: ["#ff4d94", "#1fc8db", "#ffd700", "#3fce7e", "#ff8c42", "#9b59b6"],
      speed: [120, 380],
      size: [5, 10],
      life: [0.8, 1.6],
      gravity: 300,
      shape: "square",
      spread: Math.PI * 2,
    });
  }
  update(e) {
    for (let o = this.particles.length - 1; o >= 0; o--) {
      const a = this.particles[o];
      if (((a.life -= e), a.life <= 0)) {
        this.particles.splice(o, 1);
        continue;
      }
      ((a.vy += a.gravity * e), (a.x += a.vx * e), (a.y += a.vy * e), (a.rotation += a.rotSpeed * e));
    }
  }
  render(e) {
    for (const o of this.particles) {
      const a = o.fade ? Math.max(0, o.life / o.maxLife) : 1;
      (e.save(),
        (e.globalAlpha = a),
        e.translate(o.x, o.y),
        e.rotate(o.rotation),
        (e.fillStyle = o.color),
        o.shape === "circle"
          ? (e.beginPath(), e.arc(0, 0, o.size, 0, Math.PI * 2), e.fill())
          : o.shape === "square"
            ? e.fillRect(-o.size / 2, -o.size / 2, o.size, o.size)
            : fn(e, o.size),
        e.restore());
    }
  }
  clear() {
    this.particles = [];
  }
  get count() {
    return this.particles.length;
  }
}
function fn(t, e) {
  t.beginPath();
  for (let o = 0; o < 5; o++) {
    const a = (o * Math.PI * 2) / 5 - Math.PI / 2,
      l = a + Math.PI / 5;
    (t.lineTo(Math.cos(a) * e, Math.sin(a) * e),
      t.lineTo(Math.cos(l) * (e * 0.45), Math.sin(l) * (e * 0.45)));
  }
  (t.closePath(), t.fill());
}
class hn {
  constructor() {
    u(this, "name", "mainMenu");
    u(this, "time", 0);
    u(this, "playPulse", 0);
    u(this, "particles", new St());
    u(this, "playRect", { x: c / 2 - 210, y: 778, w: 420, h: 112 });
    u(this, "levelsRect", { x: c / 2 - 210, y: 906, w: 420, h: 74 });
    u(this, "items", []);
    u(this, "settingsRect", { x: c - 84, y: 26, w: 64, h: 64 });
    const o = (c - 40 - 18) / 2,
      a = 82,
      l = 1004;
    [
      { label: "OYUNCAKLARIM", icon: "🧸", scene: "collection" },
      { label: "GÜNLÜK ÖDÜL", icon: "🎁", scene: "dailyReward" },
      { label: "GÖREVLER", icon: "📜", scene: "missions" },
      { label: "BAŞARIMLAR", icon: "🏆", scene: "achievements" },
      { label: "MAĞAZA", icon: "🛒", scene: "shop" },
      { label: "HEDİYE DÜKKANI", icon: "💝", scene: "giftShop" },
      { label: "YILDIZ YOLU", icon: "⭐", scene: "starPath" },
      { label: "İSTATİSTİK", icon: "📊", scene: "stats" },
      { label: "GÜNLÜK MEYDAN", icon: "📅", scene: "dailyChallenge" },
      { label: "PANAYIR TURU", icon: "🎠", scene: "tour" },
    ].forEach((i, s) => {
      const r = s % 2,
        f = Math.floor(s / 2);
      this.items.push({ ...i, rect: { x: 20 + r * (o + 18), y: l + f * (a + 12), w: o, h: a } });
    });
  }
  enter() {
    (vt(), z.startMusic());
  }
  exit() {}
  update(e) {
    ((this.time += e),
      (this.playPulse = (Math.sin(this.time * 2.4) + 1) / 2),
      this.particles.update(e),
      Math.random() < e * 1.4 &&
        this.particles.spawnBurst(Math.random() * c, b + 10, 1, {
          colors: [M.goldLight],
          speed: [22, 46],
          angle: -Math.PI / 2,
          spread: 0.3,
          gravity: -10,
          life: [3, 5],
          size: [1.5, 2.6],
        }));
  }
  render(e) {
    (je(e, this.time),
      Go(e, 0, 0, c, b),
      Ko(e, 0, 96, c, 11, this.time),
      this.particles.render(e),
      this.drawLogo(e),
      Le(e, 120, 58, K.coins, 20),
      Le(e, 290, 58, K.gems, 18, "gem"),
      Le(e, 460, 58, K.tickets, 18, "ticket"),
      this.drawCircle(e, this.settingsRect, "⚙"));
    const o = U.get(),
      a = Object.values(o.levelStars ?? {}).reduce((r, f) => r + f, 0);
    (Me(e, 24, 660, c - 48, 82, { radius: 18 }),
      [
        ["BÖLÜM", `${o.highestUnlockedLevel} / ${E.totalLevels}`],
        ["YILDIZ", `${a}`],
        ["OYUNCAK", `${ve.ownedCount()} / ${ve.totalCount}`],
      ].forEach(([r, f], h) => {
        const d = 24 + ((c - 48) / 3) * (h + 0.5);
        if (
          (P(e, r, d, 686, { size: 13, color: p(M.cream, 0.6), weight: 800 }),
          P(e, f, d, 716, { size: 24, color: M.goldLight, weight: 900 }),
          h > 0)
        ) {
          (e.save(), (e.strokeStyle = p(M.gold, 0.3)), (e.lineWidth = 1.5), e.beginPath());
          const y = 24 + ((c - 48) / 3) * h;
          (e.moveTo(y, 676), e.lineTo(y, 728), e.stroke(), e.restore());
        }
      }),
      e.save());
    const n = 1 + this.playPulse * 0.03,
      i = this.playRect.x + this.playRect.w / 2,
      s = this.playRect.y + this.playRect.h / 2;
    (e.translate(i, s),
      e.scale(n, n),
      e.translate(-i, -s),
      Y(e, this.playRect.x, this.playRect.y, this.playRect.w, this.playRect.h, "OYNA", "red", { icon: "🎯" }),
      e.restore(),
      Y(e, this.levelsRect.x, this.levelsRect.y, this.levelsRect.w, this.levelsRect.h, "SEVİYE SEÇ", "blue"),
      this.items.forEach((r) => {
        (Me(e, r.rect.x, r.rect.y, r.rect.w, r.rect.h, { radius: 16 }),
          P(e, r.icon, r.rect.x + 42, r.rect.y + r.rect.h / 2, { size: 34, shadow: !1 }),
          P(e, r.label, r.rect.x + 76, r.rect.y + r.rect.h / 2, {
            size: Math.min(17, (r.rect.w - 96) / (r.label.length * 0.52)),
            color: M.cream,
            weight: 800,
            align: "left",
          }));
        const f = this.claimableFor(r.scene);
        if (f > 0) {
          const h = r.rect.x + r.rect.w - 20,
            d = r.rect.y + 16;
          (e.save(),
            e.beginPath(),
            e.arc(h, d, 13, 0, Math.PI * 2),
            (e.fillStyle = M.red),
            e.fill(),
            (e.strokeStyle = "#ffffff"),
            (e.lineWidth = 2),
            e.stroke(),
            P(e, String(f), h, d + 1, { size: 13, color: "#ffffff", weight: 900, shadow: !1 }),
            e.restore());
        }
      }),
      za(e, c, b));
  }
  drawCircle(e, o, a) {
    const l = o.x + o.w / 2,
      n = o.y + o.h / 2;
    e.save();
    const i = e.createLinearGradient(0, o.y, 0, o.y + o.h);
    (i.addColorStop(0, M.panelTop),
      i.addColorStop(1, M.panelBottom),
      e.beginPath(),
      e.arc(l, n, o.w / 2, 0, Math.PI * 2),
      (e.fillStyle = i),
      e.fill(),
      (e.strokeStyle = M.gold),
      (e.lineWidth = 3),
      e.stroke(),
      P(e, a, l, n + 1, { size: 30, color: M.cream, shadow: !1 }),
      e.restore());
  }
  drawLogo(e) {
    const o = c / 2,
      a = 300;
    if (Oe.has("logo")) {
      const n = 0.5 + 0.5 * Math.sin(this.time * 2.2),
        i = e.createRadialGradient(o, a, 40, o, a, 520 * 0.62);
      (i.addColorStop(0, p("#ffca57", 0.3 + n * 0.14)),
        i.addColorStop(1, p("#ffca57", 0)),
        (e.fillStyle = i),
        e.fillRect(o - 520, a - 520 * 0.7, 520 * 2, 520 * 1.4),
        Oe.draw(e, "logo", o, a, 520, { fit: "width" }));
      const s = Oe.get("logo"),
        r = s ? (s.naturalHeight / s.naturalWidth) * 520 : 520 * 0.75;
      (e.save(), (e.globalCompositeOperation = "lighter"));
      for (let f = 0; f < 22; f++) {
        const h = f / 22,
          d = Math.PI * (1.06 - h * 1.12),
          y = o + Math.cos(d) * 520 * 0.44,
          g = a - r * 0.16 - Math.sin(d) * r * 0.31,
          A = 0.35 + 0.65 * Math.max(0, Math.sin(this.time * 5 + f * 0.9)),
          S = e.createRadialGradient(y, g, 0, y, g, 13);
        (S.addColorStop(0, p("#fff3c4", 0.85 * A)),
          S.addColorStop(1, p("#ffb347", 0)),
          (e.fillStyle = S),
          e.beginPath(),
          e.arc(y, g, 13, 0, Math.PI * 2),
          e.fill());
      }
      e.restore();
    } else
      (m(e, o - 260, a - 70, 520, 140, 20),
        (e.fillStyle = M.red),
        e.fill(),
        (e.strokeStyle = M.gold),
        (e.lineWidth = 5),
        e.stroke(),
        P(e, "KUKA KAZAN", o, a, { size: 56, color: M.goldLight, weight: 900 }));
    P(e, "PANAYIR TOP ATMA OYUNU", o, 560, { size: 19, color: p(M.cream, 0.85), weight: 800 });
  }
  claimableFor(e) {
    return e === "missions"
      ? ce.claimableCount()
      : e === "achievements"
        ? _e.claimableCount()
        : e === "starPath"
          ? Ve.claimableCount()
          : 0;
  }
  startDailyChallenge() {
    (vt(), (Z.mode = "daily"), (Z.customLevel = Xl()), V.goto("game"));
  }
  startTour() {
    (vt(),
      (Z.mode = "tour"),
      (Z.tourLevels = Ql()),
      (Z.tourIndex = 0),
      (Z.customLevel = Z.tourLevels[0]),
      V.goto("game"));
  }
  onPointerDown(e) {
    if (W(e.x, e.y, this.playRect.x, this.playRect.y, this.playRect.w, this.playRect.h)) {
      (z.play("button"), V.goto("game"));
      return;
    }
    if (W(e.x, e.y, this.levelsRect.x, this.levelsRect.y, this.levelsRect.w, this.levelsRect.h)) {
      (z.play("button"), V.goto("levelSelect"));
      return;
    }
    if (W(e.x, e.y, this.settingsRect.x, this.settingsRect.y, this.settingsRect.w, this.settingsRect.h)) {
      V.goto("settings");
      return;
    }
    for (const o of this.items)
      if (W(e.x, e.y, o.rect.x, o.rect.y, o.rect.w, o.rect.h)) {
        (z.play("button"),
          o.scene === "dailyChallenge"
            ? this.startDailyChallenge()
            : o.scene === "tour"
              ? this.startTour()
              : V.goto(o.scene));
        return;
      }
  }
  onPointerMove(e) {}
  onPointerUp(e) {}
}
function ze(t, e, o, a, l, n = {}) {
  const i = `toy_${e}`;
  if (Oe.has(i)) {
    Oe.draw(t, i, o, a + (n.bob ?? 0), l * 1.12, { fit: "contain", rotation: n.rotation });
    return;
  }
  const s = he[e];
  switch (
    (t.save(),
    t.translate(o, a + (n.bob ?? 0)),
    t.rotate(n.rotation ?? 0),
    t.scale(l / 100, l / 100),
    (t.shadowColor = "rgba(0,0,0,0.35)"),
    (t.shadowBlur = 10),
    (t.shadowOffsetY = 6),
    e)
  ) {
    case "bear_brown":
    case "bear_gold":
      dn(t, s.color, s.accent, e === "bear_gold");
      break;
    case "rabbit_white":
      un(t, s.color, s.accent);
      break;
    case "panda":
      pn(t, s.color, s.accent);
      break;
    case "dog":
      cn(t, s.color, s.accent);
      break;
    case "fox":
      yn(t, s.color, s.accent);
      break;
    case "penguin":
      vn(t, s.color, s.accent);
      break;
    case "dino":
      gn(t, s.color, s.accent);
      break;
    case "robot":
      Mn(t, s.color, s.accent);
      break;
    case "unicorn":
      Pn(t, s.color, s.accent);
      break;
    case "duck":
      An(t, s.color, s.accent);
      break;
    case "lion_cub":
      kn(t, s.color, s.accent);
      break;
    case "owl":
      Sn(t, s.color, s.accent);
      break;
    case "elephant":
      Rn(t, s.color, s.accent);
      break;
    case "koala":
      mn(t, s.color, s.accent);
      break;
    case "deer":
      zn(t, s.color, s.accent);
      break;
    case "lamb":
      jn(t, s.color, s.accent);
      break;
    case "cat":
      Un(t, s.color, s.accent);
      break;
    case "heart":
      bn(t, s.color, s.accent);
      break;
    case "butterfly":
      Tn(t, s.color, s.accent);
      break;
    case "swan":
      On(t, s.color, s.accent);
      break;
    case "lollipop":
      Gn(t, s.color, s.accent);
      break;
    case "cupcake":
      Kn(t, s.color, s.accent);
      break;
    case "magic_wand":
      wn(t, s.color, s.accent);
      break;
    case "fairy":
      Vn(t, s.color, s.accent);
      break;
    case "strawberry":
      Zn(t, s.color, s.accent);
      break;
    case "star_plush":
      En(t, s.color, s.accent);
      break;
    case "monkey_jester":
      In(t, s.color, s.accent);
      break;
    case "otter_pilot":
      qn(t, s.color, s.accent);
      break;
    case "giraffe_rocking":
      Wn(t, s.color, s.accent);
      break;
    case "cloud":
      Yn(t, s.color, s.accent);
      break;
    case "lion_knit":
      Cn(t, s.color, s.accent);
      break;
    case "dragon":
      Nn(t, s.color, s.accent);
      break;
    case "hamster_astro":
      Hn(t, s.color, s.accent);
      break;
    case "owl_steampunk":
      Bn(t, s.color, s.accent);
      break;
    case "cupcake_monster":
      Dn(t, s.color, s.accent);
      break;
    case "bear_heart":
      Jn(t, s.color, s.accent);
      break;
    case "carousel_horse":
      Xn(t, s.color, s.accent);
      break;
    case "bunny_flower":
      Qn(t, s.color, s.accent);
      break;
    case "snow_globe":
      Fn(t, s.color, s.accent);
      break;
    case "bear_galaxy":
      Ln(t, s.color, s.accent);
      break;
  }
  t.restore();
}
function k(t, e, o, a, l) {
  (t.beginPath(), t.arc(e, o, a, 0, Math.PI * 2), (t.fillStyle = l), t.fill());
}
function T(t, e, o) {
  const a = t.createRadialGradient(-o * 0.34, -o * 0.4, o * 0.05, -o * 0.1, 0, o * 1.15);
  return (a.addColorStop(0, O(e, 42)), a.addColorStop(0.5, e), a.addColorStop(1, j(e, 18)), a);
}
function X(t, e = "#2b1a3d", o = 12, a = 4, l = 3.4) {
  (k(t, -o, a, l, e),
    k(t, o, a, l, e),
    k(t, -o + 1, a - 1, l * 0.3, "#ffffff"),
    k(t, o + 1, a - 1, l * 0.3, "#ffffff"));
}
function dn(t, e, o, a) {
  if (
    (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 20, 30, 26, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 30)),
    t.fill(),
    k(t, 0, -22, 26, T(t, e, 26)),
    k(t, -20, -40, 11, e),
    k(t, 20, -40, 11, e),
    k(t, -20, -40, 5, o),
    k(t, 20, -40, 5, o),
    k(t, 0, -12, 11, O(e, 15)),
    X(t, "#3a2415", 9, -24, 2.6),
    k(t, 0, -14, 3, "#3a2415"),
    a)
  ) {
    (t.save(), t.translate(0, -58), (t.fillStyle = "#fff6cc"), t.beginPath());
    for (let l = 0; l < 5; l++) {
      const n = (l * Math.PI * 2) / 5 - Math.PI / 2,
        i = n + Math.PI / 5;
      (t.lineTo(Math.cos(n) * 10, Math.sin(n) * 10), t.lineTo(Math.cos(i) * 4.5, Math.sin(i) * 4.5));
    }
    (t.closePath(), t.fill(), t.restore());
  }
  t.restore();
}
function un(t, e, o) {
  (t.save(),
    t.translate(0, 10),
    t.beginPath(),
    t.ellipse(0, 18, 26, 24, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 26)),
    t.fill(),
    k(t, 0, -18, 22, T(t, e, 22)),
    [-11, 11].forEach((a) => {
      (t.save(),
        t.translate(a, -46),
        t.rotate(a * 0.02),
        t.beginPath(),
        t.ellipse(0, 0, 7, 22, 0, 0, Math.PI * 2),
        (t.fillStyle = e),
        t.fill(),
        t.beginPath(),
        t.ellipse(0, 2, 3.6, 16, 0, 0, Math.PI * 2),
        (t.fillStyle = o),
        t.fill(),
        t.restore());
    }),
    X(t, "#7a4a5a", 8, -20, 2.6),
    k(t, 0, -12, 2.6, o),
    t.restore());
}
function pn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 20, 28, 25, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 28)),
    t.fill(),
    k(t, 0, -20, 24, T(t, e, 24)),
    k(t, -19, -38, 10, o),
    k(t, 19, -38, 10, o),
    t.save(),
    t.beginPath(),
    t.ellipse(-10, -18, 8, 10, -0.2, 0, Math.PI * 2),
    t.ellipse(10, -18, 8, 10, 0.2, 0, Math.PI * 2),
    (t.fillStyle = o),
    t.fill(),
    t.restore(),
    X(t, "#ffffff", 10, -18, 3.2),
    k(t, -10, -18, 2, "#1a1a1a"),
    k(t, 10, -18, 2, "#1a1a1a"),
    k(t, 0, -10, 2.6, o),
    t.restore());
}
function cn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 20, 27, 24, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 27)),
    t.fill(),
    k(t, 0, -18, 23, T(t, e, 23)),
    [-19, 19].forEach((a) => {
      (t.save(),
        t.translate(a, -20),
        t.rotate(a > 0 ? 0.5 : -0.5),
        t.beginPath(),
        t.ellipse(0, 8, 8, 16, 0, 0, Math.PI * 2),
        (t.fillStyle = o),
        t.fill(),
        t.restore());
    }),
    t.beginPath(),
    t.ellipse(6, -6, 12, 9, 0, 0, Math.PI * 2),
    (t.fillStyle = o),
    (t.globalAlpha = 0.7),
    t.fill(),
    (t.globalAlpha = 1),
    X(t, "#3a2415", 9, -20, 2.8),
    t.beginPath(),
    t.ellipse(0, -8, 5, 3.6, 0, 0, Math.PI * 2),
    (t.fillStyle = "#2b1a3d"),
    t.fill(),
    t.restore());
}
function yn(t, e, o) {
  (t.save(),
    t.translate(0, 10),
    t.beginPath(),
    t.ellipse(0, 18, 25, 23, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 25)),
    t.fill(),
    t.beginPath(),
    t.ellipse(0, 26, 14, 12, 0, 0, Math.PI * 2),
    (t.fillStyle = o),
    t.fill(),
    k(t, 0, -18, 21, T(t, e, 21)),
    [-16, 16].forEach((a) => {
      (t.save(),
        t.translate(a, -38),
        t.beginPath(),
        t.moveTo(-7, 10),
        t.lineTo(0, -14),
        t.lineTo(7, 10),
        t.closePath(),
        (t.fillStyle = e),
        t.fill(),
        t.beginPath(),
        t.moveTo(-3.5, 8),
        t.lineTo(0, -6),
        t.lineTo(3.5, 8),
        t.closePath(),
        (t.fillStyle = o),
        t.fill(),
        t.restore());
    }),
    t.beginPath(),
    t.moveTo(-10, -6),
    t.lineTo(10, -6),
    t.lineTo(0, 8),
    t.closePath(),
    (t.fillStyle = o),
    t.fill(),
    X(t, "#3a2415", 9, -18, 2.6),
    k(t, 0, 2, 2.6, "#2b1a3d"),
    t.restore());
}
function vn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 16, 22, 30, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 22)),
    t.fill(),
    t.beginPath(),
    t.ellipse(0, 22, 13, 20, 0, 0, Math.PI * 2),
    (t.fillStyle = o),
    t.fill(),
    k(t, 0, -20, 18, T(t, e, 18)),
    t.beginPath(),
    t.ellipse(0, -16, 10, 12, 0, 0, Math.PI * 2),
    (t.fillStyle = o),
    t.fill(),
    X(t, "#1a1a1a", 6, -20, 2.6),
    t.beginPath(),
    t.moveTo(-5, -12),
    t.lineTo(5, -12),
    t.lineTo(0, -4),
    t.closePath(),
    (t.fillStyle = "#f0a028"),
    t.fill(),
    [-24, 24].forEach((a) => {
      (t.beginPath(),
        t.ellipse(a * 0.9, 30, 7, 4, a > 0 ? -0.3 : 0.3, 0, Math.PI * 2),
        (t.fillStyle = "#f0a028"),
        t.fill());
    }),
    t.restore());
}
function gn(t, e, o) {
  (t.save(),
    t.translate(0, 12),
    t.beginPath(),
    t.ellipse(4, 16, 26, 22, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 26)),
    t.fill(),
    t.beginPath(),
    t.ellipse(-22, 28, 12, 8, 0.5, 0, Math.PI * 2),
    (t.fillStyle = e),
    t.fill(),
    k(t, 14, -14, 20, T(t, e, 20)));
  for (let a = 0; a < 4; a++) {
    t.beginPath();
    const l = -6 + a * 9;
    (t.moveTo(l - 5, -30 + a * 1.5),
      t.lineTo(l, -42 + a * 1.5),
      t.lineTo(l + 5, -30 + a * 1.5),
      t.closePath(),
      (t.fillStyle = o),
      t.fill());
  }
  (t.beginPath(),
    t.ellipse(20, -8, 9, 7, 0, 0, Math.PI * 2),
    (t.fillStyle = o),
    t.fill(),
    X(t, "#173a20", 7, -16, 2.6),
    t.restore());
}
function Mn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.roundRect(-22, -6, 44, 40, 10),
    (t.fillStyle = T(t, e, 30)),
    t.fill(),
    t.beginPath(),
    t.roundRect(-19, -34, 38, 32, 12),
    (t.fillStyle = T(t, O(e, 10), 26)),
    t.fill(),
    t.beginPath(),
    t.roundRect(-13, -26, 26, 14, 6),
    (t.fillStyle = "#0d1b26"),
    t.fill(),
    k(t, -6, -19, 3.4, o),
    k(t, 6, -19, 3.4, o),
    t.beginPath(),
    t.moveTo(0, -34),
    t.lineTo(0, -44),
    (t.strokeStyle = o),
    (t.lineWidth = 3),
    t.stroke(),
    k(t, 0, -46, 4, o),
    [-27, 27].forEach((a) => {
      (t.beginPath(), t.roundRect(a - 4, -2, 8, 20, 4), (t.fillStyle = j(e, 10)), t.fill());
    }),
    k(t, 0, 12, 6, o),
    t.restore());
}
function Pn(t, e, o) {
  (t.save(),
    t.translate(0, 10),
    t.beginPath(),
    t.ellipse(0, 18, 25, 23, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 25)),
    t.fill(),
    k(t, 0, -18, 21, T(t, e, 21)));
  const a = ["#ff9ed8", "#9ed8ff", "#fff29e", "#ff9ed8", "#c9a8ff"];
  ([
    [11, -37, -0.5],
    [19, -28, -0.15],
    [21, -16, 0.1],
    [18, -3, 0.35],
    [12, 8, 0.6],
  ].forEach(([i, s, r], f) => {
    (t.save(),
      t.translate(i, s),
      t.rotate(r),
      t.beginPath(),
      t.ellipse(0, 0, 5, 13, 0, 0, Math.PI * 2),
      (t.fillStyle = a[f]),
      (t.globalAlpha = 0.9),
      t.fill(),
      t.restore());
  }),
    (t.globalAlpha = 1),
    [-15, 15].forEach((i) => {
      (t.beginPath(), t.ellipse(i, -36, 7, 9, 0, 0, Math.PI * 2), (t.fillStyle = e), t.fill());
    }),
    t.save(),
    t.translate(0, -40),
    t.rotate(0.05),
    t.beginPath(),
    t.moveTo(-5, 6),
    t.lineTo(0, -20),
    t.lineTo(5, 6),
    t.closePath());
  const n = t.createLinearGradient(0, -20, 0, 6);
  (n.addColorStop(0, "#fff6cc"),
    n.addColorStop(1, o),
    (t.fillStyle = n),
    t.fill(),
    t.restore(),
    X(t, "#6a3a8a", 8, -18, 2.8),
    k(t, 0, -10, 2.4, "#ff9ed8"),
    t.restore());
}
function An(t, e, o) {
  (t.save(),
    t.translate(0, 10),
    t.beginPath(),
    t.ellipse(0, 18, 26, 22, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 26)),
    t.fill(),
    t.beginPath(),
    t.ellipse(-14, 16, 12, 15, -0.3, 0, Math.PI * 2),
    (t.fillStyle = j(e, 8)),
    t.fill(),
    k(t, 6, -16, 20, T(t, e, 20)),
    t.beginPath(),
    t.ellipse(10, -36, 4, 9, 0.4, 0, Math.PI * 2),
    (t.fillStyle = j(e, 6)),
    t.fill(),
    X(t, "#3a2a10", 8, -18, 2.6),
    t.beginPath(),
    t.ellipse(20, -12, 11, 6, 0.1, 0, Math.PI * 2),
    (t.fillStyle = o),
    t.fill(),
    t.restore());
}
function kn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 20, 27, 24, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 27)),
    t.fill());
  for (let a = 0; a < 12; a++) {
    const l = (a / 12) * Math.PI * 2;
    (t.beginPath(),
      t.ellipse(Math.cos(l) * 26, -18 + Math.sin(l) * 26, 8, 8, 0, 0, Math.PI * 2),
      (t.fillStyle = o),
      t.fill());
  }
  (k(t, 0, -18, 22, T(t, e, 22)),
    [-13, 13].forEach((a) => k(t, a, -36, 7, e)),
    X(t, "#4a2e10", 8, -20, 2.8),
    t.beginPath(),
    t.ellipse(0, -10, 5, 4, 0, 0, Math.PI * 2),
    (t.fillStyle = "#4a2e10"),
    t.fill(),
    t.restore());
}
function Sn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 8, 27, 34, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 30)),
    t.fill(),
    t.beginPath(),
    t.ellipse(0, 12, 16, 22, 0, 0, Math.PI * 2),
    (t.fillStyle = o),
    (t.globalAlpha = 0.6),
    t.fill(),
    (t.globalAlpha = 1),
    [-18, 18].forEach((a) => {
      (t.beginPath(),
        t.moveTo(a - 8, -22),
        t.lineTo(a, -42),
        t.lineTo(a + 8, -22),
        t.closePath(),
        (t.fillStyle = j(e, 8)),
        t.fill());
    }),
    k(t, -12, -14, 12, o),
    k(t, 12, -14, 12, o),
    k(t, -12, -14, 6, "#2b1a10"),
    k(t, 12, -14, 6, "#2b1a10"),
    k(t, -10, -16, 2, "#ffffff"),
    k(t, 14, -16, 2, "#ffffff"),
    t.beginPath(),
    t.moveTo(-4, -6),
    t.lineTo(4, -6),
    t.lineTo(0, 4),
    t.closePath(),
    (t.fillStyle = "#f0a028"),
    t.fill(),
    t.restore());
}
function Rn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 20, 28, 24, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 28)),
    t.fill(),
    k(t, 0, -16, 23, T(t, e, 23)),
    [-24, 24].forEach((a) => {
      (t.beginPath(),
        t.ellipse(a, -14, 14, 18, 0, 0, Math.PI * 2),
        (t.fillStyle = j(e, 6)),
        t.fill(),
        t.beginPath(),
        t.ellipse(a * 0.85, -14, 8, 12, 0, 0, Math.PI * 2),
        (t.fillStyle = o),
        (t.globalAlpha = 0.5),
        t.fill(),
        (t.globalAlpha = 1));
    }),
    t.beginPath(),
    t.moveTo(-6, -10),
    t.quadraticCurveTo(-10, 14, -2, 24),
    t.quadraticCurveTo(6, 30, 6, 20),
    t.quadraticCurveTo(2, 14, 2, -8),
    t.closePath(),
    (t.fillStyle = T(t, e, 20)),
    t.fill(),
    X(t, "#3a4652", 11, -18, 2.6),
    t.restore());
}
function mn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 20, 27, 24, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 27)),
    t.fill(),
    k(t, 0, -18, 23, T(t, e, 23)),
    [-22, 22].forEach((a) => {
      (k(t, a, -30, 13, e), k(t, a, -30, 8, O(e, 18)));
    }),
    X(t, "#2a2a30", 10, -20, 2.8),
    t.beginPath(),
    t.ellipse(0, -10, 8, 11, 0, 0, Math.PI * 2),
    (t.fillStyle = o),
    t.fill(),
    t.restore());
}
function zn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 20, 25, 23, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 25)),
    t.fill(),
    k(t, 0, -18, 21, T(t, e, 21)),
    (t.strokeStyle = "#8a5a2a"),
    (t.lineWidth = 3),
    (t.lineCap = "round"),
    [-1, 1].forEach((a) => {
      (t.beginPath(),
        t.moveTo(a * 10, -34),
        t.lineTo(a * 16, -48),
        t.moveTo(a * 13, -41),
        t.lineTo(a * 22, -44),
        t.stroke());
    }),
    [-16, 16].forEach((a) => {
      (t.beginPath(),
        t.ellipse(a, -30, 6, 10, a > 0 ? 0.4 : -0.4, 0, Math.PI * 2),
        (t.fillStyle = e),
        t.fill());
    }),
    X(t, "#3a2415", 8, -20, 2.6),
    k(t, -8, 16, 2.5, o),
    k(t, 6, 22, 2.5, o),
    k(t, 12, 12, 2.5, o),
    t.beginPath(),
    t.ellipse(0, -10, 5, 4, 0, 0, Math.PI * 2),
    (t.fillStyle = "#3a2415"),
    t.fill(),
    t.restore());
}
function jn(t, e, o) {
  (t.save(), t.translate(0, 8));
  for (let a = 0; a < 9; a++) {
    const l = (a / 9) * Math.PI * 2;
    k(t, Math.cos(l) * 20, 16 + Math.sin(l) * 16, 11, a % 2 ? O(e, 6) : e);
  }
  (k(t, 0, 14, 18, T(t, e, 18)),
    k(t, 0, -16, 17, o),
    k(t, 0, -30, 9, e),
    [-12, 12].forEach((a) => {
      (t.beginPath(),
        t.ellipse(a * 1.3, -14, 6, 9, a > 0 ? 0.5 : -0.5, 0, Math.PI * 2),
        (t.fillStyle = o),
        t.fill());
    }),
    X(t, "#ffffff", 7, -16, 2.4),
    t.restore());
}
function Un(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 20, 26, 24, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 26)),
    t.fill(),
    t.beginPath(),
    t.moveTo(20, 26),
    t.quadraticCurveTo(38, 20, 34, 2),
    (t.lineWidth = 7),
    (t.strokeStyle = j(e, 6)),
    (t.lineCap = "round"),
    t.stroke(),
    k(t, 0, -18, 22, T(t, e, 22)),
    [-15, 15].forEach((a) => {
      (t.beginPath(),
        t.moveTo(a - 9, -30),
        t.lineTo(a, -50),
        t.lineTo(a + 9, -30),
        t.closePath(),
        (t.fillStyle = e),
        t.fill(),
        t.beginPath(),
        t.moveTo(a - 4, -32),
        t.lineTo(a, -44),
        t.lineTo(a + 4, -32),
        t.closePath(),
        (t.fillStyle = o),
        t.fill());
    }),
    X(t, "#5a3a48", 9, -20, 2.8),
    t.beginPath(),
    t.moveTo(-3, -12),
    t.lineTo(3, -12),
    t.lineTo(0, -8),
    t.closePath(),
    (t.fillStyle = "#e85a80"),
    t.fill(),
    (t.strokeStyle = p("#ffffff", 0.8)),
    (t.lineWidth = 1),
    [-1, 1].forEach((a) => {
      (t.beginPath(),
        t.moveTo(a * 6, -10),
        t.lineTo(a * 22, -13),
        t.moveTo(a * 6, -8),
        t.lineTo(a * 22, -6),
        t.stroke());
    }),
    t.restore());
}
function bn(t, e, o) {
  (t.save(), t.translate(0, 4));
  const a = t.createRadialGradient(-12, -14, 6, 0, 0, 44);
  (a.addColorStop(0, O(e, 25)),
    a.addColorStop(1, j(e, 8)),
    (t.fillStyle = a),
    t.beginPath(),
    t.moveTo(0, 30),
    t.bezierCurveTo(-34, 4, -30, -30, 0, -12),
    t.bezierCurveTo(30, -30, 34, 4, 0, 30),
    t.closePath(),
    t.fill(),
    t.beginPath(),
    t.ellipse(-12, -8, 8, 11, -0.5, 0, Math.PI * 2),
    (t.fillStyle = p(o, 0.7)),
    t.fill(),
    k(t, -8, 2, 2.6, "#7a1030"),
    k(t, 8, 2, 2.6, "#7a1030"),
    t.beginPath(),
    t.arc(0, 8, 8, 0.15 * Math.PI, 0.85 * Math.PI),
    (t.lineWidth = 2.4),
    (t.strokeStyle = "#7a1030"),
    (t.lineCap = "round"),
    t.stroke(),
    t.restore());
}
function Tn(t, e, o) {
  (t.save(), t.translate(0, 6));
  const a = (l) => {
    (t.save(),
      t.scale(l, 1),
      t.beginPath(),
      t.ellipse(20, -12, 18, 20, -0.3, 0, Math.PI * 2),
      (t.fillStyle = T(t, e, 20)),
      t.fill(),
      t.beginPath(),
      t.ellipse(16, 18, 14, 16, 0.2, 0, Math.PI * 2),
      (t.fillStyle = j(e, 8)),
      t.fill(),
      k(t, 22, -14, 5, o),
      k(t, 16, 18, 4, o),
      t.restore());
  };
  (a(-1),
    a(1),
    t.beginPath(),
    t.ellipse(0, 2, 4, 24, 0, 0, Math.PI * 2),
    (t.fillStyle = "#3a2a44"),
    t.fill(),
    k(t, 0, -22, 5, "#3a2a44"),
    (t.strokeStyle = "#3a2a44"),
    (t.lineWidth = 1.6),
    (t.lineCap = "round"),
    [-1, 1].forEach((l) => {
      (t.beginPath(),
        t.moveTo(l * 1, -25),
        t.quadraticCurveTo(l * 8, -36, l * 12, -34),
        t.stroke(),
        k(t, l * 12, -34, 2, o));
    }),
    t.restore());
}
function On(t, e, o) {
  (t.save(),
    t.translate(0, 10),
    t.beginPath(),
    t.ellipse(-2, 20, 28, 18, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 28)),
    t.fill(),
    t.beginPath(),
    t.moveTo(-26, 14),
    t.quadraticCurveTo(-40, 4, -30, 22),
    t.closePath(),
    (t.fillStyle = O(e, 10)),
    t.fill(),
    t.beginPath(),
    t.ellipse(-2, 18, 18, 12, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 14)),
    (t.globalAlpha = 0.6),
    t.fill(),
    (t.globalAlpha = 1),
    t.beginPath(),
    t.moveTo(14, 20),
    t.quadraticCurveTo(34, 8, 22, -18),
    t.quadraticCurveTo(18, -34, 30, -36),
    (t.lineWidth = 9),
    (t.strokeStyle = T(t, e, 20)),
    (t.lineCap = "round"),
    t.stroke(),
    k(t, 30, -36, 9, T(t, e, 9)),
    t.beginPath(),
    t.moveTo(38, -38),
    t.lineTo(48, -34),
    t.lineTo(38, -32),
    t.closePath(),
    (t.fillStyle = o),
    t.fill(),
    k(t, 32, -38, 2, "#2b1a20"),
    t.restore());
}
function Gn(t, e, o) {
  (t.save(),
    t.translate(0, 2),
    t.beginPath(),
    t.roundRect(-3, 6, 6, 42, 3),
    (t.fillStyle = "#f0f0f0"),
    t.fill());
  const a = 30;
  (k(t, 0, -14, a, "#ffffff"), t.save(), t.beginPath(), t.arc(0, -14, a, 0, Math.PI * 2), t.clip());
  const l = [e, o, "#fff29e", "#a8f0b8"];
  ((t.lineWidth = 7), (t.lineCap = "round"));
  for (let n = 0; n < 5; n++) {
    t.beginPath();
    for (let i = 0; i < Math.PI * 6; i += 0.2) {
      const s = i * 2 + n * 3.4,
        r = Math.cos(i) * s,
        f = -14 + Math.sin(i) * s;
      i === 0 ? t.moveTo(r, f) : t.lineTo(r, f);
    }
    ((t.strokeStyle = l[n % l.length]), t.stroke());
  }
  (t.restore(),
    t.beginPath(),
    t.ellipse(-10, -24, 6, 9, -0.5, 0, Math.PI * 2),
    (t.fillStyle = p("#ffffff", 0.5)),
    t.fill(),
    X(t, "#3a2a44", 8, -12, 2.4),
    t.restore());
}
function Kn(t, e, o) {
  (t.save(),
    t.translate(0, 6),
    t.beginPath(),
    t.moveTo(-22, 4),
    t.lineTo(22, 4),
    t.lineTo(16, 34),
    t.lineTo(-16, 34),
    t.closePath(),
    (t.fillStyle = T(t, o, 26)),
    t.fill(),
    (t.strokeStyle = j(o, 12)),
    (t.lineWidth = 2),
    [-11, 0, 11].forEach((l) => {
      (t.beginPath(), t.moveTo(l, 6), t.lineTo(l * 0.75, 32), t.stroke());
    }),
    t.beginPath(),
    t.moveTo(-24, 6),
    t.bezierCurveTo(-26, -18, 26, -18, 24, 6),
    t.closePath(),
    (t.fillStyle = T(t, e, 24)),
    t.fill(),
    [
      [-10, -6, 10],
      [8, -8, 9],
      [-1, -18, 9],
    ].forEach(([l, n, i]) => {
      k(t, l, n, i, O(e, 12));
    }));
  const a = ["#6ed0e8", "#fff29e", "#a8f0b8", "#ff8ac4"];
  for (let l = 0; l < 7; l++) k(t, -16 + l * 5.2, -4 + (l % 3) * 5, 1.8, a[l % a.length]);
  (k(t, 0, -24, 6, "#e83a5a"),
    t.beginPath(),
    t.moveTo(0, -28),
    t.quadraticCurveTo(6, -38, 10, -34),
    (t.strokeStyle = "#4a7a2a"),
    (t.lineWidth = 2),
    t.stroke(),
    X(t, "#7a4a2a", 8, 16, 2.4),
    t.restore());
}
function wn(t, e, o) {
  (t.save(), t.translate(0, 4), t.rotate(0.2), t.beginPath(), t.roundRect(-3, -4, 6, 46, 3));
  const a = t.createLinearGradient(0, -4, 0, 42);
  (a.addColorStop(0, O(o, 20)),
    a.addColorStop(1, j(o, 10)),
    (t.fillStyle = a),
    t.fill(),
    t.save(),
    t.translate(0, -18));
  const l = t.createRadialGradient(-4, -4, 2, 0, 0, 24);
  (l.addColorStop(0, "#fff6cc"), l.addColorStop(1, j(e, 6)), (t.fillStyle = l), t.beginPath());
  for (let n = 0; n < 5; n++) {
    const i = (n * Math.PI * 2) / 5 - Math.PI / 2,
      s = i + Math.PI / 5;
    (t.lineTo(Math.cos(i) * 22, Math.sin(i) * 22), t.lineTo(Math.cos(s) * 9, Math.sin(s) * 9));
  }
  (t.closePath(),
    t.fill(),
    t.restore(),
    [
      [-20, -30, 3],
      [22, -22, 2.5],
      [16, -40, 2],
    ].forEach(([n, i, s]) => {
      t.beginPath();
      for (let r = 0; r < 4; r++) {
        const f = (r * Math.PI) / 2;
        (t.moveTo(n, i), t.lineTo(n + Math.cos(f) * s * 2, i + Math.sin(f) * s * 2));
      }
      ((t.strokeStyle = "#fff29e"), (t.lineWidth = 1.4), t.stroke());
    }),
    t.beginPath(),
    t.moveTo(2, 2),
    t.quadraticCurveTo(16, 8, 10, 22),
    (t.strokeStyle = o),
    (t.lineWidth = 3),
    (t.lineCap = "round"),
    t.stroke(),
    t.restore());
}
function Vn(t, e, o) {
  (t.save(), t.translate(0, 6));
  const a = (l) => {
    (t.save(),
      t.scale(l, 1),
      t.beginPath(),
      t.ellipse(20, -14, 14, 20, -0.4, 0, Math.PI * 2),
      (t.fillStyle = p(o, 0.55)),
      t.fill(),
      t.beginPath(),
      t.ellipse(18, 10, 10, 14, 0.3, 0, Math.PI * 2),
      (t.fillStyle = p("#b8e6ff", 0.5)),
      t.fill(),
      t.restore());
  };
  (a(-1),
    a(1),
    t.beginPath(),
    t.moveTo(-16, 34),
    t.quadraticCurveTo(0, 0, 16, 34),
    t.closePath(),
    (t.fillStyle = T(t, e, 22)),
    t.fill(),
    t.beginPath(),
    t.ellipse(0, 2, 9, 12, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 8)),
    t.fill(),
    k(t, 0, -20, 14, "#ffe0c8"),
    t.beginPath(),
    t.arc(0, -22, 15, Math.PI, Math.PI * 2),
    (t.fillStyle = "#f5d060"),
    t.fill(),
    [-14, 14].forEach((l) => {
      (t.beginPath(), t.ellipse(l, -14, 5, 12, 0, 0, Math.PI * 2), (t.fillStyle = "#f5d060"), t.fill());
    }),
    t.beginPath(),
    t.moveTo(-8, -30),
    t.lineTo(-8, -36),
    t.lineTo(-3, -32),
    t.lineTo(0, -38),
    t.lineTo(3, -32),
    t.lineTo(8, -36),
    t.lineTo(8, -30),
    t.closePath(),
    (t.fillStyle = o),
    t.fill(),
    X(t, "#4a7ab0", 5, -20, 2.2),
    k(t, 0, -15, 1.8, "#e88aa0"),
    t.restore());
}
function Ge(t, e, o = 7, a = "#7a4a3a", l = 2) {
  (t.beginPath(),
    t.arc(0, e, o, 0.15 * Math.PI, 0.85 * Math.PI),
    (t.strokeStyle = a),
    (t.lineWidth = l),
    (t.lineCap = "round"),
    t.stroke());
}
function Ce(t, e, o = 17, a = 4.5, l = "#ffa8bd") {
  ((t.globalAlpha = 0.75), k(t, -o, e, a, l), k(t, o, e, a, l), (t.globalAlpha = 1));
}
function wo(t, e, o = 0.45) {
  t.beginPath();
  for (let a = 0; a < 5; a++) {
    const l = (a * Math.PI * 2) / 5 - Math.PI / 2,
      n = l + Math.PI / 5;
    (t.lineTo(Math.cos(l) * e, Math.sin(l) * e), t.lineTo(Math.cos(n) * e * o, Math.sin(n) * e * o));
  }
  t.closePath();
}
function Zn(t, e, o) {
  (t.save(),
    t.translate(0, 6),
    t.beginPath(),
    t.moveTo(0, 40),
    t.bezierCurveTo(-34, 16, -34, -22, 0, -22),
    t.bezierCurveTo(34, -22, 34, 16, 0, 40),
    t.closePath(),
    (t.fillStyle = T(t, e, 34)),
    t.fill(),
    (t.fillStyle = "#ffe9a8"),
    [
      [-16, -6],
      [0, -12],
      [16, -6],
      [-9, 8],
      [9, 8],
      [0, 22],
      [-19, 6],
      [19, 6],
    ].forEach(([a, l]) => {
      (t.save(),
        t.translate(a, l),
        t.rotate(a * 0.03),
        t.beginPath(),
        t.ellipse(0, 0, 1.8, 3, 0, 0, Math.PI * 2),
        t.fill(),
        t.restore());
    }),
    (t.fillStyle = o),
    [-1, 0, 1].forEach((a) => {
      (t.save(),
        t.translate(a * 14, -24),
        t.rotate(a * 0.5),
        t.beginPath(),
        t.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2),
        t.fill(),
        t.restore());
    }),
    k(t, 0, -30, 3.4, j(o, 20)),
    X(t, "#5c2b30", 11, 2, 3),
    Ce(t, 10, 19, 4.4),
    Ge(t, 6, 5, "#5c2b30", 2),
    t.restore());
}
function En(t, e, o) {
  (t.save(), t.translate(0, 4), t.save(), t.rotate(0), wo(t, 44, 0.5));
  const a = t.createRadialGradient(-10, -12, 4, 0, 0, 48);
  (a.addColorStop(0, O(e, 30)),
    a.addColorStop(1, j(e, 10)),
    (t.fillStyle = a),
    t.fill(),
    (t.strokeStyle = p(o, 0.8)),
    (t.lineWidth = 2),
    t.stroke(),
    t.restore(),
    (t.strokeStyle = "#7a5a20"),
    (t.lineWidth = 2.4),
    (t.lineCap = "round"),
    [-11, 11].forEach((l) => {
      (t.beginPath(), t.arc(l, 2, 4.5, Math.PI * 1.15, Math.PI * 1.85), t.stroke());
    }),
    Ce(t, 8, 19, 4.2, "#ffb2b2"),
    Ge(t, 4, 5, "#7a5a20", 2),
    t.restore());
}
function In(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.save(),
    t.beginPath(),
    t.ellipse(0, 22, 25, 23, 0, 0, Math.PI * 2),
    t.clip(),
    (t.fillStyle = o),
    t.fillRect(-30, -6, 30, 60),
    (t.fillStyle = "#f1c40f"),
    t.fillRect(0, -6, 30, 60),
    t.restore(),
    k(t, -24, 18, 8, e),
    k(t, 24, 18, 8, e),
    k(t, 0, -16, 22, T(t, e, 22)),
    k(t, -22, -16, 8, e),
    k(t, 22, -16, 8, e),
    t.beginPath(),
    t.ellipse(0, -10, 15, 13, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 34)),
    t.fill(),
    X(t, "#4a2c18", 8, -16, 2.6),
    k(t, 0, -8, 2.4, "#6a3d22"),
    Ge(t, -8, 5, "#6a3d22", 1.8),
    Ce(t, -8, 13, 3.4),
    [
      [-26, -44, 0],
      [0, -52, 1],
      [26, -44, 2],
    ].forEach(([l, n, i]) => {
      (t.beginPath(),
        t.moveTo(-14 + i * 14, -30),
        t.quadraticCurveTo(l * 0.7, n, l, n),
        t.quadraticCurveTo(l * 0.4, n + 10, -4 + i * 14, -28),
        t.closePath(),
        (t.fillStyle = i % 2 === 0 ? o : "#f1c40f"),
        t.fill(),
        k(t, l, n, 4, "#ffe066"));
    }),
    t.beginPath(),
    t.ellipse(0, -30, 23, 7, 0, 0, Math.PI * 2),
    (t.fillStyle = j(o, 15)),
    t.fill(),
    t.restore());
}
function qn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 20, 24, 26, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 24)),
    t.fill(),
    t.beginPath(),
    t.ellipse(0, 24, 15, 18, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 46)),
    t.fill(),
    t.save(),
    t.rotate(0.4),
    t.beginPath(),
    t.ellipse(26, 30, 14, 6, 0, 0, Math.PI * 2),
    (t.fillStyle = j(e, 10)),
    t.fill(),
    t.restore(),
    k(t, -13, 30, 6.5, O(e, 12)),
    k(t, 13, 30, 6.5, O(e, 12)),
    t.beginPath(),
    t.arc(0, 32, 9, Math.PI, 0),
    (t.fillStyle = "#ffd0c4"),
    t.fill(),
    (t.strokeStyle = "#e8a898"),
    (t.lineWidth = 1),
    [-6, -2, 2, 6].forEach((a) => {
      (t.beginPath(), t.moveTo(0, 32), t.lineTo(a, 24), t.stroke());
    }),
    k(t, 0, -16, 22, T(t, e, 22)),
    k(t, -19, -30, 6, j(e, 12)),
    k(t, 19, -30, 6, j(e, 12)),
    t.beginPath(),
    t.ellipse(0, -8, 14, 11, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 42)),
    t.fill(),
    k(t, 0, -12, 3.4, "#4a2c18"),
    Ge(t, -8, 5, "#7a5240", 1.8),
    t.save(),
    (t.strokeStyle = "#6b4a2a"),
    (t.lineWidth = 4),
    t.beginPath(),
    t.moveTo(-22, -24),
    t.lineTo(22, -24),
    t.stroke(),
    [-11, 11].forEach((a) => {
      (k(t, a, -24, 9.5, p(o, 0.85)),
        t.beginPath(),
        t.arc(a, -24, 9.5, 0, Math.PI * 2),
        (t.strokeStyle = "#8a6a3a"),
        (t.lineWidth = 3),
        t.stroke(),
        k(t, a - 3, -27, 2.6, p("#ffffff", 0.8)));
    }),
    t.restore(),
    t.restore());
}
function Wn(t, e, o) {
  (t.save(),
    t.translate(0, 6),
    t.beginPath(),
    t.moveTo(-38, 36),
    t.quadraticCurveTo(0, 50, 38, 36),
    t.quadraticCurveTo(0, 44, -38, 36),
    t.closePath(),
    (t.fillStyle = "#a9713e"),
    t.fill(),
    (t.strokeStyle = j(e, 18)),
    (t.lineWidth = 6),
    (t.lineCap = "round"),
    [-14, 14].forEach((a) => {
      (t.beginPath(), t.moveTo(a, 12), t.lineTo(a * 1.25, 34), t.stroke());
    }),
    t.beginPath(),
    t.ellipse(0, 8, 25, 17, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 25)),
    t.fill(),
    t.save(),
    t.beginPath(),
    t.ellipse(0, 8, 25, 17, 0, 0, Math.PI * 2),
    t.clip(),
    (t.fillStyle = o),
    t.fillRect(-12, -12, 24, 20),
    (t.fillStyle = "#3a8fc7"),
    t.fillRect(-12, 4, 24, 6),
    t.restore(),
    t.save(),
    t.rotate(-0.18),
    t.beginPath(),
    t.roundRect(-6, -44, 14, 48, 7),
    (t.fillStyle = T(t, e, 20)),
    t.fill(),
    t.restore(),
    t.save(),
    t.translate(-8, -46),
    t.rotate(-0.1),
    t.beginPath(),
    t.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 14)),
    t.fill(),
    t.beginPath(),
    t.ellipse(-9, 3, 7, 6, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 26)),
    t.fill(),
    k(t, -11, 3, 1.6, "#4a2c18"),
    k(t, -8, 1, 1.6, "#4a2c18"),
    k(t, 3, -4, 2.4, "#3a2415"),
    [-2, 6].forEach((a) => {
      ((t.strokeStyle = j(e, 26)),
        (t.lineWidth = 3),
        t.beginPath(),
        t.moveTo(a, -9),
        t.lineTo(a, -15),
        t.stroke(),
        k(t, a, -16, 2.6, "#8a5a30"));
    }),
    t.beginPath(),
    t.ellipse(11, -6, 5, 3, -0.4, 0, Math.PI * 2),
    (t.fillStyle = j(e, 12)),
    t.fill(),
    t.restore(),
    (t.fillStyle = p("#a9713e", 0.75)),
    [
      [-16, 4],
      [14, 2],
      [-6, 14],
      [8, 16],
      [-2, -22],
      [-12, -32],
    ].forEach(([a, l]) => {
      (t.beginPath(), t.ellipse(a, l, 4, 3.4, 0.3, 0, Math.PI * 2), t.fill());
    }),
    t.restore());
}
function Yn(t, e, o) {
  (t.save(),
    t.translate(0, 6),
    (t.shadowColor = "rgba(180,150,200,0.35)"),
    (t.shadowBlur = 14),
    [
      [-24, 6, 18],
      [24, 6, 18],
      [-10, -8, 21],
      [12, -10, 20],
      [0, 12, 20],
    ].forEach(([l, n, i]) => k(t, l, n, i, T(t, e, i))),
    (t.shadowColor = "transparent"),
    t.save(),
    t.translate(20, -26),
    t.rotate(-0.2),
    [-1, 1].forEach((l) => {
      (t.beginPath(),
        t.moveTo(0, 0),
        t.quadraticCurveTo(l * 14, -9, l * 15, 1),
        t.quadraticCurveTo(l * 13, 9, 0, 0),
        (t.fillStyle = o),
        t.fill());
    }),
    k(t, 0, 0, 3.6, j(o, 12)),
    t.restore(),
    X(t, "#6b5a72", 12, 2, 3),
    Ce(t, 10, 20, 4.4, "#ffc4d8"),
    Ge(t, 6, 5, "#6b5a72", 1.8),
    t.restore());
}
function Cn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 26, 22, 20, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 22)),
    t.fill(),
    k(t, -16, 34, 7, O(e, 14)),
    k(t, 16, 34, 7, O(e, 14)));
  const a = 34;
  for (let l = 0; l < 16; l++) {
    const n = (l * Math.PI * 2) / 16;
    (t.save(),
      t.translate(Math.cos(n) * a * 0.86, -14 + Math.sin(n) * a * 0.86),
      t.rotate(n),
      t.beginPath(),
      t.ellipse(0, 0, 9, 6.5, 0, 0, Math.PI * 2),
      (t.fillStyle = l % 2 === 0 ? o : j(o, 12)),
      t.fill(),
      t.restore());
  }
  (k(t, 0, -14, 26, T(t, o, 26)), (t.strokeStyle = p(j(o, 28), 0.5)), (t.lineWidth = 1.2));
  for (let l = -3; l <= 3; l++)
    (t.beginPath(),
      t.arc(0, -14, 26, 0, Math.PI * 2),
      t.save(),
      t.clip(),
      t.beginPath(),
      t.moveTo(-26, -14 + l * 7),
      t.lineTo(26, -14 + l * 7),
      t.stroke(),
      t.restore());
  (k(t, 0, -12, 20, T(t, O(e, 22), 20)),
    k(t, -20, -30, 7, o),
    k(t, 20, -30, 7, o),
    t.beginPath(),
    t.ellipse(0, -6, 13, 10, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 40)),
    t.fill(),
    X(t, "#4a2c18", 8, -14, 2.8),
    t.beginPath(),
    t.moveTo(-4, -10),
    t.lineTo(4, -10),
    t.lineTo(0, -6),
    t.closePath(),
    (t.fillStyle = "#8a5a3a"),
    t.fill(),
    Ge(t, -6, 5, "#8a5a3a", 1.8),
    t.restore());
}
function Nn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    [-1, 1].forEach((a) => {
      (t.save(),
        t.translate(a * 24, -6),
        t.rotate(a * 0.3),
        t.beginPath(),
        t.moveTo(0, 6),
        t.quadraticCurveTo(a * 24, -26, a * 30, 2),
        t.quadraticCurveTo(a * 20, 0, a * 16, 14),
        t.quadraticCurveTo(a * 8, 4, 0, 6),
        t.closePath());
      const l = t.createLinearGradient(0, -20, 0, 14);
      (l.addColorStop(0, O(o, 30)),
        l.addColorStop(1, o),
        (t.fillStyle = l),
        t.fill(),
        (t.strokeStyle = p("#ffffff", 0.6)),
        (t.lineWidth = 1.4),
        t.stroke(),
        t.restore());
    }),
    t.beginPath(),
    t.ellipse(0, 20, 23, 24, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 23)),
    t.fill(),
    t.beginPath(),
    t.ellipse(0, 24, 14, 17, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 34)),
    t.fill(),
    (t.strokeStyle = p(j(e, 18), 0.45)),
    (t.lineWidth = 1.2),
    [14, 22, 30].forEach((a) => {
      (t.beginPath(), t.arc(0, a, 11, 0.15 * Math.PI, 0.85 * Math.PI), t.stroke());
    }),
    t.beginPath(),
    t.moveTo(20, 30),
    t.quadraticCurveTo(38, 30, 34, 14),
    t.quadraticCurveTo(30, 26, 18, 24),
    t.closePath(),
    (t.fillStyle = j(e, 8)),
    t.fill(),
    k(t, 0, -16, 22, T(t, e, 22)),
    t.beginPath(),
    t.ellipse(0, -8, 13, 10, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 26)),
    t.fill(),
    [-10, 10].forEach((a) => {
      (t.beginPath(),
        t.moveTo(a - 4, -32),
        t.lineTo(a + 3, -44),
        t.lineTo(a + 5, -30),
        t.closePath(),
        (t.fillStyle = o),
        t.fill());
    }),
    X(t, "#2f4f5c", 9, -18, 3.2),
    k(t, -3, -10, 1.6, "#a85a4a"),
    k(t, 3, -10, 1.6, "#a85a4a"),
    Ge(t, -8, 5, "#a8443a", 1.8),
    Ce(t, -8, 15, 3.6),
    t.restore());
}
function Hn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 22, 25, 23, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, o, 25)),
    t.fill(),
    (t.strokeStyle = "#b8c4cf"),
    (t.lineWidth = 1.6),
    t.stroke(),
    [-22, 22].forEach((a) => k(t, a, 20, 8, O(o, 8))),
    k(t, -12, 40, 7, O(o, 8)),
    k(t, 12, 40, 7, O(o, 8)),
    t.beginPath(),
    t.roundRect(-11, 12, 22, 15, 4),
    (t.fillStyle = "#dfe6ee"),
    t.fill(),
    (t.strokeStyle = "#aab6c2"),
    (t.lineWidth = 1.2),
    t.stroke(),
    k(t, -5, 17, 2.4, "#e74c3c"),
    k(t, 2, 17, 2.4, "#2ecc71"),
    (t.fillStyle = "#7f8c9a"),
    t.fillRect(-6, 22, 12, 2),
    k(t, 0, -16, 27, p("#cfe8f5", 0.55)),
    k(t, 0, -14, 20, T(t, e, 20)),
    k(t, -17, -28, 7, e),
    k(t, 17, -28, 7, e),
    k(t, -17, -28, 3.4, "#f0b8b8"),
    k(t, 17, -28, 3.4, "#f0b8b8"),
    t.beginPath(),
    t.ellipse(0, -8, 12, 9, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 32)),
    t.fill(),
    X(t, "#3a2415", 8, -16, 2.8),
    k(t, 0, -10, 2.4, "#7a4a3a"),
    Ge(t, -7, 4.5, "#7a4a3a", 1.6),
    Ce(t, -8, 14, 3.4),
    t.beginPath(),
    t.arc(0, -16, 27, 0, Math.PI * 2),
    (t.strokeStyle = p("#ffffff", 0.85)),
    (t.lineWidth = 2.4),
    t.stroke(),
    t.beginPath(),
    t.arc(-10, -26, 9, Math.PI * 0.9, Math.PI * 1.5),
    (t.strokeStyle = p("#ffffff", 0.75)),
    (t.lineWidth = 3),
    t.stroke(),
    [-1, 1].forEach((a) => {
      (t.beginPath(),
        t.moveTo(a * 18, -36),
        t.lineTo(a * 26, -48),
        (t.strokeStyle = "#aab6c2"),
        (t.lineWidth = 2.2),
        t.stroke(),
        k(t, a * 26, -50, 3.4, "#ff6b8a"));
    }),
    t.restore());
}
function Bn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 10, 28, 32, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 28)),
    t.fill(),
    (t.strokeStyle = p(j(e, 30), 0.8)),
    (t.lineWidth = 1.4),
    t.beginPath(),
    t.moveTo(0, -14),
    t.lineTo(0, 40),
    t.stroke(),
    t.save(),
    t.translate(0, 20),
    (t.fillStyle = j(o, 26)));
  const a = 10;
  t.beginPath();
  for (let l = 0; l < a; l++) {
    const n = (l * Math.PI * 2) / a,
      i = n + Math.PI / a;
    (t.lineTo(Math.cos(n) * 13, Math.sin(n) * 13), t.lineTo(Math.cos(i) * 9, Math.sin(i) * 9));
  }
  (t.closePath(),
    t.fill(),
    k(t, 0, 0, 4.5, j(e, 20)),
    t.restore(),
    [-1, 1].forEach((l) => {
      (t.save(),
        t.translate(l * 25, 8),
        t.rotate(l * 0.25),
        [0, 1, 2].forEach((n) => {
          (t.beginPath(),
            t.ellipse(0, n * 8 - 6, 10 - n, 9, 0, 0, Math.PI * 2),
            (t.fillStyle = n % 2 === 0 ? O(e, 16) : j(e, 8)),
            t.fill(),
            (t.strokeStyle = p(j(e, 34), 0.7)),
            (t.lineWidth = 1),
            t.stroke());
        }),
        t.restore());
    }),
    k(t, 0, -22, 25, T(t, e, 25)),
    [-1, 1].forEach((l) => {
      (t.beginPath(),
        t.moveTo(l * 12, -42),
        t.lineTo(l * 22, -50),
        t.lineTo(l * 20, -38),
        t.closePath(),
        (t.fillStyle = j(e, 14)),
        t.fill());
    }),
    [-11, 11].forEach((l) => {
      (k(t, l, -22, 11, o),
        t.beginPath(),
        t.arc(l, -22, 11, 0, Math.PI * 2),
        (t.strokeStyle = j(o, 40)),
        (t.lineWidth = 2.6),
        t.stroke(),
        k(t, l, -22, 6, "#4a3018"),
        k(t, l, -22, 2.6, "#1a1008"),
        k(t, l - 3, -25, 2, p("#ffffff", 0.85)));
      for (let n = 0; n < 4; n++) {
        const i = (n * Math.PI) / 2 + 0.4;
        k(t, l + Math.cos(i) * 11, -22 + Math.sin(i) * 11, 1.4, j(o, 55));
      }
    }),
    t.beginPath(),
    t.moveTo(-5, -10),
    t.lineTo(5, -10),
    t.lineTo(0, -1),
    t.closePath(),
    (t.fillStyle = "#d9a441"),
    t.fill(),
    t.save(),
    t.translate(26, -30),
    t.rotate(0.5),
    (t.strokeStyle = j(o, 30)),
    (t.lineWidth = 3.4),
    t.beginPath(),
    t.moveTo(0, 0),
    t.lineTo(10, 0),
    t.stroke(),
    t.beginPath(),
    t.arc(14, 0, 5, 0, Math.PI * 2),
    t.stroke(),
    t.restore(),
    t.restore());
}
function Dn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.moveTo(-26, 6),
    t.lineTo(26, 6),
    t.lineTo(19, 40),
    t.lineTo(-19, 40),
    t.closePath());
  const a = t.createLinearGradient(0, 6, 0, 40);
  (a.addColorStop(0, O(o, 26)),
    a.addColorStop(1, j(o, 10)),
    (t.fillStyle = a),
    t.fill(),
    (t.strokeStyle = p(j(o, 30), 0.5)),
    (t.lineWidth = 1.4));
  for (let i = -3; i <= 3; i++) (t.beginPath(), t.moveTo(i * 7, 6), t.lineTo(i * 5.2, 40), t.stroke());
  ([
    [0, 2, 24],
    [-11, -12, 16],
    [11, -12, 16],
    [0, -22, 15],
    [0, -34, 11],
  ].forEach(([i, s, r]) => k(t, i, s, r, T(t, e, r))),
    [-1, 1].forEach((i) => {
      (t.beginPath(),
        t.moveTo(i * 20, -22),
        t.quadraticCurveTo(i * 32, -34, i * 26, -46),
        t.quadraticCurveTo(i * 22, -34, i * 13, -24),
        t.closePath(),
        (t.fillStyle = "#a9713e"),
        t.fill());
    }));
  const n = ["#ff6b8a", "#ffd54a", "#6ed0e8", "#7ad86b", "#c98bff"];
  ([
    [-14, -6],
    [8, -18],
    [-6, -26],
    [14, -4],
    [0, -12],
    [-16, -18],
    [16, -22],
  ].forEach(([i, s], r) => {
    (t.save(),
      t.translate(i, s),
      t.rotate(r * 1.1),
      (t.fillStyle = n[r % n.length]),
      t.beginPath(),
      t.roundRect(-3.4, -1.4, 7, 2.8, 1.4),
      t.fill(),
      t.restore());
  }),
    X(t, "#4a3018", 11, 0, 3.4),
    Ce(t, 8, 18, 4.4),
    Ge(t, 4, 6, "#8a5a3a", 2),
    t.restore());
}
function Jn(t, e, o) {
  (t.save(),
    t.translate(0, 8),
    t.beginPath(),
    t.ellipse(0, 22, 29, 25, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 29)),
    t.fill(),
    k(t, -17, 40, 8, O(e, 10)),
    k(t, 17, 40, 8, O(e, 10)),
    k(t, 0, -18, 24, T(t, e, 24)),
    k(t, -19, -36, 10, e),
    k(t, 19, -36, 10, e),
    k(t, -19, -36, 5, O(e, 26)),
    k(t, 19, -36, 5, O(e, 26)),
    t.beginPath(),
    t.ellipse(0, -10, 13, 10, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 34)),
    t.fill(),
    X(t, "#3a2415", 9, -20, 2.8),
    k(t, 0, -13, 3, "#3a2415"),
    Ge(t, -10, 5, "#5c3a21", 1.8),
    t.save(),
    t.translate(0, 22),
    t.beginPath(),
    t.moveTo(0, 12),
    t.bezierCurveTo(-18, -2, -11, -16, 0, -7),
    t.bezierCurveTo(11, -16, 18, -2, 0, 12),
    t.closePath());
  const a = t.createRadialGradient(-4, -4, 2, 0, 0, 18);
  (a.addColorStop(0, "#fff3b0"),
    a.addColorStop(1, o),
    (t.fillStyle = a),
    t.fill(),
    (t.strokeStyle = j(o, 25)),
    (t.lineWidth = 1.4),
    t.stroke(),
    (t.fillStyle = p("#ffffff", 0.9)),
    [
      [-5, -2, 1.8],
      [4, 2, 1.4],
      [0, 6, 1.2],
    ].forEach(([l, n, i]) => k(t, l, n, i, p("#ffffff", 0.9))),
    t.restore(),
    k(t, -22, 20, 8.5, O(e, 6)),
    k(t, 22, 20, 8.5, O(e, 6)),
    t.restore());
}
function Xn(t, e, o) {
  (t.save(), t.translate(0, 6));
  const a = t.createLinearGradient(-4, 0, 4, 0);
  (a.addColorStop(0, "#c98d00"),
    a.addColorStop(0.5, "#ffe9a0"),
    a.addColorStop(1, "#c98d00"),
    (t.fillStyle = a),
    t.fillRect(-3.5, -50, 7, 84),
    t.beginPath(),
    t.moveTo(-34, 34),
    t.quadraticCurveTo(0, 48, 34, 34),
    t.quadraticCurveTo(0, 42, -34, 34),
    t.closePath(),
    (t.fillStyle = o),
    t.fill(),
    (t.strokeStyle = j(e, 14)),
    (t.lineWidth = 7),
    (t.lineCap = "round"),
    [
      [-14, -0.25],
      [14, 0.25],
    ].forEach(([n, i]) => {
      (t.save(),
        t.translate(n, 12),
        t.rotate(i),
        t.beginPath(),
        t.moveTo(0, 0),
        t.lineTo(0, 22),
        t.stroke(),
        t.restore());
    }),
    t.beginPath(),
    t.ellipse(0, 6, 26, 18, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 26)),
    t.fill(),
    t.save(),
    t.beginPath(),
    t.ellipse(0, 6, 26, 18, 0, 0, Math.PI * 2),
    t.clip(),
    (t.fillStyle = o),
    t.fillRect(-13, -14, 26, 18),
    (t.fillStyle = "#ffd75e"),
    t.fillRect(-13, 2, 26, 4),
    t.restore(),
    t.save(),
    t.translate(-14, -12),
    t.rotate(-0.35),
    t.beginPath(),
    t.roundRect(-8, -26, 17, 34, 8),
    (t.fillStyle = T(t, e, 18)),
    t.fill(),
    t.restore(),
    t.save(),
    t.translate(-24, -34),
    t.rotate(-0.25),
    t.beginPath(),
    t.ellipse(0, 0, 15, 11, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 14)),
    t.fill(),
    t.beginPath(),
    t.ellipse(-10, 4, 6, 5, 0, 0, Math.PI * 2),
    (t.fillStyle = O(e, 8)),
    t.fill(),
    k(t, -12, 3, 1.4, "#8a6a72"),
    k(t, 2, -3, 2.4, "#5c4a62"),
    k(t, 3, -4, 0.9, "#ffffff"),
    t.beginPath(),
    t.moveTo(6, -9),
    t.lineTo(10, -18),
    t.lineTo(13, -8),
    t.closePath(),
    (t.fillStyle = j(e, 8)),
    t.fill(),
    t.restore());
  const l = [o, "#ffc4e0", "#bfe4ff"];
  (l.forEach((n, i) => {
    (t.save(),
      t.translate(-12, -30 + i * 7),
      t.beginPath(),
      t.moveTo(0, 0),
      t.quadraticCurveTo(10, 6, 4, 14),
      t.quadraticCurveTo(14, 10, 12, 0),
      t.closePath(),
      (t.fillStyle = n),
      t.fill(),
      t.restore());
  }),
    t.save(),
    t.translate(24, 2),
    l.forEach((n, i) => {
      (t.beginPath(),
        t.moveTo(0, i * 5),
        t.quadraticCurveTo(14, 6 + i * 5, 8, 20 + i * 4),
        t.quadraticCurveTo(16, 12 + i * 5, 14, i * 5),
        t.closePath(),
        (t.fillStyle = n),
        t.fill());
    }),
    t.restore(),
    t.restore());
}
function Qn(t, e, o) {
  (t.save(),
    t.translate(0, 10),
    t.beginPath(),
    t.ellipse(0, 22, 25, 23, 0, 0, Math.PI * 2),
    (t.fillStyle = T(t, e, 25)),
    t.fill(),
    k(t, -15, 38, 8, O(e, 4)),
    k(t, 15, 38, 8, O(e, 4)),
    k(t, 0, -14, 23, T(t, e, 23)),
    [-11, 11].forEach((l) => {
      (t.save(),
        t.translate(l, -42),
        t.rotate(l * 0.022),
        t.beginPath(),
        t.ellipse(0, 0, 8, 23, 0, 0, Math.PI * 2),
        (t.fillStyle = e),
        t.fill(),
        (t.strokeStyle = p(j(e, 18), 0.6)),
        (t.lineWidth = 1),
        t.stroke(),
        t.beginPath(),
        t.ellipse(0, 2, 4, 16, 0, 0, Math.PI * 2),
        (t.fillStyle = o),
        t.fill(),
        t.restore());
    }),
    X(t, "#6b4a58", 9, -16, 3),
    t.beginPath(),
    t.moveTo(-3, -8),
    t.lineTo(3, -8),
    t.lineTo(0, -4.5),
    t.closePath(),
    (t.fillStyle = o),
    t.fill(),
    Ge(t, -6, 4.5, "#a86a80", 1.6),
    Ce(t, -8, 15, 4, "#ffc9dc"));
  const a = ["#ff9ec4", "#ffd75e", "#b9e5ff", "#ffb3e6", "#c9f0c9"];
  for (let l = 0; l < 5; l++) {
    const n = -Math.PI * 0.86 + (l * Math.PI * 0.68) / 4,
      i = Math.cos(n) * 24,
      s = -14 + Math.sin(n) * 24;
    (t.save(), t.translate(i, s), t.rotate(n + Math.PI / 2));
    for (let r = 0; r < 5; r++) {
      const f = (r * Math.PI * 2) / 5;
      k(t, Math.cos(f) * 4, Math.sin(f) * 4, 3.2, a[l % a.length]);
    }
    (k(t, 0, 0, 2.4, "#ffe9a0"), t.restore());
  }
  t.restore();
}
function Fn(t, e, o) {
  (t.save(),
    t.translate(0, 6),
    t.beginPath(),
    t.moveTo(-30, 24),
    t.lineTo(30, 24),
    t.lineTo(24, 42),
    t.lineTo(-24, 42),
    t.closePath());
  const a = t.createLinearGradient(0, 24, 0, 42);
  (a.addColorStop(0, "#ffe9a0"),
    a.addColorStop(1, "#c98d00"),
    (t.fillStyle = a),
    t.fill(),
    (t.strokeStyle = "#a06f00"),
    (t.lineWidth = 1.6),
    t.stroke(),
    t.beginPath(),
    t.ellipse(0, 24, 30, 6, 0, 0, Math.PI * 2),
    (t.fillStyle = "#ffe9a0"),
    t.fill());
  const l = t.createRadialGradient(-10, -22, 4, 0, -12, 34);
  (l.addColorStop(0, p("#ffffff", 0.85)),
    l.addColorStop(0.55, p(e, 0.65)),
    l.addColorStop(1, p(e, 0.35)),
    k(t, 0, -12, 32, l),
    t.save(),
    t.beginPath(),
    t.arc(0, -12, 32, 0, Math.PI * 2),
    t.clip(),
    (t.fillStyle = p("#ffffff", 0.9)),
    t.fillRect(-32, 8, 64, 20),
    (t.fillStyle = "#f0d8ee"),
    t.fillRect(-14, -12, 28, 22),
    [-14, 0, 14].forEach((n, i) => {
      ((t.fillStyle = "#f7e6f5"),
        t.fillRect(n - 5, -22 + (i === 1 ? -6 : 0), 10, 32),
        t.beginPath(),
        t.moveTo(n - 7, -22 + (i === 1 ? -6 : 0)),
        t.lineTo(n, -34 + (i === 1 ? -8 : 0)),
        t.lineTo(n + 7, -22 + (i === 1 ? -6 : 0)),
        t.closePath(),
        (t.fillStyle = o),
        t.fill());
    }),
    (t.fillStyle = p("#a86ac9", 0.55)),
    [
      [-14, -4],
      [0, -10],
      [14, -4],
    ].forEach(([n, i]) => t.fillRect(n - 2, i, 4, 6)),
    (t.fillStyle = p("#ffffff", 0.95)),
    [
      [-22, -26],
      [-6, -30],
      [12, -24],
      [22, -12],
      [-18, -6],
      [6, -18],
      [18, -30],
      [-12, -18],
    ].forEach(([n, i]) => k(t, n, i, 1.8, p("#ffffff", 0.95))),
    t.restore(),
    t.beginPath(),
    t.arc(0, -12, 32, 0, Math.PI * 2),
    (t.strokeStyle = p("#ffffff", 0.8)),
    (t.lineWidth = 2),
    t.stroke(),
    t.beginPath(),
    t.arc(-11, -22, 12, Math.PI * 0.85, Math.PI * 1.45),
    (t.strokeStyle = p("#ffffff", 0.7)),
    (t.lineWidth = 3.4),
    t.stroke(),
    t.save(),
    t.translate(0, 33),
    wo(t, 6),
    (t.fillStyle = "#fff6cc"),
    t.fill(),
    t.restore(),
    t.restore());
}
function Ln(t, e, o) {
  (t.save(), t.translate(0, 8));
  const a = (n) => {
    const i = t.createRadialGradient(-n * 0.3, -n * 0.35, n * 0.1, 0, 0, n * 1.1);
    return (
      i.addColorStop(0, "#bfa8ff"),
      i.addColorStop(0.45, e),
      i.addColorStop(0.75, "#5b3fa8"),
      i.addColorStop(1, "#2a1a52"),
      i
    );
  };
  ((t.shadowColor = p(o, 0.5)),
    (t.shadowBlur = 16),
    t.save(),
    t.translate(0, 22),
    t.beginPath(),
    t.ellipse(0, 0, 29, 25, 0, 0, Math.PI * 2),
    (t.fillStyle = a(29)),
    t.fill(),
    t.restore(),
    t.save(),
    t.translate(0, -18),
    t.beginPath(),
    t.arc(0, 0, 24, 0, Math.PI * 2),
    (t.fillStyle = a(24)),
    t.fill(),
    t.restore(),
    (t.shadowColor = "transparent"),
    [-19, 19].forEach((n) => {
      (t.save(),
        t.translate(n, -36),
        t.beginPath(),
        t.arc(0, 0, 10, 0, Math.PI * 2),
        (t.fillStyle = a(10)),
        t.fill(),
        k(t, 0, 0, 5, p(o, 0.55)),
        t.restore());
    }),
    [-22, 22].forEach((n) => {
      (t.save(),
        t.translate(n, 22),
        t.beginPath(),
        t.arc(0, 0, 8.5, 0, Math.PI * 2),
        (t.fillStyle = a(8.5)),
        t.fill(),
        t.restore());
    }),
    [
      [-14, -26, 2.2],
      [10, -30, 1.6],
      [18, -14, 2],
      [-20, -10, 1.6],
      [0, -8, 1.4],
      [-10, 16, 2],
      [14, 20, 1.8],
      [22, 30, 1.4],
      [-22, 28, 1.6],
      [4, 32, 2],
    ].forEach(([n, i, s]) => {
      (t.save(),
        t.translate(n, i),
        wo(t, s * 2.2, 0.4),
        (t.fillStyle = p("#ffffff", 0.9)),
        t.fill(),
        t.restore());
    }),
    t.save(),
    t.translate(0, -18),
    k(t, -9, -2, 3.6, "#ffffff"),
    k(t, 9, -2, 3.6, "#ffffff"),
    k(t, -9, -2, 1.6, "#3a1a6a"),
    k(t, 9, -2, 1.6, "#3a1a6a"),
    k(t, 0, 6, 2.8, p("#ffffff", 0.9)),
    Ge(t, 8, 5, p("#ffffff", 0.85), 1.8),
    Ce(t, 6, 15, 4, p(o, 0.5)),
    t.restore(),
    t.restore());
}
function xo(t, e, o, a) {
  t.beginPath();
  for (let l = 0; l < 5; l++) {
    const n = (l * Math.PI * 2) / 5 - Math.PI / 2,
      i = n + Math.PI / 5;
    (t.lineTo(e + Math.cos(n) * a, o + Math.sin(n) * a),
      t.lineTo(e + Math.cos(i) * a * 0.45, o + Math.sin(i) * a * 0.45));
  }
  t.closePath();
}
const xn = {
  normal: { base: v.ballNormal, shade: v.ballNormalShade, highlight: "#ffffff" },
  gold: { base: v.ballGold, shade: v.ballGoldShade, highlight: "#fff6cc" },
  bonus: { base: v.ballBonus, shade: v.ballBonusShade, highlight: "#ffe0f5" },
  fire: { base: v.ballFire, shade: v.ballFireShade, highlight: "#ffe0b0" },
  ice: { base: v.ballIce, shade: v.ballIceShade, highlight: "#ffffff" },
};
function Pt(t, e, o, a, l, n = 0) {
  const i = l === "gold" ? "item_ball_gold" : l === "normal" ? "item_ball_wood" : null;
  if (i && Oe.has(i)) {
    (t.save(),
      (t.shadowColor = "rgba(0,0,0,0.45)"),
      (t.shadowBlur = 8),
      (t.shadowOffsetY = 4),
      Oe.draw(t, i, e, o, a * 2.15, { fit: "contain", rotation: n * 0.5 }),
      t.restore());
    return;
  }
  const s = xn[l];
  (t.save(), (t.shadowColor = "rgba(0,0,0,0.4)"), (t.shadowBlur = 6), (t.shadowOffsetY = 3));
  const r = t.createRadialGradient(e - a * 0.35, o - a * 0.4, a * 0.15, e, o, a);
  (r.addColorStop(0, s.highlight),
    r.addColorStop(0.55, s.base),
    r.addColorStop(1, s.shade),
    t.beginPath(),
    t.arc(e, o, a, 0, Math.PI * 2),
    (t.fillStyle = r),
    t.fill(),
    (t.shadowColor = "transparent"),
    t.save(),
    t.beginPath(),
    t.arc(e, o, a, 0, Math.PI * 2),
    t.clip(),
    (t.strokeStyle = j(s.base, 30)),
    (t.globalAlpha = 0.35),
    (t.lineWidth = 2));
  for (let f = -2; f <= 2; f++) {
    const h = f * (a * 0.42) + ((n * 30) % (a * 0.42));
    (t.beginPath(), t.ellipse(e + h, o, a * 0.32, a, 0, 0, Math.PI * 2), t.stroke());
  }
  if ((t.restore(), l === "normal")) {
    (t.save(), t.beginPath(), t.arc(e, o, a, 0, Math.PI * 2), t.clip(), t.translate(e, o), t.rotate(n * 0.5));
    const f = t.createLinearGradient(0, -a * 0.42, 0, a * 0.42);
    (f.addColorStop(0, v.tentRed),
      f.addColorStop(1, v.tentRedDark),
      (t.fillStyle = f),
      t.fillRect(-a, -a * 0.4, a * 2, a * 0.8),
      (t.strokeStyle = O(v.tentRed, 25)),
      (t.lineWidth = a * 0.06),
      t.beginPath(),
      t.moveTo(-a, -a * 0.4),
      t.lineTo(a, -a * 0.4),
      t.moveTo(-a, a * 0.4),
      t.lineTo(a, a * 0.4),
      t.stroke(),
      (t.fillStyle = "#fff6d0"),
      xo(t, 0, 0, a * 0.3),
      t.fill(),
      t.restore());
  }
  if (
    (l === "gold" &&
      ((t.strokeStyle = v.coinGoldDark),
      (t.lineWidth = 2),
      t.beginPath(),
      t.arc(e, o, a - 1, 0, Math.PI * 2),
      t.stroke(),
      t.save(),
      t.translate(e, o),
      t.rotate(n * 0.5),
      (t.fillStyle = "#fff6d0"),
      xo(t, 0, 0, a * 0.34),
      t.fill(),
      t.restore()),
    l === "bonus")
  ) {
    (t.save(), t.translate(e, o), t.rotate(n), (t.fillStyle = "rgba(255,255,255,0.85)"));
    for (let f = 0; f < 5; f++) {
      const h = (f * Math.PI * 2) / 5;
      (t.beginPath(),
        t.arc(Math.cos(h) * a * 0.5, Math.sin(h) * a * 0.5, a * 0.09, 0, Math.PI * 2),
        t.fill());
    }
    t.restore();
  }
  if (l === "fire") {
    (t.save(), t.translate(e, o), t.rotate(n * 0.4));
    for (let f = 0; f < 5; f++)
      (t.save(),
        t.rotate((f * Math.PI * 2) / 5),
        t.beginPath(),
        t.moveTo(0, -a * 0.15),
        t.quadraticCurveTo(a * 0.35, -a * 0.4, a * 0.62, -a * 0.05),
        t.quadraticCurveTo(a * 0.4, a * 0.1, 0, a * 0.15),
        t.closePath(),
        (t.fillStyle = p("#ffd24a", 0.85)),
        t.fill(),
        t.restore());
    t.restore();
  }
  if (l === "ice") {
    (t.save(),
      t.translate(e, o),
      t.rotate(n * 0.3),
      (t.strokeStyle = p("#ffffff", 0.9)),
      (t.lineWidth = Math.max(1.5, a * 0.06)),
      (t.lineCap = "round"));
    const f = a * 0.55;
    for (let h = 0; h < 3; h++)
      (t.save(),
        t.rotate((h * Math.PI) / 3),
        t.beginPath(),
        t.moveTo(-f, 0),
        t.lineTo(f, 0),
        t.stroke(),
        t.restore());
    t.restore();
  }
  (t.beginPath(),
    t.arc(e - a * 0.32, o - a * 0.35, a * 0.22, 0, Math.PI * 2),
    (t.fillStyle = "rgba(255,255,255,0.55)"),
    t.fill(),
    t.restore());
}
const Nt = "#1e4270",
  Ht = "#0d2244",
  Xt = "#e8b23c",
  Wa = "#ffd97a",
  Vo = "#fff3d6";
function jt(t, e, o, a, l, n, i = {}) {
  const s = i.radius ?? 14;
  t.save();
  const r = t.createLinearGradient(0, o, 0, o + l);
  (r.addColorStop(0, Nt),
    r.addColorStop(1, Ht),
    m(t, e, o, a, l, s),
    (t.fillStyle = r),
    t.fill(),
    (t.strokeStyle = Xt),
    (t.lineWidth = 3),
    m(t, e, o, a, l, s),
    t.stroke(),
    (t.strokeStyle = p(Wa, 0.35)),
    (t.lineWidth = 1),
    m(t, e + 3.5, o + 3.5, a - 7, l - 7, s - 3),
    t.stroke());
  const f = t.createLinearGradient(0, o, 0, o + l * 0.45);
  (f.addColorStop(0, p("#ffffff", 0.14)),
    f.addColorStop(1, p("#ffffff", 0)),
    m(t, e + 2, o + 2, a - 4, l * 0.45, s - 2),
    (t.fillStyle = f),
    t.fill(),
    P(t, n, e + a / 2, o + 17, { size: 13, color: Vo, weight: 800 }),
    t.restore());
}
function me(t, e, o, a, l, n = {}) {
  t.save();
  const i = t.createLinearGradient(0, o - a, 0, o + a);
  (i.addColorStop(0, n.pressed ? Ht : Nt),
    i.addColorStop(1, n.pressed ? Nt : Ht),
    t.beginPath(),
    t.arc(e, o, a, 0, Math.PI * 2),
    (t.fillStyle = i),
    t.fill(),
    (t.lineWidth = 3),
    (t.strokeStyle = Xt),
    t.stroke(),
    (t.globalAlpha = n.dimmed ? 0.4 : 1),
    (t.font = `${Math.round(a * 1.05)}px sans-serif`),
    (t.textAlign = "center"),
    (t.textBaseline = "middle"),
    (t.fillStyle = Vo),
    t.fillText(l, e, o + 1),
    t.restore());
}
function _n(t, e, o, a, l, n) {
  const i = e - a / 2,
    s = o - l / 2;
  (t.save(),
    m(t, i, s, a, l, l / 2),
    (t.fillStyle = "rgba(0,0,0,0.55)"),
    t.fill(),
    (t.strokeStyle = Xt),
    (t.lineWidth = 3),
    m(t, i, s, a, l, l / 2),
    t.stroke());
  const r = Math.max(0, (a - 8) * Math.min(1, Math.max(0, n)));
  if (r > 2) {
    const f = t.createLinearGradient(i, 0, i + a, 0);
    (f.addColorStop(0, "#5ad46a"),
      f.addColorStop(0.55, "#ffd24a"),
      f.addColorStop(1, "#e63946"),
      m(t, i + 4, s + 4, r, l - 8, (l - 8) / 2),
      (t.fillStyle = f),
      t.fill(),
      m(t, i + 6, s + 6, Math.max(0, r - 4), (l - 8) * 0.4, (l - 8) * 0.2),
      (t.fillStyle = p("#ffffff", 0.3)),
      t.fill());
  }
  (P(t, `GÜÇ  %${Math.round(n * 100)}`, e, s + l + 20, { size: 17, color: Vo, weight: 900 }), t.restore());
}
class Te {
  constructor(e) {
    u(this, "pressed", !1);
    this.opts = e;
  }
  hit(e, o) {
    return this.opts.disabled?.() ? !1 : W(e, o, this.opts.x, this.opts.y, this.opts.w, this.opts.h);
  }
  onDown(e, o) {
    return this.hit(e, o) ? ((this.pressed = !0), !0) : !1;
  }
  onUp(e, o) {
    const a = this.pressed;
    return ((this.pressed = !1), a && this.hit(e, o) ? (z.play("button"), this.opts.onClick(), !0) : !1);
  }
  cancel() {
    this.pressed = !1;
  }
  setLabel(e) {
    this.opts.label = e;
  }
  get rect() {
    return { x: this.opts.x, y: this.opts.y, w: this.opts.w, h: this.opts.h };
  }
  draw(e) {
    bl(e, {
      x: this.opts.x,
      y: this.opts.y,
      w: this.opts.w,
      h: this.opts.h,
      label: this.opts.label,
      colorTop: this.opts.colorTop,
      colorBottom: this.opts.colorBottom,
      fontSize: this.opts.fontSize,
      pressed: this.pressed,
      disabled: this.opts.disabled?.() ?? !1,
      icon: this.opts.icon,
    });
  }
}
const Bt = {
    normal: {
      type: "normal",
      name: "Klasik Top",
      scoreMul: 1,
      radiusMul: 1,
      desc: "Standart ahşap top. Dengeli ağırlık, dengeli sekme.",
      price: 0,
    },
    bonus: {
      type: "bonus",
      name: "Bonus Top",
      scoreMul: 1,
      radiusMul: 1.22,
      desc: "%22 daha büyük — deliğe girmesi çok daha kolay.",
      price: 350,
    },
    gold: {
      type: "gold",
      name: "Altın Top",
      scoreMul: 1.5,
      radiusMul: 1.05,
      desc: "Her isabette %50 fazla puan kazandırır.",
      price: 500,
    },
    fire: {
      type: "fire",
      name: "Ateş Topu",
      scoreMul: 1.2,
      radiusMul: 1,
      desc: "Kalkan engelini TEK VURUŞTA eritir.",
      price: 800,
    },
    ice: {
      type: "ice",
      name: "Buz Topu",
      scoreMul: 1,
      radiusMul: 1.1,
      desc: "Ağır ve kaygan - fırlatıcı (bouncer) engelinden etkilenmez.",
      price: 800,
    },
  },
  jo = ["normal", "bonus", "gold", "fire", "ice"],
  _o = 140;
class $n {
  constructor() {
    u(this, "pos", { x: 0, y: 0 });
    u(this, "vel", { x: 0, y: 0 });
    u(this, "radius", Mo);
    u(this, "type", "normal");
    u(this, "state", "idle");
    u(this, "spin", 0);
    u(this, "curve", 0);
    u(this, "restTimer", 0);
    u(this, "stuckTimer", 0);
    u(this, "stuckSampleTimer", 0);
    u(this, "stuckSampleX", 0);
    u(this, "stuckSampleY", 0);
    u(this, "stuckStillTime", 0);
    u(this, "flightTime", 0);
    u(this, "armedFloor", !1);
    u(this, "onHardWallHit", null);
    u(this, "onBounce", null);
    u(this, "gravityMul", 1);
    u(this, "bounceMul", 1);
    u(this, "wind", 0);
    u(this, "hasBrokenOut", !1);
  }
  reset(e, o, a = "normal") {
    ((this.pos = { x: e, y: o }),
      (this.vel = { x: 0, y: 0 }),
      (this.state = "idle"),
      (this.type = a),
      (this.spin = 0),
      (this.curve = 0),
      (this.restTimer = 0),
      (this.stuckTimer = 0),
      (this.armedFloor = !1),
      (this.hasBrokenOut = !1),
      (this.radius = Mo * (Bt[a]?.radiusMul ?? 1)),
      this.resetStuckTracking());
  }
  launch(e, o, a = 0) {
    ((this.vel = { x: e, y: o }),
      (this.state = "flying"),
      (this.curve = a),
      (this.spin = e * 0.02),
      (this.armedFloor = !1),
      (this.hasBrokenOut = !1),
      (this.stuckTimer = 0),
      this.resetStuckTracking(),
      z.play("throw"));
  }
  resetStuckTracking() {
    ((this.stuckSampleTimer = 0),
      (this.stuckStillTime = 0),
      (this.stuckSampleX = this.pos.x),
      (this.stuckSampleY = this.pos.y),
      (this.flightTime = 0));
  }
  forceRest() {
    ((this.state = "resting"), (this.vel = { x: 0, y: 0 }));
  }
  update(e) {
    if (this.state === "flying") {
      if (
        ((this.vel.y += To * this.gravityMul * e),
        this.wind !== 0 && (this.vel.x += this.wind * e),
        Math.abs(this.curve) > 0.001)
      ) {
        const o = Math.hypot(this.vel.x, this.vel.y);
        if (o > 1) {
          const a = -this.vel.y / o,
            l = this.vel.x / o;
          ((this.vel.x += a * this.curve * Yt * e), (this.vel.y += l * this.curve * Yt * e));
        }
        ((this.curve *= Math.pow(ga, e)), (this.spin += this.curve * e * 6));
      }
      ((this.vel.x *= it),
        (this.vel.y *= it),
        (this.pos.x += this.vel.x * e),
        (this.pos.y += this.vel.y * e),
        (this.spin += this.vel.x * e * 0.05),
        !this.armedFloor && this.pos.y < D - this.radius - 10 && (this.armedFloor = !0),
        this.handleWalls(),
        this.armedFloor
          ? this.handleFloor(e)
          : this.vel.y >= 0 && this.pos.y >= Aa && ((this.state = "resting"), (this.vel = { x: 0, y: 0 })),
        this.state === "flying" &&
          (Math.hypot(this.vel.x, this.vel.y) < 25
            ? ((this.stuckTimer += e), this.stuckTimer > 0.45 && this.forceRest())
            : (this.stuckTimer = 0)),
        this.state === "flying" &&
          ((this.stuckSampleTimer += e),
          this.stuckSampleTimer >= 0.25 &&
            (Math.hypot(this.pos.x - this.stuckSampleX, this.pos.y - this.stuckSampleY) < 9
              ? ((this.stuckStillTime += this.stuckSampleTimer),
                this.stuckStillTime > 0.7 && this.forceRest())
              : (this.stuckStillTime = 0),
            (this.stuckSampleTimer = 0),
            (this.stuckSampleX = this.pos.x),
            (this.stuckSampleY = this.pos.y))),
        this.state === "flying" && ((this.flightTime += e), this.flightTime > 12 && this.forceRest()));
    }
  }
  damping() {
    return Math.min(0.97, at * this.bounceMul);
  }
  emitBounce(e, o, a, l) {
    if (a < _o) return;
    const n = Math.min(1, (a - _o) / 900);
    this.onBounce?.(e, o, n, l);
  }
  handleWalls() {
    if (
      (this.pos.x - this.radius < J
        ? ((this.pos.x = J + this.radius),
          this.emitBounce(this.pos.x, this.pos.y, Math.abs(this.vel.x), "wall"),
          (this.vel.x = Math.abs(this.vel.x) * this.damping()),
          z.play("swoosh"))
        : this.pos.x + this.radius > se &&
          ((this.pos.x = se - this.radius),
          this.emitBounce(this.pos.x, this.pos.y, Math.abs(this.vel.x), "wall"),
          (this.vel.x = -Math.abs(this.vel.x) * this.damping()),
          z.play("swoosh")),
      this.vel.y < 0 && this.pos.y - this.radius < x)
    ) {
      const e = Math.abs(this.vel.y);
      if (e > Eo) {
        ((this.hasBrokenOut = !0),
          z.play("wallThud"),
          this.onHardWallHit?.(this.pos.x, x, 1.4),
          (this.state = "resting"),
          (this.vel = { x: 0, y: 0 }));
        return;
      }
      if (((this.pos.y = x + this.radius), (this.vel.y = e * this.damping()), e > Ft)) {
        const o = Math.min(1, (e - Ft) / (Eo - Ft));
        (z.play("wallThud"), this.onHardWallHit?.(this.pos.x, this.pos.y, o));
      }
    }
  }
  handleFloor(e) {
    const o = D - this.radius;
    this.pos.y >= o &&
      ((this.pos.y = o),
      Math.abs(this.vel.y) > 60
        ? (this.emitBounce(this.pos.x, o + this.radius, Math.abs(this.vel.y), "floor"),
          (this.vel.y = -Math.abs(this.vel.y) * this.damping()),
          (this.vel.x *= 0.9))
        : ((this.vel.y = 0), (this.vel.x *= Math.pow(Fa, e * 60))));
    const a = Math.hypot(this.vel.x, this.vel.y);
    (this.pos.y >= o - 1 && a < 18
      ? ((this.restTimer += e),
        this.restTimer > 0.35 && ((this.state = "resting"), (this.vel = { x: 0, y: 0 })))
      : (this.restTimer = 0),
      this.pos.y > D + 200 && ((this.state = "resting"), (this.vel = { x: 0, y: 0 })));
  }
}
function Ya(t, e) {
  return { x: t.x - e.x, y: t.y - e.y };
}
function ei(t, e) {
  return { x: t.x * e, y: t.y * e };
}
function At(t) {
  return Math.hypot(t.x, t.y);
}
function Ca(t) {
  const e = At(t);
  return e < 1e-6 ? { x: 0, y: 0 } : { x: t.x / e, y: t.y / e };
}
function ti(t, e) {
  return At(t) <= e ? t : ei(Ca(t), e);
}
function oi(t, e) {
  return At(Ya(t, e));
}
function ai(t, e, o, a, l, n) {
  const i = t - a,
    s = e - l,
    r = o + n;
  return i * i + s * s <= r * r;
}
function Wt(t, e, o, a) {
  const l = Math.max(a.left, Math.min(t, a.right)),
    n = Math.max(a.top, Math.min(e, a.bottom)),
    i = t - l,
    s = e - n,
    r = i * i + s * s;
  if (r > o * o) return null;
  const f = Math.sqrt(r) || 1e-4;
  return { x: i / f, y: s / f };
}
function li(t, e, o, a, l, n, i, s) {
  const r = Math.cos(-n),
    f = Math.sin(-n),
    h = t - a,
    d = e - l,
    y = h * r - d * f,
    g = h * f + d * r,
    A = Wt(y, g, o, { left: -i / 2, right: i / 2, top: -s / 2, bottom: s / 2 });
  if (!A) return null;
  const S = Math.cos(n),
    R = Math.sin(n);
  return { x: A.x * S - A.y * R, y: A.x * R + A.y * S };
}
class ni {
  constructor() {
    u(this, "origin", { x: 0, y: 0 });
    u(this, "pointer", { x: 0, y: 0 });
    u(this, "active", !1);
    u(this, "samples", []);
  }
  begin(e, o, a, l) {
    ((this.origin = { x: e, y: o }),
      (this.pointer = { x: a, y: l }),
      (this.active = !0),
      (this.samples = [{ x: a, y: l, t: performance.now() }]));
  }
  drag(e, o) {
    if (!this.active) return;
    this.pointer = { x: e, y: o };
    const a = performance.now();
    for (this.samples.push({ x: e, y: o, t: a }); this.samples.length > 2 && a - this.samples[0].t > 130;)
      this.samples.shift();
  }
  get curve() {
    if (this.samples.length < 2) return 0;
    const e = this.samples[0],
      o = this.samples[this.samples.length - 1],
      a = o.t - e.t;
    if (a < 8) return 0;
    const l = ((o.x - e.x) / a) * 1e3,
      n = ((o.y - e.y) / a) * 1e3,
      i = this.aimDir,
      s = -i.y,
      r = i.x,
      f = l * s + n * r;
    return Math.max(-1, Math.min(1, f / xa));
  }
  get pullVector() {
    return ti(Ya(this.pointer, this.origin), Po);
  }
  get power() {
    const e = Math.min(1, At(this.pullVector) / Po);
    return Math.pow(e, La);
  }
  get aimDir() {
    const e = this.pullVector;
    return At(e) < 4 ? { x: 0, y: -1 } : Ca({ x: -e.x, y: -e.y });
  }
  get slingPoint() {
    return { x: this.origin.x + this.pullVector.x, y: this.origin.y + this.pullVector.y };
  }
  get origin_() {
    return this.origin;
  }
  release() {
    const e = this.power,
      o = this.curve;
    return (
      (this.active = !1),
      (this.samples = []),
      e < 0.08 ? null : { power: e, dir: this.aimDir, curve: o }
    );
  }
  cancel() {
    ((this.active = !1), (this.samples = []));
  }
  distanceFromOrigin(e, o) {
    return oi(this.origin, { x: e, y: o });
  }
}
const Ze = { x: c / 2, y: Aa };
class ii {
  constructor() {
    u(this, "ball", new $n());
    u(this, "aim", new ni());
    u(this, "nextBallType", "normal");
    u(this, "settledCooldown", 0);
    u(this, "onSettled", null);
    this.ball.reset(Ze.x, Ze.y, "normal");
  }
  prepareNextBall(e = "normal") {
    ((this.nextBallType = e), this.ball.reset(Ze.x, Ze.y, e));
  }
  get canAim() {
    return this.ball.state === "idle";
  }
  beginAim(e, o) {
    return !this.canAim || Math.hypot(e - this.ball.pos.x, o - this.ball.pos.y) > 140
      ? !1
      : (this.aim.begin(this.ball.pos.x, this.ball.pos.y, e, o), !0);
  }
  updateAim(e, o) {
    this.aim.drag(e, o);
  }
  releaseAim() {
    const e = this.aim.release();
    if (!e) return !1;
    const o = Ma + e.power * Pa;
    return (
      this.ball.launch(e.dir.x * o, e.dir.y * o, e.curve),
      Re.emit("ballThrown", { power: e.power }),
      !0
    );
  }
  cancelAim() {
    this.aim.cancel();
  }
  update(e) {
    (this.ball.update(e),
      this.ball.state === "resting" &&
        ((this.settledCooldown += e),
        this.settledCooldown > 0.55 &&
          ((this.settledCooldown = 0), Re.emit("ballSettled", void 0), this.onSettled?.())));
  }
}
const _t = {
    none: { id: "none", label: "Sakin Hava", desc: "Bugün panayır sakin.", icon: "🎪", boon: !0 },
    wind: { id: "wind", label: "Rüzgârlı", desc: "Top yana sürükleniyor.", icon: "🌬️", boon: !1 },
    rain: { id: "rain", label: "Yağmurlu", desc: "Top ağırlaştı, daha çabuk düşüyor.", icon: "🌧️", boon: !1 },
    night: { id: "night", label: "Gece", desc: "Panayır karardı, görüş daraldı.", icon: "🌙", boon: !1 },
    slippery: { id: "slippery", label: "Kaygan Zemin", desc: "Top daha çok sekiyor.", icon: "🧊", boon: !1 },
    doubleScore: {
      id: "doubleScore",
      label: "Çifte Puan",
      desc: "Tüm puanlar iki katı!",
      icon: "✨",
      boon: !0,
    },
    bigBall: { id: "bigBall", label: "Dev Top", desc: "Top büyüdü, isabet kolay.", icon: "🏐", boon: !0 },
    extraShots: { id: "extraShots", label: "Ekstra Atış", desc: "+2 atış hakkı.", icon: "🎯", boon: !0 },
  },
  lt = ["doubleScore", "bigBall", "extraShots", "slippery", "none"],
  $o = ["none", "none", "wind", "rain", "night"];
function si(t) {
  return t <= 5 ? "none" : $o[(t * 3 + 1) % $o.length];
}
function ri(t = Math.random) {
  return lt[Math.floor(t() * lt.length) % lt.length];
}
function ea(t) {
  const e = {
    wind: 0,
    gravityMul: 1,
    bounceMul: 1,
    scoreMul: 1,
    ballRadiusMul: 1,
    extraShots: 0,
    darkness: 0,
  };
  for (const o of t)
    switch (o) {
      case "wind":
        e.wind += 190;
        break;
      case "rain":
        e.gravityMul *= 1.22;
        break;
      case "night":
        e.darkness = Math.max(e.darkness, 0.45);
        break;
      case "slippery":
        e.bounceMul *= 1.3;
        break;
      case "doubleScore":
        e.scoreMul *= 2;
        break;
      case "bigBall":
        e.ballRadiusMul *= 1.35;
        break;
      case "extraShots":
        e.extraShots += 2;
        break;
    }
  return e;
}
function fi(t, e, o, a, l, n = {}) {
  const i = n.ringColor ?? "#d4382f",
    s = a;
  t.save();
  const r = t.createRadialGradient(e, o - s * 0.15, s * 0.05, e, o, s * 0.86);
  (r.addColorStop(0, "#0a1410"),
    r.addColorStop(0.65, "#04120c"),
    r.addColorStop(1, "#000000"),
    t.beginPath(),
    t.arc(e, o, s * 0.86, 0, Math.PI * 2),
    (t.fillStyle = r),
    t.fill());
  const f = 0.5 + 0.5 * Math.sin(l * 2.4),
    h = t.createRadialGradient(e, o, s * 0.1, e, o, s * 0.8);
  (h.addColorStop(0, p(O(i, 40), 0.22 + f * 0.12)),
    h.addColorStop(1, "rgba(0,0,0,0)"),
    t.beginPath(),
    t.arc(e, o, s * 0.8, 0, Math.PI * 2),
    (t.fillStyle = h),
    t.fill());
  const d = s * 0.26,
    y = t.createLinearGradient(e - s, o - s, e + s, o + s);
  (y.addColorStop(0, O(i, 26)),
    y.addColorStop(0.5, i),
    y.addColorStop(1, j(i, 32)),
    t.beginPath(),
    t.arc(e, o, s - d / 2, 0, Math.PI * 2),
    (t.strokeStyle = y),
    (t.lineWidth = d),
    t.stroke(),
    t.beginPath(),
    t.arc(e, o, s, 0, Math.PI * 2),
    (t.strokeStyle = j(i, 45)),
    (t.lineWidth = 2),
    t.stroke(),
    t.beginPath(),
    t.arc(e, o, s - d, 0, Math.PI * 2),
    (t.strokeStyle = j(i, 45)),
    (t.lineWidth = 2),
    t.stroke());
  const g = 12;
  for (let A = 0; A < g; A++) {
    const S = (A / g) * Math.PI * 2 - Math.PI / 2,
      R = e + Math.cos(S) * (s - d / 2),
      G = o + Math.sin(S) * (s - d / 2),
      C = 0.45 + 0.55 * Math.max(0, Math.sin(l * 4 + A * 0.6)),
      te = s * 0.075,
      Ue = t.createRadialGradient(R, G, 0, R, G, te * 2.4);
    (Ue.addColorStop(0, p("#fff6c4", 0.95 * C)),
      Ue.addColorStop(1, p("#ffb347", 0)),
      t.beginPath(),
      t.arc(R, G, te * 2.4, 0, Math.PI * 2),
      (t.fillStyle = Ue),
      t.fill(),
      t.beginPath(),
      t.arc(R, G, te, 0, Math.PI * 2),
      (t.fillStyle = C > 0.6 ? "#fff8d8" : "#c9a35a"),
      t.fill());
  }
  if (n.magnet) {
    const A = n.magnet > 0,
      S = A ? "#7ae0ff" : "#ff9e6b";
    t.save();
    for (let R = 0; R < 3; R++) {
      const G = (((l * (A ? -0.55 : 0.55) + R / 3) % 1) + 1) % 1,
        C = s * (1.2 + G * 2.4);
      (t.beginPath(),
        t.arc(e, o, C, 0, Math.PI * 2),
        (t.strokeStyle = p(S, 0.42 * (1 - G))),
        (t.lineWidth = 2.5),
        t.stroke());
    }
    t.restore();
  }
  if (n.gateOpen === !1) {
    (t.save(), t.beginPath(), t.arc(e, o, s * 0.94, 0, Math.PI * 2), t.clip());
    const A = t.createLinearGradient(0, o - s, 0, o + s);
    (A.addColorStop(0, "#8a939c"),
      A.addColorStop(0.5, "#5d666f"),
      A.addColorStop(1, "#3b434a"),
      (t.fillStyle = A),
      t.fillRect(e - s, o - s, s * 2, s * 2),
      (t.strokeStyle = p("#1d2226", 0.7)),
      (t.lineWidth = 2));
    for (let S = -s; S < s; S += 10)
      (t.beginPath(), t.moveTo(e - s, o + S), t.lineTo(e + s, o + S), t.stroke());
    (t.restore(),
      t.beginPath(),
      t.arc(e, o, s * 0.94, 0, Math.PI * 2),
      (t.strokeStyle = "#2b3238"),
      (t.lineWidth = 3),
      t.stroke());
  } else
    n.gateOpen === !0 &&
      (t.save(),
      t.beginPath(),
      t.arc(e, o, s * 1.06, -Math.PI * 0.75, -Math.PI * 0.25),
      (t.strokeStyle = p("#7fe0a0", 0.85)),
      (t.lineWidth = 4),
      t.stroke(),
      t.restore());
  if (n.seq) {
    const A = e + s * 0.72,
      S = o - s * 0.72;
    (t.save(),
      t.beginPath(),
      t.arc(A, S, 15, 0, Math.PI * 2),
      (t.fillStyle = n.seqActive ? "#ffd54a" : "rgba(20,20,28,0.8)"),
      t.fill(),
      (t.strokeStyle = n.seqActive ? "#fff6c4" : p("#ffffff", 0.5)),
      (t.lineWidth = n.seqActive ? 3 : 2),
      t.stroke(),
      (t.font = "900 17px 'Segoe UI', sans-serif"),
      (t.textAlign = "center"),
      (t.textBaseline = "middle"),
      (t.fillStyle = n.seqActive ? "#5c3a00" : "#ffffff"),
      t.fillText(String(n.seq), A, S + 1),
      t.restore());
  }
  if (n.score !== void 0) {
    const A = Math.max(52, String(n.score).length * 24),
      S = 34,
      R = e - A / 2,
      G = o - s - S * 0.82;
    (t.beginPath(), t.roundRect(R, G, A, S, 8));
    const C = t.createLinearGradient(0, G, 0, G + S);
    (C.addColorStop(0, O(i, 12)),
      C.addColorStop(1, j(i, 30)),
      (t.fillStyle = C),
      t.fill(),
      (t.strokeStyle = "#ffe9a8"),
      (t.lineWidth = 2.5),
      t.stroke(),
      (t.font = "900 22px 'Segoe UI', sans-serif"),
      (t.textAlign = "center"),
      (t.textBaseline = "middle"),
      (t.lineWidth = 4),
      (t.strokeStyle = j(i, 55)),
      t.strokeText(String(n.score), e, G + S / 2 + 1),
      (t.fillStyle = "#ffffff"),
      t.fillText(String(n.score), e, G + S / 2 + 1));
  }
  t.restore();
}
const hi = 0.3,
  ta = 4.2;
class di {
  constructor() {
    u(this, "holes", []);
    u(this, "time", 0);
    u(this, "nextSeq", 1);
    u(this, "maxSeq", 0);
  }
  load(e) {
    ((this.holes = e.map((o, a) => ({ ...o, scoredThisFlight: !1, flash: 0, gatePhase: (a * 0.37) % 1 }))),
      (this.maxSeq = this.holes.reduce((o, a) => Math.max(o, a.seq ?? 0), 0)),
      (this.nextSeq = 1));
  }
  resetFlight() {
    this.holes.forEach((e) => (e.scoredThisFlight = !1));
  }
  update(e) {
    this.time += e;
    for (const o of this.holes) o.flash > 0 && (o.flash = Math.max(0, o.flash - e));
  }
  centerOf(e) {
    return { px: J + (se - J) * e.x, py: x + (D - x) * e.y };
  }
  isOpen(e) {
    return e.gate ? (((this.time / e.gate.period + e.gatePhase) % 1) + 1) % 1 < e.gate.openRatio : !0;
  }
  applyFields(e, o) {
    for (const a of this.holes) {
      if (!a.magnet || !this.isOpen(a)) continue;
      const { px: l, py: n } = this.centerOf(a),
        i = l - e.pos.x,
        s = n - e.pos.y,
        r = Math.hypot(i, s),
        f = a.radius * ta;
      if (r > f || r < 1) continue;
      const h = 1 - r / f,
        d = a.magnet * h * h;
      ((e.vel.x += (i / r) * d * o), (e.vel.y += (s / r) * d * o));
    }
  }
  applyGlobalPull(e, o, a) {
    for (const l of this.holes) {
      if (!this.isOpen(l)) continue;
      const { px: n, py: i } = this.centerOf(l),
        s = n - e.pos.x,
        r = i - e.pos.y,
        f = Math.hypot(s, r),
        h = l.radius * ta * 1.6;
      if (f > h || f < 1) continue;
      const d = 1 - f / h,
        y = a * d * d;
      ((e.vel.x += (s / f) * y * o), (e.vel.y += (r / f) * y * o));
    }
  }
  checkCollisions(e) {
    const o = [];
    for (const a of this.holes) {
      if (a.scoredThisFlight || !this.isOpen(a)) continue;
      const { px: l, py: n } = this.centerOf(a),
        i = Math.hypot(e.pos.x - l, e.pos.y - n);
      if (i < a.radius * 0.72) {
        ((a.scoredThisFlight = !0), (a.flash = 0.5));
        const s = i < a.radius * hi;
        let r = !1,
          f = !1;
        (a.seq &&
          (a.seq === this.nextSeq
            ? ((r = !0), this.nextSeq++, this.nextSeq > this.maxSeq && ((f = !0), (this.nextSeq = 1)))
            : (this.nextSeq = a.seq === 1 ? 2 : 1)),
          o.push({
            id: a.id,
            x: l,
            y: n,
            score: a.score,
            ringColor: a.ringColor ?? "#d4382f",
            swish: s,
            sequenceBonus: r,
            sequenceComplete: f,
          }),
          z.play("hole"));
      }
    }
    return o;
  }
  render(e) {
    for (const o of this.holes) {
      const { px: a, py: l } = this.centerOf(o);
      (fi(e, a, l, o.radius, this.time, {
        score: o.score,
        ringColor: o.ringColor,
        magnet: o.magnet,
        gateOpen: o.gate ? this.isOpen(o) : void 0,
        seq: o.seq,
        seqActive: o.seq ? o.seq === this.nextSeq : !1,
      }),
        o.flash > 0 &&
          (e.save(),
          (e.globalAlpha = o.flash / 0.5),
          e.beginPath(),
          e.arc(a, l, o.radius * (1 + (1 - o.flash / 0.5) * 0.5), 0, Math.PI * 2),
          (e.strokeStyle = "#fff6c4"),
          (e.lineWidth = 6),
          e.stroke(),
          e.restore()));
    }
  }
  reset() {
    (this.holes.forEach((e) => {
      ((e.scoredThisFlight = !1), (e.flash = 0));
    }),
      (this.nextSeq = 1));
  }
}
const Na = {
    red: { base: v.kukaRed, dark: v.kukaRedDark },
    yellow: { base: v.kukaYellow, dark: v.kukaYellowDark },
    blue: { base: v.kukaBlue, dark: v.kukaBlueDark },
    green: { base: v.kukaGreen, dark: v.kukaGreenDark },
    bonus: { base: v.kukaBonus, dark: v.kukaBonusDark },
  },
  Ha = {
    classic: { w: 1, h: 1, belly: 1, neck: 1 },
    wide: { w: 1.26, h: 0.9, belly: 1.14, neck: 1.12 },
    slim: { w: 0.78, h: 1.12, belly: 0.86, neck: 0.84 },
  };
function Ut(t, e, o, a = 1, l = 1) {
  t.beginPath();
  const n = l,
    i = a;
  (t.moveTo(-e * 0.17 * n, -o * 0.5),
    t.quadraticCurveTo(-e * 0.36 * n, -o * 0.44, -e * 0.31 * n, -o * 0.16),
    t.quadraticCurveTo(-e * 0.52 * i, o * 0.06, -e * 0.43 * i, o * 0.42),
    t.quadraticCurveTo(-e * 0.4 * i, o * 0.5, 0, o * 0.5),
    t.quadraticCurveTo(e * 0.4 * i, o * 0.5, e * 0.43 * i, o * 0.42),
    t.quadraticCurveTo(e * 0.52 * i, o * 0.06, e * 0.31 * n, -o * 0.16),
    t.quadraticCurveTo(e * 0.36 * n, -o * 0.44, e * 0.17 * n, -o * 0.5),
    t.closePath());
}
function ui(t, e, o, a, l, n = 0, i = !1, s = {}) {
  const r = Na[l],
    f = Ha[s.shape ?? "classic"],
    h = 96 * a * f.h,
    d = 48 * a * f.w,
    y = f.belly,
    g = f.neck;
  if (Oe.has("item_pin")) {
    yi(t, e, o, a, l, n, i, s);
    return;
  }
  (t.save(), t.translate(e, o));
  const A = n * (Math.PI / 2),
    S = n * h * 0.42;
  (t.translate(0, S),
    t.rotate(A),
    t.translate(0, -h * 0.5),
    t.save(),
    t.translate(0, h * 0.5 - S),
    t.rotate(-A));
  const R = t.createRadialGradient(0, 8, 1, 0, 8, d * 0.7);
  (R.addColorStop(0, `rgba(0,0,0,${0.36 * (1 - n * 0.6)})`),
    R.addColorStop(1, "rgba(0,0,0,0)"),
    (t.fillStyle = R),
    t.beginPath(),
    t.ellipse(0, 8, d * 0.7, d * 0.26, 0, 0, Math.PI * 2),
    t.fill(),
    t.restore(),
    Ut(t, d, h, y, g));
  const G = t.createLinearGradient(-d * 0.5, -h * 0.5, d * 0.55, h * 0.5);
  (G.addColorStop(0, O(r.base, 22)),
    G.addColorStop(0.42, r.base),
    G.addColorStop(1, j(r.base, 28)),
    (t.fillStyle = G),
    t.fill(),
    (t.lineWidth = Math.max(1.4, a * 1.8)),
    (t.strokeStyle = j(r.base, 45)),
    t.stroke(),
    t.save(),
    Ut(t, d, h, y, g),
    t.clip(),
    (t.lineWidth = Math.max(2.2, a * 3.2)),
    (t.strokeStyle = "rgba(255,246,214,0.75)"),
    t.save(),
    t.translate(-d * 0.045, -h * 0.012),
    Ut(t, d, h, y, g),
    t.stroke(),
    t.restore(),
    t.restore(),
    t.save(),
    Ut(t, d, h, y, g),
    t.clip());
  const C = t.createLinearGradient(-d * 0.4, -h * 0.5, -d * 0.05, -h * 0.5);
  (C.addColorStop(0, "rgba(255,255,255,0.55)"),
    C.addColorStop(1, "rgba(255,255,255,0)"),
    (t.fillStyle = C),
    t.beginPath(),
    t.ellipse(-d * 0.2, -h * 0.05, d * 0.16, h * 0.4, -0.08, 0, Math.PI * 2),
    t.fill());
  const te = t.createLinearGradient(d * 0.1, 0, d * 0.55, h * 0.2);
  (te.addColorStop(0, "rgba(0,0,0,0)"),
    te.addColorStop(1, "rgba(0,0,0,0.28)"),
    (t.fillStyle = te),
    t.fillRect(-d * 0.6, -h * 0.6, d * 1.2, h * 1.2));
  const Ue = (I, $, ne) => {
    const re = t.createLinearGradient(0, I - ne, 0, I + ne);
    (re.addColorStop(0, "#ffffff"),
      re.addColorStop(1, "#d8d8e0"),
      (t.fillStyle = re),
      t.beginPath(),
      t.ellipse(0, I, $, ne, 0, 0, Math.PI * 2),
      t.fill());
  };
  (Ue(-h * 0.31, d * 0.36, d * 0.12), Ue(-h * 0.12, d * 0.48, d * 0.13), t.restore());
  const B = h * 0.02,
    oe = d * 0.085,
    N = (((s.face ?? 0) % 5) + 5) % 5,
    Q = "#2b1a1f",
    q = Math.max(1.4, a * 1.9),
    w = d * 0.16;
  if (((t.lineCap = "round"), (t.lineJoin = "round"), N === 1))
    ((t.strokeStyle = Q),
      (t.lineWidth = q),
      t.beginPath(),
      t.arc(-w, B, oe, Math.PI * 0.15, Math.PI * 0.85),
      t.arc(w, B, oe, Math.PI * 0.15, Math.PI * 0.85),
      t.stroke());
  else {
    const I = N === 2 ? oe * 1.3 : oe;
    ((t.fillStyle = Q),
      t.beginPath(),
      t.arc(-w, B, I, 0, Math.PI * 2),
      t.arc(w, B, I, 0, Math.PI * 2),
      t.fill(),
      (t.fillStyle = "#ffffff"),
      t.beginPath(),
      t.arc(-w + I * 0.35, B - I * 0.4, I * 0.34, 0, Math.PI * 2),
      t.arc(w + I * 0.35, B - I * 0.4, I * 0.34, 0, Math.PI * 2),
      t.fill());
  }
  (N === 3 &&
    ((t.strokeStyle = Q),
    (t.lineWidth = q),
    t.beginPath(),
    t.moveTo(-w - oe, B - oe * 2.1),
    t.lineTo(-w + oe * 0.6, B - oe * 1.2),
    t.moveTo(w + oe, B - oe * 2.1),
    t.lineTo(w - oe * 0.6, B - oe * 1.2),
    t.stroke()),
    N === 4 &&
      ((t.strokeStyle = "rgba(40,28,34,0.85)"),
      (t.lineWidth = q * 0.9),
      t.beginPath(),
      t.arc(-w, B, oe * 1.6, 0, Math.PI * 2),
      t.arc(w, B, oe * 1.6, 0, Math.PI * 2),
      t.moveTo(-w + oe * 1.6, B),
      t.lineTo(w - oe * 1.6, B),
      t.stroke()),
    N !== 3 &&
      ((t.fillStyle = "rgba(255,120,140,0.45)"),
      t.beginPath(),
      t.ellipse(-d * 0.28, B + d * 0.13, d * 0.09, d * 0.06, 0, 0, Math.PI * 2),
      t.ellipse(d * 0.28, B + d * 0.13, d * 0.09, d * 0.06, 0, 0, Math.PI * 2),
      t.fill()),
    (t.strokeStyle = Q),
    (t.lineWidth = q),
    t.beginPath(),
    n > 0.5
      ? t.ellipse(0, B + d * 0.2, d * 0.08, d * 0.1, 0, 0, Math.PI * 2)
      : N === 3
        ? t.arc(0, B + d * 0.28, d * 0.15, 1.15 * Math.PI, 1.85 * Math.PI)
        : N === 2
          ? t.ellipse(0, B + d * 0.2, d * 0.07, d * 0.09, 0, 0, Math.PI * 2)
          : t.arc(0, B + d * 0.08, d * 0.15, 0.15 * Math.PI, 0.85 * Math.PI),
    t.stroke(),
    pi(t, s.hat ?? 0, d, h, g),
    i &&
      (t.save(),
      t.translate(0, -h * 0.6),
      (t.shadowColor = "rgba(255,210,60,0.8)"),
      (t.shadowBlur = 10 * a),
      (t.fillStyle = v.coinGold),
      Ba(t, d * 0.24),
      t.restore()),
    t.restore());
}
function pi(t, e, o, a, l) {
  if (!e) return;
  const n = -a * 0.5;
  if ((t.save(), e === 1))
    ((t.fillStyle = "#c0392b"),
      t.beginPath(),
      t.moveTo(-o * 0.22 * l, n + 2),
      t.lineTo(o * 0.22 * l, n + 2),
      t.lineTo(o * 0.17 * l, n - a * 0.17),
      t.lineTo(-o * 0.17 * l, n - a * 0.17),
      t.closePath(),
      t.fill(),
      (t.strokeStyle = "rgba(0,0,0,0.3)"),
      (t.lineWidth = 1.5),
      t.stroke(),
      (t.strokeStyle = "#2b1a1f"),
      (t.lineWidth = 2),
      t.beginPath(),
      t.moveTo(0, n - a * 0.17),
      t.lineTo(o * 0.2, n - a * 0.1),
      t.stroke(),
      (t.fillStyle = "#2b1a1f"),
      t.beginPath(),
      t.arc(o * 0.2, n - a * 0.1, o * 0.05, 0, Math.PI * 2),
      t.fill());
  else if (e === 2) {
    const i = -a * 0.24;
    ((t.fillStyle = "#e4406a"),
      t.beginPath(),
      t.moveTo(0, i),
      t.lineTo(-o * 0.3, i - o * 0.11),
      t.lineTo(-o * 0.3, i + o * 0.11),
      t.closePath(),
      t.moveTo(0, i),
      t.lineTo(o * 0.3, i - o * 0.11),
      t.lineTo(o * 0.3, i + o * 0.11),
      t.closePath(),
      t.fill(),
      (t.fillStyle = "#b52d52"),
      t.beginPath(),
      t.arc(0, i, o * 0.07, 0, Math.PI * 2),
      t.fill());
  } else
    ((t.fillStyle = "#2f2a3d"),
      t.beginPath(),
      t.ellipse(0, n + 2, o * 0.34, o * 0.08, 0, 0, Math.PI * 2),
      t.fill(),
      t.fillRect(-o * 0.17, n - a * 0.16, o * 0.34, a * 0.16),
      (t.fillStyle = "#e0a940"),
      t.fillRect(-o * 0.17, n - a * 0.06, o * 0.34, a * 0.035));
  t.restore();
}
function Ba(t, e) {
  t.beginPath();
  for (let o = 0; o < 5; o++) {
    const a = (o * Math.PI * 2) / 5 - Math.PI / 2,
      l = a + Math.PI / 5;
    (t.lineTo(Math.cos(a) * e, Math.sin(a) * e),
      t.lineTo(Math.cos(l) * (e * 0.45), Math.sin(l) * (e * 0.45)));
  }
  (t.closePath(), t.fill());
}
const oa = new Map();
function ci(t) {
  const e = oa.get(t);
  if (e) return e;
  const q = Oe.get("item_pin_" + t);
  if (q && q.naturalWidth) return (oa.set(t, q), q);
  const o = Oe.get("item_pin");
  if (!o || !o.naturalWidth) return null;
  const a = document.createElement("canvas");
  ((a.width = o.naturalWidth), (a.height = o.naturalHeight));
  const l = a.getContext("2d");
  return l
    ? (l.drawImage(o, 0, 0),
      t !== "red" &&
        ((l.globalCompositeOperation = "color"),
        (l.fillStyle = Na[t].base),
        l.fillRect(0, 0, a.width, a.height),
        (l.globalCompositeOperation = "destination-in"),
        l.drawImage(o, 0, 0),
        (l.globalCompositeOperation = "source-over")),
      oa.set(t, a),
      a)
    : null;
}
function yi(t, e, o, a, l, n, i, s = {}) {
  const r = ci(l);
  if (!r) return;
  const f = Ha[s.shape ?? "classic"],
    h = 104 * a * ((f.w + f.h) / 2),
    d = (r.width / r.height) * h;
  (t.save(), t.translate(e, o));
  const y = t.createRadialGradient(0, 6, 1, 0, 6, d * 0.75);
  (y.addColorStop(0, `rgba(0,0,0,${0.38 * (1 - n * 0.6)})`),
    y.addColorStop(1, "rgba(0,0,0,0)"),
    (t.fillStyle = y),
    t.beginPath(),
    t.ellipse(0, 6, d * 0.75, d * 0.26, 0, 0, Math.PI * 2),
    t.fill());
  const g = n * (Math.PI / 2);
  (t.translate(0, n * h * 0.42),
    t.rotate(g),
    t.drawImage(r, -d / 2, -h, d, h),
    i &&
      (t.save(),
      t.translate(0, -h - 10 * a),
      (t.shadowColor = "rgba(255,210,60,0.9)"),
      (t.shadowBlur = 12 * a),
      (t.fillStyle = v.coinGold),
      Ba(t, 12 * a),
      t.restore()),
    t.restore());
}
const vi = 1.7,
  gi = 0.25,
  Mi = 1,
  Pi = 1.3;
class Ai {
  constructor() {
    u(this, "kukas", []);
    u(this, "time", 0);
  }
  load(e) {
    this.kukas = e
      .filter((o) => o.kind === "kuka" || o.kind === "movingKuka" || o.kind === "bonus")
      .map((o) => ({
        ...o,
        baseX: o.x,
        baseY: o.y,
        knocked: !1,
        fallProgress: 0,
        phase: Math.random() * Math.PI * 2,
        hp: o.boss?.hp ?? 1,
        hitFlash: 0,
      }));
  }
  update(e) {
    this.time += e;
    for (const o of this.kukas) {
      if (o.moving && !o.knocked) {
        const a = this.time * o.moving.speed + o.phase;
        o.moving.axis === "x"
          ? (o.x = o.baseX + Math.sin(a) * o.moving.range)
          : (o.y = o.baseY + Math.sin(a) * o.moving.range);
      }
      (o.hitFlash > 0 && (o.hitFlash = Math.max(0, o.hitFlash - e)),
        o.knocked && o.fallProgress < 1 && (o.fallProgress = Math.min(1, o.fallProgress + e * 3.2)));
    }
  }
  checkCollisions(e) {
    const o = [];
    for (const a of this.kukas) {
      if (a.knocked) continue;
      const l = J + (se - J) * a.x,
        n = x + (D - x) * a.y,
        i = a.radius;
      if (ai(e.pos.x, e.pos.y, e.radius, l, n - i * 0.3, i)) {
        if (a.hp > 1) {
          (a.hp--,
            (a.hitFlash = 0.35),
            o.push({
              id: a.id,
              x: l,
              y: n - i,
              score: Math.round(a.score * gi),
              color: a.color,
              isBonus: !1,
              bossDamaged: !0,
              bossHpLeft: a.hp,
            }),
            z.play("wallThud"),
            (e.vel.x *= -0.55),
            (e.vel.y *= -0.55));
          continue;
        }
        ((a.knocked = !0),
          o.push({ id: a.id, x: l, y: n - i, score: a.score, color: a.color, isBonus: a.kind === "bonus" }),
          z.play("hitKuka"),
          window.setTimeout(() => z.play("knockdown"), 90),
          (e.vel.x *= 0.98),
          (e.vel.y *= 0.98),
          o.push(...this.topple(a, Mi)));
      }
    }
    return o;
  }
  topple(e, o) {
    if (o <= 0) return [];
    const a = [];
    for (const l of this.kukas) {
      if (l.knocked || l === e) continue;
      const n = Math.abs(l.baseX - e.baseX) * (se - J),
        i = Math.abs(l.baseY - e.baseY) * (D - x);
      if (Math.hypot(n, i) > (e.radius + l.radius) * Pi || l.hp > 1) continue;
      l.knocked = !0;
      const s = J + (se - J) * l.x,
        r = x + (D - x) * l.y;
      (a.push({
        id: l.id,
        x: s,
        y: r - l.radius,
        score: l.score,
        color: l.color,
        isBonus: l.kind === "bonus",
      }),
        a.push(...this.topple(l, o - 1)));
    }
    return a;
  }
  knockInRadius(e, o, a) {
    const l = [];
    for (const n of this.kukas) {
      if (n.knocked) continue;
      const i = J + (se - J) * n.x,
        s = x + (D - x) * n.y;
      Math.hypot(i - e, s - o) <= a &&
        ((n.knocked = !0),
        l.push({
          id: n.id,
          x: i,
          y: s - n.radius,
          score: n.score,
          color: n.color,
          isBonus: n.kind === "bonus",
        }));
    }
    return (l.length && z.play("knockdown"), l);
  }
  allKnocked() {
    return this.kukas.length > 0 && this.kukas.every((e) => e.knocked);
  }
  totalScore() {
    return this.kukas.reduce((e, o) => e + o.score, 0);
  }
  total() {
    return this.kukas.length;
  }
  remaining() {
    return this.kukas.filter((e) => !e.knocked).length;
  }
  render(e) {
    this.renderShelves(e);
    const o = [...this.kukas].sort((a, l) => a.y - l.y);
    for (const a of o) {
      const l = J + (se - J) * a.x,
        n = x + (D - x) * a.y,
        i = (a.boss?.hp ?? 1) > 1,
        s = (0.65 + 0.55 * a.y) * (i ? vi : 1);
      if ((e.save(), a.hitFlash > 0)) {
        const r = a.hitFlash * 14;
        e.translate((Math.random() - 0.5) * r, (Math.random() - 0.5) * r * 0.4);
      }
      (ui(e, l, n, s, a.color, a.fallProgress, a.kind === "bonus", {
        shape: a.shape,
        face: a.face,
        hat: a.hat,
      }),
        e.restore(),
        i && !a.knocked && this.renderBossHp(e, a));
    }
  }
  renderShelves(e) {
    if (this.kukas.length === 0) return;
    const o = new Map();
    for (const n of this.kukas) {
      const i = Math.round(n.baseY * 100) / 100,
        s = o.get(i);
      s
        ? ((s.min = Math.min(s.min, n.baseX)), (s.max = Math.max(s.max, n.baseX)))
        : o.set(i, { min: n.baseX, max: n.baseX });
    }
    let a = 1,
      l = 0;
    for (const n of this.kukas) ((a = Math.min(a, n.baseX)), (l = Math.max(l, n.baseX)));
    for (const [n] of o) {
      const i = x + (D - x) * n,
        s = 0.65 + 0.55 * n,
        r = 70 * s,
        f = J + (se - J) * a - r,
        d = J + (se - J) * l + r - f,
        y = i + 6 * s,
        g = 13 * s;
      e.save();
      const A = e.createLinearGradient(0, y + g, 0, y + g + 26 * s);
      (A.addColorStop(0, "rgba(0,0,0,0.38)"),
        A.addColorStop(1, "rgba(0,0,0,0)"),
        (e.fillStyle = A),
        e.fillRect(f, y + g, d, 26 * s));
      const S = e.createLinearGradient(0, y, 0, y + g);
      (S.addColorStop(0, O(v.woodPlank, 26)),
        S.addColorStop(0.5, v.woodPlank),
        S.addColorStop(1, j(v.woodPlank, 34)),
        (e.fillStyle = S),
        e.fillRect(f, y, d, g),
        (e.fillStyle = "rgba(255,246,214,0.28)"),
        e.fillRect(f, y, d, Math.max(1.5, 2 * s)),
        (e.strokeStyle = j(v.woodPlank, 48)),
        (e.lineWidth = Math.max(1.2, 1.6 * s)),
        e.strokeRect(f, y, d, g),
        e.restore());
    }
  }
  renderBossHp(e, o) {
    const a = o.boss?.hp ?? 1,
      l = 380,
      n = 26,
      i = c / 2 - l / 2 + 30,
      s = 136;
    (e.save(), (e.fillStyle = "rgba(0,0,0,0.65)"), e.fillRect(i, s, l, n));
    const r = Math.max(0, o.hp / a),
      f = e.createLinearGradient(i, s, i, s + n),
      h = r > 0.5 ? v.uiSuccess : r > 0.25 ? v.tentGold : v.uiDanger;
    (f.addColorStop(0, O(h, 20)),
      f.addColorStop(1, j(h, 18)),
      (e.fillStyle = f),
      e.fillRect(i, s, l * r, n),
      (e.strokeStyle = "rgba(0,0,0,0.55)"),
      (e.lineWidth = 2));
    for (let d = 1; d < a; d++) {
      const y = i + (l * d) / a;
      (e.beginPath(), e.moveTo(y, s), e.lineTo(y, s + n), e.stroke());
    }
    ((e.strokeStyle = p(v.uiCream, 0.9)),
      (e.lineWidth = 2.5),
      e.strokeRect(i, s, l, n),
      (e.fillStyle = "#ffffff"),
      (e.font = "900 15px 'Segoe UI', Tahoma, sans-serif"),
      (e.textAlign = "center"),
      (e.textBaseline = "middle"),
      (e.shadowColor = "rgba(0,0,0,0.8)"),
      (e.shadowBlur = 4),
      e.fillText(`👑 PATRON  ${o.hp}/${a}`, i + l / 2, s + n / 2 + 1),
      e.restore());
  }
  reset() {
    this.kukas.forEach((e) => {
      ((e.knocked = !1), (e.fallProgress = 0));
    });
  }
}
const ki = 4,
  $t = 0.6;
class Si {
  constructor() {
    u(this, "balls", []);
  }
  get count() {
    return this.balls.length;
  }
  spawnSplit(e, o, a, l, n) {
    const i = Math.max(420, Math.hypot(a, l) * 0.85),
      s = Math.atan2(l, a);
    [-0.42, 0.42].forEach((r) => {
      const f = s + r;
      this.balls.push({
        x: e,
        y: o,
        vx: Math.cos(f) * i,
        vy: Math.sin(f) * i,
        radius: n * 0.72,
        spin: 0,
        life: ki,
        dead: !1,
      });
    });
  }
  update(e) {
    for (const o of this.balls) {
      if (((o.life -= e), o.life <= 0)) {
        o.dead = !0;
        continue;
      }
      ((o.vy += To * e),
        (o.vx *= it),
        (o.vy *= it),
        (o.x += o.vx * e),
        (o.y += o.vy * e),
        (o.spin += o.vx * e * 0.05),
        o.x - o.radius < J
          ? ((o.x = J + o.radius), (o.vx = Math.abs(o.vx) * $t))
          : o.x + o.radius > se && ((o.x = se - o.radius), (o.vx = -Math.abs(o.vx) * $t)),
        o.y - o.radius < x && ((o.y = x + o.radius), (o.vy = Math.abs(o.vy) * $t)),
        o.y + o.radius > D && (o.dead = !0));
    }
    this.balls = this.balls.filter((o) => !o.dead);
  }
  positions() {
    return this.balls.map((e) => ({ x: e.x, y: e.y, radius: e.radius }));
  }
  consumeAt(e) {
    const o = this.balls[e];
    o && (o.dead = !0);
  }
  render(e, o) {
    for (const a of this.balls)
      (e.save(),
        (e.globalAlpha = Math.min(1, a.life / 0.6)),
        Pt(e, a.x, a.y, a.radius, o, a.spin),
        e.restore());
  }
  clear() {
    this.balls = [];
  }
}
function Ri(t, e, o, a, l) {
  t.save();
  const n = t.createLinearGradient(e, o, e, o + l);
  (n.addColorStop(0, O(v.woodPlank, 14)),
    n.addColorStop(0.55, v.woodPlank),
    n.addColorStop(1, j(v.woodPlank, 32)),
    (t.fillStyle = n),
    t.fillRect(e, o, a, l));
  const i = Math.max(3, Math.round(a / 26)),
    s = a / i;
  for (let y = 1; y < i; y++) {
    const g = e + y * s;
    ((t.fillStyle = "rgba(0,0,0,0.22)"),
      t.fillRect(g - 1, o + 2, 2, l - 4),
      (t.fillStyle = "rgba(255,255,255,0.08)"),
      t.fillRect(g + 1, o + 2, 1, l - 4));
  }
  const r = Math.max(6, l * 0.16),
    f = (y) => {
      const g = t.createLinearGradient(e, y, e, y + r);
      (g.addColorStop(0, O(v.woodPlank, 22)),
        g.addColorStop(1, j(v.woodPlank, 12)),
        (t.fillStyle = g),
        t.fillRect(e, y, a, r),
        (t.fillStyle = "rgba(0,0,0,0.25)"),
        t.fillRect(e, y + r - 1, a, 1));
    };
  (f(o + 2), f(o + l - r - 2), (t.fillStyle = "rgba(120,120,132,0.9)"));
  const h = Math.max(7, Math.min(a, l) * 0.16);
  ([
    [e, o],
    [e + a - h, o],
    [e, o + l - h],
    [e + a - h, o + l - h],
  ].forEach(([y, g]) => {
    (t.fillRect(y, g, h, h * 0.34), t.fillRect(y, g, h * 0.34, h));
  }),
    (t.fillStyle = "rgba(255,255,255,0.45)"));
  const d = Math.max(1.2, a * 0.012);
  ([
    [e + 7, o + 7],
    [e + a - 7, o + 7],
    [e + 7, o + l - 7],
    [e + a - 7, o + l - 7],
  ].forEach(([y, g]) => {
    (t.beginPath(), t.arc(y, g, d, 0, Math.PI * 2), t.fill());
  }),
    (t.strokeStyle = j(v.woodPlank, 48)),
    (t.lineWidth = 3),
    t.strokeRect(e, o, a, l),
    t.restore());
}
function mi(t, e, o, a, l, n) {
  (t.save(), t.translate(e, o), (t.shadowColor = "rgba(120,220,255,0.85)"), (t.shadowBlur = 14));
  const i = t.createLinearGradient(-a / 2, -l / 2, a / 2, l / 2);
  (i.addColorStop(0, "#d6f4ff"),
    i.addColorStop(0.5, "#7fc4ea"),
    i.addColorStop(1, "#2f6f9e"),
    (t.fillStyle = i),
    t.fillRect(-a / 2, -l / 2, a, l),
    (t.shadowBlur = 0),
    (t.strokeStyle = "#eef6fa"),
    (t.lineWidth = 5),
    t.strokeRect(-a / 2, -l / 2, a, l),
    (t.strokeStyle = j("#c9d6de", 30)),
    (t.lineWidth = 1.5),
    t.strokeRect(-a / 2 + 4, -l / 2 + 4, a - 8, l - 8),
    (t.fillStyle = p("#ffffff", 0.35)),
    t.fillRect(-a / 2 + 3, -l / 2 + 3, a - 6, l * 0.28),
    t.save(),
    (t.strokeStyle = p("#ffffff", 0.9)),
    (t.lineWidth = 2.5),
    (t.lineCap = "round"));
  const s = Math.min(a, l) * 0.24;
  for (let h = 0; h < 3; h++) {
    (t.save(), t.rotate((h * Math.PI) / 3), t.beginPath(), t.moveTo(-s, 0), t.lineTo(s, 0));
    for (const d of [-0.55, 0.55])
      (t.moveTo(s * d, 0),
        t.lineTo(s * d + s * 0.22, -s * 0.22),
        t.moveTo(s * d, 0),
        t.lineTo(s * d + s * 0.22, s * 0.22));
    (t.stroke(), t.restore());
  }
  t.restore();
  const r = Math.round((1 - n) * 5) + 2;
  ((t.strokeStyle = p("#ffffff", 0.85)), (t.lineWidth = 1.5));
  const f = Math.round(a * 7 + l * 13);
  for (let h = 0; h < r; h++) {
    const d = (((f + h * 977) % 1e3) / 1e3 - 0.5) * a * 0.8,
      y = (((f + h * 611) % 1e3) / 1e3 - 0.5) * l * 0.8;
    (t.beginPath(), t.moveTo(0, 0));
    const g = 3;
    let A = d * 0.15,
      S = y * 0.15;
    t.moveTo(A, S);
    for (let R = 1; R <= g; R++)
      ((A = (d * R) / g + (((f + h * 37 + R * 91) % 20) - 10)),
        (S = (y * R) / g + (((f + h * 53 + R * 47) % 20) - 10)),
        t.lineTo(A, S));
    t.stroke();
  }
  ((t.fillStyle = "#e8eef2"),
    [
      [-a / 2 + 8, -l / 2 + 8],
      [a / 2 - 8, -l / 2 + 8],
      [-a / 2 + 8, l / 2 - 8],
      [a / 2 - 8, l / 2 - 8],
    ].forEach(([h, d]) => {
      (t.beginPath(), t.arc(h, d, 3, 0, Math.PI * 2), t.fill());
    }),
    t.restore());
}
function zi(t, e, o, a, l, n) {
  const i = Math.max(a, l * 3) / 2;
  (t.save(), t.translate(e, o), t.rotate(n));
  for (let r = 0; r < 4; r++) {
    (t.save(), t.rotate((r * Math.PI) / 2));
    const f = t.createLinearGradient(0, 0, i, 0);
    (f.addColorStop(0, "#7a1d1d"),
      f.addColorStop(0.55, "#d23b2f"),
      f.addColorStop(1, "#8f2420"),
      (t.fillStyle = f),
      t.beginPath(),
      t.moveTo(0, -i * 0.14),
      t.quadraticCurveTo(i * 0.6, -i * 0.3, i, -i * 0.08),
      t.quadraticCurveTo(i * 1.03, 0, i, i * 0.08),
      t.quadraticCurveTo(i * 0.6, i * 0.3, 0, i * 0.14),
      t.closePath(),
      t.fill(),
      (t.strokeStyle = "#3d0f0f"),
      (t.lineWidth = 2),
      t.stroke(),
      (t.fillStyle = p("#ffffff", 0.18)),
      t.beginPath(),
      t.ellipse(i * 0.55, -i * 0.06, i * 0.3, i * 0.05, 0, 0, Math.PI * 2),
      t.fill(),
      t.restore());
  }
  (t.beginPath(), t.arc(0, 0, i * 0.2, 0, Math.PI * 2));
  const s = t.createRadialGradient(-i * 0.06, -i * 0.06, 1, 0, 0, i * 0.2);
  (s.addColorStop(0, "#f0e0c0"),
    s.addColorStop(1, "#8a6a3a"),
    (t.fillStyle = s),
    t.fill(),
    (t.strokeStyle = "#4a3018"),
    (t.lineWidth = 2),
    t.stroke(),
    t.restore());
}
function ji(t, e, o, a, l, n) {
  (t.save(), t.translate(e - a / 2, o - l / 2));
  const i = Math.max(4, Math.round(a / 14)),
    s = ["#ff8ac4", "#6ed0e8", "#fff29e", "#a8f0b8", "#c9a8ff"];
  for (let r = 0; r < i; r++) {
    const f = (a / i) * (r + 0.5),
      h = Math.sin(n * 2.2 + r * 0.8) * 6;
    ((t.strokeStyle = p(s[r % s.length], 0.65)),
      (t.lineWidth = 6),
      (t.lineCap = "round"),
      t.beginPath(),
      t.moveTo(f, 0),
      t.quadraticCurveTo(f + h, l * 0.5, f + h * 1.4, l),
      t.stroke(),
      (t.fillStyle = p("#ffffff", 0.5)));
    for (let d = 1; d < 4; d++) {
      const y = d / 4,
        g = f + h * 1.4 * y,
        A = l * y;
      (t.beginPath(), t.arc(g, A, 2.5, 0, Math.PI * 2), t.fill());
    }
  }
  ((t.fillStyle = "#5c4028"), t.fillRect(-2, -6, a + 4, 8), t.restore());
}
function Ui(t, e, o, a, l, n) {
  (t.save(), t.translate(e, o));
  const i = 0.85 + 0.15 * Math.sin(n * 5),
    s = a,
    r = Math.max(10, l * 0.26),
    f = -l / 2 + r,
    h = l / 2;
  ((t.strokeStyle = "#9aa3ad"), (t.lineWidth = Math.max(3, l * 0.07)), (t.lineCap = "round"));
  const d = 4,
    y = (h - f) * i;
  t.beginPath();
  for (let A = 0; A <= d * 12; A++) {
    const S = A / (d * 12),
      R = f + y * S,
      G = Math.sin(S * Math.PI * 2 * d) * (s * 0.28);
    A === 0 ? t.moveTo(G, R) : t.lineTo(G, R);
  }
  (t.stroke(),
    (t.strokeStyle = p("#ffffff", 0.35)),
    (t.lineWidth = Math.max(1, l * 0.02)),
    t.stroke(),
    (t.fillStyle = "#5c4028"),
    Fe(t, -s * 0.42, h - 6, s * 0.84, 8, 3),
    t.fill());
  const g = t.createLinearGradient(0, -l / 2, 0, -l / 2 + r);
  (g.addColorStop(0, O("#e63946", 14)),
    g.addColorStop(1, j("#e63946", 26)),
    (t.fillStyle = g),
    Fe(t, -s / 2, -l / 2, s, r, r * 0.45),
    t.fill(),
    (t.strokeStyle = "#fff6e0"),
    (t.lineWidth = 2.5),
    Fe(t, -s / 2, -l / 2, s, r, r * 0.45),
    t.stroke(),
    (t.fillStyle = p("#ffffff", 0.4)),
    Fe(t, -s / 2 + 4, -l / 2 + 2, s - 8, r * 0.35, r * 0.2),
    t.fill(),
    t.restore());
}
function bi(t, e, o, a, l, n) {
  const i = Math.sin(n * 2.2) * 0.22;
  (t.save(),
    t.translate(e, o - l / 2),
    (t.strokeStyle = "#8a6a3a"),
    (t.lineWidth = 3),
    t.beginPath(),
    t.moveTo(0, -l * 0.5),
    t.lineTo(0, 0),
    t.stroke(),
    t.rotate(i));
  const s = a * 0.8,
    r = l * 0.78,
    f = t.createLinearGradient(-s / 2, 0, s / 2, r);
  (f.addColorStop(0, "#f5d78a"),
    f.addColorStop(0.45, "#d9a441"),
    f.addColorStop(1, "#8a6420"),
    (t.fillStyle = f),
    t.beginPath(),
    t.moveTo(-s * 0.12, 0),
    t.lineTo(s * 0.12, 0),
    t.quadraticCurveTo(s * 0.5, r * 0.35, s * 0.5, r * 0.86),
    t.lineTo(-s * 0.5, r * 0.86),
    t.quadraticCurveTo(-s * 0.5, r * 0.35, -s * 0.12, 0),
    t.closePath(),
    t.fill(),
    (t.strokeStyle = "#6a4a14"),
    (t.lineWidth = 2),
    t.stroke(),
    (t.fillStyle = "#b8862c"),
    Fe(t, -s * 0.54, r * 0.84, s * 1.08, r * 0.14, 4),
    t.fill(),
    t.beginPath(),
    t.arc(0, r * 1.02, s * 0.11, 0, Math.PI * 2),
    (t.fillStyle = "#6a4a14"),
    t.fill(),
    (t.fillStyle = p("#ffffff", 0.4)),
    t.beginPath(),
    t.ellipse(-s * 0.18, r * 0.42, s * 0.09, r * 0.28, 0.15, 0, Math.PI * 2),
    t.fill(),
    t.restore());
}
function Fe(t, e, o, a, l, n) {
  (t.beginPath(),
    t.moveTo(e + n, o),
    t.arcTo(e + a, o, e + a, o + l, n),
    t.arcTo(e + a, o + l, e, o + l, n),
    t.arcTo(e, o + l, e, o, n),
    t.arcTo(e, o, e + a, o, n),
    t.closePath());
}
function Ti(t, e, o, a, l, n, i) {
  t.save();
  const s = Math.cos(i),
    r = Math.sin(i);
  t.globalAlpha = 0.3;
  const f = t.createLinearGradient(e - (s * a) / 2, o - (r * l) / 2, e + (s * a) / 2, o + (r * l) / 2);
  (f.addColorStop(0, p("#bdeeff", 0.08)),
    f.addColorStop(0.5, "#9fe4ff"),
    f.addColorStop(1, p("#bdeeff", 0.45)),
    (t.fillStyle = f),
    t.fillRect(e - a / 2, o - l / 2, a, l),
    (t.globalAlpha = 1),
    (t.strokeStyle = p("#8fd8ff", 0.5)),
    (t.lineWidth = 1.5),
    t.setLineDash([7, 7]),
    t.strokeRect(e - a / 2, o - l / 2, a, l),
    t.setLineDash([]),
    (t.lineCap = "round"));
  const h = Math.max(3, Math.round(l / 34)),
    d = Math.abs(s) > 0.5 ? a : l;
  for (let g = 0; g < h; g++) {
    const A = (g - (h - 1) / 2) * 30,
      S = ((n * 150 + g * 55) % d) - d / 2,
      R = e - r * A + s * S,
      G = o + s * A + r * S,
      C = 1 - Math.abs(S) / (d / 2);
    ((t.globalAlpha = 0.25 + C * 0.6),
      (t.strokeStyle = "#eaf9ff"),
      (t.lineWidth = 2.4),
      t.beginPath(),
      t.moveTo(R, G),
      t.lineTo(R + s * 20, G + r * 20),
      t.stroke(),
      t.beginPath(),
      t.moveTo(R + s * 20, G + r * 20),
      t.lineTo(R + s * 12 - r * 5, G + r * 12 + s * 5),
      t.moveTo(R + s * 20, G + r * 20),
      t.lineTo(R + s * 12 + r * 5, G + r * 12 - s * 5),
      t.stroke());
  }
  t.globalAlpha = 1;
  const y = Math.min(a, l) * 0.3;
  (t.translate(e, o),
    t.beginPath(),
    t.arc(0, 0, y + 5, 0, Math.PI * 2),
    (t.fillStyle = p("#2b3d4a", 0.85)),
    t.fill(),
    (t.strokeStyle = "#8fd8ff"),
    (t.lineWidth = 2.5),
    t.stroke(),
    t.rotate(n * 9));
  for (let g = 0; g < 3; g++)
    (t.rotate((Math.PI * 2) / 3),
      t.beginPath(),
      t.ellipse(y * 0.5, 0, y * 0.5, y * 0.22, 0, 0, Math.PI * 2),
      (t.fillStyle = "#cfe9f5"),
      t.fill());
  (t.beginPath(), t.arc(0, 0, y * 0.22, 0, Math.PI * 2), (t.fillStyle = v.tentGold), t.fill(), t.restore());
}
function Oi(t, e, o, a, l) {
  const n = a / 2;
  (t.save(), t.translate(e, o));
  const i = t.createRadialGradient(0, 0, n * 0.2, 0, 0, n * 1.5);
  (i.addColorStop(0, p("#c98bff", 0.55)),
    i.addColorStop(1, p("#c98bff", 0)),
    (t.fillStyle = i),
    t.beginPath(),
    t.arc(0, 0, n * 1.5, 0, Math.PI * 2),
    t.fill(),
    t.rotate(l * 2.2));
  for (let s = 0; s < 3; s++)
    (t.beginPath(),
      t.ellipse(0, 0, n * (1 - s * 0.22), n * (0.55 - s * 0.12), (s * Math.PI) / 3, 0, Math.PI * 2),
      (t.strokeStyle = p(s % 2 === 0 ? "#e0b3ff" : "#8b5cc7", 0.9)),
      (t.lineWidth = 3),
      t.stroke());
  (t.beginPath(), t.arc(0, 0, n * 0.32, 0, Math.PI * 2), (t.fillStyle = "#1a0a2e"), t.fill(), t.restore());
}
function Gi(t, e, o, a, l) {
  const n = a / 2,
    i = 0.5 + 0.5 * Math.sin(l * 4);
  (t.save(),
    t.translate(e, o),
    t.beginPath(),
    t.arc(0, 0, n + 4, 0, Math.PI * 2),
    (t.fillStyle = p("#ff6b8a", 0.25 + i * 0.2)),
    t.fill());
  const s = t.createRadialGradient(-n * 0.3, -n * 0.35, n * 0.1, 0, 0, n);
  (s.addColorStop(0, "#ffd0da"),
    s.addColorStop(0.55, "#ff5d7e"),
    s.addColorStop(1, "#a8213c"),
    t.beginPath(),
    t.arc(0, 0, n, 0, Math.PI * 2),
    (t.fillStyle = s),
    t.fill(),
    (t.strokeStyle = v.tentGold),
    (t.lineWidth = 3),
    t.stroke(),
    t.beginPath(),
    t.arc(0, 0, n * 0.42, 0, Math.PI * 2),
    (t.fillStyle = p("#fff6c4", 0.7 + i * 0.3)),
    t.fill(),
    t.restore());
}
function Ki(t, e, o, a, l, n) {
  (t.save(), t.beginPath());
  const i = e - a / 2,
    s = o - l / 2;
  (t.moveTo(i, s + l), t.lineTo(i, s + l * 0.4));
  const r = 4;
  for (let h = 0; h < r; h++) {
    const d = i + (a * h) / r;
    t.quadraticCurveTo(d + a / r / 2, s - 4 + Math.sin(n * 2 + h) * 3, d + a / r, s + l * 0.4);
  }
  (t.lineTo(i + a, s + l), t.closePath());
  const f = t.createLinearGradient(0, s, 0, s + l);
  (f.addColorStop(0, "#6ac46a"),
    f.addColorStop(1, "#2f6b32"),
    (t.fillStyle = f),
    t.fill(),
    (t.strokeStyle = p("#183a1a", 0.7)),
    (t.lineWidth = 2),
    t.stroke());
  for (let h = 0; h < 4; h++) {
    const d = i + a * (0.2 + h * 0.2),
      y = s + l * (0.6 + 0.2 * Math.sin(n * 1.6 + h));
    (t.beginPath(), t.arc(d, y, 3 + (h % 2), 0, Math.PI * 2), (t.fillStyle = p("#c9f5c9", 0.6)), t.fill());
  }
  t.restore();
}
function wi(t, e, o, a, l, n) {
  (t.save(), t.translate(e, o));
  const i = 0.5 + 0.5 * Math.sin(n * 3);
  (t.beginPath(), t.moveTo(0, -l / 2), t.lineTo(a / 2, l / 2), t.lineTo(-a / 2, l / 2), t.closePath());
  const s = t.createLinearGradient(0, -l / 2, 0, l / 2);
  (s.addColorStop(0, p("#ffffff", 0.9)),
    s.addColorStop(0.5, "#8fd8ff"),
    s.addColorStop(1, "#3a7fa8"),
    (t.fillStyle = s),
    t.fill(),
    (t.strokeStyle = p("#ffffff", 0.85)),
    (t.lineWidth = 2.5),
    t.stroke(),
    (t.strokeStyle = p("#ffe066", 0.4 + i * 0.4)),
    (t.lineWidth = 3),
    [-1, 1].forEach((r) => {
      (t.beginPath(), t.moveTo(0, -l * 0.1), t.lineTo(r * a * 0.55, -l * 0.75), t.stroke());
    }),
    t.restore());
}
function Vi(t, e, o, a, l, n, i) {
  (t.save(), t.translate(e, o));
  const s = 0.5 + 0.5 * Math.sin(n * 5);
  (t.rotate(i + Math.PI / 2),
    t.beginPath(),
    t.moveTo(0, -l / 2),
    t.lineTo(a / 2, l / 2),
    t.lineTo(-a / 2, l / 2),
    t.closePath());
  const r = t.createLinearGradient(0, -l / 2, 0, l / 2);
  (r.addColorStop(0, O(v.uiOrange, 24)),
    r.addColorStop(1, j(v.uiOrange, 34)),
    (t.fillStyle = r),
    t.fill(),
    (t.strokeStyle = v.tentGold),
    (t.lineWidth = 3),
    t.stroke(),
    t.beginPath(),
    t.moveTo(-a / 2 + 5, l / 2 - 6),
    t.lineTo(0, -l / 2 + 8),
    t.lineTo(a / 2 - 5, l / 2 - 6),
    (t.strokeStyle = p("#fff6c4", 0.5 + s * 0.5)),
    (t.lineWidth = 4),
    (t.lineCap = "round"),
    t.stroke(),
    [-a * 0.22, 0, a * 0.22].forEach((f, h) => {
      const d = 0.4 + 0.6 * Math.max(0, Math.sin(n * 6 + h));
      (t.beginPath(),
        t.arc(f, l / 2 - 12, 3.4, 0, Math.PI * 2),
        (t.fillStyle = p(v.bulbYellow, d)),
        t.fill());
    }),
    t.restore());
}
function Zi(t, e, o, a, l, n) {
  (t.save(), t.translate(e, o));
  const i = 0.5 + 0.5 * Math.sin(n * 4);
  ((t.fillStyle = "#2a2118"),
    Fe(t, -a / 2 - 3, l / 2 - 5, a + 6, 9, 3),
    t.fill(),
    Fe(t, -a / 2, -l / 2, a, l, 4));
  const s = t.createLinearGradient(0, -l / 2, 0, l / 2);
  (s.addColorStop(0, "#ffe9a0"),
    s.addColorStop(0.5, v.uiTeal),
    s.addColorStop(1, j(v.uiTeal, 38)),
    (t.fillStyle = s),
    t.fill(),
    (t.strokeStyle = p("#ffffff", 0.7)),
    (t.lineWidth = 2),
    t.stroke(),
    (t.fillStyle = p("#fff6c4", 0.45 + i * 0.45)),
    t.fillRect(-a / 2 + 5, -3, a - 10, 6),
    t.restore());
}
function Ei(t, e, o, a, l, n, i) {
  (t.save(), t.translate(e, o));
  const s = 0.5 + 0.5 * Math.sin(n * 3.5),
    r = i ? "#7fe0a0" : "#5a6a7a";
  if (
    (Fe(t, -a / 2, -l / 2, a, l, 8),
    (t.fillStyle = p(i ? "#2f6b4a" : "#20262e", 0.75)),
    t.fill(),
    (t.strokeStyle = p(r, i ? 0.95 : 0.5)),
    (t.lineWidth = 2.5),
    t.setLineDash(i ? [] : [6, 5]),
    t.stroke(),
    t.setLineDash([]),
    t.beginPath(),
    t.moveTo(0, -l * 0.28),
    t.lineTo(a * 0.22, l * 0.12),
    t.lineTo(-a * 0.22, l * 0.12),
    t.closePath(),
    (t.fillStyle = i ? p("#b6ffcf", 0.7 + s * 0.3) : p("#8fa0b0", 0.5)),
    t.fill(),
    i)
  ) {
    const f = t.createRadialGradient(0, 0, 2, 0, 0, a * 0.8);
    (f.addColorStop(0, p("#7fe0a0", 0.35 * s)),
      f.addColorStop(1, p("#7fe0a0", 0)),
      (t.fillStyle = f),
      t.beginPath(),
      t.arc(0, 0, a * 0.8, 0, Math.PI * 2),
      t.fill());
  }
  t.restore();
}
function Ii(t, e, o, a, l, n, i) {
  switch (e) {
    case "shield":
      mi(t, o, a, l, n, i.hpFraction);
      break;
    case "spinner":
      zi(t, o, a, l, n, i.angle);
      break;
    case "curtain":
      ji(t, o, a, l, n, i.time);
      break;
    case "bouncer":
      Ui(t, o, a, l, n, i.time);
      break;
    case "bell":
      bi(t, o, a, l, n, i.time);
      break;
    case "fan":
      Ti(t, o, a, l, n, i.time, i.windAngle ?? -Math.PI / 2);
      break;
    case "portal":
      Oi(t, o, a, l, i.time);
      break;
    case "bumper":
      Gi(t, o, a, l, i.time);
      break;
    case "sticky":
      Ki(t, o, a, l, n, i.time);
      break;
    case "splitter":
      wi(t, o, a, l, n, i.time);
      break;
    case "slingshot":
      Vi(t, o, a, l, n, i.time, i.windAngle ?? -Math.PI / 2);
      break;
    case "dropTarget":
      Zi(t, o, a, l, n, i.time);
      break;
    case "rollover":
      Ei(t, o, a, l, n, i.time, i.lit ?? !1);
      break;
    case "crate":
    default:
      Ri(t, o - l / 2, a - n / 2, l, n);
      break;
  }
}
const qi = 1.4,
  Wi = 1.15,
  Yi = 1.2,
  Ci = 30,
  Ni = 2400,
  Hi = 900,
  Bi = 18,
  Di = 0.02,
  Ji = 140,
  aa = 0.4,
  Xi = 0.5,
  la = 1250,
  Qi = 12,
  Fi = 45,
  Li = 250,
  xi = 15,
  _i = 4,
  $i = 0.14;
class es {
  constructor() {
    u(this, "obstacles", []);
    u(this, "time", 0);
    u(this, "kickScores", 0);
    u(this, "onDestroyed", null);
    u(this, "onBellRung", null);
    u(this, "onShieldHit", null);
    u(this, "onBounce", null);
    u(this, "onBumperHit", null);
    u(this, "onTeleport", null);
    u(this, "onStuck", null);
    u(this, "onSplit", null);
    u(this, "onSlingshot", null);
    u(this, "onDropTarget", null);
    u(this, "onDropBankComplete", null);
    u(this, "onRollover", null);
    u(this, "onLanesComplete", null);
  }
  resetFlight() {
    this.kickScores = 0;
  }
  canScoreKick() {
    return this.kickScores >= _i ? !1 : (this.kickScores++, !0);
  }
  load(e) {
    this.obstacles = e.map((o) => ({
      ...o,
      kind: o.kind ?? "crate",
      baseX: o.x,
      baseY: o.y,
      phase: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      hp: o.durability ?? 3,
      maxHp: o.durability ?? 3,
      destroyed: !1,
      hitCooldown: 0,
      lit: !1,
    }));
  }
  update(e) {
    this.time += e;
    for (const o of this.obstacles)
      if (!o.destroyed) {
        if ((o.hitCooldown > 0 && (o.hitCooldown = Math.max(0, o.hitCooldown - e)), o.moving)) {
          const a = this.time * o.moving.speed + o.phase;
          o.moving.axis === "x"
            ? (o.x = o.baseX + Math.sin(a) * o.moving.range)
            : (o.y = o.baseY + Math.sin(a) * o.moving.range);
        }
        o.kind === "spinner" && (o.angle += (o.spinSpeed ?? 2.2) * e);
      }
  }
  centerOf(e) {
    const o = J + (se - J) * e.x,
      a = x + (D - x) * e.y;
    return { px: o, py: a };
  }
  rectOf(e) {
    const { px: o, py: a } = this.centerOf(e);
    return { left: o - e.width / 2, right: o + e.width / 2, top: a - e.height / 2, bottom: a + e.height / 2 };
  }
  checkCollisions(e) {
    for (const o of this.obstacles) {
      if (o.destroyed) continue;
      const { px: a, py: l } = this.centerOf(o);
      if (o.kind === "rollover") {
        if (o.lit) continue;
        const y = this.rectOf(o);
        if (e.pos.x > y.left && e.pos.x < y.right && e.pos.y > y.top && e.pos.y < y.bottom) {
          ((o.lit = !0), z.play("coin"), this.onRollover?.(a, l, xi));
          const g = this.obstacles.filter((A) => A.kind === "rollover");
          g.length > 0 &&
            g.every((A) => A.lit) &&
            (z.play("bigwin"), g.forEach((A) => (A.lit = !1)), this.onLanesComplete?.());
        }
        continue;
      }
      if (o.kind === "slingshot") {
        if (o.hitCooldown > 0) continue;
        if (Wt(e.pos.x, e.pos.y, e.radius, this.rectOf(o))) {
          const g = o.kickAngle ?? -Math.PI / 2;
          ((e.vel.x = Math.cos(g) * la),
            (e.vel.y = Math.sin(g) * la),
            (e.pos.x += Math.cos(g) * (e.radius + 2)),
            (e.pos.y += Math.sin(g) * (e.radius + 2)),
            (o.hitCooldown = 0.22),
            z.play("combo"),
            this.canScoreKick() && this.onSlingshot?.(a, l, Qi));
        }
        continue;
      }
      if (o.kind === "dropTarget") {
        if (Wt(e.pos.x, e.pos.y, e.radius, this.rectOf(o))) {
          ((o.destroyed = !0),
            z.play("hitKuka"),
            this.onDropTarget?.(a, l, Fi),
            (e.vel.x *= 0.9),
            (e.vel.y *= 0.9));
          const g = this.obstacles.filter((A) => A.kind === "dropTarget");
          g.length > 0 &&
            g.every((A) => A.destroyed) &&
            (z.play("bigwin"), g.forEach((A) => (A.destroyed = !1)), this.onDropBankComplete?.(Li));
        }
        continue;
      }
      if (o.kind === "fan") {
        const y = this.rectOf(o);
        if (e.pos.x > y.left && e.pos.x < y.right && e.pos.y > y.top && e.pos.y < y.bottom) {
          const g = o.windAngle ?? -Math.PI / 2,
            A = (o.windForce ?? 900) / 60;
          ((e.vel.x += Math.cos(g) * A), (e.vel.y += Math.sin(g) * A));
        }
        continue;
      }
      if (o.kind === "sticky") {
        const y = this.rectOf(o);
        if (e.pos.x > y.left && e.pos.x < y.right && e.pos.y > y.top && e.pos.y < y.bottom) {
          const g = Math.pow(Di, 0.016666666666666666);
          ((e.vel.x *= g),
            (e.vel.y *= g),
            Math.hypot(e.vel.x, e.vel.y) < Ji &&
              e.state === "flying" &&
              ((e.vel.x = 0),
              (e.vel.y = 0),
              (e.state = "resting"),
              z.play("penalty"),
              this.onStuck?.(e.pos.x, e.pos.y)));
        }
        continue;
      }
      if (o.kind === "portal") {
        if (o.hitCooldown > 0) continue;
        if (Math.hypot(e.pos.x - a, e.pos.y - l) < o.width * 0.45) {
          const g = this.obstacles.find((A) => A.id === o.linkId && !A.destroyed);
          if (g) {
            const A = this.centerOf(g),
              S = e.pos.x,
              R = e.pos.y;
            ((e.pos.x = A.px),
              (e.pos.y = A.py),
              (o.hitCooldown = aa),
              (g.hitCooldown = aa),
              z.play("swoosh"),
              this.onTeleport?.(S, R, A.px, A.py));
          }
        }
        continue;
      }
      if (o.kind === "bumper") {
        const y = e.pos.x - a,
          g = e.pos.y - l,
          A = o.width / 2,
          S = Math.hypot(y, g);
        if (S < A + e.radius && o.hitCooldown <= 0) {
          const R = S > 0.001 ? y / S : 0,
            G = S > 0.001 ? g / S : -1;
          ((e.pos.x = a + R * (A + e.radius + 1)), (e.pos.y = l + G * (A + e.radius + 1)));
          const C = Math.hypot(e.vel.x, e.vel.y),
            te = Math.max(Hi, C * 1.1);
          ((e.vel.x = R * te),
            (e.vel.y = G * te),
            (o.hitCooldown = 0.2),
            z.play("combo"),
            this.canScoreKick() && this.onBumperHit?.(a, l, Bi));
        }
        continue;
      }
      if (o.kind === "curtain") {
        const y = this.rectOf(o);
        if (e.pos.x > y.left && e.pos.x < y.right && e.pos.y > y.top && e.pos.y < y.bottom) {
          const g = Math.pow($i, 0.016666666666666666);
          ((e.vel.x *= g), (e.vel.y *= g));
        }
        continue;
      }
      let n;
      if (
        (o.kind === "spinner"
          ? (n = li(e.pos.x, e.pos.y, e.radius, a, l, o.angle, o.width, o.height))
          : (n = Wt(e.pos.x, e.pos.y, e.radius, this.rectOf(o))),
        !n)
      )
        continue;
      const i = e.vel.x * n.x + e.vel.y * n.y,
        s = e.vel.x - 2 * i * n.x,
        r = e.vel.y - 2 * i * n.y;
      let f = s * at,
        h = r * at;
      if (o.hitCooldown <= 0)
        if (o.kind === "bouncer")
          if (e.type === "ice") ((o.hitCooldown = 0.18), z.play("wallThud"), this.onBounce?.(a, l));
          else {
            const y = Math.hypot(s, r) * qi,
              g = Math.min(y, Ni),
              A = Math.atan2(r, s);
            ((f = Math.cos(A) * g),
              (h = Math.sin(A) * g),
              (o.hitCooldown = 0.18),
              z.play("wallThud"),
              this.onBounce?.(a, l));
          }
        else if (o.kind === "spinner") {
          const y = o.spinSpeed ?? 2.2;
          ((f += -n.y * y * 60), (h += n.x * y * 60), (o.hitCooldown = 0.12), z.play("swoosh"));
        } else if (o.kind === "bell") {
          const y = Math.hypot(s, r) * Wi,
            A = Math.atan2(r, s) + (Math.random() - 0.5) * Yi;
          ((f = Math.cos(A) * y),
            (h = Math.sin(A) * y),
            (o.hitCooldown = 0.25),
            z.play("bonus"),
            this.canScoreKick() && this.onBellRung?.(a, l, Ci));
        } else
          o.kind === "splitter"
            ? ((o.hitCooldown = Xi), z.play("bonus"), this.onSplit?.(a, l, s, r))
            : o.kind === "shield"
              ? ((o.hitCooldown = 0.35),
                (o.hp -= e.type === "fire" ? o.hp : 1),
                z.play("hitKuka"),
                o.hp <= 0 ? ((o.destroyed = !0), this.onDestroyed?.(a, l, o.kind)) : this.onShieldHit?.(a, l))
              : (o.hitCooldown = 0.12);
      ((e.vel.x = f), (e.vel.y = h), (e.pos.x += n.x * 4), (e.pos.y += n.y * 4));
    }
  }
  render(e) {
    for (const o of this.obstacles) {
      if (o.destroyed) continue;
      const { px: a, py: l } = this.centerOf(o);
      Ii(e, o.kind, a, l, o.width, o.height, {
        angle: o.angle,
        hpFraction: o.maxHp > 0 ? o.hp / o.maxHp : 1,
        time: this.time,
        windAngle: o.windAngle ?? o.kickAngle,
        lit: o.lit,
      });
    }
  }
}
class ts {
  constructor() {
    u(this, "items", []);
  }
  spawn(e, o, a, l = {}) {
    this.items.push({
      lines: a,
      x: e,
      y: o,
      vy: l.vy ?? -60,
      life: l.life ?? 1.1,
      maxLife: l.life ?? 1.1,
      scale: 0,
    });
  }
  update(e) {
    for (let o = this.items.length - 1; o >= 0; o--) {
      const a = this.items[o];
      if (((a.life -= e), a.life <= 0)) {
        this.items.splice(o, 1);
        continue;
      }
      a.y += a.vy * e;
      const l = 1 - a.life / a.maxLife;
      a.scale = l < 0.2 ? l / 0.2 : 1;
    }
  }
  render(e) {
    for (const o of this.items) {
      const a = Math.min(1, o.life / (o.maxLife * 0.4));
      (e.save(), (e.globalAlpha = a), e.translate(o.x, o.y), e.scale(o.scale, o.scale));
      let l = 0;
      for (const n of o.lines)
        (P(e, n.text, 0, l, {
          size: n.size,
          color: n.color,
          outline: "rgba(30,10,45,0.85)",
          outlineWidth: 5,
        }),
          (l += n.size + 4));
      e.restore();
    }
  }
  clear() {
    this.items = [];
  }
}
class os {
  constructor() {
    u(this, "score", 0);
  }
  reset() {
    this.score = 0;
  }
  add(e, o) {
    const a = Math.round(e * o);
    return ((this.score += a), Re.emit("scoreChanged", { score: this.score, delta: a }), a);
  }
  subtract(e) {
    const o = Math.min(e, this.score);
    return ((this.score -= o), Re.emit("scoreChanged", { score: this.score, delta: -o }), o);
  }
  get value() {
    return this.score;
  }
}
const F = new os();
class as {
  constructor() {
    u(this, "hits", 0);
    u(this, "lastHitAt", 0);
  }
  reset() {
    ((this.hits = 0), (this.lastHitAt = 0), Re.emit("comboChanged", { hits: 0, multiplier: 1, label: null }));
  }
  currentTier() {
    let e = { hits: 0, multiplier: 1, label: null };
    for (const o of ll) this.hits >= o.hits && (e = o);
    return e;
  }
  registerHit() {
    const e = performance.now();
    (e - this.lastHitAt > Io && this.hits > 0 && (this.hits = 0), (this.hits += 1), (this.lastHitAt = e));
    const o = this.currentTier();
    return (
      Re.emit("comboChanged", { hits: this.hits, multiplier: o.multiplier, label: o.label }),
      o.label && z.play("combo"),
      o.multiplier
    );
  }
  registerMiss() {
    this.hits > 0 &&
      ((this.hits = 0),
      Re.emit("comboChanged", { hits: 0, multiplier: 1, label: null }),
      Re.emit("comboBroken", void 0));
  }
  checkTimeout() {
    this.hits > 0 && performance.now() - this.lastHitAt > Io && this.registerMiss();
  }
  get multiplier() {
    return this.currentTier().multiplier;
  }
  get hitCount() {
    return this.hits;
  }
}
const be = new as();
class ls {
  listItems() {
    return [
      ...Wo.balls.map((e) => ({ kind: "ball", ...e })),
      ...Wo.boosts.map((e) => ({ kind: "boost", ...e })),
    ];
  }
  isOwned(e) {
    return e.kind !== "ball" ? !1 : this.ownsBall(e.ballType);
  }
  ownsBall(e) {
    return e === "normal" || U.get().ownedBalls.includes(e);
  }
  get selectedBall() {
    const e = U.get().selectedBall ?? "normal";
    return this.ownsBall(e) ? e : "normal";
  }
  selectBall(e) {
    return this.ownsBall(e) ? (U.update((o) => (o.selectedBall = e)), !0) : !1;
  }
  get selectedSpec() {
    return Bt[this.selectedBall];
  }
  purchase(e) {
    return (e.kind === "ball" && this.isOwned(e)) || !K.spendCoins(e.price)
      ? !1
      : (e.kind === "ball"
          ? U.update((o) => {
              (o.ownedBalls.includes(e.ballType) || o.ownedBalls.push(e.ballType),
                (o.selectedBall = e.ballType));
            })
          : K.addShots(e.shots),
        !0);
  }
}
const ye = new ls();
class ns {
  constructor() {
    u(this, "lastAdAt", 0);
    u(this, "cooldownMs", 2e4);
  }
  get isReady() {
    return !0;
  }
  canShow() {
    return Date.now() - this.lastAdAt > this.cooldownMs;
  }
  async showRewarded(e) {
    if (!this.canShow()) return "unavailable";
    ((this.lastAdAt = Date.now()), z.play("swoosh"));
    const o = 1600,
      a = performance.now();
    return new Promise((l) => {
      const n = () => {
        const i = Math.min(1, (performance.now() - a) / o);
        (e?.(i), i < 1 ? requestAnimationFrame(n) : l("rewarded"));
      };
      requestAnimationFrame(n);
    });
  }
}
const nt = new ns();
function qe(t, e) {
  return W(t.x, t.y, e.x, e.y, e.w, e.h);
}
const eo = 20,
  na = 1.4,
  is = 2.2,
  ia = { red: "Kırmızı", yellow: "Sarı", blue: "Mavi", green: "Yeşil", bonus: "Mor" },
  ss = 0.045,
  rs = 80,
  fs = 70,
  H = class H {
    constructor() {
      u(this, "name", "game");
      u(this, "time", 0);
      u(this, "throwCtl", new ii());
      u(this, "holeCtl", new di());
      u(this, "kukaCtl", new Ai());
      u(this, "extraBalls", new Si());
      u(this, "obstacleCtl", new es());
      u(this, "particles", new St());
      u(this, "floatingText", new ts());
      u(this, "shotsLeft", 0);
      u(this, "flightHadHit", !1);
      u(this, "flightHits", 0);
      u(this, "goalProgress", 0);
      u(this, "bestChain", 0);
      u(this, "goalTimeLeft", 0);
      u(this, "forbiddenHits", 0);
      u(this, "goalMet", !1);
      u(this, "goalBriefTimer", 0);
      u(this, "modifiers", []);
      u(this, "effects", ea([]));
      u(this, "wheelTimer", 0);
      u(this, "wheelResult", "none");
      u(this, "wheelShowTimer", 0);
      u(this, "allKukasBonusGiven", !1);
      u(this, "laneMultiplier", 1);
      u(this, "levelEnded", !1);
      u(this, "won", !1);
      u(this, "endTimer", 0);
      u(this, "tutorialStep", 0);
      u(this, "watchingAd", !1);
      u(this, "adProgress", 0);
      u(
        this,
        "pauseButton",
        new Te({
          x: 18,
          y: 22,
          w: 60,
          h: 60,
          label: "",
          colorTop: v.uiPurple,
          colorBottom: v.uiPurpleDark,
          fontSize: 24,
          onClick: () => this.setPaused(!0),
        }),
      );
      u(
        this,
        "soundButton",
        new Te({
          x: c - 78,
          y: 22,
          w: 60,
          h: 60,
          label: "",
          colorTop: v.uiPurple,
          colorBottom: v.uiPurpleDark,
          fontSize: 24,
          onClick: () => {
            const e = !z.enabled;
            (z.setEnabled(e), U.update((o) => (o.soundOn = e)));
          },
        }),
      );
      u(
        this,
        "magnetButton",
        new Te({
          x: c - H.POWERUP_SIZE * 3 - 40,
          y: 1220,
          w: H.POWERUP_SIZE,
          h: H.POWERUP_SIZE,
          label: "",
          onClick: () => this.activateMagnet(),
          disabled: () =>
            this.levelEnded ||
            this.magnetArmed ||
            K.tickets < H.MAGNET_COST ||
            this.throwCtl.ball.state === "flying",
        }),
      );
      u(
        this,
        "bombButton",
        new Te({
          x: c - H.POWERUP_SIZE * 2 - 30,
          y: 1220,
          w: H.POWERUP_SIZE,
          h: H.POWERUP_SIZE,
          label: "",
          onClick: () => this.activateDouble(),
          disabled: () =>
            this.levelEnded ||
            this.doubleArmed ||
            K.tickets < H.DOUBLE_COST ||
            this.throwCtl.ball.state === "flying",
        }),
      );
      u(
        this,
        "extraShotButton",
        new Te({
          x: c - H.POWERUP_SIZE - 20,
          y: 1220,
          w: H.POWERUP_SIZE,
          h: H.POWERUP_SIZE,
          label: "",
          onClick: () => this.buyExtraShot(),
          disabled: () => this.levelEnded || K.tickets < H.EXTRA_SHOT_COST,
        }),
      );
      u(
        this,
        "ballPrevButton",
        new Te({
          x: c / 2 - 130,
          y: 1430,
          w: 60,
          h: 90,
          label: "",
          onClick: () => this.cycleBall(-1),
          disabled: () => this.throwCtl.ball.state !== "idle" || this.ownedBalls().length < 2,
        }),
      );
      u(
        this,
        "ballNextButton",
        new Te({
          x: c / 2 + 70,
          y: 1430,
          w: 60,
          h: 90,
          label: "",
          onClick: () => this.cycleBall(1),
          disabled: () => this.throwCtl.ball.state !== "idle" || this.ownedBalls().length < 2,
        }),
      );
      u(this, "launchFlash", 0);
      u(this, "launchDir", { x: 0, y: -1 });
      u(this, "shakeTimer", 0);
      u(this, "shakeIntensity", 0);
      u(this, "paused", !1);
      u(this, "dramaAmount", 0);
      u(this, "trailTimer", 0);
      u(this, "flightPath", []);
      u(this, "lastPath", []);
      u(this, "pathTimer", 0);
      u(this, "notifiedMissions", new Set());
      u(this, "notifiedAchievements", new Set());
      u(this, "earnedStars", 0);
      u(this, "starCoinBonus", 0);
      u(this, "doubleArmed", !1);
      u(this, "magnetArmed", !1);
      u(this, "powerUpFlash", 0);
      u(this, "ticketReward", 0);
      u(this, "gemReward", 0);
      u(this, "wonToy", null);
      ((this.throwCtl.ball.onHardWallHit = (e, o, a) => {
        ((this.shakeTimer = 0.28),
          (this.shakeIntensity = 8 + a * 14),
          this.particles.spawnBurst(e, o, 16 + Math.round(a * 20), {
            colors: ["#ffffff", v.tentGold, p("#ffffff", 0.6)],
            speed: [120, 420],
            size: [2, 5],
            life: [0.25, 0.5],
            spread: Math.PI * 1.4,
            angle: Math.PI / 2,
          }));
      }),
        (this.throwCtl.ball.onBounce = (e, o, a, l) => {
          const n = 4 + Math.round(a * 8),
            i = l === "floor" ? -Math.PI / 2 : e < c / 2 ? 0 : Math.PI;
          (this.particles.spawnBurst(e, o, n, {
            colors:
              l === "floor" ? ["#c9a06a", "#e8d9c0", p("#ffffff", 0.7)] : [p("#ffffff", 0.8), "#e8d9c0"],
            speed: [60, 120 + a * 220],
            size: [2, 4],
            life: [0.18, 0.38],
            angle: i,
            spread: 1.1,
            gravity: l === "floor" ? 260 : 160,
          }),
            a > 0.45 && this.shakeTimer <= 0 && ((this.shakeTimer = 0.08), (this.shakeIntensity = 2 + a * 4)),
            pe.play("bounce"));
        }),
        (this.obstacleCtl.onDestroyed = (e, o) => {
          (!this.levelEnded && this.goal.kind === "rescue" && (this.goalProgress++, this.checkWinThreshold()),
            z.play("knockdown"),
            this.particles.spawnBurst(e, o, 26, {
              colors: ["#8fd8ff", "#ffffff", "#c9d6de"],
              speed: [100, 380],
              size: [2, 6],
              life: [0.35, 0.75],
            }),
            this.floatingText.spawn(e, o, [{ text: "KALKAN KIRILDI!", color: "#8fd8ff", size: 18 }]));
        }),
        (this.obstacleCtl.onShieldHit = (e, o) => {
          this.particles.spawnBurst(e, o, 8, {
            colors: ["#8fd8ff", "#ffffff"],
            speed: [60, 180],
            size: [2, 4],
            life: [0.25, 0.5],
          });
        }),
        (this.obstacleCtl.onBounce = (e, o) => {
          ((this.shakeTimer = 0.16),
            (this.shakeIntensity = 6),
            this.particles.spawnBurst(e, o, 14, {
              colors: ["#ffe066", "#e63946", "#ffffff"],
              speed: [80, 260],
              size: [2, 5],
              life: [0.25, 0.5],
            }));
        }),
        (this.obstacleCtl.onBellRung = (e, o, a) => {
          if (this.levelEnded) return;
          this.flightHadHit = !0;
          const l = F.add(a, this.applyDoublePoints() * ye.selectedSpec.scoreMul);
          (ce.recordScore(l),
            this.particles.spawnBurst(e, o, 22, {
              colors: [v.tentGold, "#fff6c4", "#ffffff"],
              speed: [90, 300],
              size: [2, 6],
              life: [0.3, 0.7],
            }),
            this.floatingText.spawn(e, o, [
              { text: "ÇAN ÇALDI!", color: v.tentGold, size: 20 },
              { text: `+${l}`, color: "#ffffff", size: 26 },
            ]),
            this.checkWinThreshold());
        }),
        (this.obstacleCtl.onBumperHit = (e, o, a) => {
          if (this.levelEnded) return;
          const l = F.add(a, this.applyDoublePoints() * ye.selectedSpec.scoreMul);
          (ce.recordScore(l),
            (this.shakeTimer = 0.12),
            (this.shakeIntensity = 5),
            this.particles.spawnBurst(e, o, 18, {
              colors: ["#ff6b8a", "#fff6c4", "#ffffff"],
              speed: [120, 340],
              size: [2, 5],
              life: [0.25, 0.6],
            }),
            this.floatingText.spawn(e, o, [{ text: `+${l}`, color: "#ff9eb5", size: 22 }]),
            this.checkWinThreshold());
        }),
        (this.obstacleCtl.onTeleport = (e, o, a, l) => {
          (this.particles.spawnBurst(e, o, 16, {
            colors: ["#c98bff", "#e0b3ff", "#ffffff"],
            speed: [80, 240],
            size: [2, 5],
            life: [0.25, 0.55],
          }),
            this.particles.spawnBurst(a, l, 22, {
              colors: ["#c98bff", "#ffffff"],
              speed: [100, 300],
              size: [2, 6],
              life: [0.3, 0.6],
            }));
        }),
        (this.obstacleCtl.onStuck = (e, o) => {
          (this.particles.spawnBurst(e, o, 14, {
            colors: ["#6ac46a", "#2f6b32", "#c9f5c9"],
            speed: [40, 140],
            size: [2, 5],
            life: [0.3, 0.7],
          }),
            this.floatingText.spawn(e, o, [{ text: "YAPIŞTI!", color: "#8fe08f", size: 20 }]));
        }),
        (this.obstacleCtl.onSplit = (e, o, a, l) => {
          this.levelEnded ||
            (this.extraBalls.spawnSplit(e, o, a, l, this.throwCtl.ball.radius),
            this.particles.spawnBurst(e, o, 20, {
              colors: ["#8fd8ff", "#ffffff", v.tentGold],
              speed: [110, 300],
              size: [2, 6],
              life: [0.25, 0.6],
            }),
            this.floatingText.spawn(e, o, [{ text: "TOP BÖLÜNDÜ!", color: "#8fd8ff", size: 20 }]));
        }),
        (this.obstacleCtl.onSlingshot = (e, o, a) => {
          if (this.levelEnded) return;
          const l = F.add(a, this.applyDoublePoints() * this.laneMultiplier);
          (ce.recordScore(l),
            (this.shakeTimer = 0.14),
            (this.shakeIntensity = 6),
            pe.play("hit"),
            this.particles.spawnBurst(e, o, 16, {
              colors: [v.uiOrange, "#fff6c4", "#ffffff"],
              speed: [140, 380],
              size: [2, 5],
              life: [0.25, 0.55],
            }),
            this.floatingText.spawn(e, o, [{ text: `+${l}`, color: v.uiOrange, size: 20 }]),
            this.checkWinThreshold());
        }),
        (this.obstacleCtl.onDropTarget = (e, o, a) => {
          if (this.levelEnded) return;
          this.flightHadHit = !0;
          const l = F.add(a, this.applyDoublePoints() * this.laneMultiplier);
          (ce.recordScore(l),
            pe.play("knock"),
            this.particles.spawnBurst(e, o, 18, {
              colors: [v.uiTeal, "#ffe9a0", "#ffffff"],
              speed: [100, 300],
              size: [2, 5],
              life: [0.3, 0.6],
            }),
            this.floatingText.spawn(e, o, [{ text: `+${l}`, color: v.uiTeal, size: 22 }]),
            this.checkWinThreshold());
        }),
        (this.obstacleCtl.onDropBankComplete = (e) => {
          if (this.levelEnded) return;
          const o = F.add(e, this.laneMultiplier);
          (this.floatingText.spawn(c / 2, b * 0.44, [
            { text: "HEDEF BANKASI TAMAM!", color: v.uiTeal, size: 25 },
            { text: `+${o}`, color: "#ffffff", size: 30 },
          ]),
            this.particles.spawnBurst(c / 2, b * 0.5, 50, {
              colors: [v.uiTeal, "#ffffff", v.tentGold],
              speed: [140, 420],
              size: [3, 7],
              life: [0.5, 1.1],
            }),
            pe.play("score"),
            this.checkWinThreshold());
        }),
        (this.obstacleCtl.onRollover = (e, o, a) => {
          if (this.levelEnded) return;
          const l = F.add(a, this.laneMultiplier);
          (this.particles.spawnBurst(e, o, 10, {
            colors: ["#7fe0a0", "#ffffff"],
            speed: [60, 200],
            size: [2, 4],
            life: [0.2, 0.5],
          }),
            this.floatingText.spawn(e, o, [{ text: `+${l}`, color: "#7fe0a0", size: 18 }]));
        }),
        (this.obstacleCtl.onLanesComplete = () => {
          this.levelEnded ||
            ((this.laneMultiplier = Math.min(3, this.laneMultiplier + 1)),
            pe.play("score"),
            this.floatingText.spawn(c / 2, b * 0.4, [
              { text: "TÜM KORİDORLAR!", color: "#7fe0a0", size: 24 },
              { text: `PUAN ÇARPANI x${this.laneMultiplier}`, color: v.tentGold, size: 22 },
            ]),
            this.particles.spawnBurst(c / 2, b * 0.46, 44, {
              colors: ["#7fe0a0", "#b6ffcf", "#ffffff"],
              speed: [120, 380],
              size: [3, 6],
              life: [0.5, 1],
            }));
        }));
    }
    checkExtraBallTargets() {
      if (this.extraBalls.count === 0 || this.levelEnded) return;
      const e = this.extraBalls.positions();
      for (let o = e.length - 1; o >= 0; o--) {
        const a = e[o],
          l = { pos: { x: a.x, y: a.y }, radius: a.radius, vel: { x: 0, y: 0 } },
          n = this.holeCtl.checkCollisions(l);
        if (n.length) {
          (n.forEach((s) => this.resolveHoleHit(s)), this.extraBalls.consumeAt(o));
          continue;
        }
        const i = this.kukaCtl.checkCollisions(l);
        i.length && (i.forEach((s) => this.resolveKukaHit(s)), this.extraBalls.consumeAt(o));
      }
    }
    enter() {
      if (Z.mode !== "campaign" && Z.customLevel) {
        this.startCustomLevel(Z.customLevel);
        return;
      }
      const e = U.get(),
        o = Math.max(1, Math.min(E.totalLevels, e.highestUnlockedLevel || 1)),
        a = Math.max(1, Math.floor(e.currentLevel || 1));
      this.startLevel(Math.min(a, o));
    }
    exit() {}
    startLevel(e) {
      this.beginLevel(E.loadLevel(e));
    }
    startCustomLevel(e) {
      this.beginLevel(E.loadCustom(e));
    }
    beginLevel(e) {
      (this.holeCtl.load(e.holes),
        this.kukaCtl.load(e.kukas),
        this.extraBalls.clear(),
        this.obstacleCtl.load(e.obstacles),
        F.reset(),
        be.reset(),
        this.particles.clear(),
        this.floatingText.clear(),
        (this.shotsLeft = e.shots),
        (this.levelEnded = !1),
        (this.allKukasBonusGiven = !1),
        (this.laneMultiplier = 1),
        (this.paused = !1),
        (this.won = !1),
        (this.endTimer = 0),
        (this.tutorialStep = U.get().totalScore > 0 ? 3 : 0),
        (this.doubleArmed = !1),
        (this.magnetArmed = !1),
        (this.launchFlash = 0),
        (this.flightPath = []),
        (this.lastPath = []),
        (this.pathTimer = 0),
        (this.goalProgress = 0),
        (this.flightHits = 0),
        (this.bestChain = 0),
        (this.forbiddenHits = 0),
        (this.goalMet = !1),
        (this.goalTimeLeft = e.goal?.kind === "timed" ? (e.goal.seconds ?? 60) : 0),
        this.setupModifiers(e.id),
        (this.goalBriefTimer = e.goal && e.goal.kind !== "score" ? 2.6 : 0),
        (this.earnedStars = 0),
        (this.starCoinBonus = 0),
        (this.ticketReward = 0),
        (this.gemReward = 0),
        (this.wonToy = null),
        this.throwCtl.prepareNextBall(ye.selectedBall),
        (this.throwCtl.onSettled = () => this.onBallSettled()),
        this.applyBallRadius(),
        this.checkAchievementCompletions());
    }
    openToyReward() {
      this.wonToy && ((Z.pendingToy = this.wonToy), (Z.rewardReturnScene = "game"), V.goto("reward"));
    }
    restartLevel() {
      if (Z.mode !== "campaign" && Z.customLevel) {
        this.startCustomLevel(Z.customLevel);
        return;
      }
      this.startLevel(E.current.id);
    }
    goNextLevel() {
      if (Z.mode === "tour") {
        if (
          ((Z.tourScore += F.value),
          (Z.tourCarryShots = this.shotsLeft),
          Z.tourIndex++,
          Z.tourIndex >= Z.tourLevels.length)
        ) {
          this.finishTour();
          return;
        }
        ((Z.customLevel = Z.tourLevels[Z.tourIndex]),
          this.startCustomLevel(Z.customLevel),
          (this.shotsLeft += Z.tourCarryShots));
        return;
      }
      if (Z.mode === "daily") {
        (vt(), V.goto("mainMenu"));
        return;
      }
      const e = Math.min(E.totalLevels, E.current.id + 1);
      if (e === E.current.id) {
        V.goto("mainMenu");
        return;
      }
      this.startLevel(e);
    }
    finishTour() {
      const e = Z.tourScore,
        o = 200 + Math.round(e / 4);
      (K.addCoins(o),
        K.addTickets(2),
        U.update((a) => {
          a.bestTourScore = Math.max(a.bestTourScore ?? 0, e);
        }),
        vt(),
        V.goto("mainMenu"));
    }
    async watchAd() {
      if (this.watchingAd || !nt.canShow()) return;
      ((this.watchingAd = !0), (this.adProgress = 0));
      const e = await nt.showRewarded((o) => (this.adProgress = o));
      if (((this.watchingAd = !1), e === "rewarded")) {
        const o = this.adBonusShots();
        (K.addShots(o),
          (this.shotsLeft += o),
          this.goal.kind === "timed" && this.goalTimeLeft < eo && (this.goalTimeLeft = eo),
          (this.levelEnded = !1),
          this.throwCtl.prepareNextBall(ye.selectedBall));
      }
    }
    adBonusShots() {
      return this.goal.kind === "oneShot" ? 1 : 3;
    }
    onBallSettled() {
      if (
        ((this.magnetArmed = !1),
        this.flightPath.length > 1 && (this.lastPath = this.flightPath),
        (this.flightPath = []),
        !this.levelEnded)
      ) {
        if ((this.flightHadHit || be.registerMiss(), this.checkMissionCompletions(), this.shotsLeft <= 0)) {
          this.triggerLose();
          return;
        }
        this.throwCtl.prepareNextBall(ye.selectedBall);
      }
    }
    checkMissionCompletions() {
      for (const e of ce.list())
        e.done &&
          !e.claimed &&
          !this.notifiedMissions.has(e.def.id) &&
          (this.notifiedMissions.add(e.def.id),
          this.floatingText.spawn(c / 2, b * 0.42, [
            { text: "GÖREV TAMAMLANDI!", color: "#7fe0a0", size: 22 },
            { text: e.def.desc, color: "#ffffff", size: 16 },
          ]),
          z.play("unlock"));
    }
    checkAchievementCompletions() {
      for (const e of _e.list())
        e.done &&
          !e.claimed &&
          !this.notifiedAchievements.has(e.def.id) &&
          (this.notifiedAchievements.add(e.def.id),
          this.floatingText.spawn(c / 2, b * 0.38, [
            { text: `🏆 BAŞARIM: ${e.def.name}`, color: v.tentGold, size: 22 },
          ]),
          z.play("unlock"));
    }
    renderComboHeat(e) {
      const o = be.multiplier;
      if (o < 2 || this.throwCtl.ball.state !== "flying") return;
      const a = this.throwCtl.ball,
        l = Math.min(1, (o - 1) / 4),
        n = 0.5 + 0.5 * Math.sin(this.time * 12);
      e.save();
      const i = a.radius + 10 + l * 10 + n * 3,
        s = e.createRadialGradient(a.pos.x, a.pos.y, a.radius * 0.6, a.pos.x, a.pos.y, i);
      (s.addColorStop(0, p("#ffd24a", 0.05)),
        s.addColorStop(0.6, p("#ff8a3d", 0.35 + l * 0.3)),
        s.addColorStop(1, p("#ff4d2e", 0)),
        (e.fillStyle = s),
        e.beginPath(),
        e.arc(a.pos.x, a.pos.y, i, 0, Math.PI * 2),
        e.fill(),
        e.restore());
    }
    visualSling() {
      const e = Ze,
        o = this.throwCtl.aim.slingPoint,
        a = e.x + (o.x - e.x) * 0.58,
        l = Math.min((o.y - e.y) * 0.58, fs);
      return { x: a, y: e.y + l };
    }
    samplePath(e) {
      if (
        ((this.pathTimer -= e), this.pathTimer > 0 || ((this.pathTimer = ss), this.flightPath.length >= rs))
      )
        return;
      const o = this.throwCtl.ball.pos;
      this.flightPath.push({ x: o.x, y: o.y });
    }
    renderGhostPath(e) {
      if (!(this.lastPath.length < 2)) {
        e.save();
        for (let o = 0; o < this.lastPath.length; o++) {
          const a = this.lastPath[o],
            l = o / (this.lastPath.length - 1);
          ((e.globalAlpha = 0.34 * (1 - l * 0.6)),
            e.beginPath(),
            e.arc(a.x, a.y, 4.5 - l * 1.6, 0, Math.PI * 2),
            (e.fillStyle = v.uiCream),
            e.fill());
        }
        e.restore();
      }
    }
    spawnLaunchEffect(e, o) {
      const a = Ze;
      ((this.launchFlash = 1),
        (this.launchDir = { x: o.x, y: o.y }),
        (this.shakeTimer = 0.12),
        (this.shakeIntensity = 2 + e * 7),
        this.particles.spawnBurst(a.x, a.y, 14 + Math.round(e * 12), {
          colors: ["#e8d9c0", "#c9a06a", p("#ffffff", 0.9)],
          speed: [60, 150 + e * 180],
          size: [2, 5],
          life: [0.2, 0.45],
          gravity: 220,
        }),
        this.particles.spawnBurst(a.x, a.y, 10 + Math.round(e * 14), {
          colors: [v.tentGold, "#fff6c4", "#ffffff"],
          speed: [180 + e * 260, 420 + e * 520],
          size: [2, 4],
          life: [0.18, 0.4],
          angle: Math.atan2(o.y, o.x),
          spread: 0.5,
          gravity: 120,
        }));
    }
    renderLaunchStreak(e) {
      if (this.launchFlash <= 0.01) return;
      const o = Ze,
        a = this.launchFlash,
        l = 120 + 180 * (1 - a);
      (e.save(), (e.globalAlpha = a * 0.7));
      const n = e.createLinearGradient(o.x, o.y, o.x + this.launchDir.x * l, o.y + this.launchDir.y * l);
      (n.addColorStop(0, p("#ffffff", 0.9)),
        n.addColorStop(1, p(v.tentGold, 0)),
        (e.strokeStyle = n),
        (e.lineWidth = 10 * a),
        (e.lineCap = "round"),
        e.beginPath(),
        e.moveTo(o.x, o.y),
        e.lineTo(o.x + this.launchDir.x * l, o.y + this.launchDir.y * l),
        e.stroke(),
        e.beginPath(),
        e.arc(o.x, o.y, 18 + (1 - a) * 60, 0, Math.PI * 2),
        (e.strokeStyle = p("#fff6c4", a * 0.55)),
        (e.lineWidth = 4 * a),
        e.stroke(),
        e.restore());
    }
    renderBallWithDepth(e, o, a) {
      const l = this.throwCtl.ball,
        n = Math.max(0, Math.min(1, (a - x) / (Ze.y - x))),
        i = 0.62 + 0.38 * n,
        s = l.radius * i;
      e.save();
      const r = 10 + n * 8;
      (e.beginPath(),
        e.ellipse(o + r * 0.5, a + r, s * 0.92, s * 0.62, 0, 0, Math.PI * 2),
        (e.fillStyle = `rgba(0,0,0,${0.16 + n * 0.2})`),
        e.fill(),
        e.restore());
      const f = Math.hypot(l.vel.x, l.vel.y),
        h = l.state === "flying" ? Math.min(0.3, f / 6e3) : 0;
      if ((e.save(), h > 0.01)) {
        const d = Math.atan2(l.vel.y, l.vel.x);
        (e.translate(o, a), e.rotate(d), e.scale(1 + h, 1 - h * 0.65), e.rotate(-d), e.translate(-o, -a));
      }
      (Pt(e, o, a, s, l.type, l.spin), e.restore());
    }
    spawnBallTrail() {
      if (((this.trailTimer -= 1 / 60), this.trailTimer > 0)) return;
      this.trailTimer = 0.03;
      const e = this.throwCtl.ball,
        o = {
          normal: ["#ffffff", "#e8d9c0"],
          bonus: ["#ff9ee0", "#ffffff"],
          gold: ["#ffe066", "#fff6cc"],
          fire: ["#ff8a3d", "#ffd24a", "#ff4d2e"],
          ice: ["#bdeeff", "#ffffff", "#8fd8ff"],
        },
        a = be.multiplier >= 2;
      this.particles.spawnBurst(e.pos.x, e.pos.y, a ? 2 : 1, {
        colors: a ? ["#ffd24a", "#ff8a3d", "#ff4d2e"] : o[e.type],
        speed: [4, 18],
        size: [2, 4],
        life: [0.25, 0.4],
        gravity: 60,
      });
    }
    resolveKukaHit(e) {
      if (e.bossDamaged) {
        ((this.flightHadHit = !0), this.flightHits++);
        const n = F.add(e.score, this.applyDoublePoints());
        ((this.shakeTimer = 0.22),
          (this.shakeIntensity = 10),
          pe.play("hit"),
          this.particles.spawnBurst(e.x, e.y, 22, {
            colors: [v.kukaBonus, "#ffffff", v.tentGold],
            speed: [120, 340],
            size: [3, 6],
            life: [0.3, 0.7],
          }),
          this.floatingText.spawn(e.x, e.y, [
            { text: `PATRON! ${e.bossHpLeft} CAN`, color: v.kukaBonus, size: 22 },
            { text: `+${n}`, color: v.tentGold, size: 26 },
          ]),
          this.checkWinThreshold());
        return;
      }
      this.flightHadHit = !0;
      const o = be.registerHit(),
        a = o * this.applyDoublePoints() * ye.selectedSpec.scoreMul * this.laneMultiplier,
        l = F.add(e.score, a);
      if (
        (ce.recordScore(l),
        o >= 2 && ce.recordCombo(),
        this.checkMissionCompletions(),
        this.particles.spawnBurst(e.x, e.y, e.isBonus ? 34 : 20, {
          colors: e.isBonus ? [v.kukaBonus, "#ffffff", v.tentGold] : ["#ffffff", v.tentCream, v.tentGold],
          speed: [90, 260],
          size: [3, 6],
          life: [0.35, 0.8],
        }),
        pe.play("knock"),
        this.flightHits++,
        this.penalizeForbidden(e),
        this.bumpStats((n) => {
          (n.kukasKnocked++, (n.bestCombo = Math.max(n.bestCombo, be.hitCount)));
        }),
        this.floatingText.spawn(e.x, e.y, [
          { text: e.isBonus ? "BONUS KUKA!" : "KUKA!", color: e.isBonus ? v.kukaBonus : "#ffffff", size: 20 },
          { text: `+${l}`, color: v.tentGold, size: 28 },
        ]),
        this.kukaCtl.allKnocked() && !this.allKukasBonusGiven)
      ) {
        this.allKukasBonusGiven = !0;
        const n = F.add(this.kukaCtl.totalScore(), 1);
        (z.play("bigwin"),
          this.floatingText.spawn(c / 2, b * 0.46, [
            { text: "TÜM KUKALAR DEVRİLDİ!", color: v.tentGold, size: 26 },
            { text: `+${n}`, color: "#ffffff", size: 30 },
          ]),
          this.particles.spawnBurst(c / 2, b * 0.5, 60, {
            colors: [v.tentGold, "#ffffff", v.uiPink],
            speed: [140, 420],
            size: [3, 8],
            life: [0.6, 1.2],
          }));
      }
      this.checkWinThreshold();
    }
    resolveHoleHit(e) {
      ((this.flightHadHit = !0), this.flightHits++);
      const o = be.registerHit(),
        a = e.swish ? 1.5 : 1,
        l = e.sequenceBonus ? 2 : 1,
        n = o * this.applyDoublePoints() * ye.selectedSpec.scoreMul * a * l * this.laneMultiplier,
        i = F.add(e.score, n);
      (ce.recordHoleHit(),
        ce.recordScore(i),
        o >= 2 && ce.recordCombo(),
        this.checkMissionCompletions(),
        z.play("bonus"),
        this.particles.spawnBurst(e.x, e.y, 30, {
          colors: [e.ringColor, "#fff6c4", v.tentGold],
          speed: [110, 340],
          size: [3, 7],
          life: [0.4, 0.9],
        }));
      const s = [
        { text: e.swish ? "TAM İSABET!" : "İSABET!", color: e.swish ? v.tentGold : e.ringColor, size: 22 },
        { text: `+${i}`, color: "#ffffff", size: 32 },
      ];
      if (
        (e.sequenceBonus &&
          s.push({
            text: e.sequenceComplete ? "SIRA TAMAM! x2" : "DOĞRU SIRA! x2",
            color: "#7fe0a0",
            size: 19,
          }),
        n > 1)
      ) {
        const r = Number.isInteger(n) ? String(n) : n.toFixed(1);
        s.push({ text: `x${r} PUAN`, color: v.uiPink, size: 20 });
      }
      if (
        (this.floatingText.spawn(e.x, e.y, s),
        pe.play(e.swish ? "score" : "hit"),
        this.bumpStats((r) => {
          (r.holesHit++, e.swish && r.perfectShots++, (r.bestCombo = Math.max(r.bestCombo, be.hitCount)));
        }),
        e.swish &&
          (z.play("combo"),
          this.particles.spawnBurst(e.x, e.y, 26, {
            colors: [v.tentGold, "#fff6c4", "#ffffff"],
            speed: [140, 400],
            size: [2, 6],
            life: [0.4, 0.9],
          })),
        e.sequenceComplete)
      ) {
        (this.goalProgress++, z.play("bigwin"));
        const r = F.add(300, 1);
        this.floatingText.spawn(c / 2, b * 0.42, [
          { text: "SIRALI HEDEF TAMAM!", color: "#7fe0a0", size: 26 },
          { text: `+${r}`, color: "#ffffff", size: 30 },
        ]);
      }
      this.checkWinThreshold();
    }
    renderDarkness(e) {
      const o = this.effects.darkness;
      if (o <= 0) return;
      const a = this.throwCtl.ball.pos;
      e.save();
      const l = e.createRadialGradient(a.x, a.y, 80, a.x, a.y, 620);
      (l.addColorStop(0, "rgba(6,3,14,0)"),
        l.addColorStop(1, `rgba(6,3,14,${o})`),
        (e.fillStyle = l),
        e.fillRect(0, 0, c, b),
        e.restore());
    }
    renderModifierBadges(e) {
      if (this.modifiers.length === 0) return;
      const o = 150,
        a = 40,
        l = c - o - 14;
      let n = 470;
      for (const i of this.modifiers) {
        const s = _t[i];
        (e.save(),
          m(e, l, n, o, a, 12),
          (e.fillStyle = "rgba(16,8,30,0.82)"),
          e.fill(),
          (e.strokeStyle = s.boon ? v.uiSuccess : v.uiOrange),
          (e.lineWidth = 2),
          e.stroke(),
          P(e, s.icon, l + 22, n + a / 2, { size: 20, shadow: !1 }),
          P(e, s.label, l + 40, n + a / 2 + 1, {
            size: 14,
            color: s.boon ? v.uiSuccess : v.uiOrange,
            weight: 800,
            align: "left",
          }),
          e.restore(),
          (n += a + 8));
      }
    }
    renderWheel(e) {
      const o = this.wheelTimer > 0;
      if (!o && this.wheelShowTimer <= 0) return;
      const a = c / 2,
        l = 760,
        n = 132,
        i = lt.length;
      (e.save(),
        (e.globalAlpha = o ? 1 : Math.min(1, this.wheelShowTimer / 0.5)),
        (e.fillStyle = "rgba(8,4,18,0.55)"),
        e.fillRect(0, 0, c, b),
        P(e, "PANAYIR ÇARKI", a, l - n - 54, { size: 26, color: v.tentGold, weight: 900 }));
      const s = o ? 1 - this.wheelTimer / na : 1,
        r = 1 - Math.pow(1 - s, 3),
        f = lt.indexOf(this.wheelResult),
        h = (Math.PI * 2) / i,
        d = r * (Math.PI * 2 * 3) + (-Math.PI / 2 - f * h - h / 2) * r;
      (e.save(), e.translate(a, l), e.rotate(d));
      for (let y = 0; y < i; y++) {
        const g = _t[lt[y]],
          A = y * h;
        (e.beginPath(),
          e.moveTo(0, 0),
          e.arc(0, 0, n, A, A + h),
          e.closePath(),
          (e.fillStyle = y % 2 === 0 ? "#5b2a86" : "#3c1a5c"),
          e.fill(),
          (e.strokeStyle = p(v.tentGold, 0.8)),
          (e.lineWidth = 2),
          e.stroke(),
          e.save(),
          e.rotate(A + h / 2),
          P(e, g.icon, n * 0.62, 0, { size: 26, shadow: !1 }),
          e.restore());
      }
      if (
        (e.restore(),
        e.beginPath(),
        e.arc(a, l, 26, 0, Math.PI * 2),
        (e.fillStyle = v.tentGold),
        e.fill(),
        e.beginPath(),
        e.moveTo(a - 14, l - n - 6),
        e.lineTo(a + 14, l - n - 6),
        e.lineTo(a, l - n + 22),
        e.closePath(),
        (e.fillStyle = v.uiDanger),
        e.fill(),
        !o)
      ) {
        const y = _t[this.wheelResult];
        (P(e, y.label, a, l + n + 48, { size: 28, color: y.boon ? v.uiSuccess : v.uiOrange, weight: 900 }),
          P(e, y.desc, a, l + n + 82, { size: 17, color: p(v.uiCream, 0.9), weight: 700 }));
      }
      e.restore();
    }
    renderGoalBrief(e) {
      if (this.goalBriefTimer <= 0) return;
      const o = Math.min(1, this.goalBriefTimer / 0.4);
      (e.save(), (e.globalAlpha = o));
      const a = 560,
        l = 92,
        n = c / 2 - a / 2,
        i = 1112;
      (m(e, n, i, a, l, 20),
        (e.fillStyle = "rgba(20,10,34,0.9)"),
        e.fill(),
        (e.strokeStyle = v.tentGold),
        (e.lineWidth = 3),
        e.stroke(),
        P(e, "BÖLÜM HEDEFİ", c / 2, i + 30, { size: 15, color: p(v.uiCream, 0.75), weight: 800 }),
        P(e, this.goalBrief(), c / 2, i + 64, { size: 24, color: v.tentGold, weight: 900 }),
        e.restore());
    }
    setupModifiers(e) {
      const o = si(e);
      this.wheelResult = ri();
      const a = e > 3;
      ((this.wheelTimer = a ? na : 0),
        (this.wheelShowTimer = 0),
        (this.modifiers = o === "none" ? [] : [o]),
        a || (this.wheelResult = "none"),
        this.applyModifiers());
    }
    applyModifiers() {
      this.effects = ea(this.modifiers);
      const e = this.throwCtl.ball;
      ((e.gravityMul = this.effects.gravityMul), (e.bounceMul = this.effects.bounceMul));
      const o = E.current.id % 2 === 0 ? 1 : -1;
      e.wind = this.effects.wind * o;
    }
    settleWheel() {
      (this.wheelResult !== "none" &&
        (this.modifiers.push(this.wheelResult),
        this.effectsPendingShots(this.wheelResult) && (this.shotsLeft += 2)),
        this.applyModifiers(),
        (this.wheelShowTimer = is),
        z.play("reward"));
    }
    effectsPendingShots(e) {
      return e === "extraShots";
    }
    applyBallRadius() {
      const e = this.throwCtl.ball;
      e.radius = Math.round(Mo * this.effects.ballRadiusMul);
    }
    get goal() {
      return E.current.goal ?? { kind: "score" };
    }
    get scoreReached() {
      return F.value >= E.current.targetScore;
    }
    checkWinThreshold() {
      if (this.levelEnded) return;
      const e = this.goal;
      switch (e.kind) {
        case "clearAll":
          this.kukaCtl.allKnocked() && this.completeGoal();
          break;
        case "sequence":
          this.goalProgress >= (e.rounds ?? 1) && this.completeGoal();
          break;
        case "chain":
          ((this.bestChain = Math.max(this.bestChain, this.flightHits)),
            this.flightHits >= (e.chain ?? 3) && this.completeGoal());
          break;
        case "rescue":
          this.goalProgress >= (e.locks ?? 2) && this.completeGoal();
          break;
        default:
          this.scoreReached && this.completeGoal();
          break;
      }
    }
    penalizeForbidden(e) {
      const o = this.goal;
      if (o.kind !== "forbidden" || e.color !== o.avoid) return;
      (this.forbiddenHits++, (this.shotsLeft = Math.max(0, this.shotsLeft - 1)));
      const a = F.subtract(Math.round(E.current.targetScore * 0.15));
      (z.play("penalty"),
        pe.play("fail"),
        (this.shakeTimer = 0.26),
        (this.shakeIntensity = 12),
        this.floatingText.spawn(e.x, e.y, [
          { text: "YASAKLI RENK!", color: v.uiDanger, size: 24 },
          { text: `-${a} · -1 ATIŞ`, color: "#ffffff", size: 22 },
        ]));
    }
    completeGoal() {
      ((this.goalMet = !0), this.triggerWin());
    }
    goalTitle() {
      switch (this.goal.kind) {
        case "clearAll":
          return "KUKALAR";
        case "sequence":
          return "SIRA";
        case "chain":
          return "ZİNCİR";
        case "rescue":
          return "KİLİT";
        case "oneShot":
          return "TEK ATIŞ";
        case "forbidden":
          return "YASAK";
        case "timed":
          return "SÜRE";
        default:
          return "HEDEF";
      }
    }
    goalStatus() {
      const e = this.goal;
      switch (e.kind) {
        case "clearAll": {
          const o = this.kukaCtl.total();
          return { text: `${o - this.kukaCtl.remaining()}/${o}`, done: this.kukaCtl.allKnocked() };
        }
        case "sequence": {
          const o = e.rounds ?? 1;
          return { text: `${this.goalProgress}/${o}`, done: this.goalProgress >= o };
        }
        case "chain": {
          const o = e.chain ?? 3;
          return { text: `${this.flightHits}/${o}`, done: this.flightHits >= o };
        }
        case "rescue": {
          const o = e.locks ?? 2;
          return { text: `${this.goalProgress}/${o}`, done: this.goalProgress >= o };
        }
        case "timed":
          return { text: `${Math.max(0, Math.ceil(this.goalTimeLeft))} sn`, done: this.scoreReached };
        case "forbidden": {
          const o = ia[e.avoid ?? "red"];
          return {
            text: this.forbiddenHits > 0 ? `${o} ✕${this.forbiddenHits}` : o,
            done: this.scoreReached,
          };
        }
        default:
          return { text: `${F.value}/${E.current.targetScore}`, done: this.scoreReached };
      }
    }
    loseSummary() {
      const e = this.goal,
        o = E.current.targetScore,
        a = Math.min(1, F.value / Math.max(1, o)),
        l = `${F.value} / ${o}`;
      switch (e.kind) {
        case "timed":
          return { title: "SÜRE DOLDU", reason: "Süre bitmeden hedef puana ulaşamadın.", value: l, frac: a };
        case "clearAll": {
          const n = this.kukaCtl.total(),
            i = n - this.kukaCtl.remaining();
          return {
            title: "TOPLAR BİTTİ",
            reason: "Tüm kukaları deviremedin.",
            value: `${i} / ${n} kuka`,
            frac: i / Math.max(1, n),
          };
        }
        case "sequence": {
          const n = e.rounds ?? 1;
          return {
            title: "TOPLAR BİTTİ",
            reason: "Hedefleri sırayla vuramadın.",
            value: `${this.goalProgress} / ${n} tur`,
            frac: this.goalProgress / n,
          };
        }
        case "chain": {
          const n = e.chain ?? 3;
          return {
            title: "TOPLAR BİTTİ",
            reason: `Tek atışta ${n} hedefe değemedin.`,
            value: `En iyi zincir: ${this.bestChain} / ${n}`,
            frac: this.bestChain / n,
          };
        }
        case "rescue": {
          const n = e.locks ?? 2;
          return {
            title: "TOPLAR BİTTİ",
            reason: "Tüm kilitleri kıramadın.",
            value: `${this.goalProgress} / ${n} kilit`,
            frac: this.goalProgress / n,
          };
        }
        case "forbidden":
          return {
            title: "TOPLAR BİTTİ",
            reason: "Hedef puana ulaşamadın.",
            value: l,
            frac: a,
            note: this.forbiddenHits > 0 ? `Yasaklı renge ${this.forbiddenHits} kez dokundun` : void 0,
          };
        case "oneShot":
          return { title: "TEK ATIŞ BİTTİ", reason: "Tek topla hedefe ulaşamadın.", value: l, frac: a };
        default:
          return { title: "TOPLAR BİTTİ", reason: "Hedef puana ulaşamadın.", value: l, frac: a };
      }
    }
    goalDoneText() {
      const e = this.goal;
      switch (e.kind) {
        case "clearAll":
          return "Tüm kukalar devrildi";
        case "sequence":
          return "Hedefler sırayla vuruldu";
        case "chain":
          return `Tek atışta ${e.chain ?? 3} hedefe değildi`;
        case "rescue":
          return "Kilitler kırıldı, oyuncak kurtarıldı";
        case "oneShot":
          return "Tek topla hedefe ulaşıldı";
        case "forbidden":
          return this.forbiddenHits === 0 ? "Yasaklı renge hiç dokunulmadı" : "Hedef puana ulaşıldı";
        case "timed":
          return `${Math.ceil(this.goalTimeLeft)} saniye kala hedefe ulaşıldı`;
        default:
          return "Hedef puana ulaşıldı";
      }
    }
    goalBrief() {
      const e = this.goal;
      switch (e.kind) {
        case "clearAll":
          return "TÜM KUKALARI DEVİR!";
        case "sequence":
          return "HEDEFLERİ SIRAYLA VUR!";
        case "chain":
          return `TEK ATIŞTA ${e.chain ?? 3} HEDEFE DEĞ!`;
        case "rescue":
          return "KİLİTLERİ KIR, OYUNCAĞI KURTAR!";
        case "oneShot":
          return "TEK TOPLA HEDEFE ULAŞ!";
        case "forbidden":
          return `${ia[e.avoid ?? "red"].toUpperCase()} KUKAYA DOKUNMA!`;
        case "timed":
          return `${e.seconds ?? 60} SANİYEDE HEDEFE ULAŞ!`;
        default:
          return "HEDEF PUANA ULAŞ!";
      }
    }
    computeStars() {
      const e = E.current.targetScore,
        o = F.value,
        a = this.goal.kind;
      return a === "score" || a === "oneShot" || a === "forbidden" || a === "timed"
        ? o >= e
          ? 3
          : o >= e * 0.7
            ? 2
            : 1
        : this.goalMet
          ? o >= e
            ? 3
            : 2
          : 1;
    }
    triggerWin() {
      if (
        (pe.play("win"),
        (this.levelEnded = !0),
        (this.won = !0),
        (this.endTimer = 0),
        (this.earnedStars = this.computeStars()),
        ce.recordLevelComplete(),
        z.play("bigwin"),
        this.particles.spawnConfetti(c / 2, b * 0.4, 70),
        this.floatingText.spawn(c / 2, b * 0.32, [{ text: "JACKPOT!", color: v.tentGold, size: 44 }], {
          life: 1.6,
        }),
        E.completeLevel(!0),
        Z.mode === "daily")
      ) {
        const n = qa();
        U.update((i) => {
          const s = i.lastDailyChallenge === n;
          ((i.lastDailyChallenge = n),
            (i.dailyChallengeScore = s ? Math.max(i.dailyChallengeScore ?? 0, F.value) : F.value));
        });
      }
      this.bumpStats((n) => {
        (n.levelsWon++, (n.bestScore = Math.max(n.bestScore, F.value)));
      });
      const e = Lo(E.current);
      this.starCoinBonus = Math.round(e * 0.25 * (this.earnedStars - 1));
      const o = E.current.id,
        a = this.earnedStars,
        l = U.get().levelStars?.[o] ?? 0;
      ((this.ticketReward = a === 3 && l < 3 ? 1 : 0),
        (this.wonToy = E.current.bigReward && l === 0 ? kt.awardForLevel(o) : null),
        (this.gemReward = E.current.bigReward && l === 0 ? 3 : 0),
        U.update((n) => {
          ((n.totalScore += F.value),
            (n.currentLevel = Math.min(E.totalLevels, E.current.id + 1)),
            (n.coins += e + this.starCoinBonus),
            (n.tickets += this.ticketReward),
            (n.gems += this.gemReward),
            n.levelStars || (n.levelStars = {}),
            (n.levelStars[o] ?? 0) < a && (n.levelStars[o] = a));
        }));
    }
    activateMagnet() {
      this.levelEnded ||
        this.magnetArmed ||
        K.tickets < H.MAGNET_COST ||
        (K.addTickets(-2),
        (this.magnetArmed = !0),
        z.play("unlock"),
        pe.play("score"),
        this.floatingText.spawn(c / 2, b * 0.62, [
          { text: "MIKNATIS ATIŞ!", color: "#7ae0ff", size: 24 },
          { text: "Delikler topu çekecek", color: "#ffffff", size: 16 },
        ]));
    }
    activateDouble() {
      this.levelEnded ||
        this.doubleArmed ||
        K.tickets < H.DOUBLE_COST ||
        (K.addTickets(-2),
        (this.doubleArmed = !0),
        (this.powerUpFlash = 1),
        z.play("unlock"),
        this.floatingText.spawn(c / 2, b - 400, [
          { text: "✨ ÇİFT PUAN HAZIR!", color: v.uiPink, size: 26 },
        ]));
    }
    buyExtraShot() {
      this.levelEnded ||
        K.tickets < H.EXTRA_SHOT_COST ||
        (K.addTickets(-1),
        (this.shotsLeft += 1),
        (this.powerUpFlash = 1),
        z.play("coin"),
        this.floatingText.spawn(c / 2, b - 400, [{ text: "+1 ATIŞ", color: v.uiSuccess, size: 28 }]));
    }
    ownedBalls() {
      return jo.filter((e) => ye.ownsBall(e));
    }
    cycleBall(e) {
      const o = this.ownedBalls();
      if (o.length < 2) return;
      const a = o.indexOf(ye.selectedBall),
        l = o[(a + e + o.length) % o.length];
      (ye.selectBall(l), this.throwCtl.prepareNextBall(l), z.play("button"));
    }
    applyDoublePoints() {
      const e = this.effects.scoreMul;
      return this.doubleArmed ? ((this.doubleArmed = !1), (this.powerUpFlash = 1), 2 * e) : e;
    }
    triggerLose() {
      (pe.play("fail"), (this.levelEnded = !0), (this.won = !1));
    }
    update(e) {
      if (this.paused) {
        this.time += e;
        return;
      }
      const o = this.throwCtl.ball.state === "flying",
        a = !this.levelEnded && o && this.shotsLeft === 0 && this.throwCtl.ball.vel.y < 0,
        l = a ? 1 : 0;
      this.dramaAmount += (l - this.dramaAmount) * Math.min(1, e * (a ? 7 : 4));
      const n = 1 - this.dramaAmount * 0.45;
      ((e *= n),
        (this.time += e),
        this.throwCtl.update(e),
        this.holeCtl.update(e),
        this.kukaCtl.update(e),
        this.extraBalls.update(e),
        this.checkExtraBallTargets(),
        this.obstacleCtl.update(e),
        this.particles.update(e),
        this.floatingText.update(e),
        be.checkTimeout(),
        this.shakeTimer > 0 && (this.shakeTimer = Math.max(0, this.shakeTimer - e)),
        this.powerUpFlash > 0 && (this.powerUpFlash = Math.max(0, this.powerUpFlash - e * 2)),
        this.launchFlash > 0 && (this.launchFlash = Math.max(0, this.launchFlash - e * 3.2)),
        !this.levelEnded &&
          this.throwCtl.ball.state === "flying" &&
          (this.holeCtl.applyFields(this.throwCtl.ball, e),
          this.magnetArmed && this.holeCtl.applyGlobalPull(this.throwCtl.ball, e, H.MAGNET_PULL),
          this.obstacleCtl.checkCollisions(this.throwCtl.ball),
          this.holeCtl.checkCollisions(this.throwCtl.ball).forEach((r) => this.resolveHoleHit(r)),
          this.kukaCtl.checkCollisions(this.throwCtl.ball).forEach((r) => this.resolveKukaHit(r)),
          this.spawnBallTrail(),
          this.samplePath(e)),
        this.goalBriefTimer > 0 && (this.goalBriefTimer -= e),
        this.wheelTimer > 0 && ((this.wheelTimer -= e), this.wheelTimer <= 0 && this.settleWheel()),
        this.wheelShowTimer > 0 && (this.wheelShowTimer -= e),
        !this.levelEnded &&
          this.goal.kind === "timed" &&
          ((this.goalTimeLeft = Math.max(0, this.goalTimeLeft - e)),
          this.goalTimeLeft <= 0 && this.triggerLose()),
        this.levelEnded && this.won && (this.endTimer += e));
    }
    render(e) {
      if ((e.save(), this.shakeTimer > 0)) {
        const l = this.shakeTimer / 0.28,
          n = this.shakeIntensity * l;
        e.translate((Math.random() - 0.5) * n, (Math.random() - 0.5) * n);
      }
      if (this.dramaAmount > 0.01) {
        const l = 1 + this.dramaAmount * 0.1,
          n = this.throwCtl.ball.pos,
          i = c / 2 + (n.x - c / 2) * 0.6,
          s = b * 0.42 + (n.y - b * 0.42) * 0.6;
        (e.translate(i, s), e.scale(l, l), e.translate(-i, -s));
      }
      (this.renderStandInterior(e),
        this.holeCtl.render(e),
        this.kukaCtl.render(e),
        this.obstacleCtl.render(e));
      const o = this.throwCtl.ball,
        a = this.throwCtl.aim.active;
      if (
        (this.renderComboHeat(e),
        this.renderLaunchStreak(e),
        a || this.renderBallWithDepth(e, o.pos.x, o.pos.y),
        this.extraBalls.render(e, this.throwCtl.ball.type),
        this.particles.render(e),
        this.floatingText.render(e),
        this.renderDarkness(e),
        za(e, c, b),
        this.renderHud(e),
        !this.levelEnded && (this.renderPowerups(e), this.doubleArmed))
      ) {
        const l = this.throwCtl.ball;
        (e.save(),
          (e.strokeStyle = p(v.uiPink, 0.5 + 0.5 * Math.sin(this.time * 8))),
          (e.lineWidth = 3),
          e.beginPath(),
          e.arc(l.pos.x, l.pos.y, l.radius + 12, 0, Math.PI * 2),
          e.stroke(),
          e.restore());
      }
      if ((this.levelEnded || this.renderBottomBar(e), a && !this.levelEnded)) {
        (this.renderGhostPath(e), this.renderAimGuides(e));
        const l = this.visualSling();
        this.renderBallWithDepth(e, l.x, l.y);
      }
      (!this.levelEnded && !this.paused && this.renderTutorial(e),
        !this.levelEnded && !this.paused && this.renderGoalBrief(e),
        this.levelEnded || this.renderModifierBadges(e),
        this.paused || this.renderWheel(e),
        this.levelEnded && !this.won && this.renderLoseOverlay(e),
        this.levelEnded && this.won && this.renderWinOverlay(e),
        this.paused && this.renderPauseOverlay(e),
        e.restore());
    }
    renderStandInterior(e) {
      const o = Oe.get("bg_stand");
      if (o && o.naturalWidth) {
        e.save();
        const s = o.naturalWidth,
          r = o.naturalHeight,
          f = r * 0.665,
          h = f * (c / D),
          d = s * 0.137,
          y = r * 0.259;
        (e.drawImage(o, d, y, h, f, 0, 0, c, D),
          (e.fillStyle = "rgba(48,16,10,0.4)"),
          e.fillRect(0, 0, c, D));
        const g = e.createLinearGradient(0, 0, 0, 220);
        (g.addColorStop(0, "rgba(32,10,7,0.62)"),
          g.addColorStop(1, "rgba(32,10,7,0)"),
          (e.fillStyle = g),
          e.fillRect(0, 0, c, 220),
          e.restore());
      } else Go(e, 0, 0, c, D);
      (Zl(e, c / 2, 96, D, c * 0.62),
        Kl(e, 20, 0, c - 40, 90),
        Gl(e, 30, 84, c - 60, 16, this.time),
        this.renderPrizeShelf(e),
        e.save(),
        (e.fillStyle = p("#000000", 0.28)),
        e.beginPath(),
        e.moveTo(0, 90),
        e.lineTo(J, x),
        e.lineTo(J, D),
        e.lineTo(0, D),
        e.closePath(),
        e.fill(),
        e.beginPath(),
        e.moveTo(c, 90),
        e.lineTo(se, x),
        e.lineTo(se, D),
        e.lineTo(c, D),
        e.closePath(),
        e.fill(),
        e.restore(),
        Vl(e, c, 88, D, 54),
        Ol(e, D, c, b - D),
        wl(e, 0, D - 14, c, 22));
      const a = E.current.name.toUpperCase(),
        l = E.current.bigReward ? `👑 ${a} 👑` : a,
        n = ct(e, l, 380, 20, 800);
      (e.save(), (e.font = `800 ${n}px 'Segoe UI', sans-serif`));
      const i = Math.min(420, e.measureText(l).width + 44);
      (m(e, c / 2 - i / 2, 101, i, 34, 17),
        (e.fillStyle = "rgba(20,10,30,0.55)"),
        e.fill(),
        e.restore(),
        P(e, l, c / 2, 118, { size: n, color: E.current.bigReward ? v.tentGold : v.uiCream, weight: 800 }));
    }
    renderPrizeShelf(e) {
      const l = c - 304,
        n = 6,
        i = l / n,
        s = E.current.id,
        r = ge.filter((h) => Oe.has(`toy_${h}`)),
        f = r.length >= n ? r : ge;
      e.save();
      for (let h = 0; h < n; h++) {
        const d = f[(s * 3 + h * 4) % f.length],
          y = 152 + i * (h + 0.5),
          g = Math.sin(this.time * 1.3 + h * 1.1) * 3;
        ((e.globalAlpha = 0.82), ze(e, d, y, 202 + g, 54));
      }
      ((e.globalAlpha = 1), e.restore(), El(e, 144, 232, l + 16, 12), Ko(e, J, 286, se - J, 9, this.time));
    }
    predictTrajectory(e, o, a = 0) {
      const l = Ma + o * Pa;
      let n = e.x * l,
        i = e.y * l,
        s = a,
        r = Ze.x,
        f = Ze.y;
      const h = this.throwCtl.ball.radius,
        d = 1 / 60,
        y = [];
      let g = !1;
      for (let A = 0; A < 70; A++) {
        if (((i += To * d), Math.abs(s) > 0.001)) {
          const S = Math.hypot(n, i);
          if (S > 1) {
            const R = -i / S,
              G = n / S;
            ((n += R * s * Yt * d), (i += G * s * Yt * d));
          }
          s *= Math.pow(ga, d);
        }
        if (
          ((n *= it),
          (i *= it),
          (r += n * d),
          (f += i * d),
          !g && f < D - h - 10 && (g = !0),
          r - h < J
            ? ((r = J + h), (n = Math.abs(n) * at))
            : r + h > se && ((r = se - h), (n = -Math.abs(n) * at)),
          i < 0 && f - h < x && ((f = x + h), (i = Math.abs(i) * at)),
          g && f + h >= D)
        )
          break;
        A % 4 === 0 && y.push({ x: r, y: f });
      }
      return y;
    }
    renderAimGuides(e) {
      const o = this.throwCtl.aim,
        a = o.power,
        l = Ze,
        n = this.visualSling(),
        i = this.predictTrajectory(o.aimDir, a, o.curve);
      e.save();
      for (let r = 0; r < i.length; r++) {
        const f = i[r],
          h = r / Math.max(1, i.length - 1),
          d = 7 * (1 - h * 0.55);
        ((e.globalAlpha = (0.9 - h * 0.55) * (0.45 + a * 0.55)),
          e.beginPath(),
          e.arc(f.x, f.y, d, 0, Math.PI * 2),
          (e.fillStyle = "#ffffff"),
          e.fill(),
          (e.lineWidth = 1.5),
          (e.strokeStyle = p("#2b1a3d", 0.5)),
          e.stroke());
      }
      e.restore();
      {
        const r = l.y - 6,
          f = 34;
        (e.save(),
          (e.lineCap = "round"),
          [-1, 1].forEach((y) => {
            const g = l.x + y * f;
            (e.beginPath(),
              e.moveTo(g, r),
              e.lineTo(n.x + y * 6, n.y),
              (e.strokeStyle = p("#8a5a30", 0.9)),
              (e.lineWidth = Math.max(3, 8 - a * 4)),
              e.stroke(),
              e.beginPath(),
              e.moveTo(g, r),
              e.lineTo(n.x + y * 6, n.y),
              (e.strokeStyle = p("#d9b98a", 0.5)),
              (e.lineWidth = Math.max(1, 3 - a * 1.5)),
              e.stroke());
          }));
        const h = this.throwCtl.ball.radius + 8 + a * 18,
          d = 0.5 + 0.5 * Math.sin(this.time * 9);
        (e.beginPath(),
          e.arc(n.x, n.y, h, 0, Math.PI * 2),
          (e.strokeStyle = p(a > 0.75 ? v.uiDanger : v.tentGold, 0.3 + a * 0.5 * d)),
          (e.lineWidth = 2 + a * 3),
          e.stroke(),
          e.restore());
      }
      const s = o.curve;
      if (Math.abs(s) > 0.12) {
        const r = n.x,
          f = n.y,
          h = this.throwCtl.ball.radius + 16,
          d = Math.sign(s);
        (e.save(),
          (e.strokeStyle = p(v.uiPink, 0.55 + Math.abs(s) * 0.45)),
          (e.lineWidth = 4),
          (e.lineCap = "round"),
          e.beginPath(),
          e.arc(r, f, h, -Math.PI * 0.9, Math.PI * 0.35 * d > 0 ? Math.PI * 0.5 : -Math.PI * 0.1, d < 0),
          e.stroke());
        const y = d > 0 ? Math.PI * 0.5 : -Math.PI * 0.1,
          g = r + Math.cos(y) * h,
          A = f + Math.sin(y) * h;
        (e.beginPath(),
          e.moveTo(g, A),
          e.lineTo(g - d * 9, A - 9),
          e.moveTo(g, A),
          e.lineTo(g + d * 3, A + 11),
          e.stroke(),
          P(e, s > 0 ? "FALSO ▶" : "◀ FALSO", r, f - h - 16, { size: 15, color: v.uiPink, weight: 900 }),
          e.restore());
      }
      (_n(e, c / 2, b - 380, 340, 26, a),
        e.save(),
        e.translate(l.x, l.y),
        e.beginPath(),
        e.arc(0, 0, Po * 0.42, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a),
        (e.strokeStyle = a > 0.75 ? v.uiDanger : v.tentGold),
        (e.lineWidth = 8),
        (e.lineCap = "round"),
        e.stroke(),
        e.restore(),
        e.save(),
        (e.strokeStyle = p(v.uiCream, 0.4)),
        (e.lineWidth = 2),
        e.setLineDash([4, 6]),
        e.beginPath(),
        e.moveTo(l.x, l.y),
        e.lineTo(n.x, n.y),
        e.stroke(),
        e.restore());
    }
    renderHud(e) {
      let i = 140;
      (jt(e, 10, i, 128, 64, "SEVİYE"),
        P(e, `${E.current.id} / ${E.totalLevels}`, 10 + 128 / 2, i + 43, {
          size: 22,
          color: "#ffffff",
          weight: 900,
        }),
        (i += 72),
        jt(e, 10, i, 128, 64, "ATIŞ HAKKI"),
        P(
          e,
          `${this.shotsLeft} / ${Math.max(E.current.shots + (this.effects?.extraShots ?? 0), this.shotsLeft)}`,
          10 + 128 / 2,
          i + 43,
          { size: 20, color: this.shotsLeft <= 2 ? v.uiDanger : "#ffffff", weight: 900 },
        ),
        (i += 72));
      const s = this.goalStatus(),
        r = this.goal.kind === "timed" && this.goalTimeLeft <= 10;
      (jt(e, 10, i, 128, 64, this.goalTitle()),
        P(e, s.text, 10 + 128 / 2, i + 43, {
          size: 17,
          color: s.done ? v.uiSuccess : r ? v.uiDanger : "#ffffff",
          weight: 900,
        }),
        (i += 72),
        jt(e, 10, i, 128, 64, "PUAN"),
        P(e, `${F.value}`, 10 + 128 / 2, i + 40, { size: 20, color: "#ffffff", weight: 900 }));
      const f = this.computeStars();
      for (let h = 0; h < 3; h++) {
        const d = 74 + (h - 1) * 16;
        (e.save(),
          e.translate(d, i + 55),
          (e.fillStyle = h < f ? v.coinGold : "rgba(255,255,255,0.22)"),
          e.beginPath());
        const y = 6;
        for (let g = 0; g < 5; g++) {
          const A = (g * Math.PI * 2) / 5 - Math.PI / 2,
            S = A + Math.PI / 5;
          (e.lineTo(Math.cos(A) * y, Math.sin(A) * y),
            e.lineTo(Math.cos(S) * y * 0.45, Math.sin(S) * y * 0.45));
        }
        (e.closePath(), e.fill(), e.restore());
      }
      if (
        (this.renderTopCurrencyBar(e),
        me(e, 48, 52, 30, "⏸"),
        me(e, c - 48, 52, 30, z.enabled ? "🔊" : "🔇", { dimmed: !z.enabled }),
        this.laneMultiplier > 1)
      ) {
        const h = `KORİDOR x${this.laneMultiplier}`,
          d = 32 + h.length * 11;
        (m(e, c / 2 - d / 2, 148, d, 34, 17),
          (e.fillStyle = "rgba(20,60,40,0.8)"),
          e.fill(),
          (e.strokeStyle = "#7fe0a0"),
          (e.lineWidth = 2),
          e.stroke(),
          P(e, h, c / 2, 166, { size: 16, color: "#b6ffcf", weight: 900 }));
      }
      (be.hitCount >= 2 &&
        P(e, `COMBO x${be.multiplier} (${be.hitCount})`, c / 2, 120, {
          size: 20,
          color: v.uiPink,
          weight: 800,
          outline: "#3c1a5c",
          outlineWidth: 4,
        }),
        !this.levelEnded &&
          this.shotsLeft > 0 &&
          this.shotsLeft <= 2 &&
          P(e, this.shotsLeft === 1 ? "SON ATIŞ!" : `SON ${this.shotsLeft} ATIŞ!`, c / 2, 150, {
            size: 18,
            color: v.tentGold,
            weight: 800,
            outline: "#3c1a5c",
            outlineWidth: 4,
          }));
    }
    renderTopCurrencyBar(e) {
      (this.drawCurrencyPill(e, c / 2 - 76, 52, "🪙", K.coins, Wa),
        this.drawCurrencyPill(e, c / 2 + 76, 52, "💎", K.gems, "#7fd6ff"));
    }
    drawCurrencyPill(e, o, a, l, n, i) {
      const s = `${l} ${n}`;
      (e.save(), (e.font = "800 18px 'Segoe UI', sans-serif"));
      const r = Math.max(96, e.measureText(s).width + 36),
        f = 44,
        h = e.createLinearGradient(0, a - f / 2, 0, a + f / 2);
      (h.addColorStop(0, Nt),
        h.addColorStop(1, Ht),
        m(e, o - r / 2, a - f / 2, r, f, f / 2),
        (e.fillStyle = h),
        e.fill(),
        (e.strokeStyle = Xt),
        (e.lineWidth = 2.5),
        m(e, o - r / 2, a - f / 2, r, f, f / 2),
        e.stroke(),
        P(e, s, o, a + 1, { size: 18, color: i, weight: 900 }),
        e.restore());
    }
    bumpStats(e) {
      U.update((o) => {
        (o.stats ||
          (o.stats = {
            shotsFired: 0,
            holesHit: 0,
            kukasKnocked: 0,
            levelsWon: 0,
            bestCombo: 0,
            bestScore: 0,
            perfectShots: 0,
          }),
          e(o.stats));
      });
    }
    setPaused(e) {
      this.levelEnded ||
        ((this.paused = e), z.play("button"), e && this.throwCtl.aim.active && this.throwCtl.cancelAim());
    }
    pauseGeometry() {
      const o = c / 2 - 210;
      return {
        panel: { x: o, y: 480, w: 420, h: 620 },
        resume: { x: o + 40, y: 640, w: 340, h: 104 },
        restart: { x: o + 40, y: 766, w: 340, h: 92 },
        menu: { x: o + 40, y: 880, w: 340, h: 92 },
        sound: { x: o + 40, y: 994, w: 340, h: 76 },
      };
    }
    renderPauseOverlay(e) {
      const o = this.pauseGeometry();
      (e.save(),
        (e.fillStyle = "rgba(6,4,16,0.72)"),
        e.fillRect(0, 0, c, b),
        le(e, o.panel.x, o.panel.y, o.panel.w, o.panel.h, 26),
        de(e, c / 2, o.panel.y + 8, 340, "DURAKLATILDI", 26),
        P(e, E.current.name.toUpperCase(), c / 2, o.panel.y + 78, {
          size: 18,
          color: M.goldLight,
          weight: 800,
        }),
        P(e, `SKOR ${F.value}  •  ATIŞ ${this.shotsLeft}/${E.current.shots}`, c / 2, o.panel.y + 112, {
          size: 16,
          color: p(M.cream, 0.75),
          weight: 700,
        }),
        Y(e, o.resume.x, o.resume.y, o.resume.w, o.resume.h, "DEVAM ET", "green", { icon: "▶" }),
        Y(e, o.restart.x, o.restart.y, o.restart.w, o.restart.h, "YENİDEN BAŞLA", "gold", { icon: "↻" }),
        Y(e, o.menu.x, o.menu.y, o.menu.w, o.menu.h, "ANA MENÜ", "red", { icon: "⌂" }),
        Y(e, o.sound.x, o.sound.y, o.sound.w, o.sound.h, z.enabled ? "SES AÇIK" : "SES KAPALI", "blue", {
          icon: z.enabled ? "🔊" : "🔇",
        }),
        e.restore());
    }
    renderTutorial(e) {
      if (this.tutorialStep >= 3) return;
      const o = [
          ["1. ADIM", "Topa dokun ve GERİ ÇEK"],
          ["2. ADIM", "Nişan çizgisini deliğe doğrult"],
          ["3. ADIM", "Parmağını KALDIR ve fırlat!"],
        ],
        [a, l] = o[this.tutorialStep],
        n = 1006;
      (e.save(),
        (e.globalAlpha = 0.94),
        m(e, c / 2 - 235, n, 470, 96, 20),
        (e.fillStyle = "rgba(12,8,26,0.86)"),
        e.fill(),
        (e.strokeStyle = p(M.goldLight, 0.9)),
        (e.lineWidth = 3),
        e.stroke(),
        P(e, a, c / 2, n + 30, { size: 17, color: M.goldLight, weight: 900 }),
        P(e, l, c / 2, n + 64, { size: 20, color: "#ffffff", weight: 800 }));
      const i = this.throwCtl.ball;
      if (this.tutorialStep === 0 && i.state === "idle") {
        const s = Math.sin(this.time * 4) * 9;
        (P(e, "👆", i.pos.x, i.pos.y + 48 + s, { size: 42, shadow: !1 }),
          e.beginPath(),
          e.arc(i.pos.x, i.pos.y, i.radius + 18 + Math.sin(this.time * 4) * 5, 0, Math.PI * 2),
          (e.strokeStyle = p(M.goldLight, 0.75)),
          (e.lineWidth = 3),
          e.stroke());
      }
      e.restore();
    }
    renderBottomBar(e) {
      const n = this.throwCtl.ball.state === "idle" && this.ownedBalls().length > 1;
      (this.drawArrowButton(e, this.ballPrevButton.rect, "‹", n),
        this.drawArrowButton(e, this.ballNextButton.rect, "›", n));
      const i = c / 2;
      le(e, c / 2 - 60, 1420, 120, 110, 16);
      const s = ye.selectedSpec,
        r = Math.sin(this.time * 2.2) * 3;
      (Pt(e, i, 1465 + r, 30, s.type, this.time * 0.4),
        P(e, s.name, i, 1512, { size: 12, color: M.cream, weight: 700 }));
    }
    drawArrowButton(e, o, a, l) {
      const n = o.x + o.w / 2,
        i = o.y + o.h / 2;
      (e.save(),
        l || (e.globalAlpha = 0.4),
        le(e, o.x, o.y, o.w, o.h, 14),
        P(e, a, n, i, { size: 32, color: "#ffffff", weight: 900, shadow: !1 }),
        e.restore());
    }
    renderPowerups(e) {
      const o = (i, s, r, f, h) => {
          const d = i.x + i.w / 2,
            y = i.y + i.h / 2;
          (e.save(),
            h && (e.globalAlpha = 0.4),
            le(e, i.x, i.y, i.w, i.h, 14),
            f &&
              ((e.strokeStyle = p(M.goldLight, 0.6 + 0.4 * Math.sin(this.time * 6))),
              (e.lineWidth = 3),
              e.beginPath(),
              e.roundRect(i.x - 2, i.y - 2, i.w + 4, i.h + 4, 16),
              e.stroke()),
            P(e, s, d, y - 8, { size: 22, shadow: !1 }),
            P(e, `${r}🎟`, d, y + 18, { size: 12, color: M.goldLight, weight: 800 }),
            e.restore());
        },
        a =
          this.levelEnded ||
          this.doubleArmed ||
          K.tickets < H.DOUBLE_COST ||
          this.throwCtl.ball.state === "flying",
        l = this.levelEnded || K.tickets < H.EXTRA_SHOT_COST,
        n =
          this.levelEnded ||
          this.magnetArmed ||
          K.tickets < H.MAGNET_COST ||
          this.throwCtl.ball.state === "flying";
      (o(this.magnetButton.rect, "🧲", H.MAGNET_COST, this.magnetArmed, n),
        o(this.bombButton.rect, "✨", H.DOUBLE_COST, this.doubleArmed, a),
        o(this.extraShotButton.rect, "🎯", H.EXTRA_SHOT_COST, !1, l));
    }
    renderWinOverlay(e) {
      (e.save(), (e.fillStyle = "rgba(4,10,22,0.82)"), e.fillRect(0, 0, c, b), e.restore());
      const o = this.winGeometry(),
        a = c / 2;
      (le(e, o.x, o.y, o.w, o.h, 26),
        de(e, a, o.y, o.w - 60, "SEVİYE TAMAMLANDI!", 25),
        P(e, E.current.name, a, o.y + 56, { size: 16, color: p(M.cream, 0.75), weight: 700 }));
      const l = this.goalDoneText();
      P(e, `✓ ${l}`, a, o.y + 82, {
        size: ct(e, `✓ ${l}`, o.w - 70, 16, 800),
        color: v.uiSuccess,
        weight: 800,
      });
      const n = o.y + 140;
      for (let f = 0; f < 3; f++) {
        const h = a + (f - 1) * 90,
          d = f < this.earnedStars,
          y = Math.min(1, Math.max(0, this.endTimer * 2.2 - f * 0.35)),
          g = d ? 1 + Math.sin(Math.min(Math.PI, y * Math.PI)) * 0.35 : 1,
          A = 34 * (d ? y * g : 1);
        if (!(A <= 0.5)) {
          (e.save(),
            e.translate(h, n),
            d
              ? ((e.shadowColor = "rgba(255,205,60,0.9)"), (e.shadowBlur = 20), (e.fillStyle = M.goldLight))
              : (e.fillStyle = "rgba(255,255,255,0.14)"),
            e.beginPath());
          for (let S = 0; S < 5; S++) {
            const R = (S * Math.PI * 2) / 5 - Math.PI / 2,
              G = R + Math.PI / 5;
            (e.lineTo(Math.cos(R) * A, Math.sin(R) * A),
              e.lineTo(Math.cos(G) * A * 0.45, Math.sin(G) * A * 0.45));
          }
          (e.closePath(), e.fill(), e.restore());
        }
      }
      P(e, `SKOR: ${F.value}`, a, o.y + 226, { size: 26, color: "#ffffff", weight: 900 });
      const i = this.earnedStars < 3 ? E.current.targetScore * (this.earnedStars === 1 ? 0.7 : 1) : 0;
      i > 0 &&
        P(e, `Sonraki yıldız: ${Math.ceil(i)} puan`, a, o.y + 256, { size: 14, color: p(M.cream, 0.65) });
      const s = Lo(E.current),
        r = this.starCoinBonus > 0 ? ` (+${this.starCoinBonus} yıldız bonusu)` : "";
      if (
        (P(e, `🪙 +${s + this.starCoinBonus} jeton${r}`, a, o.y + 292, {
          size: 17,
          color: M.goldLight,
          weight: 800,
        }),
        this.ticketReward > 0 &&
          P(e, `🎟 +${this.ticketReward} BİLET (3 yıldız ödülü!)`, a, o.y + 320, {
            size: 16,
            color: M.greenLight,
            weight: 800,
          }),
        this.gemReward > 0 &&
          P(e, `💎 +${this.gemReward} ELMAS (büyük ödül bölümü!)`, a, o.y + 344, {
            size: 16,
            color: "#7fd6ff",
            weight: 800,
          }),
        this.wonToy)
      ) {
        const f = o.y + 430,
          h = Math.min(1, Math.max(0, this.endTimer * 1.6 - 0.7));
        (e.save(), (e.globalAlpha = h));
        const d = e.createRadialGradient(a, f, 8, a, f, 130);
        (d.addColorStop(0, p(M.gold, 0.4)),
          d.addColorStop(1, p(M.gold, 0)),
          (e.fillStyle = d),
          e.fillRect(a - 150, f - 150, 300, 300),
          ze(e, this.wonToy, a, f, 140 * (0.7 + h * 0.3), { rotation: Math.sin(this.endTimer * 2) * 0.06 }),
          P(e, "YENİ OYUNCAK KAZANDIN!", a, f + 96, { size: 19, color: M.goldLight, weight: 900 }),
          P(e, he[this.wonToy].name.toUpperCase(), a, f + 124, { size: 17, color: "#ffffff", weight: 800 }),
          e.restore());
      }
      (Y(
        e,
        o.primary.x,
        o.primary.y,
        o.primary.w,
        o.primary.h,
        this.wonToy ? "OYUNCAĞINI AL" : "SONRAKİ SEVİYE",
        this.wonToy ? "red" : "green",
        { icon: this.wonToy ? "🧸" : "➡" },
      ),
        Y(e, o.menu.x, o.menu.y, o.menu.w, o.menu.h, "ANA MENÜ", "blue"));
    }
    winGeometry() {
      const e = this.gemReward > 0 ? 344 : this.ticketReward > 0 ? 320 : 292,
        o = this.wonToy ? 600 : e + 44,
        a = this.wonToy ? 820 : o + 112 + 74 + 30,
        l = b / 2 - a / 2,
        n = 50,
        i = c - 100,
        s = l + o;
      return {
        x: n,
        y: l,
        w: i,
        h: a,
        primary: { x: n + 40, y: s, w: i - 80, h: 92 },
        menu: { x: n + 110, y: s + 112, w: i - 220, h: 74 },
      };
    }
    renderLoseOverlay(e) {
      (e.save(), (e.fillStyle = "rgba(4,10,22,0.82)"), e.fillRect(0, 0, c, b), e.restore());
      const o = this.loseGeometry(),
        a = c / 2;
      le(e, o.x, o.y, o.w, o.h, 26);
      const l = this.loseSummary();
      (de(e, a, o.y, o.w - 60, l.title, 26),
        P(e, l.reason, a, o.y + 72, { size: 19, color: p(M.cream, 0.8), weight: 700 }));
      const n = Math.max(0, Math.min(1, l.frac));
      P(e, l.value, a, o.y + 132, { size: ct(e, l.value, o.w - 80, 34), color: M.goldLight, weight: 900 });
      const i = o.w - 120;
      if (
        (m(e, a - i / 2, o.y + 166, i, 22, 11),
        (e.fillStyle = "rgba(0,0,0,0.45)"),
        e.fill(),
        (e.strokeStyle = p(M.gold, 0.7)),
        (e.lineWidth = 2),
        e.stroke(),
        n > 0)
      ) {
        m(e, a - i / 2 + 3, o.y + 169, Math.max(16, (i - 6) * n), 16, 8);
        const s = e.createLinearGradient(a - i / 2, 0, a + i / 2, 0);
        (s.addColorStop(0, M.goldLight), s.addColorStop(1, "#f0682a"), (e.fillStyle = s), e.fill());
      }
      if (
        (P(e, l.note ?? `Hedefin %${Math.round(n * 100)}'ine ulaştın`, a, o.y + 212, {
          size: 15,
          color: l.note ? v.uiDanger : p(M.cream, 0.7),
          weight: l.note ? 800 : 600,
        }),
        this.watchingAd)
      ) {
        P(e, "Reklam oynatılıyor...", a, o.y + 268, { size: 17, color: M.cream, weight: 700 });
        const s = o.w - 160;
        (m(e, a - s / 2, o.y + 292, s, 22, 11),
          (e.fillStyle = "rgba(255,255,255,0.16)"),
          e.fill(),
          m(e, a - s / 2, o.y + 292, Math.max(22, s * this.adProgress), 22, 11),
          (e.fillStyle = M.greenLight),
          e.fill());
      } else {
        const s = this.adBonusShots(),
          r = this.goal.kind === "timed" ? `REKLAM İZLE +${eo} SN` : `REKLAM İZLE +${s} TOP`;
        Y(e, o.ad.x, o.ad.y, o.ad.w, o.ad.h, r, "green", { icon: "▶", disabled: !nt.canShow() });
      }
      (Y(e, o.retry.x, o.retry.y, o.retry.w, o.retry.h, "TEKRAR DENE", "gold", { icon: "↻" }),
        Y(e, o.menu.x, o.menu.y, o.menu.w, o.menu.h, "ANA MENÜ", "blue"));
    }
    loseGeometry() {
      const o = b / 2 - 283,
        a = 50,
        l = c - 100;
      return {
        x: a,
        y: o,
        w: l,
        h: 566,
        ad: { x: a + 40, y: o + 262, w: l - 80, h: 84 },
        retry: { x: a + 40, y: o + 362, w: l - 80, h: 84 },
        menu: { x: a + 110, y: o + 462, w: l - 220, h: 74 },
      };
    }
    onPointerDown(e) {
      if (this.paused) {
        const o = this.pauseGeometry();
        if (qe(e, o.resume)) this.setPaused(!1);
        else if (qe(e, o.restart)) ((this.paused = !1), this.restartLevel());
        else if (qe(e, o.menu)) ((this.paused = !1), V.goto("mainMenu"));
        else if (qe(e, o.sound)) {
          const a = !z.enabled;
          (z.setEnabled(a), U.update((l) => (l.soundOn = a)));
        }
        return;
      }
      if (this.levelEnded && this.won) {
        const o = this.winGeometry();
        qe(e, o.primary)
          ? (z.play("button"), this.wonToy ? this.openToyReward() : this.goNextLevel())
          : qe(e, o.menu) && V.goto("mainMenu");
        return;
      }
      if (this.levelEnded && !this.won) {
        if (this.watchingAd) return;
        const o = this.loseGeometry();
        qe(e, o.ad)
          ? this.watchAd()
          : qe(e, o.retry)
            ? this.restartLevel()
            : qe(e, o.menu) && V.goto("mainMenu");
        return;
      }
      this.pauseButton.onDown(e.x, e.y) ||
        this.soundButton.onDown(e.x, e.y) ||
        this.wheelTimer > 0 ||
        this.magnetButton.onDown(e.x, e.y) ||
        this.bombButton.onDown(e.x, e.y) ||
        this.extraShotButton.onDown(e.x, e.y) ||
        this.ballPrevButton.onDown(e.x, e.y) ||
        this.ballNextButton.onDown(e.x, e.y) ||
        (this.throwCtl.beginAim(e.x, e.y) &&
          ((this.flightHadHit = !1),
          (this.flightHits = 0),
          this.holeCtl.resetFlight(),
          this.obstacleCtl.resetFlight(),
          this.tutorialStep === 0 && (this.tutorialStep = 1)));
    }
    onPointerMove(e) {
      this.paused ||
        (this.throwCtl.aim.active &&
          (this.throwCtl.updateAim(e.x, e.y),
          this.tutorialStep === 1 && this.throwCtl.aim.power > 0.35 && (this.tutorialStep = 2)));
    }
    onPointerUp(e) {
      if (
        !this.paused &&
        !this.levelEnded &&
        !this.pauseButton.onUp(e.x, e.y) &&
        !this.soundButton.onUp(e.x, e.y) &&
        !(this.wheelTimer > 0) &&
        !this.magnetButton.onUp(e.x, e.y) &&
        !this.bombButton.onUp(e.x, e.y) &&
        !this.extraShotButton.onUp(e.x, e.y) &&
        !this.ballPrevButton.onUp(e.x, e.y) &&
        !this.ballNextButton.onUp(e.x, e.y) &&
        this.throwCtl.aim.active
      ) {
        const o = this.throwCtl.aim.power,
          a = this.throwCtl.aim.aimDir;
        this.throwCtl.releaseAim() &&
          ((this.flightPath = []),
          (this.pathTimer = 0),
          this.spawnLaunchEffect(o, a),
          pe.play("tap"),
          (this.shotsLeft = Math.max(0, this.shotsLeft - 1)),
          ce.recordShot(),
          this.bumpStats((n) => n.shotsFired++),
          this.tutorialStep < 3 && (this.tutorialStep = 3));
      }
    }
  };
(u(H, "POWERUP_SIZE", 60),
  u(H, "DOUBLE_COST", 2),
  u(H, "MAGNET_COST", 2),
  u(H, "MAGNET_PULL", 1100),
  u(H, "EXTRA_SHOT_COST", 1));
let Uo = H;
const hs = Dt("Share", {
    web: () =>
      Sa(() => Promise.resolve().then(() => Js), void 0, import.meta.url).then((t) => new t.ShareWeb()),
  }),
  ae = 1080;
class ds {
  constructor() {
    u(this, "lastShareGaveBonus", !1);
  }
  buildMessage(e, o) {
    const a = he[o];
    return `🎪✨ KUKA KAZAN ✨🎪

${e} panayırda topu attı ve ${a.emoji} *${a.name}* (${a.rarity}) kazandı! 🏆

🎯 Sen de gel, nişan al, oyuncağını kazan!`;
  }
  buildInviteUrl(e, o) {
    const a = new URL(window.location.href);
    return ((a.search = ""), a.searchParams.set("ref", e), a.searchParams.set("toy", o), a.toString());
  }
  buildWhatsAppText(e, o) {
    return `${this.buildMessage(e, o)}
${this.buildInviteUrl(e, o)}`;
  }
  buildWhatsAppUrl(e, o) {
    return `https://wa.me/?text=${encodeURIComponent(this.buildWhatsAppText(e, o))}`;
  }
  generateCard(e, o) {
    const a = he[e],
      l = document.createElement("canvas");
    ((l.width = ae), (l.height = ae));
    const n = l.getContext("2d"),
      i = n.createLinearGradient(0, 0, 0, ae);
    (i.addColorStop(0, v.bgNightTop),
      i.addColorStop(0.6, v.bgNightBottom),
      i.addColorStop(1, "#2a1550"),
      (n.fillStyle = i),
      n.fillRect(0, 0, ae, ae),
      this.drawBorderBulbs(n),
      m(n, ae / 2 - 260, 56, 520, 108, 22));
    const s = n.createLinearGradient(0, 56, 0, 164);
    (s.addColorStop(0, "#3c1a5c"),
      s.addColorStop(1, "#2a0f45"),
      (n.fillStyle = s),
      n.fill(),
      (n.strokeStyle = v.tentGold),
      (n.lineWidth = 4),
      n.stroke(),
      P(n, "KUKA KAZAN", ae / 2, 110, {
        size: 46,
        color: O(v.tentGold, 60),
        outline: "#5c2a0f",
        outlineWidth: 6,
        weight: 900,
      }));
    const r = n.createRadialGradient(ae / 2, 560, 40, ae / 2, 560, 320);
    (r.addColorStop(0, p(v.bulbYellow, 0.28)),
      r.addColorStop(1, p(v.bulbYellow, 0)),
      (n.fillStyle = r),
      n.beginPath(),
      n.arc(ae / 2, 560, 320, 0, Math.PI * 2),
      n.fill(),
      ze(n, e, ae / 2, 560, 460));
    const h = {
      COMMON: v.rarityCommon,
      RARE: v.rarityRare,
      EPIC: v.rarityEpic,
      LEGENDARY: v.rarityLegendary,
    }[a.rarity];
    return (
      Oo(n, ae / 2 - 100, 790, 200, 46, { fill: p(h, 0.28), radius: 23, stroke: h, lineWidth: 3 }),
      P(n, a.rarity, ae / 2, 813, { size: 20, color: h, weight: 900 }),
      P(n, `${o.toUpperCase()} SENİN İÇİN`, ae / 2, 890, {
        size: 40,
        color: "#ffffff",
        outline: "#3c1a5c",
        outlineWidth: 6,
        weight: 800,
      }),
      P(n, `${a.name.toUpperCase()} KAZANDI!`, ae / 2, 940, {
        size: 40,
        color: v.tentGold,
        outline: "#3c1a5c",
        outlineWidth: 6,
        weight: 800,
      }),
      P(n, "Oyuncağı görmek için KUKA KAZAN'a gir!", ae / 2, 1005, {
        size: 24,
        color: p("#ffffff", 0.85),
        weight: 600,
      }),
      l
    );
  }
  drawBorderBulbs(e) {
    const l = [];
    for (let n = 30; n <= ae - 30; n += 46) (l.push([n, 30]), l.push([n, ae - 30]));
    for (let n = 30; n <= ae - 30; n += 46) (l.push([30, n]), l.push([ae - 30, n]));
    l.forEach(([n, i], s) => {
      const r = s % 2 === 0 ? v.bulbYellow : v.bulbOrange,
        f = e.createRadialGradient(n, i, 0, n, i, 12);
      (f.addColorStop(0, p(r, 0.7)),
        f.addColorStop(1, p(r, 0)),
        (e.fillStyle = f),
        e.beginPath(),
        e.arc(n, i, 12, 0, Math.PI * 2),
        e.fill(),
        e.beginPath(),
        e.arc(n, i, 4, 0, Math.PI * 2),
        (e.fillStyle = r),
        e.fill());
    });
  }
  async canvasToBlob(e) {
    return new Promise((o) => e.toBlob((a) => o(a), "image/png", 0.95));
  }
  async shareToy(e) {
    let o = !1;
    try {
      const a = U.get().name || "Bir oyuncu",
        l = this.buildMessage(a, e),
        n = this.buildInviteUrl(a, e),
        i = this.buildWhatsAppUrl(a, e),
        s = this.generateCard(e, a),
        r = await this.canvasToBlob(s),
        f = navigator;
      if (r && typeof f.share == "function") {
        const h = new File([r], "kuka-kazan.png", { type: "image/png" });
        let d = !1;
        try {
          d = f.canShare?.({ files: [h] }) ?? !1;
        } catch {
          d = !1;
        }
        (d
          ? await f.share({ files: [h], title: "Kuka Kazan - WhatsApp'ta Paylaş", text: l, url: n })
          : await f.share({ title: "Kuka Kazan - WhatsApp'ta Paylaş", text: l, url: n }),
          (o = !0));
      } else
        Mt.isNativePlatform()
          ? (await hs.share({ title: "Kuka Kazan", text: l, url: n, dialogTitle: "WhatsApp'ta Paylaş" }),
            (o = !0))
          : (this.downloadCard(s), (o = this.openWhatsAppDirect(i) || this.openFallbackTab(s, l, i)));
    } catch (a) {
      console.info("[ShareManager] share cancelled/failed", a);
    }
    if (o && !this.lastShareGaveBonus)
      try {
        (K.addShots(al),
          (this.lastShareGaveBonus = !0),
          window.setTimeout(() => (this.lastShareGaveBonus = !1), 3e3));
      } catch {}
    return o;
  }
  downloadCard(e) {
    try {
      const o = document.createElement("a");
      ((o.href = e.toDataURL("image/png")), (o.download = "kuka-kazan.png"), o.click());
    } catch {}
  }
  openWhatsAppDirect(e) {
    try {
      return !!window.open(e, "_blank", "noopener,noreferrer");
    } catch {
      return !1;
    }
  }
  openFallbackTab(e, o, a) {
    try {
      const l = e.toDataURL("image/png"),
        n = window.open();
      return n
        ? ((n.document.title = "Kuka Kazan - Paylaşım"),
          (n.document.body.style.margin = "0"),
          (n.document.body.style.background = "#1a0f2e"),
          (n.document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;padding:20px;font-family:sans-serif;color:#fff4e0">
          <img src="${l}" style="max-width:min(90vw,500px);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.5)" />
          <p style="max-width:500px;text-align:center;margin-top:16px;white-space:pre-line">${o}</p>
          <a href="${a}" target="_blank" rel="noopener noreferrer"
             style="display:flex;align-items:center;gap:8px;margin-top:18px;padding:14px 28px;background:#25D366;color:#0b1a0f;font-weight:800;font-size:16px;border-radius:999px;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,0.4)">
            💬 WhatsApp'ta Gönder
          </a>
          <p style="opacity:0.7;font-size:13px;margin-top:14px;text-align:center">Görsel cihazına indirildi - WhatsApp'ta ataç ikonuyla ekleyebilirsin.</p>
        </div>`),
          !0)
        : !1;
    } catch {
      return !1;
    }
  }
}
const Da = new ds(),
  bt = 60,
  $e = 280,
  et = c - 120,
  us = 1e3;
class ps {
  constructor() {
    u(this, "name", "reward");
    u(this, "time", 0);
    u(this, "stage", "intro");
    u(this, "toyId", "bear_brown");
    u(this, "particles", new St());
    u(this, "shareRect", { x: bt + 40, y: $e + 782, w: (et - 120) / 2, h: 90 });
    u(this, "continueRect", { x: bt + 80 + (et - 120) / 2, y: $e + 782, w: (et - 120) / 2, h: 90 });
    u(this, "collectionRect", { x: bt + 40, y: $e + 890, w: et - 80, h: 76 });
  }
  enter() {
    ((this.time = 0),
      (this.stage = "intro"),
      (this.toyId = Z.pendingToy ?? "bear_brown"),
      this.particles.clear(),
      z.play("reward"));
  }
  exit() {}
  update(e) {
    if (
      ((this.time += e),
      this.particles.update(e),
      this.stage === "intro" && this.time > 0.45 && ((this.stage = "boxOpening"), z.play("unlock")),
      this.stage === "boxOpening" && this.time > 0.95)
    ) {
      this.stage = "reveal";
      const o = ve.defOf(this.toyId).rarity === "LEGENDARY";
      (this.particles.spawnConfetti(c / 2, b * 0.36, o ? 140 : 70), z.play("bigwin"));
    }
  }
  render(e) {
    je(e, this.time);
    const o = ve.defOf(this.toyId),
      a = rt(o.rarity);
    (le(e, bt, $e, et, us, 26), de(e, c / 2, $e, et - 60, "YENİ OYUNCAK KAZANDIN!", 26));
    const l = c / 2,
      n = $e + 320;
    if (this.stage !== "reveal") {
      const y = this.stage === "boxOpening" ? Math.min(1, (this.time - 0.45) / 0.5) : 0;
      (this.drawBox(e, l, n, y),
        P(e, "Hediye kutun açılıyor...", l, n + 190, { size: 20, color: p(M.cream, 0.8) }),
        this.particles.render(e));
      return;
    }
    const i = Math.min(1, (this.time - 0.95) / 0.45),
      s = Math.sin(this.time * 2.2) * 8,
      r = 230 + Math.sin(this.time * 3) * 14,
      f = e.createRadialGradient(l, n, 20, l, n, r);
    (f.addColorStop(0, p(a, 0.35)),
      f.addColorStop(1, p(a, 0)),
      e.save(),
      (e.fillStyle = f),
      e.fillRect(l - r, n - r, r * 2, r * 2),
      e.restore(),
      e.save(),
      (e.globalAlpha = 0.16),
      e.translate(l, n),
      e.rotate(this.time * 0.25));
    for (let y = 0; y < 12; y++)
      (e.rotate((Math.PI * 2) / 12),
        e.beginPath(),
        e.moveTo(0, 0),
        e.lineTo(250, -30),
        e.lineTo(250, 30),
        e.closePath(),
        (e.fillStyle = y % 2 ? a : M.goldLight),
        e.fill());
    if (
      (e.restore(),
      e.save(),
      (e.globalAlpha = i),
      ze(e, this.toyId, l, n + s, 250 * Math.min(1, i + 0.25), {
        rotation: Math.sin(this.time * 1.5) * 0.07,
      }),
      e.restore(),
      this.particles.render(e),
      i < 0.55)
    )
      return;
    (P(e, o.name.toUpperCase(), l, n + 268, {
      size: 34,
      color: "#ffffff",
      weight: 900,
      outline: "#08172c",
      outlineWidth: 5,
    }),
      m(e, l - 110, n + 300, 220, 44, 22),
      (e.fillStyle = p(a, 0.3)),
      e.fill(),
      (e.strokeStyle = a),
      (e.lineWidth = 2.5),
      e.stroke(),
      P(e, o.rarity, l, n + 322, { size: 18, color: a, weight: 900 }));
    const d = ve.list().find((y) => y.id === this.toyId)?.data?.count ?? 1;
    (P(e, d > 1 ? `Koleksiyonunda ${d}. kopyası` : "Koleksiyonuna eklendi!", l, n + 378, {
      size: 17,
      color: p(M.cream, 0.8),
      weight: 600,
    }),
      P(e, `Koleksiyon: ${ve.ownedCount()} / ${ve.totalCount}`, l, n + 410, {
        size: 16,
        color: M.goldLight,
        weight: 700,
      }),
      Y(e, this.shareRect.x, this.shareRect.y, this.shareRect.w, this.shareRect.h, "PAYLAŞ", "green", {
        icon: "📤",
      }),
      Y(
        e,
        this.continueRect.x,
        this.continueRect.y,
        this.continueRect.w,
        this.continueRect.h,
        "DEVAM ET",
        "gold",
      ),
      Y(
        e,
        this.collectionRect.x,
        this.collectionRect.y,
        this.collectionRect.w,
        this.collectionRect.h,
        "OYUNCAK KOLEKSİYONUM",
        "blue",
        { icon: "🧸" },
      ));
  }
  drawBox(e, o, a, l) {
    (e.save(), e.translate(o, a));
    const n = 1.6;
    (e.scale(n, n),
      m(e, -70, -20, 140, 90, 14),
      (e.fillStyle = "#a52a2a"),
      e.fill(),
      (e.strokeStyle = M.gold),
      (e.lineWidth = 4),
      e.stroke(),
      (e.fillStyle = M.gold),
      e.fillRect(-12, -20, 24, 90),
      e.save(),
      e.translate(-70, -20),
      e.rotate(-l * 1.35),
      m(e, 0, -28, 140, 32, 10),
      (e.fillStyle = "#c0392b"),
      e.fill(),
      (e.strokeStyle = M.gold),
      (e.lineWidth = 3),
      e.stroke(),
      e.restore(),
      e.restore());
  }
  onPointerDown(e) {
    if (this.stage === "reveal") {
      if (W(e.x, e.y, this.shareRect.x, this.shareRect.y, this.shareRect.w, this.shareRect.h)) {
        Da.shareToy(this.toyId);
        return;
      }
      if (W(e.x, e.y, this.continueRect.x, this.continueRect.y, this.continueRect.w, this.continueRect.h)) {
        const o = Z.rewardReturnScene || "mainMenu";
        ((Z.rewardReturnScene = "mainMenu"), V.goto(o));
        return;
      }
      W(
        e.x,
        e.y,
        this.collectionRect.x,
        this.collectionRect.y,
        this.collectionRect.w,
        this.collectionRect.h,
      ) && V.goto("collection");
    }
  }
  onPointerUp(e) {}
}
function cs(t) {
  return `🪙 ${ka[t]}`;
}
const ht = 4,
  to = 156,
  oo = 186,
  Tt = 14,
  ao = 400,
  ys = 4;
class vs {
  constructor() {
    u(this, "name", "collection");
    u(this, "time", 0);
    u(this, "selected", null);
    u(this, "scroll", 0);
    u(this, "dragStartY", 0);
    u(this, "dragStartScroll", 0);
    u(this, "dragging", !1);
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
    u(this, "giftRect", { x: c - 250, y: 32, w: 226, h: 54 });
    u(this, "detailCloseRect", { x: c / 2 - 210, y: b / 2 + 250, w: 190, h: 70 });
    u(this, "detailShareRect", { x: c / 2 + 20, y: b / 2 + 250, w: 190, h: 70 });
  }
  enter() {
    ((this.selected = null), (this.scroll = 0));
  }
  exit() {}
  update(e) {
    this.time += e;
  }
  get maxScroll() {
    const e = Math.ceil(ve.totalCount / ht);
    return Math.max(0, (e - ys) * (oo + Tt));
  }
  gridStartX() {
    return (c - (ht * to + (ht - 1) * Tt)) / 2;
  }
  cellRect(e) {
    const o = e % ht,
      a = Math.floor(e / ht);
    return { x: this.gridStartX() + o * (to + Tt), y: ao + a * (oo + Tt) - this.scroll, w: to, h: oo };
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      Y(e, this.giftRect.x, this.giftRect.y, this.giftRect.w, this.giftRect.h, "HEDİYE DÜKKANI", "green", {
        icon: "🎁",
      }),
      de(e, c / 2, 150, 560, "OYUNCAK KOLEKSİYONU", 30));
    const o = 210,
      a = b - 300;
    le(e, 24, o, c - 48, a, 24);
    const l = ve.ownedCount(),
      n = ve.totalCount;
    P(e, `${l} / ${n}`, c / 2, 262, {
      size: 40,
      color: M.goldLight,
      weight: 900,
      outline: "#08172c",
      outlineWidth: 5,
    });
    const i = c - 180,
      s = 90;
    if (
      (m(e, s, 296, i, 22, 11),
      (e.fillStyle = "rgba(0,0,0,0.45)"),
      e.fill(),
      (e.strokeStyle = p(M.gold, 0.7)),
      (e.lineWidth = 2),
      e.stroke(),
      l > 0)
    ) {
      m(e, s + 3, 299, Math.max(16, (i - 6) * (l / n)), 16, 8);
      const h = e.createLinearGradient(s, 0, s + i, 0);
      (h.addColorStop(0, M.goldLight), h.addColorStop(1, "#f0682a"), (e.fillStyle = h), e.fill());
    }
    P(e, "Hediye Dükkanı'ndan al · Boss bölümlerinde ve Yıldız Yolu'nda kazan", c / 2, 344, {
      size: 16,
      color: p(M.cream, 0.75),
      weight: 600,
    });
    const r = ao - 22,
      f = o + a - r - 16;
    if (
      (e.save(),
      e.beginPath(),
      e.rect(0, r, c, f),
      e.clip(),
      ve.list().forEach((h, d) => {
        const y = this.cellRect(d);
        y.y + y.h < r || y.y > r + f || this.drawCell(e, h, y);
      }),
      e.restore(),
      this.maxScroll > 0)
    ) {
      const h = f - 20,
        d = Math.max(50, h * (f / (f + this.maxScroll))),
        y = r + 10 + (h - d) * (this.scroll / this.maxScroll);
      (m(e, c - 48, y, 8, d, 4), (e.fillStyle = p(M.gold, 0.6)), e.fill());
    }
    this.selected && this.renderDetail(e, this.selected);
  }
  drawCell(e, o, a) {
    const l = ve.defOf(o.id),
      n = rt(l.rarity);
    Me(e, a.x, a.y, a.w, a.h, { locked: !o.owned });
    const i = a.x + a.w / 2,
      s = a.y + a.h / 2 - 22;
    if (o.owned) {
      const r = Math.sin(this.time * 1.6 + a.x * 0.02) * 4;
      (ze(e, o.id, i, s + r, 88),
        P(e, l.name, i, a.y + a.h - 54, {
          size: Math.min(13, (a.w - 14) / (l.name.length * 0.56)),
          color: M.cream,
          weight: 800,
        }),
        m(e, a.x + 18, a.y + a.h - 36, a.w - 36, 22, 11),
        (e.fillStyle = p(n, 0.32)),
        e.fill(),
        (e.strokeStyle = n),
        (e.lineWidth = 1.5),
        e.stroke(),
        P(e, l.rarity, i, a.y + a.h - 25, { size: 11, color: n, weight: 900 }),
        o.data &&
          o.data.count > 1 &&
          (m(e, a.x + a.w - 46, a.y + 8, 38, 24, 12),
          (e.fillStyle = M.red),
          e.fill(),
          (e.strokeStyle = "#ffffff"),
          (e.lineWidth = 1.5),
          e.stroke(),
          P(e, `x${o.data.count}`, a.x + a.w - 27, a.y + 20, { size: 12, color: "#fff", weight: 900 })));
    } else
      (e.save(),
        (e.globalAlpha = 0.14),
        ze(e, o.id, i, s, 82),
        e.restore(),
        Ua(e, i, s + 6, 30),
        P(e, "???", i, a.y + a.h - 50, { size: 13, color: p(M.cream, 0.45), weight: 800 }),
        P(e, cs(l.rarity), i, a.y + a.h - 26, { size: 11, color: p(n, 0.75), weight: 700 }));
  }
  renderDetail(e, o) {
    (e.save(), (e.fillStyle = "rgba(4,10,22,0.84)"), e.fillRect(0, 0, c, b), e.restore());
    const a = ve.defOf(o.id),
      l = rt(a.rarity),
      n = 520,
      i = 620,
      s = c / 2 - n / 2,
      r = b / 2 - 300;
    le(e, s, r, n, i, 26);
    const f = c / 2;
    if (
      (ze(e, o.id, f, r + 200, 220, { rotation: Math.sin(this.time * 1.3) * 0.05 }),
      P(e, a.name.toUpperCase(), f, r + 360, {
        size: 30,
        color: "#ffffff",
        weight: 900,
        outline: "#08172c",
        outlineWidth: 4,
      }),
      m(e, f - 100, r + 388, 200, 40, 20),
      (e.fillStyle = p(l, 0.3)),
      e.fill(),
      (e.strokeStyle = l),
      (e.lineWidth = 2.5),
      e.stroke(),
      P(e, a.rarity, f, r + 408, { size: 17, color: l, weight: 900 }),
      o.data)
    ) {
      const h = new Date(o.data.firstWonAt).toLocaleDateString("tr-TR");
      (P(e, `İlk kazanma: ${h}`, f, r + 452, { size: 15, color: p(M.cream, 0.8) }),
        P(e, `Kazanılma sayısı: ${o.data.count}`, f, r + 480, { size: 15, color: p(M.cream, 0.8) }));
    }
    (Y(
      e,
      this.detailCloseRect.x,
      this.detailCloseRect.y,
      this.detailCloseRect.w,
      this.detailCloseRect.h,
      "KAPAT",
      "blue",
    ),
      Y(
        e,
        this.detailShareRect.x,
        this.detailShareRect.y,
        this.detailShareRect.w,
        this.detailShareRect.h,
        "GÖNDER",
        "green",
        { icon: "📤" },
      ));
  }
  onPointerDown(e) {
    if (this.selected) {
      W(
        e.x,
        e.y,
        this.detailCloseRect.x,
        this.detailCloseRect.y,
        this.detailCloseRect.w,
        this.detailCloseRect.h,
      )
        ? (this.selected = null)
        : W(
            e.x,
            e.y,
            this.detailShareRect.x,
            this.detailShareRect.y,
            this.detailShareRect.w,
            this.detailShareRect.h,
          ) && Da.shareToy(this.selected.id);
      return;
    }
    if (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
      V.goto("mainMenu");
      return;
    }
    if (W(e.x, e.y, this.giftRect.x, this.giftRect.y, this.giftRect.w, this.giftRect.h)) {
      V.goto("giftShop");
      return;
    }
    ((this.dragging = !0), (this.dragStartY = e.y), (this.dragStartScroll = this.scroll));
  }
  onPointerMove(e) {
    this.dragging &&
      (this.scroll = Math.max(0, Math.min(this.maxScroll, this.dragStartScroll - (e.y - this.dragStartY))));
  }
  onPointerUp(e) {
    if (this.selected) return;
    const o = this.dragging && Math.abs(e.y - this.dragStartY) > 12;
    ((this.dragging = !1),
      !o &&
        ve.list().forEach((a, l) => {
          const n = this.cellRect(l);
          n.y < ao - 60 ||
            (W(e.x, e.y, n.x, n.y, n.w, n.h) && a.owned && ((this.selected = a), z.play("button")));
        }));
  }
}
class gs {
  priceOf(e) {
    return ka[he[e].rarity];
  }
  canAfford(e) {
    return K.coins >= this.priceOf(e);
  }
  redeem(e) {
    const o = this.priceOf(e);
    return K.spendCoins(o) ? (kt.grant(e), !0) : !1;
  }
}
const sa = new gs(),
  dt = 3,
  lo = 200,
  no = 236,
  Ot = 16,
  io = 456,
  so = 200,
  Ms = 3;
class Ps {
  constructor() {
    u(this, "name", "giftShop");
    u(this, "time", 0);
    u(this, "message", "");
    u(this, "messageTimer", 0);
    u(this, "scroll", 0);
    u(this, "dragStartY", 0);
    u(this, "dragStartScroll", 0);
    u(this, "dragging", !1);
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
    u(this, "lootBoxRect", { x: 60, y: 316, w: c - 120, h: 120 });
  }
  enter() {
    ((this.message = ""), (this.messageTimer = 0), (this.scroll = 0));
  }
  exit() {}
  update(e) {
    ((this.time += e), this.messageTimer > 0 && (this.messageTimer -= e));
  }
  get maxScroll() {
    const e = Math.ceil(ge.length / dt);
    return Math.max(0, (e - Ms) * (no + Ot));
  }
  cellRect(e) {
    const o = e % dt,
      a = Math.floor(e / dt);
    return {
      x: (c - (dt * lo + (dt - 1) * Ot)) / 2 + o * (lo + Ot),
      y: io + a * (no + Ot) - this.scroll,
      w: lo,
      h: no,
    };
  }
  buy(e) {
    sa.redeem(e)
      ? ((Z.pendingToy = e), (Z.rewardReturnScene = "giftShop"), V.goto("reward"))
      : ((this.message = "Yetersiz jeton! Daha fazla bölüm oyna."),
        (this.messageTimer = 2.2),
        z.play("penalty"));
  }
  openLootBox() {
    if (!K.spendCoins(so)) {
      ((this.message = "Yetersiz jeton!"), (this.messageTimer = 2.2), z.play("penalty"));
      return;
    }
    const e = kt.awardFromPool(ge);
    ((Z.pendingToy = e), (Z.rewardReturnScene = "giftShop"), V.goto("reward"));
  }
  renderLootBox(e) {
    const o = this.lootBoxRect;
    Me(e, o.x, o.y, o.w, o.h, { selected: !0, radius: 20 });
    const a = o.x + 70,
      l = o.y + o.h / 2,
      n = Math.sin(this.time * 2.4) * 4;
    (e.save(), e.translate(a, l + n), e.rotate(Math.sin(this.time * 1.6) * 0.08), m(e, -34, -26, 68, 52, 8));
    const i = e.createLinearGradient(0, -26, 0, 26);
    (i.addColorStop(0, "#a52a2a"),
      i.addColorStop(1, "#6e1c1c"),
      (e.fillStyle = i),
      e.fill(),
      (e.strokeStyle = M.gold),
      (e.lineWidth = 3),
      e.stroke(),
      (e.fillStyle = M.gold),
      e.fillRect(-8, -26, 16, 52),
      P(e, "?", 0, 0, { size: 26, color: "#fff6d0", weight: 900 }),
      e.restore(),
      P(e, "ŞANS SANDIĞI", o.x + 140, o.y + 36, { size: 19, color: "#ffffff", weight: 900, align: "left" }),
      P(e, "Tamamen rastgele bir oyuncak - LEGENDARY bile çıkabilir!", o.x + 140, o.y + 62, {
        size: 12,
        color: p(M.cream, 0.72),
        weight: 600,
        align: "left",
      }),
      Y(e, o.x + o.w - 168, o.y + o.h - 54, 148, 40, `${so} JETON`, "gold", {
        disabled: K.coins < so,
        icon: "🎲",
      }));
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      Le(e, c - 130, 58, K.coins, 22),
      de(e, c / 2, 150, 520, "HEDİYE DÜKKANI", 30));
    const o = 210,
      a = b - 300;
    (le(e, 24, o, c - 48, a, 24),
      P(e, "İSTEDİĞİN OYUNCAĞI SEÇ, ARKADAŞINA GÖNDER", c / 2, 268, {
        size: 18,
        color: M.goldLight,
        weight: 900,
      }),
      P(e, "Bölüm ödülü rastgele gelir — burada seçim senin.", c / 2, 300, {
        size: 15,
        color: p(M.cream, 0.72),
        weight: 600,
      }),
      this.renderLootBox(e));
    const l = io - 20,
      n = o + a - l - 16;
    if (
      (e.save(),
      e.beginPath(),
      e.rect(0, l, c, n),
      e.clip(),
      ge.forEach((i, s) => {
        const r = this.cellRect(s);
        r.y + r.h < l || r.y > l + n || this.drawCell(e, i, r);
      }),
      e.restore(),
      this.maxScroll > 0)
    ) {
      const i = n - 20,
        s = Math.max(50, i * (n / (n + this.maxScroll))),
        r = l + 10 + (i - s) * (this.scroll / this.maxScroll);
      (m(e, c - 48, r, 8, s, 4), (e.fillStyle = p(M.gold, 0.6)), e.fill());
    }
    this.messageTimer > 0 &&
      (e.save(),
      (e.globalAlpha = Math.min(1, this.messageTimer * 2.5)),
      m(e, c / 2 - 230, b - 180, 460, 60, 30),
      (e.fillStyle = "rgba(0,0,0,0.75)"),
      e.fill(),
      (e.strokeStyle = "#ff8a7a"),
      (e.lineWidth = 2.5),
      e.stroke(),
      P(e, this.message, c / 2, b - 150, { size: 17, color: "#ff9ea8", weight: 800 }),
      e.restore());
  }
  drawCell(e, o, a) {
    const l = he[o],
      n = sa.priceOf(o),
      i = K.coins >= n,
      s = rt(l.rarity);
    Me(e, a.x, a.y, a.w, a.h, { locked: !i, radius: 16 });
    const r = a.x + a.w / 2;
    (e.save(), i || (e.globalAlpha = 0.55));
    const f = Math.sin(this.time * 1.6 + a.x * 0.02) * 4;
    (ze(e, o, r, a.y + 78 + f, 92),
      e.restore(),
      P(e, l.name, r, a.y + 146, {
        size: Math.min(14, (a.w - 18) / (l.name.length * 0.56)),
        color: M.cream,
        weight: 800,
      }),
      m(e, r - 52, a.y + 158, 104, 22, 11),
      (e.fillStyle = p(s, 0.32)),
      e.fill(),
      (e.strokeStyle = s),
      (e.lineWidth = 1.5),
      e.stroke(),
      P(e, l.rarity, r, a.y + 169, { size: 10.5, color: s, weight: 900 }),
      Y(e, a.x + 16, a.y + a.h - 50, a.w - 32, 38, `${n}`, "gold", { disabled: !i, icon: "🪙" }));
  }
  onPointerDown(e) {
    if (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
      V.goto("collection");
      return;
    }
    if (W(e.x, e.y, this.lootBoxRect.x, this.lootBoxRect.y, this.lootBoxRect.w, this.lootBoxRect.h)) {
      this.openLootBox();
      return;
    }
    ((this.dragging = !0), (this.dragStartY = e.y), (this.dragStartScroll = this.scroll));
  }
  onPointerMove(e) {
    this.dragging &&
      (this.scroll = Math.max(0, Math.min(this.maxScroll, this.dragStartScroll - (e.y - this.dragStartY))));
  }
  onPointerUp(e) {
    const o = this.dragging && Math.abs(e.y - this.dragStartY) > 12;
    if (((this.dragging = !1), !o))
      for (let a = 0; a < ge.length; a++) {
        const l = this.cellRect(a);
        if (!(l.y < io - 60) && W(e.x, e.y, l.x, l.y, l.w, l.h)) {
          this.buy(ge[a]);
          return;
        }
      }
  }
}
const As = ["TOPLAR", "GÜÇLENDİRİCİLER", "JETONLAR"],
  ra = [
    {
      id: "shots_3",
      title: "3 ATIŞ HAKKI",
      desc: "Bölüm içinde 3 fazladan top",
      price: 150,
      icon: "shot",
      apply: () => K.addShots(3),
    },
    {
      id: "shots_10",
      title: "10 ATIŞ HAKKI",
      desc: "Uzun oyun için büyük paket",
      price: 400,
      icon: "shot",
      apply: () => K.addShots(10),
    },
    {
      id: "ticket_1",
      title: "1 BİLET",
      desc: "Oyun içi güçlendirmeleri açar",
      price: 250,
      icon: "ticket",
      apply: () => K.addTickets(1),
    },
    {
      id: "ticket_5",
      title: "5 BİLET",
      desc: "ÇİFT PUAN'ı bol bol kullan",
      price: 1e3,
      icon: "ticket",
      apply: () => K.addTickets(5),
    },
  ],
  gt = 5,
  bo = 500,
  fa = [
    { id: "ad", amount: 50, bonus: "ÜCRETSİZ", priceLabel: "REKLAM İZLE", kind: "ad" },
    { id: "gem", amount: bo, bonus: `${gt} 💎 KARŞILIĞI`, priceLabel: `${gt} ELMAS`, kind: "gem" },
    { id: "p100", amount: 100, bonus: "", priceLabel: "₺9,99", kind: "iap" },
    { id: "p550", amount: 550, bonus: "+%10 BONUS", priceLabel: "₺39,99", kind: "iap", highlight: !0 },
    { id: "p1200", amount: 1200, bonus: "+%20 BONUS", priceLabel: "₺79,99", kind: "iap" },
  ],
  ha = 400,
  ro = 300,
  fo = 262,
  Gt = 24;
class ks {
  constructor() {
    u(this, "name", "shop");
    u(this, "time", 0);
    u(this, "tab", 0);
    u(this, "message", "");
    u(this, "messageColor", M.gold);
    u(this, "messageTimer", 0);
    u(this, "tabRects", []);
    u(this, "cardRects", []);
    u(this, "watchingAd", !1);
    u(this, "adProgress", 0);
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
    u(this, "plusRect", { x: c - 78, y: 26, w: 64, h: 64 });
  }
  enter() {
    ((this.tab = 0), (this.message = ""), (this.messageTimer = 0));
  }
  exit() {}
  update(e) {
    ((this.time += e), this.messageTimer > 0 && (this.messageTimer -= e));
  }
  toast(e, o) {
    ((this.message = e),
      (this.messageColor = o ? M.goldLight : "#ff8a7a"),
      (this.messageTimer = 2),
      z.play(o ? "coin" : "penalty"));
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      Le(e, c / 2 + 60, this.plusRect.y + 32, K.coins, 20),
      Le(e, c / 2 + 200, this.plusRect.y + 32, K.gems, 18, "gem"),
      me(e, this.plusRect.x + 32, this.plusRect.y + 32, 32, "+"),
      de(e, c / 2, 150, 460, "MAĞAZA", 34));
    const o = this.tab === 0 ? jo.length : this.tab === 1 ? ra.length : fa.length,
      a = Math.ceil(o / 2),
      l = ha - 210 + a * (fo + Gt) + 24;
    if (
      (le(e, 24, 210, c - 48, l, 24),
      (this.tabRects = Il(e, 46, 244, c - 92, 66, As, this.tab)),
      P(e, this.tabSubtitle(), c / 2, 348, { size: 17, color: p(M.cream, 0.78), weight: 600 }),
      (this.cardRects = []),
      this.tab === 0 ? this.renderBalls(e) : this.tab === 1 ? this.renderBoosts(e) : this.renderCoins(e),
      this.messageTimer > 0)
    ) {
      const n = Math.min(1, this.messageTimer * 2.5);
      (e.save(),
        (e.globalAlpha = n),
        m(e, c / 2 - 240, b - 200, 480, 62, 31),
        (e.fillStyle = "rgba(0,0,0,0.72)"),
        e.fill(),
        (e.strokeStyle = this.messageColor),
        (e.lineWidth = 2.5),
        e.stroke(),
        P(e, this.message, c / 2, b - 169, { size: 19, color: this.messageColor, weight: 800 }),
        e.restore());
    }
    this.watchingAd && this.renderAdOverlay(e);
  }
  tabSubtitle() {
    return this.tab === 0
      ? "Seçtiğin top oyunda GERÇEKTEN fark yaratır."
      : this.tab === 1
        ? "Atış hakkı ve bilet paketleri — jetonla al."
        : "Jeton biterse buradan doldur.";
  }
  cardPos(e) {
    const o = e % 2,
      a = Math.floor(e / 2),
      l = ro * 2 + Gt,
      n = (c - l) / 2 + o * (ro + Gt),
      i = ha + a * (fo + Gt);
    return { x: n, y: i, w: ro, h: fo };
  }
  renderBalls(e) {
    jo.forEach((o, a) => {
      const l = Bt[o],
        n = this.cardPos(a),
        i = ye.ownsBall(o),
        s = ye.selectedBall === o;
      Me(e, n.x, n.y, n.w, n.h, { selected: s });
      const r = n.x + n.w / 2,
        f = Math.sin(this.time * 2 + a) * 3;
      if (
        (Pt(e, r, n.y + 74 + f, 38, o, this.time * 0.6),
        P(e, l.name.toUpperCase(), r, n.y + 134, { size: 20, color: M.cream, weight: 900 }),
        this.wrapText(e, l.desc, r, n.y + 162, n.w - 34, 14),
        s)
      )
        (ja(e, n.x + n.w - 28, n.y + 28, 16),
          Y(e, n.x + 26, n.y + n.h - 62, n.w - 52, 46, "KULLANILIYOR", "green", { disabled: !0 }));
      else if (i)
        (Y(e, n.x + 26, n.y + n.h - 62, n.w - 52, 46, "SEÇ", "blue"),
          this.cardRects.push({
            rect: { x: n.x + 26, y: n.y + n.h - 62, w: n.w - 52, h: 46 },
            act: () => {
              (ye.selectBall(o), this.toast(`${l.name} seçildi!`, !0));
            },
          }));
      else {
        const h = K.coins >= l.price;
        (Y(e, n.x + 26, n.y + n.h - 62, n.w - 52, 46, `${l.price} JETON`, "gold", { disabled: !h }),
          this.cardRects.push({
            rect: { x: n.x + 26, y: n.y + n.h - 62, w: n.w - 52, h: 46 },
            act: () => this.buyBall(o),
          }));
      }
    });
  }
  buyBall(e) {
    const o = Bt[e],
      a = ye.listItems().find((n) => n.kind === "ball" && n.ballType === e);
    if (!a) return;
    const l = ye.purchase(a);
    this.toast(l ? `${o.name} alındı ve seçildi!` : "Yetersiz jeton!", l);
  }
  renderBoosts(e) {
    ra.forEach((o, a) => {
      const l = this.cardPos(a);
      Me(e, l.x, l.y, l.w, l.h);
      const n = l.x + l.w / 2,
        i = l.y + 72;
      (o.icon === "shot" ? Tl(e, n, i, 34) : this.drawTicketIcon(e, n, i, 46),
        P(e, o.title, n, l.y + 134, { size: 20, color: M.cream, weight: 900 }),
        this.wrapText(e, o.desc, n, l.y + 162, l.w - 34, 14));
      const s = K.coins >= o.price;
      (Y(e, l.x + 26, l.y + l.h - 62, l.w - 52, 46, `${o.price} JETON`, "gold", { disabled: !s }),
        this.cardRects.push({
          rect: { x: l.x + 26, y: l.y + l.h - 62, w: l.w - 52, h: 46 },
          act: () => {
            if (!K.spendCoins(o.price)) {
              this.toast("Yetersiz jeton!", !1);
              return;
            }
            (o.apply(), this.toast(`${o.title} eklendi!`, !0));
          },
        }));
    });
  }
  renderCoins(e) {
    fa.forEach((o, a) => {
      const l = this.cardPos(a);
      Me(e, l.x, l.y, l.w, l.h, { selected: o.highlight });
      const n = l.x + l.w / 2;
      if (
        (this.drawCoinStack(e, n, l.y + 76, o.amount),
        P(e, `${o.amount} JETON`, n, l.y + 140, { size: 22, color: M.goldLight, weight: 900 }),
        o.bonus)
      ) {
        const r = o.kind === "ad" ? M.green : o.kind === "gem" ? M.blue : M.red;
        (m(e, n - 62, l.y + 158, 124, 26, 13),
          (e.fillStyle = p(r, 0.35)),
          e.fill(),
          (e.strokeStyle = o.kind === "ad" ? M.greenLight : o.kind === "gem" ? "#7fd6ff" : M.redLight),
          (e.lineWidth = 1.5),
          e.stroke(),
          P(e, o.bonus, n, l.y + 171, { size: 12, color: "#ffffff", weight: 800 }));
      }
      const i = o.kind === "ad" && nt.canShow() && !this.watchingAd,
        s = o.kind === "gem" && K.gems >= gt;
      (Y(
        e,
        l.x + 26,
        l.y + l.h - 62,
        l.w - 52,
        46,
        o.kind === "ad" && !i ? "BİRAZDAN" : o.priceLabel,
        o.kind === "ad" ? "green" : o.kind === "gem" ? "blue" : "gold",
        {
          disabled: (o.kind === "ad" && !i) || (o.kind === "gem" && !s),
          icon: o.kind === "ad" ? "▶" : o.kind === "gem" ? "💎" : void 0,
        },
      ),
        this.cardRects.push({
          rect: { x: l.x + 26, y: l.y + l.h - 62, w: l.w - 52, h: 46 },
          act: () => {
            o.kind === "ad"
              ? this.watchAdForCoins(o.amount)
              : o.kind === "gem"
                ? this.exchangeGems()
                : this.toast("Gerçek satın alma mağaza sürümünde açılır.", !1);
          },
        }));
    });
  }
  async watchAdForCoins(e) {
    if (this.watchingAd || !nt.canShow()) return;
    ((this.watchingAd = !0), (this.adProgress = 0));
    const o = await nt.showRewarded((a) => (this.adProgress = a));
    ((this.watchingAd = !1), o === "rewarded" && (K.addCoins(e), this.toast(`+${e} jeton kazandın!`, !0)));
  }
  exchangeGems() {
    if (!K.spendGems(gt)) {
      this.toast("Yetersiz elmas!", !1);
      return;
    }
    (K.addCoins(bo), this.toast(`${gt} elmas → ${bo} jeton!`, !0));
  }
  renderAdOverlay(e) {
    (e.save(),
      (e.fillStyle = "rgba(4,10,22,0.86)"),
      e.fillRect(0, 0, c, b),
      P(e, "REKLAM İZLENİYOR...", c / 2, b / 2 - 40, { size: 28, color: M.cream, weight: 900 }));
    const o = 460,
      a = c / 2 - o / 2,
      l = b / 2 + 10;
    (m(e, a, l, o, 26, 13),
      (e.fillStyle = "rgba(255,255,255,0.15)"),
      e.fill(),
      m(e, a, l, Math.max(26, o * this.adProgress), 26, 13),
      (e.fillStyle = M.greenLight),
      e.fill(),
      e.restore());
  }
  wrapText(e, o, a, l, n, i) {
    (e.save(), (e.font = `600 ${i}px 'Segoe UI', sans-serif`));
    const s = o.split(" "),
      r = [];
    let f = "";
    for (const h of s) {
      const d = f ? `${f} ${h}` : h;
      e.measureText(d).width > n && f ? (r.push(f), (f = h)) : (f = d);
    }
    (f && r.push(f),
      e.restore(),
      r.slice(0, 2).forEach((h, d) => {
        P(e, h, a, l + d * (i + 5), { size: i, color: p(M.cream, 0.72), weight: 600 });
      }));
  }
  drawTicketIcon(e, o, a, l) {
    e.save();
    const n = l * 0.62;
    m(e, o - l / 2, a - n / 2, l, n, 6);
    const i = e.createLinearGradient(0, a - n / 2, 0, a + n / 2);
    (i.addColorStop(0, "#ffd97a"),
      i.addColorStop(1, "#d99b1f"),
      (e.fillStyle = i),
      e.fill(),
      (e.strokeStyle = j(M.gold, 40)),
      (e.lineWidth = 2),
      e.stroke(),
      (e.fillStyle = M.cardBottom),
      [-1, 1].forEach((s) => {
        (e.beginPath(), e.arc(o + (s * l) / 2, a, n * 0.18, 0, Math.PI * 2), e.fill());
      }),
      P(e, "★", o, a, { size: n * 0.55, color: "#8a5a10", weight: 900, shadow: !1 }),
      e.restore());
  }
  drawCoinStack(e, o, a, l) {
    const n = l >= 1e3 ? 5 : l >= 500 ? 4 : l >= 100 ? 3 : 2;
    e.save();
    for (let i = 0; i < n; i++) {
      const s = a + 16 - i * 9,
        r = 30;
      (e.beginPath(), e.ellipse(o, s, r, r * 0.42, 0, 0, Math.PI * 2));
      const f = e.createLinearGradient(o - r, s, o + r, s);
      (f.addColorStop(0, "#c98d00"),
        f.addColorStop(0.45, "#ffe9a0"),
        f.addColorStop(1, "#b47c00"),
        (e.fillStyle = f),
        e.fill(),
        (e.strokeStyle = "#8a6100"),
        (e.lineWidth = 1.4),
        e.stroke());
    }
    e.restore();
  }
  onPointerDown(e) {
    if (!this.watchingAd) {
      if (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
        V.goto("mainMenu");
        return;
      }
      if (W(e.x, e.y, this.plusRect.x, this.plusRect.y, this.plusRect.w, this.plusRect.h)) {
        ((this.tab = 2), z.play("button"));
        return;
      }
      for (let o = 0; o < this.tabRects.length; o++) {
        const a = this.tabRects[o];
        if (W(e.x, e.y, a.x, a.y, a.w, a.h)) {
          ((this.tab = o), z.play("button"));
          return;
        }
      }
      for (const o of this.cardRects)
        if (W(e.x, e.y, o.rect.x, o.rect.y, o.rect.w, o.rect.h)) {
          o.act();
          return;
        }
    }
  }
  onPointerUp(e) {}
}
const Ss = 24 * 60 * 60 * 1e3;
function Rs(t, e) {
  const o = new Date(t),
    a = new Date(e);
  return o.getFullYear() === a.getFullYear() && o.getMonth() === a.getMonth() && o.getDate() === a.getDate();
}
class ms {
  canClaimToday() {
    const e = U.get().lastDailyClaim;
    return e ? !Rs(e, Date.now()) : !0;
  }
  get currentDayIndex() {
    const e = U.get();
    return e.lastDailyClaim ? ((Date.now() - e.lastDailyClaim > Ss * 2 ? 0 : e.dailyStreak) % 7) + 1 : 1;
  }
  get schedule() {
    return qo;
  }
  claim() {
    if (!this.canClaimToday()) return null;
    const e = this.currentDayIndex,
      o = qo[e - 1];
    let a;
    return (
      o.coins && K.addCoins(o.coins),
      o.shots && K.addShots(o.shots),
      o.randomToy && (a = kt.awardFromPool(ge)),
      U.update((l) => {
        ((l.dailyStreak = e), (l.lastDailyClaim = Date.now()));
      }),
      { day: e, label: o.label, toyId: a }
    );
  }
}
const ut = new ms(),
  ho = ["unicorn", "cat", "heart", "fairy"],
  Kt = 4,
  uo = 148,
  da = 158,
  po = 14,
  zs = 330;
class js {
  constructor() {
    u(this, "name", "dailyReward");
    u(this, "time", 0);
    u(this, "claimedToyId", null);
    u(this, "resultMessage", "");
    u(this, "claimFlash", 0);
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
    u(this, "claimRect", { x: c / 2 - 210, y: 1062, w: 420, h: 104 });
  }
  enter() {
    ((this.claimedToyId = null), (this.resultMessage = ""), (this.claimFlash = 0));
  }
  exit() {}
  claim() {
    const e = ut.claim();
    e &&
      ((this.resultMessage = `GÜN ${e.day}: ${e.label}`),
      (this.claimedToyId = e.toyId ?? null),
      (this.claimFlash = 1),
      z.play("bigwin"));
  }
  update(e) {
    ((this.time += e), this.claimFlash > 0 && (this.claimFlash = Math.max(0, this.claimFlash - e * 0.7)));
  }
  countdown() {
    const e = new Date(),
      o = new Date(e);
    o.setHours(24, 0, 0, 0);
    const a = o.getTime() - e.getTime(),
      l = Math.floor(a / 36e5),
      n = Math.floor((a % 36e5) / 6e4),
      i = Math.floor((a % 6e4) / 1e3);
    return `${String(l).padStart(2, "0")}:${String(n).padStart(2, "0")}:${String(i).padStart(2, "0")}`;
  }
  cellRect(e) {
    const o = e % Kt,
      a = Math.floor(e / Kt);
    return { x: (c - (Kt * uo + (Kt - 1) * po)) / 2 + o * (uo + po), y: zs + a * (da + po), w: uo, h: da };
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      Le(e, c - 130, 58, K.coins, 22),
      de(e, c / 2, 150, 480, "GÜNLÜK ÖDÜL", 30),
      le(e, 24, 210, c - 48, 490, 24));
    const l = ut.canClaimToday(),
      n = ut.currentDayIndex;
    (P(e, l ? "BUGÜNKÜ ÖDÜLÜN HAZIR!" : `SONRAKİ ÖDÜL: ${this.countdown()}`, c / 2, 268, {
      size: 20,
      color: l ? M.goldLight : p(M.cream, 0.8),
      weight: 900,
    }),
      P(e, "7 gün üst üste gir, seriyi bozma!", c / 2, 298, {
        size: 15,
        color: p(M.cream, 0.65),
        weight: 600,
      }),
      ut.schedule.forEach((s, r) => {
        const f = this.cellRect(r),
          h = s.day === n,
          d = s.day < n,
          y = h && l;
        (Me(e, f.x, f.y, f.w, f.h, { selected: y, locked: !d && !h, radius: 16 }),
          y &&
            (e.save(),
            (e.globalAlpha = 0.25 + 0.2 * Math.sin(this.time * 4)),
            m(e, f.x, f.y, f.w, f.h, 16),
            (e.fillStyle = M.gold),
            e.fill(),
            e.restore()));
        const g = f.x + f.w / 2;
        if (
          (P(e, `GÜN ${s.day}`, g, f.y + 24, {
            size: 14,
            color: y ? M.goldLight : p(M.cream, 0.75),
            weight: 900,
          }),
          s.bonusBall)
        )
          Pt(e, g, f.y + 76, 22, "bonus", 0);
        else {
          const A = s.randomToy ? "🧸" : s.shots ? "🎯" : "🪙";
          P(e, A, g, f.y + 76, { size: 40, shadow: !1 });
        }
        (P(e, s.label, g, f.y + f.h - 26, {
          size: Math.min(13, (f.w - 16) / (s.label.length * 0.55)),
          color: M.goldLight,
          weight: 800,
        }),
          d && ja(e, f.x + f.w - 24, f.y + 22, 14));
      }));
    const i = this.cellRect(6);
    (P(e, "7. GÜN", i.x + i.w + 90, i.y + i.h / 2 - 22, { size: 17, color: M.goldLight, weight: 900 }),
      P(e, "BÜYÜK ÖDÜL", i.x + i.w + 90, i.y + i.h / 2 + 4, { size: 20, color: "#ffffff", weight: 900 }),
      P(e, "Rastgele oyuncak", i.x + i.w + 90, i.y + i.h / 2 + 30, {
        size: 13,
        color: p(M.cream, 0.7),
        weight: 600,
      }),
      this.renderShowcase(e),
      this.resultMessage &&
        (Me(e, c / 2 - 240, 1196, 480, 120, { selected: !0, radius: 20 }),
        P(e, this.resultMessage, c / 2, 1230, { size: 20, color: M.goldLight, weight: 900 }),
        this.claimedToyId
          ? (ze(e, this.claimedToyId, c / 2 - 150, 1258, 74),
            P(e, he[this.claimedToyId].name.toUpperCase(), c / 2 + 30, 1262, {
              size: 17,
              color: "#ffffff",
              weight: 800,
            }),
            P(e, "koleksiyonuna eklendi", c / 2 + 30, 1288, { size: 13, color: p(M.cream, 0.7) }))
          : P(e, "Hesabına eklendi!", c / 2, 1272, { size: 16, color: p(M.cream, 0.8) })),
      Y(
        e,
        this.claimRect.x,
        this.claimRect.y,
        this.claimRect.w,
        this.claimRect.h,
        l ? "ÖDÜLÜ AL" : "BUGÜN ALINDI",
        l ? "green" : "blue",
        { disabled: !l, icon: l ? "🎁" : "✓" },
      ));
  }
  renderShowcase(e) {
    (le(e, 24, 730, c - 48, 300, 24),
      de(e, c / 2, 730, 420, "BU HAFTANIN ÖDÜLLERİ", 21),
      ho.forEach((l, n) => {
        const i = 24 + ((c - 48) / ho.length) * (n + 0.5),
          s = 880 + Math.sin(this.time * 1.6 + n * 0.9) * 6,
          r = !!U.get().toys[l];
        (e.save(),
          r || (e.globalAlpha = 0.4),
          ze(e, l, i, s, 108),
          e.restore(),
          P(e, r ? `✓ ${he[l].name}` : he[l].name, i, 956, {
            size: ct(e, he[l].name, (c - 48) / ho.length - 12, 14, 800),
            color: r ? M.greenLight : p(M.cream, 0.82),
            weight: 800,
          }));
      }),
      P(e, "Seriyi 7 güne tamamla, oyuncak şansını yakala!", c / 2, 992, {
        size: 14,
        color: p(M.cream, 0.7),
        weight: 600,
      }));
  }
  onPointerDown(e) {
    if (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
      V.goto("mainMenu");
      return;
    }
    W(e.x, e.y, this.claimRect.x, this.claimRect.y, this.claimRect.w, this.claimRect.h) &&
      ut.canClaimToday() &&
      this.claim();
  }
  onPointerUp(e) {}
}
class Us {
  constructor() {
    u(this, "name", "settings");
    u(this, "time", 0);
    u(this, "confirmingReset", !1);
    u(
      this,
      "soundButton",
      new Te({ x: c / 2 - 220, y: 290, w: 440, h: 90, label: "", onClick: () => this.toggleSound() }),
    );
    u(
      this,
      "musicButton",
      new Te({ x: c / 2 - 220, y: 396, w: 440, h: 90, label: "", onClick: () => this.toggleMusic() }),
    );
    u(
      this,
      "vibrationButton",
      new Te({ x: c / 2 - 220, y: 502, w: 440, h: 90, label: "", onClick: () => this.toggleVibration() }),
    );
    u(
      this,
      "nameButton",
      new Te({
        x: c / 2 - 220,
        y: 690,
        w: 440,
        h: 90,
        label: "İSMİMİ DEĞİŞTİR",
        icon: "✏️",
        colorTop: v.uiTeal,
        colorBottom: j(v.uiTeal, 35),
        fontSize: 20,
        onClick: () => {
          ((Z.nameReturnScene = "settings"), V.goto("nameEntry"));
        },
      }),
    );
    u(
      this,
      "resetButton",
      new Te({
        x: c / 2 - 220,
        y: 800,
        w: 440,
        h: 90,
        label: "İLERLEMEYİ SIFIRLA",
        icon: "⚠️",
        colorTop: v.uiDanger,
        colorBottom: j(v.uiDanger, 35),
        fontSize: 18,
        onClick: () => this.handleReset(),
      }),
    );
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
  }
  enter() {
    this.confirmingReset = !1;
  }
  exit() {}
  toggleSound() {
    (U.update((e) => (e.soundOn = !e.soundOn)), z.setEnabled(U.get().soundOn));
  }
  toggleVibration() {
    U.update((o) => (o.vibrationOn = o.vibrationOn === !1));
    const e = U.get().vibrationOn !== !1;
    (pe.setEnabled(e), e && pe.play("tap"));
  }
  toggleMusic() {
    (U.update((e) => (e.musicOn = !e.musicOn)),
      z.setMusicEnabled(U.get().musicOn),
      U.get().musicOn && z.startMusic());
  }
  handleReset() {
    if (!this.confirmingReset) {
      this.confirmingReset = !0;
      return;
    }
    U.resetAll().then(() => {
      ((this.confirmingReset = !1), V.goto("mainMenu"));
    });
  }
  update(e) {
    this.time += e;
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      de(e, c / 2, 150, 440, "AYARLAR", 30),
      le(e, 36, 220, c - 72, 700, 24),
      P(e, "SES VE DOKUNMA", c / 2, 262, { size: 15, color: p(M.cream, 0.7), weight: 800 }));
    const o = U.get();
    (this.drawToggleRow(e, this.soundButton, "🔊", "Ses Efektleri", o.soundOn),
      this.drawToggleRow(e, this.musicButton, "🎵", "Müzik", o.musicOn),
      this.drawToggleRow(e, this.vibrationButton, "📳", "Titreşim", o.vibrationOn !== !1),
      P(e, "HESAP", c / 2, 660, { size: 15, color: p(M.cream, 0.7), weight: 800 }));
    const a = this.nameButton.rect;
    Y(e, a.x, a.y, a.w, a.h, `✏️  ${U.get().name.toUpperCase()}`, "blue");
    const l = this.resetButton.rect;
    (Y(
      e,
      l.x,
      l.y,
      l.w,
      l.h,
      this.confirmingReset ? "EMİN MİSİN? TEKRAR DOKUN" : "⚠️  İLERLEMEYİ SIFIRLA",
      "red",
    ),
      this.confirmingReset &&
        P(e, "Tüm bölümler, oyuncaklar ve jetonlar silinir.", c / 2, l.y + l.h + 26, {
          size: 15,
          color: v.uiDanger,
          weight: 800,
        }),
      P(e, "Kuka Kazan · Panayır Top Atma Oyunu", c / 2, b - 60, { size: 14, color: p(M.cream, 0.45) }));
  }
  drawToggleRow(e, o, a, l, n) {
    const i = o.rect;
    (Me(e, i.x, i.y, i.w, i.h, { radius: 18, selected: n }),
      P(e, a, i.x + 42, i.y + i.h / 2, { size: 28, shadow: !1 }),
      P(e, l, i.x + 78, i.y + i.h / 2, { align: "left", size: 22, color: M.cream, weight: 800 }));
    const s = 84,
      r = 42,
      f = i.x + i.w - s - 24,
      h = i.y + i.h / 2 - r / 2;
    Oo(e, f, h, s, r, { fill: n ? v.uiSuccess : "#5c4a3c", radius: r / 2 });
    const d = n ? f + s - r / 2 - 4 : f + r / 2 + 4;
    (e.beginPath(),
      e.arc(d, h + r / 2, r / 2 - 5, 0, Math.PI * 2),
      (e.fillStyle = "#ffffff"),
      e.fill(),
      P(e, n ? "AÇIK" : "KAPALI", f - 14, i.y + i.h / 2, {
        size: 13,
        color: n ? v.uiSuccess : p(M.cream, 0.5),
        weight: 900,
        align: "right",
      }));
  }
  onPointerDown(e) {
    if (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
      V.goto("mainMenu");
      return;
    }
    (this.soundButton.onDown(e.x, e.y),
      this.musicButton.onDown(e.x, e.y),
      this.vibrationButton.onDown(e.x, e.y),
      this.nameButton.onDown(e.x, e.y),
      this.resetButton.onDown(e.x, e.y));
  }
  onPointerUp(e) {
    (this.soundButton.onUp(e.x, e.y),
      this.musicButton.onUp(e.x, e.y),
      this.vibrationButton.onUp(e.x, e.y),
      this.nameButton.onUp(e.x, e.y),
      this.resetButton.onUp(e.x, e.y));
  }
}
const L = 40,
  bs = 112,
  Ts = 150,
  Os = 9,
  we = 330,
  ua = 560,
  Gs = 260,
  Ks = 230;
function wt(t) {
  const e = Math.sin(t * 127.1) * 43758.5453;
  return e - Math.floor(e);
}
class ws {
  constructor() {
    u(this, "name", "levelSelect");
    u(this, "time", 0);
    u(this, "scroll", 0);
    u(this, "dragStartY", 0);
    u(this, "dragStartScroll", 0);
    u(this, "dragging", !1);
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
    u(this, "decorations", [
      { i: 1, side: "right", type: "stall", label: "PATLAMIŞ MISIR", color: "#c0392b" },
      { i: 3, side: "left", type: "tree" },
      { i: 5, side: "right", type: "bush" },
      { i: 6, side: "left", type: "stall", label: "PAMUK ŞEKER", color: "#e0559a" },
      { i: 9, side: "right", type: "lantern" },
      { i: 10, side: "left", type: "tree" },
      { i: 12, side: "right", type: "bigTop" },
      { i: 15, side: "left", type: "stall", label: "HALKA AT", color: "#2a7fb8" },
      { i: 18, side: "right", type: "tree" },
      { i: 20, side: "left", type: "bush" },
      { i: 22, side: "right", type: "carousel" },
      { i: 25, side: "left", type: "lantern" },
      { i: 27, side: "right", type: "stall", label: "DART OYUNU", color: "#8e44ad" },
      { i: 30, side: "left", type: "tree" },
      { i: 33, side: "right", type: "bush" },
      { i: 35, side: "left", type: "stall", label: "ATIŞTIRMALIK", color: "#d35400" },
      { i: 38, side: "right", type: "tree" },
      { i: 41, side: "left", type: "bigTop" },
      { i: 44, side: "right", type: "lantern" },
      { i: 46, side: "left", type: "bush" },
      { i: 48, side: "right", type: "stall", label: "PAMUK ŞEKER", color: "#e0559a" },
      { i: 51, side: "left", type: "tree" },
      { i: 54, side: "right", type: "carousel" },
      { i: 57, side: "left", type: "stall", label: "PATLAMIŞ MISIR", color: "#c0392b" },
      { i: 60, side: "right", type: "tree" },
      { i: 63, side: "left", type: "lantern" },
      { i: 65, side: "right", type: "bush" },
      { i: 67, side: "left", type: "bigTop" },
      { i: 70, side: "right", type: "stall", label: "HALKA AT", color: "#2a7fb8" },
      { i: 73, side: "left", type: "tree" },
      { i: 76, side: "right", type: "lantern" },
      { i: 79, side: "left", type: "bush" },
      { i: 81, side: "right", type: "carousel" },
      { i: 84, side: "left", type: "stall", label: "DART OYUNU", color: "#8e44ad" },
      { i: 87, side: "right", type: "tree" },
      { i: 90, side: "left", type: "lantern" },
      { i: 93, side: "right", type: "stall", label: "ATIŞTIRMALIK", color: "#d35400" },
      { i: 96, side: "left", type: "tree" },
    ]);
    u(this, "buntingAt", [4, 14, 24, 34, 44, 56, 68, 78, 88, 97]);
  }
  enter() {
    const e = U.get().highestUnlockedLevel;
    this.scroll = Math.max(0, Math.min(this.maxScroll, this.pointFor(e - 1).y - b * 0.55));
  }
  exit() {}
  update(e) {
    this.time += e;
  }
  get maxScroll() {
    const e = this.pointFor(E.totalLevels - 1).y;
    return Math.max(0, e + Gs - b);
  }
  pointFor(e) {
    return { x: c / 2 + Ts * Math.sin((e * Math.PI * 2) / Os), y: ua + e * bs };
  }
  render(e) {
    (this.drawSky(e),
      this.drawSkyline(e),
      e.save(),
      e.beginPath(),
      e.rect(0, we, c, b - we),
      e.clip(),
      e.translate(0, -this.scroll));
    const o = this.scroll + we - 260,
      a = this.scroll + b + 260;
    (this.drawGround(e, o, a),
      this.drawEntranceGate(e, o, a),
      this.decorations.forEach((n) => this.drawDecoration(e, n, o, a)),
      this.drawPath(e, o, a),
      this.buntingAt.forEach((n) => this.drawBunting(e, n, o, a)));
    const l = U.get().levelStars ?? {};
    for (let n = 0; n < E.totalLevels; n++) {
      const i = this.pointFor(n);
      i.y < o || i.y > a || this.drawLevelNode(e, n + 1, i, l[n + 1] ?? 0);
    }
    if ((e.restore(), this.drawHorizon(e), this.drawHeader(e, l), this.maxScroll > 0)) {
      const n = b - 300,
        i = Math.max(60, n * (b / (b + this.maxScroll))),
        s = 230 + (n - i) * (this.scroll / this.maxScroll);
      (m(e, c - 18, s, 7, i, 4), (e.fillStyle = p(M.gold, 0.55)), e.fill());
    }
  }
  drawHeader(e, o) {
    const a = e.createLinearGradient(0, 0, 0, 230);
    (a.addColorStop(0, "rgba(10,6,26,0.86)"),
      a.addColorStop(1, "rgba(10,6,26,0)"),
      (e.fillStyle = a),
      e.fillRect(0, 0, c, 230),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      de(e, c / 2, 60, 400, "SEVİYE SEÇ", 28));
    const n = `⭐ ${Object.values(o).reduce((s, r) => s + r, 0)} / ${E.totalLevels * 3}`,
      i = 40 + n.length * 12;
    (m(e, c / 2 - i / 2, 106, i, 42, 21),
      (e.fillStyle = "rgba(0,0,0,0.5)"),
      e.fill(),
      (e.strokeStyle = p(M.gold, 0.75)),
      (e.lineWidth = 2),
      e.stroke(),
      P(e, n, c / 2, 127, { size: 20, color: M.goldLight, weight: 900 }));
  }
  drawSky(e) {
    const o = e.createLinearGradient(0, 0, 0, b);
    (o.addColorStop(0, "#0f0b2e"),
      o.addColorStop(0.42, "#1e1650"),
      o.addColorStop(0.72, "#2b1a4a"),
      o.addColorStop(1, "#1a1030"),
      (e.fillStyle = o),
      e.fillRect(0, 0, c, b));
    for (let a = 0; a < 90; a++) {
      const l = (a * 137.5) % c,
        n = (a * 79.3) % (b * 0.62),
        i = 0.5 + 0.5 * Math.sin(this.time * 2 + a);
      ((e.globalAlpha = 0.2 + 0.45 * Math.max(0, i)),
        (e.fillStyle = "#ffffff"),
        e.beginPath(),
        e.arc(l, n, 1 + (a % 3) * 0.45, 0, Math.PI * 2),
        e.fill());
    }
    e.globalAlpha = 1;
  }
  drawSkyline(e) {
    const o = -Math.min(this.scroll, 900) * 0.035;
    (e.save(),
      e.translate(0, o),
      (e.globalAlpha = 0.78),
      (e.strokeStyle = p("#6a4a8a", 0.75)),
      (e.lineWidth = 4),
      e.beginPath(),
      e.moveTo(-20, 300),
      e.bezierCurveTo(60, 190, 150, 320, 250, 250),
      e.stroke(),
      (e.lineWidth = 2));
    for (let s = 0; s < 240; s += 22)
      (e.beginPath(), e.moveTo(s, 258 + Math.sin(s * 0.02) * 26), e.lineTo(s, 330), e.stroke());
    const a = 178,
      l = 178,
      n = 112;
    ((e.strokeStyle = "#5c3a21"),
      (e.lineWidth = 7),
      e.beginPath(),
      e.moveTo(a - 58, l + 168),
      e.lineTo(a, l),
      e.lineTo(a + 58, l + 168),
      e.stroke(),
      e.beginPath(),
      e.arc(a, l, n, 0, Math.PI * 2),
      (e.strokeStyle = p("#ffe9a0", 0.5)),
      (e.lineWidth = 3),
      e.stroke());
    const i = this.time * 0.16;
    for (let s = 0; s < 16; s++) {
      const r = i + (s * Math.PI * 2) / 16,
        f = a + Math.cos(r) * n,
        h = l + Math.sin(r) * n;
      (e.beginPath(),
        e.moveTo(a, l),
        e.lineTo(f, h),
        (e.strokeStyle = p("#ffe9a0", 0.16)),
        (e.lineWidth = 1.5),
        e.stroke());
      const d = 0.45 + 0.55 * Math.max(0, Math.sin(this.time * 3 + s)),
        y = e.createRadialGradient(f, h, 0, f, h, 11);
      (y.addColorStop(0, p("#fff3c4", 0.85 * d)),
        y.addColorStop(1, p("#ffb347", 0)),
        (e.fillStyle = y),
        e.beginPath(),
        e.arc(f, h, 11, 0, Math.PI * 2),
        e.fill(),
        e.beginPath(),
        e.arc(f, h, 3, 0, Math.PI * 2),
        (e.fillStyle = p("#fff3c4", d)),
        e.fill());
    }
    (Ae(e, a, l, 9, "#ffe9a0"),
      e.save(),
      e.translate(c - 145, 168),
      (e.fillStyle = "#2e2255"),
      e.fillRect(-70, 0, 140, 130),
      [-58, -20, 20, 58].forEach((s, r) => {
        const f = r % 2 === 0 ? 76 : 104;
        ((e.fillStyle = "#342866"),
          e.fillRect(s - 15, -f, 30, f + 20),
          e.beginPath(),
          e.moveTo(s - 20, -f),
          e.lineTo(s, -f - 34),
          e.lineTo(s + 20, -f),
          e.closePath(),
          (e.fillStyle = "#4a3a86"),
          e.fill());
      }),
      (e.fillStyle = p("#ffd97a", 0.55)),
      [
        [-52, 20],
        [-14, 40],
        [24, 20],
        [52, 44],
        [0, 76],
        [-30, 76],
        [30, 76],
      ].forEach(([s, r]) => e.fillRect(s - 4, r, 8, 12)),
      e.restore());
    for (let s = 0; s < 3; s++) {
      const r = 320 + s * 46,
        f = e.createLinearGradient(0, r - 30, 0, r + 30);
      (f.addColorStop(0, p("#6a5a9a", 0)),
        f.addColorStop(0.5, p("#7a6aae", 0.2)),
        f.addColorStop(1, p("#6a5a9a", 0)),
        (e.fillStyle = f),
        e.fillRect(0, r - 30, c, 60));
    }
    e.restore();
  }
  drawHorizon(e) {
    e.save();
    const o = e.createLinearGradient(0, we - 70, 0, we + 40);
    (o.addColorStop(0, p("#2b1a4a", 0)),
      o.addColorStop(0.6, p("#241a3e", 0.55)),
      o.addColorStop(1, p("#1a2a1e", 0.75)),
      (e.fillStyle = o),
      e.fillRect(0, we - 70, c, 110),
      (e.fillStyle = "#14251a"));
    for (let a = -20; a < c + 40; a += 34) {
      const l = 26 + wt(a) * 26;
      (e.beginPath(),
        e.moveTo(a, we + 8),
        e.lineTo(a + 17, we + 8 - l),
        e.lineTo(a + 34, we + 8),
        e.closePath(),
        e.fill());
    }
    (e.fillRect(0, we + 4, c, 10), e.restore());
  }
  drawGround(e, o, a) {
    const l = Math.max(o, this.scroll + we - 20),
      n = a,
      i = e.createLinearGradient(0, l, 0, n);
    (i.addColorStop(0, "#1f3a24"),
      i.addColorStop(1, "#162c1c"),
      (e.fillStyle = i),
      e.fillRect(0, l, c, n - l),
      (e.strokeStyle = p("#2f5c35", 0.55)),
      (e.lineWidth = 2));
    const s = 46,
      r = Math.floor(l / s),
      f = Math.ceil(n / s);
    for (let h = r; h < f; h++)
      for (let d = 0; d < 8; d++) {
        const y = h * 31 + d,
          g = wt(y) * c,
          A = h * s + wt(y + 7) * s;
        (e.beginPath(), e.moveTo(g, A), e.lineTo(g + 3, A - 7), e.stroke());
      }
  }
  walkPath(e, o, a, l) {
    const n = E.totalLevels;
    let i = 0;
    for (let s = 0; s < n - 1; s++) {
      const r = this.pointFor(s),
        f = this.pointFor(s + 1),
        h = f.x - r.x,
        d = f.y - r.y,
        y = Math.hypot(h, d),
        g = Math.max(1, Math.round(y / a)),
        A = Math.atan2(d, h);
      for (let S = 0; S < g; S++) {
        const R = S / g,
          G = r.y + d * R;
        (i++, !(G < e || G > o) && l(r.x + h * R, G, A, i));
      }
    }
  }
  drawPath(e, o, a) {
    const l = E.totalLevels;
    (e.save(), (e.lineCap = "round"), (e.lineJoin = "round"), e.beginPath());
    for (let r = 0; r < l; r++) {
      const f = this.pointFor(r);
      r === 0 ? e.moveTo(f.x, f.y) : e.lineTo(f.x, f.y);
    }
    ((e.strokeStyle = "#6b4a2e"),
      (e.lineWidth = 84),
      e.stroke(),
      (e.strokeStyle = "#8a6440"),
      (e.lineWidth = 76),
      e.stroke());
    const n = ["#d9a86a", "#e8c088", "#c98b9a", "#8fa9c9", "#e0cf8a", "#c9a06a", "#b58fb0"];
    (this.walkPath(o, a, 15, (r, f, h, d) => {
      (e.save(), e.translate(r, f), e.rotate(h));
      for (let y = -2; y <= 2; y++) {
        const g = (d % 2) * 6,
          A = 13,
          S = 12,
          R = Math.floor(wt(d * 5 + y + 3) * n.length);
        ((e.fillStyle = n[R]),
          m(e, -S / 2, y * 14 - A / 2 + g - 3, S, A, 3),
          e.fill(),
          (e.strokeStyle = p("#5c3a21", 0.35)),
          (e.lineWidth = 1),
          e.stroke());
      }
      e.restore();
    }),
      this.walkPath(o, a, 64, (r, f, h, d) => {
        [-1, 1].forEach((y) => {
          const g = r + Math.cos(h + Math.PI / 2) * 44 * y,
            A = f + Math.sin(h + Math.PI / 2) * 44 * y,
            S = 0.4 + 0.6 * Math.max(0, Math.sin(this.time * 3 + d + y)),
            R = e.createRadialGradient(g, A, 0, g, A, 12);
          (R.addColorStop(0, p("#ffe066", 0.75 * S)),
            R.addColorStop(1, p("#ffe066", 0)),
            (e.fillStyle = R),
            e.beginPath(),
            e.arc(g, A, 12, 0, Math.PI * 2),
            e.fill(),
            Ae(e, g, A, 3, p("#fff3c4", 0.5 + S * 0.5)));
        });
      }));
    const i = ["#e74c3c", "#3a8fc7", "#f1c40f", "#2ecc71", "#e0559a"];
    this.walkPath(o, a, 96, (r, f, h, d) => {
      const y = d % 2 === 0 ? 1 : -1,
        g = r + Math.cos(h + Math.PI / 2) * 52 * y,
        A = f + Math.sin(h + Math.PI / 2) * 52 * y;
      (e.beginPath(),
        e.moveTo(g, A + 12),
        e.lineTo(g, A - 26),
        (e.strokeStyle = "#c9c0b0"),
        (e.lineWidth = 2.4),
        e.stroke());
      const S = Math.sin(this.time * 2 + d) * 2;
      (e.beginPath(),
        e.moveTo(g, A - 26),
        e.lineTo(g + 18 * y + S, A - 20),
        e.lineTo(g, A - 12),
        e.closePath(),
        (e.fillStyle = i[d % i.length]),
        e.fill());
    });
    const s = U.get().highestUnlockedLevel;
    if (s < l) {
      const r = this.pointFor(Math.min(l - 1, s)).y;
      if (r < a) {
        const f = e.createLinearGradient(0, r - 60, 0, r + 90);
        (f.addColorStop(0, "rgba(6,4,18,0)"),
          f.addColorStop(1, "rgba(6,4,18,0.55)"),
          (e.fillStyle = f),
          e.fillRect(0, r - 60, c, Math.max(0, a - r + 60)));
      }
    }
    e.restore();
  }
  drawBunting(e, o, a, l) {
    const n = this.pointFor(o);
    if (n.y < a || n.y > l) return;
    const i = n.y - 78,
      s = 30,
      r = c - 60,
      f = 34,
      h = [v.tentRed, v.bulbYellow, v.uiTeal, v.uiPink, "#7ad86b"];
    (e.save(),
      e.beginPath(),
      e.moveTo(s, i),
      e.quadraticCurveTo(s + r / 2, i + f * 2, s + r, i),
      (e.strokeStyle = p("#0d0a1a", 0.8)),
      (e.lineWidth = 2.5),
      e.stroke());
    const d = 11;
    for (let y = 0; y < d; y++) {
      const g = (y + 0.5) / d,
        A = s + r * g,
        S = i + 4 * f * g * (1 - g),
        R = Math.sin(this.time * 1.6 + y * 0.7) * 2.5,
        G = (r / d) * 0.66;
      (e.save(),
        e.translate(A + R, S),
        e.beginPath(),
        e.moveTo(-G / 2, 0),
        e.lineTo(G / 2, 0),
        e.lineTo(0, 24),
        e.closePath());
      const C = h[y % h.length],
        te = e.createLinearGradient(0, 0, 0, 24);
      (te.addColorStop(0, O(C, 14)), te.addColorStop(1, j(C, 20)), (e.fillStyle = te), e.fill(), e.restore());
    }
    e.restore();
  }
  drawEntranceGate(e, o, a) {
    const l = ua - 150;
    if (l < o - 200 || l > a + 200) return;
    const n = c / 2;
    (e.save(),
      [-1, 1].forEach((h) => {
        const d = n + h * 200;
        ((e.fillStyle = "#7a4a28"),
          e.fillRect(d - 13, l - 10, 26, 150),
          (e.fillStyle = v.tentGold),
          e.fillRect(d - 17, l - 16, 34, 12),
          e.beginPath(),
          e.moveTo(d, l - 16),
          e.lineTo(d, l - 58),
          (e.strokeStyle = "#c9a06a"),
          (e.lineWidth = 3),
          e.stroke(),
          e.beginPath(),
          e.moveTo(d, l - 58),
          e.lineTo(d + h * 28, l - 48),
          e.lineTo(d, l - 38),
          e.closePath(),
          (e.fillStyle = h < 0 ? v.tentRed : v.uiTeal),
          e.fill());
      }));
    const i = 400,
      s = 116;
    (e.save(), (e.shadowColor = "rgba(0,0,0,0.55)"), (e.shadowBlur = 22), m(e, n - i / 2, l - 30, i, s, 18));
    const r = e.createLinearGradient(0, l - 30, 0, l + s - 30);
    (r.addColorStop(0, "#4a1f6e"),
      r.addColorStop(1, "#2a0f45"),
      (e.fillStyle = r),
      e.fill(),
      (e.shadowColor = "transparent"),
      (e.strokeStyle = v.tentGold),
      (e.lineWidth = 4),
      e.stroke(),
      e.restore());
    const f = [];
    for (let h = n - i / 2 + 14; h < n + i / 2 - 10; h += 26) (f.push([h, l - 22]), f.push([h, l + s - 38]));
    (f.forEach(([h, d], y) => {
      const g = 0.4 + 0.6 * Math.max(0, Math.sin(this.time * 4 + y * 0.8)),
        A = e.createRadialGradient(h, d, 0, h, d, 10);
      (A.addColorStop(0, p("#fff3c4", 0.85 * g)),
        A.addColorStop(1, p("#ffb347", 0)),
        (e.fillStyle = A),
        e.beginPath(),
        e.arc(h, d, 10, 0, Math.PI * 2),
        e.fill(),
        Ae(e, h, d, 3.2, p("#fff6d0", g)));
    }),
      P(e, "KUKA KAZAN", n, l + 8, {
        size: 40,
        color: O(v.tentGold, 55),
        outline: "#5c2a0f",
        outlineWidth: 6,
        weight: 900,
      }),
      P(e, "PANAYIR • GECE MACERASI", n, l + 46, { size: 15, color: p(M.cream, 0.85), weight: 800 }),
      e.restore());
  }
  drawDecoration(e, o, a, l) {
    const n = this.pointFor(o.i);
    if (n.y < a - 120 || n.y > l + 120) return;
    const i = o.type === "bigTop" || o.type === "carousel",
      s = o.side === "left" ? (i ? 108 : 78) : c - (i ? 108 : 78),
      r = n.y;
    switch (o.type) {
      case "tree":
        this.drawTree(e, s, r);
        break;
      case "bush":
        this.drawBush(e, s, r);
        break;
      case "lantern":
        this.drawLantern(e, s, r);
        break;
      case "stall":
        this.drawStall(e, s, r, o.label ?? "", o.color ?? v.tentRed);
        break;
      case "bigTop":
        this.drawBigTop(e, s, r);
        break;
      case "carousel":
        this.drawCarousel(e, s, r);
        break;
    }
  }
  drawTree(e, o, a) {
    (e.save(),
      (e.fillStyle = "#4a2f1c"),
      e.fillRect(o - 7, a + 6, 14, 40),
      [
        [-20, 0, 24],
        [20, 2, 22],
        [0, -18, 27],
        [-10, 12, 20],
        [12, 14, 19],
      ].forEach(([n, i, s], r) => {
        const f = e.createRadialGradient(o + n - s * 0.3, a + i - s * 0.3, 2, o + n, a + i, s);
        (f.addColorStop(0, r % 2 === 0 ? "#3fae5c" : "#4bc06a"),
          f.addColorStop(1, "#1f6b34"),
          Ae(e, o + n, a + i, s, f));
      }));
    for (let n = 0; n < 9; n++) {
      const i = (n / 9) * Math.PI * 2,
        s = o + Math.cos(i) * 26,
        r = a - 4 + Math.sin(i) * 24,
        f = 0.4 + 0.6 * Math.max(0, Math.sin(this.time * 3.5 + n)),
        h = ["#ffe066", "#ff8fb0", "#7ae0ff", "#b6ff8f"];
      Ae(e, s, r, 3.2, p(h[n % h.length], f));
      const d = e.createRadialGradient(s, r, 0, s, r, 9);
      (d.addColorStop(0, p(h[n % h.length], 0.55 * f)),
        d.addColorStop(1, p(h[n % h.length], 0)),
        (e.fillStyle = d),
        e.beginPath(),
        e.arc(s, r, 9, 0, Math.PI * 2),
        e.fill());
    }
    e.restore();
  }
  drawBush(e, o, a) {
    (e.save(),
      [
        [-16, 4, 15],
        [0, -4, 19],
        [16, 6, 14],
      ].forEach(([l, n, i], s) => {
        const r = e.createRadialGradient(o + l, a + n - i * 0.4, 2, o + l, a + n, i);
        (r.addColorStop(0, s === 1 ? "#357f43" : "#2c6c39"),
          r.addColorStop(1, "#1a4726"),
          Ae(e, o + l, a + n, i, r));
      }),
      ["#ff8fb0", "#ffe066", "#c98bff"].forEach((l, n) =>
        Ae(e, o - 12 + n * 12, a - 8 + (n % 2) * 8, 3.4, l),
      ),
      e.restore());
  }
  drawLantern(e, o, a) {
    (e.save(),
      (e.strokeStyle = "#3a2a4a"),
      (e.lineWidth = 5),
      e.beginPath(),
      e.moveTo(o, a + 46),
      e.lineTo(o, a - 26),
      e.stroke(),
      e.beginPath(),
      e.moveTo(o, a - 26),
      e.quadraticCurveTo(o + 16, a - 32, o + 18, a - 20),
      e.stroke());
    const l = o + 18,
      n = a - 10,
      i = e.createRadialGradient(l, n, 0, l, n, 34);
    (i.addColorStop(0, p("#ffd98a", 0.55)),
      i.addColorStop(1, p("#ffd98a", 0)),
      (e.fillStyle = i),
      e.beginPath(),
      e.arc(l, n, 34, 0, Math.PI * 2),
      e.fill(),
      m(e, l - 9, n - 12, 18, 22, 4),
      (e.fillStyle = p("#ffe9a8", 0.92)),
      e.fill(),
      (e.strokeStyle = "#3a2a4a"),
      (e.lineWidth = 2.5),
      e.stroke(),
      e.restore());
  }
  drawStall(e, o, a, l, n) {
    (e.save(), e.translate(o, a), m(e, -118 / 2, -96 / 2 + 20, 118, 84, 8));
    const r = e.createLinearGradient(0, -96 / 2 + 20, 0, 96 / 2 + 8);
    (r.addColorStop(0, "#8a5a30"),
      r.addColorStop(1, "#5c3a21"),
      (e.fillStyle = r),
      e.fill(),
      (e.strokeStyle = "#3d2415"),
      (e.lineWidth = 2),
      e.stroke(),
      (e.strokeStyle = p("#000000", 0.22)),
      (e.lineWidth = 1.6));
    for (let S = -2; S <= 2; S++)
      (e.beginPath(), e.moveTo(S * 22, -96 / 2 + 44), e.lineTo(S * 22, 96 / 2 + 6), e.stroke());
    (m(e, -118 / 2 + 12, -96 / 2 + 30, 94, 26, 5),
      (e.fillStyle = p("#2a1109", 0.75)),
      e.fill(),
      ["#ff8fb0", "#ffe066", "#7ae0ff", "#b6ff8f"].forEach((S, R) =>
        Ae(e, -118 / 2 + 26 + R * 22, -96 / 2 + 43, 7, S),
      ));
    const f = 7,
      h = 136,
      d = 30,
      y = -96 / 2 - 6;
    (e.save(), e.beginPath(), e.moveTo(-h / 2, y), e.lineTo(h / 2, y), e.lineTo(h / 2, y + d * 0.6));
    for (let S = f - 1; S >= 0; S--) {
      const R = -h / 2 + (S * h) / f;
      e.quadraticCurveTo(R + h / f / 2, y + d * 1.15, R, y + d * 0.6);
    }
    (e.closePath(), e.clip(), (e.fillStyle = v.tentCream), e.fillRect(-h / 2, y, h, d * 1.2));
    for (let S = 0; S < f; S++)
      S % 2 === 0 && ((e.fillStyle = n), e.fillRect(-h / 2 + (S * h) / f, y, h / f, d * 1.2));
    e.restore();
    const g = 124;
    m(e, -g / 2, y - 40, g, 30, 7);
    const A = e.createLinearGradient(0, y - 40, 0, y - 10);
    (A.addColorStop(0, "#3c1a5c"),
      A.addColorStop(1, "#25103c"),
      (e.fillStyle = A),
      e.fill(),
      (e.strokeStyle = v.tentGold),
      (e.lineWidth = 2.4),
      e.stroke());
    for (let S = -g / 2 + 8; S < g / 2 - 4; S += 16) {
      const R = 0.4 + 0.6 * Math.max(0, Math.sin(this.time * 4 + S * 0.2));
      (Ae(e, S, y - 40, 2.4, p("#fff3c4", R)), Ae(e, S, y - 10, 2.4, p("#fff3c4", R)));
    }
    (P(e, l, 0, y - 25, {
      size: Math.min(14, (g - 16) / (l.length * 0.56)),
      color: O(v.tentGold, 55),
      weight: 900,
      outline: "#3a1508",
      outlineWidth: 3,
    }),
      e.restore());
  }
  drawBigTop(e, o, a) {
    (e.save(), e.translate(o, a));
    const l = 74;
    (e.beginPath(),
      e.moveTo(0, -l - 46),
      e.lineTo(-l, 6),
      e.lineTo(l, 6),
      e.closePath(),
      e.save(),
      e.clip(),
      (e.fillStyle = v.tentCream),
      e.fillRect(-l, -l - 46, l * 2, l + 56));
    for (let i = -4; i <= 4; i++)
      i % 2 === 0 &&
        (e.save(),
        e.beginPath(),
        e.moveTo(0, -l - 46),
        e.lineTo(i * 20 - 10, 6),
        e.lineTo(i * 20 + 10, 6),
        e.closePath(),
        (e.fillStyle = v.tentRed),
        e.fill(),
        e.restore());
    (e.restore(),
      (e.strokeStyle = j(v.tentRed, 30)),
      (e.lineWidth = 2),
      e.stroke(),
      m(e, -l + 8, 4, (l - 8) * 2, 54, 6),
      (e.fillStyle = v.tentCream),
      e.fill(),
      (e.strokeStyle = j(v.tentCream, 50)),
      (e.lineWidth = 1.5),
      e.stroke(),
      e.beginPath(),
      e.moveTo(-22, 58),
      e.lineTo(-22, 18),
      e.quadraticCurveTo(0, 2, 22, 18),
      e.lineTo(22, 58),
      e.closePath());
    const n = e.createLinearGradient(0, 10, 0, 58);
    (n.addColorStop(0, "#5c1810"),
      n.addColorStop(1, "#2a0c08"),
      (e.fillStyle = n),
      e.fill(),
      [-1, 1].forEach((i) => {
        (e.beginPath(),
          e.moveTo(i * 22, 18),
          e.quadraticCurveTo(i * 34, 34, i * 26, 58),
          e.lineTo(i * 22, 58),
          e.closePath(),
          (e.fillStyle = v.tentRedDark),
          e.fill());
      }),
      e.beginPath(),
      e.moveTo(0, -l - 46),
      e.lineTo(0, -l - 76),
      (e.strokeStyle = "#c9a06a"),
      (e.lineWidth = 3),
      e.stroke(),
      e.beginPath(),
      e.moveTo(0, -l - 76),
      e.lineTo(26, -l - 68),
      e.lineTo(0, -l - 60),
      e.closePath(),
      (e.fillStyle = v.bulbYellow),
      e.fill());
    for (let i = 0; i <= 8; i++) {
      const s = i / 8,
        r = -l + s * l * 2,
        f = 6 - Math.abs(Math.cos(s * Math.PI)) * 0,
        h = 0.4 + 0.6 * Math.max(0, Math.sin(this.time * 3.6 + i));
      Ae(e, r, f, 3, p("#fff3c4", h));
    }
    e.restore();
  }
  drawCarousel(e, o, a) {
    (e.save(), e.translate(o, a));
    const l = 62;
    (e.beginPath(),
      e.ellipse(0, 44, l, 16, 0, 0, Math.PI * 2),
      (e.fillStyle = "#7a4a28"),
      e.fill(),
      (e.fillStyle = v.tentGold),
      e.fillRect(-4, -34, 8, 78));
    const n = this.time * 0.7;
    for (let i = 0; i < 5; i++) {
      const s = n + (i * Math.PI * 2) / 5,
        r = Math.cos(s) * l * 0.72,
        f = 26 + Math.sin(s) * 9;
      Math.sin(s) < -0.4 ||
        (e.save(),
        e.translate(r, f),
        (e.strokeStyle = v.tentGold),
        (e.lineWidth = 2.4),
        e.beginPath(),
        e.moveTo(0, -26),
        e.lineTo(0, 6),
        e.stroke(),
        e.beginPath(),
        e.ellipse(0, -4, 11, 8, 0, 0, Math.PI * 2),
        (e.fillStyle = i % 2 === 0 ? "#f7ecff" : "#ffd9ec"),
        e.fill(),
        e.beginPath(),
        e.ellipse(-8, -11, 6, 4.5, -0.5, 0, Math.PI * 2),
        (e.fillStyle = i % 2 === 0 ? "#f7ecff" : "#ffd9ec"),
        e.fill(),
        Ae(e, -10, -12, 1.3, "#5c4a62"),
        e.restore());
    }
    (e.beginPath(),
      e.moveTo(0, -78),
      e.lineTo(-l - 8, -26),
      e.lineTo(l + 8, -26),
      e.closePath(),
      e.save(),
      e.clip(),
      (e.fillStyle = v.tentCream),
      e.fillRect(-l - 8, -78, (l + 8) * 2, 56));
    for (let i = -3; i <= 3; i++)
      i % 2 === 0 &&
        (e.beginPath(),
        e.moveTo(0, -78),
        e.lineTo(i * 22 - 11, -26),
        e.lineTo(i * 22 + 11, -26),
        e.closePath(),
        (e.fillStyle = v.tentRed),
        e.fill());
    (e.restore(), (e.strokeStyle = v.tentGold), (e.lineWidth = 2.4), e.stroke());
    for (let i = 0; i <= 7; i++) {
      const s = -l - 8 + (i * (l + 8) * 2) / 7,
        r = 0.4 + 0.6 * Math.max(0, Math.sin(this.time * 3.4 + i));
      Ae(e, s, -26, 3, p("#fff3c4", r));
    }
    (Ae(e, 0, -82, 5, v.bulbYellow), e.restore());
  }
  drawLevelNode(e, o, a, l) {
    const n = E.isUnlocked(o),
      i = n && l === 0,
      s = o % 10 === 0,
      r = a.x,
      f = a.y;
    if (
      (e.save(),
      e.beginPath(),
      e.ellipse(r, f + L * 0.86, L * 0.82, L * 0.3, 0, 0, Math.PI * 2),
      (e.fillStyle = "rgba(0,0,0,0.38)"),
      e.fill(),
      i)
    ) {
      const h = 0.5 + 0.5 * Math.sin(this.time * 3.2),
        d = e.createRadialGradient(r, f, L * 0.5, r, f, L * 2.1);
      (d.addColorStop(0, p("#ffe066", 0.42 + h * 0.2)),
        d.addColorStop(1, p("#ffe066", 0)),
        (e.fillStyle = d),
        e.beginPath(),
        e.arc(r, f, L * 2.1, 0, Math.PI * 2),
        e.fill());
    }
    if (s && n) {
      (e.save(), e.translate(r, f), e.beginPath());
      for (let d = 0; d < 5; d++) {
        const y = (d * Math.PI * 2) / 5 - Math.PI / 2,
          g = y + Math.PI / 5;
        (e.lineTo(Math.cos(y) * (L + 12), Math.sin(y) * (L + 12)),
          e.lineTo(Math.cos(g) * (L + 12) * 0.52, Math.sin(g) * (L + 12) * 0.52));
      }
      e.closePath();
      const h = e.createLinearGradient(0, -L, 0, L);
      (h.addColorStop(0, "#ffe9a0"),
        h.addColorStop(1, "#e0a83c"),
        (e.fillStyle = h),
        e.fill(),
        (e.strokeStyle = "#a06f00"),
        (e.lineWidth = 3),
        e.stroke(),
        e.restore(),
        P(e, String(o), r, f - 2, {
          size: 24,
          color: "#5c3a00",
          weight: 900,
          outline: "#fff3c4",
          outlineWidth: 3,
        }),
        P(e, "👑", r, f - L - 22, { size: 22, shadow: !1 }));
    } else {
      (e.beginPath(), e.arc(r, f, L, 0, Math.PI * 2));
      const h = e.createLinearGradient(0, f - L, 0, f + L);
      (n
        ? (h.addColorStop(0, "#5aa9e6"), h.addColorStop(1, "#2a5f9e"))
        : (h.addColorStop(0, "#4a4f60"), h.addColorStop(1, "#232735")),
        (e.fillStyle = h),
        e.fill(),
        (e.strokeStyle = n ? "#ffffff" : p("#ffffff", 0.35)),
        (e.lineWidth = 4),
        e.stroke(),
        e.beginPath(),
        e.arc(r, f, L + 4, 0, Math.PI * 2),
        (e.strokeStyle = n ? p(M.gold, 0.85) : p(M.gold, 0.25)),
        (e.lineWidth = 2.5),
        e.stroke(),
        e.beginPath(),
        e.ellipse(r, f - L * 0.42, L * 0.6, L * 0.3, 0, 0, Math.PI * 2),
        (e.fillStyle = p("#ffffff", n ? 0.28 : 0.1)),
        e.fill(),
        s && P(e, "👑", r, f - L - 18, { size: 20, shadow: !1 }),
        n
          ? P(e, String(o), r, f - 1, {
              size: 26,
              color: "#ffffff",
              weight: 900,
              outline: "#123a63",
              outlineWidth: 4,
            })
          : Ua(e, r, f, 28));
    }
    if (n)
      for (let h = 0; h < 3; h++) {
        const d = r + (h - 1) * 19,
          y = f + L + (s ? 20 : 12),
          g = 8;
        (e.save(),
          e.translate(d, y),
          h < l
            ? ((e.shadowColor = "rgba(255,205,60,0.9)"), (e.shadowBlur = 7), (e.fillStyle = M.goldLight))
            : (e.fillStyle = "rgba(255,255,255,0.22)"),
          e.beginPath());
        for (let A = 0; A < 5; A++) {
          const S = (A * Math.PI * 2) / 5 - Math.PI / 2,
            R = S + Math.PI / 5;
          (e.lineTo(Math.cos(S) * g, Math.sin(S) * g),
            e.lineTo(Math.cos(R) * g * 0.45, Math.sin(R) * g * 0.45));
        }
        (e.closePath(), e.fill(), e.restore());
      }
    e.restore();
  }
  onPointerDown(e) {
    if (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
      V.goto("mainMenu");
      return;
    }
    ((this.dragging = !0), (this.dragStartY = e.y), (this.dragStartScroll = this.scroll));
  }
  onPointerMove(e) {
    this.dragging &&
      (this.scroll = Math.max(0, Math.min(this.maxScroll, this.dragStartScroll - (e.y - this.dragStartY))));
  }
  onPointerUp(e) {
    const o = this.dragging && Math.abs(e.y - this.dragStartY) > 12;
    if (((this.dragging = !1), !o && !(e.y < Ks)))
      for (let a = 0; a < E.totalLevels; a++) {
        const l = this.pointFor(a),
          n = l.y - this.scroll;
        if (n < -L || n > b + L) continue;
        const i = e.x - l.x,
          s = e.y - n;
        if (i * i + s * s > L * L * 1.45) continue;
        const r = a + 1;
        if (!E.isUnlocked(r)) return;
        (U.update((f) => (f.currentLevel = r)), z.play("button"), V.goto("game"));
        return;
      }
  }
}
function Ae(t, e, o, a, l) {
  (t.beginPath(), t.arc(e, o, a, 0, Math.PI * 2), (t.fillStyle = l), t.fill());
}
const co = 128,
  pa = 14,
  yo = 300,
  Vs = 4;
class Zs {
  constructor() {
    u(this, "name", "achievements");
    u(this, "time", 0);
    u(this, "scroll", 0);
    u(this, "dragStartY", 0);
    u(this, "dragStartScroll", 0);
    u(this, "dragging", !1);
    u(this, "toast", "");
    u(this, "toastTimer", 0);
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
  }
  enter() {
    ((this.scroll = 0), (this.toast = ""), (this.toastTimer = 0));
  }
  exit() {}
  update(e) {
    ((this.time += e), this.toastTimer > 0 && (this.toastTimer -= e));
  }
  get maxScroll() {
    const e = _e.list().length;
    return Math.max(0, (e - Vs) * (co + pa));
  }
  rowRect(e) {
    return { x: 40, y: yo + e * (co + pa) - this.scroll, w: c - 80, h: co };
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      de(e, c / 2, 150, 460, "BAŞARIMLAR", 30));
    const o = _e.list(),
      a = o.filter((f) => f.done).length,
      l = _e.claimableCount(),
      n = 210,
      i = b - 300;
    (le(e, 24, n, c - 48, i, 24),
      P(e, `${a} / ${o.length} tamamlandı`, c / 2, 262, { size: 20, color: M.goldLight, weight: 900 }),
      l > 0 && P(e, `${l} ödül seni bekliyor!`, c / 2, 288, { size: 15, color: M.greenLight, weight: 700 }));
    const s = yo - 18,
      r = n + i - s - 16;
    if (
      (e.save(),
      e.beginPath(),
      e.rect(0, s, c, r),
      e.clip(),
      o.forEach((f, h) => {
        const d = this.rowRect(h);
        d.y + d.h < s || d.y > s + r || this.drawRow(e, f, d);
      }),
      e.restore(),
      this.maxScroll > 0)
    ) {
      const f = r - 20,
        h = Math.max(50, f * (r / (r + this.maxScroll))),
        d = s + 10 + (f - h) * (this.scroll / this.maxScroll);
      (m(e, c - 48, d, 8, h, 4), (e.fillStyle = p(M.gold, 0.6)), e.fill());
    }
    this.toastTimer > 0 &&
      (e.save(),
      (e.globalAlpha = Math.min(1, this.toastTimer * 2.5)),
      m(e, c / 2 - 220, b - 160, 440, 58, 29),
      (e.fillStyle = "rgba(0,0,0,0.75)"),
      e.fill(),
      (e.strokeStyle = M.goldLight),
      (e.lineWidth = 2.5),
      e.stroke(),
      P(e, this.toast, c / 2, b - 131, { size: 17, color: M.goldLight, weight: 800 }),
      e.restore());
  }
  drawRow(e, o, a) {
    Me(e, a.x, a.y, a.w, a.h, { selected: o.done && !o.claimed, locked: o.claimed, radius: 16 });
    const l = a.x + 50,
      n = a.y + a.h / 2;
    (e.save(),
      o.claimed && (e.globalAlpha = 0.5),
      e.beginPath(),
      e.arc(l, n, 32, 0, Math.PI * 2),
      (e.fillStyle = p(o.done ? M.gold : "#000000", o.done ? 0.25 : 0.3)),
      e.fill(),
      (e.strokeStyle = p(M.gold, 0.5)),
      (e.lineWidth = 2),
      e.stroke(),
      P(e, o.def.icon, l, n, { size: 30, shadow: !1 }),
      e.restore());
    const i = a.x + 100;
    (P(e, o.def.name, i, a.y + 30, {
      size: 17,
      color: o.claimed ? p("#ffffff", 0.6) : "#ffffff",
      weight: 900,
      align: "left",
    }),
      P(e, o.def.desc, i, a.y + 54, { size: 13, color: p(M.cream, 0.7), weight: 600, align: "left" }));
    const s = i,
      r = a.x + a.w - 185 - s,
      f = a.y + 74;
    (m(e, s, f, r, 16, 8), (e.fillStyle = "rgba(0,0,0,0.4)"), e.fill());
    const h = Math.min(1, o.progress / o.def.target);
    (h > 0 &&
      (m(e, s + 2, f + 2, Math.max(12, (r - 4) * h), 12, 6),
      (e.fillStyle = o.done ? M.greenLight : M.goldLight),
      e.fill()),
      P(
        e,
        `${Math.min(o.progress, o.def.target).toLocaleString("tr-TR")} / ${o.def.target.toLocaleString("tr-TR")}`,
        s,
        f + 30,
        { size: 12, color: p(M.cream, 0.65), weight: 700, align: "left" },
      ));
    const d = this.rewardLabel(o);
    o.claimed
      ? P(e, "✓ ALINDI", a.x + a.w - 90, a.y + a.h / 2, { size: 14, color: M.greenLight, weight: 800 })
      : o.done
        ? Y(e, a.x + a.w - 170, a.y + a.h / 2 - 24, 150, 48, "AL", "green", { icon: "🎁" })
        : (P(e, "ÖDÜL", a.x + a.w - 90, a.y + a.h / 2 - 14, {
            size: 11,
            color: p(M.cream, 0.5),
            weight: 800,
          }),
          P(e, d, a.x + a.w - 90, a.y + a.h / 2 + 10, { size: 17, color: M.goldLight, weight: 900 }));
  }
  rewardLabel(e) {
    const o = e.def.reward;
    return o.gems ? `💎${o.gems}` : o.coins ? `🪙${o.coins}` : o.tickets ? `🎟${o.tickets}` : "";
  }
  onPointerDown(e) {
    if (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
      V.goto("mainMenu");
      return;
    }
    const o = _e.list();
    for (let a = 0; a < o.length; a++) {
      const l = this.rowRect(a);
      if (l.y < yo - 60) continue;
      const n = { x: l.x + l.w - 170, y: l.y + l.h / 2 - 24, w: 150, h: 48 },
        i = o[a];
      if (i.done && !i.claimed && W(e.x, e.y, n.x, n.y, n.w, n.h)) {
        _e.claim(i.def.id) &&
          ((this.toast = `${i.def.name} ödülü alındı!`), (this.toastTimer = 2.2), z.play("bigwin"));
        return;
      }
    }
    ((this.dragging = !0), (this.dragStartY = e.y), (this.dragStartScroll = this.scroll));
  }
  onPointerMove(e) {
    this.dragging &&
      (this.scroll = Math.max(0, Math.min(this.maxScroll, this.dragStartScroll - (e.y - this.dragStartY))));
  }
  onPointerUp(e) {
    this.dragging = !1;
  }
}
const vo = 176,
  ca = 20,
  ya = 320;
class Es {
  constructor() {
    u(this, "name", "missions");
    u(this, "time", 0);
    u(this, "toast", "");
    u(this, "toastTimer", 0);
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
  }
  enter() {
    ((this.toast = ""), (this.toastTimer = 0));
  }
  exit() {}
  update(e) {
    ((this.time += e), this.toastTimer > 0 && (this.toastTimer -= e));
  }
  cardRect(e) {
    return { x: 40, y: ya + e * (vo + ca), w: c - 80, h: vo };
  }
  countdown() {
    const e = new Date(),
      o = new Date(e);
    o.setHours(24, 0, 0, 0);
    const a = o.getTime() - e.getTime(),
      l = Math.floor(a / 36e5),
      n = Math.floor((a % 36e5) / 6e4);
    return `${String(l).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      de(e, c / 2, 150, 460, "GÜNLÜK GÖREVLER", 27));
    const o = ce.list(),
      a = 210,
      l = ya - a + o.length * (vo + ca) + 20;
    (le(e, 24, a, c - 48, l, 24),
      P(e, `Sıfırlanmaya: ${this.countdown()}`, c / 2, 262, { size: 18, color: M.goldLight, weight: 800 }),
      P(e, "Her gün yeni 3 görev - hepsini tamamla, bol jeton kazan!", c / 2, 292, {
        size: 14,
        color: p(M.cream, 0.72),
        weight: 600,
      }),
      o.forEach((n, i) => this.drawCard(e, n, this.cardRect(i))),
      this.toastTimer > 0 &&
        (e.save(),
        (e.globalAlpha = Math.min(1, this.toastTimer * 2.5)),
        m(e, c / 2 - 220, a + l + 30, 440, 58, 29),
        (e.fillStyle = "rgba(0,0,0,0.75)"),
        e.fill(),
        (e.strokeStyle = M.goldLight),
        (e.lineWidth = 2.5),
        e.stroke(),
        P(e, this.toast, c / 2, a + l + 59, { size: 17, color: M.goldLight, weight: 800 }),
        e.restore()));
  }
  drawCard(e, o, a) {
    Me(e, a.x, a.y, a.w, a.h, { selected: o.done && !o.claimed, locked: o.claimed, radius: 18 });
    const l = a.x + 56,
      n = a.y + 60;
    (e.save(),
      o.claimed && (e.globalAlpha = 0.5),
      e.beginPath(),
      e.arc(l, n, 36, 0, Math.PI * 2),
      (e.fillStyle = p(o.done ? M.gold : "#000000", o.done ? 0.25 : 0.3)),
      e.fill(),
      (e.strokeStyle = p(M.gold, 0.5)),
      (e.lineWidth = 2),
      e.stroke(),
      P(e, o.def.icon, l, n, { size: 34, shadow: !1 }),
      e.restore(),
      P(e, o.def.desc, a.x + 110, a.y + 40, {
        size: 19,
        color: o.claimed ? p("#ffffff", 0.6) : "#ffffff",
        weight: 900,
        align: "left",
      }));
    const i = a.w - 150,
      s = a.x + 110,
      r = a.y + 60;
    (m(e, s, r, i, 20, 10), (e.fillStyle = "rgba(0,0,0,0.4)"), e.fill());
    const f = Math.min(1, o.progress / o.def.target);
    (f > 0 &&
      (m(e, s + 3, r + 3, Math.max(14, (i - 6) * f), 14, 7),
      (e.fillStyle = o.done ? M.greenLight : M.goldLight),
      e.fill()),
      P(
        e,
        `${Math.min(o.progress, o.def.target).toLocaleString("tr-TR")} / ${o.def.target.toLocaleString("tr-TR")}`,
        s,
        r + 40,
        { size: 13, color: p(M.cream, 0.7), weight: 700, align: "left" },
      ));
    const h = o.def.reward.tickets ? `🎟 +${o.def.reward.tickets}` : `🪙 +${o.def.reward.coins}`;
    if (o.claimed)
      P(e, "✓ ALINDI", a.x + a.w - 100, a.y + a.h - 30, { size: 16, color: M.greenLight, weight: 800 });
    else if (o.done) Y(e, a.x + a.w - 190, a.y + a.h - 56, 170, 46, `AL (${h})`, "green", { icon: "🎁" });
    else {
      const y = a.x + a.w - 128 - 20,
        g = a.y + a.h - 46;
      (m(e, y, g, 128, 32, 16),
        (e.fillStyle = "rgba(0,0,0,0.35)"),
        e.fill(),
        (e.strokeStyle = p(M.gold, 0.7)),
        (e.lineWidth = 1.5),
        e.stroke(),
        P(e, `ÖDÜL ${h}`, y + 128 / 2, g + 17, { size: 15, color: M.goldLight, weight: 900 }));
    }
  }
  onPointerDown(e) {
    if (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
      V.goto("mainMenu");
      return;
    }
    ce.list().forEach((a, l) => {
      const n = this.cardRect(l),
        i = { x: n.x + n.w - 190, y: n.y + n.h - 56, w: 170, h: 46 };
      a.done &&
        !a.claimed &&
        W(e.x, e.y, i.x, i.y, i.w, i.h) &&
        ce.claim(a.def.id) &&
        ((this.toast = `${a.def.desc} ödülü alındı!`), (this.toastTimer = 2.2), z.play("bigwin"));
    });
  }
  onPointerUp(e) {}
}
class Is {
  constructor() {
    u(this, "name", "invite");
    u(this, "time", 0);
    u(this, "particles", new St());
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
    u(this, "playRect", { x: c / 2 - 210, y: 1010, w: 420, h: 104 });
  }
  enter() {
    ((this.time = 0), this.particles.spawnConfetti(c / 2, b * 0.35, 50));
  }
  exit() {}
  update(e) {
    ((this.time += e), this.particles.update(e));
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      de(e, c / 2, 150, 460, "PANAYIRA DAVET", 28),
      this.particles.render(e));
    const o = U.get().referredBy,
      a = o?.toyId ?? "bear_brown",
      l = he[a],
      n = o?.name ?? "Bir arkadaşın";
    le(e, 40, 220, c - 80, 740, 26);
    const i = e.createRadialGradient(c / 2, 470, 20, c / 2, 470, 230);
    (i.addColorStop(0, p(rt(l.rarity), 0.45)),
      i.addColorStop(1, "rgba(0,0,0,0)"),
      (e.fillStyle = i),
      e.fillRect(40, 240, c - 80, 460),
      ze(e, a, c / 2, 470, 230, { rotation: Math.sin(this.time * 1.4) * 0.06 }),
      P(e, l.name.toUpperCase(), c / 2, 650, { size: 20, color: rt(l.rarity), weight: 900 }),
      P(e, n.toUpperCase(), c / 2, 730, { size: 32, color: M.goldLight, weight: 900 }),
      P(e, "BU OYUNCAĞI KAZANDI!", c / 2, 776, { size: 26, color: "#ffffff", weight: 900 }),
      P(e, "Sıra sende: topu at, kendi oyuncağını kazan.", c / 2, 836, {
        size: 18,
        color: p(M.cream, 0.85),
        weight: 700,
      }),
      P(e, "🎁 Sana özel +1 ücretsiz atış hakkı tanımlandı!", c / 2, 900, {
        size: 17,
        color: v.uiSuccess,
        weight: 800,
      }));
    const s = this.playRect;
    Y(e, s.x, s.y, s.w, s.h, "HADİ OYNAYALIM", "green", { icon: "🎯" });
  }
  onPointerDown(e) {
    const o = this.playRect;
    (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h) ||
      W(e.x, e.y, o.x, o.y, o.w, o.h)) &&
      V.goto("mainMenu");
  }
  onPointerUp(e) {}
}
const Vt = 12,
  va = ["ABCÇDEFG", "ĞHIİJKLM", "NOÖPRSŞT", "UÜVYZ"];
class qs {
  constructor() {
    u(this, "name", "nameEntry");
    u(this, "time", 0);
    u(this, "value", "");
    u(this, "keys", []);
    u(this, "pressed", null);
    u(this, "okRect", { x: c / 2 - 160, y: 1330, w: 320, h: 96 });
    u(this, "skipRect", { x: c / 2 - 110, y: 1444, w: 220, h: 58 });
    va.forEach((i, s) => {
      const r = i.split(""),
        f = r.length * 78 + (r.length - 1) * 10,
        h = (c - f) / 2;
      r.forEach((d, y) => {
        this.keys.push({ label: d, action: "char", rect: { x: h + y * 88, y: 720 + s * 94, w: 78, h: 84 } });
      });
    });
    const n = 720 + va.length * 94;
    (this.keys.push({ label: "BOŞLUK", action: "space", rect: { x: c / 2 - 200, y: n, w: 230, h: 84 } }),
      this.keys.push({
        label: "⌫ SİL",
        action: "back",
        rect: { x: c / 2 - 200 + 246, y: n, w: 154, h: 84 },
      }));
  }
  enter() {
    const e = U.get();
    ((this.value = e.nameSet ? e.name : ""), (this.pressed = null), z.startMusic());
  }
  exit() {}
  update(e) {
    this.time += e;
  }
  finish(e) {
    if (e) {
      const a = this.value.trim();
      a.length > 0 &&
        U.update((l) => {
          ((l.name = a), (l.nameSet = !0));
        });
    }
    (U.get().nameSet || U.update((a) => (a.nameSet = !0)), z.play("button"));
    const o = Z.nameReturnScene || "mainMenu";
    ((Z.nameReturnScene = "mainMenu"), V.goto(o));
  }
  render(e) {
    (je(e, this.time),
      Go(e, 0, 0, c, b),
      Ko(e, 0, 90, c, 11, this.time),
      de(e, c / 2, 190, 470, "ADIN NEDİR?", 30),
      P(e, "Kazandığın oyuncakları arkadaşlarına", c / 2, 262, {
        size: 17,
        color: p(M.cream, 0.8),
        weight: 700,
      }),
      P(e, "bu isimle göndereceksin.", c / 2, 290, { size: 17, color: p(M.cream, 0.8), weight: 700 }));
    const o = 360;
    le(e, 60, o, c - 120, 150, 22);
    const a = this.value.length > 0 ? this.value : "…";
    (P(e, a, c / 2, o + 66, {
      size: Math.min(52, (c - 190) / Math.max(1, a.length * 0.62)),
      color: this.value ? M.goldLight : p(M.cream, 0.35),
      weight: 900,
      outline: "#2a1109",
      outlineWidth: 5,
    }),
      this.value.length < Vt &&
        Math.sin(this.time * 5) > 0 &&
        (e.measureText(a).width,
        P(e, "|", c / 2 + Math.min(220, this.value.length * 15 + 10), o + 66, {
          size: 40,
          color: p(M.goldLight, 0.8),
          weight: 400,
          shadow: !1,
        })),
      P(e, `${this.value.length} / ${Vt}`, c / 2, o + 118, {
        size: 15,
        color: p(M.cream, 0.55),
        weight: 700,
      }));
    const l = c / 2 - 96,
      n = 616 + Math.sin(this.time * 1.8) * 5;
    ze(e, "bear_brown", l, n, 132);
    const i = c / 2 + 6;
    (m(e, i, n - 62, 210, 62, 16),
      (e.fillStyle = p("#fff3d6", 0.94)),
      e.fill(),
      (e.strokeStyle = M.gold),
      (e.lineWidth = 2.5),
      e.stroke(),
      e.beginPath(),
      e.moveTo(i + 6, n - 12),
      e.lineTo(i - 16, n + 6),
      e.lineTo(i + 30, n - 6),
      e.closePath(),
      (e.fillStyle = p("#fff3d6", 0.94)),
      e.fill(),
      P(e, this.value ? "MERHABA" : "SENİ NASIL", i + 105, n - 43, {
        size: 19,
        color: "#7a3a1a",
        weight: 900,
        shadow: !1,
      }),
      P(e, this.value ? this.value.toUpperCase() : "ÇAĞIRALIM?", i + 105, n - 18, {
        size: 19,
        color: "#c0392b",
        weight: 900,
        shadow: !1,
      }),
      this.keys.forEach((r) => this.drawKey(e, r)));
    const s = this.value.trim().length > 0;
    (Y(e, this.okRect.x, this.okRect.y, this.okRect.w, this.okRect.h, "TAMAM", "green", {
      disabled: !s,
      icon: "✓",
    }),
      P(e, "şimdilik geç", c / 2, this.skipRect.y + this.skipRect.h / 2, {
        size: 17,
        color: p(M.cream, 0.55),
        weight: 700,
      }));
  }
  drawKey(e, o) {
    const a = o.rect,
      l = this.pressed === o.label;
    (e.save(), m(e, a.x, a.y + (l ? 3 : 0), a.w, a.h - (l ? 3 : 0), 14));
    const n = e.createLinearGradient(0, a.y, 0, a.y + a.h);
    (o.action === "char"
      ? (n.addColorStop(0, l ? "#6a3020" : "#5c2a1a"), n.addColorStop(1, "#2a1109"))
      : (n.addColorStop(0, l ? j(M.blue, 10) : O(M.blue, 6)), n.addColorStop(1, j(M.blue, 32))),
      (e.fillStyle = n),
      e.fill(),
      (e.strokeStyle = p(M.gold, l ? 0.9 : 0.55)),
      (e.lineWidth = 2),
      e.stroke(),
      P(e, o.label, a.x + a.w / 2, a.y + a.h / 2 + (l ? 3 : 0), {
        size: o.action === "char" ? 34 : 20,
        color: M.cream,
        weight: 900,
      }),
      e.restore());
  }
  press(e) {
    if (e.action === "char") {
      if (this.value.length >= Vt) return;
      this.value += e.label;
    } else if (e.action === "space") {
      if (this.value.length >= Vt || this.value.length === 0) return;
      this.value += " ";
    } else this.value = this.value.slice(0, -1);
    z.play("button");
  }
  onPointerDown(e) {
    for (const o of this.keys)
      if (W(e.x, e.y, o.rect.x, o.rect.y, o.rect.w, o.rect.h)) {
        ((this.pressed = o.label), this.press(o));
        return;
      }
  }
  onPointerMove(e) {}
  onPointerUp(e) {
    if (
      ((this.pressed = null),
      this.value.trim().length > 0 && W(e.x, e.y, this.okRect.x, this.okRect.y, this.okRect.w, this.okRect.h))
    ) {
      this.finish(!0);
      return;
    }
    W(e.x, e.y, this.skipRect.x, this.skipRect.y, this.skipRect.w, this.skipRect.h) && this.finish(!1);
  }
}
const Zt = 132,
  go = 12,
  pt = 470;
class Ws {
  constructor() {
    u(this, "name", "starPath");
    u(this, "time", 0);
    u(this, "scroll", 0);
    u(this, "dragStartY", 0);
    u(this, "dragStartScroll", 0);
    u(this, "dragging", !1);
    u(this, "toast", "");
    u(this, "toastTimer", 0);
    u(this, "particles", new St());
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
  }
  enter() {
    ((this.toast = ""), (this.toastTimer = 0));
    const e = Ve.list(),
      o = e.findIndex((l) => l.reached && !l.claimed),
      a =
        o >= 0
          ? o
          : Math.max(
              0,
              e.findIndex((l) => !l.reached),
            );
    this.scroll = Math.max(0, Math.min(this.maxScroll, a * (Zt + go) - 120));
  }
  exit() {}
  update(e) {
    ((this.time += e), this.particles.update(e), this.toastTimer > 0 && (this.toastTimer -= e));
  }
  get clipH() {
    return b - pt - 90;
  }
  get maxScroll() {
    const e = Ve.list().length;
    return Math.max(0, e * (Zt + go) - this.clipH);
  }
  rowRect(e) {
    return { x: 36, y: pt + e * (Zt + go) - this.scroll, w: c - 72, h: Zt };
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      Le(e, c - 130, 58, K.coins, 22),
      de(e, c / 2, 150, 500, "YILDIZ YOLU", 30));
    const o = Ve.totalStars(),
      a = Ve.next();
    if (
      (le(e, 30, 210, c - 60, 220, 22),
      P(e, "TOPLANAN YILDIZ", c / 2, 250, { size: 15, color: p(M.cream, 0.7), weight: 800 }),
      P(e, `⭐ ${o}`, c / 2, 300, { size: 52, color: M.goldLight, weight: 900 }),
      a)
    ) {
      const l = this.prevMilestoneStars(a),
        n = Math.max(1, a.milestone.stars - l),
        s = Math.max(0, Math.min(n, o - l)) / n,
        r = 70,
        f = c - 140;
      (m(e, r, 346, f, 26, 13),
        (e.fillStyle = "rgba(0,0,0,0.45)"),
        e.fill(),
        m(e, r, 346, Math.max(26, f * s), 26, 13));
      const h = e.createLinearGradient(r, 0, r + f, 0);
      (h.addColorStop(0, "#ffd54a"),
        h.addColorStop(1, "#ffb020"),
        (e.fillStyle = h),
        e.fill(),
        (e.strokeStyle = p(M.gold, 0.9)),
        (e.lineWidth = 2),
        m(e, r, 346, f, 26, 13),
        e.stroke(),
        P(e, `SIRADAKİ: ${a.milestone.label} (${a.milestone.stars} ⭐)`, c / 2, 400, {
          size: 16,
          color: p(M.cream, 0.85),
          weight: 800,
        }));
    } else P(e, "TÜM ÖDÜLLER AÇILDI! 🏆", c / 2, 380, { size: 22, color: v.tentGold, weight: 900 });
    (e.save(),
      e.beginPath(),
      e.rect(0, pt - 10, c, this.clipH + 20),
      e.clip(),
      Ve.list().forEach((l, n) => {
        const i = this.rowRect(n);
        i.y + i.h < pt - 40 || i.y > pt + this.clipH + 40 || this.drawRow(e, l, i);
      }),
      e.restore(),
      this.particles.render(e),
      this.toastTimer > 0 &&
        (e.save(),
        (e.globalAlpha = Math.min(1, this.toastTimer * 2.5)),
        m(e, c / 2 - 230, b - 96, 460, 60, 30),
        (e.fillStyle = "rgba(0,0,0,0.8)"),
        e.fill(),
        (e.strokeStyle = M.goldLight),
        (e.lineWidth = 2.5),
        e.stroke(),
        P(e, this.toast, c / 2, b - 66, { size: 18, color: M.goldLight, weight: 800 }),
        e.restore()));
  }
  prevMilestoneStars(e) {
    const o = Ve.list();
    return e.index > 0 ? o[e.index - 1].milestone.stars : 0;
  }
  drawRow(e, o, a) {
    const l = o.milestone,
      n = o.reached && !o.claimed;
    Me(e, a.x, a.y, a.w, a.h, { selected: n, locked: !o.reached, radius: 18 });
    const i = a.x + 62,
      s = a.y + a.h / 2;
    if ((e.save(), n)) {
      const h = 0.5 + 0.5 * Math.sin(this.time * 4);
      ((e.shadowColor = p("#ffd54a", 0.9)), (e.shadowBlur = 12 + h * 10));
    }
    e.beginPath();
    for (let h = 0; h < 5; h++) {
      const d = (h * Math.PI * 2) / 5 - Math.PI / 2,
        y = d + Math.PI / 5;
      (e.lineTo(i + Math.cos(d) * 34, s + Math.sin(d) * 34),
        e.lineTo(i + Math.cos(y) * 15, s + Math.sin(y) * 15));
    }
    (e.closePath(),
      (e.fillStyle = o.reached ? "#ffd54a" : "rgba(255,255,255,0.18)"),
      e.fill(),
      e.restore(),
      P(e, String(l.stars), i, s + 1, {
        size: 20,
        color: o.reached ? "#5c3a00" : p(M.cream, 0.6),
        weight: 900,
        shadow: !1,
      }));
    const r = a.x + 112;
    P(e, l.label, r, a.y + 36, {
      size: 18,
      color: o.reached ? M.cream : p(M.cream, 0.55),
      weight: 900,
      align: "left",
    });
    const f = [];
    (l.coins && f.push(`🪙 ${l.coins}`),
      l.gems && f.push(`💎 ${l.gems}`),
      l.tickets && f.push(`🎟 ${l.tickets}`),
      f.length === 0 && l.toy && f.push(`🧸 ${he[l.toy].name}`),
      P(e, f.join("   "), r, a.y + 68, { size: 16, color: p(M.cream, 0.8), weight: 700, align: "left" }),
      l.toy &&
        (e.save(),
        o.reached || (e.globalAlpha = 0.4),
        ze(e, l.toy, a.x + a.w - 68, a.y + a.h / 2 - 6, 74),
        e.restore()),
      n
        ? Y(e, r, a.y + a.h - 46, 150, 36, "ÖDÜLÜ AL", "green")
        : o.claimed
          ? P(e, "✓ ALINDI", r, a.y + a.h - 28, { size: 15, color: v.uiSuccess, weight: 900, align: "left" })
          : P(e, `${l.stars - Ve.totalStars()} yıldız kaldı`, r, a.y + a.h - 28, {
              size: 14,
              color: p(M.cream, 0.5),
              weight: 700,
              align: "left",
            }));
  }
  onPointerDown(e) {
    if (W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h)) {
      V.goto("mainMenu");
      return;
    }
    ((this.dragging = !0), (this.dragStartY = e.y), (this.dragStartScroll = this.scroll));
  }
  onPointerMove(e) {
    this.dragging &&
      (this.scroll = Math.max(0, Math.min(this.maxScroll, this.dragStartScroll - (e.y - this.dragStartY))));
  }
  onPointerUp(e) {
    const o = this.dragging && Math.abs(e.y - this.dragStartY) > 12;
    ((this.dragging = !1),
      !o &&
        Ve.list().forEach((a, l) => {
          if (!a.reached || a.claimed) return;
          const n = this.rowRect(l);
          W(e.x, e.y, n.x, n.y, n.w, n.h) &&
            Ve.claim(a.milestone.stars) &&
            (z.play("reward"),
            (this.toast = `${a.milestone.label} ödülü alındı!`),
            (this.toastTimer = 2.4),
            this.particles.spawnBurst(n.x + n.w / 2, n.y + n.h / 2, 40, {
              colors: ["#ffd54a", "#ffffff", v.tentGold],
              speed: [120, 380],
              size: [3, 7],
              life: [0.5, 1],
            }));
        }));
  }
}
class Ys {
  constructor() {
    u(this, "name", "stats");
    u(this, "time", 0);
    u(this, "backRect", { x: 20, y: 26, w: 64, h: 64 });
  }
  enter() {}
  exit() {}
  update(e) {
    this.time += e;
  }
  rows() {
    const e = U.get(),
      o = e.stats,
      a = o && o.shotsFired > 0 ? `%${Math.round((o.holesHit / o.shotsFired) * 100)}` : "-";
    return [
      { icon: "🏁", label: "Kazanılan bölüm", value: String(o?.levelsWon ?? 0) },
      { icon: "🎯", label: "Deliğe isabet", value: String(o?.holesHit ?? 0) },
      { icon: "🎳", label: "Devrilen kuka", value: String(o?.kukasKnocked ?? 0) },
      { icon: "🏐", label: "Atılan top", value: String(o?.shotsFired ?? 0) },
      { icon: "📈", label: "İsabet oranı", value: a },
      { icon: "✨", label: "Tam isabet", value: String(o?.perfectShots ?? 0) },
      { icon: "🔥", label: "En uzun kombo", value: String(o?.bestCombo ?? 0) },
      { icon: "💯", label: "En yüksek skor", value: String(o?.bestScore ?? 0) },
      { icon: "🧮", label: "Toplam puan", value: String(e.totalScore ?? 0) },
      { icon: "⭐", label: "Toplanan yıldız", value: `${Ve.totalStars()} / ${E.totalLevels * 3}` },
      { icon: "🧸", label: "Oyuncak", value: `${ve.ownedCount()} / ${ve.totalCount}` },
      { icon: "📅", label: "Günlük seri", value: `${e.dailyStreak ?? 0} gün` },
    ];
  }
  render(e) {
    (je(e, this.time),
      me(e, this.backRect.x + 32, this.backRect.y + 32, 32, "←"),
      de(e, c / 2, 150, 480, "İSTATİSTİKLER", 30));
    const o = this.rows(),
      a = 62,
      l = 8,
      n = 210,
      i = 90 + o.length * (a + l) + 22;
    le(e, 24, n, c - 48, i, 24);
    const s = (U.get().name || "Oyuncu").toUpperCase();
    P(e, s, c / 2, n + 48, { size: 26, color: M.goldLight, weight: 900 });
    const r = n + 90;
    o.forEach((f, h) => {
      const d = r + h * (a + l);
      (Me(e, 44, d, c - 88, a, { radius: 14 }),
        P(e, f.icon, 80, d + a / 2, { size: 26, shadow: !1 }),
        P(e, f.label, 112, d + a / 2, { size: 17, color: p(M.cream, 0.85), weight: 700, align: "left" }),
        P(e, f.value, c - 70, d + a / 2, { size: 20, color: M.goldLight, weight: 900, align: "right" }));
    });
  }
  onPointerDown(e) {
    W(e.x, e.y, this.backRect.x, this.backRect.y, this.backRect.w, this.backRect.h) && V.goto("mainMenu");
  }
  onPointerMove(e) {}
  onPointerUp(e) {}
}
function Cs() {
  const t = new URLSearchParams(window.location.search),
    e = t.get("ref"),
    o = t.get("toy");
  return !e || !o || !he[o] || U.get().referredBy
    ? !1
    : (U.update((a) => {
        a.referredBy = { name: e, toyId: o };
      }),
      K.addShots(ol),
      !0);
}
async function Ns() {
  const t = await U.load();
  (z.setEnabled(t.soundOn),
    z.setMusicEnabled(t.musicOn),
    pe.setEnabled(t.vibrationOn !== !1),
    await Oe.preload(),
    V.register(new hn()),
    V.register(new Uo()),
    V.register(new ps()),
    V.register(new vs()),
    V.register(new Ps()),
    V.register(new ks()),
    V.register(new js()),
    V.register(new Us()),
    V.register(new ws()),
    V.register(new Zs()),
    V.register(new Es()),
    V.register(new Is()),
    V.register(new qs()),
    V.register(new Ws()),
    V.register(new Ys()));
  const e = Cs(),
    o = !U.get().nameSet;
  V.goto(e ? "invite" : o ? "nameEntry" : "mainMenu");
  const a = document.getElementById("game-canvas");
  new rl(a).start();
  const n = document.getElementById("loading");
  n && (n.style.display = "none");
}
Ns().catch((t) => {
  console.error("[boot] failed", t);
  const e = document.getElementById("loading");
  e && (e.textContent = "Bir hata oluştu, sayfayı yenileyin.");
});
class Hs extends Jt {
  constructor() {
    (super(...arguments), (this.group = "CapacitorStorage"));
  }
  async configure({ group: e }) {
    typeof e == "string" && (this.group = e);
  }
  async get(e) {
    return { value: this.impl.getItem(this.applyPrefix(e.key)) };
  }
  async set(e) {
    this.impl.setItem(this.applyPrefix(e.key), e.value);
  }
  async remove(e) {
    this.impl.removeItem(this.applyPrefix(e.key));
  }
  async keys() {
    return { keys: this.rawKeys().map((o) => o.substring(this.prefix.length)) };
  }
  async clear() {
    for (const e of this.rawKeys()) this.impl.removeItem(e);
  }
  async migrate() {
    var e;
    const o = [],
      a = [],
      l = "_cap_",
      n = Object.keys(this.impl).filter((i) => i.indexOf(l) === 0);
    for (const i of n) {
      const s = i.substring(l.length),
        r = (e = this.impl.getItem(i)) !== null && e !== void 0 ? e : "",
        { value: f } = await this.get({ key: s });
      typeof f == "string" ? a.push(s) : (await this.set({ key: s, value: r }), o.push(s));
    }
    return { migrated: o, existing: a };
  }
  async removeOld() {
    const e = "_cap_",
      o = Object.keys(this.impl).filter((a) => a.indexOf(e) === 0);
    for (const a of o) this.impl.removeItem(a);
  }
  get impl() {
    return window.localStorage;
  }
  get prefix() {
    return this.group === "NativeStorage" ? "" : `${this.group}.`;
  }
  rawKeys() {
    return Object.keys(this.impl).filter((e) => e.indexOf(this.prefix) === 0);
  }
  applyPrefix(e) {
    return this.prefix + e;
  }
}
const Bs = Object.freeze(
  Object.defineProperty({ __proto__: null, PreferencesWeb: Hs }, Symbol.toStringTag, { value: "Module" }),
);
class Ds extends Jt {
  async canShare() {
    return typeof navigator > "u" || !navigator.share ? { value: !1 } : { value: !0 };
  }
  async share(e) {
    if (typeof navigator > "u" || !navigator.share)
      throw this.unavailable("Share API not available in this browser");
    return (await navigator.share({ title: e.title, text: e.text, url: e.url }), {});
  }
}
const Js = Object.freeze(
  Object.defineProperty({ __proto__: null, ShareWeb: Ds }, Symbol.toStringTag, { value: "Module" }),
);
