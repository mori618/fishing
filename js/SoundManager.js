// ========================================
// SoundManager - 効果音（Web Audio で合成。音声ファイル不要）
// ========================================
// iOS/Android は最初のタップまで音が鳴らせないため、
// 最初のタッチ/クリックで AudioContext を有効化する。
const SoundManager = {
    ctx: null,
    master: null,
    muted: false,
    reelTimer: null,
    _noiseBuffer: null,

    init() {
        try {
            this.muted = localStorage.getItem('fishing_sound_muted') === '1';
        } catch (e) { /* ignore */ }

        const unlock = () => {
            this.ensureContext();
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        };
        ['touchstart', 'pointerdown', 'keydown'].forEach(ev =>
            document.addEventListener(ev, unlock, { passive: true, capture: true })
        );
    },

    ensureContext() {
        if (this.ctx) return this.ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.55;
        // 軽いコンプレッサーで音割れ防止
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -14;
        comp.ratio.value = 4;
        this.master.connect(comp);
        comp.connect(this.ctx.destination);
        return this.ctx;
    },

    setMuted(m) {
        this.muted = m;
        try { localStorage.setItem('fishing_sound_muted', m ? '1' : '0'); } catch (e) { /* ignore */ }
        if (this.master) this.master.gain.value = m ? 0 : 0.55;
        if (m) this.stopReel();
    },

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    },

    // ---------- 低レベル部品 ----------
    noiseBuffer() {
        if (this._noiseBuffer) return this._noiseBuffer;
        const ctx = this.ctx;
        const len = ctx.sampleRate * 1.0;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this._noiseBuffer = buf;
        return buf;
    },

    tone({ type = 'sine', freq = 440, freqEnd = null, dur = 0.15, vol = 0.3, delay = 0, attack = 0.005 }) {
        const ctx = this.ensureContext();
        if (!ctx || this.muted) return;
        const t = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t + dur);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g);
        g.connect(this.master);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    },

    noise({ dur = 0.3, vol = 0.3, filter = 'lowpass', freq = 1200, freqEnd = null, q = 1, delay = 0, attack = 0.01 }) {
        const ctx = this.ensureContext();
        if (!ctx || this.muted) return;
        const t = ctx.currentTime + delay;
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer();
        const f = ctx.createBiquadFilter();
        f.type = filter;
        f.frequency.setValueAtTime(freq, t);
        if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
        f.Q.value = q;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f);
        f.connect(g);
        g.connect(this.master);
        src.start(t, Math.random() * 0.5);
        src.stop(t + dur + 0.05);
    },

    // ---------- 効果音 ----------
    play(name, opt = {}) {
        try {
            const fn = this.sfx[name];
            if (fn) fn.call(this, opt);
        } catch (e) {
            console.warn('SoundManager error', e);
        }
    },

    sfx: {
        // 竿を振る「ヒュンッ」
        cast() {
            this.noise({ dur: 0.35, vol: 0.35, filter: 'bandpass', freq: 600, freqEnd: 3500, q: 2, attack: 0.04 });
            this.tone({ type: 'sine', freq: 900, freqEnd: 300, dur: 0.3, vol: 0.05 });
        },
        // 着水「チャポン」
        splash() {
            this.noise({ dur: 0.25, vol: 0.35, filter: 'lowpass', freq: 2200, freqEnd: 300 });
            this.tone({ type: 'sine', freq: 520, freqEnd: 1100, dur: 0.12, vol: 0.18, delay: 0.02 });
        },
        // 予兆「ポコッ」
        nibble(opt) {
            const big = opt.scale || 1;
            this.tone({ type: 'sine', freq: 380 / Math.sqrt(big), freqEnd: 700 / Math.sqrt(big), dur: 0.09, vol: 0.16 * Math.min(1.6, big) });
            this.noise({ dur: 0.08, vol: 0.06, filter: 'lowpass', freq: 900 });
        },
        // ヒット！（アタック）
        hit() {
            this.noise({ dur: 0.35, vol: 0.45, filter: 'lowpass', freq: 3000, freqEnd: 400 });
            this.tone({ type: 'square', freq: 880, dur: 0.08, vol: 0.12 });
            this.tone({ type: 'square', freq: 1320, dur: 0.14, vol: 0.12, delay: 0.07 });
            this.tone({ type: 'sine', freq: 120, freqEnd: 60, dur: 0.25, vol: 0.4 });
        },
        // 合わせ（竿を立てる）
        strike() {
            this.noise({ dur: 0.18, vol: 0.25, filter: 'highpass', freq: 1500, attack: 0.01 });
        },
        // ゲージ停止
        stop(opt) {
            const z = opt.zone;
            if (z === 'red') {
                this.tone({ type: 'triangle', freq: 1046, dur: 0.12, vol: 0.25 });
                this.tone({ type: 'triangle', freq: 1568, dur: 0.25, vol: 0.22, delay: 0.08 });
            } else if (z === 'green') {
                this.tone({ type: 'triangle', freq: 784, dur: 0.18, vol: 0.22 });
            } else {
                this.tone({ type: 'sawtooth', freq: 220, freqEnd: 140, dur: 0.22, vol: 0.12 });
            }
        },
        // 釣り上げ成功ファンファーレ（レア度で豪華に）
        success(opt) {
            const order = ['D', 'C', 'B', 'A', 'S', 'SS', 'GOD'];
            const r = Math.max(0, order.indexOf(opt.rarity || 'D'));
            this.noise({ dur: 0.4, vol: 0.3, filter: 'lowpass', freq: 2500, freqEnd: 500 }); // 水から上がる音
            const base = [523, 659, 784, 1046, 1318, 1568];
            const n = Math.min(base.length, 3 + r);
            for (let i = 0; i < n; i++) {
                this.tone({ type: 'triangle', freq: base[i], dur: 0.22, vol: 0.18, delay: 0.12 + i * 0.08 });
            }
            if (r >= 3) {
                // 和音で余韻
                [1046, 1318, 1568].forEach((f, i) =>
                    this.tone({ type: 'sine', freq: f, dur: 1.0, vol: 0.1, delay: 0.15 + n * 0.08, attack: 0.03 })
                );
                // キラキラ
                for (let i = 0; i < 6; i++) {
                    this.tone({ type: 'sine', freq: 2000 + Math.random() * 2000, dur: 0.08, vol: 0.05, delay: 0.3 + n * 0.08 + i * 0.06 });
                }
            }
        },
        // 失敗
        fail() {
            this.tone({ type: 'triangle', freq: 392, freqEnd: 196, dur: 0.5, vol: 0.2 });
            this.noise({ dur: 0.3, vol: 0.15, filter: 'lowpass', freq: 1200, freqEnd: 200, delay: 0.05 });
        },
        // 早すぎ
        early() {
            this.tone({ type: 'square', freq: 300, freqEnd: 180, dur: 0.18, vol: 0.08 });
        },
        // UIタップ
        tap() {
            this.tone({ type: 'sine', freq: 660, freqEnd: 880, dur: 0.06, vol: 0.08 });
        }
    },

    // リール巻き音（ゲージバトル中に鳴らし続ける）
    startReel() {
        this.stopReel();
        if (this.muted) return;
        this.reelTimer = setInterval(() => {
            this.noise({ dur: 0.025, vol: 0.12, filter: 'bandpass', freq: 3200, q: 6, attack: 0.002 });
        }, 70);
    },

    stopReel() {
        if (this.reelTimer) {
            clearInterval(this.reelTimer);
            this.reelTimer = null;
        }
    }
};

if (typeof window !== 'undefined') {
    window.SoundManager = SoundManager;
}
