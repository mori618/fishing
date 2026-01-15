// UIマネージャー
// 画面表示、アニメーション、エフェクトを管理

const UIManager = {
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

        fishingArea.innerHTML = `
            <div class="waiting-state">
                <div class="water-surface">
                    <div class="bobber waiting">
                        <div class="bobber-stick"></div>
                        <div class="bobber-body"></div>
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

        fishingArea.innerHTML = `
            <div class="nibble-state">
                <div class="water-surface">
                    <div class="bobber">
                        <div class="bobber-stick"></div>
                        <div class="bobber-body"></div>
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

        fishingArea.innerHTML = `
            <div class="hit-state">
                <div class="water-surface">
                    <div class="bobber sinking">
                        <div class="bobber-stick"></div>
                        <div class="bobber-body"></div>
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

        // クローズ処理
        const closeOverlay = () => {
            overlay.remove();
            document.removeEventListener('keydown', handleKeydown);
            // コールバックを実行
            if (typeof onClose === 'function') {
                onClose();
            }
        };

        // クリックで閉じる
        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            closeOverlay();
        });

        // スペースキーで閉じる
        const handleKeydown = (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                closeOverlay();
            }
        };
        document.addEventListener('keydown', handleKeydown);
    },

    // ========================================
    // ガチャ結果表示
    // ========================================
    showGachaResult(items, onClose) {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        // 結果リストのHTML生成
        const itemsHtml = items.map(item => `
            <div class="gacha-result-item rarity-${item.tier === 3 ? 'S' : item.tier === 2 ? 'B' : 'D'}">
                <div class="gacha-item-icon">
                    <span class="material-icons">auto_awesome</span>
                </div>
                <div class="gacha-item-info">
                    <div class="gacha-item-name">${item.name}</div>
                    <div class="gacha-item-tier">Tier ${item.tier}</div>
                </div>
                ${item.isNew ? '<span class="new-badge">NEW!</span>' : ''}
            </div>
        `).join('');

        // インベントリに加算
        items.forEach(item => {
            GameState.gainGachaResult(item.id);
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
            this.showMessage('この餌は無限に使えます');
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
