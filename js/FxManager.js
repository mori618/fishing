// ========================================
// FxManager - 演出・手触り強化レイヤー
// ========================================
// UIManager / FishingGame の既存の表示関数を「包んで」、
// 元の処理のあとに効果音・パーティクル・水面演出などを足す。
// 元のゲームロジックは変更しないので、このファイルと
// index.html の <script> を外せば元の挙動に戻せる。
const FxManager = {
    canvas: null,
    ctx: null,
    W: 0,
    H: 0,
    dpr: 1,
    t0: 0,
    ripples: [],
    drops: [],
    glints: [],
    running: false,
    reducedMotion: false,
    nibbleScale: 1,
    shadowRaf: null,

    init() {
        if (typeof document === 'undefined') return;
        this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (typeof SoundManager !== 'undefined') SoundManager.init();
        this.setupWaterCanvas();
        this.setupMuteButton();
        this.wrapUI();
        this.wrapGame();
    },

    // ----------------------------------------
    // ユーティリティ
    // ----------------------------------------
    sound(name, opt) {
        if (typeof SoundManager !== 'undefined') SoundManager.play(name, opt);
    },

    vibrate(pattern) {
        try {
            if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
        } catch (e) { /* ignore */ }
    },

    screen() {
        return document.getElementById('fishing-screen');
    },

    // ウキの画面座標（canvas座標系）
    bobberPoint() {
        if (typeof RodAnimator !== 'undefined' && RodAnimator.bobber && RodAnimator.layout) {
            return { x: RodAnimator.bobber.x, y: RodAnimator.bobber.y };
        }
        return null;
    },

    setFocus(on) {
        const scr = this.screen();
        if (scr) scr.classList.toggle('fx-focus', !!on);
    },

    // ----------------------------------------
    // 水面キャンバス（揺らぎ・光・波紋・しぶき）
    // ----------------------------------------
    setupWaterCanvas() {
        const scr = this.screen();
        if (!scr) return;
        const c = document.createElement('canvas');
        c.id = 'fx-water';
        c.className = 'fx-water-canvas';
        scr.insertBefore(c, scr.firstChild);
        this.canvas = c;
        this.ctx = c.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        for (let i = 0; i < 26; i++) this.glints.push({ x: Math.random(), y: Math.random(), p: Math.random() * Math.PI * 2, s: 0.5 + Math.random() });
        this.t0 = performance.now();
        this.running = true;
        requestAnimationFrame((t) => this.loop(t));
    },

    resize() {
        if (!this.canvas) return;
        const scr = this.screen();
        const rect = scr.getBoundingClientRect();
        this.dpr = Math.min(2, window.devicePixelRatio || 1);
        this.W = rect.width || window.innerWidth;
        this.H = rect.height || window.innerHeight;
        this.canvas.width = Math.round(this.W * this.dpr);
        this.canvas.height = Math.round(this.H * this.dpr);
    },

    addRipple(x, y, size = 1, strength = 1) {
        if (x == null) return;
        this.ripples.push({ x, y, r: 4, max: 70 * size, a: 0.7 * strength, w: 2 });
    },

    addSplash(x, y, count = 14, power = 1) {
        if (x == null) return;
        for (let i = 0; i < count; i++) {
            const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
            const sp = (1.5 + Math.random() * 3.5) * power;
            this.drops.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, r: 1 + Math.random() * 2.2, y0: y });
        }
    },

    loop(now) {
        requestAnimationFrame((t) => this.loop(t));
        const scr = this.screen();
        if (!scr || !scr.classList.contains('active') || document.hidden) return;
        if (this.canvas.width === 0 || Math.abs(scr.clientWidth - this.W) > 1) this.resize();

        const ctx = this.ctx;
        const W = this.W, H = this.H;
        const t = (now - this.t0) / 1000;
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const horizon = H * 0.30;

        // 水面の揺らぎライン（遠くは細かく、手前は大きく：遠近感）
        if (!this.reducedMotion) {
            ctx.lineCap = 'round';
            for (let i = 0; i < 16; i++) {
                const k = i / 16;
                const y = horizon + 6 + Math.pow(k, 1.7) * (H - horizon);
                const amp = 1 + k * 6;
                const len = 0.06 + k * 0.12;
                const alpha = 0.05 + k * 0.10;
                ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                ctx.lineWidth = 0.6 + k * 1.6;
                const segs = 4 + Math.floor((1 - k) * 4);
                for (let s = 0; s < segs; s++) {
                    const base = ((s / segs) + (i * 0.37) + t * (0.02 + k * 0.03)) % 1;
                    const x = base * (W + 120) - 60;
                    const w = len * W;
                    ctx.beginPath();
                    for (let j = 0; j <= 10; j++) {
                        const px = x + (j / 10) * w;
                        const py = y + Math.sin(px * 0.03 / (0.4 + k) + t * 1.6 + i) * amp * 0.4;
                        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                    ctx.stroke();
                }
            }
        }

        // 太陽の照り返し（水平線付近がきらきら）
        for (const g of this.glints) {
            const gy = horizon + 4 + Math.pow(g.y, 2) * (H - horizon) * 0.45;
            const gx = W * (0.25 + g.x * 0.5) + Math.sin(t * 0.5 + g.p) * 8;
            const a = Math.max(0, Math.sin(t * 2.2 * g.s + g.p)) * 0.55 * (1 - g.y);
            if (a < 0.02) continue;
            const len = 4 + (1 - g.y) * 10;
            ctx.strokeStyle = `rgba(255,255,240,${a})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(gx - len, gy);
            ctx.lineTo(gx + len, gy);
            ctx.stroke();
        }

        // 波紋（遠近で楕円）
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.r += 0.9 + r.r * 0.025;
            const life = 1 - r.r / r.max;
            if (life <= 0) { this.ripples.splice(i, 1); continue; }
            ctx.strokeStyle = `rgba(255,255,255,${r.a * life})`;
            ctx.lineWidth = r.w * life + 0.5;
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, r.r, r.r * 0.32, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // しぶき
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const d = this.drops[i];
            d.vy += 0.22;
            d.x += d.vx;
            d.y += d.vy;
            d.life -= 0.018;
            if (d.life <= 0 || (d.vy > 0 && d.y > d.y0 + 6)) {
                if (d.vy > 0 && d.y > d.y0 && Math.random() < 0.25) this.addRipple(d.x, d.y0 + 4, 0.25, 0.6);
                this.drops.splice(i, 1);
                continue;
            }
            ctx.fillStyle = `rgba(255,255,255,${0.85 * d.life})`;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // ----------------------------------------
    // ヒット演出：「！」・フラッシュ・ズーム
    // ----------------------------------------
    hitBurst() {
        const scr = this.screen();
        if (!scr) return;
        const flash = document.createElement('div');
        flash.className = 'fx-hit-flash';
        scr.appendChild(flash);
        setTimeout(() => flash.remove(), 400);

        const mark = document.createElement('div');
        mark.className = 'fx-hit-mark';
        mark.innerHTML = '<span class="fx-hit-ex">！</span><span class="fx-hit-text">HIT!</span>';
        const p = this.bobberPoint();
        if (p) {
            mark.style.left = `${p.x}px`;
            mark.style.top = `${p.y - 135}px`;
        }
        scr.appendChild(mark);
        setTimeout(() => mark.remove(), 800);

        const scene = document.getElementById('rod-scene');
        if (scene) {
            scene.classList.remove('rg-jolt');
            void scene.getBoundingClientRect();
            scene.classList.add('rg-jolt');
        }

        scr.classList.remove('fx-punch');
        void scr.offsetWidth;
        scr.classList.add('fx-punch');
    },

    // ゲージ停止時の判定表示
    judgePopup(zone) {
        const bar = document.querySelector('.gauge-container');
        if (!bar) return;
        const anchor = document.createElement('div');
        anchor.className = 'fx-judge-anchor';
        const el = document.createElement('div');
        const map = { red: ['PERFECT!', 'fx-judge-red'], green: ['GOOD!', 'fx-judge-green'], white: ['MISS…', 'fx-judge-white'] };
        const [txt, cls] = map[zone] || map.white;
        el.className = 'fx-judge ' + cls;
        el.textContent = txt;
        anchor.appendChild(el);
        bar.parentNode.insertBefore(anchor, bar);
        const ind = document.getElementById('gauge-indicator');
        if (ind) ind.classList.add('fx-stopped', 'fx-stopped-' + zone);
    },

    // ----------------------------------------
    // 釣果カード演出
    // ----------------------------------------
    enhanceCatchCard(fish) {
        const card = document.querySelector('#result-overlay .result-card');
        if (!card) return;
        const order = ['D', 'C', 'B', 'A', 'S', 'SS', 'GOD'];
        const r = Math.max(0, order.indexOf(fish.rarity));
        card.classList.add('fx-card-in', 'fx-r' + r);

        // 魚のイラストに差し替え
        const icon = card.querySelector('.result-icon');
        if (icon && typeof FishArt !== 'undefined' && FishArt.isFish(fish)) {
            const holder = document.createElement('div');
            holder.className = 'fx-result-fish';
            holder.innerHTML = FishArt.svg(fish, { className: 'fish-art fx-result-fish-svg' });
            icon.replaceWith(holder);
        }

        const circle = card.querySelector('.icon-circle');
        if (circle && r >= 2) {
            const rays = document.createElement('div');
            rays.className = 'fx-rays';
            circle.insertBefore(rays, circle.firstChild);
        }
        if (r >= 3) this.confetti(card, r >= 4 ? 40 : 22);
        if (r >= 4) {
            const scr = this.screen();
            const f = document.createElement('div');
            f.className = 'fx-gold-flash';
            scr.appendChild(f);
            setTimeout(() => f.remove(), 900);
        }
        if (fish.hasTitle) card.classList.add('fx-titled');
    },

    confetti(card, n) {
        const box = document.createElement('div');
        box.className = 'fx-confetti';
        const colors = ['#fde047', '#f472b6', '#60a5fa', '#34d399', '#f97316', '#ffffff'];
        for (let i = 0; i < n; i++) {
            const p = document.createElement('i');
            p.style.left = `${Math.random() * 100}%`;
            p.style.background = colors[i % colors.length];
            p.style.animationDelay = `${Math.random() * 0.4}s`;
            p.style.animationDuration = `${1.4 + Math.random() * 1.2}s`;
            p.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
            p.style.setProperty('--rot', `${Math.random() * 720}deg`);
            box.appendChild(p);
        }
        card.appendChild(box);
        setTimeout(() => box.remove(), 3200);
    },

    // ----------------------------------------
    // 音のON/OFFボタン（上部チップ列の右端）
    // ----------------------------------------
    setupMuteButton() {
        const right = document.querySelector('#fishing-screen .rg-chips') || document.querySelector('#fishing-screen .floating-status-right');
        if (!right || typeof SoundManager === 'undefined') return;
        const btn = document.createElement('button');
        btn.id = 'sound-toggle-btn';
        btn.className = 'rg-chip rg-chip-btn rg-chip-sound';
        const render = () => {
            btn.innerHTML = `<span class="material-icons">${SoundManager.muted ? 'volume_off' : 'volume_up'}</span>`;
            btn.setAttribute('aria-label', SoundManager.muted ? '効果音をオンにする' : '効果音をオフにする');
        };
        render();
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            SoundManager.toggleMute();
            render();
            if (!SoundManager.muted) SoundManager.play('tap');
        });
        // 釣りエリアのタップ判定に吸われないように
        ['touchstart', 'touchend', 'pointerdown'].forEach(ev => btn.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
        right.appendChild(btn);
    },

    // ----------------------------------------
    // 既存の表示関数を包む
    // ----------------------------------------
    after(obj, name, fn) {
        const orig = obj && obj[name];
        if (typeof orig !== 'function') return;
        obj[name] = function (...args) {
            const res = orig.apply(this, args);
            try { fn.apply(FxManager, args); } catch (e) { console.warn('Fx error in', name, e); }
            return res;
        };
    },

    before(obj, name, fn) {
        const orig = obj && obj[name];
        if (typeof orig !== 'function') return;
        obj[name] = function (...args) {
            try { fn.apply(FxManager, args); } catch (e) { console.warn('Fx error in', name, e); }
            return orig.apply(this, args);
        };
    },

    // 魚と自分のパワー差から、バトル中の竿のしなり方を決める
    matchup(fish) {
        try {
            const ratio = fish.power / Math.max(1, GameState.getTotalPower());
            if (ratio < 0.7) return 'easy';
            if (ratio < 1.0) return 'even';
            if (ratio < 1.5) return 'hard';
            return 'reckless';
        } catch (e) { return 'even'; }
    },

    rod(state, options) {
        if (typeof RodAnimator !== 'undefined' && RodAnimator.els) RodAnimator.setState(state, options || {});
    },

    // 竿の演出は釣り画面にいる間だけ動かす
    syncRodLoop() {
        if (typeof RodAnimator === 'undefined') return;
        const scr = this.screen();
        if (scr && scr.classList.contains('active')) {
            RodAnimator.start();
            requestAnimationFrame(() => RodAnimator.resize());
        } else {
            RodAnimator.stop();
        }
    },

    wrapUI() {
        if (typeof UIManager === 'undefined') return;
        const U = UIManager;

        if (typeof RodAnimator !== 'undefined') RodAnimator.init();
        this.after(U, 'showScreen', function () { this.syncRodLoop(); });
        this.syncRodLoop();

        // 竿・糸・ウキの描画は RodAnimator に任せる（旧CSSの竿のクラスも残しておく）
        this.after(U, 'updateRodView', function (state) {
            const fish = typeof FishingGame !== 'undefined' ? FishingGame.currentFish : null;
            const rarity = fish ? fish.rarity : 'D';
            if (state === 'battle') {
                this.rod('battle', { rarity, matchup: fish ? this.matchup(fish) : 'even' });
            } else if (state === 'hit' || state === 'strike') {
                this.rod(state, { rarity });
            } else if (state) {
                this.rod(state);
            }
            if (state === 'strike') this.sound('strike');
        });

        this.after(U, 'showIdle', function () {
            this.setFocus(false);
            if (typeof SoundManager !== 'undefined') SoundManager.stopReel();
        });

        this.after(U, 'showNibble', function (scale = 1) {
            this.nibbleScale = scale;
            this.setFocus(true);
        });

        this.after(U, 'triggerBobberShake', function () {
            this.sound('nibble', { scale: this.nibbleScale });
            this.vibrate(8);
            if (typeof RodAnimator !== 'undefined') RodAnimator.nibble(this.nibbleScale || 1);
        });

        this.after(U, 'showHit', function () {
            this.sound('hit');
            this.vibrate([40, 30, 90]);
            this.hitBurst();
        });

        this.after(U, 'showGaugeBattle', function () {
            this.setFocus(true);
            if (typeof SoundManager !== 'undefined') SoundManager.startReel();
        });

        this.after(U, 'updateGaugePosition', function (position) {
            if (typeof RodAnimator !== 'undefined') RodAnimator.setGauge(position);
        });

        this.after(U, 'showCatchSuccess', function (fish) {
            this.setFocus(false);
            if (typeof SoundManager !== 'undefined') SoundManager.stopReel();
            this.sound('success', { rarity: fish && fish.rarity });
            this.vibrate([20, 40, 20]);
            this.rod('success', { rarity: fish ? fish.rarity : 'D', treasure: false });
            if (fish) this.enhanceCatchCard(fish);
        });

        this.after(U, 'showTreasureResult', function () {
            this.setFocus(false);
            this.sound('success', { rarity: 'A' });
            this.vibrate([20, 40, 20]);
            this.rod('success', { rarity: 'A', treasure: true });
            const card = document.querySelector('#result-overlay .result-card');
            if (card) { card.classList.add('fx-card-in'); this.confetti(card, 24); }
        });

        this.after(U, 'showGachaResult', function () {
            this.sound('success', { rarity: 'B' });
        });

        this.after(U, 'showCatchFailed', function (fish) {
            this.setFocus(false);
            if (typeof SoundManager !== 'undefined') SoundManager.stopReel();
            this.sound('fail');
            this.rod('fail');
            const icon = document.querySelector('#result-overlay .result-icon');
            if (icon && fish && typeof FishArt !== 'undefined' && FishArt.isFish(fish)) {
                const holder = document.createElement('div');
                holder.className = 'fx-result-fish escaped';
                holder.innerHTML = FishArt.svg(fish, { className: 'fish-art fx-result-fish-svg' });
                icon.replaceWith(holder);
            }
        });

        this.after(U, 'showMissed', function (message) {
            this.setFocus(false);
            if (typeof SoundManager !== 'undefined') SoundManager.stopReel();
            this.sound(String(message).indexOf('早') >= 0 ? 'early' : 'fail');
            this.rod('fail');
        });

        // 上部バー：ランクの進み具合
        this.after(U, 'updateRankInfo', function () { this.renderRankBar(); });
        // 下部HUD：餌スロットと竿の表示
        this.after(U, 'updateBaitInfo', function () { this.renderBaitSlot(); });
        this.after(U, 'updateRodInfo', function () {
            this.renderRodBadge();
            if (typeof RodAnimator !== 'undefined' && RodAnimator.els) RodAnimator.refreshSkin();
        });
        this.renderRankBar();
        this.renderBaitSlot();
        this.renderRodBadge();
    },

    renderRankBar() {
        const label = document.getElementById('fu-rank-label');
        if (!label || typeof GameState === 'undefined') return;
        const next = GameState.getNextRankExp ? GameState.getNextRankExp() : 0;
        const pct = next ? Math.max(0, Math.min(100, Math.floor((GameState.exp / next) * 100))) : 0;
        label.textContent = `RANK ${GameState.rank}`;
        const bar = document.getElementById('fu-rank-bar');
        if (bar) bar.style.width = `${pct}%`;
        const txt = document.getElementById('fu-rank-pct');
        if (txt) txt.textContent = `${pct}%`;
    },

    // 餌の表示を、ランクの文字と残り数の丸いスロットにする（タップで購入、左右で切り替え）
    renderBaitSlot() {
        const info = document.getElementById('bait-info');
        if (!info || typeof GameState === 'undefined') return;
        const bait = GAME_DATA.BAITS.find(b => b.id === GameState.baitType);
        if (!bait) return;
        const count = GameState.getCurrentBaitCount();
        const label = info.querySelector('.bait-label-container');
        if (label) {
            const btn = document.createElement('button');
            btn.className = 'rg-bait-slot selected';
            btn.setAttribute('aria-label', `${bait.name}（タップで購入）`);
            btn.innerHTML = `<span class="rg-bait-rank rank-${bait.rank}">${bait.rank}</span><span class="rg-bait-count">×${count === -1 ? '∞' : count}</span>`;
            btn.addEventListener('click', () => UIManager.showBaitPurchaseDialog(bait.id));
            label.replaceWith(btn);
        }
        const name = document.getElementById('fu-bait-name');
        if (name) name.textContent = bait.name;
    },

    renderRodBadge() {
        const info = document.getElementById('rod-info');
        if (!info || typeof GameState === 'undefined' || info.querySelector('.rg-rod-preview')) return;
        const stars = GameState.rodStars || 0;
        const rod = GameState.getCurrentRod();
        const preview = typeof RodAnimator !== 'undefined' ? RodAnimator.previewSvg('all', GameState.rodRankIndex) : '';
        info.innerHTML = `${preview}
            <span class="rod-name">${rod ? rod.name : ''}</span>
            <span class="rg-rod-stars">${'★'.repeat(stars)}<span class="off">${'★'.repeat(Math.max(0, 5 - stars))}</span></span>`;
    },

    wrapGame() {
        if (typeof FishingGame === 'undefined') return;
        this.before(FishingGame, 'resolveCatch', function () {
            if (FishingGame.isProcessing) return;
            const zone = UIManager.getGaugeZone(FishingGame.gaugePosition);
            if (typeof SoundManager !== 'undefined') SoundManager.stopReel();
            this.sound('stop', { zone });
            this.vibrate(zone === 'red' ? [15, 30, 15] : 20);
            this.judgePopup(zone);
        });
        this.before(FishingGame, 'abort', function () {
            this.setFocus(false);
            if (typeof SoundManager !== 'undefined') SoundManager.stopReel();
        });
    }
};

if (typeof window !== 'undefined') {
    window.FxManager = FxManager;
}
