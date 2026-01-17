// UIマネージャー
// 画面表示、アニメーション、エフェクトを管理

const UIManager = {
    // ========================================
    // ガチャ（スロットマシン）演出
    // ========================================
    showSlotAnimation(results, onComplete) {
        const overlay = document.createElement('div');
        overlay.id = 'gacha-slot-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 2000;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        `;

        // スロットマシーンの見た目
        const slotContainer = document.createElement('div');
        slotContainer.style.cssText = `
            border: 10px solid #ffd700;
            border-radius: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #1e293b, #0f172a);
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
            display: flex; gap: 10px;
        `;

        // リールの作成 (3つ)
        for (let i = 0; i < 3; i++) {
            const reel = document.createElement('div');
            reel.className = 'slot-reel';
            reel.style.cssText = `
                width: 80px; height: 120px;
                background: #fff;
                border: 4px solid #333;
                border-radius: 10px;
                overflow: hidden;
                position: relative;
            `;

            // 回転するストリップ
            const strip = document.createElement('div');
            strip.className = 'reel-strip';
            strip.style.cssText = `
                position: absolute; top: 0; left: 0; width: 100%;
                display: flex; flex-direction: column; align-items: center;
            `;
            // ダミーアイコン
            const icons = ['auto_awesome', 'stars', 'bolt', 'palette', 'diamond', 'phishing'];
            let stripHtml = '';
            for (let j = 0; j < 20; j++) {
                const icon = icons[Math.floor(Math.random() * icons.length)];
                stripHtml += `<span class="material-icons" style="font-size: 48px; line-height: 120px; color: #333;">${icon}</span>`;
            }
            strip.innerHTML = stripHtml;

            reel.appendChild(strip);
            slotContainer.appendChild(reel);

            // アニメーション (CSS keyframes needed or simple js)
            // Simple JS implementation
            this.animateReel(strip, i * 200 + 1500, results);
        }

        const title = document.createElement('div');
        title.innerHTML = '<h2 style="color: #ffd700; font-size: 2rem; margin-bottom: 20px; text-shadow: 0 0 10px #ffd700;">JACKPOT SLOTS</h2>';

        overlay.appendChild(title);
        overlay.appendChild(slotContainer);
        document.body.appendChild(overlay);

        // 演出全体の時間（全てのリールが止まった後）
        setTimeout(() => {
            overlay.style.transition = 'opacity 0.5s';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                if (onComplete) onComplete();
            }, 500);
        }, 3000); // 3秒後
    },

    animateReel(element, duration, results) {
        // キーフレームアニメーションを動的に追加
        const keyframes = [
            { transform: 'translateY(0)' },
            { transform: 'translateY(-1000px)' }
        ];

        const animation = element.animate(keyframes, {
            duration: 200,
            iterations: Infinity
        });

        setTimeout(() => {
            animation.cancel();
            // 最後の位置（結果に基づく）を決めるロジックは入れていない（簡易演出）
            // 止まった位置に固定
            element.style.transform = 'translateY(-50px)'; // センター合わせ

            // 輝きエフェクト
            element.parentElement.style.boxShadow = '0 0 20px white';
            element.parentElement.style.borderColor = '#fff';
        }, duration);
    },
    // ========================================
    // 現在の画面
    // ========================================
    currentScreen: 'start',  // start, fishing, shop

    // ========================================
    // ゲージバトル設定
    // ========================================
    redZoneWidth: 10,
    greenZoneWidth: 15,

    // ========================================
    // 画面切り替え
    // ========================================
    showScreen(screenId) {
        // すべての画面を非表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // 指定した画面を表示
        const screen = document.getElementById(`${screenId}-screen`);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }

        // 画面固有の初期化
        if (screenId === 'fishing') {
            this.showIdle();
            this.updateStatus();
            this.updateSkyVisuals();
        } else if (screenId === 'shop') {
            ShopManager.renderShop();
        } else if (screenId === 'encyclopedia') {
            EncyclopediaManager.render();
        }
    },

    // ========================================
    // スタート画面
    // ========================================
    initStartScreen() {
        const hasSave = SaveManager.hasSaveData();
        const continueBtn = document.getElementById('continue-btn');

        if (continueBtn) {
            if (hasSave) {
                continueBtn.classList.remove('hidden');
            } else {
                continueBtn.classList.add('hidden');
            }
        }

        /* // デバッグツールバー作成
        // 既存ボタン/ツールバーがあれば削除
        const existingBtn = document.getElementById('debug-money-btn');
        if (existingBtn) existingBtn.remove();
        const existingToolbar = document.getElementById('debug-toolbar');
        if (existingToolbar) existingToolbar.remove();

        const toolbar = document.createElement('div');
        toolbar.id = 'debug-toolbar';
        toolbar.style.position = 'fixed';
        toolbar.style.top = '10px';
        toolbar.style.left = '10px';
        toolbar.style.zIndex = '2147483647';
        toolbar.style.display = 'flex';
        toolbar.style.flexDirection = 'column';
        toolbar.style.gap = '8px';
        toolbar.style.pointerEvents = 'none'; // コンテナ自体はクリック透過

        const createDebugBtn = (text, onClick, color = 'rgba(255, 0, 0, 0.8)') => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.style.fontSize = '12px';
            btn.style.padding = '6px 10px';
            btn.style.backgroundColor = color;
            btn.style.color = 'white';
            btn.style.border = '1px solid white';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto'; // ボタンはクリック有効
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
                // 共通更新処理
                SaveManager.saveGame();
                if (typeof this.updateMoney === 'function') this.updateMoney();
                if (typeof this.updateFeverVisuals === 'function') this.updateFeverVisuals();
            });
            return btn;
        };

        // 1. お金追加ボタン
        toolbar.appendChild(createDebugBtn('💰 +100万', () => {
            GameState.addMoney(1000000);
            this.showMessage('所持金 +1,000,000 G');
        }));

        // 2. フィーバー +1
        toolbar.appendChild(createDebugBtn('🔥 Fever +1', () => {
            if (!GameState.fever) GameState.fever = { value: 0, isActive: false, type: 'sun' };
            GameState.fever.value = (GameState.fever.value + 1);
            if (GameState.fever.value > 12) GameState.fever.value = 0; // ループ
            if (!GameState.fever.type) GameState.fever.type = 'sun';
            this.showMessage(`Fever Lv: ${GameState.fever.value} (${GameState.fever.type})`);
        }, 'rgba(255, 100, 0, 0.8)'));

        // 3. フィーバー -1
        toolbar.appendChild(createDebugBtn('❄️ Fever -1', () => {
            if (!GameState.fever) GameState.fever = { value: 0, isActive: false, type: 'sun' };
            GameState.fever.value = Math.max(0, GameState.fever.value - 1);
            if (!GameState.fever.type) GameState.fever.type = 'sun';
            this.showMessage(`Fever Lv: ${GameState.fever.value} (${GameState.fever.type})`);
        }, 'rgba(0, 100, 255, 0.8)'));

        // 4. タイプ切り替え
        toolbar.appendChild(createDebugBtn('🌞/🌚 Type', () => {
            if (!GameState.fever) GameState.fever = { value: 0, isActive: false, type: 'sun' };
            GameState.fever.type = GameState.fever.type === 'sun' ? 'moon' : 'sun';
            this.showMessage(`Type: ${GameState.fever.type}`);
        }, 'rgba(100, 0, 200, 0.8)'));

        document.body.appendChild(toolbar); */
    },

    // ========================================
    // 釣り画面: 待機状態
    // ========================================
    showIdle() {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        fishingArea.innerHTML = `
            <div class="idle-state">
                <div class="instruction">画面をタップしてキャスト</div>
            </div>
        `;

        // 1人称視点の釣り竿を待機状態に
        this.updateRodView('idle');
        this.hideGauge();
    },

    // ========================================
    // 釣り竿の状態更新
    // ========================================
    updateRodView(state) {
        const rodView = document.getElementById('fishing-rod-view');
        if (!rodView) return;

        rodView.className = 'fishing-rod-view';
        if (state) {
            rodView.classList.add(state);
        }

        // スキル色を適用
        const skin = GameState.getCurrentSkin();
        const rodShaft = rodView.querySelector('.rod-shaft');
        if (rodShaft) {
            rodShaft.style.backgroundColor = skin.rodColor;
            // 枠線の色も少し暗くして調整（簡易的）
            rodShaft.style.borderColor = skin.rodColor;
        }
    },

    // ========================================
    // 釣り画面: キャスト
    // ========================================
    showCasting() {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        fishingArea.innerHTML = `
            <div class="casting-state">
                <div class="instruction">キャスト中...</div>
            </div>
        `;

        this.updateRodView('casting');
    },

    // ========================================
    // 釣り画面: 待機（ウキ静止）
    // ========================================
    showWaiting() {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        const skin = GameState.getCurrentSkin();

        fishingArea.innerHTML = `
            <div class="waiting-state">
                <div class="water-surface">
                    <div class="bobber waiting">
                        <div class="bobber-stick"></div>
                        <div class="bobber-body" style="background-color: ${skin.bobberColor}"></div>
                    </div>
                    <div class="ripple"></div>
                </div>
            </div>
        `;

        this.updateRodView('waiting');
    },

    // ========================================
    // 釣り画面: 予兆（ウキ揺れ）
    // ========================================
    showNibble() {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        const skin = GameState.getCurrentSkin();

        fishingArea.innerHTML = `
            <div class="nibble-state">
                <div class="water-surface">
                    <div class="bobber">
                        <div class="bobber-stick"></div>
                        <div class="bobber-body" style="background-color: ${skin.bobberColor}"></div>
                    </div>
                    <div class="ripple active"></div>
                </div>
            </div>
        `;

        this.updateRodView('nibble');
    },

    // ========================================
    // ウキの揺れを1回分実行
    // ========================================
    triggerBobberShake(durationMs) {
        const bobber = document.querySelector('.bobber');
        if (!bobber) return;

        // アニメーションをリセットして実行
        bobber.classList.remove('nibbling');
        void bobber.offsetWidth; // 強制リフロー

        bobber.style.animationDuration = `${durationMs / 1000}s`;
        bobber.style.animationIterationCount = '1';
        bobber.classList.add('nibbling');
    },

    // ========================================
    // 釣り画面: ヒット
    // ========================================
    showHit() {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        const skin = GameState.getCurrentSkin();

        fishingArea.innerHTML = `
            <div class="hit-state">
                <div class="water-surface">
                    <div class="bobber sinking">
                        <div class="bobber-stick"></div>
                        <div class="bobber-body" style="background-color: ${skin.bobberColor}"></div>
                    </div>
                    <div class="splash"></div>
                </div>
            </div>
        `;

        this.updateRodView('hit');

        // 画面シェイクとバイブレーションを発生させる
        this.shakeScreen();
        if (typeof navigator.vibrate === 'function') {
            navigator.vibrate([100]); // 100msのバイブレーション
        }
    },

    // ========================================
    // 画面を一時的に揺らす（スクリーンシェイク）
    // ========================================
    shakeScreen() {
        const screen = document.querySelector('.screen.active');
        if (!screen) return;

        screen.classList.remove('screen-shake');
        void screen.offsetWidth; // 強制リフロー
        screen.classList.add('screen-shake');
    },

    // ========================================
    // 釣り画面: ゲージバトル（インライン）
    // ========================================
    showGaugeBattle(fish, redZoneWidth) {
        this.redZoneWidth = redZoneWidth;

        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        // ゾーンの位置を計算（中央に赤ゾーン）
        const centerStart = (100 - redZoneWidth) / 2;
        const greenStart1 = centerStart - this.greenZoneWidth;
        const greenStart2 = centerStart + redZoneWidth;

        fishingArea.innerHTML = `
            <div class="gauge-battle">
                <h2 class="gauge-battle-title">キャッチング中！</h2>
                <div class="fish-info">
                    <span class="fish-name rarity-${fish.rarity}"></span>
                    <span class="fish-power">パワー: ${fish.power}</span>
                </div>
                <div class="gauge-container">
                    <div class="gauge-bar">
                        <div class="zone white-zone"></div>
                        <div class="zone green-zone" style="left: ${greenStart1}%; width: ${this.greenZoneWidth}%;"></div>
                        <div class="zone red-zone" style="left: ${centerStart}%; width: ${redZoneWidth}%;"></div>
                        <div class="zone green-zone" style="left: ${greenStart2}%; width: ${this.greenZoneWidth}%;"></div>
                        <div class="gauge-indicator" id="gauge-indicator"></div>
                    </div>
                </div>
                <div class="gauge-instruction">タイミングよくクリック！</div>
            </div>
        `;
    },

    // ========================================
    // ゲージ位置を更新
    // ========================================
    updateGaugePosition(position) {
        const indicator = document.getElementById('gauge-indicator');
        if (indicator) {
            indicator.style.left = `${position}%`;
        }
    },

    // ========================================
    // ゲージのゾーン判定
    // ========================================
    getGaugeZone(position) {
        const centerStart = (100 - this.redZoneWidth) / 2;
        const centerEnd = centerStart + this.redZoneWidth;
        const greenStart1 = centerStart - this.greenZoneWidth;
        const greenEnd2 = centerEnd + this.greenZoneWidth;

        if (position >= centerStart && position <= centerEnd) {
            return 'red';
        } else if ((position >= greenStart1 && position < centerStart) ||
            (position > centerEnd && position <= greenEnd2)) {
            return 'green';
        } else {
            return 'white';
        }
    },

    // ========================================
    // ゲージを非表示
    // ========================================
    hideGauge() {
        // インライン表示なので特に処理不要
    },

    // ========================================
    // 釣り上げ成功
    // ========================================
    showCatchSuccess(fish, onClose) {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        const fishIcon = fish.icon || 'set_meal';

        fishingArea.innerHTML = `
            <div class="result-overlay success" id="result-overlay">
                <div class="result-card rarity-${fish.rarity}">
                    <div class="card-header">NEW CATCH!</div>
                    
                    <div class="result-animation">
                        <div class="icon-circle rarity-${fish.rarity}">
                            <span class="material-icons result-icon">${fishIcon}</span>
                            <span class="material-icons sparkle-icon">auto_awesome</span>
                            <div class="rarity-glow"></div>
                        </div>
                    </div>

                    <div class="result-content">
                        <div class="rank-display">
                            <span class="rank-label">RANK</span>
                            <span class="rank-char rarity-${fish.rarity}">${fish.rarity}</span>
                        </div>
                        <h2 class="fish-name">${fish.name}</h2>
                        
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="label">POWER</span>
                                <span class="value">${fish.power}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">VALUE</span>
                                <span class="value">¥${fish.price.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tap-hint">TAP TO CLOSE</div>
                </div>
            </div>
        `;

        // クリックとスペースキーで閉じる
        this.setupResultOverlayClose(onClose);
        this.updateInventory();
    },

    // ========================================
    // 釣り上げ失敗
    // ========================================
    showCatchFailed(fish, onClose) {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        const fishIcon = fish.icon || 'set_meal';
        fishingArea.innerHTML = `
            <div class="result-overlay failed" id="result-overlay">
                <div class="result-card type-failed">
                    <div class="card-header">ESCAPED...</div>
                    
                    <div class="result-animation">
                        <div class="icon-circle type-failed">
                            <span class="material-icons result-icon escaped">${fishIcon}</span>
                            <span class="material-icons escape-cloud">cloud</span>
                        </div>
                    </div>

                    <div class="result-content">
                        <p class="fail-message">
                            <span class="fish-name-small">${fish.name}</span> は<br>
                            力強く逃げ去ってしまった...
                        </p>
                    </div>
                    
                    <div class="tap-hint">TAP TO CLOSE</div>
                </div>
            </div>
        `;

        // クリックとスペースキーで閉じる
        this.setupResultOverlayClose(onClose);
    },

    // ========================================
    // 結果オーバーレイのクローズ処理
    // ========================================
    setupResultOverlayClose(onClose) {
        const overlay = document.getElementById('result-overlay');
        if (!overlay) return;

        let handleKeydown;

        // クローズ処理
        const closeOverlay = () => {
            overlay.remove();
            if (handleKeydown) {
                document.removeEventListener('keydown', handleKeydown);
            }
            // コールバックを実行
            if (typeof onClose === 'function') {
                onClose();
            }
        };

        handleKeydown = (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                closeOverlay();
            }
        };

        // 誤操作防止の遅延（500ms）
        setTimeout(() => {
            // クリックで閉じる
            overlay.addEventListener('click', (e) => {
                e.stopPropagation();
                closeOverlay();
            });

            // スペースキーで閉じる
            document.addEventListener('keydown', handleKeydown);
        }, 500);
    },

    // ========================================
    // 空のビジュアルを更新
    // ========================================
    updateSkyVisuals() {
        const fishingScreen = document.getElementById('fishing-screen');
        if (!fishingScreen) return;

        const currentSky = GameState.getCurrentSky();
        if (!currentSky) return;

        // Colors are top, bottom of the sky part.
        // The sky part is roughly 0% to 35% of the screen.
        // The original CSS was: linear-gradient(180deg, #87CEEB 0%, #3b82f6 30%, #1e3a8a 100%)
        // We want to replace the top part (0-30%) with our sky gradient, and keep the ocean part (30-100%).

        // Ocean colors (fixed for now, matching original or close to it)
        // Original: #3b82f6 at 30%, #1e3a8a at 100%
        // We will construct a multi-stop gradient.

        const skyTop = currentSky.colors[0];
        const skyBottom = currentSky.colors[1];

        // Construct the new gradient
        // 0% -> skyTop
        // 30% -> skyBottom (Horizon)
        // 30% -> #3b82f6 (Ocean Surface) - slightly hard transition or smooth? 
        // Original was #87CEEB 0%, #3b82f6 30%. It was a smooth transition from sky to light blue ocean.
        // To keep the sky distinct but connected:

        const newGradient = `linear-gradient(180deg, ${skyTop} 0%, ${skyBottom} 30%, #1e3a8a 100%)`;

        fishingScreen.style.background = newGradient;
    },

    // ========================================
    // ガチャ結果表示
    // ========================================
    showGachaResult(items, onClose) {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        // 結果リストのHTML生成
        const itemsHtml = items.map(item => {
            let icon = 'auto_awesome';
            let typeLabel = 'Skill';

            if (item.category === 'skin') {
                icon = 'palette';
                typeLabel = 'Skin';
            } else if (item.category === 'sky') {
                icon = 'cloud';
                typeLabel = 'Sky';
            }

            return `
            <div class="gacha-result-item rarity-${item.tier === 3 ? 'S' : item.tier === 2 ? 'B' : 'D'}">
                <div class="gacha-item-icon">
                    <span class="material-icons">${icon}</span>
                </div>
                <div class="gacha-item-info">
                    <div class="gacha-item-name">${item.name}</div>
                    <div class="gacha-item-tier">Tier ${item.tier} (${typeLabel})</div>
                </div>
                ${item.isNew ? '<span class="new-badge">NEW!</span>' : '<span class="status-badge">済み</span>'}
            </div>
        `}).join('');

        // インベントリに加算
        items.forEach(item => {
            GameState.gainGachaResult(item);
        });

        fishingArea.innerHTML = `
            <div class="result-overlay gacha-result" id="result-overlay">
                <div class="result-card gacha-card">
                    <div class="card-header">GACHA RESULT</div>
                    
                    <div class="gacha-items-grid">
                        ${itemsHtml}
                    </div>

                    <div class="tap-hint">TAP TO CLOSE</div>
                </div>
            </div>
        `;

        this.setupResultOverlayClose(onClose);
        this.updateStatus();
    },

    // ========================================
    // 宝箱結果表示
    // ========================================
    showTreasureResult(chest, results, onClose) {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        // 結果リストのHTML生成
        const itemsHtml = results.map(item => {
            let icon = 'help';
            let className = 'common';

            if (item.type === 'money') {
                icon = 'payments';
                className = 'money';
            } else if (item.type === 'bait') {
                icon = 'set_meal';
                className = 'item';
            } else if (item.type === 'skill') {
                icon = 'school';
                className = 'skill';
            } else if (item.type === 'refund') {
                icon = 'currency_exchange';
                className = 'refund';
            }

            return `
                <div class="loot-item ${className}">
                    <div class="loot-icon">
                        <span class="material-icons">${icon}</span>
                    </div>
                    <div class="loot-info">
                        <div class="loot-name">${item.name}</div>
                        ${item.count ? `<div class="loot-count">x${item.count}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        fishingArea.innerHTML = `
            <div class="result-overlay treasure-result" id="result-overlay">
                <div class="result-card rarity-${chest.treasureType}">
                    <div class="card-header">TREASURE!</div>
                    
                    <div class="result-animation">
                        <div class="icon-circle rarity-${chest.treasureType}">
                            <span class="material-icons result-icon">${chest.icon}</span>
                            <span class="material-icons sparkle-icon">auto_awesome</span>
                            <div class="rarity-glow"></div>
                        </div>
                    </div>

                    <div class="result-content">
                        <h2 class="chest-name">${chest.name}</h2>
                        <div class="loot-list">
                            ${itemsHtml}
                        </div>
                    </div>
                    
                    <div class="tap-hint">TAP TO CLOSE</div>
                </div>
            </div>
        `;

        this.setupResultOverlayClose(onClose);
        this.updateStatus();
    },

    // ========================================
    // ミス表示
    // ========================================
    showMissed(message) {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        fishingArea.innerHTML = `
            <div class="result-state missed">
                <div class="missed-text">${message}</div>
            </div>
        `;
    },

    // ========================================
    // ステータス表示更新
    // ========================================
    updateStatus() {
        this.updateMoney();
        this.updateInventory();
        this.updateRodInfo();
        this.updateBaitInfo();
    },

    // ========================================
    // 所持金更新
    // ========================================
    updateMoney() {
        const moneyDisplay = document.getElementById('money-display');
        if (moneyDisplay) {
            moneyDisplay.textContent = `${GameState.money.toLocaleString()} G`;
        }
        // ショップ画面の所持金も更新
        const shopMoneyDisplay = document.getElementById('shop-money-display');
        if (shopMoneyDisplay) {
            shopMoneyDisplay.textContent = `¥${GameState.money.toLocaleString()}`;
        }
        // パワー表示も更新
        const powerDisplay = document.getElementById('power-display');
        if (powerDisplay) {
            powerDisplay.textContent = `パワー: ${GameState.getTotalPower()}`;
        }
    },

    // ========================================
    // インベントリ更新
    // ========================================
    updateInventory() {
        const inventoryCount = document.getElementById('inventory-count');
        if (inventoryCount) {
            inventoryCount.textContent = `${GameState.inventory.length} 匹`;
        }
    },

    // ========================================
    // 釣り竿情報更新
    // ========================================
    updateRodInfo() {
        const rodInfo = document.getElementById('rod-info');
        if (!rodInfo) return;

        const rod = GameState.getCurrentRod();
        const stars = GameState.rodStars;
        let starsHtml = '';
        for (let i = 0; i < stars; i++) {
            starsHtml += '<span class="material-icons star-filled">star</span>';
        }
        for (let i = stars; i < 5; i++) {
            starsHtml += '<span class="material-icons star-empty">star_border</span>';
        }

        rodInfo.innerHTML = `
            <span class="rod-name">${rod.name}</span>
            <span class="rod-stars">${starsHtml}</span>
        `;
    },

    // ========================================
    // 餌情報更新（セレクター表示）
    // ========================================
    updateBaitInfo() {
        const baitInfo = document.getElementById('bait-info');
        if (!baitInfo) return;

        const currentBaitId = GameState.baitType;
        const bait = GAME_DATA.BAITS.find(b => b.id === currentBaitId);
        const count = GameState.getCurrentBaitCount();
        const displayCount = count === -1 ? '∞' : count;

        baitInfo.innerHTML = `
            <div class="bait-selector">
                <button class="selector-btn prev" onclick="GameState.switchBait(-1); UIManager.updateBaitInfo();">◀</button>
                <div class="bait-display" onclick="UIManager.showBaitPurchaseDialog('${currentBaitId}')">
                    <span class="bait-name">${bait.name}</span>
                    <span class="bait-count">${displayCount}個</span>
                </div>
                <button class="selector-btn next" onclick="GameState.switchBait(1); UIManager.updateBaitInfo();">▶</button>
            </div>
        `;
    },

    // ========================================
    // 餌購入ダイアログを表示
    // ========================================
    showBaitPurchaseDialog(baitId) {
        const bait = GAME_DATA.BAITS.find(b => b.id === baitId);
        if (!bait) return;

        // Dランク（無限）は購入不可
        if (bait.rank === 'D') {
            // 無限なので何もしない
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'bait-purchase-modal';

        // 単価 (セット価格 / 個数)
        const unitPrice = bait.quantity > 0 ? bait.price / bait.quantity : 0;

        overlay.innerHTML = `
            <div class="modal-content">
                <h3>餌を購入</h3>
                <p>${bait.name} が不足しています。</p>
                <p>購入しますか？</p>
                
                <div class="purchase-options">
                    <div class="option" data-amount="${bait.quantity}">
                        <span class="amount">${bait.quantity}個</span>
                        <span class="price">¥${bait.price}</span>
                    </div>
                    <div class="option" data-amount="${bait.quantity * 5}">
                        <span class="amount">${bait.quantity * 5}個</span>
                        <span class="price">¥${bait.price * 5}</span>
                    </div>
                     <div class="option" data-amount="${bait.quantity * 10}">
                        <span class="amount">${bait.quantity * 10}個</span>
                        <span class="price">¥${bait.price * 10}</span>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn-cancel" onclick="document.getElementById('bait-purchase-modal').remove()">キャンセル</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // 購入オプションのイベントリスナ
        overlay.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => {
                const amount = parseInt(option.dataset.amount);
                if (GameState.buyBait(baitId, amount)) {
                    this.showMessage(`${bait.name}を${amount}個購入しました！`);
                    this.updateStatus(); // お金と餌の表示更新
                    overlay.remove();
                } else {
                    this.showMessage('お金が足りません！');
                }
            });
        });
    },

    // ========================================
    // ボート通過イベント表示
    // ========================================
    showBoatEvent(callback) {
        const fishingArea = document.getElementById('fishing-screen');
        if (!fishingArea) return;

        // コンテナ取得または作成
        let container = fishingArea.querySelector('.event-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'event-container';
            fishingArea.insertBefore(container, fishingArea.firstChild); // 背景の手前
        }

        // ボート要素
        const boat = document.createElement('div');
        boat.className = 'event-boat';
        boat.innerHTML = '<span class="material-icons game-boat">sailing</span>';
        container.appendChild(boat);

        // クリーンアップ
        setTimeout(() => {
            boat.remove();
            if (callback) callback();
        }, 20000); // アニメーション時間に合わせて削除
    },

    // ========================================
    // 鳥通過イベント表示
    // ========================================
    showBirdEvent(callback) {
        const fishingArea = document.getElementById('fishing-screen');
        if (!fishingArea) return;

        // コンテナ取得または作成
        let container = fishingArea.querySelector('.event-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'event-container';
            fishingArea.insertBefore(container, fishingArea.firstChild);
        }

        // 鳥要素 (3羽: ▽フォーメーション)
        const birdsConfig = [
            { id: 1, delay: 0.0, top: 12 },   // 左上 (先頭)
            { id: 2, delay: 0.4, top: 12 },   // 右上 (後方)
            { id: 3, delay: 0.2, top: 16 }    // 下中央
        ];

        birdsConfig.forEach((config, index) => {
            const bird = document.createElement('div');
            bird.className = 'event-bird';
            bird.innerHTML = '<span class="material-icons game-bird">keyboard_arrow_down</span>';

            // ずらし
            bird.style.animationDelay = `${config.delay}s`;
            bird.style.top = `${config.top}%`;

            container.appendChild(bird);

            // クリーンアップ
            setTimeout(() => {
                bird.remove();
                if (index === 2 && callback) callback();
            }, 12000 + (config.delay * 1000));
        });
    },

    // ========================================
    // イベントメッセージ表示
    // ========================================
    showEventMessage(text, icon = 'info') {
        const fishingArea = document.getElementById('fishing-screen');
        if (!fishingArea) return;

        const msg = document.createElement('div');
        msg.className = 'event-message';
        msg.innerHTML = `
            <span class="material-icons">${icon}</span>
            <span>${text}</span>
        `;
        fishingArea.appendChild(msg);

        setTimeout(() => {
            msg.remove();
        }, 4000);
    },

    // ========================================
    // フィーバー演出の更新
    // ========================================
    updateFeverVisuals() {
        // フィーバーコンテナがなければ作成
        let container = document.querySelector('.fever-container');
        if (!container) {
            const fishingScreen = document.getElementById('fishing-screen');
            if (fishingScreen) {
                container = document.createElement('div');
                container.className = 'fever-container';
                container.innerHTML = `
                <div class="fever-sky-area">
                    <div class="celestial-body sun">
                        <span class="material-icons">wb_sunny</span>
                    </div>
                    <div class="celestial-body moon">
                        <span class="material-icons">nightlight</span>
                    </div>
                </div>
            `;
                // 背景の手前、UIの後ろ
                fishingScreen.insertBefore(container, fishingScreen.firstChild);
            }
        }

        if (!container) return;

        const fever = GameState.fever;
        const sun = container.querySelector('.sun');
        const moon = container.querySelector('.moon');

        // クラスをリセット
        container.className = 'fever-container';
        container.classList.add(`fever-lv-${fever.value}`);

        // タイプ別表示
        if (fever.type === 'sun') {
            container.classList.add('type-sun');
        } else if (fever.type === 'moon') {
            container.classList.add('type-moon');
        }

        // フィーバー中は背景変化などのエフェクト
        if (fever.isActive) {
            container.classList.add('fever-active');
        }
    },

    // ========================================
    // 一時メッセージ表示
    // ========================================
    showMessage(message, duration = 2000) {
        // 既存のメッセージを削除
        const existing = document.querySelector('.toast-message');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);

        // フェードイン
        setTimeout(() => toast.classList.add('show'), 10);

        // フェードアウトして削除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
