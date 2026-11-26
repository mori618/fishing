// ========================================
// 釣れるもの（魚以外も含む）データ生成スクリプト
//   入力: tools/catch_items/list.csv   … シート「釣れるもの 追加一覧」の内容
//   出力: data/catchItems.js            … ゲームが読むデータ（自動生成・手で編集しない）
//         tools/catch_items/gpt_prompts.md … ChatGPTで作る分の画像プロンプト
// 使い方: node tools/catch_items/build.js
// ========================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const CSV = path.join(__dirname, 'list.csv');
const OUT_JS = path.join(ROOT, 'data', 'catchItems.js');
const OUT_PROMPTS = path.join(__dirname, 'gpt_prompts.md');

// 既存の魚と同じものは新規に足さず、画像だけ既存の魚に使う
const MERGE_INTO_EXISTING = {
    'c12_04': 'fish_b1', // タイ
    'c12_05': 'fish_a1'  // マグロ
};

// 系統ごとの見た目・文言
const CATEGORIES = {
    '植物':          { key: 'plant',   emoji: '🌿', hue: 120, titles: ['満開の', '朝露をまとう', '根性のある', '千年咲く'], desc: ['水草に絡まって釣れた{n}。なぜか水の中でも元気だ。', '川底に根を張っていた{n}。引きは意外と強い。'] },
    '野菜・果物':    { key: 'veggie',  emoji: '🥕', hue: 30,  titles: ['畑の王様の', '採れたての', '甘さ極まる', '品評会一位の'], desc: ['どこかの畑から流れてきた{n}。よく冷えている。', '水に浮かんでいた{n}。洗う手間がはぶけた。'] },
    '機械':          { key: 'machine', emoji: '⚙️', hue: 210, titles: ['油の切れた', '最新型の', '暴走する', '永久機関の'], desc: ['水中でもなぜか動いている{n}。防水仕様らしい。', '沈んでいた{n}。少しサビているがまだ使えそうだ。'] },
    '道具・日用品':  { key: 'tool',    emoji: '🧰', hue: 35,  titles: ['使い込まれた', '名工の', '家宝の', '神器級の'], desc: ['誰かが落とした{n}。持ち主はきっと困っている。', '川の流れで運ばれてきた{n}。まだ使えそうだ。'] },
    'ガラクタ':      { key: 'junk',    emoji: '🗑️', hue: 25,  titles: ['ぬれた', '年代物の', '呪われていそうな', '伝説の'], desc: ['釣り人の宿命、{n}。売ればちょっとはお金になる。', '海の底から引き上げた{n}。物語がありそうだ。'] },
    'お宝':          { key: 'treasure',emoji: '💎', hue: 48,  titles: ['ピカピカの', '王家に伝わる', '国宝級の', '世界に一つの'], desc: ['水底でキラリと光っていた{n}。大当たりだ！', '沈没船からこぼれ落ちた{n}。高く売れそうだ。'] },
    '魔法':          { key: 'magic',   emoji: '🔮', hue: 280, titles: ['魔力あふれる', '封印された', '大魔導の', '禁断の'], desc: ['不思議な力を感じる{n}。水の中でも輝きを失わない。', '魔法の泉から湧き出た{n}。触るとピリピリする。'] },
    '武器・防具':    { key: 'weapon',  emoji: '⚔️', hue: 0,   titles: ['歴戦の', '刃こぼれした', '名匠の', '勇者の'], desc: ['湖に沈められていた{n}。女神は出てこなかった。', '古戦場の川から釣れた{n}。まだ鋭さが残っている。'] },
    '人':            { key: 'people',  emoji: '🧑', hue: 15,  titles: ['ずぶぬれの', 'ベテランの', 'うわさの', '伝説の'], desc: ['なぜか水の中にいた{n}。釣り上げたらお礼を言われた。', '泳いでいた{n}。ついでにエサも食べていった。'] },
    '動物':          { key: 'animal',  emoji: '🐄', hue: 90,  titles: ['泳ぎ上手な', 'ぬれた毛皮の', '森のボスの', '神獣の'], desc: ['川を渡っていた{n}。うっかり針にかかったらしい。', '水浴び中の{n}。ちょっと不機嫌そうだ。'] },
    '鳥':            { key: 'bird',    emoji: '🐦', hue: 190, titles: ['空を忘れた', '潜水が得意な', '大空の', '不死の'], desc: ['エサをねらって飛び込んできた{n}。逆に釣られた。', '水面すれすれを飛んでいた{n}。見事に一本釣り。'] },
    '虫':            { key: 'insect',  emoji: '🦋', hue: 75,  titles: ['水面を舞う', '虹色の羽の', '森の妖精の', '幻の'], desc: ['水面にとまっていた{n}。そっと逃がしてあげよう。', 'ウキに止まっていた{n}。いっしょに釣れてしまった。'] },
    '海の生き物':    { key: 'sea',     emoji: '🐟', hue: 200, titles: ['大海原の', '群れのリーダーの', '潮を読む', '海神の'], desc: ['海から迷い込んできた{n}。しっかりした手ごたえだ。', '大物の気配がした{n}。ここまで来るとは珍しい。'] },
    '合体魚':        { key: 'fusion',  emoji: '🐠', hue: 330, titles: ['突然変異の', '進化しすぎた', '研究所生まれの', '神が作った'], desc: ['魚と何かがまざった不思議な{n}。図鑑にも載っていない。', '{n}。どうしてこうなったのかは誰も知らない。'] },
    '食べ物':        { key: 'food',    emoji: '🍙', hue: 40,  titles: ['できたての', '行列ができる', '三ツ星の', '幻の'], desc: ['湯気を立てたまま釣れた{n}。なぜか冷めていない。', '水の中から現れた{n}。誰が落としたんだろう。'] },
    'スイーツ':      { key: 'sweets',  emoji: '🍰', hue: 340, titles: ['ふわふわの', 'とろける', 'パティシエ渾身の', '夢の'], desc: ['甘い香りがする{n}。魚たちも群がっていた。', 'ぷかぷか浮かんでいた{n}。不思議と濡れていない。'] },
    '乗り物':        { key: 'vehicle', emoji: '🚗', hue: 220, titles: ['水陸両用の', 'ピカピカの', '限定モデルの', '伝説の'], desc: ['水の中を走っていた{n}。よく釣り上げられたものだ。', '沈んでいた{n}。エンジンはまだかかりそうだ。'] },
    '楽器・おもちゃ':{ key: 'toy',     emoji: '🎸', hue: 300, titles: ['音のはずれた', 'みんなの人気者の', '名器と呼ばれる', '奇跡の'], desc: ['水の中から音が聞こえて釣れた{n}。', '子どもが落とした{n}。ちゃんと届けてあげよう。'] },
    'お化け・妖怪':  { key: 'yokai',   emoji: '👻', hue: 260, titles: ['うらめしい', '百年生きた', '大妖怪の', '夜の王の'], desc: ['夜の水辺にただよっていた{n}。ひんやりする。', '釣り上げたら目が合った{n}。そっと放そう。'] },
    '宇宙':          { key: 'space',   emoji: '🪐', hue: 245, titles: ['流れ着いた', '星くずをまとう', '銀河の', '創世の'], desc: ['空から落ちてきて水に沈んだ{n}。まだ少し温かい。', '宇宙の彼方から来た{n}。どうやって水の中に？'] },
    '恐竜・古代':    { key: 'ancient', emoji: '🦖', hue: 100, titles: ['太古の', '化石から目覚めた', 'ジュラ紀の', '原初の'], desc: ['大昔の地層ごと釣れた{n}。歴史的な発見だ。', '湖の底で眠っていた{n}。今もなお生きている。'] },
    '天気・自然':    { key: 'nature',  emoji: '🌈', hue: 170, titles: ['雨上がりの', '季節はずれの', '大自然の', '世界の果ての'], desc: ['空の気まぐれで釣れた{n}。手に取ると不思議な感じだ。', '自然のかけら、{n}。めったにお目にかかれない。'] }
};

