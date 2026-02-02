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
        upgradeCosts: [100, 300, 600, 1200, 3000], // 星1〜5への強化費用
        description: '初心者向けの木製釣竿'
    },
    {
        id: 'bamboo_rod',
        name: '竹の釣竿',
        basePower: 22,
        starPowerBonus: 5,
        price: 2000,
        upgradeCosts: [1000, 2500, 5000, 10000, 20000],
        description: 'しなやかで扱いやすい竹製釣竿'
    },
    {
        id: 'carbon_rod',
        name: 'カーボン釣竿',
        basePower: 42,
        starPowerBonus: 8,
        price: 10000,
        upgradeCosts: [5000, 12000, 25000, 50000, 100000],
        description: '軽量で強度に優れたカーボン製'
    },
    {
        id: 'titanium_rod',
        name: 'チタン釣竿',
        basePower: 74,
        starPowerBonus: 12,
        price: 50000,
        upgradeCosts: [20000, 50000, 100000, 200000, 400000],
        description: '最高級のチタン合金製釣竿'
    },
    {
        id: 'legendary_rod',
        name: '伝説の釣竿',
        basePower: 122,
        starPowerBonus: 20,
        price: 250000,
        upgradeCosts: [100000, 250000, 500000, 1000000, 2000000],
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
    {
        id: 'fish_d9', name: 'オタマジャクシ', power: 4, price: 5, rarity: 'D', weight: 20, frequency: 'たくさん釣れる', specialTitle: '明日に夢見る', icon: 'spa',
        description: 'カエルの子供。もうすぐ足が生えてくるかもしれない。',
        titleDescription: 'いつか大空を飛ぶことを夢見続けている、ロマンチストなオタマジャクシ。'
    },
    {
        id: 'fish_d1', name: 'メダカ', power: 5, price: 10, rarity: 'D', weight: 15, frequency: 'そこそこ釣れる', specialTitle: '水たまりの', icon: 'water_drop',
        description: '小さな淡水魚。群れで泳ぐ姿が可愛らしい。',
        titleDescription: '水たまりの主として君臨する巨大メダカ。'
    },
    {
        id: 'fish_d2', name: 'フナ', power: 6, price: 15, rarity: 'D', weight: 15, frequency: 'そこそこ釣れる', specialTitle: '泥まみれの', icon: 'set_meal',
        description: '日本の河川でよく見られる魚。釣りはフナに始まりフナに終わると言われる。',
        titleDescription: '泥の中を這い回り、たくましく生き抜いた伝説のフナ。'
    },
    {
        id: 'fish_d3', name: 'クチボソ', power: 7, price: 20, rarity: 'D', weight: 12, frequency: 'あまり釣れない', specialTitle: '小生意気な', icon: 'water_drop',
        description: '口が細いことからこの名がついた。すばしっこい。',
        titleDescription: '釣り人を翻弄する、非常に小生意気な性格をしたクチボソ。'
    },
    {
        id: 'fish_d4', name: 'ヌマエビ', power: 8, price: 25, rarity: 'D', weight: 10, frequency: 'あまり釣れない', specialTitle: '透き通った', icon: 'pest_control',
        description: '水草の間を動き回る小さなエビ。透き通った体が特徴。',
        titleDescription: '驚くべき透明度を誇り、水に溶け込むかのようなヌマエビ。'
    },
    {
        id: 'fish_d6', name: 'ハゼ', power: 10, price: 35, rarity: 'D', weight: 10, frequency: 'あまり釣れない', specialTitle: '砂底の', icon: 'set_meal',
        description: '砂泥底に生息する愛嬌のある顔をした魚。天ぷらが美味しい。',
        titleDescription: '砂底の支配者として、海底から全てを見通すハゼ。'
    },
    {
        id: 'fish_d5', name: 'ザリガニ', power: 9, price: 30, rarity: 'D', weight: 8, frequency: 'なかなか釣れない', specialTitle: '真紅の鋏の', icon: 'pest_control',
        description: '大きなハサミを持つ淡水の甲殻類。後ろ向きに泳ぐのが得意。',
        titleDescription: '鉄をも断ち切る真紅のハサミを持つ、恐るべきザリガニ。'
    },
    {
        id: 'fish_d7', name: 'タナゴ', power: 11, price: 40, rarity: 'D', weight: 5, frequency: 'なかなか釣れない', specialTitle: '虹色に輝く', icon: 'palette',
        description: '美しい婚姻色を持つことで知られる淡水魚。',
        titleDescription: '七色に輝く鱗を持ち、見る者を魅了する幻のタナゴ。'
    },
    {
        id: 'fish_d8', name: 'ドジョウ', power: 12, price: 45, rarity: 'D', weight: 5, frequency: 'なかなか釣れない', specialTitle: 'ぬるぬるした', icon: 'gesture',
        description: '細長い体で泥の中を泳ぐ。ひげがチャームポイント。',
        titleDescription: '捕まえようとしても手から滑り落ちる、究極のぬるぬるを持つドジョウ。'
    },

    // Cランク (8種)
    {
        id: 'fish_c7', name: 'ブルーギル', power: 14, price: 50, rarity: 'C', weight: 25, frequency: 'たくさん釣れる', specialTitle: '青い鱗の', icon: 'water',
        description: '青みがかった体色が特徴。繁殖力が強い。',
        titleDescription: '神秘的な青い輝きを放つ、突然変異種のブルーギル。'
    },
    {
        id: 'fish_c8', name: 'ウグイ', power: 12, price: 40, rarity: 'C', weight: 20, frequency: 'たくさん釣れる', specialTitle: 'どこにでも居る', icon: 'set_meal',
        description: '酸性水にも強い生命力を持つ魚。婚姻色は鮮やかな朱色になる。',
        titleDescription: '世界中どこへ行っても遭遇する、神出鬼没のウグイ。'
    },
    {
        id: 'fish_c4', name: 'コイ', power: 22, price: 100, rarity: 'C', weight: 15, frequency: 'そこそこ釣れる', specialTitle: '大河の主候補', icon: 'set_meal',
        description: '生命力が非常に強く、長生きする魚。滝を登ると龍になると言われる。',
        titleDescription: '龍になる直前、強大な力を秘めた大河の主候補。'
    },
    {
        id: 'fish_c1', name: 'アユ', power: 15, price: 60, rarity: 'C', weight: 12, frequency: 'あまり釣れない', specialTitle: '清流の', icon: 'waves',
        description: '清流に住む魚。独特の香気があり、香魚とも呼ばれる。',
        titleDescription: '最も清らかな水にしか住まない、高貴な香りを放つアユ。'
    },
    {
        id: 'fish_c5', name: 'ニジマス', power: 25, price: 120, rarity: 'C', weight: 10, frequency: 'あまり釣れない', specialTitle: '宝石を纏った', icon: 'diamond',
        description: '体側に虹色の帯があるのが特徴。釣りの対象として人気が高い。',
        titleDescription: '全身が宝石のように輝き、見る者を魅了するニジマス。'
    },
    {
        id: 'fish_c6', name: 'ブラックバス', power: 28, price: 150, rarity: 'C', weight: 8, frequency: 'なかなか釣れない', specialTitle: '湖の暴君', icon: 'gavel',
        description: '北米原産の肉食魚。引きが強く、ゲームフィッシングで人気。',
        titleDescription: '湖の生態系を支配する、圧倒的な力を持った暴君バス。'
    },
    {
        id: 'fish_c2', name: 'イワナ', power: 18, price: 75, rarity: 'C', weight: 5, frequency: 'なかなか釣れない', specialTitle: '岩陰の紳士', icon: 'landscape',
        description: '河川の最上流部に生息する。貪欲な肉食性を持つ。',
        titleDescription: '岩陰から虎視眈々と獲物を狙う、冷徹な紳士イワナ。'
    },
    {
        id: 'fish_c3', name: 'ヤマメ', power: 20, price: 90, rarity: 'C', weight: 5, frequency: 'なかなか釣れない', specialTitle: '渓流の女王', icon: 'filter_hdr',
        description: '体のパーマークが美しい、渓流の女王と呼ばれる魚。',
        titleDescription: 'その美しさで釣り人を惑わす、真の渓流の女王。'
    },

    // Bランク (7種)
    {
        id: 'fish_b7', name: 'ボラ', power: 28, price: 180, rarity: 'B', weight: 25, frequency: 'たくさん釣れる', specialTitle: '海辺の跳躍者', icon: 'flight',
        description: 'よく水面からジャンプする姿が見られる。卵巣はカラスミになる。',
        titleDescription: '大空へ飛び出すことを夢見て、限界まで跳躍するボラ。'
    },
    {
        id: 'fish_b6', name: 'カツオ', power: 30, price: 200, rarity: 'B', weight: 20, frequency: 'たくさん釣れる', specialTitle: '一本釣りの', icon: 'phishing',
        description: '高速で泳ぎ続ける回遊魚。たたきが絶品。',
        titleDescription: '誰にも止められない速度で海を駆け抜ける、弾丸カツオ。'
    },
    {
        id: 'fish_b5', name: 'サワラ', power: 55, price: 450, rarity: 'B', weight: 15, frequency: 'そこそこ釣れる', specialTitle: '春を告げる', icon: 'local_florist',
        description: '細長い体が特徴の大型肉食魚。春の訪れを告げる魚。',
        titleDescription: '春風と共に現れ、全てを置き去りにする疾風のサワラ。'
    },
    {
        id: 'fish_b4', name: 'スズキ', power: 50, price: 400, rarity: 'B', weight: 15, frequency: 'そこそこ釣れる', specialTitle: '出世を夢見る', icon: 'trending_up',
        description: '汽水域から海水域まで広く生息する。ルアーフィッシングの好敵手。',
        titleDescription: '海を支配する野望を持ち、貪欲に成長を続けるスズキ。'
    },
    {
        id: 'fish_b3', name: 'ブリ', power: 45, price: 350, rarity: 'B', weight: 10, frequency: 'あまり釣れない', specialTitle: '荒波に揉まれた', icon: 'tsunami',
        description: '成長するにつれて名前が変わる出世魚。冬の味覚。',
        titleDescription: '幾多の荒波を乗り越え、最強の身体を手に入れたブリ。'
    },
    {
        id: 'fish_b2', name: 'ヒラメ', power: 40, price: 300, rarity: 'B', weight: 8, frequency: 'なかなか釣れない', specialTitle: '砂漠の忍者の', icon: 'visibility_off',
        description: '海底の砂に隠れて獲物を待つ。高級魚としても知られる。',
        titleDescription: '砂と完全に同化し、獲物を瞬殺する砂漠の忍者ヒラメ。'
    },
    {
        id: 'fish_b1', name: 'タイ', power: 35, price: 250, rarity: 'B', weight: 7, frequency: 'なかなか釣れない', specialTitle: '目出度い', icon: 'celebration',
        description: '「めでたい」に通じる縁起の良い魚。味も姿も一級品。',
        titleDescription: '祝いの席には欠かせない、光り輝く最高級のタイ。'
    },

    // Aランク (6種)
    {
        id: 'fish_a5', name: 'エイ', power: 60, price: 700, rarity: 'A', weight: 30, frequency: 'たくさん釣れる', specialTitle: '海を舞う', icon: 'paragliding',
        description: '平べったい体と長い尾が特徴。優雅に泳ぐ姿は空飛ぶ絨毯のよう。',
        titleDescription: '海中を優雅に舞い、毒針すらも美しい芸術的なエイ。'
    },
    {
        id: 'fish_a1', name: 'マグロ', power: 70, price: 800, rarity: 'A', weight: 25, frequency: 'たくさん釣れる', specialTitle: '大海を駆ける', icon: 'speed',
        description: '海の王様とも呼ばれる大型回遊魚。その巨体は高速で泳ぐための筋肉の塊。',
        titleDescription: '七つの海を制覇し、止まることを知らない海の帝王マグロ。'
    },
    {
        id: 'fish_a3', name: 'ウナギ', power: 65, price: 1000, rarity: 'A', weight: 15, frequency: 'そこそこ釣れる', specialTitle: '精力のつく', icon: 'bolt',
        description: '長い旅をして川に戻ってくる神秘的な魚。蒲焼きは日本の伝統食。',
        titleDescription: '無限のスタミナを秘め、食べた者に活力を与える伝説のウナギ。'
    },
    {
        id: 'fish_a2', name: 'カジキ', power: 85, price: 1200, rarity: 'A', weight: 12, frequency: 'あまり釣れない', specialTitle: '水中の狙撃手', icon: 'gps_fixed',
        description: '鋭く尖った吻が特徴。世界最速の魚類の一つ。',
        titleDescription: '狙った獲物は逃がさない、海のスナイパーとして恐れられるカジキ。'
    },
    {
        id: 'fish_a4', name: 'クエ', power: 95, price: 1500, rarity: 'A', weight: 10, frequency: 'あまり釣れない', specialTitle: '幻の磯の主', icon: 'workspace_premium',
        description: '磯の王者と呼ばれるハタ科の大型魚。味は絶品だが、釣るのは非常に困難。',
        titleDescription: '滅多に姿を現さない、幻の中の幻と呼ばれる究極のクエ。'
    },
    {
        id: 'fish_a6', name: 'チョウザメ', power: 110, price: 2000, rarity: 'A', weight: 8, frequency: 'なかなか釣れない', specialTitle: 'キャビアを産む', icon: 'egg_alt',
        description: '古代魚の姿を残す大型魚。世界三大珍味の一つキャビアの親。',
        titleDescription: '黄金のキャビアをその身に宿す、生きた宝石箱チョウザメ。'
    },

    // Sランク (5種)
    {
        id: 'fish_s3', name: '大王イカ', power: 120, price: 4000, rarity: 'S', weight: 40, frequency: 'たくさん釣れる', specialTitle: '全てを呑み込む', icon: 'hub',
        description: '世界最大級の無脊椎動物。深海の怪物クラーケンの正体とされる。',
        titleDescription: 'その巨大な触手で船さえも沈めると噂される、深海の悪魔。'
    },
    {
        id: 'fish_s1', name: 'シーラカンス', power: 130, price: 5000, rarity: 'S', weight: 25, frequency: 'たくさん釣れる', specialTitle: '太古より目覚めし', icon: 'history',
        description: '数億年前から姿を変えていない「生きた化石」。深海にひっそりと生息する。',
        titleDescription: '悠久の時を超えて現代に蘇った、歴史の証人たるシーラカンス。'
    },
    {
        id: 'fish_s2', name: 'リュウグウノツカイ', power: 150, price: 8000, rarity: 'S', weight: 20, frequency: 'たくさん釣れる', specialTitle: '深海よりの使者', icon: 'scuba_diving',
        description: '銀色の長い体と赤い鰭が美しい深海魚。人魚のモデルとも言われる。',
        titleDescription: '竜宮城からのメッセージを携え、深海から現れた神秘の使者。'
    },
    {
        id: 'fish_s4', name: '黄金のタイ', power: 140, price: 10000, rarity: 'S', weight: 10, frequency: 'あまり釣れない', specialTitle: '伝説の輝きを放つ', icon: 'star',
        description: '全身が黄金に輝く伝説のタイ。釣り上げた者に巨万の富をもたらす。',
        titleDescription: '太陽の如き輝きを放ち、見る者全ての運命を変える神の使い。'
    },
    {
        id: 'fish_s5', name: '伝説の海龍', power: 200, price: 30000, rarity: 'S', weight: 5, frequency: 'なかなか釣れない', specialTitle: '天を統べし', icon: 'token',
        description: 'あらゆる海洋生物の頂点に立つ龍。その姿を見た者はいないとされる。',
        titleDescription: '海だけでなく天候さえも操る、神話の世界から現れた絶対的な存在。'
    },

    // SSランク (2種)
    {
        id: 'fish_ss1', name: '伝説のクラーケン', power: 250, price: 50000, rarity: 'SS', weight: 0.05, frequency: '滅多に釣れない', specialTitle: '深海よりの厄災', icon: 'storm',
        description: '船を襲い海に引きずり込むと言われる伝説の巨大生物。複数の触手を持つ。',
        titleDescription: '全ての船乗りに恐れられ、海そのものの怒りを具現化したかのような厄災。'
    },
    {
        id: 'fish_ss2', name: 'リヴァイアサン', power: 300, price: 80000, rarity: 'SS', weight: 0.02, frequency: '滅多に釣れない', specialTitle: '世界を飲み込む', icon: 'all_inclusive',
        description: '旧約聖書にも記される巨大な海獣。その鱗はあらゆる武器を弾くという。',
        titleDescription: '世界の終わりに現れ、海すらも飲み干すと言われる究極の海獣。'
    }
];

