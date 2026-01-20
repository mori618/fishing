// ゲーム状態管理
// プレイヤーの現在の状態を一元管理

const GameState = {
    // ========================================
    // 基本ステータス
    // ========================================
    money: 0,
    baitInventory: {},
    baitType: 'bait_d',

    // ========================================
    // 釣り竿の状態
    // ========================================
    rodRankIndex: 0,
    rodStarLevels: {},  // インデックスごとの星数 { 0: 0, 1: 0 }
    equippedSkills: [],

    // Getter for backward compatibility (current rod's stars)
    get rodStars() {
        return this.rodStarLevels[this.rodRankIndex] || 0;
    },

    set rodStars(value) {
        // Setter for migration or simple assignment
        this.rodStarLevels[this.rodRankIndex] = value;
    },

    // ========================================
    // イベント状態
    // ========================================
    highTierGuaranteed: false, // 鳥イベント用：次回上位魚確定フラグ

    // ========================================
    // インベントリ（釣った魚）
    // ========================================
    inventory: [],

    // ========================================
    // 図鑑データ
    // ========================================
    encyclopedia: {},

    // ========================================
    // アンロック状態
    // ========================================
    unlockedRods: [0],
    unlockedSkins: ['skin_default'],
    selectedSkin: 'skin_default',
    skillInventory: {}, // IDごとの所持数 { "power_up_1": 3 }
    // unlockedSkills: [], // 廃止予定 (移行用コードで処理)
    unlockedSkies: ['sky_default'],
    selectedSky: 'sky_default',

    // ========================================
    // 統計情報
    // ========================================
    totalFishCaught: 0,
    caughtByRank: { 'D': 0, 'C': 0, 'B': 0, 'A': 0, 'S': 0, 'SS': 0 },
    totalTreasure: 0,
    totalSkills: 0,
    totalMoneyEarned: 0,
    totalCoinsEarned: 0, // 売却などで獲得した純粋な利益累計
    casinoTotalWin: 0,
    casinoTotalLoss: 0,
    gachaTickets: 0,
    currentMissionIndex: 0, // 現在のミッション番号
    missionProgress: 0,     // カウントが必要なミッションの進捗

    // 動的ミッションデータ
    dynamicMissions: null,   // { A: {...}, B: {...}, C: {...} }
    dynamicMissionCompletedCount: 0, // 達成ミッション数（C枠の「ミッションをN個達成する」用）

    biggestFish: null,

    // ========================================
    // フィーバー状態
    // ========================================
    fever: {
        isActive: false,   // フィーバー中かどうか (gauge >= 6)
        value: 0,          // 現在のゲージ値 (0-12)
        type: null         // 'sun' (太陽) or 'moon' (月)
    },

    // ========================================
    // 初期化
    // ========================================
    init(saveData = null) {
        if (saveData) {
            // セーブデータから復元
            this.money = saveData.player.money;
            this.highTierGuaranteed = false; // ロード時はリセット
            // 互換性チェック: 古いデータの場合は移行
            if (saveData.player.baitInventory) {
                this.baitInventory = { ...saveData.player.baitInventory };
                // 強制的にDランクは無限(-1)にする（バグ修正・保護）
                this.baitInventory['bait_d'] = -1;
            } else {
                // 旧データからの移行: 持っていた餌を現在の餌タイプに追加
                this.baitInventory = {
                    'bait_d': -1, // -1は無限
                    'bait_c': 0,
                    'bait_b': 0,
                    'bait_a': 0,
                    'bait_s': 0
                };
                if (saveData.player.baitType && saveData.player.baitCount > 0) {
                    this.baitInventory[saveData.player.baitType] = saveData.player.baitCount;
                }
            }
            this.baitType = saveData.player.baitType || 'bait_d';

            this.rodRankIndex = saveData.rod.rankIndex;

            // ----------------新形式データ
            // 竿レベルの移行ロジック
            // ----------------------------------------
            if (saveData.rod.rodStarLevels) {
                // 新形式データ
                this.rodStarLevels = { ...saveData.rod.rodStarLevels };
            } else {
                // 旧形式からの移行:
                // 現在持っていた星の数を、現在アンロックされている全ての竿に適用（救済措置）
                const oldStars = saveData.rod.stars || 0;
                this.rodStarLevels = {};
                (saveData.unlocked.rods || [0]).forEach(rodId => {
                    this.rodStarLevels[rodId] = oldStars;
                });
                console.log(`🔄 竿レベル移行完了: 全アンロック竿に星${oldStars}個を適用`);
            }

            this.equippedSkills = [...saveData.rod.equippedSkills];

            this.inventory = [...saveData.inventory];

            this.unlockedRods = [...saveData.unlocked.rods];
            // データ不整合防止: unlockedRodsにあるものは確実に初期化
            this.unlockedRods.forEach(rodId => {
                if (typeof this.rodStarLevels[rodId] === 'undefined') {
                    this.rodStarLevels[rodId] = 0;
                }
            });

            // スキルデータの移行
            if (saveData.unlocked.skillInventory) {
                this.skillInventory = { ...saveData.unlocked.skillInventory };
            } else if (saveData.unlocked.skills) {
                // 旧データからの移行: 持っていたスキルを各1個所持として登録
                this.skillInventory = {};
                saveData.unlocked.skills.forEach(skillId => {
                    this.skillInventory[skillId] = 1;
                });
            } else {
                this.skillInventory = {};
            }

            this.totalFishCaught = saveData.statistics.totalFishCaught || 0;
            this.caughtByRank = saveData.statistics.caughtByRank || { 'D': 0, 'C': 0, 'B': 0, 'A': 0, 'S': 0, 'SS': 0 };
            this.totalTreasure = saveData.statistics.totalTreasure || 0;
            this.totalSkills = saveData.statistics.totalSkills || 0;
            this.totalMoneyEarned = saveData.statistics.totalMoneyEarned || 0;
            this.totalCoinsEarned = saveData.statistics.totalCoinsEarned || 0;
            this.casinoTotalWin = saveData.statistics.casinoTotalWin || 0;
            this.casinoTotalLoss = saveData.statistics.casinoTotalLoss || 0;
            this.gachaTickets = saveData.statistics.gachaTickets || 0;
            this.currentMissionIndex = saveData.statistics.currentMissionIndex ?? 0;
            this.missionProgress = saveData.statistics.missionProgress ?? 0;
            this.dynamicMissions = saveData.statistics.dynamicMissions ?? null;
            this.dynamicMissionCompletedCount = saveData.statistics.dynamicMissionCompletedCount ?? 0;
            this.biggestFish = saveData.statistics.biggestFish;

            // 図鑑データを復元
            this.encyclopedia = saveData.encyclopedia ? { ...saveData.encyclopedia } : {};

            // スキン状態の復元
            this.unlockedSkins = saveData.unlocked.skins || ['skin_default'];
            this.selectedSkin = saveData.player.selectedSkin || 'skin_default';
            this.unlockedSkies = saveData.unlocked.skies || ['sky_default'];
            this.selectedSky = saveData.player.selectedSky || 'sky_default';
        } else {
            // 新規ゲーム
            const defaultData = SaveManager.getDefaultData();
            this.init(defaultData);

            // 初期在庫の設定
            this.baitInventory = {
                'bait_d': -1, // 無限
                'bait_c': 0,
                'bait_b': 0,
                'bait_a': 0,
                'bait_s': 0
            };
            this.baitType = 'bait_d';
            // 初期スキン
            this.unlockedSkins = ['skin_default'];
            this.selectedSkin = 'skin_default';
            this.unlockedSkies = ['sky_default'];
            this.selectedSky = 'sky_default';
        }


        console.log('🎮 ゲーム状態を初期化しました');
    },

    // ========================================
    // 上位魚確定フラグの設定
    // ========================================
    setHighTierGuaranteed(value) {
        this.highTierGuaranteed = value;
        console.log(`🦅 上位魚確定フラグ: ${value}`);
    },

    // ========================================
    // 現在の釣り竿データを取得
    // ========================================
    getCurrentRod() {
        return GAME_DATA.RODS[this.rodRankIndex] || GAME_DATA.RODS[0];
    },

    // お金操作
    addMoney(amount) {
        this.money += amount;
        if (amount > 0) {
            this.totalMoneyEarned += amount;
            this.totalCoinsEarned += amount;
            // コイン獲得ミッション判定
            if (typeof MissionManager !== 'undefined') {
                MissionManager.checkMission('money_earned', { amount: amount });
            }
        }
    },

    // 借金状態の確認
    getDebt() {
        return this.money < 0 ? Math.abs(this.money) : 0;
    },

    hasDebt() {
        return this.money < 0;
    },

    getCurrentRod() {
        return GAME_DATA.RODS[this.rodRankIndex];
    },

    // ========================================
    // 現在の総合パワーを計算
    // ========================================
    getTotalPower() {
        const rod = this.getCurrentRod();
        const stars = this.rodStars; // Getterを使用
        let power = rod.basePower + (rod.starPowerBonus * stars);

        // スキルボーナスを加算
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'power_boost') {
                power += skill.effect.value;
            }
        }

        // ========================================
        // フィーバーボーナス (月: お魚フィーバー)
        // ========================================
        if (this.fever.isActive && this.fever.type === 'moon') {
            const feverBonus = 2.0; // 2.0倍 (100% UP)
            power = Math.floor(power * feverBonus);
            console.log(`🔥 お魚フィーバー効果: パワー 2.0倍! -> ${power}`);
        }

        return power;
    },

    // ========================================
    // スキルスロット数（＝星の数）
    // ========================================
    getSkillSlots() {
        return this.rodStars + 1;
    },

    // ========================================
    // ゲージ速度のスキル補正を取得
    // ========================================
    getGaugeSlowBonus() {
        let slowBonus = 0;

        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'gauge_slow') {
                slowBonus += skill.effect.value;
            }
        }

        return slowBonus;
    },

    // ========================================
    // 売却価格のスキル補正を取得
    // ========================================
    getPriceBonus() {
        let bonus = 0;

        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'price_boost') {
                bonus += skill.effect.value;
            }
        }

        return bonus;
    },

    // ========================================
    // 捕獲率のスキル補正を取得
    // ========================================
    getCatchBonus() {
        let bonus = 0;

        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'catch_boost') {
                bonus += skill.effect.value;
            }
        }

        return bonus;
    },

    // ========================================
    // レア魚出現率のスキル補正を取得
    // ========================================
    getRareBonus() {
        let bonus = 0;

        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'rare_boost') {
                bonus += skill.effect.value;
            }
        }

        // 餌の補正も加算
        if (this.baitType) {
            const bait = GAME_DATA.BAITS.find(b => b.id === this.baitType);
            if (bait) {
                bonus += (bait.rareBoost || 0);
            }
        }

        return bonus;
    },

    // ========================================
    // 揺れ回数固定スキルを取得
    // ========================================
    getNibbleFixCount() {
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'nibble_fix') {
                return skill.effect.value;
            }
        }
        return null;  // スキルなしの場合はnull
    },

    // ========================================
    // HIT受付時間のスキル補正（倍率）を取得
    // ========================================
    getHitWindowMultiplier() {
        let totalMultiplier = 1.0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'hit_window_mult') {
                // 加算方式: 1.5倍なら+0.5を加算
                totalMultiplier += (skill.effect.value - 1.0);
            }
        }
        return totalMultiplier;
    },

    // ========================================
    // 待ち時間短縮のスキル補正を取得
    // ========================================
    getWaitTimeReduction() {
        let reduction = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'wait_time_reduction') {
                reduction += skill.effect.value;
            }
        }
        // 最大100%カット（念のためキャップ）
        return Math.min(reduction, 1.0);
    },

    // ========================================
    // 餌の消費回避確率を取得
    // ========================================
    getBaitSaveChance() {
        let chance = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'bait_save') {
                chance += skill.effect.value;
            }
        }
        return Math.min(chance, 1.0); // 最大100%
    },

    // ========================================
    // 赤ゾーン拡大のスキル補正を取得
    // ========================================
    getRedZoneBonus() {
        let bonus = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'red_zone_boost') {
                bonus += skill.effect.value;
            }
        }
        return bonus;
    },

    // ========================================
    // 起死回生（白を緑に）の確率を取得
    // ========================================
    getSecondChanceRate() {
        let rate = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'second_chance') {
                rate += skill.effect.value;
            }
        }
        return Math.min(rate, 1.0);
    },

    // ========================================
    // 称号出現率の倍率を取得
    // ========================================
    getTitleChanceMultiplier() {
        let totalMultiplier = 1.0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'title_boost') {
                // 加算方式
                totalMultiplier += (skill.effect.value - 1.0);
            }
        }
        return totalMultiplier;
    },

    // ========================================
    // 大物出現率のスキル補正を取得
    // ========================================
    getBigGameBonus() {
        let totalBonus = 1.0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'big_game_boost') {
                // 加算方式
                totalBonus += (skill.effect.value - 1.0);
            }
        }
        return totalBonus;
    },

    // ========================================
    // 宝箱出現確率のスキル補正を取得 (加算)
    // ========================================
    getTreasureChanceBonus() {
        let bonus = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'treasure_boost') {
                bonus += skill.effect.value;
            }
        }
        return bonus;
    },

    // ========================================
    // 宝箱報酬量の倍率を取得 (1.0 + ボーナス)
    // ========================================
    getTreasureQuantityMultiplier() {
        let multiplier = 1.0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'treasure_quantity') {
                multiplier += skill.effect.value;
            }
        }
        return multiplier;
    },

    // ========================================
    // 宝箱報酬質の倍率を取得 (乗算)
    // ========================================
    getTreasureQualityMultiplier() {
        let multiplier = 1.0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'treasure_quality') {
                multiplier *= skill.effect.value;
            }
        }
        return multiplier;
    },

    // ========================================
    // ダブルキャッチ (2匹釣り) 確率を取得
    // ========================================
    getMultiCatch2Chance() {
        let chance = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'multi_catch_2') {
                chance += skill.effect.value;
            }
        }
        return Math.min(chance, 1.0);
    },

    // ========================================
    // トリプルキャッチ (3匹釣り) 確率を取得
    // ========================================
    getMultiCatch3Chance() {
        let chance = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'multi_catch_3') {
                chance += skill.effect.value;
            }
        }
        return Math.min(chance, 1.0);
    },

    // ========================================
    // ミッション目標数の修正値を取得
    // ========================================
    getMissionTargetModifier() {
        let modifier = 1.0;

        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (!skill) continue;

            if (skill.effect.type === 'stoic') {
                modifier *= skill.effect.targetMult;
            } else if (skill.effect.type === 'casual') {
                modifier *= skill.effect.targetMult;
            }
        }

        return modifier;
    },

    // ========================================
    // ミッション報酬の修正値を取得
    // ========================================
    getMissionRewardModifier() {
        let modifier = 1.0;

        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (!skill) continue;

            if (skill.effect.type === 'mission_reward') {
                modifier *= skill.effect.value;
            } else if (skill.effect.type === 'stoic') {
                modifier *= skill.effect.rewardMult;
            } else if (skill.effect.type === 'casual') {
                modifier *= skill.effect.rewardMult;
            }
        }

        return modifier;
    },

    // ========================================
    // スキル増幅率を取得（増幅の心得）
    // ========================================
    getSkillAmplifier() {
        let amplifier = 1.0;

        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'skill_amplifier') {
                amplifier += skill.effect.value;
            }
        }

        return amplifier;
    },

    // ========================================
    // 魚をインベントリに追加
    // ========================================
    addFish(fish) {
        const fishData = {
            id: fish.id,
            name: fish.name,
            price: fish.price,
            power: fish.power,
            rarity: fish.rarity,
            hasTitle: fish.hasTitle || false,
            caughtAt: new Date().toISOString()
        };

        this.inventory.push(fishData);

        // 図鑑データを更新
        if (!this.encyclopedia[fish.id]) {
            this.encyclopedia[fish.id] = { count: 0, hasSpecial: false, specialCount: 0 };
        }
        this.encyclopedia[fish.id].count++;

        if (fish.hasTitle) {
            this.encyclopedia[fish.id].hasSpecial = true;
            this.encyclopedia[fish.id].specialCount = (this.encyclopedia[fish.id].specialCount || 0) + 1;
        }

        this.totalFishCaught++;

        // ランク統計の更新
        if (this.caughtByRank[fish.rarity] !== undefined) {
            this.caughtByRank[fish.rarity]++;
        }

        // 最大の魚を更新
        if (!this.biggestFish || fish.power > this.biggestFish.power) {
            this.biggestFish = { name: fish.name, power: fish.power };
        }

        // オートセーブ
        SaveManager.save(this);
    },

    // ========================================
    // ガチャ結果の受け取り（コスト消費なしでスキル追加）
    // ========================================
    // ========================================
    // ガチャ結果の受け取り
    // ========================================
    gainGachaResult(item) {
        // IDのみ渡された場合の互換性維持 (文字列かどうか判定)
        const id = (typeof item === 'string') ? item : item.id;
        const category = item.category || 'skill';

        if (category === 'skill') {
            this.skillInventory[id] = (this.skillInventory[id] || 0) + 1;
            this.totalSkills++;
        } else if (category === 'skin') {
            if (!this.unlockedSkins.includes(id)) {
                this.unlockedSkins.push(id);
            }
        } else if (category === 'sky') {
            if (!this.unlockedSkies.includes(id)) {
                this.unlockedSkies.push(id);
            }
        }

        // オートセーブ
        SaveManager.save(this);
    },

    // ========================================
    // 所持魚をすべて売却
    // ========================================
    // ========================================
    // ガチャリソース管理
    // ========================================
    canDrawGacha(cost, count) {
        // チケットで足りるかチェック
        if (this.gachaTickets >= count) return { can: true, method: 'ticket' };
        // コインで足りるかチェック
        if (this.money >= cost) return { can: true, method: 'money' };
        return { can: false };
    },

    consumeGachaResources(cost, count) {
        if (this.gachaTickets >= count) {
            this.gachaTickets -= count;
            return 'ticket';
        } else {
            this.money -= cost;
            return 'money';
        }
    },

    sellAllFish() {
        const priceBonus = this.getPriceBonus();
        let totalEarned = 0;

        for (const fish of this.inventory) {
            const finalPrice = Math.floor(fish.price * (1 + priceBonus));
            totalEarned += finalPrice;
        }

        this.money += totalEarned;
        this.totalMoneyEarned += totalEarned;
        this.totalCoinsEarned += totalEarned;
        this.inventory = [];

        // オートセーブ
        SaveManager.save(this);

        return totalEarned;
    },

    // ========================================
    // 釣り竿の購入
    // ========================================
    buyRod(rodIndex) {
        const rod = GAME_DATA.RODS[rodIndex];
        if (!rod || this.money < rod.price) {
            return false;
        }

        // 既にアンロック済みならスキップ
        if (this.unlockedRods.includes(rodIndex)) {
            return false;
        }

        this.money -= rod.price;
        this.unlockedRods.push(rodIndex);

        // スキンをアンロック
        this.unlockSkinByRodId(rod.id);

        // オートセーブ
        SaveManager.save(this);

        return true;
    },

    // ========================================
    // 現在の空（背景）を取得
    // ========================================
    getCurrentSky() {
        if (!this.selectedSky) return GAME_DATA.SKIES[0];
        return GAME_DATA.SKIES.find(s => s.id === this.selectedSky) || GAME_DATA.SKIES[0];
    },

    // ========================================
    // 空（背景）の購入
    // ========================================
    buySky(skyId) {
        const sky = GAME_DATA.SKIES.find(s => s.id === skyId);
        if (!sky || this.money < sky.price) {
            return false;
        }

        // 既にアンロック済みならスキップ
        if (this.unlockedSkies.includes(skyId)) {
            return false;
        }

        this.money -= sky.price;
        this.unlockedSkies.push(skyId);

        // オートセーブ
        SaveManager.save(this);

        return true;
    },

    // ========================================
    // 空（背景）の装備
    // ========================================
    equipSky(skyId) {
        if (!this.unlockedSkies.includes(skyId)) {
            return false;
        }

        this.selectedSky = skyId;
        SaveManager.save(this);
        return true;
    },

    // ========================================
    // 釣り竿の装備切り替え
    // ========================================
    equipRod(rodIndex) {
        if (!this.unlockedRods.includes(rodIndex)) {
            return false;
        }

        this.rodRankIndex = rodIndex;

        // 星の数をリセット（竿ごとに星は別管理としない場合）
        // 仕様によってはここを調整

        // 装着スキルをスロット数に合わせて調整
        while (this.equippedSkills.length > this.rodStars) {
            this.equippedSkills.pop();
        }

        SaveManager.save(this);
        return true;
    },

    // ========================================
    // 釣り竿の強化（星を増やす）
    // ========================================
    upgradeRod() {
        if (this.rodStars >= 5) {
            return { success: false, message: '既に最大まで強化されています' };
        }

        const rod = this.getCurrentRod();
        const cost = rod.upgradeCosts[this.rodStars];

        if (this.money < cost) {
            return { success: false, message: 'お金が足りません' };
        }

        this.money -= cost;
        this.rodStars++;

        // オートセーブ
        SaveManager.save(this);

        return { success: true, newStars: this.rodStars };
    },

    // ========================================
    // 次の強化コストを取得
    // ========================================
    getUpgradeCost() {
        if (this.rodStars >= 5) return null;
        const rod = this.getCurrentRod();
        return rod.upgradeCosts[this.rodStars];
    },

    // ========================================
    // スキルの購入
    // ========================================
    buySkill(skillId) {
        const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
        if (!skill || this.money < skill.price) {
            return false;
        }

        this.money -= skill.price;

        // 所持数を加算
        this.skillInventory[skillId] = (this.skillInventory[skillId] || 0) + 1;
        this.totalSkills++;

        // オートセーブ
        SaveManager.save(this);

        return true;
    },

    // ========================================
    // スキルの追加
    // ========================================
    addSkill(skillId) {
        this.skillInventory[skillId] = (this.skillInventory[skillId] || 0) + 1;
        SaveManager.save(this);
    },

    // ========================================
    // スキル所持判定
    // ========================================
    hasSkill(skillId) {
        return (this.skillInventory[skillId] || 0) > 0;
    },

    // ========================================
    // 現在のスキルの所持数を取得
    // ========================================
    getSkillCount(skillId) {
        return this.skillInventory[skillId] || 0;
    },

    // ========================================
    // 現在装備中の特定スキルの数を取得
    // ========================================
    getEquippedSkillCount(skillId) {
        return this.equippedSkills.filter(id => id === skillId).length;
    },

    // ========================================
    // スキルの装着
    // ========================================
    equipSkill(skillId) {
        // 所持数チェック
        const ownedCount = this.getSkillCount(skillId);
        const equippedCount = this.getEquippedSkillCount(skillId);

        if (equippedCount >= ownedCount) {
            return false;
        }

        // スロット空きチェック
        if (this.equippedSkills.length >= this.getSkillSlots()) {
            return false;
        }

        this.equippedSkills.push(skillId);

        // オートセーブ
        SaveManager.save(this);

        return true;
    },

    // ========================================
    // スキルの取り外し
    // ========================================
    unequipSkill(skillId) {
        const index = this.equippedSkills.indexOf(skillId);
        if (index === -1) {
            return false;
        }

        this.equippedSkills.splice(index, 1);

        // オートセーブ
        SaveManager.save(this);

        return true;
    },

    // ========================================
    // 餌の購入
    // ========================================
    buyBait(baitId, quantity = null) {
        const bait = GAME_DATA.BAITS.find(b => b.id === baitId);
        if (!bait) return false;

        // 指定数量、またはデフォルト数量
        const amount = quantity || bait.quantity;
        // 価格計算（数量指定の場合は比例計算、デフォルトの場合は設定価格）
        // 注: 現在のGAME_DATAでは単価が定義されていないため、セット価格から算出する必要があるかもですが
        // 一旦、購入時は基本セット単位とします。
        // 要望により「個数を選べる」とあるので、単価計算ロジックが必要。
        // ここでは単純に bait.price は bait.quantity 個分の価格と仮定して、単価を算出します。
        const unitPrice = bait.quantity > 0 ? bait.price / bait.quantity : 0;
        const totalCost = Math.ceil(unitPrice * amount);

        if (this.money < totalCost) {
            return false;
        }

        this.money -= totalCost;

        // 餌を追加
        if (this.baitInventory[baitId] === -1) {
            // 無限の場合は増えない
        } else {
            this.baitInventory[baitId] = (this.baitInventory[baitId] || 0) + amount;
        }

        // 現在選択中の餌がこれなら切り替え不要、でなければ...自動で切り替えるかはUI次第だが
        // 購入した餌をすぐに使いたいケースが多いので切り替えても良い
        this.baitType = baitId;

        // オートセーブ
        SaveManager.save(this);

        return true;
    },

    // ========================================
    // 餌の追加（宝箱などから）
    // ========================================
    addBait(baitId, amount) {
        if (!amount || amount <= 0) return;

        // 餌を追加
        if (this.baitInventory[baitId] === -1) {
            // 無限の場合は増えない
        } else {
            this.baitInventory[baitId] = (this.baitInventory[baitId] || 0) + amount;
        }

        // オートセーブ
        SaveManager.save(this);
    },

    // ========================================
    // フィーバー蓄積ボーナス取得 (加算)
    // ========================================
    getFeverChargeBonus() {
        let bonus = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'fever_charge') {
                bonus += skill.effect.value;
            }
        }
        return bonus;
    },

    // ========================================
    // フィーバー延長ボーナス取得 (進行確率現象)
    // ========================================
    getFeverLongBonus() {
        let bonus = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'fever_long') {
                bonus += skill.effect.value;
            }
        }
        return bonus;
    },

    // ========================================
    // ボートイベント出現率のスキル補正を取得
    // ========================================
    getBoatEventBonus() {
        let bonus = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'boat_event_boost') {
                bonus += skill.effect.value;
            }
        }
        return bonus;
    },

    // ========================================
    // 鳥イベント出現率のスキル補正を取得
    // ========================================
    getBirdEventBonus() {
        let bonus = 0;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'bird_event_boost') {
                bonus += skill.effect.value;
            }
        }
        return bonus;
    },

    // ========================================
    // フィーバータイプ偏りボーナス取得
    // ========================================
    getFeverBiasBonus(type) {
        let bonus = 0;
        const targetType = type === 'sun' ? 'fever_bias_sun' : 'fever_bias_moon';
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === targetType) {
                bonus += skill.effect.value;
            }
        }
        return bonus;
    },

    // ========================================
    // 現在の餌の所持数を取得
    // ========================================
    getCurrentBaitCount() {
        if (!this.baitType) return 0;
        // 未定義の場合は0を返す
        return this.baitInventory[this.baitType] ?? 0;
    },

    // ========================================
    // 餌の切り替え
    // ========================================
    switchBait(direction) {
        const baits = GAME_DATA.BAITS;
        const currentIndex = baits.findIndex(b => b.id === this.baitType);
        if (currentIndex === -1) {
            this.baitType = baits[0].id;
            return;
        }

        let nextIndex = currentIndex + direction;
        if (nextIndex >= baits.length) {
            nextIndex = 0;
        } else if (nextIndex < 0) {
            nextIndex = baits.length - 1;
        }

        this.baitType = baits[nextIndex].id;
        SaveManager.save(this);
    },

    // ========================================
    // 餌を1つ消費
    // ========================================
    useBait(isSuccess = true) {
        if (!this.baitType) return false;

        const bait = GAME_DATA.BAITS.find(b => b.id === this.baitType);
        if (!bait) return false;

        const currentCount = this.baitInventory[this.baitType];

        // 無限リソース
        if (currentCount === -1) return true;

        // C, B ランクは失敗した時は消費しない
        if ((bait.rank === 'C' || bait.rank === 'B') && !isSuccess) {
            return true;
        }

        // それ以外（A, S ランク、または C, B の成功時）は消費
        if (currentCount <= 0) {
            return false;
        }

        // 餌の達人スキルの判定 (成功時のみ)
        if (isSuccess) {
            const saveChance = this.getBaitSaveChance();
            if (Math.random() < saveChance) {
                console.log('✨ 餌の達人発動！餌を消費しませんでした');
                return true;
            }
        }

        this.baitInventory[this.baitType]--;

        // オートセーブ
        SaveManager.save(this);
        return true;
    },

    // ========================================
    // スキン関連
    // ========================================

    // 現在のスキン情報を取得
    getCurrentSkin() {
        return GAME_DATA.SKINS.find(s => s.id === this.selectedSkin) || GAME_DATA.SKINS[0];
    },

    // スキンを装備
    equipSkin(skinId) {
        if (!this.unlockedSkins.includes(skinId)) {
            return false;
        }
        this.selectedSkin = skinId;
        SaveManager.save(this);
        return true;
    },

    // ロッドIDに関連するスキンをアンロック
    unlockSkinByRodId(rodId) {
        const skin = GAME_DATA.SKINS.find(s => s.rodId === rodId);
        if (skin && !this.unlockedSkins.includes(skin.id)) {
            this.unlockedSkins.push(skin.id);
            console.log(`✨ スキン解放: ${skin.name}`);
            return true;
        }
        return false;
    },

    // ========================================
    // 達人の針（赤ゾーン確定）所持判定
    // ========================================
    hasPerfectMaster() {
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'perfect_catch') {
                return true;
            }
        }
        return false;
    },

    // ========================================
    // フィーバーの進行
    // ========================================
    progressFever(isGuaranteed = false) {
        // ========================================
        // フィーバー中の処理 (Lv6〜)
        // ========================================
        if (this.fever.isActive) {
            // 変動確率の抽選 (0〜100)
            const roll = Math.random() * 100;

            // 確率調整: 早く終わらせるが、リセットもありにする
            // 進行: 75%
            // 維持: 10%
            // 後退: 10%
            // リセット: 5%

            // 確定フラグがある場合は進行 (レベルアップ)
            if (isGuaranteed) {
                this.fever.value++;
            } else if (roll < 75) {
                // 進行 (75%)
                this.fever.value++;
            } else if (roll < 85) {
                // 維持 (10%)
                // ±0
            } else if (roll < 95) {
                // 後退 (10%)
                this.fever.value--;
                if (this.fever.value < 6) this.fever.value = 6; // Lv6未満にはならない
            } else {
                // リセット (5%)
                this.fever.value = 6; // スタート位置に戻る
                return { message: 'reset' }; // 大当たり演出用
            }

            // 終了判定 (Lv12を超えたら終了)
            if (this.fever.value > 12) {
                this.fever.isActive = false;
                this.fever.value = 0;
                this.fever.type = null;
                return { message: 'end' };
            }
            return { message: 'active' };
        }

        // ========================================
        // ゲージ蓄積中の処理 (〜Lv6)
        // ========================================
        else {
            // 20%の確率で蓄積 (または確定フラグがあれば100%)
            if (isGuaranteed || Math.random() < 0.2) {
                this.fever.value++;

                // 初めて溜まった(Lv1)タイミングでタイプを決定
                if (this.fever.value === 1) {
                    // スキル偏向の適用 (基本50%)
                    const sunBonus = this.getFeverBiasBonus('sun');
                    const moonBonus = this.getFeverBiasBonus('moon');

                    // 太陽の確率: 0.5 + 太陽ボーナス - 月ボーナス
                    const sunChance = 0.5 + sunBonus - moonBonus;

                    this.fever.type = Math.random() < sunChance ? 'sun' : 'moon';
                    console.log(`🔥 フィーバータイプ抽選: Sun ${Math.round(sunChance * 100)}% (Base 50% + ${Math.round(sunBonus * 100)}% - ${Math.round(moonBonus * 100)}%)`);
                }

                // 発動判定 (Lv6到達)
                if (this.fever.value >= 6) {
                    this.fever.isActive = true;
                    this.fever.value = 6;
                    return { message: 'start', type: this.fever.type };
                }
                return { message: 'charging' };
            }
            // 蓄積しなかった
            return { message: 'none' };
        }
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.GameState = GameState;
}
