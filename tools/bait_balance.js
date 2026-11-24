// 餌の使用数ごとの「ランク出現率」と「期待収益」を検算するスクリプト
//   node tools/bait_balance.js
// 前提（簡易モデル）:
//   - 魚の平均売値は同ランク内を weight で加重平均（称号・スキル・複数匹捕獲は無視）
//   - 釣り上げ成功率はランク別の固定値（LAND）。実際は竿パワー・ゲージ操作で変わる目安値
//   - 餌は投げた時点で消費。失敗時は使用数の failRefundRate が戻る（切り捨て）。成功時は餌の達人で1個ごとに確率で戻る
const fs = require('fs');
const path = require('path');

global.window = {};
eval(fs.readFileSync(path.join(__dirname, '..', 'data', 'gameData.js'), 'utf8'));
const { FISH, BAIT_CONFIG: CFG } = window.GAME_DATA;

const RANKS = ['D', 'C', 'B', 'A', 'S', 'SS'];
// ランク別の釣り上げ成功率の目安（S/SSは2連戦・SSは赤ゲージ必須）
const LAND = { D: 1.0, C: 0.95, B: 0.85, A: 0.65, S: 0.45, SS: 0.15 };

const avgPrice = {};
RANKS.forEach(r => {
    const pool = FISH.filter(f => f.rarity === r);
    const w = pool.reduce((a, f) => a + f.weight, 0);
    avgPrice[r] = pool.reduce((a, f) => a + f.price * f.weight, 0) / w;
});

function analyse(tier, unitPrice, saveChance = 0) {
    const total = Object.values(tier.weights).reduce((a, b) => a + b, 0);
    const p = {};
    RANKS.forEach(r => { p[r] = (tier.weights[r] || 0) / total; });

    let gross = 0;      // 全部釣れた場合の売値期待値
    let revenue = 0;    // 成功率を考慮した売値期待値
    let pLand = 0;      // 釣り上げ成功確率
    RANKS.forEach(r => {
        gross += p[r] * avgPrice[r];
        revenue += p[r] * avgPrice[r] * LAND[r];
        pLand += p[r] * LAND[r];
    });
    // 餌コスト: 投げた時点で count 個。成功時は1個ごと saveChance で戻る、失敗時は半分(切り捨て)戻る
    const n = tier.count;
    const refundOnFail = Math.floor(n * CFG.failRefundRate);
    const expectedSpent = pLand * n * (1 - saveChance) + (1 - pLand) * (n - refundOnFail);
    const cost = expectedSpent * unitPrice;
    return { p, gross, revenue, pLand, cost, net: revenue - cost };
}

const pad = (s, n) => String(s).padStart(n, ' ');
const pc = (x) => (x >= 0.0005 ? (x * 100).toFixed(1) : '0.0').padStart(5, ' ');

console.log('平均売値(重み加重):', RANKS.map(r => `${r}=${avgPrice[r].toFixed(0)}G`).join('  '));
console.log('成功率の仮定      :', RANKS.map(r => `${r}=${LAND[r] * 100}%`).join('  '));
console.log(`餌の基準単価 ${CFG.unitPrice}G / まとめ買い: ${CFG.packs.map(p => `${p.count}個=${p.price}G(単価${(p.price / p.count).toFixed(1)})`).join(', ')}\n`);

function table(unitPrice, saveChance, label) {
    console.log(`--- ${label}（単価 ${unitPrice}G, 餌の達人の戻り率 ${saveChance * 100}%） ---`);
    console.log(' 使用数 |    D     C     B     A     S    SS | 総売値期待 | 実効売値 |  餌コスト |    純利益 | コスト/実効 | 純利益(餌なし比)');
    const base = analyse(CFG.tiers[0], unitPrice, saveChance);
    CFG.tiers.forEach(t => {
        const a = analyse(t, unitPrice, saveChance);
        console.log(
            `${pad(t.count === 0 ? 'なし' : t.count + '個', 7)} | ` +
            RANKS.map(r => pc(a.p[r])).join(' ') + ' | ' +
            `${pad(a.gross.toFixed(0), 9)}G | ${pad(a.revenue.toFixed(0), 7)}G | ${pad(a.cost.toFixed(0), 8)}G | ${pad(a.net.toFixed(0), 8)}G | ` +
            `${pad(a.revenue > 0 ? (a.cost / a.revenue * 100).toFixed(0) + '%' : '-', 10)} | ${pad((a.net - base.net >= 0 ? '+' : '') + (a.net - base.net).toFixed(0), 8)}G`
        );
    });
    console.log('');
}

const bestPackUnit = Math.min(...CFG.packs.map(p => p.price / p.count));
table(CFG.unitPrice, 0, '基準単価');
table(bestPackUnit, 0, '最安のまとめ買い単価');
table(CFG.unitPrice, 0.5, '餌の達人III装備');

// 検算: 使用数を増やすほど純利益が増えること（餌を増やす価値がある）
let ok = true;
let prev = -Infinity;
CFG.tiers.forEach(t => {
    const a = analyse(t, CFG.unitPrice, 0);
    if (a.net < prev) ok = false;
    prev = a.net;
});
console.log(ok ? 'OK: 使用数が増えるほど純利益も増える（基準単価）' : 'NG: 純利益が逆転している段階があります');
process.exit(ok ? 0 : 1);
