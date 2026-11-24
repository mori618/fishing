/**
 * MissionManager.js
 * 初心者ミッションおよび動的ミッションの管理を行う
 */

const MissionManager = {
    // ========================================
    // 初心者ミッションリストの定義
    // ========================================
    MISSIONS: [
        {
            id: 'help',
            text: 'ヘルプ（？）ボタンを押してみよう',
            rewardText: '報酬: 50G + 次のミッションへ',
            check: (type) => type === 'help_click',
            reward: () => { }
        },
        {
            id: 'catch_1',
            text: '魚を1匹釣ろう',
            rewardText: '報酬: 50G + 次のミッションへ',
            check: (type) => type === 'catch_success',
            reward: () => { }
        },
        {
            id: 'go_town',
            text: '街へ行こう',
            rewardText: '報酬: 50G + 次のミッションへ',
            check: (type) => type === 'go_town',
            reward: () => { }
        },
        {
            id: 'sell_fish',
            text: '魚を売ろう',
            rewardText: '報酬: 50G + 次のミッションへ',
            check: (type) => type === 'sell_fish',
            reward: () => { }
        },
        {
            id: 'buy_bait',
            text: '餌を買おう',
            rewardText: '報酬: 50G + 次のミッションへ',
            check: (type) => type === 'buy_bait',
            reward: () => { }
        },
        {
            id: 'catch_with_bait',
            text: '餌を変更して魚を釣ろう',
            rewardText: '報酬: 50G + スキル「釣りパワー増加I」',
            check: (type, data) => type === 'catch_success' && data.baitId !== 'bait_d',
            reward: () => {
                GameState.gainGachaResult('power_up_1');
            }
        },
        {
            id: 'equip_skill',
            text: 'スキルを装備しよう',
            rewardText: '報酬: 50G + 次のミッションへ',
            check: (type) => type === 'equip_skill',
            reward: () => { }
        },
        {
            id: 'catch_3',
            text: '魚を3匹釣ろう',
            rewardText: '最終報酬: 50G + ガチャチケット5枚',
            check: (type) => type === 'catch_success',
            requiredCount: 3,
            reward: () => {
                GameState.gachaTickets += 5;
                UIManager.updateStatus();
            }
        }
    ],

    // ========================================
    // 動的ミッションテンプレート
    // ========================================
    DYNAMIC_TEMPLATES: {
        A: [
            { id: 'fish_count', textFn: (t) => `魚を${t}匹釣る`, minTarget: 5, maxTarget: 10, baseReward: 500 },
            // --- 多様化ミッション (A: 手軽な行動系) ---
            { id: 'sell_count', textFn: (t) => `魚を${t}匹売る`, minTarget: 8, maxTarget: 20, baseReward: 500,
              onEvent: (type, d) => (type === 'sell_fish' ? (d.count || 0) : 0) },
            { id: 'new_fish', textFn: (t) => `図鑑に新しい魚を${t}種登録する`, minTarget: 1, maxTarget: 3, baseReward: 900, expMult: 3,
              onEvent: (type) => (type === 'new_fish' ? 1 : 0) },
            { id: 'buy_bait_count', textFn: (t) => `餌を${t}個購入する`, minTarget: 10, maxTarget: 30, baseReward: 500,
              onEvent: (type, d) => (type === 'buy_bait' ? (d.count || 0) : 0) },
            { id: 'gacha_draw', textFn: (t) => `ガチャを${t}回引く`, minTarget: 1, maxTarget: 3, baseReward: 700, expMult: 3,
              onEvent: (type, d) => (type === 'gacha_draw' ? (d.count || 0) : 0) },
            { id: 'equip_skill_dyn', textFn: (t) => `スキルを${t}回装備する`, minTarget: 1, maxTarget: 3, baseReward: 500, expMult: 2,
              onEvent: (type) => (type === 'equip_skill' ? 1 : 0) }
        ],
        B: [
            { id: 'rank_fish', textFn: (t, p) => `${p}ランクの魚を${t}匹釣る`, minTarget: 5, maxTarget: 10, baseReward: 800, rankList: ['D', 'C', 'B', 'A', 'S'] },
            { id: 'freq_common', textFn: (t) => `たくさん釣れる魚を${t}匹釣る`, minTarget: 5, maxTarget: 10, baseReward: 600, freq: 'たくさん釣れる' },
            { id: 'freq_uncommon', textFn: (t) => `あまり釣れない魚を${t}匹釣る`, minTarget: 2, maxTarget: 5, baseReward: 1000, freq: 'あまり釣れない' },
            { id: 'freq_rare', textFn: (t) => `なかなか釣れない魚を${t}匹釣る`, minTarget: 1, maxTarget: 3, baseReward: 1500, freq: 'なかなか釣れない' },
            // --- 多様化ミッション (B: 魚・釣り方指定系) ---
            { id: 'title_fish', textFn: (t) => `ヌシ（称号付きの魚）を${t}匹釣る`, minTarget: 1, maxTarget: 1, baseReward: 2000, expMult: 20, ticketMult: 3,
              onEvent: (type, d) => (type === 'catch_success' && d.hasTitle ? 1 : 0) },
            { id: 'rank_min', textFn: (t, p) => `${p}ランク以上の魚を${t}匹釣る`, minTarget: 2, maxTarget: 5, baseReward: 1000, rankList: ['C', 'B', 'A'],
              onEvent: (type, d, m) => (type === 'catch_success' && MissionManager.rankIndex(d.rarity) >= MissionManager.rankIndex(m.param) ? 1 : 0) },
            { id: 'specific_fish', textFn: (t, p, label) => `「${label}」を${t}匹釣る`, minTarget: 2, maxTarget: 4, baseReward: 900, expMult: 2,
              makeParam: () => MissionManager.pickSpecificFish(),
              onEvent: (type, d, m) => (type === 'catch_success' && d.fishId === m.param ? 1 : 0) },
            { id: 'battle_win', textFn: (t) => `ゲージバトルで${t}匹釣り上げる`, minTarget: 2, maxTarget: 5, baseReward: 900, expMult: 2,
              onEvent: (type, d) => (type === 'catch_success' && d.battle ? 1 : 0) },
            { id: 'multi_catch', textFn: (t) => `ダブルキャッチ（2匹以上同時）を${t}回出す`, minTarget: 1, maxTarget: 2, baseReward: 1500, expMult: 8, ticketMult: 2,
              isAvailable: () => (GameState.getMultiCatch2Chance() + GameState.getMultiCatch3Chance()) > 0 ||
                  GameState.getEffectsByType('master_angler_special').length > 0,
              onEvent: (type, d) => (type === 'catch_success' && (d.catchCount || 1) >= 2 ? 1 : 0) }
        ],
        C: [
            { id: 'fever', textFn: () => 'フィーバーに入る', minTarget: 1, maxTarget: 1, baseReward: 1000 },
            { id: 'treasure', textFn: (t) => `宝箱を${t}回釣る`, minTarget: 1, maxTarget: 1, baseReward: 800 },
            { id: 'earn_money', textFn: (t) => `${t.toLocaleString()}コイン手に入れる`, minTarget: 500, maxTarget: 10000, baseReward: 500, valueOptions: [500, 1000, 2000, 5000, 10000] },
            { id: 'red_gauge', textFn: (t) => `赤ゲージで${t}回止める`, minTarget: 3, maxTarget: 5, baseReward: 700 },
            { id: 'use_bait', textFn: (t, p) => `${p}ランクの餌を${t}個使用する`, minTarget: 5, maxTarget: 10, baseReward: 600, rankList: ['D', 'C', 'B', 'A', 'S'] },
            { id: 'complete_missions', textFn: (t) => `ミッションを${t}個達成する`, minTarget: 3, maxTarget: 5, baseReward: 1200 },
            // --- 多様化ミッション (C: 腕前・経済・施設利用系) ---
            { id: 'perfect_catch', textFn: (t) => `赤ゲージ(Perfect)で止めて${t}匹釣り上げる`, minTarget: 2, maxTarget: 4, baseReward: 1200, expMult: 4, ticketMult: 2,
              onEvent: (type, d) => (type === 'catch_success' && d.zone === 'red' ? 1 : 0) },
            { id: 'streak_catch', textFn: (t) => `失敗せずに${t}匹連続で釣り上げる`, minTarget: 4, maxTarget: 8, baseReward: 1200, expMult: 2, ticketMult: 2,
              resetOn: ['catch_failed', 'early_click', 'hit_missed'],
              onEvent: (type) => (type === 'catch_success' ? 1 : 0) },
            { id: 'no_early', textFn: (t) => `早合わせ（フライング）せずに${t}匹連続で釣る`, minTarget: 6, maxTarget: 12, baseReward: 1000, expMult: 1.5,
              resetOn: ['early_click'],
              onEvent: (type) => (type === 'catch_success' ? 1 : 0) },
            { id: 'quick_catch', textFn: (t) => `ウキが沈んで0.5秒以内に合わせて${t}匹釣り上げる`, minTarget: 2, maxTarget: 5, baseReward: 1100, expMult: 3, ticketMult: 2,
              onEvent: (type, d) => (type === 'catch_success' && typeof d.reactionMs === 'number' && d.reactionMs <= 500 ? 1 : 0) },
            { id: 'big_sale', textFn: (t) => `一度の売却で${t.toLocaleString()}G以上売る`, minTarget: 300, maxTarget: 3000, baseReward: 900, valueOptions: [300, 600, 1000, 2000, 3000], expMult: 0.2, mode: 'max',
              onEvent: (type, d) => (type === 'sell_fish' ? (d.amount || 0) : 0) },
            { id: 'sell_money', textFn: (t) => `魚を売って合計${t.toLocaleString()}G稼ぐ`, minTarget: 500, maxTarget: 5000, baseReward: 700, valueOptions: [500, 1000, 2000, 3000, 5000], expMult: 0.1,
              onEvent: (type, d) => (type === 'sell_fish' ? (d.amount || 0) : 0) },
            { id: 'upgrade_rod', textFn: (t) => `釣り竿を${t}回強化する`, minTarget: 1, maxTarget: 2, baseReward: 1000, expMult: 5, ticketMult: 2,
              isAvailable: () => GameState.rodStars < 5,
              onEvent: (type) => (type === 'rod_upgrade' ? 1 : 0) },
            { id: 'casino_win', textFn: (t) => `カジノ（チンチロ）で${t}回勝つ`, minTarget: 1, maxTarget: 3, baseReward: 900, expMult: 3,
              onEvent: (type, d) => (type === 'casino_play' && d.won ? 1 : 0) },
            { id: 'port_collect', textFn: (t) => `港の漁船から水揚げを${t}回受け取る`, minTarget: 1, maxTarget: 2, baseReward: 900, expMult: 4,
              isAvailable: () => !!(GameState.port && GameState.port.ownedShipId),
              onEvent: (type) => (type === 'port_collect' ? 1 : 0) },
            { id: 'synthesize', textFn: (t) => `スキル合成を${t}回成功させる`, minTarget: 1, maxTarget: 1, baseReward: 1000, expMult: 10, ticketMult: 2,
              onEvent: (type) => (type === 'synthesis' ? 1 : 0) },
            { id: 'recycle', textFn: (t) => `エコ・ボックスでリサイクルを${t}回行う`, minTarget: 1, maxTarget: 1, baseReward: 800, expMult: 10,
              onEvent: (type) => (type === 'recycle' ? 1 : 0) }
        ]
    },

    // ========================================
    // 多様化ミッション用ヘルパー
    // ========================================
    rankIndex(r) {
        return ['D', 'C', 'B', 'A', 'S', 'SS', 'GOD'].indexOf(r);
    },

    // 「特定の魚を釣る」ミッションの対象を選ぶ（図鑑登録済み＝出会える魚を優先）
    pickSpecificFish() {
        const all = (GAME_DATA && GAME_DATA.FISH) ? GAME_DATA.FISH : [];
        const seen = all.filter(f => GameState.encyclopedia && GameState.encyclopedia[f.id] && f.rarity !== 'SS');
        // 簡単に出会えない魚は避ける（A以上は除外。除外後が空なら図鑑登録済み全体、それも空ならDランク）
        let pool = seen.filter(f => this.rankIndex(f.rarity) <= 2);
        if (pool.length === 0) pool = seen;
        if (pool.length === 0) pool = all.filter(f => f.rarity === 'D');
        if (pool.length === 0) return { param: null, label: '魚' };
        const f = pool[Math.floor(Math.random() * pool.length)];
        return { param: f.id, label: f.name };
    },

    // ========================================
    // アクティブな初心者ミッションを取得
    // ========================================
    getActiveBeginnerMissions() {
        const completed = GameState.beginnerMissionCompleted || [];
        // まだ完了していないミッションを抽出
        const incomplete = this.MISSIONS.filter(m => !completed.includes(m.id));
        // 最大3つまで返す
        return incomplete.slice(0, 3);
    },

    // ========================================
    // 初心者ミッションの進捗確認
    // ========================================
    checkMission(type, data = {}) {
        // アクティブなミッションがあるか確認
        const activeMissions = this.getActiveBeginnerMissions();

        if (activeMissions.length > 0) {
            let progressUpdated = false;

            activeMissions.forEach(mission => {
                if (mission.check(type, data)) {
                    // ミッション条件に合致
                    if (mission.requiredCount) {
                        // カウントが必要な場合
                        const current = GameState.beginnerMissionProgress[mission.id] || 0;
                        const next = current + 1;
                        GameState.beginnerMissionProgress[mission.id] = next;
                        progressUpdated = true;

                        if (next >= mission.requiredCount) {
                            this.completeMission(mission.id);
                        }
                    } else {
                        // 即完了の場合
                        this.completeMission(mission.id);
                    }
                }
            });

            if (progressUpdated) {
                UIManager.updateMissionUI();
                SaveManager.save(GameState);
            }
            // 動的ミッションと併行する可能性も考慮し、returnしない
        }

        // 動的ミッションの判定（初心者ミッション終了後）
        if (this.isDynamicMissionActive()) {
            this.checkDynamicMission(type, data);
        }
    },

    // 初心者ミッション達成処理
    completeMission(missionId) {
        const mission = this.MISSIONS.find(m => m.id === missionId);
        if (!mission) return;

        // 完了済みに追加
        if (!GameState.beginnerMissionCompleted.includes(missionId)) {
            GameState.beginnerMissionCompleted.push(missionId);
        }

        const rewards = [
            { icon: '💰', name: '50G' }
        ];

        // 共通報酬: 50G + 50XP
        GameState.addMoney(50);
        GameState.addExp(50);

        // ミッションごとの追加報酬を確認
        if (mission.rewardText.includes('スキル')) {
            rewards.push({ icon: '✨', name: 'スキル獲得' });
        } else if (mission.rewardText.includes('チケット')) {
            rewards.push({ icon: '🎫', name: 'ガチャチケット' });
        }

        mission.reward();

        // 以前のトースト表示を削除し、ポップアップを表示
        UIManager.showRewardPopup('ミッションクリア！', rewards, mission.text);
        // UIManager.showMessage(`ミッション達成！ ${mission.text} (+50G, +50XP)`);

        // ミッション進捗データのクリーンアップ（完了したので不要）
        delete GameState.beginnerMissionProgress[missionId];

        // 初心者ミッション全達成時、動的ミッションを初期化
        if (GameState.beginnerMissionCompleted.length >= this.MISSIONS.length) {
            // 念のため currentMissionIndex も最大にしておく（互換性やフラグとして）
            GameState.currentMissionIndex = this.MISSIONS.length;
            this.initDynamicMissions();
        }

        UIManager.updateMissionUI();
        SaveManager.save(GameState);
    },

    // 現在のミッションテキストリストを取得
    getCurrentMissionTexts() {
        const activeMissions = this.getActiveBeginnerMissions();

        if (activeMissions.length === 0) {
            return null; // 初心者ミッション完了
        }

        return activeMissions.map(mission => {
            let text = mission.text;
            if (mission.requiredCount) {
                const current = GameState.beginnerMissionProgress[mission.id] || 0;
                text += ` (${current}/${mission.requiredCount})`;
            }
            return text;
        });
    },

    // ========================================
    // 動的ミッションシステム
    // ========================================
    // ========================================
    // 動的ミッションシステム
    // ========================================
    isDynamicMissionActive() {
        // 全ての初心者ミッションが完了しているか
        const isBeginnerComplete = (GameState.beginnerMissionCompleted && GameState.beginnerMissionCompleted.length >= this.MISSIONS.length) || GameState.currentMissionIndex >= this.MISSIONS.length;

        return isBeginnerComplete && GameState.dynamicMissions !== null;
    },

    initDynamicMissions() {
        GameState.dynamicMissions = {
            A: this.generateMission('A'),
            B: this.generateMission('B'),
            C: this.generateMission('C')
        };
        UIManager.updateMissionUI();
        SaveManager.save(GameState);
    },

    generateMission(slot) {
        const allTemplates = this.DYNAMIC_TEMPLATES[slot];
        // 現在のプレイ状況で達成可能なテンプレートのみ抽選対象にする
        const templates = allTemplates.filter(t => !t.isAvailable || t.isAvailable());
        const pool = templates.length > 0 ? templates : allTemplates;
        const template = pool[Math.floor(Math.random() * pool.length)];

        let baseTarget;
        let param = null;
        let paramLabel = null;

        // 特定のテンプレート用のパラメータ生成
        if (template.valueOptions) {
            baseTarget = template.valueOptions[Math.floor(Math.random() * template.valueOptions.length)];
        } else if (template.makeParam) {
            const made = template.makeParam();
            param = made.param;
            paramLabel = made.label;
            baseTarget = Math.floor(Math.random() * (template.maxTarget - template.minTarget + 1)) + template.minTarget;
        } else if (template.rankList) {
            param = template.rankList[Math.floor(Math.random() * template.rankList.length)];
            baseTarget = Math.floor(Math.random() * (template.maxTarget - template.minTarget + 1)) + template.minTarget;
        } else {
            baseTarget = Math.floor(Math.random() * (template.maxTarget - template.minTarget + 1)) + template.minTarget;
        }

        // パワースケーリング（竿パワーに応じて目標と報酬を増加）
        const playerPower = GameState.getTotalPower();
        const powerScale = Math.max(1, 1 + (playerPower - 10) / 50); // 初期パワー10基準

        // スキル効果を適用
        const targetModifier = GameState.getMissionTargetModifier();
        const rewardModifier = GameState.getMissionRewardModifier();

        // 最終目標数（パワー + スキル）
        let finalTarget = Math.max(1, Math.round(baseTarget * powerScale * targetModifier));

        // コイン系ミッションはパワースケールを強めに
        if (template.id === 'earn_money') {
            finalTarget = Math.round(baseTarget * powerScale * 1.5 * targetModifier);
        }

        // 「一度の売却でNG」型は金額そのものが目標値なのでスケーリングはコイン系と同様に強めに
        if (template.mode === 'max' || template.id === 'sell_money') {
            finalTarget = Math.round(baseTarget * powerScale * 1.5 * targetModifier);
        }
        // 1回で達成する系は目標1を下回らないように
        if (template.maxTarget === 1) finalTarget = 1;

        const text = template.textFn(finalTarget, param, paramLabel);

        // 報酬計算（ランク依存）
        // 目標数はパワー依存(feasibility)、報酬はランク依存(User Request)
        const rankMultiplier = GameState.getRankRewardMultiplier();

        const isTicket = true;
        const baseRewardValue = template.baseReward * (finalTarget / template.minTarget);

        // コイン報酬には rankMultiplier を適用 (パワー倍率の代わりに)
        const scaledRewardValue = baseRewardValue * rankMultiplier * rewardModifier;

        const reward = isTicket
            ? { type: 'ticket', value: Math.max(1, Math.round(rewardModifier * (template.ticketMult || 1))) } // チケットはmodifier(+難易度倍率)
            : { type: 'money', value: Math.round(scaledRewardValue) };

        // 経験値報酬 (難易度/目標数に依存)
        const expReward = Math.floor(finalTarget * 10 * powerScale * (template.expMult || 1)); // 簡易計算

        return {
            templateId: template.id,
            text: text,
            target: finalTarget,
            current: 0,
            param: param,
            paramLabel: paramLabel,
            reward: reward,
            exp: expReward
        };
    },

    checkDynamicMission(type, data = {}) {
        const missions = GameState.dynamicMissions;
        if (!missions) return;

        ['A', 'B', 'C'].forEach(slot => {
            const mission = missions[slot];
            if (!mission) return;

            let progress = 0;

            const tpl = this.findTemplate(mission.templateId);

            // 連続系ミッション: 失敗イベントで進捗リセット
            if (tpl && tpl.resetOn && tpl.resetOn.includes(type)) {
                if (mission.current > 0) {
                    mission.current = 0;
                    UIManager.updateMissionUI();
                    SaveManager.save(GameState);
                }
                return;
            }

            if (tpl && tpl.onEvent) {
                // データ駆動型（多様化ミッション）
                progress = tpl.onEvent(type, data, mission) || 0;
                if (tpl.mode === 'max') {
                    // 「一度に○○」型: 最大値を記録し、目標以上なら即達成
                    if (progress > mission.current) {
                        mission.current = Math.min(progress, mission.target);
                        if (mission.current >= mission.target) {
                            this.completeDynamicMission(slot);
                        } else {
                            UIManager.updateMissionUI();
                            SaveManager.save(GameState);
                        }
                    }
                    return;
                }
            } else switch (mission.templateId) {
                case 'fish_count':
                    if (type === 'catch_success') progress = 1;
                    break;
                case 'rank_fish':
                    if (type === 'catch_success' && data.rarity === mission.param) progress = 1;
                    break;
                case 'freq_common':
                case 'freq_uncommon':
                case 'freq_rare':
                    if (type === 'catch_success' && data.frequency === this.DYNAMIC_TEMPLATES.B.find(t => t.id === mission.templateId)?.freq) progress = 1;
                    break;
                case 'fever':
                    if (type === 'fever_start') progress = 1;
                    break;
                case 'treasure':
                    if (type === 'treasure_caught') progress = 1;
                    break;
                case 'earn_money':
                    if (type === 'money_earned') progress = data.amount || 0;
                    break;
                case 'red_gauge':
                    if (type === 'red_gauge_stop') progress = 1;
                    break;
                case 'use_bait':
                    if (type === 'use_bait' && data.rank === mission.param) progress = 1;
                    break;
                case 'complete_missions':
                    if (type === 'mission_completed') progress = 1;
                    break;
            }

            if (progress > 0) {
                mission.current += progress;
                if (mission.current >= mission.target) {
                    this.completeDynamicMission(slot);
                } else {
                    UIManager.updateMissionUI();
                    SaveManager.save(GameState); // 進捗を保存
                }
            }
        });
    },

    findTemplate(id) {
        for (const slot of ['A', 'B', 'C']) {
            const t = this.DYNAMIC_TEMPLATES[slot].find(x => x.id === id);
            if (t) return t;
        }
        return null;
    },

    completeDynamicMission(slot) {
        const mission = GameState.dynamicMissions[slot];
        if (!mission) return;

        const rewards = [];
        let rewardText = '';

        // 報酬付与
        if (mission.reward.type === 'ticket') {
            GameState.gachaTickets += mission.reward.value;
            rewards.push({ name: `${mission.reward.value} Tickets` });
            rewardText = `${mission.reward.value} Tickets`;
        } else {
            const money = Math.floor(mission.reward.value);
            GameState.money += money;
            rewards.push({ name: `${money.toLocaleString()} G` });
            rewardText = `${money.toLocaleString()} G`;
        }

        // 経験値付与
        if (mission.exp) {
            GameState.addExp(mission.exp);
            rewards.push({ name: `${mission.exp} XP` });
        }

        // 達成カウント増加
        GameState.dynamicMissionCompletedCount++;

        // 「ミッションをN個達成する」のチェック
        this.checkDynamicMission('mission_completed', {});

        // 次のミッション生成
        GameState.dynamicMissions[slot] = this.generateMission(slot);

        UIManager.updateStatus();
        UIManager.updateMissionUI();
        SaveManager.save(GameState);

        // 通知表示
        UIManager.showRewardPopup('MISSION COMPLETE!', rewards, mission.text);
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.MissionManager = MissionManager;
}