// ========================================
// 称号付き魚の設定
// ========================================
const TITLE_CONFIG = {
    chance: 0.015,        // 称号付きが出る確率 (5%)
    priceMultiplier: 10,  // 称号付きの売値倍率
};

// ========================================
// スキルデータ
// ========================================
const SKILLS = [
    // パワーアップ系
    // パワーアップ系 (Power Boost)
    { id: 'power_up_1', name: 'パワーUP I', description: '釣りパワー+5', effect: { type: 'power_boost', value: 5 }, price: 200, tier: 1 },
    { id: 'power_up_2', name: 'パワーUP II', description: '釣りパワー+15', effect: { type: 'power_boost', value: 15 }, price: 800, tier: 2 },
    { id: 'power_up_3', name: 'パワーUP III', description: '釣りパワー+30', effect: { type: 'power_boost', value: 30 }, price: 2500, tier: 3 },
    { id: 'power_up_4', name: 'パワーUP 極', description: '釣りパワー+60', effect: { type: 'power_boost', value: 60 }, price: 10000, tier: 4 },

    // オーバードライブ (Overdrive) - 攻速両面強化
    { id: 'overdrive_1', name: 'オーバードライブ I', description: 'パワー+15% & ゲージ速度+5%', effect: { type: 'overdrive', power: 0.15, speed: 0.05 }, price: 1000, tier: 1 },
    { id: 'overdrive_2', name: 'オーバードライブ II', description: 'パワー+30% & ゲージ速度+10%', effect: { type: 'overdrive', power: 0.3, speed: 0.1 }, price: 4000, tier: 2 },
    { id: 'overdrive_3', name: 'オーバードライブ III', description: 'パワー+50% & ゲージ速度+20%', effect: { type: 'overdrive', power: 0.5, speed: 0.2 }, price: 10000, tier: 3 },
    { id: 'overdrive_4', name: 'オーバードライブ 極', description: 'パワー+100% & ゲージ速度+40%', effect: { type: 'overdrive', power: 1.0, speed: 0.4 }, price: 30000, tier: 4 },

    // アルティメットリスク (Ultimate Risk) - 超絶強化・超絶リスク
    { id: 'ultimate_risk_1', name: '究極の賭け I', description: 'パワー+40% & 失敗時に所持魚が半分減少', effect: { type: 'ultimate_risk', power: 0.4, lossRate: 0.5 }, price: 5000, tier: 1 },
    { id: 'ultimate_risk_2', name: '究極の賭け II', description: 'パワー+70% & 失敗時に所持魚が8割減少', effect: { type: 'ultimate_risk', power: 0.7, lossRate: 0.8 }, price: 15000, tier: 2 },
    { id: 'ultimate_risk_3', name: '究極の賭け III', description: 'パワー+100% & 失敗時に所持魚が0になる', effect: { type: 'ultimate_risk', power: 1.0, lossRate: 1.0 }, price: 50000, tier: 3 },
    { id: 'ultimate_risk_4', name: '禁忌の力 極', description: 'パワー+200% & 失敗時に所持金と魚が0になる', effect: { type: 'ultimate_risk', power: 2.0, lossRate: 1.0, moneyLoss: true }, price: 150000, tier: 4 },

    // ゲージ減速系 (Gauge Slow)
    { id: 'gauge_slow_1', name: 'ゲージ減速 I', description: 'ゲージ速度-10%', effect: { type: 'gauge_slow', value: 0.1 }, price: 300, tier: 1 },
    { id: 'gauge_slow_2', name: 'ゲージ減速 II', description: 'ゲージ速度-20%', effect: { type: 'gauge_slow', value: 0.2 }, price: 1000, tier: 2 },
    { id: 'gauge_slow_3', name: 'ゲージ減速 III', description: 'ゲージ速度-30%', effect: { type: 'gauge_slow', value: 0.3 }, price: 5000, tier: 3 },
    { id: 'gauge_slow_4', name: 'ゲージ減速 極', description: 'ゲージ速度-45%', effect: { type: 'gauge_slow', value: 0.45 }, price: 15000, tier: 4 },

    // 価格アップ系
    // 価格アップ系 (Price Boost)
    { id: 'price_up_1', name: '売値UP I', description: '魚の売却価格+10%', effect: { type: 'price_boost', value: 0.1 }, price: 400, tier: 1 },
    { id: 'price_up_2', name: '売値UP II', description: '魚の売却価格+25%', effect: { type: 'price_boost', value: 0.25 }, price: 1500, tier: 2 },
    { id: 'price_up_3', name: '売値UP III', description: '魚の売却価格+45%', effect: { type: 'price_boost', value: 0.45 }, price: 4000, tier: 3 },
    { id: 'price_up_4', name: '売値UP 極', description: '魚の売却価格+70%', effect: { type: 'price_boost', value: 0.70 }, price: 12000, tier: 4 },

    // ハイリスク売却 (High Risk Sell) - 闇取引
    { id: 'high_risk_sell_1', name: '闇取引 I', description: '売却価格1.2倍 & 失敗時に所持金微減', effect: { type: 'high_risk_sell', priceMult: 1.2, penaltyRate: 0.05 }, price: 1200, tier: 1 },
    { id: 'high_risk_sell_2', name: '闇取引 II', description: '売却価格1.5倍 & 失敗時に所持金減少(小)', effect: { type: 'high_risk_sell', priceMult: 1.5, penaltyRate: 0.1 }, price: 5000, tier: 2 },
    { id: 'high_risk_sell_3', name: '闇取引 III', description: '売却価格3倍 & 失敗時に所持金減少(大)', effect: { type: 'high_risk_sell', priceMult: 3.0, penaltyRate: 0.3 }, price: 15000, tier: 3 },
    { id: 'high_risk_sell_4', name: '闇取引 極', description: '売却価格5倍 & 失敗時に全額没収', effect: { type: 'high_risk_sell', priceMult: 5.0, penaltyRate: 1.0 }, price: 50000, tier: 4 },

    // 成功率アップ系
    // キャッチ率アップ系 (Catch Rate Boost)
    { id: 'catch_rate_1', name: 'キャッチ率UP I', description: '捕獲確率+5%', effect: { type: 'catch_boost', value: 0.05 }, price: 500, tier: 1 },
    { id: 'catch_rate_2', name: 'キャッチ率UP II', description: '捕獲確率+15%', effect: { type: 'catch_boost', value: 0.15 }, price: 2000, tier: 2 },
    { id: 'catch_rate_3', name: 'キャッチ率UP III', description: '捕獲確率+30%', effect: { type: 'catch_boost', value: 0.30 }, price: 6000, tier: 3 },
    { id: 'catch_rate_4', name: 'キャッチ率UP 極', description: '捕獲確率+50%', effect: { type: 'catch_boost', value: 0.50 }, price: 18000, tier: 4 },

    // レア度アップ系 (Rare Fish Boost)
    { id: 'rare_up_1', name: 'レア魚UP I', description: 'レア魚出現率+20%', effect: { type: 'rare_boost', value: 0.2 }, price: 600, tier: 1 },
    { id: 'rare_up_2', name: 'レア魚UP II', description: 'レア魚出現率+50%', effect: { type: 'rare_boost', value: 0.5 }, price: 2400, tier: 2 },
    { id: 'rare_up_3', name: 'レア魚UP III', description: 'レア魚出現率+100%', effect: { type: 'rare_boost', value: 1.0 }, price: 10000, tier: 3 },
    { id: 'rare_up_4', name: '幸運の星 極', description: 'レア魚出現率が3倍', effect: { type: 'rare_boost', value: 3.0 }, price: 40000, tier: 4 },

    // ランクスナイパー (Rank Sniper) - 下位魚除外
    { id: 'rank_sniper_1', name: 'ランクスナイパー I', description: 'Cランク以上の魚しか釣れなくなる', effect: { type: 'rank_sniper', minRarity: 'C' }, price: 2000, tier: 1 },
    { id: 'rank_sniper_2', name: 'ランクスナイパー II', description: 'Bランク以上の魚しか釣れなくなる', effect: { type: 'rank_sniper', minRarity: 'B' }, price: 6000, tier: 2 },
    { id: 'rank_sniper_3', name: 'ランクスナイパー III', description: 'Aランク以上の魚しか釣れなくなる', effect: { type: 'rank_sniper', minRarity: 'A' }, price: 20000, tier: 3 },
    { id: 'rank_sniper_4', name: '選別の眼 極', description: 'Sランク以上の魚しか釣れなくなる', effect: { type: 'rank_sniper', minRarity: 'S' }, price: 100000, tier: 4 },

    // 条件付きレアアップ (Conditional Rare Boost)
    { id: 'moon_rare_up_1', name: '月光の導き I', description: '月の加護装備時のみレア魚率+20%', effect: { type: 'moon_rare_up', value: 0.2 }, price: 3000, tier: 1 },
    { id: 'moon_rare_up_2', name: '月光の導き II', description: '月の加護装備時のみレア魚率+40%', effect: { type: 'moon_rare_up', value: 0.4 }, price: 10000, tier: 2 },
    { id: 'moon_rare_up_3', name: '月光の導き III', description: '月の加護装備時のみレア魚率+70%', effect: { type: 'moon_rare_up', value: 0.7 }, price: 40000, tier: 3 },
    { id: 'moon_rare_up_4', name: '満月の導き 極', description: '月の加護装備時のみレア魚出現率が2倍', effect: { type: 'moon_rare_up', value: 2.0, multiplier: true }, price: 120000, tier: 4 },

    { id: 'sun_chest_up_1', name: '太陽の恵み I', description: '太陽の加護装備時のみ宝箱率+5%', effect: { type: 'sun_chest_up', value: 0.05 }, price: 3000, tier: 1 },
    { id: 'sun_chest_up_2', name: '太陽の恵み II', description: '太陽の加護装備時のみ宝箱率+15%', effect: { type: 'sun_chest_up', value: 0.15 }, price: 10000, tier: 2 },
    { id: 'sun_chest_up_3', name: '太陽の恵み III', description: '太陽の加護装備時のみ宝箱率+40%', effect: { type: 'sun_chest_up', value: 0.4 }, price: 40000, tier: 3 },
    { id: 'sun_chest_up_4', name: '灼熱の恵み 極', description: '太陽の加護装備時のみ宝箱出現率が3倍', effect: { type: 'sun_chest_up', value: 3.0, multiplier: true }, price: 120000, tier: 4 },

    // 予兆察知系 (Nibble Fix)
    { id: 'nibble_fix_1', name: '予兆察知 I', description: 'ウキの揺れが常に3回になる', effect: { type: 'nibble_fix', value: 3 }, price: 400, tier: 1 },
    { id: 'nibble_fix_2', name: '予兆察知 II', description: 'ウキの揺れが常に2回になる', effect: { type: 'nibble_fix', value: 2 }, price: 1200, tier: 2 },
    { id: 'nibble_fix_3', name: '予兆察知 III', description: 'ウキの揺れが常に1回になる', effect: { type: 'nibble_fix', value: 1 }, price: 4000, tier: 3 },
    { id: 'nibble_fix_4', name: '神の的中 極', description: '即ヒット（ウキが揺れずに沈む）', effect: { type: 'nibble_fix', value: 0 }, price: 20000, tier: 4 },

    // 集中力 (Concentration) - ヒット受付時間延長
    { id: 'concentration_1', name: '集中力 I', description: 'HIT受付時間をベースの1.5倍に延長', effect: { type: 'hit_window_mult', value: 1.5 }, price: 300, tier: 1 },
    { id: 'concentration_2', name: '集中力 II', description: 'HIT受付時間をベースの2倍に延長', effect: { type: 'hit_window_mult', value: 2 }, price: 1200, tier: 2 },
    { id: 'concentration_3', name: '集中力 III', description: 'HIT受付時間をベースの3倍に延長', effect: { type: 'hit_window_mult', value: 3 }, price: 5000, tier: 3 },
    { id: 'concentration_4', name: '全神貫注 極', description: 'HIT受付時間をベースの5倍に延長', effect: { type: 'hit_window_mult', value: 5.0 }, price: 20000, tier: 4 },

    // 忍耐力 (Patience) - 待ち時間短縮
    { id: 'patience_1', name: '忍耐力 I', description: '待ち時間を10%短縮', effect: { type: 'wait_time_reduction', value: 0.1 }, price: 400, tier: 1 },
    { id: 'patience_2', name: '忍耐力 II', description: '待ち時間を25%短縮', effect: { type: 'wait_time_reduction', value: 0.25 }, price: 1500, tier: 2 },
    { id: 'patience_3', name: '忍耐力 III', description: '待ち時間を40%短縮', effect: { type: 'wait_time_reduction', value: 0.4 }, price: 4000, tier: 3 },
    { id: 'patience_4', name: '不倒不屈 極', description: '待ち時間を60%短縮', effect: { type: 'wait_time_reduction', value: 0.6 }, price: 15000, tier: 4 },

    // 早打ち (Quick Hit Penalty) - 時短・安売り
    { id: 'quick_hit_penalty_1', name: '早打ち I', description: 'ヒット待ち-15% & 売却価格-10%', effect: { type: 'quick_hit_penalty', waitReduc: 0.15, priceReduc: 0.1 }, price: 1000, tier: 1 },
    { id: 'quick_hit_penalty_2', name: '早打ち II', description: 'ヒット待ち-30% & 売却価格-20%', effect: { type: 'quick_hit_penalty', waitReduc: 0.3, priceReduc: 0.2 }, price: 3000, tier: 2 },
    { id: 'quick_hit_penalty_3', name: '早打ち III', description: 'ヒット待ち-50% & 売却価格-40%', effect: { type: 'quick_hit_penalty', waitReduc: 0.5, priceReduc: 0.4 }, price: 8000, tier: 3 },
    { id: 'quick_hit_penalty_4', name: '神速の安売り 極', description: 'ヒット待ち-75% & 売却価格-60%', effect: { type: 'quick_hit_penalty', waitReduc: 0.75, priceReduc: 0.6 }, price: 25000, tier: 4 },


    // 餌の達人 (Bait Master) - 餌消費回避
    { id: 'bait_master_1', name: '餌の達人 I', description: '釣り成功時、15%で餌を消費しない', effect: { type: 'bait_save', value: 0.15 }, price: 500, tier: 1 },
    { id: 'bait_master_2', name: '餌の達人 II', description: '釣り成功時、30%で餌を消費しない', effect: { type: 'bait_save', value: 0.3 }, price: 2000, tier: 2 },
    { id: 'bait_master_3', name: '餌の達人 III', description: '釣り成功時、50%で餌を消費しない', effect: { type: 'bait_save', value: 0.5 }, price: 6000, tier: 3 },
    { id: 'bait_master_4', name: '餌の達人 極', description: '釣り成功時、75%で餌を消費しない', effect: { type: 'bait_save', value: 0.75 }, price: 25000, tier: 4 },

    // テクニシャン (Technician) - 赤ゾーン拡大
    { id: 'technician_1', name: 'テクニシャン I', description: '赤ゾーンの幅が20%拡大', effect: { type: 'red_zone_boost', value: 0.2 }, price: 600, tier: 1 },
    { id: 'technician_2', name: 'テクニシャン II', description: '赤ゾーンの幅が40%拡大', effect: { type: 'red_zone_boost', value: 0.4 }, price: 2500, tier: 2 },
    { id: 'technician_3', name: 'テクニシャン III', description: '赤ゾーンの幅が60%拡大', effect: { type: 'red_zone_boost', value: 0.6 }, price: 7000, tier: 3 },
    { id: 'technician_4', name: 'テクニシャン 極', description: '赤ゾーンの幅が100%拡大', effect: { type: 'red_zone_boost', value: 1.0 }, price: 25000, tier: 4 },

    // 起死回生 (Second Chance) - 失敗を無効化
    { id: 'second_chance_1', name: '起死回生 I', description: '白ゾーンでの失敗時、10%で成功扱い', effect: { type: 'second_chance', value: 0.1 }, price: 800, tier: 1 },
    { id: 'second_chance_2', name: '起死回生 II', description: '白ゾーンでの失敗時、20%で成功扱い', effect: { type: 'second_chance', value: 0.2 }, price: 3000, tier: 2 },
    { id: 'second_chance_3', name: '起死回生 III', description: '白ゾーンでの失敗時、35%で成功扱い', effect: { type: 'second_chance', value: 0.35 }, price: 8000, tier: 3 },
    { id: 'second_chance_4', name: '起死回生 極', description: '白ゾーンでの失敗時、50%で成功扱い', effect: { type: 'second_chance', value: 0.5 }, price: 30000, tier: 4 },

    // 鑑定眼 (Appraisal) - 称号付き出現率
    { id: 'appraisal_1', name: '鑑定眼 I', description: '称号付きの出現確率が2倍', effect: { type: 'title_boost', value: 2 }, price: 1000, tier: 1 },
    { id: 'appraisal_2', name: '鑑定眼 II', description: '称号付きの出現確率が3倍', effect: { type: 'title_boost', value: 3 }, price: 3500, tier: 2 },
    { id: 'appraisal_3', name: '鑑定眼 III', description: '称号付きの出現確率が4倍', effect: { type: 'title_boost', value: 4 }, price: 9000, tier: 3 },
    { id: 'appraisal_4', name: '鑑定眼 極', description: '称号付きの出現確率が6倍', effect: { type: 'title_boost', value: 6 }, price: 35000, tier: 4 },

    // 大物狙い (Big Game Hunter) - 上位ランク出現率
    { id: 'big_game_hunter_1', name: '大物狙い I', description: '上位ランクの出現率が1.5倍', effect: { type: 'big_game_boost', value: 1.5 }, price: 1200, tier: 1 },
    { id: 'big_game_hunter_2', name: '大物狙い II', description: '上位ランクの出現率が2.5倍', effect: { type: 'big_game_boost', value: 2.5 }, price: 4500, tier: 2 },
    { id: 'big_game_hunter_3', name: '大物狙い III', description: '上位ランクの出現率が5.0倍', effect: { type: 'big_game_boost', value: 5.0 }, price: 12000, tier: 3 },
    { id: 'big_game_hunter_4', name: '大物狙い 極', description: '上位ランクの出現率が10倍', effect: { type: 'big_game_boost', value: 10.0 }, price: 45000, tier: 4 },

    // トレジャーハンター (Treasure Hunter) - 出現率
    { id: 'treasure_hunter_1', name: 'トレジャーハンター I', description: '宝箱出現率 +2%', effect: { type: 'treasure_boost', value: 0.02 }, price: 1500, tier: 1 },
    { id: 'treasure_hunter_2', name: 'トレジャーハンター II', description: '宝箱出現率 +5%', effect: { type: 'treasure_boost', value: 0.05 }, price: 5000, tier: 2 },
    { id: 'treasure_hunter_3', name: 'トレジャーハンター III', description: '宝箱出現率 +10%', effect: { type: 'treasure_boost', value: 0.1 }, price: 15000, tier: 3 },
    { id: 'treasure_hunter_4', name: '秘宝の予感 極', description: '宝箱出現率 +20%', effect: { type: 'treasure_boost', value: 0.2 }, price: 50000, tier: 4 },

    // フォーチュンハンター (Fortune Hunter) - 報酬量
    { id: 'fortune_hunter_1', name: 'フォーチュンハンター I', description: '宝箱報酬量 +20%', effect: { type: 'treasure_quantity', value: 0.2 }, price: 3000, tier: 1 },
    { id: 'fortune_hunter_2', name: 'フォーチュンハンター II', description: '宝箱報酬量 +50%', effect: { type: 'treasure_quantity', value: 0.5 }, price: 10000, tier: 2 },
    { id: 'fortune_hunter_3', name: 'フォーチュンハンター III', description: '宝箱報酬量 +100%', effect: { type: 'treasure_quantity', value: 1.0 }, price: 30000, tier: 3 },
    { id: 'fortune_hunter_4', name: '富の宝庫 極', description: '宝箱報酬量 +200%', effect: { type: 'treasure_quantity', value: 2.0 }, price: 80000, tier: 4 },

    // ラグジュアリーハンター (Luxury Hunter) - 報酬質
    { id: 'luxury_hunter_1', name: 'ラグジュアリーハンター I', description: '宝箱報酬質UP(小)', effect: { type: 'treasure_quality', value: 1.2 }, price: 5000, tier: 1 },
    { id: 'luxury_hunter_2', name: 'ラグジュアリーハンター II', description: '宝箱報酬質UP(中)', effect: { type: 'treasure_quality', value: 1.5 }, price: 20000, tier: 2 },
    { id: 'luxury_hunter_3', name: 'ラグジュアリーハンター III', description: '宝箱報酬質UP(大)', effect: { type: 'treasure_quality', value: 2.0 }, price: 50000, tier: 3 },
    { id: 'luxury_hunter_4', name: '至高の宝箱 極', description: '宝箱報酬質UP(特大)', effect: { type: 'treasure_quality', value: 3.0 }, price: 150000, tier: 4 },

    // 情熱 (Passion) - フィーバーゲージ蓄積
    { id: 'passion_1', name: '情熱 I', description: 'フィーバーゲージ蓄積率 +5%', effect: { type: 'fever_charge', value: 0.05 }, price: 2000, tier: 1 },
    { id: 'passion_2', name: '情熱 II', description: 'フィーバーゲージ蓄積率 +10%', effect: { type: 'fever_charge', value: 0.10 }, price: 8000, tier: 2 },
    { id: 'passion_3', name: '情熱 III', description: 'フィーバーゲージ蓄積率 +15%', effect: { type: 'fever_charge', value: 0.15 }, price: 25000, tier: 3 },
    { id: 'passion_4', name: '燃え盛る情熱 極', description: 'フィーバーゲージ蓄積率 +25%', effect: { type: 'fever_charge', value: 0.25 }, price: 60000, tier: 4 },

    // 熱狂 (Mania) - フィーバー延長
    { id: 'mania_1', name: '熱狂 I', description: 'フィーバー終了確率 -10%', effect: { type: 'fever_long', value: 0.10 }, price: 3000, tier: 1 },
    { id: 'mania_2', name: '熱狂 II', description: 'フィーバー終了確率 -20%', effect: { type: 'fever_long', value: 0.20 }, price: 12000, tier: 2 },
    { id: 'mania_3', name: '熱狂 III', description: 'フィーバー終了確率 -30%', effect: { type: 'fever_long', value: 0.30 }, price: 40000, tier: 3 },
    { id: 'mania_4', name: '冷めぬ熱狂 極', description: 'フィーバー終了確率 -50%', effect: { type: 'fever_long', value: 0.50 }, price: 100000, tier: 4 },

    // フィーバー偏向 (Fever Favor)
    { id: 'fever_bias_sun_1', name: '太陽の好意 I', description: 'おたからフィーバー確率 +10%', effect: { type: 'fever_bias_sun', value: 0.10 }, price: 5000, tier: 1 },
    { id: 'fever_bias_sun_2', name: '太陽の好意 II', description: 'おたからフィーバー確率 +20%', effect: { type: 'fever_bias_sun', value: 0.20 }, price: 15000, tier: 2 },
    { id: 'fever_bias_sun_3', name: '太陽の加護 (偏)', description: 'おたからフィーバー確率 +35%', effect: { type: 'fever_bias_sun', value: 0.35 }, price: 50000, tier: 3 },
    { id: 'fever_bias_sun_4', name: '太陽の寵愛 極', description: 'おたからフィーバー確率 +60%', effect: { type: 'fever_bias_sun', value: 0.60 }, price: 150000, tier: 4 },

    { id: 'fever_bias_moon_1', name: '月の好意 I', description: 'おさかなフィーバー確率 +10%', effect: { type: 'fever_bias_moon', value: 0.10 }, price: 5000, tier: 1 },
    { id: 'fever_bias_moon_2', name: '月の好意 II', description: 'おさかなフィーバー確率 +20%', effect: { type: 'fever_bias_moon', value: 0.20 }, price: 15000, tier: 2 },
    { id: 'fever_bias_moon_3', name: '月の加護 (偏)', description: 'おさかなフィーバー確率 +35%', effect: { type: 'fever_bias_moon', value: 0.35 }, price: 50000, tier: 3 },
    { id: 'fever_bias_moon_4', name: '月の寵愛 極', description: 'おさかなフィーバー確率 +60%', effect: { type: 'fever_bias_moon', value: 0.60 }, price: 150000, tier: 4 },

    // フィーバーリッチ (Fever Rich) - フィーバー中の宝箱
    { id: 'fever_treasure_boost_1', name: 'フィーバーリッチ I', description: 'フィーバー中の宝箱出現率 +10%', effect: { type: 'fever_treasure_boost', value: 0.1 }, price: 2000, tier: 1 },
    { id: 'fever_treasure_boost_2', name: 'フィーバーリッチ II', description: 'フィーバー中の宝箱出現率 +20%', effect: { type: 'fever_treasure_boost', value: 0.2 }, price: 8000, tier: 2 },
    { id: 'fever_treasure_boost_3', name: 'フィーバーリッチ III', description: 'フィーバー中の宝箱出現率 +35%', effect: { type: 'fever_treasure_boost', value: 0.35 }, price: 25000, tier: 3 },
    { id: 'fever_treasure_boost_4', name: '黄金の熱狂 極', description: 'フィーバー中の宝箱出現率 +60%', effect: { type: 'fever_treasure_boost', value: 0.6 }, price: 70000, tier: 4 },


    // 達人の針 (Perfect Master) - 赤ゾーン確定捕獲
    { id: 'perfect_master_1', name: '達人の針 I', description: 'ゲージ赤ゾーン停止時、捕獲率が50%になる', effect: { type: 'perfect_catch', value: 0.5 }, price: 5000, tier: 1 },
    { id: 'perfect_master_2', name: '達人の針 II', description: 'ゲージ赤ゾーン停止時、捕獲率が75%になる', effect: { type: 'perfect_catch', value: 0.75 }, price: 20000, tier: 2 },
    { id: 'perfect_master_3', name: '達人の針 III', description: 'ゲージ赤ゾーン停止時、捕獲率が100%になる', effect: { type: 'perfect_catch', value: 1.0 }, price: 100000, tier: 3 },
    { id: 'perfect_master_4', name: '神の指先 極', description: '赤ゾーン停止時100%捕獲 & 赤ゾーン幅+40%', effect: { type: 'perfect_catch', value: 1.0, extraRedZone: 0.4 }, price: 250000, tier: 4 },


    // ダブルキャッチ (Dual Catcher) - 2匹釣り
    { id: 'dual_catcher_1', name: 'ダブルキャッチ I', description: '20%の確率で魚が2匹釣れる', effect: { type: 'multi_catch_2', value: 0.20 }, price: 3000, tier: 1 },
    { id: 'dual_catcher_2', name: 'ダブルキャッチ II', description: '35%の確率で魚が2匹釣れる', effect: { type: 'multi_catch_2', value: 0.35 }, price: 10000, tier: 2 },
    { id: 'dual_catcher_3', name: 'ダブルキャッチ III', description: '50%の確率で魚が2匹釣れる', effect: { type: 'multi_catch_2', value: 0.50 }, price: 30000, tier: 3 },
    { id: 'dual_catcher_4', name: '二連釣 極', description: '80%の確率で魚が2匹釣れる', effect: { type: 'multi_catch_2', value: 0.80 }, price: 80000, tier: 4 },

    // トリプルキャッチ (Triple Catcher) - 3匹釣り
    { id: 'triple_catcher_1', name: 'トリプルキャッチ I', description: '5%の確率で魚が3匹釣れる', effect: { type: 'multi_catch_3', value: 0.05 }, price: 5000, tier: 1 },
    { id: 'triple_catcher_2', name: 'トリプルキャッチ II', description: '10%の確率で魚が3匹釣れる', effect: { type: 'multi_catch_3', value: 0.10 }, price: 20000, tier: 2 },
    { id: 'triple_catcher_3', name: 'トリプルキャッチ III', description: '20%の確率で魚が3匹釣れる', effect: { type: 'multi_catch_3', value: 0.20 }, price: 50000, tier: 3 },
    { id: 'triple_catcher_4', name: '三連釣 極', description: '40%の確率で魚が3匹釣れる', effect: { type: 'multi_catch_3', value: 0.40 }, price: 120000, tier: 4 },


    // 増幅の心得 (Skill Amplifier) - 他スキル効果アップ
    {
        id: 'amplifier_1',
        name: '増幅の心得 I',
        description: '他のスキル効果を1.2倍にする',
        effect: { type: 'skill_amplifier', value: 0.20 },
        price: 5000,
        tier: 1
    },
    {
        id: 'amplifier_2',
        name: '増幅の心得 II',
        description: '他のスキル効果を1.35倍にする',
        effect: { type: 'skill_amplifier', value: 0.35 },
        price: 15000,
        tier: 2
    },
    {
        id: 'amplifier_3',
        name: '増幅の心得 III',
        description: '他のスキル効果を1.5倍にする',
        effect: { type: 'skill_amplifier', value: 0.50 },
        price: 40000,
        tier: 3
    },
    {
        id: 'amplifier_4',
        name: '真理の増幅 極',
        description: '他のスキル効果を2倍にする',
        effect: { type: 'skill_amplifier', value: 1.0 },
        price: 150000,
        tier: 4
    },
    // ========================================
    // 港 (Port) 関連スキル
    // ========================================

    // 高速エンジン (Fast Engine) - 漁獲間隔短縮
    { id: 'ship_interval_down_1', name: '高速エンジン I', description: '漁獲間隔を10%短縮', effect: { type: 'ship_interval_down', value: 0.10 }, price: 5000, tier: 1 },
    { id: 'ship_interval_down_2', name: '高速エンジン II', description: '漁獲間隔を25%短縮', effect: { type: 'ship_interval_down', value: 0.25 }, price: 20000, tier: 2 },
    { id: 'ship_interval_down_3', name: '高速エンジン III', description: '漁獲間隔を45%短縮', effect: { type: 'ship_interval_down', value: 0.45 }, price: 60000, tier: 3 },
    { id: 'ship_interval_down_4', name: '超電磁エンジン 極', description: '漁獲間隔を70%短縮', effect: { type: 'ship_interval_down', value: 0.70 }, price: 180000, tier: 4 },

    // 大型網 (Large Net) - 漁獲量アップ
    { id: 'ship_amount_up_1', name: '大型網 I', description: '一度の漁獲量 +1〜2匹', effect: { type: 'ship_amount_up', min: 1, max: 2 }, price: 6000, tier: 1 },
    { id: 'ship_amount_up_2', name: '大型網 II', description: '一度の漁獲量 +3〜5匹', effect: { type: 'ship_amount_up', min: 3, max: 5 }, price: 25000, tier: 2 },
    { id: 'ship_amount_up_3', name: '大型網 III', description: '一度の漁獲量 +6〜10匹', effect: { type: 'ship_amount_up', min: 6, max: 10 }, price: 80000, tier: 3 },
    { id: 'ship_amount_up_4', name: '天を掬う網 極', description: '一度の漁獲量 +15〜25匹', effect: { type: 'ship_amount_up', min: 15, max: 25 }, price: 250000, tier: 4 },

    // エコ航行 (Eco Sailing) - 燃料消費回避
    { id: 'ship_fuel_eco_1', name: 'エコ航行 I', description: '20%の確率で燃料消費を回避', effect: { type: 'ship_fuel_eco', value: 0.20 }, price: 4000, tier: 1 },
    { id: 'ship_fuel_eco_2', name: 'エコ航行 II', description: '40%の確率で燃料消費を回避', effect: { type: 'ship_fuel_eco', value: 0.40 }, price: 15000, tier: 2 },
    { id: 'ship_fuel_eco_3', name: 'エコ航行 III', description: '60%の確率で燃料消費を回避', effect: { type: 'ship_fuel_eco', value: 0.60 }, price: 45000, tier: 3 },
    { id: 'ship_fuel_eco_4', name: '永久機関の夢 極', description: '90%の確率で燃料消費を回避', effect: { type: 'ship_fuel_eco', value: 0.90 }, price: 150000, tier: 4 },

    // 港の顔馴染み (Port Regular) - 燃料割引
    { id: 'ship_fuel_discount_1', name: '港の顔馴染み I', description: '燃料購入価格 15%割引', effect: { type: 'ship_fuel_discount', value: 0.15 }, price: 3000, tier: 1 },
    { id: 'ship_fuel_discount_2', name: '港の顔馴染み II', description: '燃料購入価格 30%割引', effect: { type: 'ship_fuel_discount', value: 0.30 }, price: 10000, tier: 2 },
    { id: 'ship_fuel_discount_3', name: '港の顔馴染み III', description: '燃料購入価格 50%割引', effect: { type: 'ship_fuel_discount', value: 0.50 }, price: 30000, tier: 3 },
    { id: 'ship_fuel_discount_4', name: '港の主 極', description: '燃料購入価格 80%割引', effect: { type: 'ship_fuel_discount', value: 0.80 }, price: 100000, tier: 4 },

    // 船乗りの勘 (Sailor's Intuition) - 船イベント
    { id: 'sailor_intuition_1', name: '船乗りの勘 I', description: 'ボートイベント出現率 +5%', effect: { type: 'boat_event_boost', value: 0.05 }, price: 2000, tier: 1 },
    { id: 'sailor_intuition_2', name: '船乗りの勘 II', description: 'ボートイベント出現率 +10%', effect: { type: 'boat_event_boost', value: 0.10 }, price: 8000, tier: 2 },
    { id: 'sailor_intuition_3', name: '船乗りの勘 III', description: 'ボートイベント出現率 +15%', effect: { type: 'boat_event_boost', value: 0.15 }, price: 25000, tier: 3 },
    { id: 'sailor_intuition_4', name: '七つの海の勘 極', description: 'ボートイベント出現率 +30%', effect: { type: 'boat_event_boost', value: 0.30 }, price: 80000, tier: 4 },

    // バードウォッチャー (Bird Watcher) - 鳥イベント
    { id: 'bird_watcher_1', name: 'バードウォッチャー I', description: '鳥イベント出現率 +5%', effect: { type: 'bird_event_boost', value: 0.05 }, price: 2000, tier: 1 },
    { id: 'bird_watcher_2', name: 'バードウォッチャー II', description: '鳥イベント出現率 +10%', effect: { type: 'bird_event_boost', value: 0.10 }, price: 8000, tier: 2 },
    { id: 'bird_watcher_3', name: 'バードウォッチャー III', description: '鳥イベント出現率 +15%', effect: { type: 'bird_event_boost', value: 0.15 }, price: 25000, tier: 3 },
    { id: 'bird_watcher_4', name: '天空の眼 極', description: '鳥イベント出現率 +30%', effect: { type: 'bird_event_boost', value: 0.30 }, price: 80000, tier: 4 },


    // ストイック (Stoic) - 経験値アップ重視
    { id: 'stoic_1', name: 'ストイック I', description: '獲得経験値 +20% & コイン -10%', effect: { type: 'stoic', exp: 0.2, coin: -0.1 }, price: 1500, tier: 1 },
    { id: 'stoic_2', name: 'ストイック II', description: '獲得経験値 +50% & コイン -20%', effect: { type: 'stoic', exp: 0.5, coin: -0.2 }, price: 6000, tier: 2 },
    { id: 'stoic_3', name: 'ストイック III', description: '獲得経験値 +100% & コイン -40%', effect: { type: 'stoic', exp: 1.0, coin: -0.4 }, price: 20000, tier: 3 },
    { id: 'stoic_4', name: '求道者 極', description: '獲得経験値 +200% & コイン -60%', effect: { type: 'stoic', exp: 2.0, coin: -0.6 }, price: 60000, tier: 4 },

    // 気楽な釣り人 (Casual Fisher) - 放置コイン重視
    { id: 'casual_fisher_1', name: 'カジュアル I', description: '放置コイン獲得率 +20%', effect: { type: 'log_coin_boost', value: 0.2 }, price: 1000, tier: 1 },
    { id: 'casual_fisher_2', name: 'カジュアル II', description: '放置コイン獲得率 +50%', effect: { type: 'log_coin_boost', value: 0.5 }, price: 4000, tier: 2 },
    { id: 'casual_fisher_3', name: 'カジュアル III', description: '放置コイン獲得率 +100%', effect: { type: 'log_coin_boost', value: 1.0 }, price: 12000, tier: 3 },
    { id: 'casual_fisher_4', name: 'エンジョイ 極', description: '放置コイン獲得率 +200%', effect: { type: 'log_coin_boost', value: 2.0 }, price: 40000, tier: 4 },

    // ========================================
    // 新規追加スキル群 (Mission / Risk / Eco / Etc)
    // ========================================

    // ミッション報酬増 (Mission Reward Up)
    { id: 'mission_reward_up_1', name: '報酬アップ I', description: 'ミッション報酬 +50%', effect: { type: 'mission_reward_up', value: 0.5 }, price: 800, tier: 1 },
    { id: 'mission_reward_up_2', name: '報酬アップ II', description: 'ミッション報酬 +100%', effect: { type: 'mission_reward_up', value: 1.0 }, price: 4000, tier: 2 },
    { id: 'mission_reward_up_3', name: '報酬アップ III', description: 'ミッション報酬 +200%', effect: { type: 'mission_reward_up', value: 2.0 }, price: 15000, tier: 3 },
    { id: 'mission_reward_up_4', name: 'ミッションの達人 極', description: 'ミッション報酬 +400% (5倍)', effect: { type: 'mission_reward_up', value: 4.0 }, price: 50000, tier: 4 },

    // ガチャミッション (Gacha Mission Up)
    { id: 'gacha_mission_up_1', name: 'ガチャの使命 I', description: '報酬がガチャチケのミッション率 +20%', effect: { type: 'gacha_mission_boost', value: 0.2 }, price: 4000, tier: 1 },
    { id: 'gacha_mission_up_2', name: 'ガチャの使命 II', description: '報酬がガチャチケのミッション率 +50%', effect: { type: 'gacha_mission_boost', value: 0.5 }, price: 15000, tier: 2 },
    { id: 'gacha_mission_up_3', name: 'ガチャの使命 III', description: '報酬がガチャチケのミッション率 +100%', effect: { type: 'gacha_mission_boost', value: 1.0 }, price: 40000, tier: 3 },
    { id: 'gacha_mission_up_4', name: '運命の導き 極', description: '報酬がガチャチケのミッション率 +200%', effect: { type: 'gacha_mission_boost', value: 2.0 }, price: 120000, tier: 4 },


    // リサイクル強化 (Recycle Boost)
    { id: 'recycle_boost_1', name: 'リサイクル強化 I', description: 'リサイクルの必要スキル数 -1', effect: { type: 'recycle_boost', costReduction: 1 }, price: 2000, tier: 1 },
    { id: 'recycle_boost_2', name: 'リサイクル強化 II', description: 'リサイクルの必要スキル数 -2', effect: { type: 'recycle_boost', costReduction: 2 }, price: 8000, tier: 2 },
    { id: 'recycle_boost_3', name: 'リサイクル強化 III', description: 'リサイクル時の獲得スキル数 +1', effect: { type: 'recycle_boost', gainBonus: 1 }, price: 25000, tier: 3 },
    { id: 'recycle_boost_4', name: 'エコの神様 極', description: 'リサイクル必要数-3 & 獲得数+2', effect: { type: 'recycle_boost', costReduction: 3, gainBonus: 2 }, price: 80000, tier: 4 },

    // 自動合わせ (Auto Hit)
    { id: 'auto_hit_1', name: '自動合わせ I', description: 'ウキ沈下時に15%で自動ヒット', effect: { type: 'auto_hit', chance: 0.15 }, price: 2000, tier: 1 },
    { id: 'auto_hit_2', name: '自動合わせ II', description: 'ウキ沈下時に30%で自動ヒット', effect: { type: 'auto_hit', chance: 0.3 }, price: 8000, tier: 2 },
    { id: 'auto_hit_3', name: '自動合わせ III', description: 'ウキ沈下時に50%で自動ヒット', effect: { type: 'auto_hit', chance: 0.5 }, price: 25000, tier: 3 },
    { id: 'auto_hit_4', name: '自動精密機器 極', description: 'ウキ沈下時に80%で自動ヒット', effect: { type: 'auto_hit', chance: 0.8 }, price: 80000, tier: 4 },

    // ショップ割引 (Shop Discount)
    { id: 'shop_discount_1', name: 'ショップ割引 I', description: 'ショップのアイテム価格 -10%', effect: { type: 'shop_discount', value: 0.1 }, price: 5000, tier: 1 },
    { id: 'shop_discount_2', name: 'ショップ割引 II', description: 'ショップのアイテム価格 -20%', effect: { type: 'shop_discount', value: 0.2 }, price: 20000, tier: 2 },
    { id: 'shop_discount_3', name: 'ショップ割引 III', description: 'ショップのアイテム価格 -30%', effect: { type: 'shop_discount', value: 0.3 }, price: 60000, tier: 3 },
    { id: 'shop_discount_4', name: 'お得意様 極', description: 'ショップのアイテム価格 -50%', effect: { type: 'shop_discount', value: 0.5 }, price: 180000, tier: 4 },


    // 強化割引 (Upgrade Discount)
    { id: 'upgrade_discount_1', name: '強化割引 I', description: 'ロッド強化費用 -10%', effect: { type: 'upgrade_discount', value: 0.1 }, price: 8000, tier: 1 },
    { id: 'upgrade_discount_2', name: '強化割引 II', description: 'ロッド強化費用 -20%', effect: { type: 'upgrade_discount', value: 0.2 }, price: 30000, tier: 2 },
    { id: 'upgrade_discount_3', name: '強化割引 III', description: 'ロッド強化費用 -30%', effect: { type: 'upgrade_discount', value: 0.3 }, price: 100000, tier: 3 },
    { id: 'upgrade_discount_4', name: '常連の極意 極', description: 'ロッド強化費用 -50%', effect: { type: 'upgrade_discount', value: 0.5 }, price: 300000, tier: 4 },


    // 加護系 (Blessing) - レベル上昇速度
    { id: 'sun_blessing_1', name: '太陽の加護 I', description: '太陽レベルの上昇速度が1.5倍', effect: { type: 'sun_blessing', value: 1.5 }, price: 2000, tier: 1 },
    { id: 'sun_blessing_2', name: '太陽の加護 II', description: '太陽レベルの上昇速度が2倍', effect: { type: 'sun_blessing', value: 2.0 }, price: 8000, tier: 2 },
    { id: 'sun_blessing_3', name: '太陽の加護 III', description: '太陽レベルの上昇速度が2.5倍', effect: { type: 'sun_blessing', value: 2.5 }, price: 30000, tier: 3 },
    { id: 'sun_blessing_4', name: '太陽の加護 極', description: '太陽レベルの上昇速度が3倍', effect: { type: 'sun_blessing', value: 3.0 }, price: 100000, tier: 4 },

    { id: 'moon_blessing_1', name: '月の加護 I', description: '月レベルの上昇速度が1.5倍', effect: { type: 'moon_blessing', value: 1.5 }, price: 2000, tier: 1 },
    { id: 'moon_blessing_2', name: '月の加護 II', description: '月レベルの上昇速度が2倍', effect: { type: 'moon_blessing', value: 2.0 }, price: 8000, tier: 2 },
    { id: 'moon_blessing_3', name: '月の加護 III', description: '月レベルの上昇速度が2.5倍', effect: { type: 'moon_blessing', value: 2.5 }, price: 30000, tier: 3 },
    { id: 'moon_blessing_4', name: '月の加護 極', description: '月レベルの上昇速度が3倍', effect: { type: 'moon_blessing', value: 3.0 }, price: 100000, tier: 4 },

    // 未登録魚探索 (New Fish Finder)
    { id: 'new_fish_finder_1', name: '未知への探求 I', description: '未登録魚率UP(小) & 待ち時間+40%', effect: { type: 'new_fish_finder', value: 1.5, waitIncrease: 0.4 }, price: 5000, tier: 1 },
    { id: 'new_fish_finder_2', name: '未知への探求 II', description: '未登録魚率UP(中) & 待ち時間+25%', effect: { type: 'new_fish_finder', value: 2.0, waitIncrease: 0.25 }, price: 15000, tier: 2 },
    { id: 'new_fish_finder_3', name: '未知への探求 III', description: '未登録魚率UP(大) & 待ち時間+10%', effect: { type: 'new_fish_finder', value: 3.0, waitIncrease: 0.1 }, price: 40000, tier: 3 },
    { id: 'new_fish_finder_4', name: '未知への探求 極', description: '未登録魚率UP(極) & デメリット消失', effect: { type: 'new_fish_finder', value: 5.0, waitIncrease: 0 }, price: 120000, tier: 4 },

    // 売却ガチャチケ (Sell Ticket Chance)
    { id: 'sell_ticket_chance_1', name: 'ラッキーセール I', description: '売却時に0.5%でガチャチケ獲得', effect: { type: 'sell_ticket_chance', value: 0.005 }, price: 3000, tier: 1 },
    { id: 'sell_ticket_chance_2', name: 'ラッキーセール II', description: '売却時に1.0%でガチャチケ獲得', effect: { type: 'sell_ticket_chance', value: 0.01 }, price: 10000, tier: 2 },
    { id: 'sell_ticket_chance_3', name: 'ラッキーセール III', description: '売却時に2.0%でガチャチケ獲得', effect: { type: 'sell_ticket_chance', value: 0.02 }, price: 30000, tier: 3 },
    { id: 'sell_ticket_chance_4', name: 'ラッキーセール 極', description: '売却時に5.0%でガチャチケ獲得', effect: { type: 'sell_ticket_chance', value: 0.05 }, price: 100000, tier: 4 },

    // カジノハイローラー (Casino High Roller)
    { id: 'casino_high_roller_1', name: 'ハイローラー I', description: 'カジノ倍率 1.2倍', effect: { type: 'casino_high_roller', value: 1.2 }, price: 5000, tier: 1 },
    { id: 'casino_high_roller_2', name: 'ハイローラー II', description: 'カジノ倍率 1.5倍', effect: { type: 'casino_high_roller', value: 1.5 }, price: 15000, tier: 2 },
    { id: 'casino_high_roller_3', name: 'ハイローラー III', description: 'カジノ倍率 2.0倍', effect: { type: 'casino_high_roller', value: 2.0 }, price: 50000, tier: 3 },
    { id: 'casino_high_roller_4', name: '世紀の勝負師 極', description: 'カジノ倍率 4.0倍', effect: { type: 'casino_high_roller', value: 4.0 }, price: 200000, tier: 4 },

    // マルチ系強化 (Extra / Multi Boosts)
    // マルチキャッチ (Multi Catch)
    { id: 'multi_catch_prob_1', name: '群れ追い I', description: '複数釣れる確率 +10%', effect: { type: 'multi_catch_prob', value: 0.1 }, price: 2000, tier: 1 },
    { id: 'multi_catch_prob_2', name: '群れ追い II', description: '複数釣れる確率 +20%', effect: { type: 'multi_catch_prob', value: 0.2 }, price: 8000, tier: 2 },
    { id: 'multi_catch_prob_3', name: '群れ追い III', description: '複数釣れる確率 +35%', effect: { type: 'multi_catch_prob', value: 0.35 }, price: 25000, tier: 3 },
    { id: 'multi_catch_prob_4', name: '百魚繚乱 極', description: '複数釣れる確率 +60%', effect: { type: 'multi_catch_prob', value: 0.6 }, price: 80000, tier: 4 },

    { id: 'multi_catch_num_1', name: '大量捕獲 I', description: '複数釣り数 +1', effect: { type: 'multi_catch_num', value: 1 }, price: 5000, tier: 1 },
    { id: 'multi_catch_num_2', name: '大量捕獲 II', description: '複数釣り数 +2', effect: { type: 'multi_catch_num', value: 2 }, price: 20000, tier: 2 },
    { id: 'multi_catch_num_3', name: '大量捕獲 III', description: '複数釣り数 +3', effect: { type: 'multi_catch_num', value: 3 }, price: 60000, tier: 3 },
    { id: 'multi_catch_num_4', name: '千成瓢箪 極', description: '複数釣り数 +5', effect: { type: 'multi_catch_num', value: 5 }, price: 180000, tier: 4 },

    // エクストラ系 (Extra Drops)
    // エクストラガチャ (Extra Gacha Drops)
    { id: 'extra_gacha_prob_1', name: 'チケットの釣り人 I', description: 'ガチャチケドロップ率 +1%', effect: { type: 'extra_gacha_prob', value: 0.01 }, price: 3000, tier: 1 },
    { id: 'extra_gacha_prob_2', name: 'チケットの釣り人 II', description: 'ガチャチケドロップ率 +3%', effect: { type: 'extra_gacha_prob', value: 0.03 }, price: 10000, tier: 2 },
    { id: 'extra_gacha_prob_3', name: 'チケットの釣り人 III', description: 'ガチャチケドロップ率 +6%', effect: { type: 'extra_gacha_prob', value: 0.06 }, price: 35000, tier: 3 },
    { id: 'extra_gacha_prob_4', name: '幸運の招待状 極', description: 'ガチャチケドロップ率 +12%', effect: { type: 'extra_gacha_prob', value: 0.12 }, price: 120000, tier: 4 },

    { id: 'extra_gacha_num_1', name: 'チケットボーナス I', description: '追加ガチャチケ数 +1', effect: { type: 'extra_gacha_num', value: 1 }, price: 5000, tier: 1 },
    { id: 'extra_gacha_num_2', name: 'チケットボーナス II', description: '追加ガチャチケ数 +2', effect: { type: 'extra_gacha_num', value: 2 }, price: 20000, tier: 2 },
    { id: 'extra_gacha_num_3', name: 'チケットボーナス III', description: '追加ガチャチケ数 +4', effect: { type: 'extra_gacha_num', value: 4 }, price: 60000, tier: 3 },
    { id: 'extra_gacha_num_4', name: '富豪の特権 極', description: '追加ガチャチケ数 +8', effect: { type: 'extra_gacha_num', value: 8 }, price: 180000, tier: 4 },

    {
        id: 'fever_coin_1',
        name: 'フィーバーコインUP I',
        description: 'フィーバー中の獲得コインが1.5倍',
        effect: { type: 'fever_bonus', value: 1.5 },
        price: 3000,
        tier: 1
    },
    {
        id: 'fever_coin_2',
        name: 'フィーバーコインUP II',
        description: 'フィーバー中の獲得コインが2.2倍',
        effect: { type: 'fever_bonus', value: 2.2 },
        price: 12000,
        tier: 2
    },
    {
        id: 'fever_coin_3',
        name: 'フィーバーコインUP III',
        description: 'フィーバー中の獲得コインが3倍',
        effect: { type: 'fever_bonus', value: 3.0 },
        price: 40000,
        tier: 3
    },
    {
        id: 'fever_coin_4',
        name: '究極の熱狂 極',
        description: 'フィーバー中の獲得コインが5倍',
        effect: { type: 'fever_bonus', value: 5.0 },
        price: 150000,
        tier: 4
    },
    // エクストラコイン (Extra Coin Drops)
    { id: 'extra_coin_prob_1', name: '小銭拾い I', description: 'コインドロップ率 +10%', effect: { type: 'extra_coin_prob', value: 0.1 }, price: 1000, tier: 1 },
    { id: 'extra_coin_prob_2', name: '小銭拾い II', description: 'コインドロップ率 +25%', effect: { type: 'extra_coin_prob', value: 0.25 }, price: 4000, tier: 2 },
    { id: 'extra_coin_prob_3', name: '小銭拾い III', description: 'コインドロップ率 +45%', effect: { type: 'extra_coin_prob', value: 0.45 }, price: 15000, tier: 3 },
    { id: 'extra_coin_prob_4', name: '黄金の導き 極', description: 'コインドロップ率 +70%', effect: { type: 'extra_coin_prob', value: 0.7 }, price: 50000, tier: 4 },

    { id: 'extra_coin_amount_1', name: '臨時収入 I', description: '追加コイン量 +50%', effect: { type: 'extra_coin_amount', value: 0.5 }, price: 3000, tier: 1 },
    { id: 'extra_coin_amount_2', name: '臨時収入 II', description: '追加コイン量 +100%', effect: { type: 'extra_coin_amount', value: 1.0 }, price: 10000, tier: 2 },
    { id: 'extra_coin_amount_3', name: '臨時収入 III', description: '追加コイン量 +200%', effect: { type: 'extra_coin_amount', value: 2.0 }, price: 35000, tier: 3 },
    { id: 'extra_coin_amount_4', name: '富の連鎖 極', description: '追加コイン量 +400%', effect: { type: 'extra_coin_amount', value: 4.0 }, price: 120000, tier: 4 },


    // ========================================
    // 所持数依存系 (Count Dependent)
    // ========================================

    // コレクター系 (Collector) - 所持数ボーナス
    { id: 'count_skill_multi_1', name: 'スキル愛好家 I', description: '所持スキル10個につき複数釣り数 +0.2', effect: { type: 'count_skill_multi', value: 0.02 }, price: 4000, tier: 1 },
    { id: 'count_skill_multi_2', name: 'スキル愛好家 II', description: '所持スキル10個につき複数釣り数 +0.5', effect: { type: 'count_skill_multi', value: 0.05 }, price: 15000, tier: 2 },
    { id: 'count_skill_multi_3', name: 'スキルコレクター III', description: '所持スキル10個につき複数釣り数 +1.0', effect: { type: 'count_skill_multi', value: 0.1 }, price: 40000, tier: 3 },
    { id: 'count_skill_multi_4', name: 'スキルマスター 極', description: '所持スキル10個につき複数釣り数 +2.0', effect: { type: 'count_skill_multi', value: 0.2 }, price: 120000, tier: 4 },

    { id: 'count_fish_gacha_1', name: '魚の知識 I', description: '所持魚10個につき追加ガチャチケ +0.2', effect: { type: 'count_fish_gacha', value: 0.02 }, price: 4000, tier: 1 },
    { id: 'count_fish_gacha_2', name: '魚の知識 II', description: '所持魚10個につき追加ガチャチケ +0.5', effect: { type: 'count_fish_gacha', value: 0.05 }, price: 15000, tier: 2 },
    { id: 'count_fish_gacha_3', name: '魚コレクター III', description: '所持魚10個につき追加ガチャチケ +1.0', effect: { type: 'count_fish_gacha', value: 0.1 }, price: 40000, tier: 3 },
    { id: 'count_fish_gacha_4', name: '魚類図鑑 極', description: '所持魚10個につき追加ガチャチケ +2.0', effect: { type: 'count_fish_gacha', value: 0.2 }, price: 120000, tier: 4 },

    { id: 'count_gacha_coin_1', name: 'チケットの重み I', description: '所持チケット10枚につき追加コイン +10%', effect: { type: 'count_gacha_coin', value: 0.01 }, price: 4000, tier: 1 },
    { id: 'count_gacha_coin_2', name: 'チケットの重み II', description: '所持チケット10枚につき追加コイン +25%', effect: { type: 'count_gacha_coin', value: 0.025 }, price: 15000, tier: 2 },
    { id: 'count_gacha_coin_3', name: 'チケット長者 III', description: '所持チケット10枚につき追加コイン +50%', effect: { type: 'count_gacha_coin', value: 0.05 }, price: 40000, tier: 3 },
    { id: 'count_gacha_coin_4', name: 'チケット王 極', description: '所持チケット10枚につき追加コイン +100%', effect: { type: 'count_gacha_coin', value: 0.1 }, price: 120000, tier: 4 },

    { id: 'count_fish_title_1', name: '称号への関心 I', description: '所持魚10個につき称号率 +0.5%', effect: { type: 'count_fish_title', value: 0.0005 }, price: 4000, tier: 1 },
    { id: 'count_fish_title_2', name: '称号への関心 II', description: '所持魚10個につき称号率 +1.5%', effect: { type: 'count_fish_title', value: 0.0015 }, price: 15000, tier: 2 },
    { id: 'count_fish_title_3', name: '称号コレクター III', description: '所持魚10個につき称号率 +3.0%', effect: { type: 'count_fish_title', value: 0.003 }, price: 40000, tier: 3 },
    { id: 'count_fish_title_4', name: '栄誉の集積 極', description: '所持魚10個につき称号率 +6.0%', effect: { type: 'count_fish_title', value: 0.006 }, price: 120000, tier: 4 },

    { id: 'count_skill_power_1', name: 'マナの共鳴 I', description: '所持スキル数に応じてパワーUP(小)', effect: { type: 'count_skill_power', value: 0.5 }, price: 3000, tier: 1 },
    { id: 'count_skill_power_2', name: 'マナの共鳴 II', description: '所持スキル数に応じてパワーUP(中)', effect: { type: 'count_skill_power', value: 1.0 }, price: 12000, tier: 2 },
    { id: 'count_skill_power_3', name: 'マナの共鳴 III', description: '所持スキル数に応じてパワーUP(大)', effect: { type: 'count_skill_power', value: 2.0 }, price: 40000, tier: 3 },
    { id: 'count_skill_power_4', name: 'マナの共鳴 極', description: '所持スキル数に応じてパワーUP(超)', effect: { type: 'count_skill_power', value: 3.5 }, price: 60000, tier: 4 },

    { id: 'count_gacha_sell_1', name: '券の価値 I', description: '所持ガチャチケ数に応じて売却価格UP(小)', effect: { type: 'count_gacha_sell', value: 0.05 }, price: 3000, tier: 1 },
    { id: 'count_gacha_sell_2', name: '券の価値 II', description: '所持ガチャチケ数に応じて売却価格UP(中)', effect: { type: 'count_gacha_sell', value: 0.1 }, price: 12000, tier: 2 },
    { id: 'count_gacha_sell_3', name: '券の価値 III', description: '所持ガチャチケ数に応じて売却価格UP(大)', effect: { type: 'count_gacha_sell', value: 0.2 }, price: 40000, tier: 3 },
    { id: 'count_gacha_sell_4', name: '券の価値 極', description: '所持ガチャチケ数に応じて売却価格UP(超)', effect: { type: 'count_gacha_sell', value: 0.35 }, price: 60000, tier: 4 },

    // ========================================
    // 特殊スキル (Special)
    // ========================================

    // スロット拡張 (Slot Expansion) - 宝箱限定
    { id: 'slot_expansion_1', name: '拡張モジュール I', description: 'スキルスロット数 +1', effect: { type: 'skill_slot_expansion', value: 1 }, price: 5000, tier: 1, isTreasureExclusive: true },
    { id: 'slot_expansion_2', name: '拡張モジュール II', description: 'スキルスロット数 +2', effect: { type: 'skill_slot_expansion', value: 2 }, price: 20000, tier: 2, isTreasureExclusive: true },
    { id: 'slot_expansion_3', name: '拡張モジュール III', description: 'スキルスロット数 +3', effect: { type: 'skill_slot_expansion', value: 3 }, price: 50000, tier: 3, isTreasureExclusive: true },
    { id: 'slot_expansion_4', name: '拡張モジュール 極', description: 'スキルスロット数 +5', effect: { type: 'skill_slot_expansion', value: 5 }, price: 120000, tier: 4, isTreasureExclusive: true },

    // ========================================
    // 伝説の特殊合成スキル (Legendary Special Synthesis)
    // ========================================

    // 神の力 (Godly Power) - パワーUP + 究極のリスク
    { id: 'godly_power_1', name: '神の力 I', description: 'パワー+50 & 失敗時ロスト率50%低減', effect: { type: 'godly_power', power: 50, safety: 0.5 }, price: 10000, tier: 1 },
    { id: 'godly_power_2', name: '神の力 II', description: 'パワー+80 & 失敗時ロスト率75%低減', effect: { type: 'godly_power', power: 80, safety: 0.75 }, price: 30000, tier: 2 },
    { id: 'godly_power_3', name: '神の力 III', description: 'パワー+120 & 失敗ペナルティを完全に無効化', effect: { type: 'godly_power', power: 120, safety: 1.0 }, price: 80000, tier: 3 },
    { id: 'godly_power_4', name: '創造主の権能 極', description: 'パワー+200 & ペナルティ無効 & パワー1.5倍', effect: { type: 'godly_power', power: 200, safety: 1.0, multiplier: 1.5 }, price: 250000, tier: 4 },

    // 黄金の指先 (Golden Touch) - 売値UP + 闇取引
    { id: 'golden_touch_1', name: '黄金の指先 I', description: '売値+50% & 闇取引の没収を50%回避', effect: { type: 'golden_touch', boost: 0.5, safety: 0.5 }, price: 10000, tier: 1 },
    { id: 'golden_touch_2', name: '黄金の指先 II', description: '売値+100% & 闇取引の没収を75%回避', effect: { type: 'golden_touch', boost: 1.0, safety: 0.75 }, price: 30000, tier: 2 },
    { id: 'golden_touch_3', name: '黄金の指先 III', description: '売値+200% & 闇取引のペナルティを無効化', effect: { type: 'golden_touch', boost: 2.0, safety: 1.0 }, price: 80000, tier: 3 },
    { id: 'golden_touch_4', name: 'ミダスの抱擁 極', description: '売値+400% & ペナルティ無効 & 全売却価格2倍', effect: { type: 'golden_touch', boost: 4.0, safety: 1.0, multiplier: 2.0 }, price: 250000, tier: 4 },

    // Master Angler - キャッチ率UP + テクニシャン
    { id: 'master_angler_1', name: 'Master Angler I', description: 'キャッチ率+30% & 赤ゾーン+50%', effect: { type: 'master_angler', catch: 0.3, redZone: 0.5 }, price: 10000, tier: 1 },
    { id: 'master_angler_2', name: 'Master Angler II', description: 'キャッチ率+50% & 赤ゾーン+100%', effect: { type: 'master_angler', catch: 0.5, redZone: 1.0 }, price: 30000, tier: 2 },
    { id: 'master_angler_3', name: 'Master Angler III', description: 'キャッチ率+80% & 赤ゾーン+150%', effect: { type: 'master_angler', catch: 0.8, redZone: 1.5 }, price: 80000, tier: 3 },
    { id: 'master_angler_4', name: '釣り神の領域 極', description: 'キャッチ率+150% & 赤ゾーン+300% & ゲージ低速化', effect: { type: 'master_angler', catch: 1.5, redZone: 3.0, slow: 0.5 }, price: 250000, tier: 4 },

    // 永遠の熱狂 (Eternal Fever) - 情熱の炎 + 熱狂の嵐
    { id: 'eternal_fever_1', name: '永遠の熱狂 I', description: 'フィーバー蓄積+50% & 継続率+30%', effect: { type: 'eternal_fever', charge: 0.5, sustain: 0.3 }, price: 10000, tier: 1 },
    { id: 'eternal_fever_2', name: '永遠の熱狂 II', description: 'フィーバー蓄積+100% & 継続率+60%', effect: { type: 'eternal_fever', charge: 1.0, sustain: 0.6 }, price: 30000, tier: 2 },
    { id: 'eternal_fever_3', name: '永遠の熱狂 III', description: 'フィーバー蓄積3倍 & フィーバーが減らなくなる', effect: { type: 'eternal_fever', charge: 2.0, sustain: 1.0 }, price: 80000, tier: 3 },
    { id: 'eternal_fever_4', name: '時を止める熱狂 極', description: '蓄積5倍 & 常時維持 & フィーバー報酬3倍', effect: { type: 'eternal_fever', charge: 4.0, sustain: 1.0, multiplier: 3.0 }, price: 250000, tier: 4 },

    // 宇宙の加護 (Cosmic Blessing) - 太陽の加護 + 月の加護
    { id: 'cosmic_blessing_1', name: '宇宙の加護 I', description: '太陽・月の加護を同時適用 (効果1.5倍)', effect: { type: 'cosmic_blessing', value: 1.5 }, price: 10000, tier: 1 },
    { id: 'cosmic_blessing_2', name: '宇宙の加護 II', description: '太陽・月の加護を同時適用 (効果2.5倍)', effect: { type: 'cosmic_blessing', value: 2.5 }, price: 30000, tier: 2 },
    { id: 'cosmic_blessing_3', name: '宇宙の加護 III', description: '太陽・月の加護を同時適用 (効果5倍)', effect: { type: 'cosmic_blessing', value: 5.0 }, price: 80000, tier: 3 },
    { id: 'cosmic_blessing_4', name: '天球の支配者 極', description: '全加護同時適用 (10倍) & 全レベル上昇速度2倍', effect: { type: 'cosmic_blessing', value: 10.0, speed: 2.0 }, price: 250000, tier: 4 },

];

