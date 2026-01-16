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
        upgradeCosts: [100, 250, 500, 1000, 2500], // 星1〜5への強化費用
        description: '初心者向けの木製釣竿'
    },
    {
        id: 'bamboo_rod',
        name: '竹の釣竿',
        basePower: 22,
        starPowerBonus: 5,
        price: 500,
        upgradeCosts: [500, 1200, 2500, 5000, 10000],
        description: 'しなやかで扱いやすい竹製釣竿'
    },
    {
        id: 'carbon_rod',
        name: 'カーボン釣竿',
        basePower: 42,
        starPowerBonus: 8,
        price: 2000,
        upgradeCosts: [2500, 6000, 12000, 25000, 50000],
        description: '軽量で強度に優れたカーボン製'
    },
    {
        id: 'titanium_rod',
        name: 'チタン釣竿',
        basePower: 74,
        starPowerBonus: 12,
        price: 8000,
        upgradeCosts: [10000, 25000, 50000, 100000, 200000],
        description: '最高級のチタン合金製釣竿'
    },
    {
        id: 'legendary_rod',
        name: '伝説の釣竿',
        basePower: 122,
        starPowerBonus: 20,
        price: 30000,
        upgradeCosts: [50000, 120000, 300000, 600000, 800000],
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
        id: 'fish_d9', name: 'オタマジャクシ', power: 4, price: 5, rarity: 'D', weight: 20, specialTitle: '明日に夢見る', icon: 'spa',
        description: 'カエルの子供。もうすぐ足が生えてくるかもしれない。',
        titleDescription: 'いつか大空を飛ぶことを夢見続けている、ロマンチストなオタマジャクシ。'
    },
    {
        id: 'fish_d1', name: 'メダカ', power: 5, price: 10, rarity: 'D', weight: 15, specialTitle: '水たまりの', icon: 'water_drop',
        description: '小さな淡水魚。群れで泳ぐ姿が可愛らしい。',
        titleDescription: '水たまりの主として君臨する巨大メダカ。'
    },
    {
        id: 'fish_d2', name: 'フナ', power: 6, price: 15, rarity: 'D', weight: 15, specialTitle: '泥まみれの', icon: 'set_meal',
        description: '日本の河川でよく見られる魚。釣りはフナに始まりフナに終わると言われる。',
        titleDescription: '泥の中を這い回り、たくましく生き抜いた伝説のフナ。'
    },
    {
        id: 'fish_d3', name: 'クチボソ', power: 7, price: 20, rarity: 'D', weight: 12, specialTitle: '小生意気な', icon: 'water_drop',
        description: '口が細いことからこの名がついた。すばしっこい。',
        titleDescription: '釣り人を翻弄する、非常に小生意気な性格をしたクチボソ。'
    },
    {
        id: 'fish_d4', name: 'ヌマエビ', power: 8, price: 25, rarity: 'D', weight: 10, specialTitle: '透き通った', icon: 'pest_control',
        description: '水草の間を動き回る小さなエビ。透き通った体が特徴。',
        titleDescription: '驚くべき透明度を誇り、水に溶け込むかのようなヌマエビ。'
    },
    {
        id: 'fish_d6', name: 'ハゼ', power: 10, price: 35, rarity: 'D', weight: 10, specialTitle: '砂底の', icon: 'set_meal',
        description: '砂泥底に生息する愛嬌のある顔をした魚。天ぷらが美味しい。',
        titleDescription: '砂底の支配者として、海底から全てを見通すハゼ。'
    },
    {
        id: 'fish_d5', name: 'ザリガニ', power: 9, price: 30, rarity: 'D', weight: 8, specialTitle: '真紅の鋏の', icon: 'pest_control',
        description: '大きなハサミを持つ淡水の甲殻類。後ろ向きに泳ぐのが得意。',
        titleDescription: '鉄をも断ち切る真紅のハサミを持つ、恐るべきザリガニ。'
    },
    {
        id: 'fish_d7', name: 'タナゴ', power: 11, price: 40, rarity: 'D', weight: 5, specialTitle: '虹色に輝く', icon: 'palette',
        description: '美しい婚姻色を持つことで知られる淡水魚。',
        titleDescription: '七色に輝く鱗を持ち、見る者を魅了する幻のタナゴ。'
    },
    {
        id: 'fish_d8', name: 'ドジョウ', power: 12, price: 45, rarity: 'D', weight: 5, specialTitle: 'ぬるぬるした', icon: 'gesture',
        description: '細長い体で泥の中を泳ぐ。ひげがチャームポイント。',
        titleDescription: '捕まえようとしても手から滑り落ちる、究極のぬるぬるを持つドジョウ。'
    },

    // Cランク (8種)
    {
        id: 'fish_c7', name: 'ブルーギル', power: 14, price: 50, rarity: 'C', weight: 25, specialTitle: '青い鱗の', icon: 'water',
        description: '青みがかった体色が特徴。繁殖力が強い。',
        titleDescription: '神秘的な青い輝きを放つ、突然変異種のブルーギル。'
    },
    {
        id: 'fish_c8', name: 'ウグイ', power: 12, price: 40, rarity: 'C', weight: 20, specialTitle: 'どこにでも居る', icon: 'set_meal',
        description: '酸性水にも強い生命力を持つ魚。婚姻色は鮮やかな朱色になる。',
        titleDescription: '世界中どこへ行っても遭遇する、神出鬼没のウグイ。'
    },
    {
        id: 'fish_c4', name: 'コイ', power: 22, price: 100, rarity: 'C', weight: 15, specialTitle: '大河の主候補', icon: 'set_meal',
        description: '生命力が非常に強く、長生きする魚。滝を登ると龍になると言われる。',
        titleDescription: '龍になる直前、強大な力を秘めた大河の主候補。'
    },
    {
        id: 'fish_c1', name: 'アユ', power: 15, price: 60, rarity: 'C', weight: 12, specialTitle: '清流の', icon: 'waves',
        description: '清流に住む魚。独特の香気があり、香魚とも呼ばれる。',
        titleDescription: '最も清らかな水にしか住まない、高貴な香りを放つアユ。'
    },
    {
        id: 'fish_c5', name: 'ニジマス', power: 25, price: 120, rarity: 'C', weight: 10, specialTitle: '宝石を纏った', icon: 'diamond',
        description: '体側に虹色の帯があるのが特徴。釣りの対象として人気が高い。',
        titleDescription: '全身が宝石のように輝き、見る者を魅了するニジマス。'
    },
    {
        id: 'fish_c6', name: 'ブラックバス', power: 28, price: 150, rarity: 'C', weight: 8, specialTitle: '湖の暴君', icon: 'gavel',
        description: '北米原産の肉食魚。引きが強く、ゲームフィッシングで人気。',
        titleDescription: '湖の生態系を支配する、圧倒的な力を持った暴君バス。'
    },
    {
        id: 'fish_c2', name: 'イワナ', power: 18, price: 75, rarity: 'C', weight: 5, specialTitle: '岩陰の紳士', icon: 'landscape',
        description: '河川の最上流部に生息する。貪欲な肉食性を持つ。',
        titleDescription: '岩陰から虎視眈々と獲物を狙う、冷徹な紳士イワナ。'
    },
    {
        id: 'fish_c3', name: 'ヤマメ', power: 20, price: 90, rarity: 'C', weight: 5, specialTitle: '渓流の女王', icon: 'filter_hdr',
        description: '体のパーマークが美しい、渓流の女王と呼ばれる魚。',
        titleDescription: 'その美しさで釣り人を惑わす、真の渓流の女王。'
    },

    // Bランク (7種)
    {
        id: 'fish_b7', name: 'ボラ', power: 28, price: 180, rarity: 'B', weight: 25, specialTitle: '海辺の跳躍者', icon: 'flight',
        description: 'よく水面からジャンプする姿が見られる。卵巣はカラスミになる。',
        titleDescription: '大空へ飛び出すことを夢見て、限界まで跳躍するボラ。'
    },
    {
        id: 'fish_b6', name: 'カツオ', power: 30, price: 200, rarity: 'B', weight: 20, specialTitle: '一本釣りの', icon: 'phishing',
        description: '高速で泳ぎ続ける回遊魚。たたきが絶品。',
        titleDescription: '誰にも止められない速度で海を駆け抜ける、弾丸カツオ。'
    },
    {
        id: 'fish_b5', name: 'サワラ', power: 55, price: 450, rarity: 'B', weight: 15, specialTitle: '春を告げる', icon: 'local_florist',
        description: '細長い体が特徴の大型肉食魚。春の訪れを告げる魚。',
        titleDescription: '春風と共に現れ、全てを置き去りにする疾風のサワラ。'
    },
    {
        id: 'fish_b4', name: 'スズキ', power: 50, price: 400, rarity: 'B', weight: 15, specialTitle: '出世を夢見る', icon: 'trending_up',
        description: '汽水域から海水域まで広く生息する。ルアーフィッシングの好敵手。',
        titleDescription: '海を支配する野望を持ち、貪欲に成長を続けるスズキ。'
    },
    {
        id: 'fish_b3', name: 'ブリ', power: 45, price: 350, rarity: 'B', weight: 10, specialTitle: '荒波に揉まれた', icon: 'tsunami',
        description: '成長するにつれて名前が変わる出世魚。冬の味覚。',
        titleDescription: '幾多の荒波を乗り越え、最強の身体を手に入れたブリ。'
    },
    {
        id: 'fish_b2', name: 'ヒラメ', power: 40, price: 300, rarity: 'B', weight: 8, specialTitle: '砂漠の忍者の', icon: 'visibility_off',
        description: '海底の砂に隠れて獲物を待つ。高級魚としても知られる。',
        titleDescription: '砂と完全に同化し、獲物を瞬殺する砂漠の忍者ヒラメ。'
    },
    {
        id: 'fish_b1', name: 'タイ', power: 35, price: 250, rarity: 'B', weight: 7, specialTitle: '目出度い', icon: 'celebration',
        description: '「めでたい」に通じる縁起の良い魚。味も姿も一級品。',
        titleDescription: '祝いの席には欠かせない、光り輝く最高級のタイ。'
    },

    // Aランク (6種)
    {
        id: 'fish_a5', name: 'エイ', power: 60, price: 700, rarity: 'A', weight: 30, specialTitle: '海を舞う', icon: 'paragliding',
        description: '平べったい体と長い尾が特徴。優雅に泳ぐ姿は空飛ぶ絨毯のよう。',
        titleDescription: '海中を優雅に舞い、毒針すらも美しい芸術的なエイ。'
    },
    {
        id: 'fish_a1', name: 'マグロ', power: 70, price: 800, rarity: 'A', weight: 25, specialTitle: '大海を駆ける', icon: 'speed',
        description: '海の王様とも呼ばれる大型回遊魚。その巨体は高速で泳ぐための筋肉の塊。',
        titleDescription: '七つの海を制覇し、止まることを知らない海の帝王マグロ。'
    },
    {
        id: 'fish_a3', name: 'ウナギ', power: 65, price: 1000, rarity: 'A', weight: 15, specialTitle: '精力のつく', icon: 'bolt',
        description: '長い旅をして川に戻ってくる神秘的な魚。蒲焼きは日本の伝統食。',
        titleDescription: '無限のスタミナを秘め、食べた者に活力を与える伝説のウナギ。'
    },
    {
        id: 'fish_a2', name: 'カジキ', power: 85, price: 1200, rarity: 'A', weight: 12, specialTitle: '水中の狙撃手', icon: 'gps_fixed',
        description: '鋭く尖った吻が特徴。世界最速の魚類の一つ。',
        titleDescription: '狙った獲物は逃がさない、海のスナイパーとして恐れられるカジキ。'
    },
    {
        id: 'fish_a4', name: 'クエ', power: 95, price: 1500, rarity: 'A', weight: 10, specialTitle: '幻の磯の主', icon: 'workspace_premium',
        description: '磯の王者と呼ばれるハタ科の大型魚。味は絶品だが、釣るのは非常に困難。',
        titleDescription: '滅多に姿を現さない、幻の中の幻と呼ばれる究極のクエ。'
    },
    {
        id: 'fish_a6', name: 'チョウザメ', power: 110, price: 2000, rarity: 'A', weight: 8, specialTitle: 'キャビアを産む', icon: 'egg_alt',
        description: '古代魚の姿を残す大型魚。世界三大珍味の一つキャビアの親。',
        titleDescription: '黄金のキャビアをその身に宿す、生きた宝石箱チョウザメ。'
    },

    // Sランク (5種)
    {
        id: 'fish_s3', name: '大王イカ', power: 120, price: 4000, rarity: 'S', weight: 40, specialTitle: '全てを呑み込む', icon: 'hub',
        description: '世界最大級の無脊椎動物。深海の怪物クラーケンの正体とされる。',
        titleDescription: 'その巨大な触手で船さえも沈めると噂される、深海の悪魔。'
    },
    {
        id: 'fish_s1', name: 'シーラカンス', power: 130, price: 5000, rarity: 'S', weight: 25, specialTitle: '太古より目覚めし', icon: 'history',
        description: '数億年前から姿を変えていない「生きた化石」。深海にひっそりと生息する。',
        titleDescription: '悠久の時を超えて現代に蘇った、歴史の証人たるシーラカンス。'
    },
    {
        id: 'fish_s2', name: 'リュウグウノツカイ', power: 150, price: 8000, rarity: 'S', weight: 20, specialTitle: '深海よりの使者', icon: 'scuba_diving',
        description: '銀色の長い体と赤い鰭が美しい深海魚。人魚のモデルとも言われる。',
        titleDescription: '竜宮城からのメッセージを携え、深海から現れた神秘の使者。'
    },
    {
        id: 'fish_s4', name: '黄金のタイ', power: 140, price: 10000, rarity: 'S', weight: 10, specialTitle: '伝説の輝きを放つ', icon: 'star',
        description: '全身が黄金に輝く伝説のタイ。釣り上げた者に巨万の富をもたらす。',
        titleDescription: '太陽の如き輝きを放ち、見る者全ての運命を変える神の使い。'
    },
    {
        id: 'fish_s5', name: '伝説の海龍', power: 200, price: 30000, rarity: 'S', weight: 5, specialTitle: '天を統べし', icon: 'token',
        description: 'あらゆる海洋生物の頂点に立つ龍。その姿を見た者はいないとされる。',
        titleDescription: '海だけでなく天候さえも操る、神話の世界から現れた絶対的な存在。'
    },

    // SSランク (2種)
    {
        id: 'fish_ss1', name: '伝説のクラーケン', power: 250, price: 50000, rarity: 'SS', weight: 0.05, specialTitle: '深海よりの厄災', icon: 'storm',
        description: '船を襲い海に引きずり込むと言われる伝説の巨大生物。複数の触手を持つ。',
        titleDescription: '全ての船乗りに恐れられ、海そのものの怒りを具現化したかのような厄災。'
    },
    {
        id: 'fish_ss2', name: 'リヴァイアサン', power: 300, price: 80000, rarity: 'SS', weight: 0.02, specialTitle: '世界を飲み込む', icon: 'all_inclusive',
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
    {
        id: 'power_up_1',
        name: 'パワーUP I',
        description: '釣りパワー+5',
        effect: { type: 'power_boost', value: 5 },
        price: 200,
        tier: 1
    },
    {
        id: 'power_up_2',
        name: 'パワーUP II',
        description: '釣りパワー+15',
        effect: { type: 'power_boost', value: 15 },
        price: 800,
        tier: 2
    },
    {
        id: 'power_up_3',
        name: 'パワーUP III',
        description: '釣りパワー+30',
        effect: { type: 'power_boost', value: 30 },
        price: 2500,
        tier: 3
    },

    // ゲージ減速系
    {
        id: 'gauge_slow_1',
        name: 'ゲージ減速 I',
        description: 'ゲージ速度-10%',
        effect: { type: 'gauge_slow', value: 0.1 },
        price: 300,
        tier: 1
    },
    {
        id: 'gauge_slow_2',
        name: 'ゲージ減速 II',
        description: 'ゲージ速度-20%',
        effect: { type: 'gauge_slow', value: 0.2 },
        price: 1000,
        tier: 2
    },

    // 価格アップ系
    {
        id: 'price_up_1',
        name: '売値UP I',
        description: '魚の売却価格+10%',
        effect: { type: 'price_boost', value: 0.1 },
        price: 400,
        tier: 1
    },
    {
        id: 'price_up_2',
        name: '売値UP II',
        description: '魚の売却価格+25%',
        effect: { type: 'price_boost', value: 0.25 },
        price: 1500,
        tier: 2
    },

    // 成功率アップ系
    {
        id: 'catch_rate_1',
        name: 'キャッチ率UP I',
        description: '捕獲確率+5%',
        effect: { type: 'catch_boost', value: 0.05 },
        price: 500,
        tier: 1
    },
    {
        id: 'catch_rate_2',
        name: 'キャッチ率UP II',
        description: '捕獲確率+15%',
        effect: { type: 'catch_boost', value: 0.15 },
        price: 2000,
        tier: 2
    },

    // レア度アップ系
    {
        id: 'rare_up_1',
        name: 'レア魚UP I',
        description: 'レア魚出現率+20%',
        effect: { type: 'rare_boost', value: 0.2 },
        price: 600,
        tier: 1
    },

    // 予兆察知系
    {
        id: 'nibble_fix',
        name: '予兆察知',
        description: 'ウキの揺れが常に2回になる',
        effect: { type: 'nibble_fix', value: 2 },
        price: 1200,
        tier: 2
    },

    // 集中力 (Concentration)
    {
        id: 'concentration_1',
        name: '集中力 I',
        description: 'HIT受付時間をベースの1.5倍に延長',
        effect: { type: 'hit_window_mult', value: 1.5 },
        price: 300,
        tier: 1
    },
    {
        id: 'concentration_2',
        name: '集中力 II',
        description: 'HIT受付時間をベースの2倍に延長',
        effect: { type: 'hit_window_mult', value: 2 },
        price: 1200,
        tier: 2
    },
    {
        id: 'concentration_3',
        name: '集中力 III',
        description: 'HIT受付時間をベースの3倍に延長',
        effect: { type: 'hit_window_mult', value: 3 },
        price: 5000,
        tier: 3
    },

    // 忍耐力 (Patience)
    {
        id: 'patience_1',
        name: '忍耐力 I',
        description: '待ち時間を10%短縮',
        effect: { type: 'wait_time_reduction', value: 0.1 },
        price: 400,
        tier: 1
    },
    {
        id: 'patience_2',
        name: '忍耐力 II',
        description: '待ち時間を25%短縮',
        effect: { type: 'wait_time_reduction', value: 0.25 },
        price: 1500,
        tier: 2
    },
    {
        id: 'patience_3',
        name: '忍耐力 III',
        description: '待ち時間を40%短縮',
        effect: { type: 'wait_time_reduction', value: 0.4 },
        price: 4000,
        tier: 3
    },

    // 餌の達人 (Bait Master)
    {
        id: 'bait_master_1',
        name: '餌の達人 I',
        description: '釣り成功時、15%の確率で餌を消費しない',
        effect: { type: 'bait_save', value: 0.15 },
        price: 500,
        tier: 1
    },
    {
        id: 'bait_master_2',
        name: '餌の達人 II',
        description: '釣り成功時、30%の確率で餌を消費しない',
        effect: { type: 'bait_save', value: 0.3 },
        price: 2000,
        tier: 2
    },
    {
        id: 'bait_master_3',
        name: '餌の達人 III',
        description: '釣り成功時、50%の確率で餌を消費しない',
        effect: { type: 'bait_save', value: 0.5 },
        price: 6000,
        tier: 3
    },

    // テクニシャン (Technician)
    {
        id: 'technician_1',
        name: 'テクニシャン I',
        description: '赤ゾーンの幅が20%拡大',
        effect: { type: 'red_zone_boost', value: 0.2 },
        price: 600,
        tier: 1
    },
    {
        id: 'technician_2',
        name: 'テクニシャン II',
        description: '赤ゾーンの幅が40%拡大',
        effect: { type: 'red_zone_boost', value: 0.4 },
        price: 2500,
        tier: 2
    },
    {
        id: 'technician_3',
        name: 'テクニシャン III',
        description: '赤ゾーンの幅が60%拡大',
        effect: { type: 'red_zone_boost', value: 0.6 },
        price: 7000,
        tier: 3
    },

    // 起死回生 (Second Chance)
    {
        id: 'second_chance_1',
        name: '起死回生 I',
        description: '白ゾーンでの失敗時、10%で成功扱いになる',
        effect: { type: 'second_chance', value: 0.1 },
        price: 800,
        tier: 1
    },
    {
        id: 'second_chance_2',
        name: '起死回生 II',
        description: '白ゾーンでの失敗時、20%で成功扱いになる',
        effect: { type: 'second_chance', value: 0.2 },
        price: 3000,
        tier: 2
    },
    {
        id: 'second_chance_3',
        name: '起死回生 III',
        description: '白ゾーンでの失敗時、35%で成功扱いになる',
        effect: { type: 'second_chance', value: 0.35 },
        price: 8000,
        tier: 3
    },

    // 鑑定眼 (Appraisal)
    {
        id: 'appraisal_1',
        name: '鑑定眼 I',
        description: '称号付きの出現確率が2倍',
        effect: { type: 'title_boost', value: 2 },
        price: 1000,
        tier: 1
    },
    {
        id: 'appraisal_2',
        name: '鑑定眼 II',
        description: '称号付きの出現確率が3倍',
        effect: { type: 'title_boost', value: 3 },
        price: 3500,
        tier: 2
    },
    {
        id: 'appraisal_3',
        name: '鑑定眼 III',
        description: '称号付きの出現確率が4倍',
        effect: { type: 'title_boost', value: 4 },
        price: 9000,
        tier: 3
    },

    // 大物狙い (Big Game Hunter)
    {
        id: 'big_game_hunter_1',
        name: '大物狙い I',
        description: '上位ランクの出現率が少しアップ',
        effect: { type: 'big_game_boost', value: 1.5 },
        price: 1200,
        tier: 1
    },
    {
        id: 'big_game_hunter_2',
        name: '大物狙い II',
        description: '上位ランクの出現率がアップ',
        effect: { type: 'big_game_boost', value: 2.5 },
        price: 4500,
        tier: 2
    },
    {
        id: 'big_game_hunter_3',
        name: '大物狙い III',
        description: '上位ランクの出現率が大幅アップ',
        effect: { type: 'big_game_boost', value: 5.0 },
        price: 12000,
        tier: 3
    },

    // トレジャーハンター (Treasure Hunter)
    {
        id: 'treasure_hunter_1',
        name: 'トレジャーハンター I',
        description: '宝箱出現率+2%',
        effect: { type: 'treasure_boost', value: 0.02 },
        price: 1500,
        tier: 1
    },
    {
        id: 'treasure_hunter_2',
        name: 'トレジャーハンター II',
        description: '宝箱出現率+5%',
        effect: { type: 'treasure_boost', value: 0.05 },
        price: 5000,
        tier: 2
    },
    {
        id: 'treasure_hunter_3',
        name: 'トレジャーハンター III',
        description: '宝箱出現率+10%',
        effect: { type: 'treasure_boost', value: 0.1 },
        price: 15000,
        tier: 3
    },

    // フォーチュンハンター (Fortune Hunter) - 量
    {
        id: 'fortune_hunter_1',
        name: 'フォーチュンハンター I',
        description: '宝箱の報酬量(金・餌・スキル数)+20%',
        effect: { type: 'treasure_quantity', value: 0.2 },
        price: 3000,
        tier: 1
    },
    {
        id: 'fortune_hunter_2',
        name: 'フォーチュンハンター II',
        description: '宝箱の報酬量(金・餌・スキル数)+50%',
        effect: { type: 'treasure_quantity', value: 0.5 },
        price: 10000,
        tier: 2
    },
    {
        id: 'fortune_hunter_3',
        name: 'フォーチュンハンター III',
        description: '宝箱の報酬量(金・餌・スキル数)+100%',
        effect: { type: 'treasure_quantity', value: 1.0 },
        price: 30000,
        tier: 3
    },

    // ラグジュアリーハンター (Luxury Hunter) - 質
    {
        id: 'luxury_hunter_1',
        name: 'ラグジュアリーハンター I',
        description: '宝箱の報酬質(金・餌ランク・スキルレア度)小アップ',
        effect: { type: 'treasure_quality', value: 1.2 },
        price: 5000,
        tier: 1
    },
    {
        id: 'luxury_hunter_2',
        name: 'ラグジュアリーハンター II',
        description: '宝箱の報酬質(金・餌ランク・スキルレア度)中アップ',
        effect: { type: 'treasure_quality', value: 1.5 },
        price: 20000,
        tier: 2
    },
    {
        id: 'luxury_hunter_3',
        name: 'ラグジュアリーハンター III',
        description: '宝箱の報酬質(金・餌ランク・スキルレア度)大アップ',
        effect: { type: 'treasure_quality', value: 2.0 },
        price: 50000,
        tier: 3
    },

    // 情熱 (Passion) - ゲージ蓄積
    {
        id: 'passion_1',
        name: '情熱 I',
        description: 'フィーバーゲージ蓄積率 +5%',
        effect: { type: 'fever_charge', value: 0.05 },
        price: 2000,
        tier: 1
    },
    {
        id: 'passion_2',
        name: '情熱 II',
        description: 'フィーバーゲージ蓄積率 +10%',
        effect: { type: 'fever_charge', value: 0.10 },
        price: 8000,
        tier: 2
    },
    {
        id: 'passion_3',
        name: '情熱 III',
        description: 'フィーバーゲージ蓄積率 +15%',
        effect: { type: 'fever_charge', value: 0.15 },
        price: 25000,
        tier: 3
    },

    // 熱狂 (Mania) - フィーバー延長
    {
        id: 'mania_1',
        name: '熱狂 I',
        description: 'フィーバー進行(終了)確率 -10%',
        effect: { type: 'fever_long', value: 0.10 },
        price: 3000,
        tier: 1
    },
    {
        id: 'mania_2',
        name: '熱狂 II',
        description: 'フィーバー進行(終了)確率 -20%',
        effect: { type: 'fever_long', value: 0.20 },
        price: 12000,
        tier: 2
    },
    {
        id: 'mania_3',
        name: '熱狂 III',
        description: 'フィーバー進行(終了)確率 -30%',
        effect: { type: 'fever_long', value: 0.30 },
        price: 40000,
        tier: 3
    },

    // 太陽の加護 (Sun's Blessing)
    {
        id: 'sun_blessing_1',
        name: '太陽の加護 I',
        description: 'おたからフィーバー確率 +15%',
        effect: { type: 'fever_bias_sun', value: 0.15 },
        price: 4000,
        tier: 1
    },
    {
        id: 'sun_blessing_2',
        name: '太陽の加護 II',
        description: 'おたからフィーバー確率 +30%',
        effect: { type: 'fever_bias_sun', value: 0.30 },
        price: 15000,
        tier: 2
    },
    {
        id: 'sun_blessing_3',
        name: '太陽の加護 III',
        description: 'おたからフィーバー確率 +45%',
        effect: { type: 'fever_bias_sun', value: 0.45 },
        price: 50000,
        tier: 3
    },

    // 月の加護 (Moon's Blessing)
    {
        id: 'moon_blessing_1',
        name: '月の加護 I',
        description: 'おさかなフィーバー確率 +15%',
        effect: { type: 'fever_bias_moon', value: 0.15 },
        price: 4000,
        tier: 1
    },
    {
        id: 'moon_blessing_2',
        name: '月の加護 II',
        description: 'おさかなフィーバー確率 +30%',
        effect: { type: 'fever_bias_moon', value: 0.30 },
        price: 15000,
        tier: 2
    },
    {
        id: 'moon_blessing_3',
        name: '月の加護 III',
        description: 'おさかなフィーバー確率 +45%',
        effect: { type: 'fever_bias_moon', value: 0.45 },
        price: 50000,
        tier: 3
    },

    // 達人の針 (Perfect Master) - 赤ゾーン確定
    {
        id: 'perfect_master_1',
        name: '達人の針 I',
        description: 'ゲージバトルで赤ゾーン停止時、捕獲率が100%になる',
        effect: { type: 'perfect_catch', value: 1.0 },
        price: 100000,
        tier: 3
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
        quantity: 5
    }
];



