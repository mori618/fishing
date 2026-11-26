// ========================================
// FishArt - 魚のイラストをSVGで自動生成
// ========================================
// 魚ごとのID から「体形・尾びれ・模様・色」を決定的に作るので、
// 同じ魚はいつも同じ見た目になる。画像ファイルは不要。
const FishArt = {
    // レア度ごとの基本色相と彩度
    RARITY_PALETTE: {
        D:   { hue: 200, sat: 18, light: 58, accent: '#cbd5e1' },
        C:   { hue: 140, sat: 45, light: 48, accent: '#86efac' },
        B:   { hue: 210, sat: 70, light: 52, accent: '#93c5fd' },
        A:   { hue: 275, sat: 60, light: 55, accent: '#d8b4fe' },
        S:   { hue: 42,  sat: 90, light: 52, accent: '#fde68a' },
        SS:  { hue: 350, sat: 80, light: 52, accent: '#fecaca' },
        GOD: { hue: 50,  sat: 100, light: 60, accent: '#ffffff' }
    },

    _uid: 0,

    hash(str) {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    },

    rng(seed) {
        let s = seed || 1;
        return () => {
            s ^= s << 13; s >>>= 0;
            s ^= s >>> 17;
            s ^= s << 5; s >>>= 0;
            return (s % 10000) / 10000;
        };
    },

    // 魚かどうか（宝箱・アイテムは除外）
    isFish(fish) {
        return !!fish && typeof fish.id === 'string' && fish.id.indexOf('fish_') === 0;
    },


    // 名前から体の形の種類を決める
    kind(fish) {
        const n = (fish && fish.name) || '';
        if (/イカ|クラーケン|タコ/.test(n)) return 'squid';
        if (/エビ|ザリガニ|カニ/.test(n)) return 'crustacean';
        if (/ウナギ|ドジョウ|リュウグウノツカイ|海龍|リヴァイアサン/.test(n)) return 'eel';
        if (/エイ/.test(n)) return 'ray';
        if (/オタマジャクシ/.test(n)) return 'tadpole';
        if (/カジキ/.test(n)) return 'marlin';
        return 'fish';
    },

    // 魚以外の体形（色 c: {top, mid, belly, fin, grad}）
    specialShape(kind, c, r, sil) {
        const eye = (x, y, s = 1) => sil ? '' :
            `<circle cx="${x}" cy="${y}" r="${3.2 * s}" fill="#fff"/><circle cx="${x - 0.5}" cy="${y}" r="${1.9 * s}" fill="#111"/><circle cx="${x - 1}" cy="${y - 0.8}" r="${0.6 * s}" fill="#fff"/>`;
        const st = sil ? '' : 'stroke="rgba(0,0,0,0.35)" stroke-width="0.8" stroke-linejoin="round"';
        if (kind === 'squid') {
            let t = '';
            for (let i = 0; i < 8; i++) {
                const y = 26 + i * 2.6, len = 30 + (i % 3) * 8 + (i === 2 || i === 5 ? 14 : 0);
                t += `<path d="M 44 ${y} Q ${44 - len * 0.5} ${y + (i - 3.5) * 3} ${44 - len} ${y + (i - 3.5) * 4 + Math.sin(i) * 4}" stroke="${c.fin}" stroke-width="${i === 2 || i === 5 ? 2 : 3}" fill="none" stroke-linecap="round"/>`;
            }
            return `${t}<g ${st}><path d="M 112 35 L 98 22 L 96 48 Z" fill="${c.fin}"/>
                <path d="M 42 26 Q 70 18 104 35 Q 70 52 42 44 Q 38 35 42 26 Z" fill="${c.grad}"/></g>${eye(48, 33, 1.1)}`;
        }
        if (kind === 'crustacean') {
            let seg = '';
            for (let i = 0; i < 5; i++) seg += sil ? '' : `<path d="M ${40 + i * 11} 22 Q ${44 + i * 11} 35 ${40 + i * 11} 48" stroke="${c.top}" stroke-width="1.4" fill="none" opacity="0.6"/>`;
            return `<g ${st}>
                <path d="M 30 32 L 6 18 M 30 36 L 4 30" stroke="${c.fin}" stroke-width="1.2" fill="none"/>
                <path d="M 34 40 Q 22 52 14 50 Q 10 44 18 42 Q 24 44 30 38 Z" fill="${c.fin}"/>
                <path d="M 96 34 L 114 24 L 110 36 L 114 46 Z" fill="${c.fin}"/>
                <path d="M 28 35 Q 34 20 62 20 Q 92 22 98 34 Q 92 48 62 50 Q 34 50 28 35 Z" fill="${c.grad}"/>
                <path d="M 50 50 L 46 58 M 60 50 L 58 58 M 70 50 L 70 58 M 80 48 L 82 56" stroke="${c.fin}" stroke-width="1.5"/>
                </g>${seg}${eye(34, 30, 0.9)}`;
        }
        if (kind === 'eel') {
            return `<g ${st}>
                <path d="M 18 34 C 34 20, 50 48, 70 34 S 100 22, 114 36 C 100 30, 86 44, 70 42 S 36 50, 18 40 Z" fill="${c.grad}"/>
                <path d="M 30 30 C 46 22, 56 40, 70 32 S 98 22, 112 34" stroke="${c.fin}" stroke-width="3" fill="none" opacity="0.8"/>
                <path d="M 10 37 Q 14 30 22 32 L 22 40 Q 14 42 10 37 Z" fill="${c.mid}"/></g>${eye(17, 35, 0.8)}`;
        }
        if (kind === 'ray') {
            return `<g ${st}>
                <path d="M 70 36 Q 96 34 116 30" stroke="${c.top}" stroke-width="2" fill="none"/>
                <path d="M 14 36 Q 30 12 52 8 Q 62 22 76 36 Q 62 50 52 64 Q 30 60 14 36 Z" fill="${c.grad}"/></g>
                ${eye(26, 32, 0.8)}`;
        }
        if (kind === 'tadpole') {
            return `<g ${st}>
                <path d="M 52 35 Q 70 26 86 34 Q 100 40 112 30 Q 102 44 86 40 Q 70 44 52 38 Z" fill="${c.fin}"/>
                <ellipse cx="40" cy="36" rx="20" ry="15" fill="${c.grad}"/></g>${eye(30, 31, 1)}`;
        }
        return null;
    },

    svg(fish, opts = {}) {
        const id = (fish && fish.id) || 'fish';
        const r = this.rng(this.hash(id));
        const pal = this.RARITY_PALETTE[fish.rarity] || this.RARITY_PALETTE.D;
        const uid = 'fa' + (++this._uid);

        // 体形パラメータ
        const hue = (pal.hue + Math.floor((r() - 0.5) * 40) + 360) % 360;
        const bodyH = 14 + r() * 14;          // 体高（半分）
        const noseX = 10 + r() * 6;
        const tailX = 86 + r() * 4;
        const bellyBias = 0.9 + r() * 0.4;     // 腹のふくらみ
        const tailType = Math.floor(r() * 3);   // 0:二股 1:丸 2:三日月
        const finH = 6 + r() * 12;
        const pattern = Math.floor(r() * 4);    // 0:無地 1:縦じま 2:斑点 3:横ライン
        const cy = 35;

        const top = `hsl(${hue}, ${pal.sat}%, ${Math.max(18, pal.light - 22)}%)`;
        const mid = `hsl(${hue}, ${pal.sat}%, ${pal.light}%)`;
        const belly = `hsl(${hue}, ${Math.max(10, pal.sat - 30)}%, ${Math.min(92, pal.light + 32)}%)`;
        const fin = `hsl(${(hue + 15) % 360}, ${pal.sat}%, ${Math.max(20, pal.light - 10)}%)`;

        const kind = this.kind(fish);
        const silC = opts.silhouette;
        const cls0 = opts.className || 'fish-art';
        const defs = `<defs>
                <linearGradient id="${uid}b" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="${top}"/>
                    <stop offset="0.5" stop-color="${mid}"/>
                    <stop offset="1" stop-color="${belly}"/>
                </linearGradient>
                <linearGradient id="${uid}s" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
                    <stop offset="0.45" stop-color="#fff" stop-opacity="0.9"/>
                    <stop offset="0.55" stop-color="#fff" stop-opacity="0"/>
                </linearGradient>
            </defs>`;
        if (kind !== 'fish' && kind !== 'marlin') {
            const c = silC ? { top: silC, mid: silC, belly: silC, fin: silC, grad: silC }
                           : { top, mid, belly, fin, grad: `url(#${uid}b)` };
            const inner = this.specialShape(kind, c, r, !!silC);
            return `<svg class="${cls0}" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg" ${silC ? 'aria-hidden="true"' : `role="img" aria-label="${fish.name || ''}"`}>${silC ? '' : defs}${inner}</svg>`;
        }
        const bill = kind === 'marlin';

        const x0 = noseX, x1 = tailX - 6;
        const body = `M ${x0} ${cy}
            C ${x0 + 10} ${cy - bodyH}, ${x1 - 25} ${cy - bodyH * 1.05}, ${x1} ${cy - 4}
            L ${x1} ${cy + 4}
            C ${x1 - 25} ${cy + bodyH * bellyBias}, ${x0 + 10} ${cy + bodyH * bellyBias}, ${x0} ${cy} Z`;

        const billPath = bill ? `M ${x0 + 2} ${cy - 3} L ${x0 - 12} ${cy - 1} L ${x0 + 2} ${cy + 1} Z` : '';
        let tail;
        const tx = tailX + 14, th = 10 + bodyH * 0.6;
        if (tailType === 0) {
            tail = `M ${x1 - 2} ${cy} L ${tx} ${cy - th} Q ${tx - 8} ${cy} ${tx} ${cy + th} Z`;
        } else if (tailType === 1) {
            tail = `M ${x1 - 2} ${cy} C ${tx} ${cy - th}, ${tx + 6} ${cy + th}, ${x1 - 2} ${cy} Z`;
        } else {
            tail = `M ${x1 - 2} ${cy} Q ${tx - 4} ${cy - th * 1.2} ${tx + 2} ${cy - th} Q ${tx - 10} ${cy} ${tx + 2} ${cy + th} Q ${tx - 4} ${cy + th * 1.2} ${x1 - 2} ${cy} Z`;
        }

        const dx = x0 + 28 + r() * 10;
        const dorsal = `M ${dx} ${cy - bodyH * 0.92} Q ${dx + 10} ${cy - bodyH - finH} ${dx + 26} ${cy - bodyH * 0.75} Z`;
        const ventral = `M ${dx + 4} ${cy + bodyH * bellyBias * 0.85} Q ${dx + 10} ${cy + bodyH * bellyBias + finH * 0.5} ${dx + 18} ${cy + bodyH * bellyBias * 0.7} Z`;
        const pectoral = `M ${x0 + 18} ${cy + 3} Q ${x0 + 26} ${cy + 8} ${x0 + 30} ${cy + 2} Z`;

        let patternSvg = '';
        if (pattern === 1) {
            for (let i = 0; i < 4; i++) {
                const px = x0 + 22 + i * 13;
                patternSvg += `<path d="M ${px} ${cy - bodyH} Q ${px - 3} ${cy} ${px} ${cy + bodyH}" stroke="${top}" stroke-width="3.5" opacity="0.45" fill="none"/>`;
            }
        } else if (pattern === 2) {
            for (let i = 0; i < 9; i++) {
                const px = x0 + 18 + r() * 52, py = cy - bodyH * 0.7 + r() * bodyH * 0.9;
                patternSvg += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(1 + r() * 2).toFixed(1)}" fill="${top}" opacity="0.5"/>`;
            }
        } else if (pattern === 3) {
            patternSvg = `<path d="M ${x0 + 10} ${cy - 1} Q ${x0 + 40} ${cy - 5} ${x1} ${cy - 1}" stroke="${pal.accent}" stroke-width="2.2" opacity="0.75" fill="none"/>`;
        }

        const isShiny = ['S', 'SS', 'GOD'].includes(fish.rarity) || fish.hasTitle;
        const shine = isShiny ? `
            <path d="${body}" fill="url(#${uid}s)" opacity="0.55" style="mix-blend-mode:screen"/>` : '';

        const silhouette = opts.silhouette;
        const cls = opts.className || 'fish-art';

        if (silhouette) {
            return `<svg class="${cls}" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g fill="${silhouette}">${billPath ? `<path d="${billPath}"/>` : ''}<path d="${tail}"/><path d="${dorsal}"/><path d="${ventral}"/><path d="${body}"/></g></svg>`;
        }

        return `<svg class="${cls}" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${fish.name || ''}">
            <defs>
                <linearGradient id="${uid}b" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="${top}"/>
                    <stop offset="0.5" stop-color="${mid}"/>
                    <stop offset="1" stop-color="${belly}"/>
                </linearGradient>
                <linearGradient id="${uid}s" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#fff" stop-opacity="0"/>
                    <stop offset="0.45" stop-color="#fff" stop-opacity="0.9"/>
                    <stop offset="0.55" stop-color="#fff" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <g stroke="rgba(0,0,0,0.35)" stroke-width="0.8" stroke-linejoin="round">
                ${billPath ? `<path d="${billPath}" fill="${top}"/>` : ''}
                <path d="${tail}" fill="${fin}"/>
                <path d="${dorsal}" fill="${fin}"/>
                <path d="${ventral}" fill="${fin}"/>
                <path d="${body}" fill="url(#${uid}b)"/>
            </g>
            <clipPath id="${uid}c"><path d="${body}"/></clipPath>
            <g clip-path="url(#${uid}c)">${patternSvg}${shine}</g>
            <path d="M ${x0 + 14} ${cy - bodyH * 0.55} Q ${x0 + 17} ${cy} ${x0 + 14} ${cy + bodyH * 0.55}" stroke="rgba(0,0,0,0.25)" stroke-width="1.2" fill="none"/>
            <path d="${pectoral}" fill="${fin}" opacity="0.85"/>
            <circle cx="${x0 + 8}" cy="${cy - 3}" r="3.4" fill="#fff"/>
            <circle cx="${x0 + 7.4}" cy="${cy - 3}" r="2" fill="#111"/>
            <circle cx="${x0 + 6.8}" cy="${cy - 3.8}" r="0.7" fill="#fff"/>
        </svg>`;
    },

    // 魚以外の「釣れるもの」かどうか
    isCatchItem(fish) {
        return !!fish && typeof fish.id === 'string' && fish.id.indexOf('catch_') === 0;
    },

    // 釣れるものの仮画像（画像がまだ無いとき）: 系統の色の丸＋系統の絵文字
    placeholderSvg(item, opts = {}) {
        const cats = (typeof GAME_DATA !== 'undefined' && GAME_DATA.CATCH_CATEGORIES) || {};
        const cat = cats[item.category] || { emoji: '❔', hue: 200 };
        const pal = this.RARITY_PALETTE[item.rarity] || this.RARITY_PALETTE.D;
        const uid = 'cp' + (++this._uid);
        const cls = opts.className || 'fish-art catch-placeholder';
        return `<svg class="${cls}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${item.name}">
            <defs><radialGradient id="${uid}" cx="0.35" cy="0.3" r="0.8">
                <stop offset="0" stop-color="hsl(${cat.hue},70%,78%)"/>
                <stop offset="1" stop-color="hsl(${cat.hue},55%,42%)"/>
            </radialGradient></defs>
            <circle cx="50" cy="50" r="44" fill="url(#${uid})" stroke="${pal.accent}" stroke-width="4"/>
            <text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-size="46">${cat.emoji}</text>
        </svg>`;
    },

    // 釣果カード・図鑑の絵（画像 → 魚SVG → 仮画像 の順）
    artHtml(fish, opts = {}) {
        if (fish && fish.image) {
            const cls = opts.imgClass || 'fish-illustration';
            return `<img src="${fish.image}" alt="${fish.name}" class="${cls}" data-fish-id="${fish.id}" onerror="FishArt.replaceBrokenImage(this)">`;
        }
        if (this.isCatchItem(fish)) return this.placeholderSvg(fish, opts);
        return this.svg(fish, opts);
    },

    // 図鑑など: 画像があれば画像、読み込めなければSVGに差し替え
    iconHtml(fish) {
        if (!this.isFish(fish) && !this.isCatchItem(fish)) {
            return `<span class="material-icons">${(fish && fish.icon) || 'set_meal'}</span>`;
        }
        return this.artHtml(fish);
    },

    replaceBrokenImage(img) {
        const id = img.getAttribute('data-fish-id');
        const fish = (typeof GAME_DATA !== 'undefined' && GAME_DATA.FISH || []).find(f => f.id === id);
        if (!fish) return;
        const wrap = document.createElement('span');
        wrap.innerHTML = this.isCatchItem(fish) ? this.placeholderSvg(fish) : this.svg(fish);
        img.replaceWith(wrap.firstElementChild);
    }
};

if (typeof window !== 'undefined') {
    window.FishArt = FishArt;
}