/**
 * 特殊合成レシピ (Special Synthesis Recipes)
 * キー: 素材AのベースID + '+' + 素材BのベースID (アルファベット順)
 * 値: 生成される特殊スキルのベースID
 */
const SPECIAL_RECIPES = {
    'power_up+ultimate_risk': 'godly_power',
    'price_up+high_risk_sell': 'golden_touch',
    'catch_rate+technician': 'master_angler',
    'passion+mania': 'eternal_fever',
    'sun_blessing+moon_blessing': 'cosmic_blessing'
};

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
        quantity: 5
    }
];



// ========================================
// スキン（着せ替え）データ
// ========================================
const SKINS = [
    // ロッドアンロック系 (Shop/Unlock)
    {
        id: 'skin_default',
        name: 'ノーマル',
        rodColor: '#8B4513',
        bobberColor: '#ff0000',
        rodId: 'wooden_rod',
        description: '標準的な釣竿とウキのセット',
        tier: 1
    },
    {
        id: 'skin_bamboo',
        name: 'バンブー',
        rodColor: '#6B8E23',
        bobberColor: '#ADFF2F',
        rodId: 'bamboo_rod',
        description: '自然を感じる竹の色合い',
        tier: 1
    },
    {
        id: 'skin_carbon',
        name: 'カーボン',
        rodColor: '#2F4F4F',
        bobberColor: '#00CED1',
        rodId: 'carbon_rod',
        description: 'クールな黒と未来的な青',
        tier: 2
    },
    {
        id: 'skin_titanium',
        name: 'チタン',
        rodColor: '#C0C0C0',
        bobberColor: '#FFD700',
        rodId: 'titanium_rod',
        description: '高級感あふれる金属光沢',
        tier: 3
    },
    {
        id: 'skin_legendary',
        name: 'レジェンド',
        rodColor: '#800080',
        bobberColor: '#FF00FF',
        rodId: 'legendary_rod',
        description: '伝説の釣り人に相応しい神秘的な色',
        tier: 3
    },

    // ガチャ限定スキン
    {
        id: 'skin_neon',
        name: 'ネオンライト',
        rodColor: '#00ff00',
        bobberColor: '#ff00ff',
        description: '夜に輝くネオンカラー',
        tier: 2,
        isGachaExclusive: true
    },
    {
        id: 'skin_gold_rush',
        name: 'ゴールドラッシュ',
        rodColor: '#FFD700',
        bobberColor: '#DAA520',
        description: '全身が黄金に輝く成金仕様',
        tier: 3,
        isGachaExclusive: true
    },
    {
        id: 'skin_void',
        name: 'ヴォイド',
        rodColor: '#000000',
        bobberColor: '#4B0082',
        description: '光を吸収する漆黒のロッド',
        tier: 3,
        isGachaExclusive: true
    },
    {
        id: 'skin_cherry',
        name: '桜まつり',
        rodColor: '#FFB7C5',
        bobberColor: '#FF69B4',
        description: '春を感じさせる桜色',
        tier: 1,
        isGachaExclusive: true
    }
];
// ========================================
const GAUGE_CONFIG = {
    // ゲージの基本速度（ピクセル/フレーム）
    baseSpeed: 1.5,
    // パワー差による速度調整（差が小さいほど遅くなる）
    speedMultiplierMin: 1.0,
    speedMultiplierMax: 2.0,

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

    // 予兆（ウキ揺れ）の設定
    nibbleCountMin: 1,
    nibbleCountMax: 3,
    nibbleIntervalMin: 500,  // 0.5秒
    nibbleIntervalMax: 1500, // 1.5秒
    nibbleShakeDuration: 200, // 1回の揺れにかかる時間（ミリ秒）

    // ヒット判定可能時間（ミリ秒）
    hitWindowTime: 600,
    hitWindowByRarity: {
        D: 800,
        C: 600,
        B: 500,
        A: 400,
        S: 350
    },

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
    S: 0.01,
    SS: 0.005
};

