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
            text: 'ヘルプ（？）ボタンを押す',
            rewardText: '報酬: 次のミッションへ',
            check: (type) => type === 'help_click',
            reward: () => { }
        },
        {
            id: 'catch_1',
            text: '魚を1匹釣る',
            rewardText: '報酬: 次のミッションへ',
            check: (type) => type === 'catch_success',
            reward: () => { }
        },
        {
            id: 'go_town',
            text: '街へ行く',
            rewardText: '報酬: 次のミッションへ',
            check: (type) => type === 'go_town',
            reward: () => { }
        },
        {
            id: 'buy_bait',
            text: '餌を1つ買う',
            rewardText: '報酬: 次のミッションへ',
            check: (type) => type === 'buy_bait',
            reward: () => { }
        },
        {
            id: 'catch_with_bait',
            text: '餌を変更して魚を釣る',
            rewardText: '報酬: スキル「釣りパワー増加I」',
            check: (type, data) => type === 'catch_success' && data.baitId !== 'bait_d',
            reward: () => {
                GameState.gainGachaResult('power_up_1');
                UIManager.showMessage('ミッション達成！報酬: 釣りパワー増加I を獲得！');
            }
        },
        {
            id: 'equip_skill',
            text: 'スキルを装備する',
            rewardText: '報酬: 次のミッションへ',
            check: (type) => type === 'equip_skill',
            reward: () => { }
        },
        {
            id: 'catch_3',
            text: '魚を3匹釣る',
            rewardText: '最終報酬: ガチャチケット5枚',
            check: (type) => type === 'catch_success',
            requiredCount: 3,
            reward: () => {
                GameState.gachaTickets += 5;
                UIManager.updateStatus();
                UIManager.showMessage('初心者ミッション制覇！報酬: ガチャチケット5枚を獲得！');
            }
        }
    ],

    // ========================================
    // 動的ミッションテンプレート
    // ========================================
    DYNAMIC_TEMPLATES: {
        A: [
            { id: 'fish_count', textFn: (t) => `魚を${t}匹釣る`, minTarget: 10, maxTarget: 20, baseReward: 500 }
        ],
        B: [
            { id: 'rank_fish', textFn: (t, p) => `${p}ランクの魚を${t}匹釣る`, minTarget: 5, maxTarget: 10, baseReward: 800, rankList: ['D', 'C', 'B', 'A', 'S'] },
            { id: 'freq_common', textFn: (t) => `出現頻度「たくさん釣れる」の魚を${t}匹釣る`, minTarget: 5, maxTarget: 10, baseReward: 600, freq: 'たくさん釣れる' },
            { id: 'freq_uncommon', textFn: (t) => `出現頻度「あまり釣れない」の魚を${t}匹釣る`, minTarget: 2, maxTarget: 5, baseReward: 1000, freq: 'あまり釣れない' },
            { id: 'freq_rare', textFn: (t) => `出現頻度「なかなか釣れない」の魚を${t}匹釣る`, minTarget: 1, maxTarget: 3, baseReward: 1500, freq: 'なかなか釣れない' }
        ],
        C: [
            { id: 'fever', textFn: () => 'フィーバーに入る', minTarget: 1, maxTarget: 1, baseReward: 1000 },
            { id: 'treasure', textFn: (t) => `宝箱を${t}回釣る`, minTarget: 1, maxTarget: 1, baseReward: 800 },
            { id: 'earn_money', textFn: (t) => `${t.toLocaleString()}コイン手に入れる`, minTarget: 500, maxTarget: 10000, baseReward: 500, valueOptions: [500, 1000, 2000, 5000, 10000] },
            { id: 'red_gauge', textFn: (t) => `ゲージバトルで赤ゲージで${t}回止める`, minTarget: 3, maxTarget: 5, baseReward: 700 },
            { id: 'use_bait', textFn: (t, p) => `${p}ランクの餌を${t}個使用する`, minTarget: 5, maxTarget: 10, baseReward: 600, rankList: ['D', 'C', 'B', 'A', 'S'] },
            { id: 'complete_missions', textFn: (t) => `ミッションを${t}個達成する`, minTarget: 3, maxTarget: 5, baseReward: 1200 }
        ]
    },

    // ========================================
    // 初心者ミッションの進捗確認
    // ========================================
    checkMission(type, data = {}) {
        // 初心者ミッションがまだ残っている場合
        const index = GameState.currentMissionIndex;
        if (index < this.MISSIONS.length) {
            const mission = this.MISSIONS[index];

            if (mission.check(type, data)) {
                if (mission.requiredCount) {
                    GameState.missionProgress++;
                    UIManager.updateMissionUI();

                    if (GameState.missionProgress >= mission.requiredCount) {
                        this.completeMission();
                    }
                } else {
                    this.completeMission();
                }
            }
            return; // 初心者ミッション判定のみで終了
        }

        // 動的ミッションの判定
        if (this.isDynamicMissionActive()) {
            this.checkDynamicMission(type, data);
        }
    },

    // 初心者ミッション達成処理
    completeMission() {
        const index = GameState.currentMissionIndex;
        const mission = this.MISSIONS[index];

        mission.reward();

        GameState.currentMissionIndex++;
        GameState.missionProgress = 0;

        UIManager.updateMissionUI();

        if (index < this.MISSIONS.length - 1 && !mission.rewardText.includes('獲得')) {
            UIManager.showMessage(`ミッション達成！: ${mission.text}`);
        }

        // 初心者ミッション全達成時、動的ミッションを初期化
        if (GameState.currentMissionIndex >= this.MISSIONS.length) {
            this.initDynamicMissions();
        }

        SaveManager.save(GameState);
    },

    // 現在のミッションテキストを取得
    getCurrentMissionText() {
        const index = GameState.currentMissionIndex;
        if (index >= this.MISSIONS.length) {
            // 動的ミッションのテキストを返す
            return null; // 動的ミッションはUI側で別途処理
        }

        const mission = this.MISSIONS[index];
        let text = mission.text;

        if (mission.requiredCount) {
            text += ` (${GameState.missionProgress}/${mission.requiredCount})`;
        }

        return text;
    },

    // ========================================
    // 動的ミッションシステム
    // ========================================
    isDynamicMissionActive() {
        return GameState.currentMissionIndex >= this.MISSIONS.length && GameState.dynamicMissions !== null;
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
        const templates = this.DYNAMIC_TEMPLATES[slot];
        const template = templates[Math.floor(Math.random() * templates.length)];

        let baseTarget;
        let param = null;

        // 特定のテンプレート用のパラメータ生成
        if (template.valueOptions) {
            baseTarget = template.valueOptions[Math.floor(Math.random() * template.valueOptions.length)];
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

        const text = template.textFn(finalTarget, param);

        // 報酬計算（パワー + スキル）
        const isTicket = Math.random() < 0.2;
        const baseRewardValue = template.baseReward * (finalTarget / template.minTarget);
        const scaledRewardValue = baseRewardValue * powerScale * rewardModifier;

        const reward = isTicket
            ? { type: 'ticket', value: Math.max(1, Math.round(rewardModifier)) }
            : { type: 'money', value: Math.round(scaledRewardValue) };

        return {
            templateId: template.id,
            text: text,
            target: finalTarget,
            current: 0,
            param: param,
            reward: reward
        };
    },

    checkDynamicMission(type, data = {}) {
        const missions = GameState.dynamicMissions;
        if (!missions) return;

        ['A', 'B', 'C'].forEach(slot => {
            const mission = missions[slot];
            if (!mission) return;

            let progress = 0;

            switch (mission.templateId) {
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
                }
            }
        });
    },

    completeDynamicMission(slot) {
        const mission = GameState.dynamicMissions[slot];
        if (!mission) return;

        // 報酬付与
        if (mission.reward.type === 'ticket') {
            GameState.gachaTickets += mission.reward.value;
            UIManager.showMessage(`🎫 ミッション達成！チケット${mission.reward.value}枚獲得！`);
        } else {
            GameState.money += Math.floor(mission.reward.value);
            UIManager.showMessage(`💰 ミッション達成！${Math.floor(mission.reward.value).toLocaleString()}G獲得！`);
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
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.MissionManager = MissionManager;
}
