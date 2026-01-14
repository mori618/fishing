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
const FISH = [
    // 一般魚（common）
    { id: 'sardine', name: 'イワシ', power: 5, price: 10, rarity: 'common', weight: 100 },
    { id: 'horse_mackerel', name: 'アジ', power: 8, price: 20, rarity: 'common', weight: 90 },
    { id: 'mackerel', name: 'サバ', power: 12, price: 35, rarity: 'common', weight: 80 },
    { id: 'sea_bream', name: 'タイ', power: 18, price: 60, rarity: 'common', weight: 60 },

    // 珍しい魚（uncommon）
    { id: 'flounder', name: 'ヒラメ', power: 25, price: 100, rarity: 'uncommon', weight: 40 },
    { id: 'yellowtail', name: 'ブリ', power: 35, price: 150, rarity: 'uncommon', weight: 35 },
    { id: 'bonito', name: 'カツオ', power: 45, price: 200, rarity: 'uncommon', weight: 30 },

    // レア魚（rare）
    { id: 'tuna', name: 'マグロ', power: 60, price: 400, rarity: 'rare', weight: 15 },
    { id: 'salmon', name: 'サーモン', power: 50, price: 300, rarity: 'rare', weight: 18 },
    { id: 'eel', name: 'ウナギ', power: 40, price: 350, rarity: 'rare', weight: 20 },

    // 超レア魚（epic）
    { id: 'giant_tuna', name: 'クロマグロ', power: 90, price: 1000, rarity: 'epic', weight: 5 },
    { id: 'swordfish', name: 'カジキ', power: 100, price: 1200, rarity: 'epic', weight: 4 },

    // 伝説魚（legendary）
    { id: 'golden_fish', name: '黄金のタイ', power: 130, price: 3000, rarity: 'legendary', weight: 1 },
    { id: 'ancient_coelacanth', name: 'シーラカンス', power: 150, price: 5000, rarity: 'legendary', weight: 0.5 }
];

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
const BAITS = [
    {
        id: 'normal_bait',
        name: '普通の餌',
        description: 'ヒット時間を少し短縮',
        hitTimeReduction: 0.2,  // 20%短縮
        rareBoost: 0,
        price: 20,
        quantity: 5
    },
    {
        id: 'premium_bait',
        name: '高級餌',
        description: 'ヒット時間を短縮、レア魚が出やすい',
        hitTimeReduction: 0.4,
        rareBoost: 0.3,
        price: 100,
        quantity: 5
    },
    {
        id: 'legendary_bait',
        name: '伝説の餌',
        description: 'ヒット時間大幅短縮、超レア魚が出やすい',
        hitTimeReduction: 0.6,
        rareBoost: 0.8,
        price: 500,
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
const RARITY_WEIGHTS = {
    common: 1.0,
    uncommon: 0.5,
    rare: 0.2,
    epic: 0.05,
    legendary: 0.01
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