// ランク分け: 番号の下2桁（00〜19。若いほどよく釣れる）で決める
function rarityOf(idx) {
    if (idx <= 5) return 'D';
    if (idx <= 9) return 'C';
    if (idx <= 13) return 'B';
    if (idx <= 17) return 'A';
    return 'S';
}
const BAND = { D: [0, 5], C: [6, 9], B: [10, 13], A: [14, 17], S: [18, 19] };
// ランクごとの パワー / 売値 の幅（既存の魚に合わせた）
const STATS = {
    D: { power: [4, 12],   price: [5, 45] },
    C: { power: [12, 28],  price: [40, 150] },
    B: { power: [28, 55],  price: [180, 450] },
    A: { power: [60, 110], price: [700, 2000] },
    S: { power: [120, 200],price: [4000, 30000] }
};

function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
const lerp = (a, b, t) => a + (b - a) * t;
function roundNice(v) {
    if (v < 100) return Math.round(v / 5) * 5 || 5;
    if (v < 1000) return Math.round(v / 10) * 10;
    return Math.round(v / 100) * 100;
}
function frequencyOf(w) {
    if (w >= 18) return 'たくさん釣れる';
    if (w >= 13) return 'そこそこ釣れる';
    if (w >= 9) return 'あまり釣れない';
    return 'なかなか釣れない';
}
const isGpt = s => s.indexOf('ChatGPT') >= 0;

