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
        const rareBonus = GameState.getRareBonus();
        const fishPool = [];

        // レア度に応じた重み付きプールを作成
        for (const fish of GAME_DATA.FISH) {
            let weight = fish.weight;
            const rarityMultiplier = GAME_DATA.RARITY_WEIGHTS[fish.rarity];

            // レアボーナスがある場合、レア度の高い魚の重みを増加
            if (rareBonus > 0 && fish.rarity !== 'common') {
                weight *= (1 + rareBonus);
            }

            weight *= rarityMultiplier;

            // 重みに応じてプールに追加
            const count = Math.max(1, Math.floor(weight * 10));
            for (let i = 0; i < count; i++) {
                fishPool.push(fish);
            }
        }

        // ランダムに抽選
        const index = Math.floor(Math.random() * fishPool.length);
        return fishPool[index];
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
            if (bait) {
                waitTimeReduction = bait.hitTimeReduction;
            }
        }

        // 待機時間を計算
        const baseWaitTime = GAME_DATA.FISHING_CONFIG.waitTimeMin +
            Math.random() * (GAME_DATA.FISHING_CONFIG.waitTimeMax - GAME_DATA.FISHING_CONFIG.waitTimeMin);
        const waitTime = baseWaitTime * (1 - waitTimeReduction);

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
    nibble() {
        this.state = 'nibble';

        // 揺れ回数を決定（スキルで固定 or ランダム3〜5回）
        const fixedCount = GameState.getNibbleFixCount();
        const shakeCount = fixedCount !== null ? fixedCount : 3 + Math.floor(Math.random() * 3);

        // 揺れの間隔をランダムに決定（100〜200ms）
        const shakeInterval = 100 + Math.floor(Math.random() * 100);

        // UIManagerにパラメータを渡してアニメーション開始
        UIManager.showNibble(shakeCount, shakeInterval);

        // 揺れ終了後にヒットタイミング
        const totalNibbleTime = shakeCount * shakeInterval + 100;  // +100msの余裕
        setTimeout(() => {
            this.hit();
        }, totalNibbleTime);
    },

    // ========================================
    // ヒット（ウキが沈む）
    // ========================================
    hit() {
        this.state = 'hit';
        UIManager.showHit();

        // ヒット判定可能時間を設定
        this.hitTimer = setTimeout(() => {
            // 時間切れで逃げられた
            this.state = 'idle';
            UIManager.showMissed('反応が遅かった！魚に逃げられた...');

            // 餌を消費
            if (GameState.baitType) {
                GameState.useBait();
            }
        }, GAME_DATA.FISHING_CONFIG.hitWindowTime);
    },

    // ========================================
    // クリック処理（メイン入力）
    // ========================================
    onClick() {
        switch (this.state) {
            case 'idle':
                // キャスト開始
                this.cast();
                break;

            case 'waiting':
            case 'nibble':
                // 早すぎるクリック - すべてのタイマーをクリア
                this.cleanupTimers();
                this.state = 'idle';
                UIManager.showMissed('タイミングが早すぎた！');
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
        const redZoneWidth = config.redZoneWidthMin +
            (powerRatio * (config.redZoneWidthMax - config.redZoneWidthMin));

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
        // アニメーション停止
        cancelAnimationFrame(this.gaugeAnimationId);

        // ゾーン判定
        const zone = UIManager.getGaugeZone(this.gaugePosition);
        const config = GAME_DATA.GAUGE_CONFIG.zones[zone];

        // 捕獲確率を計算
        let catchRate = config.catchRate.min +
            Math.random() * (config.catchRate.max - config.catchRate.min);

        // スキルボーナス
        catchRate += GameState.getCatchBonus();
        catchRate = Math.min(1, catchRate);  // 100%が上限

        console.log(`🎯 ゾーン: ${zone}, 捕獲率: ${(catchRate * 100).toFixed(1)}%`);

        // 判定
        if (Math.random() < catchRate) {
            this.catchSuccess();
        } else {
            this.catchFailed();
        }
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
            GameState.useBait();
        }

        // UI表示
        UIManager.showCatchSuccess(this.currentFish);

        console.log(`🎉 ${this.currentFish.name}を釣り上げた！`);

        // 少し待ってから待機状態に戻る
        setTimeout(() => {
            this.state = 'idle';
            UIManager.showIdle();
        }, 2000);
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
            GameState.useBait();
        }

        // UI表示
        UIManager.showCatchFailed(this.currentFish);

        console.log(`💔 ${this.currentFish.name}に逃げられた...`);

        // 少し待ってから待機状態に戻る
        setTimeout(() => {
            this.state = 'idle';
            UIManager.showIdle();
        }, 1500);
    },

    // ========================================
    // タイマー・アニメーションのクリーンアップ
    // ========================================
    cleanupTimers() {
        clearTimeout(this.waitTimer);
        clearTimeout(this.hitTimer);
        cancelAnimationFrame(this.gaugeAnimationId);
        this.waitTimer = null;
        this.hitTimer = null;
        this.gaugeAnimationId = null;
    },

    // ========================================
    // 釣りを中断（ショップ画面に移動など）
    // ========================================
    abort() {
        clearTimeout(this.waitTimer);
        clearTimeout(this.hitTimer);
        cancelAnimationFrame(this.gaugeAnimationId);
        this.state = 'idle';
        this.currentFish = null;
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.FishingGame = FishingGame;
}
