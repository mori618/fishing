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
        id: 'sun_blessing',
        name: '太陽の加護',
        description: 'おたからフィーバー確率 +25%',
        effect: { type: 'fever_bias_sun', value: 0.25 },
        price: 50000,
        tier: 3
    },

    // 月の加護 (Moon's Blessing)
    {
        id: 'moon_blessing',
        name: '月の加護',
        description: 'おさかなフィーバー確率 +25%',
        effect: { type: 'fever_bias_moon', value: 0.25 },
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
    },

    // 船乗りの勘 (Sailor's Intuition) - 船イベント確率アップ
    {
        id: 'sailor_intuition_1',
        name: '船乗りの勘 I',
        description: 'ボートイベント出現率 +5%',
        effect: { type: 'boat_event_boost', value: 0.05 },
        price: 2000,
        tier: 1
    },
    {
        id: 'sailor_intuition_2',
        name: '船乗りの勘 II',
        description: 'ボートイベント出現率 +10%',
        effect: { type: 'boat_event_boost', value: 0.10 },
        price: 8000,
        tier: 2
    },
    {
        id: 'sailor_intuition_3',
        name: '船乗りの勘 III',
        description: 'ボートイベント出現率 +15%',
        effect: { type: 'boat_event_boost', value: 0.15 },
        price: 25000,
        tier: 3
    },

    // バードウォッチャー (Bird Watcher) - 鳥イベント確率アップ
    {
        id: 'bird_watcher_1',
        name: 'バードウォッチャー I',
        description: '鳥イベント出現率 +5%',
        effect: { type: 'bird_event_boost', value: 0.05 },
        price: 2000,
        tier: 1
    },
    {
        id: 'bird_watcher_2',
        name: 'バードウォッチャー II',
        description: '鳥イベント出現率 +10%',
        effect: { type: 'bird_event_boost', value: 0.10 },
        price: 8000,
        tier: 2
    },
    {
        id: 'bird_watcher_3',
        name: 'バードウォッチャー III',
        description: '鳥イベント出現率 +15%',
        effect: { type: 'bird_event_boost', value: 0.15 },
        price: 25000,
        tier: 3
    },

    // ダブルキャッチ (Dual Catcher) - 2匹釣り
    {
        id: 'dual_catcher_1',
        name: 'ダブルキャッチ I',
        description: '10%の確率で魚が2匹釣れる',
        effect: { type: 'multi_catch_2', value: 0.10 },
        price: 3000,
        tier: 1
    },
    {
        id: 'dual_catcher_2',
        name: 'ダブルキャッチ II',
        description: '25%の確率で魚が2匹釣れる',
        effect: { type: 'multi_catch_2', value: 0.25 },
        price: 10000,
        tier: 2
    },
    {
        id: 'dual_catcher_3',
        name: 'ダブルキャッチ III',
        description: '50%の確率で魚が2匹釣れる',
        effect: { type: 'multi_catch_2', value: 0.50 },
        price: 30000,
        tier: 3
    },

    // トリプルキャッチ (Triple Catcher) - 3匹釣り
    {
        id: 'triple_catcher_1',
        name: 'トリプルキャッチ I',
        description: '5%の確率で魚が3匹釣れる',
        effect: { type: 'multi_catch_3', value: 0.05 },
        price: 5000,
        tier: 1
    },
    {
        id: 'triple_catcher_2',
        name: 'トリプルキャッチ II',
        description: '10%の確率で魚が3匹釣れる',
        effect: { type: 'multi_catch_3', value: 0.10 },
        price: 20000,
        tier: 2
    },
    {
        id: 'triple_catcher_3',
        name: 'トリプルキャッチ III',
        description: '20%の確率で魚が3匹釣れる',
        effect: { type: 'multi_catch_3', value: 0.20 },
        price: 50000,
        tier: 3
    },

    // ========================================
    // 港 (Port) 関連スキル
    // ========================================

    // 高速エンジン (Fast Engine) - 漁獲間隔短縮
    {
        id: 'ship_interval_down_1',
        name: '高速エンジン I',
        description: '漁獲間隔を10%短縮',
        effect: { type: 'ship_interval_down', value: 0.10 },
        price: 5000,
        tier: 1
    },
    {
        id: 'ship_interval_down_2',
        name: '高速エンジン II',
        description: '漁獲間隔を25%短縮',
        effect: { type: 'ship_interval_down', value: 0.25 },
        price: 20000,
        tier: 2
    },
    {
        id: 'ship_interval_down_3',
        name: '高速エンジン III',
        description: '漁獲間隔を45%短縮',
        effect: { type: 'ship_interval_down', value: 0.45 },
        price: 60000,
        tier: 3
    },

    // 大型網 (Large Net) - 漁獲量アップ
    {
        id: 'ship_amount_up_1',
        name: '大型網 I',
        description: '一度の漁獲量 +1〜2匹',
        effect: { type: 'ship_amount_up', min: 1, max: 2 },
        price: 6000,
        tier: 1
    },
    {
        id: 'ship_amount_up_2',
        name: '大型網 II',
        description: '一度の漁獲量 +3〜5匹',
        effect: { type: 'ship_amount_up', min: 3, max: 5 },
        price: 25000,
        tier: 2
    },
    {
        id: 'ship_amount_up_3',
        name: '大型網 III',
        description: '一度の漁獲量 +6〜10匹',
        effect: { type: 'ship_amount_up', min: 6, max: 10 },
        price: 80000,
        tier: 3
    },

    // エコ航行 (Eco Sailing) - 燃料消費回避
    {
        id: 'ship_fuel_eco_1',
        name: 'エコ航行 I',
        description: '20%の確率で燃料消費を回避',
        effect: { type: 'ship_fuel_eco', value: 0.20 },
        price: 4000,
        tier: 1
    },
    {
        id: 'ship_fuel_eco_2',
        name: 'エコ航行 II',
        description: '40%の確率で燃料消費を回避',
        effect: { type: 'ship_fuel_eco', value: 0.40 },
        price: 15000,
        tier: 2
    },
    {
        id: 'ship_fuel_eco_3',
        name: 'エコ航行 III',
        description: '60%の確率で燃料消費を回避',
        effect: { type: 'ship_fuel_eco', value: 0.60 },
        price: 45000,
        tier: 3
    },

    // 港の顔馴染み (Port Regular) - 燃料割引
    {
        id: 'ship_fuel_discount_1',
        name: '港の顔馴染み I',
        description: '燃料購入価格 15%割引',
        effect: { type: 'ship_fuel_discount', value: 0.15 },
        price: 3000,
        tier: 1
    },
    {
        id: 'ship_fuel_discount_2',
        name: '港の顔馴染み II',
        description: '燃料購入価格 30%割引',
        effect: { type: 'ship_fuel_discount', value: 0.30 },
        price: 10000,
        tier: 2
    },
    {
        id: 'ship_fuel_discount_3',
        name: '港の顔馴染み III',
        description: '燃料購入価格 50%割引',
        effect: { type: 'ship_fuel_discount', value: 0.50 },
        price: 30000,
        tier: 3
    },

    // ========================================
    // ミッション関連スキル
    // ========================================

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

    // 依頼人のコネ (Client Connection) - ミッション報酬アップ
    {
        id: 'client_connection_1',
        name: '依頼人のコネ I',
        description: 'ミッション報酬が1.5倍になる',
        effect: { type: 'mission_reward', value: 1.5 },
        price: 3000,
        tier: 1
    },
    {
        id: 'client_connection_2',
        name: '依頼人のコネ II',
        description: 'ミッション報酬が1.75倍になる',
        effect: { type: 'mission_reward', value: 1.75 },
        price: 10000,
        tier: 2
    },
    {
        id: 'client_connection_3',
        name: '依頼人のコネ III',
        description: 'ミッション報酬が2倍になる',
        effect: { type: 'mission_reward', value: 2.0 },
        price: 30000,
        tier: 3
    },

    // ストイック (Stoic) - 目標増・報酬大幅増
    {
        id: 'stoic_1',
        name: 'ストイック I',
        description: 'ミッション目標が2倍になるが、報酬が3倍になる',
        effect: { type: 'stoic', targetMult: 2.0, rewardMult: 3.0 },
        price: 5000,
        tier: 1
    },
    {
        id: 'stoic_2',
        name: 'ストイック II',
        description: 'ミッション目標が3倍になるが、報酬が5倍になる',
        effect: { type: 'stoic', targetMult: 3.0, rewardMult: 5.0 },
        price: 15000,
        tier: 2
    },
    {
        id: 'stoic_3',
        name: 'ストイック III',
        description: 'ミッション目標が4倍になるが、報酬が8倍になる',
        effect: { type: 'stoic', targetMult: 4.0, rewardMult: 8.0 },
        price: 40000,
        tier: 3
    },

    // 気楽な釣り人 (Casual Fisher) - 目標減・報酬減
    {
        id: 'casual_fisher_1',
        name: '気楽な釣り人 I',
        description: 'ミッション目標が0.7倍、報酬が0.7倍になる',
        effect: { type: 'casual', targetMult: 0.7, rewardMult: 0.7 },
        price: 2000,
        tier: 1
    },
    {
        id: 'casual_fisher_2',
        name: '気楽な釣り人 II',
        description: 'ミッション目標が0.6倍、報酬が0.8倍になる',
        effect: { type: 'casual', targetMult: 0.6, rewardMult: 0.8 },
        price: 6000,
        tier: 2
    },
    {
        id: 'casual_fisher_3',
        name: '気楽な釣り人 III',
        description: 'ミッション目標が0.5倍になるが、報酬は変わらない',
        effect: { type: 'casual', targetMult: 0.5, rewardMult: 1.0 },
        price: 20000,
        tier: 3
    },

    // ========================================
    // 新規追加スキル群 (Mission / Risk / Eco / Etc)
    // ========================================

    // ミッション報酬増 (Mission Reward Up)
    {
        id: 'mission_reward_up_1',
        name: '報酬アップ I',
        description: 'ミッション報酬+20%',
        effect: { type: 'mission_reward_up', value: 0.2 },
        price: 500,
        tier: 1
    },
    {
        id: 'mission_reward_up_2',
        name: '報酬アップ II',
        description: 'ミッション報酬+40%',
        effect: { type: 'mission_reward_up', value: 0.4 },
        price: 2000,
        tier: 2
    },
    {
        id: 'mission_reward_up_3',
        name: '報酬アップ III',
        description: 'ミッション報酬+60%',
        effect: { type: 'mission_reward_up', value: 0.6 },
        price: 6000,
        tier: 3
    },

    // ガチャチケミッション出現率アップ (Gacha Mission Up)
    {
        id: 'gacha_mission_up_1',
        name: 'チケットハンター I',
        description: 'ガチャチケミッション出現率+10%',
        effect: { type: 'gacha_mission_up', value: 0.1 },
        price: 1000,
        tier: 1
    },
    {
        id: 'gacha_mission_up_2',
        name: 'チケットハンター II',
        description: 'ガチャチケミッション出現率+20%',
        effect: { type: 'gacha_mission_up', value: 0.2 },
        price: 3500,
        tier: 2
    },
    {
        id: 'gacha_mission_up_3',
        name: 'チケットハンター III',
        description: 'ガチャチケミッション出現率+30%',
        effect: { type: 'gacha_mission_up', value: 0.3 },
        price: 9000,
        tier: 3
    },

    // オーバードライブ (Overdrive) - ハイリスクハイリターン
    {
        id: 'overdrive_2',
        name: 'オーバードライブ II',
        description: 'パワー+30% & ゲージ速度+10%',
        effect: { type: 'overdrive', power: 0.3, speed: 0.1 },
        price: 4000,
        tier: 2
    },
    {
        id: 'overdrive_3',
        name: 'オーバードライブ III',
        description: 'パワー+50% & ゲージ速度+20%',
        effect: { type: 'overdrive', power: 0.5, speed: 0.2 },
        price: 10000,
        tier: 3
    },

    // ハイリスク売却 (High Risk Sell)
    {
        id: 'high_risk_sell_2',
        name: '闇取引 II',
        description: '売却価格1.5倍 & 釣り失敗時に所持金減少(小)',
        effect: { type: 'high_risk_sell', priceMult: 1.5, penaltyRate: 0.1 },
        price: 5000,
        tier: 2
    },
    {
        id: 'high_risk_sell_3',
        name: '闇取引 III',
        description: '売却価格3倍 & 釣り失敗時に所持金減少(大)',
        effect: { type: 'high_risk_sell', priceMult: 2.0, penaltyRate: 0.3 },
        price: 15000,
        tier: 3
    },

    // 早打ちペナルティ (Quick Hit Penalty) - 時短・安売り
    {
        id: 'quick_hit_penalty_2',
        name: '早打ち II',
        description: 'ヒット待ち-30% & 売却価格-20%',
        effect: { type: 'quick_hit_penalty', waitReduc: 0.3, priceReduc: 0.2 },
        price: 3000,
        tier: 2
    },
    {
        id: 'quick_hit_penalty_3',
        name: '早打ち III',
        description: 'ヒット待ち-50% & 売却価格-40%',
        effect: { type: 'quick_hit_penalty', waitReduc: 0.5, priceReduc: 0.4 },
        price: 8000,
        tier: 3
    },

    // ランクスナイパー (Rank Sniper)
    {
        id: 'rank_sniper_2',
        name: 'ランクスナイパー II',
        description: 'Bランク(Rare)以上の魚しか釣れなくなる',
        effect: { type: 'rank_sniper', minRarity: 'B' },
        price: 6000,
        tier: 2
    },
    {
        id: 'rank_sniper_3',
        name: 'ランクスナイパー III',
        description: 'Aランク(Epic)以上の魚しか釣れなくなる',
        effect: { type: 'rank_sniper', minRarity: 'A' },
        price: 20000,
        tier: 3
    },

    // アルティメットリスク (Ultimate Risk)
    {
        id: 'ultimate_risk',
        name: '究極の賭け',
        description: 'パワー+100% & 失敗時に所持魚が0になる',
        effect: { type: 'ultimate_risk', power: 1.0 },
        price: 50000,
        tier: 3
    },

    // オートヒット (Auto Hit)
    {
        id: 'auto_hit_2',
        name: '自動合わせ II',
        description: 'ウキ沈下時に30%で自動ヒット',
        effect: { type: 'auto_hit', chance: 0.3 },
        price: 8000,
        tier: 2
    },
    {
        id: 'auto_hit_3',
        name: '自動合わせ III',
        description: 'ウキ沈下時に50%で自動ヒット',
        effect: { type: 'auto_hit', chance: 0.5 },
        price: 25000,
        tier: 3
    },

    // ショップ割引 (Shop Discount)
    {
        id: 'shop_discount_1',
        name: '常連の証 I',
        description: 'ショップ価格5%割引',
        effect: { type: 'shop_discount', value: 0.05 },
        price: 2000,
        tier: 1
    },
    {
        id: 'shop_discount_2',
        name: '常連の証 II',
        description: 'ショップ価格10%割引',
        effect: { type: 'shop_discount', value: 0.10 },
        price: 8000,
        tier: 2
    },
    {
        id: 'shop_discount_3',
        name: '常連の証 III',
        description: 'ショップ価格15%割引',
        effect: { type: 'shop_discount', value: 0.15 },
        price: 30000,
        tier: 3
    },


    // 強化割引 (Upgrade Discount)
    {
        id: 'upgrade_discount_1',
        name: '鍛冶屋の友 I',
        description: '竿の強化費用10%軽減',
        effect: { type: 'upgrade_discount', value: 0.1 },
        price: 2000,
        tier: 1
    },
    {
        id: 'upgrade_discount_2',
        name: '鍛冶屋の友 II',
        description: '竿の強化費用20%軽減',
        effect: { type: 'upgrade_discount', value: 0.2 },
        price: 8000,
        tier: 2
    },
    {
        id: 'upgrade_discount_3',
        name: '鍛冶屋の友 III',
        description: '竿の強化費用30%軽減',
        effect: { type: 'upgrade_discount', value: 0.3 },
        price: 30000,
        tier: 3
    },

    // 条件付きレアアップ (Conditional Rare Up)
    {
        id: 'moon_rare_up',
        name: '月光の導き',
        description: '月の加護装備時のみレア魚率大幅UP',
        effect: { type: 'moon_rare_up', value: 0.4 }, // +40%
        price: 40000,
        tier: 3
    },
    {
        id: 'sun_chest_up',
        name: '太陽の恵み',
        description: '太陽の加護装備時のみレア宝箱率大幅UP',
        effect: { type: 'sun_chest_up', value: 0.4 }, // +40%
        price: 40000,
        tier: 3
    },

    // 未登録魚探索 (New Fish Finder)
    {
        id: 'new_fish_finder_1',
        name: '未知への探求 I',
        description: '未登録魚率UP(小) & 待ち時間+40%',
        effect: { type: 'new_fish_finder', value: 1.5, waitIncrease: 0.4 },
        price: 5000,
        tier: 1
    },
    {
        id: 'new_fish_finder_2',
        name: '未知への探求 II',
        description: '未登録魚率UP(中) & 待ち時間+25%',
        effect: { type: 'new_fish_finder', value: 2.0, waitIncrease: 0.25 },
        price: 15000,
        tier: 2
    },
    {
        id: 'new_fish_finder_3',
        name: '未知への探求 III',
        description: '未登録魚率UP(大) & 待ち時間+10%',
        effect: { type: 'new_fish_finder', value: 3.0, waitIncrease: 0.1 },
        price: 40000,
        tier: 3
    },

    // 売却ガチャチケ (Sell Ticket Chance)
    {
        id: 'sell_ticket_chance_1',
        name: 'ラッキーセール I',
        description: '売却時に0.5%でガチャチケ獲得',
        effect: { type: 'sell_ticket_chance', value: 0.005 },
        price: 3000,
        tier: 1
    },
    {
        id: 'sell_ticket_chance_2',
        name: 'ラッキーセール II',
        description: '売却時に1.0%でガチャチケ獲得',
        effect: { type: 'sell_ticket_chance', value: 0.01 },
        price: 10000,
        tier: 2
    },
    {
        id: 'sell_ticket_chance_3',
        name: 'ラッキーセール III',
        description: '売却時に2.0%でガチャチケ獲得',
        effect: { type: 'sell_ticket_chance', value: 0.02 },
        price: 30000,
        tier: 3
    },

    // カジノハイローラー (Casino High Roller)
    {
        id: 'casino_high_roller',
        name: 'ハイローラー',
        description: 'カジノ倍率アップ（勝ちも負けも2倍）',
        effect: { type: 'casino_high_roller', value: 2.0 },
        price: 50000,
        tier: 3
    },

    // マルチ系強化 (Extra / Multi Boosts)
    {
        id: 'multi_catch_prob_1',
        name: '群れ追い I',
        description: '複数釣れる確率+10%',
        effect: { type: 'multi_catch_prob', value: 0.1 },
        price: 2000,
        tier: 1
    },
    {
        id: 'multi_catch_prob_2',
        name: '群れ追い II',
        description: '複数釣れる確率+20%',
        effect: { type: 'multi_catch_prob', value: 0.2 },
        price: 8000,
        tier: 2
    },
    {
        id: 'multi_catch_num_1',
        name: '大量捕獲 I',
        description: '複数釣り発動時、釣れる数が+1される',
        effect: { type: 'multi_catch_num', value: 1 },
        price: 5000,
        tier: 1
    },
    {
        id: 'multi_catch_num_2',
        name: '大量捕獲 II',
        description: '複数釣り発動時、釣れる数が+2される',
        effect: { type: 'multi_catch_num', value: 2 },
        price: 20000,
        tier: 2
    },

    // エクストラ系 (Extra Drops)
    {
        id: 'extra_gacha_prob_1',
        name: 'チケットの釣り人 I',
        description: '魚と一緒にガチャチケが釣れる確率+1%',
        effect: { type: 'extra_gacha_prob', value: 0.01 },
        price: 3000,
        tier: 1
    },
    {
        id: 'extra_gacha_prob_2',
        name: 'チケットの釣り人 II',
        description: '魚と一緒にガチャチケが釣れる確率+3%',
        effect: { type: 'extra_gacha_prob', value: 0.03 },
        price: 10000,
        tier: 2
    },
    {
        id: 'extra_gacha_num_1',
        name: 'チケットボーナス I',
        description: '追加ガチャチケ獲得時の数+1',
        effect: { type: 'extra_gacha_num', value: 1 },
        price: 5000,
        tier: 1
    },
    {
        id: 'extra_gacha_num_2',
        name: 'チケットボーナス II',
        description: '追加ガチャチケ獲得時の数+2',
        effect: { type: 'extra_gacha_num', value: 2 },
        price: 20000,
        tier: 2
    },

    {
        id: 'extra_coin_prob_1',
        name: '小銭拾い I',
        description: '魚と一緒にコインが釣れる確率+10%',
        effect: { type: 'extra_coin_prob', value: 0.1 },
        price: 1000,
        tier: 1
    },
    {
        id: 'extra_coin_prob_2',
        name: '小銭拾い II',
        description: '魚と一緒にコインが釣れる確率+25%',
        effect: { type: 'extra_coin_prob', value: 0.25 },
        price: 4000,
        tier: 2
    },
    {
        id: 'extra_coin_amount_1',
        name: '臨時収入 I',
        description: '追加コイン獲得時の量+50%',
        effect: { type: 'extra_coin_amount', value: 0.5 },
        price: 3000,
        tier: 1
    },
    {
        id: 'extra_coin_amount_2',
        name: '臨時収入 II',
        description: '追加コイン獲得時の量+100%',
        effect: { type: 'extra_coin_amount', value: 1.0 },
        price: 10000,
        tier: 2
    },

    // フィーバー宝箱増 (Fever Treasure Boost)
    {
        id: 'fever_treasure_boost_2',
        name: 'フィーバーリッチ II',
        description: 'フィーバー中の宝箱中身+20%',
        effect: { type: 'fever_treasure_boost', value: 0.2 },
        price: 8000,
        tier: 2
    },
    {
        id: 'fever_treasure_boost_3',
        name: 'フィーバーリッチ III',
        description: 'フィーバー中の宝箱中身+50%',
        effect: { type: 'fever_treasure_boost', value: 0.5 },
        price: 25000,
        tier: 3
    },

    // ========================================
    // 所持数依存系 (Count Dependent)
    // ========================================

    {
        id: 'count_skill_multi',
        name: 'スキルコレクター (連)',
        description: '所持スキル数に応じて複数釣り数UP',
        effect: { type: 'count_skill_multi', value: 0.1 }, // 10個につき+1程度の係数
        price: 40000,
        tier: 3
    },
    {
        id: 'count_fish_gacha',
        name: '魚コレクター (券)',
        description: '所持魚数に応じて追加ガチャチケ数UP',
        effect: { type: 'count_fish_gacha', value: 0.1 },
        price: 40000,
        tier: 3
    },
    {
        id: 'count_gacha_coin',
        name: 'チケット長者 (金)',
        description: '所持ガチャチケ数に応じて追加コイン量UP',
        effect: { type: 'count_gacha_coin', value: 0.1 },
        price: 40000,
        tier: 3
    },
    {
        id: 'count_fish_title',
        name: '魚コレクター (名)',
        description: '所持魚数に応じて称号付き出現率UP',
        effect: { type: 'count_fish_title', value: 0.05 },
        price: 40000,
        tier: 3
    },

    // 所持スキル数 -> パワー (T123)
    {
        id: 'count_skill_power_1',
        name: 'マナの共鳴 I',
        description: '所持スキル数に応じてパワーUP(小)',
        effect: { type: 'count_skill_power', value: 0.5 },
        price: 3000,
        tier: 1
    },
    {
        id: 'count_skill_power_2',
        name: 'マナの共鳴 II',
        description: '所持スキル数に応じてパワーUP(中)',
        effect: { type: 'count_skill_power', value: 1.0 },
        price: 12000,
        tier: 2
    },
    {
        id: 'count_skill_power_3',
        name: 'マナの共鳴 III',
        description: '所持スキル数に応じてパワーUP(大)',
        effect: { type: 'count_skill_power', value: 2.0 },
        price: 40000,
        tier: 3
    },

    // 所持チケット数 -> 売却 (T123)
    {
        id: 'count_gacha_sell_1',
        name: '券の価値 I',
        description: '所持ガチャチケ数に応じて売却価格UP(小)',
        effect: { type: 'count_gacha_sell', value: 0.05 }, // 1枚につき+0.05%?
        price: 3000,
        tier: 1
    },
    {
        id: 'count_gacha_sell_2',
        name: '券の価値 II',
        description: '所持ガチャチケ数に応じて売却価格UP(中)',
        effect: { type: 'count_gacha_sell', value: 0.1 },
        price: 12000,
        tier: 2
    },
    {
        id: 'count_gacha_sell_3',
        name: '券の価値 III',
        description: '所持ガチャチケ数に応じて売却価格UP(大)',
        effect: { type: 'count_gacha_sell', value: 0.2 },
        price: 40000,
        tier: 3
    }
];

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
        fishingInterval: 300000 // 5分
    },
    {
        id: 'ship_medium',
        name: '中型漁船',
        price: 100000,
        capacity: 50,
        catchAmountRange: [4, 8],
        maxRarity: 'B',
        description: '多少の荒波にも耐える中型船。',
        fishingInterval: 300000 // 5分
    },
    {
        id: 'ship_large',
        name: '大型漁船',
        price: 500000,
        capacity: 150,
        catchAmountRange: [10, 20],
        maxRarity: 'S',
        description: '遠洋漁業も可能な大型船。大量の魚を積載可能。',
        fishingInterval: 300000 // 5分
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
        FUELS
    };
}
