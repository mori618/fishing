// メインエントリーポイント
// ゲームの初期化とイベントリスナー設定

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 フィッシング・エボリューション 起動中...');

    // ========================================
    // 初期化
    // ========================================
    UIManager.initStartScreen();
    // 港マネージャ初期化 (GameState初期化後に呼ぶ必要があるため、ここではなく startGame 後が良いが、
    // GameState.init は start-btn/continue-btn で呼ばれる。
    // そのため、initStartScreen時点ではまだ早すぎる可能性がある。
    // しかしいったんここで `setInterval` だけ仕込んでおくか、
    // あるいは `FishingGame.init` と同じタイミングで `PortManager.init` を呼ぶべき。

    // updateループは常に回しておき、内部で GameState チェックする設計にする
    // setInterval(() => {
    //     if (typeof PortManager !== 'undefined') {
    //         // main.js のループ間隔は 1000ms ではないかもしれないが、
    //         // setInterval(..., 1000) であれば dt=1000 として渡す
    //         PortManager.updateMetric(1000);
    //     }
    // }, 1000);

    // ========================================
    // スタート画面のイベント
    // ========================================

    // 新規ゲーム
    document.getElementById('start-btn').addEventListener('click', () => {
        GameState.init(null);  // 新規データで初期化
        FishingGame.init();
        // if (typeof PortManager !== 'undefined') PortManager.init();
        UIManager.showScreen('fishing');
        UIManager.updateFeverVisuals(); // フィーバー表示初期化
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
                // if (typeof PortManager !== 'undefined') PortManager.init();
                UIManager.showScreen('fishing');
                UIManager.updateFeverVisuals(); // フィーバー表示復元
                UIManager.updateMissionUI();    // ミッション表示更新
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



    // ショップボタン（右上）
    const shopBtnTop = document.getElementById('shop-btn-top');
    if (shopBtnTop) {
        shopBtnTop.addEventListener('click', () => {
            FishingGame.abort();

            UIManager.showScreen('shop');
            MissionManager.checkMission('go_town');
        });
    }

    // ヘルプボタン
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            UIManager.openHelp();
        });
    }

    // ヘルプ機能の初期化
    if (UIManager.initHelp) {
        UIManager.initHelp();
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


    // 図鑑から戻るボタン
    document.getElementById('encyclopedia-back-btn').addEventListener('click', () => {
        UIManager.showScreen('shop');
    });



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
