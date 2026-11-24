// 多様化ミッション (動的ミッション) のテスト
describe('# Diverse Dynamic Missions', () => {
    const NEW_IDS = {
        A: ['sell_count', 'new_fish', 'buy_bait_count', 'gacha_draw', 'equip_skill_dyn'],
        B: ['title_fish', 'rank_min', 'specific_fish', 'battle_win', 'multi_catch'],
        C: ['perfect_catch', 'streak_catch', 'no_early', 'quick_catch', 'big_sale', 'sell_money',
            'upgrade_rod', 'casino_win', 'port_collect', 'synthesize', 'recycle']
    };

    // UIの副作用を無効化し、1スロットだけに特定ミッションをセットして実行するヘルパー
    const origPopup = UIManager.showRewardPopup;
    const origMissionUI = UIManager.updateMissionUI;
    const setup = () => {
        UIManager.showRewardPopup = () => { };
        UIManager.updateMissionUI = () => { };
        GameState.beginnerMissionCompleted = MissionManager.MISSIONS.map(m => m.id);
        GameState.currentMissionIndex = MissionManager.MISSIONS.length;
    };
    const restore = () => {
        UIManager.showRewardPopup = origPopup;
        UIManager.updateMissionUI = origMissionUI;
    };
    const place = (slot, templateId, target, param = null) => {
        const m = {
            templateId, text: 'test', target, current: 0, param, paramLabel: null,
            reward: { type: 'ticket', value: 1 }, exp: 0
        };
        // 他スロットは絶対に進まないダミーにしておく
        GameState.dynamicMissions = {
            A: { templateId: '__none', text: '', target: 999, current: 0, reward: { type: 'ticket', value: 1 }, exp: 0 },
            B: { templateId: '__none', text: '', target: 999, current: 0, reward: { type: 'ticket', value: 1 }, exp: 0 },
            C: { templateId: '__none', text: '', target: 999, current: 0, reward: { type: 'ticket', value: 1 }, exp: 0 }
        };
        GameState.dynamicMissions[slot] = m;
        return m;
    };
    // ミッションを達成した(= スロットが新規生成に置き換わった)かどうか
    const isCompleted = (slot, m) => GameState.dynamicMissions[slot] !== m;

    it('Should have 15+ new mission templates', () => {
        const total = NEW_IDS.A.length + NEW_IDS.B.length + NEW_IDS.C.length;
        expect(total >= 15).toBe(true);
        ['A', 'B', 'C'].forEach(slot => {
            NEW_IDS[slot].forEach(id => {
                const t = MissionManager.DYNAMIC_TEMPLATES[slot].find(x => x.id === id);
                expect(!!t).toBe(true);
            });
        });
    });

    it('Should generate every template with valid text/target/reward', () => {
        setup();
        GameState.encyclopedia = { fish_d1: { count: 1 } };
        ['A', 'B', 'C'].forEach(slot => {
            MissionManager.DYNAMIC_TEMPLATES[slot].forEach(tpl => {
                // 強制的にそのテンプレートだけを抽選対象にする
                const saved = MissionManager.DYNAMIC_TEMPLATES[slot];
                MissionManager.DYNAMIC_TEMPLATES[slot] = [{ ...tpl, isAvailable: undefined }];
                const m = MissionManager.generateMission(slot);
                MissionManager.DYNAMIC_TEMPLATES[slot] = saved;
                expect(m.templateId).toBe(tpl.id);
                expect(m.target >= 1).toBe(true);
                expect(typeof m.text).toBe('string');
                expect(m.text.includes('undefined')).toBe(false);
                expect(m.text.includes('NaN')).toBe(false);
                expect(m.reward.value >= 1).toBe(true);
            });
        });
        restore();
    });

    it('title_fish: only counts fish with a title', () => {
        setup();
        const m = place('B', 'title_fish', 1);
        MissionManager.checkMission('catch_success', { hasTitle: false });
        expect(m.current).toBe(0);
        MissionManager.checkMission('catch_success', { hasTitle: true });
        expect(isCompleted('B', m)).toBe(true);
        restore();
    });

    it('rank_min: counts that rank or higher only', () => {
        setup();
        const m = place('B', 'rank_min', 3, 'B');
        MissionManager.checkMission('catch_success', { rarity: 'C' });
        expect(m.current).toBe(0);
        MissionManager.checkMission('catch_success', { rarity: 'B' });
        MissionManager.checkMission('catch_success', { rarity: 'S' });
        expect(m.current).toBe(2);
        restore();
    });

    it('specific_fish: only counts the targeted fish id', () => {
        setup();
        const m = place('B', 'specific_fish', 2, 'fish_d1');
        MissionManager.checkMission('catch_success', { fishId: 'fish_d2' });
        expect(m.current).toBe(0);
        MissionManager.checkMission('catch_success', { fishId: 'fish_d1' });
        expect(m.current).toBe(1);
        restore();
    });

    it('battle_win / perfect_catch / quick_catch / multi_catch use catch data', () => {
        setup();
        let m = place('B', 'battle_win', 2);
        MissionManager.checkMission('catch_success', { battle: false });
        expect(m.current).toBe(0);
        MissionManager.checkMission('catch_success', { battle: true });
        expect(m.current).toBe(1);

        m = place('C', 'perfect_catch', 2);
        MissionManager.checkMission('catch_success', { zone: 'green' });
        expect(m.current).toBe(0);
        MissionManager.checkMission('catch_success', { zone: 'red' });
        expect(m.current).toBe(1);

        m = place('C', 'quick_catch', 2);
        MissionManager.checkMission('catch_success', { reactionMs: 900 });
        MissionManager.checkMission('catch_success', { reactionMs: null });
        expect(m.current).toBe(0);
        MissionManager.checkMission('catch_success', { reactionMs: 300 });
        expect(m.current).toBe(1);

        m = place('B', 'multi_catch', 2);
        MissionManager.checkMission('catch_success', { catchCount: 1 });
        expect(m.current).toBe(0);
        MissionManager.checkMission('catch_success', { catchCount: 2 });
        expect(m.current).toBe(1);
        restore();
    });

    it('streak_catch resets on failure, no_early only on early click', () => {
        setup();
        let m = place('C', 'streak_catch', 4);
        MissionManager.checkMission('catch_success', {});
        MissionManager.checkMission('catch_success', {});
        expect(m.current).toBe(2);
        MissionManager.checkMission('catch_failed');
        expect(m.current).toBe(0);
        MissionManager.checkMission('catch_success', {});
        MissionManager.checkMission('hit_missed');
        expect(m.current).toBe(0);

        m = place('C', 'no_early', 3);
        MissionManager.checkMission('catch_success', {});
        MissionManager.checkMission('catch_failed'); // 失敗してもフライングでなければ継続
        MissionManager.checkMission('catch_success', {});
        expect(m.current).toBe(2);
        MissionManager.checkMission('early_click');
        expect(m.current).toBe(0);
        restore();
    });

    it('sell missions: count / total / single-sale max', () => {
        setup();
        let m = place('A', 'sell_count', 10);
        MissionManager.checkMission('sell_fish', { count: 4, amount: 100 });
        MissionManager.checkMission('sell_fish', { count: 3, amount: 100 });
        expect(m.current).toBe(7);

        m = place('C', 'sell_money', 1000);
        MissionManager.checkMission('sell_fish', { count: 4, amount: 400 });
        MissionManager.checkMission('sell_fish', { count: 4, amount: 300 });
        expect(m.current).toBe(700);

        m = place('C', 'big_sale', 1000);
        MissionManager.checkMission('sell_fish', { count: 4, amount: 600 });
        MissionManager.checkMission('sell_fish', { count: 4, amount: 600 }); // 累計では達成しない
        expect(isCompleted('C', m)).toBe(false);
        expect(m.current).toBe(600);
        MissionManager.checkMission('sell_fish', { count: 9, amount: 1200 });
        expect(isCompleted('C', m)).toBe(true);
        restore();
    });

    it('Real GameState actions fire missions (sell / new fish / rod upgrade)', () => {
        setup();
        // 実際の売却
        GameState.inventory = [
            { id: 'a', name: 'a', price: 400, power: 1, rarity: 'D' },
            { id: 'b', name: 'b', price: 400, power: 1, rarity: 'D' }
        ];
        let m = place('A', 'sell_count', 5);
        GameState.sellAllFish();
        expect(m.current).toBe(2);

        // 新種登録
        GameState.encyclopedia = {};
        m = place('A', 'new_fish', 2);
        const fish = GAME_DATA.FISH[0];
        GameState.addFish(fish);
        GameState.addFish(fish); // 同種は数えない
        expect(m.current).toBe(1);

        // 竿強化
        GameState.rodRankIndex = 0;
        GameState.rodStars = 0;
        GameState.money = 10000000;
        m = place('C', 'upgrade_rod', 2);
        GameState.upgradeRod();
        expect(m.current).toBe(1);
        restore();
    });

    it('buy_bait_count / gacha_draw / equip_skill_dyn / facility missions', () => {
        setup();
        let m = place('A', 'buy_bait_count', 20);
        MissionManager.checkMission('buy_bait', { count: 10 });
        expect(m.current).toBe(10);
        m = place('A', 'gacha_draw', 3);
        MissionManager.checkMission('gacha_draw', { count: 2 });
        expect(m.current).toBe(2);
        m = place('A', 'equip_skill_dyn', 2);
        MissionManager.checkMission('equip_skill');
        expect(m.current).toBe(1);
        m = place('C', 'casino_win', 2);
        MissionManager.checkMission('casino_play', { won: false });
        expect(m.current).toBe(0);
        MissionManager.checkMission('casino_play', { won: true });
        expect(m.current).toBe(1);
        m = place('C', 'port_collect', 1);
        MissionManager.checkMission('port_collect', { amount: 100 });
        expect(isCompleted('C', m)).toBe(true);
        m = place('C', 'synthesize', 1);
        MissionManager.checkMission('synthesis', {});
        expect(isCompleted('C', m)).toBe(true);
        m = place('C', 'recycle', 1);
        MissionManager.checkMission('recycle', {});
        expect(isCompleted('C', m)).toBe(true);
        restore();
    });

    it('Existing missions still work (fish_count / rank_fish)', () => {
        setup();
        let m = place('A', 'fish_count', 2);
        MissionManager.checkMission('catch_success', {});
        expect(m.current).toBe(1);
        m = place('B', 'rank_fish', 2, 'C');
        MissionManager.checkMission('catch_success', { rarity: 'C' });
        expect(m.current).toBe(1);
        restore();
    });
});
