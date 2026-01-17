// チンチロリン（カジノ）のロジック管理
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
