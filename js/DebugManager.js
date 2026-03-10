/**
 * デバッグ管理マネージャー
 * 各種ステータスの自由な書き換えを提供
 */
const DebugManager = {
    // ログ設定
    logEnabled: false,
    originalConsole: null,
    /**
     * デバッグ画面のレンダリング
     */
    render() {
        const container = document.getElementById('debug-main-area');
        if (!container) return;

        container.innerHTML = `
            <div class="debug-container" style="padding: 20px; color: #fff;">
                
                <!-- 基本ステータス操作 -->
                <section class="debug-section" style="margin-bottom: 30px; border: 1px solid #444; padding: 15px; border-radius: 8px;">
                    <h3 style="margin-bottom: 15px; color: #fbbf24; border-bottom: 1px solid #444; padding-bottom: 5px;">💰 基本ステータス</h3>
                    <div style="display: grid; gap: 15px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label style="width: 80px;">所持金:</label>
                            <input type="number" id="debug-money-input" value="${GameState.money}" style="flex: 1; padding: 5px; background: #222; color: #fff; border: 1px solid #666;">
                            <button class="btn-action" style="padding: 5px 15px;" onclick="DebugManager.updateMoney()">セット</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label style="width: 80px;">チケ数:</label>
                            <input type="number" id="debug-ticket-input" value="${GameState.gachaTickets}" style="flex: 1; padding: 5px; background: #222; color: #fff; border: 1px solid #666;">
                            <button class="btn-action" style="padding: 5px 15px;" onclick="DebugManager.updateTickets()">セット</button>
                        </div>
                    </div>
                </section>

                <!-- ランク・経験値操作 -->
                <section class="debug-section" style="margin-bottom: 30px; border: 1px solid #444; padding: 15px; border-radius: 8px;">
                    <h3 style="margin-bottom: 15px; color: #38bdf8; border-bottom: 1px solid #444; padding-bottom: 5px;">📈 ランク操作 (現在: Lv.${GameState.playerRank})</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <button class="btn-nav" onclick="DebugManager.addRank(1)">ランク+1</button>
                        <button class="btn-nav" onclick="DebugManager.addRank(10)">ランク+10</button>
                        <button class="btn-nav" onclick="DebugManager.maxRank()">一気にMAX</button>
                    </div>
                </section>

                <!-- スキル操作 -->
                <section class="debug-section" style="margin-bottom: 30px; border: 1px solid #444; padding: 15px; border-radius: 8px;">
                    <h3 style="margin-bottom: 15px; color: #a855f7; border-bottom: 1px solid #444; padding-bottom: 5px;">🧪 スキル操作</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <button class="btn-nav" onclick="DebugManager.unlockAllSkills()">全スキル解放</button>
                        <button class="btn-nav" onclick="DebugManager.resetSkills()" style="background: #450a0a; border-color: #991b1b; color: #f87171;">スキル全削除</button>
                    </div>
                </section>

                <!-- フィーバー操作 -->
                <section class="debug-section" style="margin-bottom: 30px; border: 1px solid #444; padding: 15px; border-radius: 8px;">
                    <h3 style="margin-bottom: 15px; color: #ef4444; border-bottom: 1px solid #444; padding-bottom: 5px;">🔥 フィーバー設定</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                        <button class="btn-nav" onclick="DebugManager.forceFever('sun')">太陽発動</button>
                        <button class="btn-nav" onclick="DebugManager.forceFever('moon')">月発動</button>
                        <button class="btn-nav" onclick="DebugManager.resetFever()">リセット</button>
                    </div>
                </section>

                <!-- その他 -->
                <section class="debug-section" style="margin-bottom: 30px; border: 1px solid #444; padding: 15px; border-radius: 8px;">
                    <h3 style="margin-bottom: 15px; color: #94a3b8; border-bottom: 1px solid #444; padding-bottom: 5px;">⚙️ その他</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                        <button class="btn-nav" onclick="DebugManager.unlockEncyclopedia()">図鑑コンプ</button>
                        <button class="btn-nav" onclick="DebugManager.clearSave()" style="background: #450a0a; color: #f87171;">データ初期化</button>
                    </div>
                    <h3 style="margin-bottom: 15px; color: #10b981; border-bottom: 1px solid #444; padding-bottom: 5px;">💻 画面上デバッグログ</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center;">
                        <button class="btn-nav" onclick="DebugManager.toggleDebugLog()" style="background: ${this.logEnabled ? '#065f46' : '#efebe9'}; color: ${this.logEnabled ? '#a7f3d0' : '#5d4037'}; border-color: ${this.logEnabled ? '#059669' : '#a1887f'};" id="debug-log-toggle-btn">
                            ${this.logEnabled ? 'オンスクリーンログ: ON' : 'オンスクリーンログ: OFF'}
                        </button>
                        <button class="btn-nav" onclick="document.getElementById('debug-log-content').innerHTML=''" style="font-size: 12px; padding: 5px 10px;">ログクリア</button>
                    </div>
                </section>

            </div>
        `;
    },

    /**
     * 所持金の更新
     */
    updateMoney() {
        const input = document.getElementById('debug-money-input');
        const val = parseInt(input.value);
        if (isNaN(val)) return;
        GameState.money = val;
        this.afterUpdate('所持金をセットしました');
    },

    /**
     * チケットの更新
     */
    updateTickets() {
        const input = document.getElementById('debug-ticket-input');
        const val = parseInt(input.value);
        if (isNaN(val)) return;
        GameState.gachaTickets = val;
        this.afterUpdate('ガチャチケットをセットしました');
    },

    /**
     * ランク追加
     */
    addRank(num) {
        for (let i = 0; i < num; i++) {
            GameState.rankUp();
        }
        this.afterUpdate(`ランクを ${num} 上げました`);
    },

    /**
     * ランクMAX
     */
    maxRank() {
        GameState.playerRank = 100; // 適当な上限
        this.afterUpdate('最高ランクにセットしました');
    },

    /**
     * 全スキル解放
     */
    unlockAllSkills() {
        GAME_DATA.SKILLS.forEach(skill => {
            if (!GameState.ownedSkills[skill.id]) {
                GameState.ownedSkills[skill.id] = 1;
            } else {
                GameState.ownedSkills[skill.id] += 1;
            }
        });
        this.afterUpdate('全スキルを1つずつ追加しました');
    },

    /**
     * スキルリセット
     */
    resetSkills() {
        if (!confirm('所持スキルをすべて削除しますか？')) return;
        GameState.ownedSkills = {};
        GameState.equippedSkills = [];
        this.afterUpdate('スキルをすべて削除しました');
    },

    /**
     * 強制フィーバー
     */
    forceFever(type) {
        GameState.fever.isActive = true;
        GameState.fever.value = 6;
        GameState.fever.type = type;
        this.afterUpdate(`${type === 'sun' ? '太陽' : '月'}のフィーバーを開始しました`);
    },

    /**
     * フィーバーリセット
     */
    resetFever() {
        GameState.fever.isActive = false;
        GameState.fever.value = 0;
        GameState.fever.type = null;
        this.afterUpdate('フィーバー状態をリセットしました');
    },

    /**
     * 図鑑コンプ
     */
    unlockEncyclopedia() {
        GAME_DATA.FISH_LIST.forEach(fish => {
            if (!GameState.encyclopedia[fish.id]) {
                GameState.encyclopedia[fish.id] = { count: 1, maxWeight: 100 };
            }
        });
        this.afterUpdate('図鑑をすべて埋めました');
    },

    /**
     * セーブデータ削除
     */
    clearSave() {
        if (!confirm('完全に初期化しますか？ページがリロードされます。')) return;
        SaveManager.clearSaveData();
        location.reload();
    },

    /**
     * 更新後の共通処理
     */
    afterUpdate(message) {
        UIManager.showMessage(message);
        UIManager.updateMoney();
        SaveManager.saveGame();
        this.render(); // 再描画
    },

    /**
     * デバッグログの切り替え
     */
    toggleDebugLog() {
        this.logEnabled = !this.logEnabled;
        const overlay = document.getElementById('debug-log-overlay');
        if (overlay) {
            if (this.logEnabled) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
        this.afterUpdate(`オンスクリーンログを ${this.logEnabled ? 'ON' : 'OFF'} にしました`);
    },

    /**
     * ログフックの初期化
     */
    initLogger() {
        if (this.originalConsole) return; // 既に初期化済み

        this.originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
        };

        const writeToOverlay = (type, args) => {
            const overlayContent = document.getElementById('debug-log-content');
            if (overlayContent && this.logEnabled) {
                const colors = {
                    log: '#e2e8f0',
                    warn: '#fbbf24',
                    error: '#ef4444',
                    info: '#38bdf8'
                };
                
                const time = new Date().toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
                
                // オブジェクトのディープダンプ（簡易）
                const formattedArgs = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null) {
                        try {
                            return JSON.stringify(arg);
                        } catch (e) {
                            return String(arg);
                        }
                    }
                    return String(arg);
                }).join(' ');

                const logEntry = document.createElement('div');
                logEntry.style.color = colors[type];
                logEntry.style.marginBottom = '4px';
                logEntry.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                logEntry.style.paddingBottom = '4px';
                logEntry.innerHTML = `<span style="color:#94a3b8; font-size:10px; margin-right:5px;">[${time}]</span> ${formattedArgs}`;
                
                overlayContent.appendChild(logEntry);
                
                // 自動スクロール
                overlayContent.scrollTop = overlayContent.scrollHeight;
            }
        };

        console.log = (...args) => {
            writeToOverlay('log', args);
            this.originalConsole.log.apply(console, args);
        };
        console.warn = (...args) => {
            writeToOverlay('warn', args);
            this.originalConsole.warn.apply(console, args);
        };
        console.error = (...args) => {
            writeToOverlay('error', args);
            this.originalConsole.error.apply(console, args);
        };
        console.info = (...args) => {
            writeToOverlay('info', args);
            this.originalConsole.info.apply(console, args);
        };

        // UI表示の復元
        const overlay = document.getElementById('debug-log-overlay');
        if (overlay && this.logEnabled) {
            overlay.classList.remove('hidden');
        }
    }
};

// ロガーを即時初期化
DebugManager.initLogger();


// グローバル公開
window.DebugManager = DebugManager;
