// セーブマネージャー
// localStorageを使用したゲームデータの永続化

const SaveManager = {
    SAVE_KEY: 'fishing_evolution_save',
    VERSION: '1.0',

    // ========================================
    // 初期データ（新規ゲーム用）
    // ========================================
    getDefaultData() {
        return {
            version: this.VERSION,
            saveDate: new Date().toISOString(),
            locationLevels: { 'loc_river': 1 },
            activeLocationLevels: { 'loc_river': 1 },
            locationExp: { 'loc_river': 0 },
            player: {
                money: 0,
                selectedSkin: 'skin_default'
            },
            rod: {
                rankIndex: 0,       // 現在の釣り竿のインデックス
                stars: 0,           // 星の数（0〜5）
                equippedSkills: []  // 装着中のスキルID配列
            },
            inventory: [],          // 持っている魚の配列
            unlocked: {
                rods: [0],          // アンロック済み釣り竿のインデックス
                skillInventory: {},  // IDごとの所持数 { "power_up_1": 3 }
                skins: ['skin_default'],
                skies: ['sky_default']
            },
            encyclopedia: {},       // 図鑑データ { fishId: { count: 0, hasSpecial: false } }
            statistics: {
                totalFishCaught: 0,
                caughtByRank: { 'D': 0, 'C': 0, 'B': 0, 'A': 0, 'S': 0, 'SS': 0 },
                totalTreasure: 0,
                totalSkills: 0,
                totalMoneyEarned: 0,
                totalCoinsEarned: 0,
                casinoTotalWin: 0,
                casinoTotalLoss: 0,
                gachaTickets: 0,
                currentMissionIndex: 0,
                missionProgress: 0,
                beginnerMissionCompleted: [],
                beginnerMissionProgress: {},
                dynamicMissions: null,
                dynamicMissionCompletedCount: 0,
                biggestFish: null
            }
        };
    },

    // ========================================
    // セーブ機能
    // ========================================
    save(gameState) {
        try {
            const saveData = {
                version: this.VERSION,
                saveDate: new Date().toISOString(),
                locationLevels: { ...gameState.locationLevels },
                activeLocationLevels: { ...gameState.activeLocationLevels },
                locationExp: { ...gameState.locationExp },
                player: {
                    money: gameState.money,
                    selectedSkin: gameState.selectedSkin,
                    selectedSky: gameState.selectedSky,
                    skillSets: [...(gameState.skillSets || [])]
                },
                rod: {
                    rankIndex: gameState.rodRankIndex,
                    rodStarLevels: { ...gameState.rodStarLevels }, // Save per-rod stars
                    stars: gameState.rodStars, // Backward compatibility
                    equippedSkills: [...gameState.equippedSkills]
                },
                inventory: [...gameState.inventory],
                unlocked: {
                    rods: [...gameState.unlockedRods],
                    skillInventory: { ...gameState.skillInventory },
                    skins: [...gameState.unlockedSkins],
                    skies: [...gameState.unlockedSkies]
                },
                encyclopedia: { ...gameState.encyclopedia },
                statistics: {
                    totalFishCaught: gameState.totalFishCaught,
                    caughtByRank: { ...gameState.caughtByRank },
                    totalTreasure: gameState.totalTreasure,
                    totalSkills: gameState.totalSkills,
                    totalMoneyEarned: gameState.totalMoneyEarned,
                    totalCoinsEarned: gameState.totalCoinsEarned,
                    casinoTotalWin: gameState.casinoTotalWin,
                    casinoTotalLoss: gameState.casinoTotalLoss,
                    campaignTotalWin: 0, // 予備
                    gachaTickets: gameState.gachaTickets,
                    currentMissionIndex: gameState.currentMissionIndex, // 互換用
                    missionProgress: gameState.missionProgress,         // 互換用
                    beginnerMissionCompleted: [...gameState.beginnerMissionCompleted],
                    beginnerMissionProgress: { ...gameState.beginnerMissionProgress },
                    dynamicMissions: gameState.dynamicMissions,
                    dynamicMissionCompletedCount: gameState.dynamicMissionCompletedCount,
                    biggestFish: gameState.biggestFish,
                    // フィーバー状態も保存
                    fever: { ...gameState.fever }
                }
            };

            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            console.log('💾 ゲームデータを保存しました:', saveData.saveDate, 'Mission:', saveData.statistics.currentMissionIndex);
            return true;
        } catch (error) {
            console.error('❌ セーブに失敗しました:', error);
            return false;
        }
    },

    // saveGameは予備の名前として追加（UIManagerからの呼び出し対応）
    saveGame() {
        // GameStateが渡されていない場合はグローバルなGameStateを使用
        // ※実際にはsaveメソッドに引数が必要だが、ここでの呼び出し元（UIManager）は引数を渡していない可能性がある
        // そのため、GameState変数を参照してsaveを呼ぶ
        return this.save(GameState);
    },

    // ========================================
    // ロード機能
    // ========================================
    load() {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (!savedData) {
                console.log('📁 セーブデータが見つかりません');
                return null;
            }

            const data = JSON.parse(savedData);
            console.log('📂 セーブデータを読み込みました:', data.saveDate, 'Mission:', data.statistics?.currentMissionIndex);

            // バージョンチェック・マイグレーション
            if (data.version !== this.VERSION) {
                console.log('🔄 データのマイグレーションを実行...');
                return this.migrate(data);
            }

            return data;
        } catch (error) {
            console.error('❌ ロードに失敗しました:', error);
            return null;
        }
    },

    // ========================================
    // セーブデータの存在チェック
    // ========================================
    hasSaveData() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },

    // ========================================
    // セーブデータの削除
    // ========================================
    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('🗑️ セーブデータを削除しました');
            return true;
        } catch (error) {
            console.error('❌ 削除に失敗しました:', error);
            return false;
        }
    },

    // ========================================
    // データマイグレーション（将来の互換性用）
    // ========================================
    migrate(oldData) {
        // 現時点では単純にデフォルト値とマージ
        const defaultData = this.getDefaultData();

        return {
            ...defaultData,
            ...oldData,
            version: this.VERSION,
            player: { ...defaultData.player, ...oldData.player },
            rod: { ...defaultData.rod, ...oldData.rod },
            unlocked: { ...defaultData.unlocked, ...oldData.unlocked },
            encyclopedia: { ...defaultData.encyclopedia, ...oldData.encyclopedia },
            statistics: { ...defaultData.statistics, ...oldData.statistics }
        };
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.SaveManager = SaveManager;
}