// ========================================
// ガチャ設定
// ========================================
const GACHA_CONFIG = {
    BRONZE: { single: 1000, ten: 9000, ticket: 1, rates: { tier1: 85, tier2: 14, tier3: 1, special: 0 } },
    SILVER: { single: 8000, ten: 72000, ticket: 8, rates: { tier1: 15, tier2: 75, tier3: 10, special: 0.1 } },
    GOLD: { single: 30000, ten: 250000, ticket: 30, rates: { tier1: 0, tier2: 20, tier3: 75, special: 5 } }
};

// ========================================
// リサイクルガチャ（エコ・ボックス）出現率
// ========================================
const RECYCLE_RATES = {
    tier1: 40,
    tier2: 50,
    tier3: 9,
    tier4: 1 // 実質Tier 3 (special)
};

// ========================================
// 宝箱設定
// ========================================
const TREASURE_CONFIG = {
    baseChance: 0.05, // 5%の確率で出現
    rarityWeights: {
        WOOD: 0.7,   // 木: 70% (D相当)
        SILVER: 0.25, // 銀: 25% (B相当)
        GOLD: 0.05    // 金: 5% (S相当)
    },
    chestData: {
        WOOD: { name: '木の宝箱', power: 30, rarity: 'D', icon: 'inventory_2', description: '古びた木製の宝箱。中身は...' },
        SILVER: { name: '銀の宝箱', power: 80, rarity: 'B', icon: 'lock', description: '装飾が施された銀色の宝箱。期待できそう。' },
        GOLD: { name: '金の宝箱', power: 150, rarity: 'S', icon: 'diamond', description: '眩い輝きを放つ純金の宝箱。最高のお宝が入っているかも！' }
    },
    lootTables: {
        WOOD: {
            money: { min: 100, max: 500 },
            baits: [
                { id: 'bait_c', min: 1, max: 3, weight: 0.8 },
                { id: 'bait_b', min: 1, max: 1, weight: 0.2 }
            ],
            skills: [
                { tier: 1, chance: 0.15 } // 15%でTier1スキル
            ]
        },
        SILVER: {
            money: { min: 1000, max: 3000 },
            baits: [
                { id: 'bait_b', min: 2, max: 5, weight: 0.6 },
                { id: 'bait_a', min: 1, max: 2, weight: 0.4 }
            ],
            skills: [
                { tier: 1, chance: 0.2 }, // 20%でTier1スキル
                { tier: 2, chance: 0.15 } // 15%でTier2スキル
            ]
        },
        GOLD: {
            money: { min: 5000, max: 15000 },
            baits: [
                { id: 'bait_s', min: 1, max: 3, weight: 1.0 }
            ],
            skills: [
                { tier: 2, chance: 0.4 }, // 40%でTier2スキル
                { tier: 3, chance: 0.2 }  // 20%でTier3スキル
            ]
        }
    }
};


