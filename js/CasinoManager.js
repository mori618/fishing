// チンチロ（カジノ）のロジック管理
// 役の判定、勝敗、配当計算などを担当

const CasinoManager = {
    // ========================================
    // 役の定義と強さ
    // ========================================
    // 強さ: 456 > Zoro > 6..1 > 123
    // Zoroの強さは数字による（666 > 111）が、
    // ここでは役としてのカテゴリ強さを優先し、同カテゴリ内での比較に使用

    // ========================================
    // 状態
    // ========================================
    betAmount: 0,
    history: [], // 履歴 { winner: 'player'|'dealer', outcome: 'win'|'lose'|'draw', profit: 100 }

    // ========================================
    // サイコロを振る (1-6の整数 x 3)
    // ========================================
    rollDice() {
        return [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
    },

    // ========================================
    // 役の判定
    // ========================================
    // 戻り値: { type: '456'|'123'|'zoro'|'point'|'menashi', value: number, text: string }
    evaluateHand(dice) {
        // ソートして判定しやすくする
        const d = [...dice].sort((a, b) => a - b);
        const [d1, d2, d3] = d;

        // 1. 4-5-6 (シゴロ)
        if (d1 === 4 && d2 === 5 && d3 === 6) {
            return { type: '456', value: 100, text: 'シゴロ (4-5-6)' };
        }

        // 2. 1-2-3 (ヒフミ)
        if (d1 === 1 && d2 === 2 && d3 === 3) {
            return { type: '123', value: -100, text: 'ヒフミ (1-2-3)' };
        }

        // 3. ゾロ目 (アラシ)
        if (d1 === d2 && d2 === d3) {
            return { type: 'zoro', value: 50 + d1, text: `${d1}のゾロ目` };
        }

        // 4. ポイント (2つ同じ)
        if (d1 === d2) return { type: 'point', value: d3, text: `${d3}点` };
        if (d2 === d3) return { type: 'point', value: d1, text: `${d1}点` };
        if (d1 === d3) return { type: 'point', value: d2, text: `${d2}点` }; // ソートしてるからあり得ないが念のため

        // 5. 目なし
        return { type: 'menashi', value: 0, text: '目なし' };
    },

    // ========================================
    // ターン実行（目なしなら最大3回振る）
    // ========================================
    // 戻り値: { bestHand: {}, history: [] }
    rollForTurn() {
        const history = [];
        let hand = null;

        for (let i = 0; i < 3; i++) {
            const dice = this.rollDice();
            hand = this.evaluateHand(dice);
            history.push({ dice, hand });

            // 目なし以外なら終了
            if (hand.type !== 'menashi') {
                break;
            }
        }

        return { hand, history };
    },

    // ========================================
    // UI管理
    // ========================================
    currentTab: 'slots', // slots, dice, recycle

    switchTab(tab) {
        this.currentTab = tab;
        this.render();
    },

    render() {
        const area = document.getElementById('casino-main-area');
        if (!area) return;
        area.innerHTML = '';

        // 所持金の表示更新
        const moneyDisplay = document.getElementById('casino-money-display');
        if (moneyDisplay) moneyDisplay.textContent = `¥${GameState.money.toLocaleString()}`;

        // タブナビゲーション
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'shop-tabs sub-tabs';
        tabsContainer.style.marginBottom = '20px';
        tabsContainer.style.justifyContent = 'center';
        tabsContainer.innerHTML = `
            <button class="shop-tab ${this.currentTab === 'slots' ? 'active' : ''}" onclick="CasinoManager.switchTab('slots')">
                <span class="material-icons">casino</span> スロット
            </button>
            <button class="shop-tab ${this.currentTab === 'dice' ? 'active' : ''}" onclick="CasinoManager.switchTab('dice')">
                <span class="material-icons">change_history</span> チンチロ
            </button>
            <button class="shop-tab ${this.currentTab === 'recycle' ? 'active' : ''}" onclick="CasinoManager.switchTab('recycle')">
                <span class="material-icons">recycling</span> 交換所
            </button>
        `;
        area.appendChild(tabsContainer);

        // コンテンツエリア
        const contentContainer = document.createElement('div');
        contentContainer.className = 'casino-content';
        area.appendChild(contentContainer);

        if (this.currentTab === 'slots') {
            const gachaSection = document.createElement('div');
            gachaSection.className = 'gacha-section';
            this.renderGachaMachines(gachaSection);
            contentContainer.appendChild(gachaSection);
        } else if (this.currentTab === 'dice') {
            this.renderDiceGame(contentContainer);
        } else if (this.currentTab === 'recycle') {
            const recycleSection = document.createElement('div');
            recycleSection.id = 'recycle-section';
            recycleSection.className = 'recycle-alley';
            contentContainer.appendChild(recycleSection);
            ShopManager.renderRecycleUI();
        }
    },

    renderGachaMachines(container) {
        const config = GAME_DATA.GACHA_CONFIG;
        const tiers = [
            { id: 'BRONZE', name: 'スロット：ブロンズ', color: '#cd7f32' },
            { id: 'SILVER', name: 'スロット：シルバー', color: '#c0c0c0' },
            { id: 'GOLD', name: 'スロット：ゴールド', color: '#ffd700' }
        ];

        tiers.forEach(tier => {
            const data = config[tier.id];
            const card = document.createElement('div');
            card.className = 'gacha-machine-card';
            card.style.borderColor = tier.color;
            card.innerHTML = `
                <div class="machine-header">
                    <div class="machine-display">${tier.name}</div>
                </div>
                <div class="item-action-container" style="justify-content: center;">
                    <button class="btn btn-buy" onclick="ShopManager.drawGacha('${tier.id}', 1)">
                        単発 ¥${data.single.toLocaleString()}
                    </button>
                    <button class="btn btn-buy" onclick="ShopManager.drawGacha('${tier.id}', 10)">
                        10連 ¥${data.ten.toLocaleString()}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    // ========================================
    // チンチロ (Dice Game)
    // ========================================
    renderDiceGame(container) {
        // 借金状態なら赤く表示
        const isDebt = GameState.hasDebt();
        const debtAmount = GameState.getDebt();

        // 借金返済のメッセージ
        let debtHtml = '';
        if (isDebt) {
            debtHtml = `<div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 8px; padding: 10px; margin-bottom: 20px; text-align: center; color: #fca5a5;">
                <span class="material-icons" style="vertical-align: middle;">warning</span> 
                現在借金中: <strong>-${debtAmount.toLocaleString()} G</strong>
            </div>`;
        }

        let html = `
            ${debtHtml}
            <div class="casino-header" style="text-align: center; margin-bottom: 20px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px;">
                <h3 style="margin-bottom: 10px; font-size: 1.5rem;">🎲 チンチロ</h3>
                <div class="casino-rules" style="font-size: 0.8rem; color: #ccc; text-align: left; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px;">
                    <strong>ルール:</strong><br>
                    • <strong>4-5-6 (シゴロ)</strong>: 4倍勝ち<br>
                    • <strong>ゾロ目 / 相手が1-2-3</strong>: 3倍勝ち<br>
                    • <strong>通常勝ち</strong>: 2倍勝ち<br>
                    • <strong>1-2-3 (ヒフミ) / 相手がゾロ目</strong>: 没収 + 同額支払い (計2倍負け)<br>
                    • <strong>相手が4-5-6</strong>: 没収 + 2倍支払い (計3倍負け)<br>
                    <span style="color: #ef4444;">※支払い不能分は借金になります</span>
                </div>
            </div>

            <div class="casino-board" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <div class="bet-input-container" style="display: flex; gap: 10px; align-items: center;">
                    <span style="font-weight: bold;">賭け金:</span>
                    <input type="number" id="bet-amount" value="100" min="10" step="10" 
                        style="padding: 8px; border-radius: 4px; border: 1px solid #555; background: #333; color: white; width: 100px; text-align: right;">
                    <span>G</span>
                </div>
                
                <div class="casino-actions">
                    <button class="btn btn-buy" onclick="CasinoManager.playCasino()" style="padding: 12px 32px; font-size: 1.2rem; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);">
                        勝負する！
                    </button>
                </div>
                
                <div id="casino-result" class="casino-result" style="width: 100%; min-height: 150px; display: none; flex-direction: column; items-align: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; text-align: center;">
                    <!-- 結果表示エリア -->
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    // カジノ実行
    async playCasino() {
        const input = document.getElementById('bet-amount');
        const bet = parseInt(input.value, 10);

        if (isNaN(bet) || bet <= 0) {
            UIManager.showMessage('賭け金を正しく入力してください');
            return;
        }

        if (GameState.money < bet) {
            UIManager.showMessage('賭け金が足りません！');
            return;
        }

        // ロジック実行
        const data = this.playRound(bet);

        // 演出実行
        await this.runCasinoAnimation(data);

        // 最終的な所持金更新
        UIManager.updateMoney();
        const moneyDisplay = document.getElementById('casino-money-display');
        if (moneyDisplay) moneyDisplay.textContent = `¥${GameState.money.toLocaleString()}`;

        if (GameState.hasDebt()) {
            UIManager.showMessage('借金をしてしまった...');
        }
    },

    // アニメーション付き結果表示
    async runCasinoAnimation(data) {
        const resultArea = document.getElementById('casino-result');
        if (resultArea) {
            resultArea.style.display = 'flex';
        }

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const waitForRoll = (label = 'サイコロを振る') => {
            return new Promise(resolve => {
                if (!resultArea) return resolve();
                const btnId = 'casino-roll-btn';
                resultArea.innerHTML = `
                    <div style="margin-bottom: 20px; color: #fff;">準備完了！</div>
                    <button id="${btnId}" class="btn" style="padding: 15px 40px; font-size: 1.5rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4); animation: pulse 2s infinite;">
                        🎲 ${label}
                    </button>
                    ${!document.getElementById('anim-style-pulse') ? `
                    <style id="anim-style-pulse">
                        @keyframes pulse {
                            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                        }
                    </style>` : ''}
                `;
                document.getElementById(btnId).addEventListener('click', () => {
                    resolve();
                });
            });
        };

        const updateDisplay = (playerDice, playerHandText, dealerDice, dealerHandText, message) => {
            if (!resultArea) return;
            let html = '';
            if (playerDice) {
                html += `
                    <div style="font-size: 1.2rem; margin-bottom: 20px; color: #fff;">
                        自分: <span style="font-weight:bold; font-size:1.5rem;">${playerHandText}</span>
                        <div class="dice-display">${this.getDiceIcons(playerDice)}</div>
                    </div>
                `;
            } else {
                html += `<div style="font-size: 1.2rem; margin-bottom: 20px; color: #fff; opacity: 0.5;">自分: ...</div>`;
            }

            if (dealerDice || dealerHandText !== '-') {
                html += `
                    <div style="font-size: 1.2rem; margin-bottom: 20px; color: #aaa;">
                        相手: <span style="font-weight:bold; font-size:1.5rem;">${dealerHandText}</span>
                        <div class="dice-display">${dealerDice ? this.getDiceIcons(dealerDice) : '???'}</div>
                    </div>
                `;
            }
            if (message) {
                html += `<div style="font-size: 1.5rem; font-weight: bold; color: #fbbf24;">${message}</div>`;
            }
            resultArea.innerHTML = html;
        };

        let lastPlayerDice = null;
        let lastPlayerHandText = '...';

        for (let i = 0; i < data.playerHistory.length; i++) {
            const turn = data.playerHistory[i];
            const isLast = i === data.playerHistory.length - 1;

            if (i > 0) await waitForRoll('再挑戦！(振る)');
            else await waitForRoll('サイコロを振る');

            updateDisplay(lastPlayerDice, lastPlayerHandText, null, '-', 'Rolling...');
            await sleep(600);

            lastPlayerDice = turn.dice;
            lastPlayerHandText = turn.hand.text;
            const msg = turn.hand.type === 'menashi' ? (isLast ? '目なし...' : '目なし... 再挑戦！') : turn.hand.text + '！';
            updateDisplay(lastPlayerDice, lastPlayerHandText, null, '-', msg);
            await sleep(isLast ? 1000 : 1000);
        }

        const playerWinDirect = data.playerHand.type === '456';
        const playerLoseDirect = data.playerHand.type === '123';
        if (playerWinDirect || playerLoseDirect) {
            this.showFinalResult(data, resultArea);
            return;
        }

        updateDisplay(lastPlayerDice, lastPlayerHandText, null, 'Rolling...', '相手の番です...');
        await sleep(1000);

        let lastDealerDice = null;
        let lastDealerHandText = '...';

        for (let i = 0; i < data.dealerHistory.length; i++) {
            const turn = data.dealerHistory[i];
            const isLast = i === data.dealerHistory.length - 1;

            updateDisplay(lastPlayerDice, lastPlayerHandText, null, 'Rolling...', '相手が振っています...');
            await sleep(600);

            lastDealerDice = turn.dice;
            lastDealerHandText = turn.hand.text;
            const msg = turn.hand.type === 'menashi' ? (isLast ? '相手: 目なし...' : '相手: 目なし... 再挑戦') : '相手: ' + turn.hand.text + '！';
            updateDisplay(lastPlayerDice, lastPlayerHandText, lastDealerDice, lastDealerHandText, msg);
            await sleep(1000);
        }

        this.showFinalResult(data, resultArea);
    },

    showFinalResult(data, resultArea) {
        const resultColor = data.profit > 0 ? '#22c55e' : (data.profit < 0 ? '#ef4444' : '#94a3b8');
        const resultText = data.result === 'win' ? 'WIN!' : (data.result === 'lose' ? 'LOSE...' : 'DRAW');

        let html = `
            <div style="font-size: 1.2rem; margin-bottom: 10px; color: #fff;">
                自分: <span style="font-weight:bold; font-size:1.5rem;">${data.playerHand.text}</span> 
                <span class="dice-display">${this.getDiceIcons(data.playerDice)}</span>
            </div>
        `;

        if (data.dealerHistory && data.dealerHistory.length > 0) {
            html += `
                <div style="font-size: 1.2rem; margin-bottom: 20px; color: #aaa;">
                    相手: <span style="font-weight:bold; font-size:1.5rem;">${data.dealerHand.text}</span>
                    <span class="dice-display">${this.getDiceIcons(data.dealerDice)}</span>
                </div>
            `;
        }

        html += `
            <div class="result-outcome" style="font-size: 2.5rem; font-weight: bold; color: ${resultColor}; text-shadow: 0 0 10px ${resultColor}; margin: 10px 0; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                ${resultText}
            </div>
            <div class="result-reason" style="font-size: 1rem; color: #ccc; margin-bottom: 10px;">
                ${data.reason}
            </div>
            <div class="result-profit" style="font-size: 1.5rem; font-weight: bold; color: ${resultColor};">
                ${data.profit > 0 ? '+' : ''}${data.profit.toLocaleString()} G
            </div>
        `;

        resultArea.innerHTML = html;

        if (!document.getElementById('anim-style-pop')) {
            const style = document.createElement('style');
            style.id = 'anim-style-pop';
            style.innerHTML = `
                @keyframes popIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .dice-display { display: inline-block; vertical-align: middle; margin-left: 10px; }
            `;
            document.head.appendChild(style);
        }
    },

    getDiceIcons(dice) {
        const unicodeDice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return dice.map(d => `<span style="font-size: 2rem; margin: 0 2px;">${unicodeDice[d - 1]}</span>`).join('');
    },

    // ========================================
    // ゲーム実行 (1ラウンド)
    // ========================================
    // 戻り値: { 
    //   playerDice: [], playerHand: {}, 
    //   dealerDice: [], dealerHand: {}, 
    //   result: 'win'|'lose'|'draw', 
    //   payout: number, // 増減額（プラスなら利益、マイナスなら損失）
    //   reason: string
    // }
    playRound(bet) {
        if (bet <= 0) return { error: '賭け金が無効です' };

        // 所持金をチェックしない（借金可能にするため）

        // 1. プレイヤーのターン (最大3回)
        const playerTurn = this.rollForTurn();
        const playerHand = playerTurn.hand;

        let dealerTurn = { hand: { type: 'none', value: -999, text: '-' }, history: [] };
        let dealerHand = dealerTurn.hand;

        let result = 'draw';
        let payout = 0;
        let reason = '';
        let multiplier = 0;

        // --- 即時判定チェック (特殊役) ---

        // プレイヤーが 4-5-6 -> 即勝ち (4倍付け)
        if (playerHand.type === '456') {
            result = 'win';
            reason = '4-5-6で勝利！';
            multiplier = 4;
        }
        // プレイヤーが 1-2-3 -> 即負け (2倍払い)
        else if (playerHand.type === '123') {
            result = 'lose';
            reason = '1-2-3で敗北...';
            multiplier = -2; // 没収(1) + ペナルティ(1) = -2
        }
        else {
            // ディーラーのターン (最大3回)
            dealerTurn = this.rollForTurn();
            dealerHand = dealerTurn.hand;

            // ディーラーが 4-5-6 -> 即負け (3倍払い)
            if (dealerHand.type === '456') {
                result = 'lose';
                reason = '相手が4-5-6を出した...';
                multiplier = -3; // 没収(1) + ペナルティ(2) = -3
            }
            // ディーラーが 1-2-3 -> 即勝ち (3倍付け)
            else if (dealerHand.type === '123') {
                result = 'win';
                reason = '相手が1-2-3を出した！';
                multiplier = 3;
            }
            // ディーラーが ゾロ目 -> 即負け (2倍払い)
            else if (dealerHand.type === 'zoro') {
                if (playerHand.type === 'zoro' && playerHand.value > dealerHand.value) {
                    // プレイヤーもゾロ目で、プレイヤーの方が強い場合 -> 勝ち (3倍)
                    result = 'win';
                    reason = '強いゾロ目で勝利！';
                    multiplier = 3;
                } else if (playerHand.type === 'zoro' && playerHand.value === dealerHand.value) {
                    result = 'draw'; // 同じなら引き分け
                } else {
                    result = 'lose';
                    reason = '相手がゾロ目を出した...';
                    multiplier = -2; // 没収(1) + ペナルティ(1) = -2
                }
            }
            // プレイヤーが ゾロ目 (相手は非456/非123/非ゾロ目、あるいは弱いゾロ目) -> 勝ち (3倍付け)
            else if (playerHand.type === 'zoro') {
                result = 'win';
                reason = 'ゾロ目で勝利！';
                multiplier = 3;
            }
            // --- ポイント勝負 ---
            else {
                // 両者ポイント or 目なし
                if (playerHand.value > dealerHand.value) {
                    result = 'win';
                    reason = 'ポイント勝負で勝利！';
                    multiplier = 2; // 通常勝ち (2倍 ＝ Net+1)
                } else if (playerHand.value < dealerHand.value) {
                    result = 'lose';
                    reason = 'ポイント勝負で敗北...';
                    multiplier = -1; // 通常負け (没収のみ)
                } else {
                    result = 'draw';
                    reason = '引き分け';
                    multiplier = 0; // 返金 (Net 0)
                }
            }
        }

        // 配当計算
        // multiplier は「元本の何倍になるか」ではなく「損益の倍率」として扱う
        // win: +1なら元本(1)+利益(1)=2倍返し。 profit = bet * (mult - 1) は間違いやすい。
        // シンプルに:
        // win x2 -> 手元に bet*2 が戻る。  Profit = bet * 1
        // win x3 -> 手元に bet*3 が戻る。  Profit = bet * 2
        // win x4 -> 手元に bet*4 が戻る。  Profit = bet * 3
        // lose x-1 -> 没収。                Profit = -bet
        // lose x-2 -> 没収 + bet払い。       Profit = -bet * 2
        // lose x-3 -> 没収 + bet*2払い。     Profit = -bet * 3

        let profit = 0;

        if (result === 'win') {
            // multiplier倍になって戻ってくる -> 利益は bet * (multiplier - 1)
            // 例: x2 -> 利益 x1
            // 例: x3 -> 利益 x2
            // 例: x4 -> 利益 x3
            profit = bet * (multiplier - 1);
        } else if (result === 'lose') {
            // multiplierは負の値 (-1, -2, -3)
            // 利益は bet * multiplier
            profit = bet * multiplier; // そのまま負の値になる
        } else {
            // draw
            profit = 0;
        }

        // GameState更新
        GameState.money += profit;

        // 借金チェックはGameState側で任せるが、UI表示用にここで判定も可

        return {
            playerDice: playerTurn.history[playerTurn.history.length - 1].dice, // 最後の出目
            playerHand,
            playerHistory: playerTurn.history, // 履歴追加

            dealerDice: dealerHand.type === 'none' ? [0, 0, 0] : dealerTurn.history[dealerTurn.history.length - 1].dice,
            dealerHand,
            dealerHistory: dealerTurn.history, // 履歴追加

            result,
            bet,
            multiplier,
            profit,
            reason
        };
    }
};

// グローバル公開
if (typeof window !== 'undefined') {
    window.CasinoManager = CasinoManager;
}