// ---- CSV 読み込み ----
const lines = fs.readFileSync(CSV, 'utf8').split(/\r?\n/).filter(l => l.trim());
lines.shift(); // 見出し
const rows = lines.map(l => {
    const [category, name, status, num] = l.split(',');
    return { category, name, status, num };
});

// 同じ番号が複数ある行（巨大ロボのパーツ、金の斧など）は b, c, d... を付けて別IDにする
const numCount = {};
const items = [];
const prompts = [];
const merged = [];
rows.forEach(r => {
    const cat = CATEGORIES[r.category];
    if (!cat) throw new Error('未知の系統: ' + r.category);
    if (r.status === '不採用') return;
    numCount[r.num] = (numCount[r.num] || 0) + 1;
    const suffix = numCount[r.num] === 1 ? '' : String.fromCharCode(96 + numCount[r.num]); // 2→b
    const imageId = r.num + suffix;

    if (MERGE_INTO_EXISTING[imageId]) {
        merged.push({ imageId, fishId: MERGE_INTO_EXISTING[imageId], name: r.name });
        return;
    }

    const idx = parseInt(r.num.split('_')[1], 10);
    const rarity = rarityOf(idx);
    const [lo, hi] = BAND[rarity];
    const t = hi === lo ? 0.5 : (idx - lo) / (hi - lo);
    const h = hash(imageId);
    const weight = Math.round(lerp(20, 6, t));
    const st = STATS[rarity];
    const title = cat.titles[h % cat.titles.length];
    

    // 「巨大ロボ_体」→「巨大ロボの体」、「巨大ロボ_合体」→「合体巨大ロボ」
    const dispName = r.name.indexOf('_') < 0 ? r.name
        : (r.name.endsWith('_合体') ? '合体' + r.name.split('_')[0] : r.name.replace('_', 'の'));
    items.push({
        id: 'catch_' + imageId,
        name: dispName,
        category: r.category,
        categoryKey: cat.key,
        power: Math.round(lerp(st.power[0], st.power[1], t)),
        price: roundNice(lerp(st.price[0], st.price[1], t)),
        rarity,
        weight,
        frequency: frequencyOf(weight),
        specialTitle: title,
        imageId,
        imageSource: isGpt(r.status) ? 'chatgpt' : 'comfyui',
        description: cat.desc[(h >>> 3) % cat.desc.length].replace('{n}', dispName),
        titleDescription: `${title}${dispName}。ふつうの${dispName}とは格が違う、ヌシ級の一品。`
    });
    if (isGpt(r.status)) prompts.push({ imageId, name: r.name, category: r.category, status: r.status });
});

