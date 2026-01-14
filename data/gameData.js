// ゲームデータ定義
// 釣り竿、魚、スキル、餌などのマスターデータ

// ========================================
// 釣り竿データ
// 星4つのパワー ≒ 次のランクの竿（星0）のパワー となるよう調整
// ========================================
const RODS = [
    {
        id: 'wooden_rod',
        name: '木の釣竿',
        basePower: 10,
        starPowerBonus: 3,  // 星1つあたりのパワー上昇
        price: 0,           // 初期装備
        upgradeBaseCost: 100, // 星1つあたりの強化コスト基準
        description: '初心者向けの木製釣竿'
    },
    {
        id: 'bamboo_rod',
        name: '竹の釣竿',
        basePower: 22,
        starPowerBonus: 5,
        price: 500,
        upgradeBaseCost: 250,
        description: 'しなやかで扱いやすい竹製釣竿'
    },
    {
        id: 'carbon_rod',
        name: 'カーボン釣竿',
        basePower: 42,
        starPowerBonus: 8,
        price: 2000,
        upgradeBaseCost: 600,
        description: '軽量で強度に優れたカーボン製'
    },
    {
        id: 'titanium_rod',
        name: 'チタン釣竿',
        basePower: 74,
        starPowerBonus: 12,
        price: 8000,
        upgradeBaseCost: 1500,
        description: '最高級のチタン合金製釣竿'
    },
    {
        id: 'legendary_rod',
        name: '伝説の釣竿',
        basePower: 122,
        starPowerBonus: 20,
        price: 30000,
        upgradeBaseCost: 5000,
        description: '古より伝わる伝説の釣竿'
    }
];