// ========================================
// スキン（着せ替え）データ
// ========================================
const SKINS = [
    {
        id: 'skin_default',
        name: 'ノーマル',
        rodColor: '#8B4513', // 木の色
        bobberColor: '#ff0000', // 赤
        rodId: 'wooden_rod', // 解放条件（初期）
        description: '標準的な釣竿とウキのセット'
    },
    {
        id: 'skin_bamboo',
        name: 'バンブー',
        rodColor: '#6B8E23', // オリーブドラブ
        bobberColor: '#ADFF2F', // 黄緑
        rodId: 'bamboo_rod',
        description: '自然を感じる竹の色合い'
    },
    {
        id: 'skin_carbon',
        name: 'カーボン',
        rodColor: '#2F4F4F', // ダークスレートグレー
        bobberColor: '#00CED1', // ダークターコイズ
        rodId: 'carbon_rod',
        description: 'クールな黒と未来的な青'
    },
    {
        id: 'skin_titanium',
        name: 'チタン',
        rodColor: '#C0C0C0', // シルバー
        bobberColor: '#FFD700', // ゴールド
        rodId: 'titanium_rod',
        description: '高級感あふれる金属光沢'
    },
    {
        id: 'skin_legendary',
        name: 'レジェンド',
        rodColor: '#800080', // 紫
        bobberColor: '#FF00FF', // マゼンタ
        rodId: 'legendary_rod',
        description: '伝説の釣り人に相応しい神秘的な色'
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
    nibbleCountMin: 3,
    nibbleCountMax: 6,
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
    BRONZE: { single: 1000, ten: 9000, rates: { tier1: 85, tier2: 14, tier3: 1, special: 0 } },
    SILVER: { single: 8000, ten: 72000, rates: { tier1: 15, tier2: 75, tier3: 10, special: 0.1 } },
    GOLD: { single: 30000, ten: 250000, rates: { tier1: 0, tier2: 20, tier3: 75, special: 5 } }
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
        SKINS
    };
}