// ---- data/catchItems.js ----
const catMeta = {};
Object.entries(CATEGORIES).forEach(([name, c]) => { catMeta[name] = { key: c.key, emoji: c.emoji, hue: c.hue }; });
const js = `// ========================================
// 釣れるもの（魚以外）データ  ※自動生成ファイル。手で編集しない
// 元データ: tools/catch_items/list.csv  再生成: node tools/catch_items/build.js
// 全${items.length}種 / ${Object.keys(CATEGORIES).length}系統
// ========================================
const CATCH_CATEGORIES = ${JSON.stringify(catMeta, null, 4)};

// 既存の魚に画像だけ使うもの（画像ID → 魚ID）
const CATCH_IMAGE_FOR_FISH = ${JSON.stringify(Object.fromEntries(merged.map(m => [m.imageId, m.fishId])), null, 4)};

const CATCH_ITEMS = [
${items.map(it => '    ' + JSON.stringify(it)).join(',\n')}
];

(function attachCatchItems() {
    const root = (typeof window !== 'undefined') ? window : globalThis;
    const gd = root.GAME_DATA;
    if (!gd || !Array.isArray(gd.FISH)) return;
    const ready = new Set(root.CATCH_IMAGE_READY || []);
    const dir = root.CATCH_IMAGE_DIR || 'images/catch/';
    const ext = root.CATCH_IMAGE_EXT || '.webp';
    gd.CATCH_CATEGORIES = CATCH_CATEGORIES;
    CATCH_ITEMS.forEach(src => {
        if (gd.FISH.some(f => f.id === src.id)) return;
        const item = Object.assign({}, src);
        if (ready.has(item.imageId)) item.image = dir + item.imageId + ext;
        gd.FISH.push(item);
    });
    // 既存の魚に画像を当てる
    Object.entries(CATCH_IMAGE_FOR_FISH).forEach(([imageId, fishId]) => {
        if (!ready.has(imageId)) return;
        const f = gd.FISH.find(x => x.id === fishId);
        if (f) f.image = dir + imageId + ext;
    });
})();
`;
fs.writeFileSync(OUT_JS, js);

// ---- gpt_prompts.md ----
const md = `# ChatGPTで作る画像のプロンプト（${prompts.length}件）
自動生成: node tools/catch_items/build.js

## 共通ルール（最初に1回だけ送る）
\`\`\`
これからゲームの図鑑用アイコンを1枚ずつ作ってもらいます。全部この見た目でそろえてください。
- 正方形 1024x1024、背景は透過（無理なら真っ白）
- 対象は1つだけ、画面の中央に大きく、全体が切れずに入る
- 太めの濃い縁取りのある、かわいいステッカー風イラスト。影はやわらかく1段だけ
- 文字・ロゴ・枠・背景の模様は入れない
- 添付した見本画像と同じタッチ・線の太さ・色の濃さに合わせる
作ったら、ファイル名を「番号.png」（例: c02_18.png）にしてGoogleドライブの「claude共有用」に保存してください。
\`\`\`

## 1枚ずつのプロンプト
| 番号 | 系統 | 名前 | 今の状態 | プロンプト |
|---|---|---|---|---|
${prompts.map(p => `| ${p.imageId} | ${p.category} | ${p.name} | ${p.status} | 「${p.name.replace(/_/g, 'の')}」のアイコンを作って。ファイル名は ${p.imageId}.png |`).join('\n')}

## 巨大ロボについて
c02_19（頭）〜 c02_19f（合体）は同じロボのパーツです。頭（c02_19、採用済み）の画像を見本に添付して、色・デザインをそろえてください。
- c02_19b 体 / c02_19c 足 / c02_19d 右腕 / c02_19e 左腕 / c02_19f 全部合体した姿
`;
fs.writeFileSync(OUT_PROMPTS, md);

// ---- 集計表示 ----
const byRank = {};
items.forEach(i => { byRank[i.rarity] = (byRank[i.rarity] || 0) + 1; });
console.log(`生成: ${items.length}種 (ランク別 ${JSON.stringify(byRank)}) / ChatGPT分 ${prompts.length}件 / 既存魚に統合 ${merged.length}件`);
