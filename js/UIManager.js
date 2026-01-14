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
                <div class="wait-text">当たりを待っています...</div>
            </div>
        `;

        this.updateRodView('waiting');
    },

    // ========================================
    // 釣り画面: 予兆（ウキ揺れ）
    // ========================================
    showNibble(shakeCount = 4, shakeInterval = 150) {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        // アニメーション時間を計算
        const animationDuration = shakeInterval / 1000;  // 秒に変換
        const totalDuration = animationDuration * shakeCount;

        fishingArea.innerHTML = `
            <div class="nibble-state">
                <div class="water-surface">
                    <div class="bobber nibbling" style="animation-duration: ${animationDuration}s; animation-iteration-count: ${shakeCount};">
                        <div class="bobber-stick"></div>
                        <div class="bobber-body"></div>
                    </div>
                    <div class="ripple active"></div>
                </div>
                <div class="nibble-text">何かがつついている...!</div>
            </div>
        `;

        this.updateRodView('nibble');
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
                <div class="hit-text flash">今だ！クリック！</div>
            </div>
        `;

        this.updateRodView('hit');
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
                <p class="gauge-battle-subtitle">赤いゾーンで止めて確率アップ！</p>
                <div class="fish-info">
                    <span class="fish-name rarity-${fish.rarity}">${fish.name}</span>
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
    showCatchSuccess(fish) {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        fishingArea.innerHTML = `
            <div class="result-state success">
                <div class="result-animation">
                    <span class="material-icons result-icon">set_meal</span>
                    <span class="material-icons sparkle-icon">auto_awesome</span>
                </div>
                <div class="result-text">
                    <span class="fish-name rarity-${fish.rarity}">${fish.name}</span>
                    を釣り上げた！
                </div>
                <div class="result-details">
                    パワー: ${fish.power} | 価値: ¥${fish.price.toLocaleString()}
                </div>
            </div>
        `;

        this.updateInventory();
    },

    // ========================================
    // 釣り上げ失敗
    // ========================================
    showCatchFailed(fish) {
        const fishingArea = document.getElementById('fishing-area');
        if (!fishingArea) return;

        fishingArea.innerHTML = `
            <div class="result-state failed">
                <div class="result-animation">
                    <span class="material-icons result-icon escaped">set_meal</span>
                </div>
                <div class="result-text">
                    <span class="fish-name rarity-${fish.rarity}">${fish.name}</span>
                    に逃げられた...
                </div>
            </div>
        `;
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
    // 餌情報更新
    // ========================================
    updateBaitInfo() {
        const baitInfo = document.getElementById('bait-info');
        if (!baitInfo) return;

        if (GameState.baitCount > 0) {
            baitInfo.textContent = `${GameState.baitCount} 個`;
        } else {
            baitInfo.textContent = '0 個';
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
