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
        } else {
            // 新規ゲーム
            const defaultData = SaveManager.getDefaultData();
            this.init(defaultData);
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
    // 魚をインベントリに追加
    // ========================================
    addFish(fish) {
        this.inventory.push({
            id: fish.id,
            name: fish.name,
            price: fish.price,
            power: fish.power,
            rarity: fish.rarity,
            caughtAt: new Date().toISOString()
        });

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
    useBait() {
        if (this.baitCount <= 0) {
            this.baitType = null;
            return false;
        }

        this.baitCount--;
        if (this.baitCount <= 0) {
            this.baitType = null;
        }

        return true;
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.GameState = GameState;
}