// ========================================
// 空（背景）データ
// ========================================
const SKIES = [
    {
        id: 'sky_default',
        name: '青空',
        price: 0,
        description: 'いつもの爽やかな青空',
        colors: ['#87CEEB', '#7dd3fc']
    },
    {
        id: 'sky_sunset',
        name: '夕焼け',
        price: 5000,
        colors: ['#ff7e5f', '#feb47b'],
        description: 'ロマンチックな夕暮れ',
        tier: 2
    },
    {
        id: 'sky_night',
        name: '星空',
        price: 15000,
        colors: ['#0f2027', '#203a43'],
        description: '静寂に包まれた夜',
        tier: 2
    },
    {
        id: 'sky_aurora',
        name: 'オーロラ',
        price: 50000,
        colors: ['#1e1b4b', '#22d3ee'],
        description: '幻想的な北国の空',
        tier: 3
    },

    // ガチャ限定
    {
        id: 'sky_galaxy',
        name: '銀河',
        colors: ['#2c3e50', '#4ca1af'],
        description: '宇宙の広がりを感じる',
        tier: 3,
        isGachaExclusive: true
    },
    {
        id: 'sky_storm',
        name: '嵐',
        colors: ['#373B44', '#4286f4'],
        description: '荒れ狂う嵐の空',
        tier: 2,
        isGachaExclusive: true
    },
    {
        id: 'sky_cherry',
        name: '桜空',
        colors: ['#ffe259', '#ffa751'],
        description: '舞い散る花びら',
        tier: 1,
        isGachaExclusive: true
    }
];

