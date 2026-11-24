// ========================================
// RodAnimator - 釣り竿・糸・ウキを1枚のSVGに描く（姉妹作 fish-rogue の RodAnimator を fishing 向けに適合）
// ========================================
// UIManager.updateRodView(state) から setState() で状態名を渡すだけ。
// 各状態は「竿の角度・しなり・糸のたるみ」の目標値を決め、実際の値はバネで追いかける。
// そのため状態が変わっても前の姿勢からなめらかにつながる。
// 釣りの判定・時間には一切関与しない（見た目だけ）。
//
// 糸は常に「竿先」と「ウキ」を結ぶ。ウキはキャスト時に竿先から放たれ、
// 早合わせ・釣り上げ・失敗でidleへ戻るときは竿先まで巻き取られる。
// 水面の波紋・しぶき・魚影・「！」は FxManager（canvas / DOM）が担当する。

const RodAnimator = {
    CONFIG: {
        segments: 16,        // 竿の曲線の分割数
        hangLength: 40,      // 構え中、竿先からウキ先端までの糸の長さ(px)
        bobR: 12,            // ウキ本体の半径
        stickH: 14,          // ウキの棒の長さ
        waterClip: 3,        // 水面からこれ以上沈んだ部分は隠す(px)
        reelTime: 0.55,      // 巻き取りにかかる時間(秒)
        cast: { windup: 0.10, release: 0.17, flight: 0.30 },   // キャストの時間配分(秒)

        // 状態ごとの目標値: angle = 竿の傾き（+が水面側）、bend = しなり、slack = 糸のたるみ、dip = ウキの沈み(px)
        poses: {
            idle:    { angle: -0.04, bend: 0.04, slack: 0.0, dip: 0 },
            windup:  { angle: -0.20, bend: -0.18, slack: 0.0, dip: 0 },
            swing:   { angle: 0.42, bend: 0.22, slack: 0.3, dip: 0 },
            waiting: { angle: 0.22, bend: 0.06, slack: 1.0, dip: 0 },
            nibble:  { angle: 0.22, bend: 0.08, slack: 0.8, dip: 0 },
            hit:     { angle: 0.18, bend: 0.42, slack: 0.0, dip: 36 },
            strike:  { angle: 0.06, bend: 0.42, slack: 0.0, dip: 36 },
            battle:  { angle: 0.15, bend: 0.40, slack: 0.0, dip: 36 },
            early:   { angle: -0.12, bend: 0.30, slack: 0.0, dip: 0 },
            success: { angle: -0.10, bend: 0.20, slack: 0.0, dip: 0 },
            fail:    { angle: 0.18, bend: 0.02, slack: 1.3, dip: 0 }
        },

        // バネ（k = 硬さ、c = 減衰）
        springs: {
            angle: { k: 120, c: 15 },
            bend: { k: 170, c: 11 },
            slack: { k: 60, c: 12 },
            dip: { k: 260, c: 16 },
            sweep: { k: 40, c: 9 },
            bobX: { k: 55, c: 9 },
            bobY: { k: 55, c: 9 }
        },

        // バトル: 力関係ごとのしなりの強さと竿先の震え
        battle: {
            easy: { strength: 0.55, tremble: 0.004 },
            even: { strength: 0.75, tremble: 0.010 },
            hard: { strength: 0.90, tremble: 0.018 },
            reckless: { strength: 1.00, tremble: 0.028 }
        },

        // 竿の形（fishing は1種類）
        shape: { length: 1.0, butt: 14, tip: 3, bendMax: 0.95, guides: 4, reel: 16 },

        // 素材ごとの模様と金具の色（GAME_DATA.RODS の順: 木・竹・カーボン・チタン・伝説）
        materials: [
            { pattern: 'wood', metal: '#ffd54f', reel: '#d4a017' },
            { pattern: 'bamboo', metal: '#ffd54f', reel: '#c08a2e' },
            { pattern: 'gloss', metal: '#e5e7eb', reel: '#374151' },
            { pattern: 'gloss', metal: '#f8fafc', reel: '#9ca3af' },
            { pattern: 'legend', metal: '#ffd700', reel: '#facc15' }
        ],
        feverColor: { sun: '#ffd54f', moon: '#bfdbfe' }
    },

    svg: null,
    els: null,
    running: false,
    rafId: null,
    lastTime: 0,
    time: 0,
    state: 'idle',
    stateTime: 0,
    options: {},
    released: false,
    gauge: 50,
    reducedMotion: false,
    layout: null,
    values: null,
    rod: null,
    // mode: hang(竿先にぶら下がる) / fly(飛行中) / float(水面) / reel(巻き取り中)
    bobber: { mode: 'hang', x: 0, y: 0, flight: null, reel: null },
    water: { x: 0, y: 0 },
    reelAngle: 0,
    reelClick: 0,
    stars: 0,
    material: null,

    // ========================================
    // 初期化
    // ========================================
    init() {
        if (typeof document === 'undefined') return false;
        const svg = document.getElementById('rod-scene');
        if (!svg) return false;
        if (this.svg === svg && this.els) return true;

        this.svg = svg;
        svg.innerHTML = `
            <defs>
                <clipPath id="rs-water-clip" clipPathUnits="userSpaceOnUse"><rect id="rs-clip-rect" x="-2000" y="-2000" width="6000" height="2000"/></clipPath>
            </defs>
            <path id="rs-line" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.4" stroke-linecap="round"/>
            <g id="rs-bobber-clip">
                <g id="rs-bobber">
                    <rect id="rs-bob-stick" x="-1.6" width="3.2" rx="1.5" fill="#f97316"/>
                    <rect id="rs-bob-stick-top" x="-1.6" width="3.2" rx="1.5" fill="#fde047"/>
                    <circle id="rs-bob-body" stroke="#3e2723" stroke-width="1.4" fill="#ef4444"/>
                    <path id="rs-bob-white" fill="#f1f5f9" stroke="#3e2723" stroke-width="1.4"/>
                    <ellipse id="rs-bob-shine" fill="rgba(255,255,255,0.8)" rx="3.4" ry="2.2"/>
                </g>
            </g>
            <g id="rs-rod">
                <circle id="rs-glow" r="14" fill="#ffd700" opacity="0"/>
                <path id="rs-shaft" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>
                <path id="rs-gloss" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5" stroke-linecap="round"/>
                <path id="rs-nodes" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2.5"/>
                <path id="rs-grip" fill="none" stroke="#3e2723" stroke-width="17" stroke-linecap="round"/>
                <path id="rs-wraps" fill="none" stroke="#ffd54f" stroke-width="14"/>
                <g id="rs-guides">${'<circle r="4" fill="none" stroke="#ffd54f" stroke-width="2"/>'.repeat(5)}</g>
                <circle id="rs-reel" r="16" fill="#d4a017" stroke="#5d4037" stroke-width="3"/>
                <line id="rs-reel-arm" stroke="#4e342e" stroke-width="3" stroke-linecap="round"/>
                <circle id="rs-reel-knob" r="4" fill="#4e342e"/>
            </g>
        `;

        const q = id => svg.querySelector(`#${id}`);
        this.els = {
            clipRect: q('rs-clip-rect'), line: q('rs-line'),
            bobberClip: q('rs-bobber-clip'), bobber: q('rs-bobber'),
            bobStick: q('rs-bob-stick'), bobStickTop: q('rs-bob-stick-top'),
            bobBody: q('rs-bob-body'), bobWhite: q('rs-bob-white'), bobShine: q('rs-bob-shine'),
            shaft: q('rs-shaft'), grip: q('rs-grip'), wraps: q('rs-wraps'),
            glow: q('rs-glow'), gloss: q('rs-gloss'), nodes: q('rs-nodes'),
            guides: [...q('rs-guides').children],
            reel: q('rs-reel'), reelArm: q('rs-reel-arm'), reelKnob: q('rs-reel-knob')
        };

        const R = this.CONFIG.bobR;
        const S = this.CONFIG.stickH;
        this.els.bobStick.setAttribute('y', -R - S);
        this.els.bobStick.setAttribute('height', S + 2);
        this.els.bobStickTop.setAttribute('y', -R - S);
        this.els.bobStickTop.setAttribute('height', 5);
        this.els.bobBody.setAttribute('r', R);
        this.els.bobWhite.setAttribute('d', `M${-R},0 A${R},${R} 0 0 0 ${R},0 Z`);
        this.els.bobShine.setAttribute('cx', -R * 0.35);
        this.els.bobShine.setAttribute('cy', -R * 0.45);

        this.values = {};
        Object.keys(this.CONFIG.springs).forEach(name => {
            this.values[name] = { x: 0, v: 0, target: 0 };
        });

        const media = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
        this.reducedMotion = !!(media && media.matches);

        window.addEventListener('resize', () => this.resize());
        this.resize();
        this._applyPose('idle', true);
        this.refreshSkin();
        return true;
    },

    // 釣り画面にいる間だけ描画ループを動かす
    start() {
        if (!this.init()) return;
        this.resize();
        this.refreshSkin();
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        const loop = (now) => {
            if (!this.running) return;
            const dt = Math.min(0.033, Math.max(0.001, (now - this.lastTime) / 1000));
            this.lastTime = now;
            this._update(dt);
            this._draw();
            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    },

    stop() {
        this.running = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
    },

    // 画面サイズから、グリップ・着水点・竿の長さを決める
    resize() {
        if (!this.svg || !this.els) return;
        const rect = this.svg.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (!w || !h) return;

        const hud = document.querySelector('#fishing-screen .bottom-hud-center');
        const hudRect = hud ? hud.getBoundingClientRect() : null;
        const hudTop = hudRect && hudRect.top > 0 ? hudRect.top - rect.top : h * 0.88;

        this.layout = {
            width: w,
            height: h,
            // グリップは下部HUDの少し上（HUDの裏に少し入り、手で持っているように見える）
            grip: { x: w / 2 + Math.min(w * 0.36, 260), y: hudTop + 24 },
            length: Math.max(230, Math.min(460, h * 0.5))
        };
        if (!this.water.x) this.water = this._defaultWater();

        this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        this._applyClip();

        // 構え中にサイズが変わったら、ウキを竿先の下に置き直す
        if (this.bobber.mode === 'hang') {
            this.rod = this._computeRod();
            this.values.bobX.x = this.rod.tip.x;
            this.values.bobY.x = this.rod.tip.y + this.CONFIG.hangLength;
        }
    },

    _applyClip() {
        this.els.clipRect.setAttribute('height', 2000 + this.water.y + this.CONFIG.waterClip);
    },

    // 釣りエリア中央付近 = DOM側のウキ（.water-surface .bobber-body）が出る位置
    _defaultWater() {
        const { width, height } = this.layout;
        const area = document.getElementById('fishing-area');
        const rect = this.svg.getBoundingClientRect();
        if (area) {
            const ar = area.getBoundingClientRect();
            if (ar.width) return { x: ar.left + ar.width / 2 - rect.left, y: ar.top + ar.height / 2 - rect.top + 22 };
        }
        return { x: width / 2, y: height * 0.5 };
    },

    // 画面に出ているウキ（DOM）の位置に着水点を合わせる。DOMのウキは透明にして位置の基準だけに使う
    syncWater() {
        if (!this.layout) return;
        const body = document.querySelector('#fishing-area .bobber-body');
        const rect = this.svg.getBoundingClientRect();
        if (body) {
            const r = body.getBoundingClientRect();
            if (r.width) {
                this.water = { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top };
                this._applyClip();
                return;
            }
        }
        this.water = this._defaultWater();
        this._applyClip();
    },

    // 竿とウキの色・星の数・フィーバー中の糸の色を反映する
    refreshSkin() {
        if (!this.els || typeof GameState === 'undefined') return;
        const skin = GameState.getCurrentSkin ? GameState.getCurrentSkin() : null;
        if (skin) {
            this.els.shaft.setAttribute('fill', skin.rodColor);
            this.els.bobBody.setAttribute('fill', skin.bobberColor);
        }
        this.stars = GameState.rodStars || 0;
        this.material = this.CONFIG.materials[GameState.rodRankIndex] || this.CONFIG.materials[0];
        this.els.guides.forEach(el => el.setAttribute('stroke', this.material.metal));
        this.els.wraps.setAttribute('stroke', this.material.metal);
        this.els.reel.setAttribute('fill', this.material.reel);
        this.els.reel.setAttribute('r', this.CONFIG.shape.reel);

        const fever = GameState.fever;
        const glow = fever && fever.isActive ? this.CONFIG.feverColor[fever.type] : null;
        this.els.line.setAttribute('stroke', glow || 'rgba(255,255,255,0.85)');
        this.els.line.setAttribute('stroke-width', glow ? 2 : 1.4);
    },

    // 現在の竿先（画面座標）。FxManager など外部から参照する
    getTip() {
        if (!this.rod || !this.svg) return null;
        const rect = this.svg.getBoundingClientRect();
        return { x: this.rod.tip.x + rect.left, y: this.rod.tip.y + rect.top };
    },

    // ========================================
    // 状態の切り替え
    //   options.matchup 力関係 'easy' | 'even' | 'hard' | 'reckless'（バトル中のしなり）
    // ========================================
    setState(name, options = {}) {
        if (!this.els && !this.init()) return;
        if (!this.layout) this.resize();
        if (!this.layout) return;
        const previous = this.state;
        this.state = name;
        this.stateTime = 0;
        this.options = { ...this.options, ...options };
        const v = this.values;

        switch (name) {
            case 'idle':
                this._applyPose('idle');
                this.options = {};
                this.refreshSkin();
                // ウキが水面や空中にあれば、竿先まで巻き取って構えに戻る
                if (this.bobber.mode === 'float' || this.bobber.mode === 'fly') this._startReel();
                break;

            case 'casting':
                this._applyPose('windup');
                this.released = false;
                this.refreshSkin();
                if (this.bobber.mode !== 'hang') this._startReel(true);
                this.syncWater();
                break;

            case 'waiting':
                this._applyPose('waiting');
                this.syncWater();
                // キャストを経ずに待ちへ来た場合はウキを水面に置く。飛行中ならそのまま着水させる
                if (this.bobber.mode === 'hang' || this.bobber.mode === 'reel') this._land();
                break;

            case 'nibble':
                this._applyPose('nibble');
                this.syncWater();
                this._ensureFloating();
                break;

            case 'hit':
                this._applyPose('hit');
                this.syncWater();
                this._ensureFloating();
                v.bend.v += 3;
                v.dip.v += 120;
                break;

            case 'strike':
                // 合わせ: 手前にあおる。バネで行き過ぎてから戻る
                this._applyPose('strike');
                v.angle.v -= 3.5;
                v.bend.v += 4;
                this._ensureFloating();
                break;

            case 'battle':
                this._applyPose('battle');
                this._ensureFloating();
                break;

            case 'early':
                // 早合わせ: 竿をあおり、ウキを竿先まで巻き取る
                this._applyPose('early');
                v.angle.v -= 4;
                v.bend.v += 3;
                this._startReel();
                break;

            case 'success':
                this._applyPose('success');
                v.angle.v -= 4;
                this._startReel();
                break;

            case 'fail':
                this._applyPose('fail');
                // 負荷が抜けて竿が後ろへ跳ね返り、ウキだけが浮き上がる
                if (v.bend.x > 0.2) {
                    v.bend.v -= 4;
                    v.angle.v -= 1.5;
                }
                v.dip.v -= 120;
                break;
        }
        void previous;
    },

    // アタリ1回分: ウキが沈んで戻り、竿先がピクッと動く。scale が大きいほど深く沈む
    nibble(scale = 1) {
        if (!this.els || !this.values) return;
        const v = this.values;
        this._ensureFloating();
        v.dip.v += 150 * Math.min(scale, 2.5);
        v.bend.v += 1.2 * scale;
        v.slack.v -= 3;
    },

    // ゲージの針の位置（0〜100）。バトル中の竿のしなりに使う
    setGauge(position) {
        this.gauge = position;
    },

    // ========================================
    // 内部
    // ========================================
    _applyPose(poseName, snap = false) {
        const pose = this.CONFIG.poses[poseName];
        const v = this.values;
        ['angle', 'bend', 'slack', 'dip'].forEach(key => {
            v[key].target = pose[key];
            if (snap) {
                v[key].x = pose[key];
                v[key].v = 0;
            }
        });
        v.sweep.target = 0;
    },

    // ウキを水面に置く
    _land() {
        this.bobber.mode = 'float';
        this.bobber.flight = null;
        this.bobber.reel = null;
        this.values.dip.x = 8;
        this.values.dip.v = 0;
    },

    // 飛行中・構え中・巻き取り中にヒット・バトルへ進んだら、ウキは水面にあるものとして扱う
    _ensureFloating() {
        if (this.bobber.mode !== 'float') this._land();
    },

    // ウキを今の位置から竿先まで巻き取る
    _startReel(fast) {
        const bob = this.bobber;
        if (bob.mode === 'hang') return;
        bob.reel = { age: 0, life: fast ? 0.2 : this.CONFIG.reelTime, from: { x: bob.x, y: bob.y } };
        bob.mode = 'reel';
        bob.flight = null;
    },

    // キャスト: 竿先からウキを放ち、弧を描いて着水点へ飛ばす
    _release() {
        this.released = true;
        const tip = this.rod ? this.rod.tip : this.layout.grip;
        this.bobber.mode = 'fly';
        this.bobber.flight = {
            age: 0,
            life: this.CONFIG.cast.flight,
            from: { x: tip.x, y: tip.y + 4 },
            arc: this.layout.height * 0.13
        };
        this.bobber.x = tip.x;
        this.bobber.y = tip.y + 4;
    },

    // 竿の中心線を計算する。グリップから竿先へ進むにつれて、しなりの分だけ向きが変わる
    _computeRod() {
        const { grip } = this.layout;
        const shape = this.CONFIG.shape;
        const length = this.layout.length * shape.length;
        const n = this.CONFIG.segments;
        const angle = this.values.angle.x;
        const bend = this.values.bend.x * shape.bendMax;
        const step = length / n;
        const points = [{ x: grip.x, y: grip.y, dir: angle }];
        let x = grip.x;
        let y = grip.y;
        for (let i = 1; i <= n; i++) {
            const dir = angle + bend * Math.pow(i / n, 1.6);
            x -= Math.sin(dir) * step;
            y -= Math.cos(dir) * step;
            points.push({ x, y, dir });
        }
        return { points, tip: points[n] };
    },

    // 中心線上の位置 s（0 = グリップ、1 = 竿先）の座標と向き
    _pointAt(s) {
        const points = this.rod.points;
        const f = Math.max(0, Math.min(1, s)) * (points.length - 1);
        const i = Math.min(points.length - 2, Math.floor(f));
        const t = f - i;
        const a = points[i];
        const b = points[i + 1];
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, dir: a.dir + (b.dir - a.dir) * t };
    },

    // ========================================
    // 1フレーム分の更新
    // ========================================
    _update(dt) {
        this.time += dt;
        this.stateTime += dt;
        const v = this.values;
        const cfg = this.CONFIG;
        const water = this.water;
        const width = this.layout.width;
        const calm = this.reducedMotion ? 0 : 1;   // 「視差効果を減らす」設定では揺れを止める

        // --- 状態ごとの目標値の時間変化 ---
        if (this.state === 'casting') {
            if (this.stateTime >= cfg.cast.windup && v.angle.target !== cfg.poses.swing.angle) {
                this._applyPose('swing');
            }
            if (this.stateTime >= cfg.cast.release && !this.released) this._release();
        } else if (this.state === 'waiting') {
            v.bend.target = cfg.poses.waiting.bend + 0.015 * Math.sin(this.time * 1.5) * calm;
        } else if (this.state === 'battle') {
            // 針が中央（赤ゾーン）に近いほど大きくしなる。格上ほど強く、竿先が震える
            const level = cfg.battle[this.options.matchup] || cfg.battle.even;
            const gauge = typeof FishingGame !== 'undefined' && typeof FishingGame.gaugePosition === 'number'
                ? FishingGame.gaugePosition : this.gauge;
            const closeness = 1 - Math.abs(gauge - 50) / 50;
            const tremble = Math.sin(this.time * 47) * level.tremble * 6 * calm;
            v.bend.target = 0.22 + 0.42 * closeness * level.strength + tremble;
            v.angle.target = cfg.poses.battle.angle + 0.05 * closeness * level.strength;
            // 魚が左右に走り、糸の先が水面を動く
            v.sweep.target = (Math.sin(this.time * 2.3) * 0.07 + (gauge - 50) / 50 * 0.05) * width * (0.4 + 0.6 * calm);
            this.reelAngle += dt * (4 + 10 * closeness);
        }

        // --- バネ ---
        Object.keys(cfg.springs).forEach(name => {
            const s = v[name];
            const { k, c } = cfg.springs[name];
            s.v += (-k * (s.x - s.target) - c * s.v) * dt;
            s.x += s.v * dt;
        });
        v.dip.x = Math.max(-10, v.dip.x);
        v.bend.x = Math.max(-0.3, Math.min(1.0, v.bend.x));
        v.slack.x = Math.max(0, v.slack.x);

        this.rod = this._computeRod();
        const tip = this.rod.tip;

        // --- ウキ ---
        const bob = this.bobber;
        if (bob.mode === 'hang') {
            // キャスト準備中は竿先近くまで持ち上げ、ここから放つように見せる
            const hang = this.state === 'casting' ? 8 : cfg.hangLength;
            v.bobX.target = tip.x + Math.sin(this.time * 1.3) * 4 * calm;
            v.bobY.target = tip.y + hang;
            bob.x = v.bobX.x;
            bob.y = v.bobY.x;
        } else if (bob.mode === 'fly') {
            const f = bob.flight;
            f.age += dt;
            const u = Math.min(1, f.age / f.life);
            bob.x = f.from.x + (water.x - f.from.x) * u;
            bob.y = f.from.y + (water.y - f.from.y) * u - f.arc * 4 * u * (1 - u);
            if (u >= 1) this._land();
        } else if (bob.mode === 'reel') {
            // 水面を引かれて竿先へ。加速しながら近づき、少し浮き上がる
            const r = bob.reel;
            r.age += dt;
            const u = Math.min(1, r.age / r.life);
            const e = u * u * (3 - 2 * u);
            const tx = tip.x;
            const ty = tip.y + 10;
            bob.x = r.from.x + (tx - r.from.x) * e;
            bob.y = r.from.y + (ty - r.from.y) * e - Math.sin(u * Math.PI) * 18;
            this.reelAngle += dt * 20;
            v.dip.x += (0 - v.dip.x) * Math.min(1, dt * 12);
            if (u >= 1) bob.mode = 'hang';
        } else {
            bob.x = water.x + v.sweep.x + Math.sin(this.time * 0.7) * 2 * calm;
            bob.y = water.y - 5 + Math.sin(this.time * 2.1) * 2.5 * calm + v.dip.x;
        }
        if (bob.mode !== 'hang') {
            // 構えに戻ったとき、今の位置から竿先の下へなめらかにぶら下がるようにバネの現在値を合わせる
            v.bobX.x = bob.x;
            v.bobY.x = bob.y;
            v.bobX.v = 0;
            v.bobY.v = 0;
        }
    },

    // ========================================
    // 1フレーム分の描画
    // ========================================
    _draw() {
        const els = this.els;
        const v = this.values;
        const water = this.water;
        const n = (value) => value.toFixed(1);
        const shape = this.CONFIG.shape;

        // --- 竿（根元が太く先が細い塗り形状） ---
        const points = this.rod.points;
        const left = [];
        const right = [];
        points.forEach((p, i) => {
            const half = (shape.butt - (shape.butt - shape.tip) * (i / (points.length - 1))) / 2;
            const nx = Math.cos(p.dir);
            const ny = -Math.sin(p.dir);
            left.push(`${n(p.x - nx * half)},${n(p.y - ny * half)}`);
            right.push(`${n(p.x + nx * half)},${n(p.y + ny * half)}`);
        });
        els.shaft.setAttribute('d', `M${left.join('L')}L${right.reverse().join('L')}Z`);

        const g0 = this._pointAt(0);
        const g1 = this._pointAt(0.12);
        const g2 = this._pointAt(0.24);
        els.grip.setAttribute('d', `M${n(g0.x)},${n(g0.y)}L${n(g1.x)},${n(g1.y)}L${n(g2.x)},${n(g2.y)}`);

        // 星の数だけ、グリップの上に巻き糸を描く
        let wraps = '';
        for (let i = 0; i < (this.stars || 0); i++) {
            const a = this._pointAt(0.275 + i * 0.022);
            const b = this._pointAt(0.285 + i * 0.022);
            wraps += `M${n(a.x)},${n(a.y)}L${n(b.x)},${n(b.y)}`;
        }
        els.wraps.setAttribute('d', wraps);

        // ガイド: 竿の中ほどから竿先まで等間隔に並べる
        els.guides.forEach((el, i) => {
            if (i >= shape.guides) {
                el.setAttribute('opacity', 0);
                return;
            }
            const s = 0.48 + (0.95 - 0.48) * (shape.guides === 1 ? 1 : i / (shape.guides - 1));
            const p = this._pointAt(s);
            el.setAttribute('opacity', 1);
            el.setAttribute('cx', n(p.x - Math.cos(p.dir) * 7));
            el.setAttribute('cy', n(p.y + Math.sin(p.dir) * 7));
        });

        // 素材の模様: 竹の節、カーボン・チタン・伝説の光沢
        const pattern = this.material ? this.material.pattern : 'wood';
        let nodes = '';
        if (pattern === 'bamboo') {
            [0.36, 0.48, 0.6, 0.71, 0.81, 0.9].forEach(s => {
                const p = this._pointAt(s);
                const w = (shape.butt - (shape.butt - shape.tip) * s) / 2 + 1;
                const nx = Math.cos(p.dir) * w;
                const ny = -Math.sin(p.dir) * w;
                nodes += `M${n(p.x - nx)},${n(p.y - ny)}L${n(p.x + nx)},${n(p.y + ny)}`;
            });
        }
        els.nodes.setAttribute('d', nodes);
        let gloss = '';
        if (pattern === 'gloss' || pattern === 'legend') {
            for (let s = 0.3; s <= 0.92; s += 0.04) {
                const p = this._pointAt(s);
                const w = (shape.butt - (shape.butt - shape.tip) * s) / 4;
                gloss += `${gloss ? 'L' : 'M'}${n(p.x - Math.cos(p.dir) * w)},${n(p.y + Math.sin(p.dir) * w)}`;
            }
        }
        els.gloss.setAttribute('d', gloss);

        // 伝説の竿: 竿先がゆっくり明滅する
        const tip = this.rod.tip;
        els.glow.setAttribute('cx', n(tip.x));
        els.glow.setAttribute('cy', n(tip.y));
        els.glow.setAttribute('opacity', pattern === 'legend'
            ? (0.25 + 0.2 * Math.sin(this.time * 2.4) * (this.reducedMotion ? 0 : 1)).toFixed(2) : 0);

        // リール
        const reelAt = this._pointAt(0.17);
        const reelX = reelAt.x - Math.cos(reelAt.dir) * (shape.reel + 2);
        const reelY = reelAt.y + Math.sin(reelAt.dir) * (shape.reel + 2);
        els.reel.setAttribute('cx', n(reelX));
        els.reel.setAttribute('cy', n(reelY));
        const knobX = reelX + Math.cos(this.reelAngle) * (shape.reel - 1);
        const knobY = reelY + Math.sin(this.reelAngle) * (shape.reel - 1);
        els.reelArm.setAttribute('x1', n(reelX));
        els.reelArm.setAttribute('y1', n(reelY));
        els.reelArm.setAttribute('x2', n(knobX));
        els.reelArm.setAttribute('y2', n(knobY));
        els.reelKnob.setAttribute('cx', n(knobX));
        els.reelKnob.setAttribute('cy', n(knobY));

        // --- ウキ（水面より下は隠す） ---
        const bob = this.bobber;
        const inWater = bob.mode === 'float';
        // 切り抜きは外側のグループに掛ける（内側は移動するので、掛けると切り抜きごと動いてしまう）
        els.bobberClip.setAttribute('clip-path', inWater ? 'url(#rs-water-clip)' : 'none');
        els.bobber.setAttribute('transform', `translate(${n(bob.x)},${n(bob.y)})`);

        // --- 糸（常に竿先からウキの先端まで。たるみの分だけ下に垂れる） ---
        const top = this.CONFIG.bobR + this.CONFIG.stickH;
        const endX = bob.x;
        const endY = inWater ? Math.min(bob.y - top, water.y + this.CONFIG.waterClip) : bob.y - top;
        const dist = Math.hypot(endX - tip.x, endY - tip.y);
        const sway = this.reducedMotion ? 0 : Math.sin(this.time * 1.1) * 4 * v.slack.x;
        const slack = bob.mode === 'float' || bob.mode === 'hang' ? v.slack.x : 0;
        const sag = slack * dist * 0.28;
        els.line.setAttribute('d',
            `M${n(tip.x)},${n(tip.y)}Q${n((tip.x + endX) / 2 + sway)},${n((tip.y + endY) / 2 + sag)} ${n(endX)},${n(endY)}`);
    }
};

if (typeof window !== 'undefined') {
    window.RodAnimator = RodAnimator;
}