// ========================================
// 魚データ
// レア度: common(一般), uncommon(珍しい), rare(レア), epic(超レア), legendary(伝説)
// ========================================
// ========================================
// 魚データ (計35種類)
// ランク: D(9), C(8), B(7), A(6), S(5)
// ========================================
const FISH = [
    // Dランク (9種)
    { id: 'fish_d1', name: 'メダカ', power: 5, price: 10, rarity: 'D', weight: 100, specialTitle: '水たまりの' },
    { id: 'fish_d2', name: 'フナ', power: 6, price: 15, rarity: 'D', weight: 95, specialTitle: '泥まみれの' },
    { id: 'fish_d3', name: 'クチボソ', power: 7, price: 20, rarity: 'D', weight: 90, specialTitle: '小生意気な' },
    { id: 'fish_d4', name: 'ヌマエビ', power: 8, price: 25, rarity: 'D', weight: 85, specialTitle: '透き通った' },
    { id: 'fish_d5', name: 'ザリガニ', power: 9, price: 30, rarity: 'D', weight: 80, specialTitle: '真紅の鋏の' },
    { id: 'fish_d6', name: 'ハゼ', power: 10, price: 35, rarity: 'D', weight: 75, specialTitle: '砂底の' },
    { id: 'fish_d7', name: 'タナゴ', power: 11, price: 40, rarity: 'D', weight: 70, specialTitle: '虹色に輝く' },
    { id: 'fish_d8', name: 'ドジョウ', power: 12, price: 45, rarity: 'D', weight: 65, specialTitle: 'ぬるぬるした' },
    { id: 'fish_d9', name: 'オタマジャクシ', power: 4, price: 5, rarity: 'D', weight: 110, specialTitle: '明日に夢見る' },

    // Cランク (8種)
    { id: 'fish_c1', name: 'アユ', power: 15, price: 60, rarity: 'C', weight: 50, specialTitle: '清流の' },
    { id: 'fish_c2', name: 'イワナ', power: 18, price: 75, rarity: 'C', weight: 45, specialTitle: '岩陰の紳士' },
    { id: 'fish_c3', name: 'ヤマメ', power: 20, price: 90, rarity: 'C', weight: 40, specialTitle: '渓流の女王' },
    { id: 'fish_c4', name: 'コイ', power: 22, price: 100, rarity: 'C', weight: 35, specialTitle: '大河の主候補' },
    { id: 'fish_c5', name: 'ニジマス', power: 25, price: 120, rarity: 'C', weight: 30, specialTitle: '宝石を纏った' },
    { id: 'fish_c6', name: 'ブラックバス', power: 28, price: 150, rarity: 'C', weight: 25, specialTitle: '湖の暴君' },
    { id: 'fish_c7', name: 'ブルーギル', power: 14, price: 50, rarity: 'C', weight: 55, specialTitle: '青い鱗の' },
    { id: 'fish_c8', name: 'ウグイ', power: 12, price: 40, rarity: 'C', weight: 60, specialTitle: 'どこにでも居る' },

    // Bランク (7種)
    { id: 'fish_b1', name: 'タイ', power: 35, price: 250, rarity: 'B', weight: 20, specialTitle: '目出度い' },
    { id: 'fish_b2', name: 'ヒラメ', power: 40, price: 300, rarity: 'B', weight: 18, specialTitle: '砂漠の忍者の' },
    { id: 'fish_b3', name: 'ブリ', power: 45, price: 350, rarity: 'B', weight: 16, specialTitle: '荒波に揉まれた' },
    { id: 'fish_b4', name: 'スズキ', power: 50, price: 400, rarity: 'B', weight: 14, specialTitle: '出世を夢見る' },
    { id: 'fish_b5', name: 'サワラ', power: 55, price: 450, rarity: 'B', weight: 12, specialTitle: '春を告げる' },
    { id: 'fish_b6', name: 'カツオ', power: 30, price: 200, rarity: 'B', weight: 22, specialTitle: '一本釣りの' },
    { id: 'fish_b7', name: 'ボラ', power: 28, price: 180, rarity: 'B', weight: 25, specialTitle: '海辺の跳躍者' },

    // Aランク (6種)
    { id: 'fish_a1', name: 'マグロ', power: 70, price: 800, rarity: 'A', weight: 8, specialTitle: '大海を駆ける' },
    { id: 'fish_a2', name: 'カジキ', power: 85, price: 1200, rarity: 'A', weight: 6, specialTitle: '水中の狙撃手' },
    { id: 'fish_a3', name: 'ウナギ', power: 65, price: 1000, rarity: 'A', weight: 10, specialTitle: '精力のつく' },
    { id: 'fish_a4', name: 'クエ', power: 95, price: 1500, rarity: 'A', weight: 4, specialTitle: '幻の磯の主' },
    { id: 'fish_a5', name: 'エイ', power: 60, price: 700, rarity: 'A', weight: 12, specialTitle: '海を舞う' },
    { id: 'fish_a6', name: 'チョウザメ', power: 110, price: 2000, rarity: 'A', weight: 3, specialTitle: 'キャビアを産む' },

    // Sランク (5種)
    { id: 'fish_s1', name: 'シーラカンス', power: 130, price: 5000, rarity: 'S', weight: 2, specialTitle: '太古より目覚めし' },
    { id: 'fish_s2', name: 'リュウグウノツカイ', power: 150, price: 8000, rarity: 'S', weight: 1, specialTitle: '深海よりの使者' },
    { id: 'fish_s3', name: '大王イカ', power: 120, price: 4000, rarity: 'S', weight: 3, specialTitle: '全てを呑み込む' },
    { id: 'fish_s4', name: '黄金のタイ', power: 140, price: 10000, rarity: 'S', weight: 0.5, specialTitle: '伝説の輝きを放つ' },
    { id: 'fish_s5', name: '伝説の海龍', power: 200, price: 30000, rarity: 'S', weight: 0.1, specialTitle: '天を統べし' }
];

// ========================================
// 称号付き魚の設定
// ========================================
const TITLE_CONFIG = {
    chance: 0.05,        // 称号付きが出る確率 (5%)
    priceMultiplier: 5,  // 称号付きの売値倍率
};

