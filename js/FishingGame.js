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
        this.battlePhase = 1; // 1 or 2
        console.log('🎣 釣りゲームを初期化しました');

        this.battlePhase = 1; // 1 or 2
        console.log('🎣 釣りゲームを初期化しました');

        // ランダムイベントループは廃止 (釣り終了時に判定)
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

        // ========================================
        // フィーバーモード (太陽) の場合: 宝箱確定
        // ========================================
        if (GameState.fever.isActive && GameState.fever.type === 'sun') {
            console.log('🔥 太陽フィーバー: 宝箱確定！');
            // 宝箱ロジックを再利用するが、100%出現させる
            // ただし、タイプ抽選は通常通り行う
            // 必要あればフィーバー用ボーナスを加算しても良い

            const weights = { WOOD: 0.6, SILVER: 0.3, GOLD: 0.1 };
            let random = Math.random();
            let selectedType = 'WOOD';

            if (random < weights.WOOD) {
                selectedType = 'WOOD';
            } else if (random < weights.WOOD + weights.SILVER) {
                selectedType = 'SILVER';
            } else {
                selectedType = 'GOLD';
            }

            const chestData = GAME_DATA.TREASURE_CONFIG.chestData[selectedType];

            return {
                id: `treasure_${selectedType.toLowerCase()}`,
                name: chestData.name,
                rarity: chestData.rarity,
                power: chestData.power,
                price: 0,
                icon: chestData.icon,
                description: chestData.description,
                isTreasure: true,
                treasureType: selectedType
            };
        }

        // ========================================
        // 宝箱の抽選 (通常)
        // ========================================
        const treasureChance = GAME_DATA.TREASURE_CONFIG.baseChance + GameState.getTreasureChanceBonus();
        // ... (既存の宝箱ログ削除)

        if (Math.random() < treasureChance) {
            // ... (既存の宝箱処理と同じ)
            const weights = GAME_DATA.TREASURE_CONFIG.rarityWeights;
            let random = Math.random();
            let selectedType = 'WOOD';

            if (random < weights.WOOD) {
                selectedType = 'WOOD';
            } else if (random < weights.WOOD + weights.SILVER) {
                selectedType = 'SILVER';
            } else {
                selectedType = 'GOLD';
            }

            const chestData = GAME_DATA.TREASURE_CONFIG.chestData[selectedType];

            return {
                id: `treasure_${selectedType.toLowerCase()}`,
                name: chestData.name,
                rarity: chestData.rarity,
                power: chestData.power,
                price: 0,
                icon: chestData.icon,
                description: chestData.description,
                isTreasure: true,
                treasureType: selectedType
            };
        }

        const bait = GAME_DATA.BAITS.find(b => b.id === GameState.baitType) || GAME_DATA.BAITS[0]; // デフォルトD

        // 餌ごとのランク出現重み設定 (ユーザー要望に基づく)
        // ... (既存コメント)

        // ========================================
        // 上位魚確定イベント (鳥)
        // ========================================
        if (GameState.highTierGuaranteed) {
            console.log('🦅 鳥イベント効果: 上位魚確定で抽選！');

            // フラグ消費
            GameState.setHighTierGuaranteed(false);

            // 現在の餌ランクより一つ上のランクを計算
            const rankOrder = ['D', 'C', 'B', 'A', 'S', 'SS'];
            const currentRankIndex = rankOrder.indexOf(bait.rank);
            let targetRank = 'S'; // デフォルト

            if (currentRankIndex !== -1 && currentRankIndex < rankOrder.length - 1) {
                targetRank = rankOrder[currentRankIndex + 1];
            } else if (currentRankIndex === rankOrder.length - 1) {
                // 既に最高ランク(SS)の場合はSS維持（またはS以上など）
                // ここではSS維持とする
                targetRank = 'SS';
            } else {
                // 餌ランクが不明(D扱い)ならCへ
                targetRank = 'C';
            }

            console.log(`🦅 ランクアップ: ${bait.rank} -> ${targetRank} 確定`);

            // ターゲットランクの魚を抽出
            const targetPool = GAME_DATA.FISH.filter(f => f.rarity === targetRank);

            if (targetPool.length > 0) {
                // ランダムに選択 (重み考慮)
                let totalHWeight = 0;
                targetPool.forEach(f => totalHWeight += f.weight);
                let r = Math.random() * totalHWeight;

                for (const fish of targetPool) {
                    r -= fish.weight;
                    if (r < 0) {
                        return { ...fish };
                    }
                }
                return { ...targetPool[0] };
            }
        }
        // 餌ごとの出現確率DCBAS
        const spawnWeights = {
            'D': { D: 0.9, C: 0.1, S: 0.01 },
            'C': { C: 0.8, D: 0.2, B: 0.1 },
            'B': { B: 0.8, C: 0.2, D: 0.1, A: 0.05 },
            'A': { A: 0.6, B: 0.4, C: 0.2, S: 0.05 },
            'S': { A: 0.6, S: 0.2, B: 0.2, SS: 0.033 }
        };

        let currentWeights = spawnWeights[bait.rank] || spawnWeights['D'];

        // ========================================
        // フィーバーモード (月) の場合: 指定されたランク出現率を適用
        // ========================================
        if (GameState.fever.isActive && GameState.fever.type === 'moon') {
            console.log('🔥 月フィーバー: 餌ごとの刷新されたランク出現率を適用！');

            const feverWeights = {
                'D': { D: 10, C: 85, B: 1, A: 2, S: 2 },
                'C': { C: 24, B: 76 },
                'B': { B: 30, A: 70 },
                'A': { A: 70, S: 30 },
                'S': { A: 40, S: 50, SS: 10 }
            };

            currentWeights = feverWeights[bait.rank] || feverWeights['D'];
        }


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

        // ========================================
        // ランクスナイパー (Rank Sniper) 判定
        // ========================================
        const penaltyStatus = GameState.getPenaltyStatus();
        if (penaltyStatus.rankSniper) {
            // ランクの強さ定義
            const rankValue = { 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5, 'SS': 6, 'GOD': 7 };
            const currentRankVal = rankValue[selectedRarity] || 0;
            const targetRankVal = rankValue[penaltyStatus.rankSniper] || 0;

            if (currentRankVal < targetRankVal) {
                console.log(`⛔ Rank Sniper: ${selectedRarity}ランクは対象外 (Min: ${penaltyStatus.rankSniper}) -> 再抽選`);
                // 条件を満たさない場合、プール内から条件を満たす魚を探すか、強制的に対象ランク以上の魚を抽選し直す
                // 簡易実装: 無理やり対象ランクの魚を抽選する
                // もしフィーバーや他の要素でランクが決まっていたとしても、スナイパーはそれを上書きする（強力な制約）

                // 対象ランク以上の魚を全候補から抽出
                const validFish = GAME_DATA.FISH.filter(f => (rankValue[f.rarity] || 0) >= targetRankVal);

                if (validFish.length > 0) {
                    // ランダムに1匹選出
                    const fallbackFish = validFish[Math.floor(Math.random() * validFish.length)];
                    return { ...fallbackFish };
                }
            }
        }

        // 同ランク内での抽選 (個別のweightを考慮)
        // レア魚出現率UPスキルの適用: 頻度が低い(weight < 15)魚の出現率を底上げ
        const rareBonus = GameState.getRareBonus();

        // プールの各魚に重みを適用
        const weightedPool = fishPool.map(f => {
            let effectiveWeight = f.weight;
            // weight < 15 は「あまり釣れない」以下 (頻度プロパティ連携)
            if (rareBonus > 0 && f.weight < 15) {
                // ボーナスを適用 (効果を実感しやすくするため係数を2.0とする)
                // 例: bonus 0.2 (+20%) -> weight * 1.4 
                effectiveWeight = f.weight * (1 + rareBonus * 2.0);
            }
            return { fish: f, weight: effectiveWeight };
        });

        // 総重量を計算
        let poolTotalWeight = 0;
        weightedPool.forEach(item => poolTotalWeight += item.weight);

        random = Math.random() * poolTotalWeight;
        let selectedFish = weightedPool[0].fish;

        for (const item of weightedPool) {
            random -= item.weight;
            if (random < 0) {
                selectedFish = { ...item.fish }; // コピーを作成
                break;
            }
        }

        // 称号付きの抽選
        let titleChanceMult = GameState.getTitleChanceMultiplier();

        // ユーザー要望の「特定条件下での称号確率アップ」
        if ((bait.rank === 'B' && selectedRarity === 'D') ||
            (bait.rank === 'A' && selectedRarity === 'C') ||
            (bait.rank === 'S' && selectedRarity === 'B')) {
            console.log('✨ 特定条件ボーナス: 称号確率アップ適用！');
            titleChanceMult *= 3.0; // 3倍に設定（調整可能）
        }

        // ========================================
        // フィーバーモード (月) の場合: 称号出現率超アップ
        // ========================================
        if (GameState.fever.isActive && GameState.fever.type === 'moon') {
            console.log('🔥 月フィーバー: 称号出現率超アップ！');
            titleChanceMult *= 5.0; // さらに5倍 (合計最大15倍以上)
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

            // ----------------------------------------
            // 波紋のサイズ計算
            // ----------------------------------------
            let rippleScale = 1.0;

            if (this.currentFish) {
                // 宝箱は小さく
                if (this.currentFish.isTreasure) {
                    rippleScale = 0.8;
                }
                // 魚の場合、ランク比較
                else {
                    const baitId = GameState.baitType;
                    const bait = GAME_DATA.BAITS.find(b => b.id === baitId);

                    const rankIndices = { 'D': 0, 'C': 1, 'B': 2, 'A': 3, 'S': 4, 'SS': 5, 'GOD': 6 };
                    const fishRankVal = rankIndices[this.currentFish.rarity] || 0;
                    const baitRankVal = bait ? (rankIndices[bait.rank] || 0) : 0; // 餌なしは最低ランク扱い

                    const rankDiff = fishRankVal - baitRankVal;

                    // ランク差に応じた係数
                    if (rankDiff >= 3) {
                        rippleScale = 2.3;
                    } else if (rankDiff === 2) {
                        rippleScale = 1.8;
                    } else if (rankDiff === 1) {
                        rippleScale = 1.5;
                    } else {
                        rippleScale = 1.0;
                    }
                }
            }

            UIManager.showNibble(rippleScale);

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

            console.log(`🎣 予兆開始: 合計 ${targetCount} 回揺れます (Scale: ${rippleScale})`);
        }

        // ========================================
        // 自動ヒット (Auto Hit) 判定
        // ========================================
        // 予兆中かつ、まだヒットしていないタイミングで判定
        if (!this.isGachaMode && this.state === 'nibble') {
            const autoHitInfo = GameState.hasAutoHit();
            if (autoHitInfo.hasIt) {
                // 毎回判定すると確率が高くなりすぎるので、
                // 「最後の揺れ（＝ヒット直前）」のタイミングでのみ判定するか、
                // あるいは「揺れるたびに低確率で即ヒット」させるか。
                // Lv2: 30%, Lv3: 50% と確率が高いので、
                // 「ウキが沈む（Hit移行）」のタイミングを自動化するのが自然。
                // ここでは `hit()` を呼ぶ直前、つまり `currentCount >= targetCount` になる最後のループで判定する手もあるが、
                // "ウキ沈下時に自動ヒット" という文言からは「プレイヤーが反応しなくても勝手にHit扱いになる」と読める。
                // したがって、nibbleループが終わって hit() が呼ばれた直後に自動で catchSuccess に飛ばすのが良いかもしれない。
                // しかし、釣り味としては「ウキが沈んだ瞬間に自動クリック」が気持ちいい。
                // 
                // 実装方針: `hit()` 内で自動ヒット処理を行う。
            }
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

        // ========================================
        // 自動ヒット (Auto Hit) 発動判定
        // ========================================
        const autoHitInfo = GameState.hasAutoHit();
        if (autoHitInfo.hasIt) {
            if (Math.random() < autoHitInfo.chance) {
                console.log('🤖 Auto Hit 発動！');
                UIManager.showMessage('🤖 Auto Hit!', 1000);
                setTimeout(() => {
                    this.onClick(); // クリックした扱いにする
                }, 200); // 少し遅延させて人間味（？）を出す
                // returnはしない（タイマーセット後にクリックでクリアされる流れを維持）
            }
        }

        // ヒット判定可能時間を設定 (レア度とスキルによる倍率を反映)
        const config = GAME_DATA.FISHING_CONFIG;
        const rarityBase = config.hitWindowByRarity[this.currentFish.rarity] || config.hitWindowTime;
        const multiplier = GameState.getHitWindowMultiplier();
        const finalHitWindow = rarityBase * multiplier;

        console.log(`⏱ ヒット窓口: レア度ベース ${rarityBase}ms × 倍率 ${multiplier} = ${finalHitWindow}ms`);

        this.hitTimer = setTimeout(() => {
            console.log('⏰ ヒット窓口終了: 反応が遅かった');
            // 時間切れで逃げられた
            this.state = 'idle';
            UIManager.showMissed('反応が遅かった！魚に逃げられた...');

            // 餌を消費（ヒットを逃した＝失敗）
            if (GameState.baitType) {
                GameState.useBait(false);
                UIManager.updateBaitInfo();
            }

            // フィーバー中は失敗でもゲージが溜まる
            if (GameState.fever.isActive) {
                const feverResult = GameState.progressFever(true);
                UIManager.updateFeverVisuals();
                if (feverResult.message === 'end') {
                    UIManager.showMessage('💨 フィーバー終了...', 3000);
                }
            }

            // ========================================
            // 失敗ペナルティ (Timeout)
            // ========================================
            this.applyFailurePenalty();


            // イベント判定
            this.triggerRandomEvent();

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
                UIManager.updateRodView('strike');
                this.earlyClickFailed();
                break;

            case 'hit':
                // ヒット成功
                if (this.hitTimer) {
                    clearTimeout(this.hitTimer);
                    this.hitTimer = null;
                }

                // バトルが発生するか先に判定
                const playerPower = GameState.getTotalPower();
                const fishPower = this.currentFish ? this.currentFish.power : 0;
                const isForcedBattle = ['A', 'S', 'SS'].includes(this.currentFish.rarity);
                const willBattle = !(playerPower >= fishPower && !isForcedBattle);

                if (willBattle) {
                    // ゲージバトルの場合は即座に開始（以前の挙動）
                    this.checkPower();
                } else {
                    // 即時釣り上げの場合は「合わせ（振り上げ）」を実行して成功へ
                    UIManager.updateRodView('strike');
                    this.checkPower();
                }
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
        const fishPower = this.currentFish ? this.currentFish.power : 0;

        if (!this.currentFish) {
            console.error('❌ currentFish is null in checkPower!');
            this.state = 'idle';
            UIManager.showIdle();
            return;
        }

        console.log(`⚡ パワー判定: プレイヤー ${playerPower} vs 魚 ${fishPower} (${this.currentFish.name})`);

        // Aランク以上は強制的にバトル発生
        const isForcedBattle = ['A', 'S', 'SS'].includes(this.currentFish.rarity);

        if (playerPower >= fishPower && !isForcedBattle) {
            // 即座に釣り上げ成功
            this.catchSuccess();
        } else {
            // ゲージバトルへ移行
            this.battlePhase = 1;
            this.startGaugeBattle(playerPower, fishPower);
        }
    },

    // ========================================
    // ゲージバトル開始
    // ========================================
    startGaugeBattle(playerPower, fishPower) {
        this.state = 'gaugeBattle';

        // パワー差に基づいてゲージ設定を計算
        // 強制バトルの場合、プレイヤーの方が強い(1.0以上)可能性があるため、最大1.0に制限
        const rawRatio = playerPower / fishPower;
        const powerRatio = Math.min(0.99, rawRatio);

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
        let catchRate;

        if (zone === 'red') {
            // ========================================
            // 赤ゲージ停止時の動的成功率計算
            // ========================================
            const bait = GAME_DATA.BAITS.find(b => b.id === GameState.baitType) || GAME_DATA.BAITS[0];
            const rankIndices = { 'D': 0, 'C': 1, 'B': 2, 'A': 3, 'S': 4, 'SS': 5 };

            const fishRank = rankIndices[this.currentFish.rarity] || 0;
            const baitRank = rankIndices[bait.rank] || 0;
            const rankDiff = fishRank - baitRank;

            // ランク差によるベース成功率
            let baseRate = 0.9; // 同ランク or 格下
            if (rankDiff === 1) baseRate = 0.8;      // 1つ上
            else if (rankDiff === 2) baseRate = 0.6; // 2つ上
            else if (rankDiff >= 3) baseRate = 0.4;  // 3つ上 (それ以上も一旦40%ベース)

            // パワー差による補正
            const playerPower = GameState.getTotalPower();
            const fishPower = this.currentFish.power;
            const powerDiff = Math.max(0, fishPower - playerPower);

            // パワー差が大きいほど減衰 
            // 例: パワー差がプレイヤーパワーと同じだけある(倍の敵)場合、-50%
            const powerPenalty = (powerDiff / Math.max(1, playerPower)) * 0.5;

            catchRate = baseRate - powerPenalty;

            // ユーザー要望: パワー差がありすぎても0%にはしない (最低1%保証)
            if (catchRate < 0.01) {
                catchRate = 0.01;
            }

            // ログ出力
            console.log(`📊 キャッチ判定: ランク差${rankDiff}(${baseRate * 100}%) - パワー罰則${(powerPenalty * 100).toFixed(1)}% = ${(catchRate * 100).toFixed(1)}% (Min 5%)`);

            // 赤ゲージ停止のミッション判定
            MissionManager.checkMission('red_gauge_stop');

        } else {
            // 赤以外は従来通りの設定値
            catchRate = config.catchRate.min +
                Math.random() * (config.catchRate.max - config.catchRate.min);
        }

        // 達人の針スキル: 赤ゾーンなら確定 (100%)
        if (zone === 'red' && GameState.hasPerfectMaster && GameState.hasPerfectMaster()) {
            catchRate = 1.0;
            console.log('✨ 達人の針発動！赤ゾーン確定');
        }

        // スキルボーナス
        catchRate += GameState.getCatchBonus();
        catchRate = Math.min(1, catchRate);  // 100%が上限

        // SSランクは赤ゲージ必須（それ以外は0%）
        if (this.currentFish.rarity === 'SS' && zone !== 'red') {
            console.log('⛔ SSランク制約: 赤ゲージ以外は失敗');
            catchRate = 0;
        }

        console.log(`🎯 ゾーン: ${zone}, 捕獲率: ${(catchRate * 100).toFixed(1)}%`);

        // 少し停止して見せてから結果を表示
        setTimeout(() => {
            this.isProcessing = false;

            // 実際の決着に合わせて竿を振り上げる
            UIManager.updateRodView('strike');

            const isSuccess = Math.random() < catchRate;

            if (isSuccess) {
                // S, SSランクは2連戦
                if (['S', 'SS'].includes(this.currentFish.rarity) && this.battlePhase === 1) {
                    console.log('⚔️ 連戦発生！ Round 2 Start');
                    this.battlePhase = 2;
                    UIManager.showMessage('まだまだ！', 1000);

                    // 少し間を置いて2回戦開始
                    setTimeout(() => {
                        this.startGaugeBattle(GameState.getTotalPower(), this.currentFish.power);
                    }, 1000);
                } else {
                    this.catchSuccess();
                }
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

        if (!this.currentFish) {
            console.error('❌ currentFish is null in catchSuccess!');
            this.state = 'idle';
            UIManager.showIdle();
            return;
        }

        // 宝箱の場合
        if (this.currentFish.isTreasure) {
            // 餌を消費
            if (GameState.baitType) {
                GameState.useBait(true);
                UIManager.updateBaitInfo();
            }

            // ========================================
            // フィーバー進行判定
            // ========================================
            const feverResult = GameState.progressFever();
            UIManager.updateFeverVisuals();

            if (feverResult.message === 'start') {
                UIManager.showMessage(`🔥 ${feverResult.type === 'sun' ? 'おたから' : 'おさかな'}フィーバー開始！`, 3000);
            } else if (feverResult.message === 'end') {
                UIManager.showMessage('💨 フィーバー終了...', 3000);
            }

            GameState.totalTreasure++;
            // 宝箱取得のミッション判定
            MissionManager.checkMission('treasure_caught');
            this.processTreasureChest(this.currentFish);
            return;
        }

        // インベントリに追加 (複数釣り判定)
        let catchCount = 1;
        const chance3 = GameState.getMultiCatch3Chance();
        const chance2 = GameState.getMultiCatch2Chance();

        // 優先順位: 3匹 > 2匹
        if (Math.random() < chance3) {
            catchCount = 3;
            console.log('✨ トリプルキャッチ発動！ 3匹ゲット');
        } else if (Math.random() < chance2) {
            catchCount = 2;
            console.log('✨ ダブルキャッチ発動！ 2匹ゲット');
        }

        for (let i = 0; i < catchCount; i++) {
            GameState.addFish(this.currentFish);
        }

        // 追加の釣果数ボーナス (マルチキャッチ数+1など)
        const extraNum = GameState.getMultiCatchBonusNum();
        if (extraNum > 0 && catchCount > 1) { // 複数釣り発動時のみ有効
            console.log(`✨ マルチキャッチボーナス: +${extraNum}匹`);
            catchCount += extraNum;
            for (let i = 0; i < extraNum; i++) {
                GameState.addFish(this.currentFish);
            }
        }

        // ========================================
        // 追加ドロップ抽選 (チケット、コイン、スキル)
        // ========================================
        const drops = [];

        // 1. ランク・称号に基づく確定/確率ドロップ
        let dropTicket = 0;
        let dropCoin = 0;
        let dropSkill = false;

        // 称号付き: ガチャチケ10枚、コイン、T2以上スキル (確定セット)
        if (this.currentFish.hasTitle) {
            console.log('👑 称号ボーナス: 豪華セット獲得！');
            dropTicket += 10;
            dropCoin += 1000; // 仮
            dropSkill = true; // T2以上
        }

        // 通常ドロップ判定 (ランクが高いほど確率UP)
        const rankValue = { 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5, 'SS': 6 };
        const rVal = rankValue[this.currentFish.rarity] || 1;

        // ガチャチケ (ランクS以上でそこそこの確率)
        if (this.currentFish.rarity === 'S' || this.currentFish.rarity === 'SS') {
            if (Math.random() < 0.3) dropTicket += 1;
        }

        // スキル補正による追加ドロップ
        // Extra Gacha Prob/Num
        // extra_gacha_prob
        // 魚と一緒にガチャチケが釣れる確率
        let extraGachaProb = 0;
        // TODO: GameStateにgetExtraGachaProbメソッドがないのでequippedSkillsから直接見るか、GameStateに追加する
        // ここではGameState.equippedSkillsを参照して簡易計算
        GameState.equippedSkills.forEach(id => {
            const s = GAME_DATA.SKILLS.find(sk => sk.id === id);
            if (s && s.effect.type === 'extra_gacha_prob') extraGachaProb += s.effect.value;
        });

        if (Math.random() < extraGachaProb) {
            let num = 1;
            // extra_gacha_num補正
            GameState.equippedSkills.forEach(id => {
                const s = GAME_DATA.SKILLS.find(sk => sk.id === id);
                if (s && s.effect.type === 'extra_gacha_num') num += s.effect.value;
            });
            // 所持魚数ボーナス (Count Fish Gacha)
            GameState.equippedSkills.forEach(id => {
                const s = GAME_DATA.SKILLS.find(sk => sk.id === id);
                if (s && s.effect.type === 'count_fish_gacha') {
                    // 例: 50種につき+1
                    let totalFishCount = 0;
                    if (GameState.encyclopedia) {
                        totalFishCount = Object.values(GameState.encyclopedia).reduce((sum, entry) => sum + (entry.count || 0), 0);
                    }
                    num += Math.floor(totalFishCount * s.effect.value);
                }
            });

            dropTicket += num;
            console.log(`🎫 スキル効果: チケット+${num}`);
        }

        // Extra Coin Prob/Amount
        let extraCoinProb = 0;
        // extra_coin_prob
        GameState.equippedSkills.forEach(id => {
            const s = GAME_DATA.SKILLS.find(sk => sk.id === id);
            if (s && s.effect.type === 'extra_coin_prob') extraCoinProb += s.effect.value;
        });

        if (Math.random() < extraCoinProb) {
            let amount = 100; // ベース
            // extra_coin_amount補正
            let amountMult = 1.0;
            GameState.equippedSkills.forEach(id => {
                const s = GAME_DATA.SKILLS.find(sk => sk.id === id);
                if (s && s.effect.type === 'extra_coin_amount') amountMult += s.effect.value;
            });
            // Count Gacha Coin
            GameState.equippedSkills.forEach(id => {
                const s = GAME_DATA.SKILLS.find(sk => sk.id === id);
                if (s && s.effect.type === 'count_gacha_coin') {
                    const ticketCount = GameState.gachaTickets || 0;
                    amountMult += (ticketCount * s.effect.value);
                }
            });

            dropCoin += Math.floor(amount * amountMult);
            console.log(`💰 スキル効果: コイン+${dropCoin}`);
        }


        // ドロップ処理実行
        if (dropTicket > 0) {
            GameState.gachaTickets += dropTicket;
            drops.push({ type: 'ticket', count: dropTicket, name: 'ガチャチケ' });
        }
        if (dropCoin > 0) {
            GameState.addMoney(dropCoin);
            drops.push({ type: 'money', count: dropCoin, name: `${dropCoin} G` });
        }
        if (dropSkill) {
            // T2以上のスキルをランダムに1つ
            const t2Skills = GAME_DATA.SKILLS.filter(s => s.tier >= 2);
            if (t2Skills.length > 0) {
                const s = t2Skills[Math.floor(Math.random() * t2Skills.length)];
                GameState.addSkill(s.id); // addSkillは未実装なら gainGachaResult 的な処理が必要
                // GameState.skillInventoryに直接追加するか、gainGachaResultを使う
                if (GameState.skillInventory) {
                    GameState.skillInventory[s.id] = (GameState.skillInventory[s.id] || 0) + 1;
                    drops.push({ type: 'skill', count: 1, name: s.name });
                }
            }
        }

        // Drops情報をUIに渡す（必要ならshowCatchSuccessの引数を拡張）
        if (drops.length > 0) {
            // 簡易的にメッセージで表示
            const dropNames = drops.map(d => `${d.name} x${d.count}`).join(', ');
            UIManager.showMessage(`🎁 追加報酬: ${dropNames}`, 3000);
        }

        // 初心者ミッション判定 + 動的ミッション判定（魚情報付き）
        MissionManager.checkMission('catch_success', {
            baitId: GameState.baitType,
            rarity: this.currentFish.rarity,
            frequency: this.currentFish.frequency
        });

        // 餌を消費
        if (GameState.baitType) {
            const baitData = GAME_DATA.BAITS.find(b => b.id === GameState.baitType);
            const baitRank = baitData ? baitData.rank : 'D';
            GameState.useBait(true);
            UIManager.updateBaitInfo();
            // 餌使用のミッション判定
            MissionManager.checkMission('use_bait', { rank: baitRank });
        }

        // ========================================
        // フィーバー進行判定
        // ========================================
        const feverResult = GameState.progressFever();
        UIManager.updateFeverVisuals();

        if (feverResult.message === 'start') {
            UIManager.showMessage(`🔥 ${feverResult.type === 'sun' ? 'おたから' : 'おさかな'}フィーバー開始！`, 3000);
            // フィーバー開始ミッション判定
            MissionManager.checkMission('fever_start');
        } else if (feverResult.message === 'end') {
            UIManager.showMessage('💨 フィーバー終了...', 3000);
        }

        // UI表示（ユーザーが閉じたらidleに戻る）
        UIManager.showCatchSuccess(this.currentFish, () => {
            this.state = 'idle';
            UIManager.showIdle();
            // イベント判定
            this.triggerRandomEvent();
        }, catchCount); // catchCountを渡す

        console.log(`🎉 ${this.currentFish.name}を釣り上げた！ (x${catchCount})`);
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

        // フィーバー中は失敗でもゲージが溜まる
        if (GameState.fever.isActive) {
            const feverResult = GameState.progressFever(true);
            UIManager.updateFeverVisuals();
            if (feverResult.message === 'end') {
                UIManager.showMessage('💨 フィーバー終了...', 3000);
            }
        }

        // ========================================
        // 失敗ペナルティ (Early Click)
        // ========================================
        this.applyFailurePenalty();

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

        // 失敗時は確定でフィーバーゲージ+1
        const feverResult = GameState.progressFever(true);
        UIManager.updateFeverVisuals();

        if (feverResult.message === 'start') {
            UIManager.showMessage(`🔥 ${feverResult.type === 'sun' ? 'おたから' : 'おさかな'}フィーバー開始！`, 3000);
        }

        // ========================================
        // 失敗ペナルティ (Catch Failed)
        // ========================================
        this.applyFailurePenalty();

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
        this.gaugeAnimationId = null;
        this.isProcessing = false;

        // イベントループは止めない（釣り中もイベントは起きるかもしれないが、
        // 画面切り替え時などに止める必要があるなら別途stopメソッドが必要）
        // 今回はcleanupTimersは「釣りサイクルの一連の流れ」のクリアなので、
        // グローバルなイベントループはここでは止めないでおくが、
        // 念のためプロパティは定義しておく
    },

    // ========================================
    // イベントループ停止（画面遷移時など）
    // ========================================
    stopRandomEventLoop() {
        if (this.eventTimer) {
            clearTimeout(this.eventTimer);
            this.eventTimer = null;
        }
    },

    // ========================================
    // 釣りを中断（ショップ画面に移動など）
    // ========================================
    // ========================================
    // 宝箱の中身決定と処理
    // ========================================
    processTreasureChest(chest) {
        const type = chest.treasureType;
        const lootTable = GAME_DATA.TREASURE_CONFIG.lootTables[type];
        const results = [];

        // スキル効果を取得
        let quantityMult = GameState.getTreasureQuantityMultiplier();
        let qualityMult = GameState.getTreasureQualityMultiplier();

        // 太陽フィーバーボーナス
        if (GameState.fever.isActive && GameState.fever.type === 'sun') {
            quantityMult *= 1.5;
            qualityMult *= 2.0; // スキル出現率UP
            console.log('🔥 太陽フィーバー: 報酬量・質 2倍！');
        }

        console.log(`🎁 宝箱開封: ${type}, Quantity x${quantityMult.toFixed(2)}, Quality x${qualityMult.toFixed(2)}`);

        // 1. お金 (量と質の両方が乗る)
        const baseMoney = lootTable.money.min + Math.floor(Math.random() * (lootTable.money.max - lootTable.money.min + 1));
        const finalMoney = Math.floor(baseMoney * quantityMult * qualityMult);

        GameState.addMoney(finalMoney);
        results.push({ type: 'money', value: finalMoney, name: `${finalMoney.toLocaleString()} G` });

        // 2. 餌
        // 2. 餌
        if (lootTable.baits && lootTable.baits.length > 0) {
            let selectedBaitConfig = null;

            // --- 優先排出ロジック ---
            const currentBaitId = GameState.baitType;
            const currentBaitData = GAME_DATA.BAITS.find(b => b.id === currentBaitId);
            const rankOrder = { 'D': 0, 'C': 1, 'B': 2, 'A': 3, 'S': 4 };
            const currentRank = currentBaitData ? (rankOrder[currentBaitData.rank] ?? -1) : -1;

            // 候補リスト作成（ランク情報を付与）
            const candidates = lootTable.baits.map(b => {
                const d = GAME_DATA.BAITS.find(db => db.id === b.id);
                return { ...b, rankValue: d ? (rankOrder[d.rank] ?? 0) : 0 };
            });

            // 上位ランクの餌のみを抽出
            const betterBaits = candidates.filter(b => b.rankValue > currentRank);

            // 上位餌があれば優先、なければ全候補
            const targetList = (betterBaits.length > 0) ? betterBaits : candidates;

            if (betterBaits.length > 0) {
                console.log(`✨ 宝箱: 装備(Rank ${currentBaitData?.rank})より上位の餌を優先します`);
            }

            // 重み計算 (質の高い餌の重みを qualityMult で増やす)
            const weightedBaits = targetList.map((b, index) => {
                let w = b.weight;
                // インデックスが大きい(=恐らくリストの下の方にある良い餌)ほどブースト
                if (index > 0) w *= qualityMult;
                return { ...b, effectiveWeight: w };
            });

            let accumulatedWeight = 0;
            weightedBaits.forEach(b => accumulatedWeight += b.effectiveWeight);

            let randomVal = Math.random() * accumulatedWeight;

            for (const b of weightedBaits) {
                randomVal -= b.effectiveWeight;
                if (randomVal < 0) {
                    selectedBaitConfig = b;
                    break;
                }
            }
            if (!selectedBaitConfig) selectedBaitConfig = weightedBaits[0];

            // 個数 (量ボーナス)
            const baseCount = selectedBaitConfig.min + Math.floor(Math.random() * (selectedBaitConfig.max - selectedBaitConfig.min + 1));
            const finalCount = Math.max(1, Math.floor(baseCount * quantityMult)); // 最低1個

            const baitData = GAME_DATA.BAITS.find(b => b.id === selectedBaitConfig.id);

            if (baitData && finalCount > 0) {
                GameState.addBait(selectedBaitConfig.id, finalCount);
                results.push({ type: 'bait', id: selectedBaitConfig.id, count: finalCount, name: baitData.name });
            }
        }

        // 3. スキル (確率)
        if (lootTable.skills && lootTable.skills.length > 0) {
            // 抽選回数 (量ボーナス)
            // quantityMult が 1.5 なら、1回確定 + 50%で2回目
            // ベースは1回抽選
            const baseRolls = 1;
            const effectiveRolls = baseRolls * quantityMult;
            const guaranteedRolls = Math.floor(effectiveRolls);
            const extraChance = effectiveRolls - guaranteedRolls;

            let totalRolls = guaranteedRolls;
            if (Math.random() < extraChance) {
                totalRolls++;
            }

            console.log(`🎁 スキル抽選回数: ${totalRolls}`);

            for (let i = 0; i < totalRolls; i++) {
                // 各ロールごとに独立して抽選
                for (const skillConfig of lootTable.skills) {
                    // 確率 (質ボーナス)
                    const effectiveChance = skillConfig.chance * qualityMult;

                    if (Math.random() < effectiveChance) {
                        // 指定Tierのスキルからランダムに1つ
                        const availableSkills = GAME_DATA.SKILLS.filter(s => s.tier === skillConfig.tier);
                        if (availableSkills.length > 0) {
                            const newSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];

                            // 既に持っているかチェック
                            GameState.addSkill(newSkill.id);
                            results.push({ type: 'skill', id: newSkill.id, name: newSkill.name });
                        }
                    }
                } // end loop
            } // end loop
        } // end if (lootTable.skills)

        // 限定スキル抽選 (宝箱からのみ、低確率1%)
        if (Math.random() < 0.01) {
            const limitedSkillIds = [
                'nibble_fix', // 予兆察知
                'sun_blessing', // 太陽の加護
                'moon_blessing', // 月の加護
                'perfect_master_1' // 達人の針
            ];
            const targetId = limitedSkillIds[Math.floor(Math.random() * limitedSkillIds.length)];
            const skillData = GAME_DATA.SKILLS.find(s => s.id === targetId);

            if (skillData) {
                console.log(`✨ 限定スキル当選！: ${skillData.name}`);
                GameState.addSkill(skillData.id);
                results.push({ type: 'skill', id: skillData.id, name: `${skillData.name} (限定!)` });
            }
        }

        console.log('🎁 宝箱の中身:', results);

        // UI表示
        UIManager.showTreasureResult(chest, results, () => {
            this.state = 'idle';
            UIManager.showIdle();
        });
    },

    // ========================================
    // ランダムイベント判定 (釣りが終わるたびに呼ばれる)
    // ========================================
    /*
    startRandomEventLoop() 廃止
    */

    // ========================================
    // イベント発生判定
    // ========================================
    triggerRandomEvent() {
        // 釣り画面以外ではイベントを起こさない
        if (UIManager.currentScreen !== 'fishing') return;

        const rand = Math.random();

        // 基本確率
        const baseBoatChance = 0.05;
        const baseBirdChance = 0.05;

        // スキル補正
        const boatBonus = GameState.getBoatEventBonus();
        const birdBonus = GameState.getBirdEventBonus();

        // 実際の確率
        const boatThreshold = baseBoatChance + boatBonus;
        // 鳥の判定はボートの判定の後に行うため、閾値をずらす
        const birdThreshold = boatThreshold + baseBirdChance + birdBonus;

        console.log(`🎲 イベント抽選: rand=${rand.toFixed(4)} (Boat < ${boatThreshold.toFixed(4)}, Bird < ${birdThreshold.toFixed(4)})`);

        // 確率判定
        if (rand < boatThreshold) {
            // ボートイベント
            console.log('🚢 イベント: 漁船通過');
            UIManager.showBoatEvent();

            // 効果発動
            if (GameState.fever.isActive) {
                // フィーバー中: 継続確定 (6に戻す)
                GameState.fever.value = 6;
                console.log('🔥 漁船効果: フィーバーリセット');
            } else {
                // 通常時: ゲージ+1
                const result = GameState.progressFever(true); // 確定進行
                UIManager.updateFeverVisuals();
                console.log('⚡ 漁船効果: フィーバーチャージ');

                if (result.message === 'start') {
                    UIManager.showMessage(`🔥 ${result.type === 'sun' ? 'おたから' : 'おさかな'}フィーバー開始！`, 3000);
                }
            }

        } else if (rand < birdThreshold) {
            // 鳥イベント
            console.log('🦅 イベント: 海鳥飛来');
            UIManager.showBirdEvent();

            // 効果発動: 次回上位確定
            GameState.setHighTierGuaranteed(true);
            console.log('✨ 海鳥効果: 次回上位確定');
        } else {
            console.log('🍃 イベントなし');
        }
    },

    abort() {
        this.cleanupTimers();
        this.state = 'idle';
        this.currentFish = null;
        this.isGachaMode = false; // ガチャモードも解除
    },

    // ========================================
    // 共通の失敗ペナルティ処理
    // ========================================
    applyFailurePenalty() {
        const penalty = GameState.getPenaltyStatus();

        if (penalty.ultimateRisk) {
            console.log('💀 Ultimate Risk発動: インベントリ全消失');
            GameState.inventory = [];
            UIManager.showMessage('💀 全魚ロスト...', 3000);
            // オートセーブ
            SaveManager.save(GameState);
        }

        if (penalty.highRiskSell) {
            const lossRate = 0.1; // 10%減少と仮定（または固定額）
            const loss = Math.floor(GameState.money * lossRate);
            if (loss > 0) {
                GameState.money -= loss;
                console.log(`💸 High Risk Penalty: -${loss}G`);
                UIManager.showMessage(`💸 ペナルティ: -${loss}G`, 3000);
                // UI更新
                UIManager.updateMoney();
                SaveManager.save(GameState);
            }
        }
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.FishingGame = FishingGame;
}
