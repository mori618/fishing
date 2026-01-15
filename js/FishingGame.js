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
    isGachaMode: false,
    gachaResults: [],

    // ========================================
    // 初期化
    // ========================================
    init() {
        this.state = 'idle';
        this.currentFish = null;
        this.isGachaMode = false;
        console.log('🎣 釣りゲームを初期化しました');
    },

    // ========================================
    // ガチャ開始
    // ========================================
    startGacha(results) {
        this.isGachaMode = true;
        this.gachaResults = results;
        UIManager.showScreen('fishing');

        // ガチャ用の初期化
        this.state = 'idle';
        this.currentFish = null;

        // 少し待ってから自動キャスト
        setTimeout(() => {
            this.cast();
        }, 500);
    },

    // ========================================
    // 魚の抽選
    // ========================================
    selectFish() {
        if (this.isGachaMode) {
            // ガチャモード時はダミーの「宝箱」のような魚データを返す
            return {
                id: 'gacha_chest',
                name: '謎の宝箱',
                rarity: 'S', // 演出用
                power: 100,
                price: 0,
                icon: 'inventory_2' // 宝箱アイコン
            };
        }

        const bait = GAME_DATA.BAITS.find(b => b.id === GameState.baitType) || GAME_DATA.BAITS[0]; // デフォルトD

        // 餌ごとのランク出現重み設定 (ユーザー要望に基づく)
        // D餌: D(80%), C(20%), S(1%) -> 重み: D:4, C:1, S:0.05 (合計5.05) ※比率維持のため補正
        // ユーザー指定: 5/4d, 5/1c, 100/1s -> D:0.8, C:0.2, S:0.01

        // C餌: 5/4c, 5/1d, 10/1b -> C:0.8, D:0.2, B:0.1

        // B餌: 5/4c [70%], 5/1b [17%], 10/1d [9%](称号UP), 20/1a [4%]
        // -> C:0.8, B:0.2, D:0.1, A:0.05

        // A餌: 5/3a [48%], 5/2b [32%], 5/1c [16%](称号UP), 20/1s [4%]
        // -> A:0.6, B:0.4, C:0.2, S:0.05

        // S餌: 5/3a [58%], 5/1s [19%], 5/1b [19%](称号UP), 30/1ss [3%]
        // -> A:0.6, S:0.2, B:0.2, SS:0.033

        const spawnWeights = {
            'D': { D: 0.8, C: 0.2, S: 0.01 },
            'C': { C: 0.8, D: 0.2, B: 0.1 },
            'B': { B: 0.8, C: 0.2, D: 0.1, A: 0.05 },
            'A': { A: 0.6, B: 0.4, C: 0.2, S: 0.05 },
            'S': { A: 0.6, S: 0.2, B: 0.2, SS: 0.033 }
        };

        const currentWeights = spawnWeights[bait.rank] || spawnWeights['D'];

        // 重みに基づいてランクを抽選
        let totalWeight = 0;
        for (const r in currentWeights) {
            totalWeight += currentWeights[r];
        }

        let random = Math.random() * totalWeight;
        let selectedRarity = 'D'; // デフォルト

        for (const r in currentWeights) {
            random -= currentWeights[r];
            if (random < 0) {
                selectedRarity = r;
                break;
            }
        }

        console.log(`🎲 ランク抽選: 餌=${bait.rank} -> 結果=${selectedRarity} (Weights: ${JSON.stringify(currentWeights)})`);

        // 選択されたランクの魚プールを作成
        const fishPool = GAME_DATA.FISH.filter(f => f.rarity === selectedRarity);

        // 万が一プールが空ならDランクから再抽選 (フェイルセーフ)
        if (fishPool.length === 0) {
            console.warn(`⚠ ランク ${selectedRarity} の魚が見つかりませんでした。Dランクから抽選します。`);
            return GAME_DATA.FISH[0];
        }

        // 同ランク内での抽選 (個別のweightを考慮)
        let poolTotalWeight = 0;
        fishPool.forEach(f => poolTotalWeight += f.weight);

        random = Math.random() * poolTotalWeight;
        let selectedFish = fishPool[0];

        for (const fish of fishPool) {
            random -= fish.weight;
            if (random < 0) {
                selectedFish = { ...fish }; // コピーを作成
                break;
            }
        }

        // 称号付きの抽選
        let titleChanceMult = GameState.getTitleChanceMultiplier();

        // ユーザー要望の「特定条件下での称号確率アップ」
        // B餌でDランク -> 称号UP
        // A餌でCランク -> 称号UP
        // S餌でBランク -> 称号UP
        if ((bait.rank === 'B' && selectedRarity === 'D') ||
            (bait.rank === 'A' && selectedRarity === 'C') ||
            (bait.rank === 'S' && selectedRarity === 'B')) {
            console.log('✨ 特定条件ボーナス: 称号確率アップ適用！');
            titleChanceMult *= 3.0; // 3倍に設定（調整可能）
        }

        if (Math.random() < GAME_DATA.TITLE_CONFIG.chance * titleChanceMult) {
            selectedFish.hasTitle = true;
            selectedFish.name = `${selectedFish.specialTitle}${selectedFish.name}`;
            selectedFish.price = Math.floor(selectedFish.price * GAME_DATA.TITLE_CONFIG.priceMultiplier);
            // 称号説明文があれば追加
            if (selectedFish.titleDescription) {
                selectedFish.originalDescription = selectedFish.description;
                // selectedFish.description = selectedFish.titleDescription; // 必要なら説明文も置き換え
            }
            console.log(`✨ 称号付き出現！: ${selectedFish.name} (倍率: ${titleChanceMult})`);
        }

        return selectedFish;
    },

    // ========================================
    // キャスト（ウキを投げる）
    // ========================================
    cast() {
        if (this.state !== 'idle') return false;

        // 餌のチェック (ガチャモードは無視)
        if (!this.isGachaMode) {
            const currentBaitCount = GameState.getCurrentBaitCount();
            if (currentBaitCount === 0) {
                UIManager.showBaitPurchaseDialog(GameState.baitType);
                return false;
            }
        }

        this.state = 'casting';
        UIManager.showCasting();

        // ガチャモードならメッセージ上書き
        if (this.isGachaMode) {
            const area = document.getElementById('fishing-area');
            if (area) area.querySelector('.instruction').textContent = 'ガチャ実行中...';
        }

        // 魚を抽選
        this.currentFish = this.selectFish();
        console.log('🐟 抽選された魚:', this.currentFish.name);

        // 待機時間を計算
        let waitTime;
        if (this.isGachaMode) {
            waitTime = 1500; // ガチャは短め
        } else {
            // 餌を使用している場合は時間短縮
            let waitTimeReduction = 0;
            if (GameState.baitType) {
                const bait = GAME_DATA.BAITS.find(b => b.id === GameState.baitType);
                if (bait && bait.hitTimeReduction) {
                    waitTimeReduction = bait.hitTimeReduction;
                }
            }

            const baseWaitTime = GAME_DATA.FISHING_CONFIG.waitTimeMin +
                Math.random() * (GAME_DATA.FISHING_CONFIG.waitTimeMax - GAME_DATA.FISHING_CONFIG.waitTimeMin);

            // 忍耐力スキルの反映
            const patienceReduction = GameState.getWaitTimeReduction();
            waitTime = baseWaitTime * (1 - waitTimeReduction) * (1 - patienceReduction);
        }

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

            if (this.isGachaMode) {
                // ガチャは2回固定
                targetCount = 2;
            } else {
                // 揺れ回数を決定
                const fixedCount = GameState.getNibbleFixCount();
                targetCount = fixedCount !== null ? fixedCount :
                    GAME_DATA.FISHING_CONFIG.nibbleCountMin +
                    Math.floor(Math.random() * (GAME_DATA.FISHING_CONFIG.nibbleCountMax - GAME_DATA.FISHING_CONFIG.nibbleCountMin + 1));
            }

            console.log(`🎣 予兆開始: 合計 ${targetCount} 回揺れます`);
        }

        if (currentCount < targetCount) {
            // ウキを1回揺らす
            UIManager.triggerBobberShake(GAME_DATA.FISHING_CONFIG.nibbleShakeDuration);

            // ガチャなら間隔短め
            const interval = this.isGachaMode ? 400 : GAME_DATA.FISHING_CONFIG.nibbleIntervalMin +
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

        if (this.isGachaMode) {
            // ガチャは即座に成功
            setTimeout(() => {
                this.catchSuccess();
            }, 500);
            return;
        }

        // ヒット判定可能時間を設定 (レア度とスキルによる倍率を反映)
        const config = GAME_DATA.FISHING_CONFIG;
        const rarityBase = config.hitWindowByRarity[this.currentFish.rarity] || config.hitWindowTime;
        const multiplier = GameState.getHitWindowMultiplier();
        const finalHitWindow = rarityBase * multiplier;

        console.log(`⏱ ヒット窓口: レア度ベース ${rarityBase}ms × 倍率 ${multiplier} = ${finalHitWindow}ms`);

        this.hitTimer = setTimeout(() => {
            // 時間切れで逃げられた
            this.state = 'idle';
            UIManager.showMissed('反応が遅かった！魚に逃げられた...');

            // 餌を消費（ヒットを逃した＝失敗）
            if (GameState.baitType) {
                GameState.useBait(false);
                UIManager.updateBaitInfo();
            }
        }, finalHitWindow);
    },

    // ========================================
    // クリック処理（メイン入力）
    // ========================================
    onClick() {
        if (this.isProcessing) return;
        // ガチャ中はクリック無効
        if (this.isGachaMode) return;

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
        if (this.isGachaMode) {
            this.catchSuccess();
            return;
        }

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

        if (this.isGachaMode) {
            // ガチャ結果表示へ
            UIManager.showGachaResult(this.gachaResults, () => {
                this.isGachaMode = false;
                this.state = 'idle';
                UIManager.showScreen('shop'); // ショップへ戻る
            });
            return;
        }

        // インベントリに追加
        GameState.addFish(this.currentFish);

        // 餌を消費
        if (GameState.baitType) {
            GameState.useBait(true);
            UIManager.updateBaitInfo();
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
            UIManager.updateBaitInfo();
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
            UIManager.updateBaitInfo();
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
        this.isGachaMode = false; // ガチャモードも解除
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.FishingGame = FishingGame;
}