// ========================================
// 港（Port）データ - 漁船
// ========================================
const SHIPS = [
    {
        id: 'ship_small',
        name: '小型漁船',
        price: 10000,
        capacity: 20,
        catchAmountRange: [1, 3],
        maxRarity: 'C',
        description: '近海漁業用の小型船。小回りが利く。',
        description: '近海漁業用の小型船。小回りが利く。',
        fishingInterval: 300000, // 5分
        fuelConsumption: 1 // 1分あたりの燃料消費量
    },
    {
        id: 'ship_medium',
        name: '中型漁船',
        price: 100000,
        capacity: 50,
        catchAmountRange: [4, 8],
        maxRarity: 'B',
        description: '多少の荒波にも耐える中型船。',
        description: '多少の荒波にも耐える中型船。',
        fishingInterval: 300000, // 5分
        fuelConsumption: 2 // 1分あたりの燃料消費量
    },
    {
        id: 'ship_large',
        name: '大型漁船',
        price: 500000,
        capacity: 150,
        catchAmountRange: [10, 20],
        maxRarity: 'S',
        description: '遠洋漁業も可能な大型船。大量の魚を積載可能。',
        description: '遠洋漁業も可能な大型船。大量の魚を積載可能。',
        fishingInterval: 300000, // 5分
        fuelConsumption: 3 // 1分あたりの燃料消費量
    }
];

// ========================================
// 港（Port）データ - 燃料
// ========================================
const FUELS = [
    {
        id: 'fuel_regular',
        name: 'レギュラー燃料',
        recovery: 30, // 30分回復
        price: 500
    },
    {
        id: 'fuel_high',
        name: 'ハイオク燃料',
        recovery: 60, // 60分回復
        price: 1200
    },
    {
        id: 'fuel_max',
        name: 'マックス燃料',
        recovery: 180, // 180分(3時間)回復
        price: 5000
    }
];

// エクスポート用（グローバル変数として使用）
if (typeof window !== 'undefined') {
    window.GAME_DATA = {
        RODS,
        FISH,
        SKILLS,
        BAITS,
        GAUGE_CONFIG,
        FISHING_CONFIG,
        RARITY_WEIGHTS,
        TITLE_CONFIG,
        GACHA_CONFIG,
        RECYCLE_RATES,
        TREASURE_CONFIG,
        SKINS,
        SKIES,
        SHIPS,
        FUELS,
        SPECIAL_RECIPES
    };
}
