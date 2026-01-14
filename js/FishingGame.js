// 釣りゲームのメインロジック
// 釣りサイクル、パワー判定、ゲージバトルを管理

const FishingGame = {
    // ========================================
    // ゲーム状態
    // ========================================
    state: 'idle',  // idle, casting, waiting, nibble, hit, gaugeBattle, result
    currentFish: null,
    gaugePosition: 0,
    gaugeDirection: 1,
    gaugeSpeed: 0,
    gaugeAnimationId: null,
    waitTimer: null,
    nibbleTimer: null,
    hitTimer: null,

    // ========================================
    // 初期化
    // ========================================
    init() {
        this.state = 'idle';
        this.currentFish = null;
        console.log('🎣 釣りゲームを初期化しました');
    },

    // ========================================
    // 魚の抽選
    // ========================================
    selectFish() {
        const bait = GAME_DATA.BAITS.find(b => b.id === GameState.baitType) || GAME_DATA.BAITS[0]; // デフォルトD
        const fishPool = [];

        // レアボーナス（スキル由来のみ）
        const skillRareBonus = GameState.equippedSkills.reduce((bonus, skillId) => {
            const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
            return bonus + (skill && skill.effect.type === 'rare_boost' ? skill.effect.value : 0);
        }, 0);

        for (const fish of GAME_DATA.FISH) {
            let weight = fish.weight * GAME_DATA.RARITY_WEIGHTS[fish.rarity];

            // 餌ランクによる出現制限と補正
            if (bait.rank === 'D') {
                if (fish.rarity === 'A' || fish.rarity === 'S') continue; // A, Sは釣れない
                if (fish.rarity === 'D') weight *= 2.0; // Dが釣れやすい
                if (fish.rarity === 'C') weight *= 0.5; // たまに
                if (fish.rarity === 'B') weight *= 0.1; // まれに
            } else {
                // その他のランクの餌は、自分と同じランクの出現率を大幅に上げる
                if (fish.rarity === bait.rank) {
                    weight *= 10.0;
                }
            }

            // スキルボーナス
            if (skillRareBonus > 0 && fish.rarity !== 'D') {
                weight *= (1 + skillRareBonus);
            }

            // 大物狙いボーナス
            if ((fish.rarity === 'A' || fish.rarity === 'S') && GameState.getBigGameBonus() > 1) {
                weight *= GameState.getBigGameBonus();
            }

            // 重みに応じてプールに追加
            const count = Math.max(1, Math.floor(weight * 10));
            for (let i = 0; i < count; i++) {
                fishPool.push(fish);
            }
        }

        // ランダムに抽選
        const index = Math.floor(Math.random() * fishPool.length);
        const selectedFish = { ...fishPool[index] };

        // 称号付きの抽選
        const titleChanceMult = GameState.getTitleChanceMultiplier();
        if (Math.random() < GAME_DATA.TITLE_CONFIG.chance * titleChanceMult) {
            selectedFish.hasTitle = true;
            selectedFish.name = `${selectedFish.specialTitle}${selectedFish.name}`;
            selectedFish.price = Math.floor(selectedFish.price * GAME_DATA.TITLE_CONFIG.priceMultiplier);
            console.log(`✨ 称号付き出現！: ${selectedFish.name} (倍率: ${titleChanceMult})`);
        }

        return selectedFish;
    },

    // ========================================
    // キャスト（ウキを投げる）
    // ========================================
    cast() {
        if (this.state !== 'idle') return false;

        this.state = 'casting';
        UIManager.showCasting();

        // 魚を抽選
        this.currentFish = this.selectFish();
        console.log('🐟 抽選された魚:', this.currentFish.name);

        // 餌を使用している場合は時間短縮
        let waitTimeReduction = 0;
        if (GameState.baitType) {
            const bait = GAME_DATA.BAITS.find(b => b.id === GameState.baitType);
            if (bait && bait.hitTimeReduction) {
                waitTimeReduction = bait.hitTimeReduction;
            }
        }

        // 待機時間を計算
        const baseWaitTime = GAME_DATA.FISHING_CONFIG.waitTimeMin +
            Math.random() * (GAME_DATA.FISHING_CONFIG.waitTimeMax - GAME_DATA.FISHING_CONFIG.waitTimeMin);

        // 忍耐力スキルの反映
        const patienceReduction = GameState.getWaitTimeReduction();
        const waitTime = baseWaitTime * (1 - waitTimeReduction) * (1 - patienceReduction);

        // キャストアニメーション後に待機状態へ
        setTimeout(() => {
            this.state = 'waiting';
            UIManager.showWaiting();

            // 待機後に予兆（ウキ揺れ）が始まる
            this.waitTimer = setTimeout(() => {
                this.nibble();
            }, waitTime);
        }, 500);

        return true;
    },

    // ========================================
    // 予兆（ウキが揺れる）
    // ========================================
    nibble(currentCount = 0, targetCount = null) {
        if (targetCount === null) {
            this.state = 'nibble';
            UIManager.showNibble();

            // 揺れ回数を決定（スキルで固定 or 設定範囲内でランダム）
            const fixedCount = GameState.getNibbleFixCount();
            targetCount = fixedCount !== null ? fixedCount :
                GAME_DATA.FISHING_CONFIG.nibbleCountMin +
                Math.floor(Math.random() * (GAME_DATA.FISHING_CONFIG.nibbleCountMax - GAME_DATA.FISHING_CONFIG.nibbleCountMin + 1));

            console.log(`🎣 予兆開始: 合計 ${targetCount} 回揺れます`);
        }

        if (currentCount < targetCount) {
            // ウキを1回揺らす
            UIManager.triggerBobberShake(GAME_DATA.FISHING_CONFIG.nibbleShakeDuration);

            // 次の揺れ（またはヒット）までの間隔をランダムに決定（500〜1000ms）
            const interval = GAME_DATA.FISHING_CONFIG.nibbleIntervalMin +
                Math.floor(Math.random() * (GAME_DATA.FISHING_CONFIG.nibbleIntervalMax - GAME_DATA.FISHING_CONFIG.nibbleIntervalMin));

            this.nibbleTimer = setTimeout(() => {
                this.nibble(currentCount + 1, targetCount);
            }, interval);
        } else {
            // 全ての揺れが終了後にヒットタイミングへ
            this.hit();
        }
    },

    // ========================================
    // ヒット（ウキが沈む）
    // ========================================
    hit() {
        this.state = 'hit';
        UIManager.showHit();

        // ヒット判定可能時間を設定 (スキルによる倍率を反映)
        const baseHitWindow = GAME_DATA.FISHING_CONFIG.hitWindowTime;
        const multiplier = GameState.getHitWindowMultiplier();
        const finalHitWindow = baseHitWindow * multiplier;

        this.hitTimer = setTimeout(() => {
            // 時間切れで逃げられた
            this.state = 'idle';
            UIManager.showMissed('反応が遅かった！魚に逃げられた...');

            // 餌を消費（ヒットを逃した＝失敗）
            if (GameState.baitType) {
                GameState.useBait(false);
            }
        }, finalHitWindow);
    },

    // ========================================
    // クリック処理（メイン入力）
    // ========================================
    onClick() {
        if (this.isProcessing) return;

        switch (this.state) {
            case 'idle':
                // キャスト開始
                this.cast();
                break;

            case 'casting':
            case 'result':
                // キャスト中・結果表示中は無視
                break;

            case 'waiting':
            case 'nibble':
                // 早すぎるクリック - 失敗扱いにする
                this.cleanupTimers();
                this.earlyClickFailed();
                break;

            case 'hit':
                // ヒット成功
                clearTimeout(this.hitTimer);
                this.checkPower();
                break;

            case 'gaugeBattle':
                // ゲージバトル中のクリック
                this.resolveCatch();
                break;
        }
    },

    // ========================================
    // パワー判定
    // ========================================
    checkPower() {
        const playerPower = GameState.getTotalPower();
        const fishPower = this.currentFish.power;

        console.log(`⚡ パワー判定: プレイヤー ${playerPower} vs 魚 ${fishPower}`);

        if (playerPower >= fishPower) {
            // 即座に釣り上げ成功
            this.catchSuccess();
        } else {
            // ゲージバトルへ移行
            this.startGaugeBattle(playerPower, fishPower);
        }
    },

    // ========================================
    // ゲージバトル開始
    // ========================================
    startGaugeBattle(playerPower, fishPower) {
        this.state = 'gaugeBattle';

        // パワー差に基づいてゲージ設定を計算
        const powerRatio = playerPower / fishPower;  // 0〜1未満

        // 速度：パワー差が小さいほど遅い
        const config = GAME_DATA.GAUGE_CONFIG;
        const speedMultiplier = config.speedMultiplierMax -
            (powerRatio * (config.speedMultiplierMax - config.speedMultiplierMin));

        // スキルによる減速
        const slowBonus = GameState.getGaugeSlowBonus();
        this.gaugeSpeed = config.baseSpeed * speedMultiplier * (1 - slowBonus);

        // 赤ゾーンの幅：パワー差が小さいほど広い
        let redZoneWidth = config.redZoneWidthMin +
            (powerRatio * (config.redZoneWidthMax - config.redZoneWidthMin));

        // テクニシャンスキルの反映
        const redZoneBonus = GameState.getRedZoneBonus();
        redZoneWidth *= (1 + redZoneBonus);
        redZoneWidth = Math.min(redZoneWidth, 40); // 最大幅を制限

        // UIにゲージを表示
        UIManager.showGaugeBattle(this.currentFish, redZoneWidth);

        // ゲージアニメーション開始
        this.gaugePosition = 0;
        this.gaugeDirection = 1;
        this.animateGauge();
    },

    // ========================================
    // ゲージアニメーション
    // ========================================
    animateGauge() {
        this.gaugePosition += this.gaugeSpeed * this.gaugeDirection;

        // 端で反転
        if (this.gaugePosition >= 100) {
            this.gaugePosition = 100;
            this.gaugeDirection = -1;
        } else if (this.gaugePosition <= 0) {
            this.gaugePosition = 0;
            this.gaugeDirection = 1;
        }

        // UIを更新
        UIManager.updateGaugePosition(this.gaugePosition);

        // 次のフレーム
        this.gaugeAnimationId = requestAnimationFrame(() => this.animateGauge());
    },

    // ========================================
    // ゲージバトル解決
    // ========================================
    resolveCatch() {
        // 二重クリック防止
        this.isProcessing = true;

        // アニメーション停止
        cancelAnimationFrame(this.gaugeAnimationId);

        // ゾーン判定
        let zone = UIManager.getGaugeZone(this.gaugePosition);

        // 起死回生スキルの反映
        if (zone === 'white') {
            const secondChanceRate = GameState.getSecondChanceRate();
            if (Math.random() < secondChanceRate) {
                zone = 'green';
                console.log('⚡ 起死回生発動！白ゾーンを成功扱いに変更');
            }
        }

        const config = GAME_DATA.GAUGE_CONFIG.zones[zone];

        // 捕獲確率を計算
        let catchRate = config.catchRate.min +
            Math.random() * (config.catchRate.max - config.catchRate.min);

        // スキルボーナス
        catchRate += GameState.getCatchBonus();
        catchRate = Math.min(1, catchRate);  // 100%が上限

        console.log(`🎯 ゾーン: ${zone}, 捕獲率: ${(catchRate * 100).toFixed(1)}%`);

        // 少し停止して見せてから結果を表示
        setTimeout(() => {
            this.isProcessing = false;
            if (Math.random() < catchRate) {
                this.catchSuccess();
            } else {
                this.catchFailed();
            }
        }, 1000);
    },

    // ========================================
    // 釣り上げ成功
    // ========================================
    catchSuccess() {
        this.state = 'result';

        // インベントリに追加
        GameState.addFish(this.currentFish);

        // 餌を消費
        if (GameState.baitType) {
            GameState.useBait(true);
        }

        // UI表示（ユーザーが閉じたらidleに戻る）
        UIManager.showCatchSuccess(this.currentFish, () => {
            this.state = 'idle';
            UIManager.showIdle();
        });

        console.log(`🎉 ${this.currentFish.name}を釣り上げた！`);
    },

    // ========================================
    // 早すぎるクリックで失敗
    // ========================================
    earlyClickFailed() {
        this.state = 'result';

        // 餌を消費
        if (GameState.baitType) {
            GameState.useBait(false);
        }

        // UI表示（簡易メッセージ）
        UIManager.showMissed('タイミングが早すぎた！');

        console.log('💔 タイミングが早すぎた！');

        // 少し待ってから待機状態に戻る
        setTimeout(() => {
            this.state = 'idle';
            this.currentFish = null;
            UIManager.showIdle();
        }, 1500);
    },

    // ========================================
    // 釣り上げ失敗
    // ========================================
    catchFailed() {
        // すべてのタイマーとアニメーションをクリア
        this.cleanupTimers();

        this.state = 'result';

        // 餌を消費
        if (GameState.baitType) {
            GameState.useBait(false);
        }

        // UI表示（ユーザーが閉じたらidleに戻る）
        if (this.currentFish) {
            UIManager.showCatchFailed(this.currentFish, () => {
                this.state = 'idle';
                UIManager.showIdle();
            });
            console.log(`💔 ${this.currentFish.name}に逃げられた...`);
        } else {
            UIManager.showMissed('魚に逃げられた...');
            console.log('💔 魚に逃げられた...');
            // showMissedはタイムアウトで戻る
            setTimeout(() => {
                this.state = 'idle';
                UIManager.showIdle();
            }, 1500);
        }
    },

    // ========================================
    // タイマー・アニメーションのクリーンアップ
    // ========================================
    cleanupTimers() {
        clearTimeout(this.waitTimer);
        clearTimeout(this.nibbleTimer);
        clearTimeout(this.hitTimer);
        cancelAnimationFrame(this.gaugeAnimationId);
        this.waitTimer = null;
        this.nibbleTimer = null;
        this.hitTimer = null;
        this.gaugeAnimationId = null;
        this.isProcessing = false;
    },

    // ========================================
    // 釣りを中断（ショップ画面に移動など）
    // ========================================
    abort() {
        this.cleanupTimers();
        this.state = 'idle';
        this.currentFish = null;
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.FishingGame = FishingGame;
}
