// ゲーム状態管理
// プレイヤーの現在の状態を一元管理

const GameState = {
    // ========================================
    // 基本ステータス
    // ========================================
    money: 0,
    baitCount: 0,
    baitType: null,

    // ========================================
    // 釣り竿の状態
    // ========================================
    rodRankIndex: 0,
    rodStars: 0,
    equippedSkills: [],

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
    unlockedSkills: [],

    // ========================================
    // 統計情報
    // ========================================
    totalFishCaught: 0,
    totalMoneyEarned: 0,
    biggestFish: null,

    // ========================================
    // 初期化
    // ========================================
    init(saveData = null) {
        if (saveData) {
            // セーブデータから復元
            this.money = saveData.player.money;
            this.baitCount = saveData.player.baitCount;
            this.baitType = saveData.player.baitType;

            this.rodRankIndex = saveData.rod.rankIndex;
            this.rodStars = saveData.rod.stars;
            this.equippedSkills = [...saveData.rod.equippedSkills];

            this.inventory = [...saveData.inventory];

            this.unlockedRods = [...saveData.unlocked.rods];
            this.unlockedSkills = [...saveData.unlocked.skills];

            this.totalFishCaught = saveData.statistics.totalFishCaught;
            this.totalMoneyEarned = saveData.statistics.totalMoneyEarned;
            this.biggestFish = saveData.statistics.biggestFish;

            // 図鑑データを復元
            this.encyclopedia = saveData.encyclopedia ? { ...saveData.encyclopedia } : {};
        } else {
            // 新規ゲーム
            const defaultData = SaveManager.getDefaultData();
            this.init(defaultData);

            // Dランクの餌は初期状態で無限に使用可能（または最初から持っている）
            this.baitType = 'bait_d';
            this.baitCount = 1; // 表示上は1（内部的には消費されない）
        }

        console.log('🎮 ゲーム状態を初期化しました');
    },

    // ========================================
    // 現在の釣り竿データを取得
    // ========================================
    getCurrentRod() {
        return GAME_DATA.RODS[this.rodRankIndex];
    },

    // ========================================
    // 現在の総合パワーを計算
    // ========================================
    getTotalPower() {
        const rod = this.getCurrentRod();
        let power = rod.basePower + (rod.starPowerBonus * this.rodStars);

        // スキルボーナスを加算
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'power_boost') {
                power += skill.effect.value;
            }
        }

        return power;
    },

    // ========================================
    // スキルスロット数（＝星の数）
    // ========================================
    getSkillSlots() {
        return this.rodStars;
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
                bonus += bait.rareBoost;
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
        let maxMult = 1;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'hit_window_mult') {
                maxMult = Math.max(maxMult, skill.effect.value);
            }
        }
        return maxMult;
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
        return reduction;
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
        return chance;
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
        return rate;
    },

    // ========================================
    // 称号出現率の倍率を取得
    // ========================================
    getTitleChanceMultiplier() {
        let multiplier = 1;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'title_boost') {
                // 重複した場合は加算ではなく乗算、あるいは最大のものを採用
                // ここでは分かりやすく最大の倍率を採用する
                multiplier = Math.max(multiplier, skill.effect.value);
            }
        }
        return multiplier;
    },

    // ========================================
    // 大物出現率のスキル補正を取得
    // ========================================
    getBigGameBonus() {
        let bonus = 1;
        for (const skillId of this.equippedSkills) {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            if (skill && skill.effect.type === 'big_game_boost') {
                bonus = Math.max(bonus, skill.effect.value);
            }
        }
        return bonus;
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

        // 最大の魚を更新
        if (!this.biggestFish || fish.power > this.biggestFish.power) {
            this.biggestFish = { name: fish.name, power: fish.power };
        }

        // オートセーブ
        SaveManager.save(this);
    },

    // ========================================
    // 所持魚をすべて売却
    // ========================================
    sellAllFish() {
        const priceBonus = this.getPriceBonus();
        let totalEarned = 0;

        for (const fish of this.inventory) {
            const finalPrice = Math.floor(fish.price * (1 + priceBonus));
            totalEarned += finalPrice;
        }

        this.money += totalEarned;
        this.totalMoneyEarned += totalEarned;
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

        // オートセーブ
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
        const cost = rod.upgradeBaseCost * (this.rodStars + 1);

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
        return rod.upgradeBaseCost * (this.rodStars + 1);
    },

    // ========================================
    // スキルの購入
    // ========================================
    buySkill(skillId) {
        const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
        if (!skill || this.money < skill.price) {
            return false;
        }

        if (this.unlockedSkills.includes(skillId)) {
            return false;
        }

        this.money -= skill.price;
        this.unlockedSkills.push(skillId);

        // オートセーブ
        SaveManager.save(this);

        return true;
    },

    // ========================================
    // スキルの装着
    // ========================================
    equipSkill(skillId) {
        if (!this.unlockedSkills.includes(skillId)) {
            return false;
        }

        if (this.equippedSkills.includes(skillId)) {
            return false;
        }

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
    buyBait(baitId) {
        const bait = GAME_DATA.BAITS.find(b => b.id === baitId);
        if (!bait || this.money < bait.price) {
            return false;
        }

        this.money -= bait.price;
        this.baitCount += bait.quantity;
        this.baitType = baitId;

        // オートセーブ
        SaveManager.save(this);

        return true;
    },

    // ========================================
    // 餌を1つ消費
    // ========================================
    useBait(isSuccess = true) {
        if (!this.baitType) return false;

        const bait = GAME_DATA.BAITS.find(b => b.id === this.baitType);
        if (!bait) return false;

        // Dランクは常に消費しない
        if (bait.rank === 'D') return true;

        // C, B ランクは失敗した時は消費しない
        if ((bait.rank === 'C' || bait.rank === 'B') && !isSuccess) {
            return true;
        }

        // それ以外（A, S ランク、または C, B の成功時）は消費
        if (this.baitCount <= 0) {
            this.baitType = null;
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

        this.baitCount--;
        if (this.baitCount <= 0) {
            this.baitType = null;
        }

        // オートセーブ
        SaveManager.save(this);
        return true;
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.GameState = GameState;
}
