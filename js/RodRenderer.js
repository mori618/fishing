// ========================================
// RodRenderer - 釣り竿と釣り糸の描画（canvas）
// ========================================
// 竿は「根元の角度」と「しなり量」の2つをバネで動かし、
// 竿先の位置から釣り糸をウキ（またはバトル中の魚影）まで引く。
// 竿の種類（木・竹・カーボン・チタン・伝説）で素材の見た目が変わる。
// 状態は #fishing-rod-view のクラス（UIManager.updateRodView が設定）から読む。
const RodRenderer = {
    canvas: null,
    ctx: null,
    W: 0, H: 0, dpr: 1,
    last: 0,

    // 物理状態
    angle: 0.15, angleV: 0,     // 根元の角度（ラジアン。0=真上、負=左へ倒れる）
    bend: 0, bendV: 0,          // しなり（負=竿先が下がる）
    reel: 0, reelV: 0,          // リールハンドルの回転
    lineSlack: 60,              // 糸のたるみ
    lineTension: 0,
    pendulum: 0, pendulumV: 0,  // 待機中にぶら下がるウキの揺れ

    state: 'idle',
    stateTime: 0,
    snapT: -1,                  // 糸が切れた/外れた瞬間
    tip: { x: 0, y: 0 },
    sparkles: [],

    // 状態ごとの目標値
    POSE: {
        idle:    { angle: -0.16, bend: -0.03, slack: 0 },
        casting: { angle: -0.50, bend: 0, slack: 30 },
        waiting: { angle: -0.40, bend: -0.06, slack: 46 },
        nibble:  { angle: -0.40, bend: -0.10, slack: 24 },
        hit:     { angle: -0.40, bend: -0.24, slack: 0 },
        strike:  { angle: -0.14, bend: -0.20, slack: 0 },
        battle:  { angle: -0.26, bend: -0.30, slack: 0 },
        success: { angle: 0.05, bend: -0.08, slack: 0 }
    },

    // 竿の素材
    MATERIALS: {
        wooden_rod:    { base: '#8B5A2B', dark: '#4e2f14', light: '#c08a55', pattern: 'grain', wrap: '#2e7d32', grip: 'wood', reel: '#b8860b', tip: '#ff7043' },
        bamboo_rod:    { base: '#9aa83a', dark: '#5f6b1d', light: '#d4dc7a', pattern: 'nodes', wrap: '#8d1c1c', grip: 'cord', reel: '#9e9e9e', tip: '#ffeb3b' },
        carbon_rod:    { base: '#23282d', dark: '#0b0d10', light: '#6b7c8c', pattern: 'weave', wrap: '#00bcd4', grip: 'eva', reel: '#37474f', tip: '#ff1744' },
        titanium_rod:  { base: '#b8bec6', dark: '#6f7782', light: '#ffffff', pattern: 'metal', wrap: '#d4a017', grip: 'cork', reel: '#cfd8dc', tip: '#ff9100' },
        legendary_rod: { base: '#d4a017', dark: '#7a5200', light: '#fff4b0', pattern: 'legend', wrap: '#7b1fa2', grip: 'royal', reel: '#ffd54f', tip: '#e040fb' }
    },

    init() {
        const scr = document.getElementById('fishing-screen');
        if (!scr) return;
        const c = document.createElement('canvas');
        c.id = 'fx-rod';
        c.className = 'fx-rod-canvas';
        const water = document.getElementById('fx-water');
        if (water && water.nextSibling) scr.insertBefore(c, water.nextSibling);
        else scr.insertBefore(c, scr.firstChild);
        this.canvas = c;
        this.ctx = c.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.last = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    resize() {
        const scr = document.getElementById('fishing-screen');
        if (!scr || !this.canvas) return;
        const r = scr.getBoundingClientRect();
        this.dpr = Math.min(2, window.devicePixelRatio || 1);
        this.W = r.width || window.innerWidth;
        this.H = r.height || window.innerHeight;
        this.canvas.width = Math.round(this.W * this.dpr);
        this.canvas.height = Math.round(this.H * this.dpr);
    },

    // ---------- 外部からのきっかけ ----------
    impulse(kind, power = 1) {
        if (kind === 'nibble') {
            this.bendV -= 1.6 * power;
            this.angleV -= 0.25 * power;
        } else if (kind === 'hit') {
            this.bendV -= 6;
            this.angleV -= 1.2;
        } else if (kind === 'strike') {
            this.angleV += 3;
            this.bendV -= 3;
        } else if (kind === 'stop') {
            this.bendV += 2.5;
        } else if (kind === 'snap') {
            this.bendV += 7;
            this.snapT = performance.now();
        } else if (kind === 'land') {
            this.bendV -= 1.2;
        }
    },

    currentState() {
        const v = document.getElementById('fishing-rod-view');
        if (!v) return 'idle';
        for (const s of Object.keys(this.POSE)) if (v.classList.contains(s)) return s;
        return 'idle';
    },

    material() {
        // 基本は装備中の竿の素材。着せ替えスキンを選んでいる場合はスキンを優先する
        let rodId = 'wooden_rod', skinColor = null;
        try {
            const rod = GameState.getCurrentRod();
            if (rod) rodId = rod.id;
            const skin = GameState.getCurrentSkin();
            if (skin && skin.id !== 'skin_default') {
                if (skin.rodId && this.MATERIALS[skin.rodId]) rodId = skin.rodId;
                else skinColor = skin.rodColor;
            }
        } catch (e) { /* ignore */ }
        const m = Object.assign({}, this.MATERIALS[rodId] || this.MATERIALS.wooden_rod);
        if (skinColor) {
            m.base = skinColor;
            m.dark = this.shade(skinColor, -0.45);
            m.light = this.shade(skinColor, 0.5);
        }
        m.id = rodId;
        return m;
    },

    shade(hex, amt) {
        const h = hex.replace('#', '');
        const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
        let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        const f = (c) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
        return `rgb(${f(r)},${f(g)},${f(b)})`;
    },

    // ---------- 物理 ----------
    spring(val, vel, target, k, damp, dt) {
        const acc = (target - val) * k - vel * damp;
        vel += acc * dt;
        val += vel * dt;
        return [val, vel];
    },

    lineTarget() {
        const scr = document.getElementById('fishing-screen');
        const s = scr.getBoundingClientRect();
        const pick = (sel, yFrac) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            if (r.width === 0) return null;
            return { x: r.left + r.width / 2 - s.left, y: r.top + r.height * yFrac - s.top };
        };
        if (this.state === 'casting') return pick('.fx-flying-bobber', 0.3);
        if (this.state === 'battle') return pick('.fx-fish-shadow', 0.45) || pick('#fishing-area .gauge-battle', 0.2);
        if (['waiting', 'nibble', 'hit'].includes(this.state)) return pick('#fishing-area .bobber-stick', 0.05) || pick('#fishing-area .bobber-body', 0.1);
        return null;
    },

    loop(now) {
        requestAnimationFrame((t) => this.loop(t));
        const scr = document.getElementById('fishing-screen');
        if (!scr || !scr.classList.contains('active') || document.hidden) { this.last = now; return; }
        if (Math.abs(scr.clientWidth - this.W) > 1 || this.canvas.width === 0) this.resize();

        const dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;

        const st = this.currentState();
        if (st !== this.state) {
            const prev = this.state;
            this.state = st;
            this.stateTime = now;
            if (st === 'casting') { this.angleV += 4; } // 振りかぶり
            if (st === 'idle' && (prev === 'battle' || prev === 'hit')) this.impulse('snap');
        }
        const pose = this.POSE[this.state] || this.POSE.idle;
        const tIn = (now - this.stateTime) / 1000;

        let targetAngle = pose.angle;
        let targetBend = pose.bend;

        if (this.state === 'casting') {
            // 0〜0.18秒：後ろに振りかぶる → その後振り下ろす
            if (tIn < 0.18) targetAngle = 0.22;
        }
        if (this.state === 'battle') {
            // 魚の左右の動きに竿が引っ張られる
            const tg = this.lineTarget();
            if (tg) {
                const dx = (tg.x - this.W * 0.5) / this.W;
                targetAngle += dx * 0.5;
            }
            targetBend += Math.sin(now / 110) * 0.04 + Math.sin(now / 47) * 0.02;
            this.reelV = 14;
        } else if (this.state === 'success') {
            this.reelV = tIn < 0.6 ? 18 : this.reelV * 0.9;
        } else {
            this.reelV *= 0.9;
        }
        if (this.state === 'waiting' || this.state === 'idle') {
            targetAngle += Math.sin(now / 1400) * 0.012; // 手の揺れ
        }

        const prevAngle = this.angle;
        [this.angle, this.angleV] = this.spring(this.angle, this.angleV, targetAngle,
            this.state === 'casting' && tIn >= 0.18 ? 120 : 40, this.state === 'casting' ? 9 : 11, dt);
        // 根元が速く動くと竿先が遅れてしなる（ムチのような動き）
        const angVel = (this.angle - prevAngle) / Math.max(dt, 0.001);
        [this.bend, this.bendV] = this.spring(this.bend, this.bendV, targetBend - angVel * 0.045, 90, 7, dt);
        this.reel += this.reelV * dt;

        // 糸のたるみ
        this.lineSlack += (pose.slack - this.lineSlack) * Math.min(1, dt * 6);
        this.lineTension = Math.max(0, Math.min(1, -this.bend / 0.35));

        // ぶら下がりウキの振り子
        [this.pendulum, this.pendulumV] = this.spring(this.pendulum, this.pendulumV, -angVel * 0.05, 25, 2.5, dt);

        this.draw(now);
    },

    // ---------- 描画 ----------
    rodPoints() {
        const H = this.H, W = this.W;
        const scale = Math.min(1.2, Math.max(0.7, H / 844));
        const L = H * 0.41;
        const base = { x: W * 0.93, y: H - 40 * scale };
        const pts = [];
        const N = 40;
        let x = base.x, y = base.y;
        for (let i = 0; i <= N; i++) {
            const s = i / N;
            const th = this.angle + this.bend * Math.pow(s, 2.2) * 1.4;
            pts.push({ x, y, th, s });
            x += Math.sin(th) * (L / N);
            y -= Math.cos(th) * (L / N);
        }
        return { pts, scale };
    },

    draw(now) {
        const ctx = this.ctx;
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.clearRect(0, 0, this.W, this.H);
        const m = this.material();
        const { pts, scale } = this.rodPoints();
        const tip = pts[pts.length - 1];
        this.tip = { x: tip.x, y: tip.y };

        this.drawLine(ctx, tip, now, scale);
        this.drawRod(ctx, pts, m, scale, now);
        this.drawReel(ctx, pts, m, scale);
        if (m.pattern === 'legend') this.drawSparkles(ctx, pts, now);
    },

    widthAt(s, scale) {
        return (16 * (1 - s) + 2.4 * s) * scale;
    },

    drawRod(ctx, pts, m, scale, now) {
        // 竿の輪郭（先細りのポリゴン）
        const left = [], right = [];
        for (const p of pts) {
            const w = this.widthAt(p.s, scale) / 2;
            const nx = Math.cos(p.th), ny = Math.sin(p.th);
            left.push({ x: p.x - nx * w, y: p.y - ny * w });
            right.push({ x: p.x + nx * w, y: p.y + ny * w });
        }
        const poly = () => {
            ctx.beginPath();
            ctx.moveTo(left[0].x, left[0].y);
            for (const p of left) ctx.lineTo(p.x, p.y);
            for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
            ctx.closePath();
        };

        // 影
        ctx.save();
        ctx.translate(6 * scale, 8 * scale);
        poly();
        ctx.fillStyle = 'rgba(0,20,40,0.18)';
        ctx.fill();
        ctx.restore();

        // 本体（横方向のグラデーションで円柱感）
        const p0 = pts[0], p1 = pts[pts.length - 1];
        const nx = Math.cos(p0.th), ny = Math.sin(p0.th);
        const w0 = this.widthAt(0, scale);
        const g = ctx.createLinearGradient(p0.x - nx * w0, p0.y - ny * w0, p0.x + nx * w0, p0.y + ny * w0);
        g.addColorStop(0, m.dark);
        g.addColorStop(0.35, m.base);
        g.addColorStop(0.55, m.light);
        g.addColorStop(0.75, m.base);
        g.addColorStop(1, m.dark);
        poly();
        ctx.fillStyle = m.base;
        ctx.fill();
        // 円柱の陰影（中心線に沿ったハイライト）
        ctx.save();
        poly();
        ctx.clip();
        ctx.lineCap = 'round';
        ctx.strokeStyle = m.light;
        ctx.globalAlpha = m.pattern === 'metal' || m.pattern === 'legend' ? 0.85 : 0.45;
        ctx.lineWidth = 2.2 * scale;
        ctx.beginPath();
        pts.forEach((p, i) => {
            const w = this.widthAt(p.s, scale) * 0.2;
            const x = p.x - Math.cos(p.th) * w, y = p.y - Math.sin(p.th) * w;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.stroke();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = m.dark;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        pts.forEach((p, i) => {
            const w = this.widthAt(p.s, scale) * 0.42;
            const x = p.x + Math.cos(p.th) * w, y = p.y + Math.sin(p.th) * w;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;

        // 素材パターン
        this.drawPattern(ctx, pts, m, scale, now);
        ctx.restore();

        // 輪郭線
        poly();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // グリップ
        this.drawGrip(ctx, pts, m, scale);

        // ガイド（糸を通す輪）とスレッド巻き
        const guides = [0.40, 0.53, 0.64, 0.73, 0.81, 0.88, 0.94];
        guides.forEach((gs, i) => {
            const p = pts[Math.round(gs * (pts.length - 1))];
            const w = this.widthAt(gs, scale);
            const nx = Math.cos(p.th), ny = Math.sin(p.th);
            // 巻き糸
            this.band(ctx, p, w, m.wrap, 3.5 * scale);
            // 輪（竿の下側＝右側に付ける）
            const r = (7 - i * 0.7) * scale;
            const gx = p.x - nx * (w / 2 + r * 0.9), gy = p.y - ny * (w / 2 + r * 0.9);
            ctx.strokeStyle = '#cfd8dc';
            ctx.lineWidth = 1.6 * scale;
            ctx.beginPath();
            ctx.moveTo(p.x - nx * w / 2, p.y - ny * w / 2);
            ctx.lineTo(gx + nx * r * 0.6, gy + ny * r * 0.6);
            ctx.stroke();
            ctx.strokeStyle = '#90a4ae';
            ctx.lineWidth = 1.8 * scale;
            ctx.beginPath();
            ctx.ellipse(gx, gy, r * 0.55, r * 0.3, p.th, 0, Math.PI * 2);
            ctx.stroke();
        });

        // 穂先（目立つ色）
        const tipStart = Math.round(0.95 * (pts.length - 1));
        ctx.strokeStyle = m.tip;
        ctx.lineCap = 'round';
        ctx.lineWidth = 2.6 * scale;
        ctx.beginPath();
        for (let i = tipStart; i < pts.length; i++) i === tipStart ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
    },

    band(ctx, p, w, color, thick) {
        const nx = Math.cos(p.th), ny = Math.sin(p.th);
        const tx = Math.sin(p.th), ty = -Math.cos(p.th);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(p.x - nx * w / 2 - tx * thick / 2, p.y - ny * w / 2 - ty * thick / 2);
        ctx.lineTo(p.x + nx * w / 2 - tx * thick / 2, p.y + ny * w / 2 - ty * thick / 2);
        ctx.lineTo(p.x + nx * w / 2 + tx * thick / 2, p.y + ny * w / 2 + ty * thick / 2);
        ctx.lineTo(p.x - nx * w / 2 + tx * thick / 2, p.y - ny * w / 2 + ty * thick / 2);
        ctx.closePath();
        ctx.fill();
    },

    drawPattern(ctx, pts, m, scale, now) {
        const n = pts.length - 1;
        if (m.pattern === 'nodes') {
            // 竹の節
            for (let s = 0.28; s < 0.96; s += 0.11) {
                const p = pts[Math.round(s * n)];
                const w = this.widthAt(s, scale);
                this.band(ctx, p, w * 1.15, m.dark, 2.2 * scale);
                this.band(ctx, { x: p.x + Math.sin(p.th) * 2 * scale, y: p.y - Math.cos(p.th) * 2 * scale, th: p.th }, w * 1.1, m.light, 1.2 * scale);
            }
        } else if (m.pattern === 'grain') {
            // 木目
            ctx.strokeStyle = m.dark;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 0.7;
            for (let k = -2; k <= 2; k++) {
                ctx.beginPath();
                pts.forEach((p, i) => {
                    const w = this.widthAt(p.s, scale) * 0.18 * k + Math.sin(p.s * 40 + k) * 0.6;
                    const x = p.x + Math.cos(p.th) * w, y = p.y + Math.sin(p.th) * w;
                    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
                });
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        } else if (m.pattern === 'weave') {
            // カーボンの織り目（斜線）
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 1;
            for (let i = 4; i < n * 0.95; i += 1) {
                const p = pts[i];
                const w = this.widthAt(p.s, scale) / 2;
                const nx = Math.cos(p.th), ny = Math.sin(p.th);
                ctx.beginPath();
                ctx.moveTo(p.x - nx * w, p.y - ny * w);
                ctx.lineTo(pts[i + 1].x + nx * w, pts[i + 1].y + ny * w);
                ctx.stroke();
            }
        } else if (m.pattern === 'metal' || m.pattern === 'legend') {
            // 金属の光沢が流れる
            const k = ((now / 2200) % 1.4) - 0.2;
            const i0 = Math.max(0, Math.round(k * n)), i1 = Math.min(n, i0 + 5);
            if (i1 > i0) {
                ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                ctx.lineWidth = 4 * scale;
                ctx.lineCap = 'round';
                ctx.beginPath();
                for (let i = i0; i <= i1; i++) i === i0 ? ctx.moveTo(pts[i].x, pts[i].y) : ctx.lineTo(pts[i].x, pts[i].y);
                ctx.stroke();
            }
        }
    },

    drawGrip(ctx, pts, m, scale) {
        const n = pts.length - 1;
        const i1 = Math.round(0.22 * n);
        // グリップ（太めの持ち手）
        const left = [], right = [];
        for (let i = 0; i <= i1; i++) {
            const p = pts[i];
            const w = (this.widthAt(p.s, scale) / 2) + 4 * scale;
            left.push({ x: p.x - Math.cos(p.th) * w, y: p.y - Math.sin(p.th) * w });
            right.push({ x: p.x + Math.cos(p.th) * w, y: p.y + Math.sin(p.th) * w });
        }
        ctx.beginPath();
        ctx.moveTo(left[0].x, left[0].y);
        left.forEach(p => ctx.lineTo(p.x, p.y));
        for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
        ctx.closePath();
        const gripColor = {
            wood: ['#5d4037', '#8d6e63'], cord: ['#6d4c41', '#a1887f'], eva: ['#111', '#3a3a3a'],
            cork: ['#b08850', '#e0c08a'], royal: ['#4a148c', '#9c4dcc']
        }[m.grip] || ['#5d4037', '#8d6e63'];
        const p0 = pts[0];
        const g = ctx.createLinearGradient(left[0].x, left[0].y, right[0].x, right[0].y);
        g.addColorStop(0, gripColor[0]);
        g.addColorStop(0.45, gripColor[1]);
        g.addColorStop(1, gripColor[0]);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // 巻き模様
        for (let i = 1; i < i1; i += m.grip === 'cord' ? 1 : 3) {
            const p = pts[i];
            ctx.strokeStyle = m.grip === 'cork' ? 'rgba(90,60,20,0.35)' : 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(left[i].x, left[i].y);
            ctx.lineTo(right[i].x, right[i].y);
            ctx.stroke();
        }
        // リールシート（金属パーツ）
        const ps = pts[i1];
        this.band(ctx, ps, this.widthAt(ps.s, scale) + 10 * scale, m.reel, 6 * scale);
    },

    drawReel(ctx, pts, m, scale) {
        const n = pts.length - 1;
        const p = pts[Math.round(0.26 * n)];
        const nx = Math.cos(p.th), ny = Math.sin(p.th);
        const tx = Math.sin(p.th), ty = -Math.cos(p.th);
        const R = 20 * scale;
        // 竿の下（右側）にぶら下がるスピニングリール
        const cx = p.x - nx * (R + 10 * scale), cy = p.y - ny * (R + 10 * scale);
        // 脚
        ctx.strokeStyle = this.shade(m.reel.startsWith('#') ? m.reel : '#999999', -0.35);
        ctx.lineWidth = 5 * scale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x - nx * 5 * scale, p.y - ny * 5 * scale);
        ctx.lineTo(cx + nx * R * 0.5, cy + ny * R * 0.5);
        ctx.stroke();
        // ボディ
        const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 2, cx, cy, R * 1.1);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.25, m.reel);
        g.addColorStop(1, this.shade(m.reel.startsWith('#') ? m.reel : '#999999', -0.55));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // スプール（巻かれた糸）
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.arc(cx, cy, R * (0.3 + k * 0.1), 0, Math.PI * 2);
            ctx.stroke();
        }
        // 回転するハンドル
        const a = this.reel;
        const hx = cx + Math.cos(a) * R * 1.25, hy = cy + Math.sin(a) * R * 1.25;
        ctx.strokeStyle = this.shade(m.reel.startsWith('#') ? m.reel : '#999999', -0.4);
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.ellipse(hx, hy, 6 * scale, 4 * scale, a, 0, Math.PI * 2);
        ctx.fill();
        // 中心キャップ
        ctx.fillStyle = m.wrap;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.16, 0, Math.PI * 2);
        ctx.fill();
    },

    drawLine(ctx, tip, now, scale) {
        const target = this.lineTarget();
        ctx.lineCap = 'round';
        const snapAge = this.snapT > 0 ? (now - this.snapT) / 1000 : 9;

        if (!target) {
            // 竿先から糸とウキがぶら下がる
            if (this.state === 'success' || snapAge < 0.6) {
                // 外れた/釣り上げた直後は短い糸がはねる
                const len = 30 * scale;
                const sw = Math.sin(now / 80) * (snapAge < 0.6 ? 12 * (0.6 - snapAge) : 2);
                ctx.strokeStyle = 'rgba(255,255,255,0.75)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(tip.x, tip.y);
                ctx.quadraticCurveTo(tip.x + sw, tip.y + len * 0.5, tip.x + sw * 1.5, tip.y + len);
                ctx.stroke();
                return;
            }
            const len = 70 * scale;
            const sw = this.pendulum;
            const bx = tip.x + Math.sin(sw) * len, by = tip.y + Math.cos(sw) * len;
            ctx.strokeStyle = 'rgba(255,255,255,0.75)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tip.x, tip.y);
            ctx.lineTo(bx, by);
            ctx.stroke();
            this.drawMiniBobber(ctx, bx, by, scale, sw);
            return;
        }

        const tension = this.state === 'battle' || this.state === 'hit' ? 1 : 0;
        const midX = (tip.x + target.x) / 2;
        const midY = (tip.y + target.y) / 2 + this.lineSlack * scale;
        const vib = tension ? Math.sin(now / 18) * 1.5 : 0;
        // 張った糸は少し明るく、太く
        ctx.strokeStyle = tension ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)';
        ctx.lineWidth = tension ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.quadraticCurveTo(midX + vib, midY + vib, target.x, target.y);
        ctx.stroke();
        if (tension) {
            ctx.strokeStyle = 'rgba(180,220,255,0.35)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    },

    drawMiniBobber(ctx, x, y, scale, rot) {
        let color = '#ef4444';
        try { color = GameState.getCurrentSkin().bobberColor || color; } catch (e) { /* ignore */ }
        const r = 7 * scale;
        ctx.save();
        ctx.translate(x, y + r);
        ctx.rotate(-rot);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-1.2 * scale, -r - 7 * scale, 2.4 * scale, 7 * scale);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.4, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawSparkles(ctx, pts, now) {
        if (Math.random() < 0.25) {
            const p = pts[Math.floor(Math.random() * pts.length * 0.9) + 2] || pts[pts.length - 1];
            this.sparkles.push({ x: p.x, y: p.y, life: 1 });
        }
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const s = this.sparkles[i];
            s.life -= 0.03;
            s.y -= 0.4;
            if (s.life <= 0) { this.sparkles.splice(i, 1); continue; }
            const r = 3 * s.life;
            ctx.fillStyle = `rgba(255,245,180,${s.life})`;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y - r * 2);
            ctx.lineTo(s.x + r * 0.5, s.y);
            ctx.lineTo(s.x, s.y + r * 2);
            ctx.lineTo(s.x - r * 0.5, s.y);
            ctx.closePath();
            ctx.fill();
        }
    }
};

if (typeof window !== 'undefined') {
    window.RodRenderer = RodRenderer;
}