// ========================================
// スキルデータ
// ========================================
const SKILLS = [
    // パワーアップ系
    {
        id: 'power_up_1',
        name: 'パワーUP I',
        description: '釣りパワー+5',
        effect: { type: 'power_boost', value: 5 },
        price: 200
    },
    {
        id: 'power_up_2',
        name: 'パワーUP II',
        description: '釣りパワー+15',
        effect: { type: 'power_boost', value: 15 },
        price: 800
    },
    {
        id: 'power_up_3',
        name: 'パワーUP III',
        description: '釣りパワー+30',
        effect: { type: 'power_boost', value: 30 },
        price: 2500
    },

    // ゲージ減速系
    {
        id: 'gauge_slow_1',
        name: 'ゲージ減速 I',
        description: 'ゲージ速度-10%',
        effect: { type: 'gauge_slow', value: 0.1 },
        price: 300
    },
    {
        id: 'gauge_slow_2',
        name: 'ゲージ減速 II',
        description: 'ゲージ速度-20%',
        effect: { type: 'gauge_slow', value: 0.2 },
        price: 1000
    },

    // 価格アップ系
    {
        id: 'price_up_1',
        name: '売値UP I',
        description: '魚の売却価格+10%',
        effect: { type: 'price_boost', value: 0.1 },
        price: 400
    },
    {
        id: 'price_up_2',
        name: '売値UP II',
        description: '魚の売却価格+25%',
        effect: { type: 'price_boost', value: 0.25 },
        price: 1500
    },

    // 成功率アップ系
    {
        id: 'catch_rate_1',
        name: 'キャッチ率UP I',
        description: '捕獲確率+5%',
        effect: { type: 'catch_boost', value: 0.05 },
        price: 500
    },
    {
        id: 'catch_rate_2',
        name: 'キャッチ率UP II',
        description: '捕獲確率+15%',
        effect: { type: 'catch_boost', value: 0.15 },
        price: 2000
    },

    // レア度アップ系
    {
        id: 'rare_up_1',
        name: 'レア魚UP I',
        description: 'レア魚出現率+20%',
        effect: { type: 'rare_boost', value: 0.2 },
        price: 600
    },

    // 予兆察知系
    {
        id: 'nibble_fix',
        name: '予兆察知',
        description: 'ウキの揺れが常に2回になる',
        effect: { type: 'nibble_fix', value: 2 },
        price: 1200
    }
];

// ========================================
// 餌データ
// ========================================
// ========================================
// 餌データ
// ========================================
const BAITS = [
    {
        id: 'bait_d',
        name: 'Dランクの餌',
        rank: 'D',
        description: '基本の餌。Dランクが釣れやすい。釣れても消費されない。',
        price: 0,
        quantity: 1
    },
    {
        id: 'bait_c',
        name: 'Cランクの餌',
        rank: 'C',
        description: 'Cランクが釣れやすい。失敗しても消費されない。',
        price: 50,
        quantity: 5
    },
    {
        id: 'bait_b',
        name: 'Bランクの餌',
        rank: 'B',
        description: 'Bランクが釣れやすい。失敗しても消費されない。',
        price: 200,
        quantity: 5
    },
    {
        id: 'bait_a',
        name: 'Aランクの餌',
        rank: 'A',
        description: 'Aランクが釣れやすい。釣れなくても消費される。',
        price: 800,
        quantity: 5
    },
    {
        id: 'bait_s',
        name: 'Sランクの餌',
        rank: 'S',
        description: 'Sランクが釣れやすい。釣れなくても消費される。',
        price: 3000,
        quantity: 3
    }
];

// ========================================
// ゲージバトル設定
// ========================================
const GAUGE_CONFIG = {
    // ゲージの基本速度（ピクセル/フレーム）
    baseSpeed: 1.5,
    // パワー差による速度調整（差が小さいほど遅くなる）
    speedMultiplierMin: 0.4,
    speedMultiplierMax: 1.5,

    // ゾーンの幅（%）
    zones: {
        red: { width: 10, catchRate: { min: 0.8, max: 1.0 } },    // 大成功
        green: { width: 15, catchRate: { min: 0.4, max: 0.6 } },  // 成功
        white: { width: 75, catchRate: { min: 0.1, max: 0.2 } }   // 普通
    },

    // パワー差による赤ゾーン幅の調整
    redZoneWidthMin: 5,
    redZoneWidthMax: 20
};

// ========================================
// 釣りサイクル設定
// ========================================
const FISHING_CONFIG = {
    // ウキが揺れるまでの待機時間（ミリ秒）
    waitTimeMin: 2000,
    waitTimeMax: 6000,

    // 予兆（ウキ揺れ）の時間（ミリ秒）- 揺れアニメーション（4回×0.15秒）と同期
    nibbleTime: 700,

    // ヒット判定可能時間（ミリ秒）
    hitWindowTime: 1000,

    // ヒットを逃した場合のペナルティ時間（ミリ秒）
    missedPenalty: 500
};

// ========================================
// レア度別の出現重み調整
// ========================================
// ========================================
// レア度別の出現重み調整 (ベース)
// ========================================
const RARITY_WEIGHTS = {
    D: 1.0,
    C: 0.3,
    B: 0.1,
    A: 0.03,
    S: 0.01
};

// エクスポート用（グローバル変数として使用）
if (typeof window !== 'undefined') {
    window.GAME_DATA = {
        RODS,
        FISH,
        SKILLS,
        BAITS,
        GAUGE_CONFIG,
        FISHING_CONFIG,
        RARITY_WEIGHTS
    };
}
