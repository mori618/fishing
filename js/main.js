// メインエントリーポイント
// ゲームの初期化とイベントリスナー設定

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 フィッシング・エボリューション 起動中...');

    // ========================================
    // 初期化
    // ========================================
    UIManager.initStartScreen();

    // ========================================
    // スタート画面のイベント
    // ========================================

    // 新規ゲーム
    document.getElementById('start-btn').addEventListener('click', () => {
        GameState.init(null);  // 新規データで初期化
        FishingGame.init();
        UIManager.showScreen('fishing');
        console.log('🆕 新規ゲームを開始しました');
    });

    // 続きから
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            const saveData = SaveManager.load();
            if (saveData) {
                GameState.init(saveData);
                FishingGame.init();
                UIManager.showScreen('fishing');
                console.log('📂 セーブデータから再開しました');
            }
        });
    }

    // ========================================
    // 釣り画面のイベント
    // ========================================

    // 釣り画面のクリック（全画面対応）
    document.getElementById('fishing-screen').addEventListener('pointerdown', (e) => {
        // ボタンまたはその子要素（アイコンなど）のクリックは無視
        if (e.target.closest('button')) return;
        FishingGame.onClick();
    });

    // ショップボタン（底部ナビゲーション）
    document.getElementById('shop-btn').addEventListener('click', () => {
        FishingGame.abort();
        updateNavActive('shop');
        UIManager.showScreen('shop');
    });

    // ショップボタン（右上）
    const shopBtnTop = document.getElementById('shop-btn-top');
    if (shopBtnTop) {
        shopBtnTop.addEventListener('click', () => {
            FishingGame.abort();
            updateNavActive('shop');
            UIManager.showScreen('shop');
        });
    }

    // ナビゲーションのアクティブ状態を更新する関数
    function updateNavActive(screen) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.screen === screen) {
                item.classList.add('active');
            }
        });
    }

    // ========================================
    // ショップ画面のイベント
    // ========================================

    // カテゴリタブ
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            ShopManager.setCategory(tab.dataset.category);
        });
    });

    // 売却ボタン
    document.getElementById('sell-btn').addEventListener('click', () => {
        ShopManager.sellAllFish();
    });

    // 釣りに戻るボタン
    document.getElementById('back-btn').addEventListener('click', () => {
        updateNavActive('fishing');
        UIManager.showScreen('fishing');
    });

    // 図鑑ボタン
    document.getElementById('encyclopedia-btn').addEventListener('click', () => {
        UIManager.showScreen('encyclopedia');
    });

    // 図鑑から戻るボタン
    document.getElementById('encyclopedia-back-btn').addEventListener('click', () => {
        UIManager.showScreen('shop');
    });

    // 底部ナビゲーションの釣り場ボタン
    const fishingNavBtn = document.querySelector('.nav-item[data-screen="fishing"]');
    if (fishingNavBtn) {
        fishingNavBtn.addEventListener('click', () => {
            updateNavActive('fishing');
            UIManager.showScreen('fishing');
        });
    }

    // ========================================
    // キーボードショートカット（デバッグ用）
    // ========================================
    document.addEventListener('keydown', (e) => {
        // Escキーで釣り中断
        if (e.key === 'Escape') {
            FishingGame.abort();
            UIManager.showIdle();
        }

        // スペースキーでクリック（釣り画面のみ）
        if (e.key === ' ' && UIManager.currentScreen === 'fishing') {
            e.preventDefault();
            FishingGame.onClick();
        }
    });

    console.log('✅ 初期化完了');
});
