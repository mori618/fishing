
describe('# Gacha System Logic', () => {

    it('Should return true if player has enough tickets', () => {
        GameState.gachaTickets = 1;
        GameState.money = 0;
        const result = GameState.canDrawGacha(100, 1);
        expect(result.can).toBe(true);
        expect(result.method).toBe('ticket');
    });

    it('Should return true if player has enough money (no tickets)', () => {
        GameState.gachaTickets = 0;
        GameState.money = 100;
        const result = GameState.canDrawGacha(100, 1);
        expect(result.can).toBe(true);
        expect(result.method).toBe('money');
    });

    it('Should return false if player has neither', () => {
        GameState.gachaTickets = 0;
        GameState.money = 0;
        const result = GameState.canDrawGacha(100, 1);
        expect(result.can).toBe(false);
    });

    it('Should consume tickets first', () => {
        GameState.gachaTickets = 2;
        GameState.money = 1000;
        const method = GameState.consumeGachaResources(100, 1);
        expect(method).toBe('ticket');
        expect(GameState.gachaTickets).toBe(1);
        expect(GameState.money).toBe(1000);
    });

    it('Should consume money if no tickets', () => {
        GameState.gachaTickets = 0;
        GameState.money = 1000;
        const method = GameState.consumeGachaResources(100, 1);
        expect(method).toBe('money');
        expect(GameState.money).toBe(900);
    });
});


describe('# Mission System Logic', () => {
    // 初心者ミッションは beginnerMissionCompleted（完了ID配列）で状態管理されている。
    // 各テストの前提として完了済みIDを明示的にセットする。
    const isDone = (id) => GameState.beginnerMissionCompleted.includes(id);

    it('Should start with the first mission (help)', () => {
        GameState.beginnerMissionCompleted = [];
        const texts = MissionManager.getCurrentMissionTexts();
        expect(texts[0].includes('ヘルプ')).toBe(true);
    });

    it('Should complete "help" mission on help_click', () => {
        GameState.beginnerMissionCompleted = [];
        MissionManager.checkMission('help_click');
        expect(isDone('help')).toBe(true);
        expect(MissionManager.getCurrentMissionTexts()[0].includes('1匹釣ろう')).toBe(true);
    });

    it('Should complete "catch_1" mission on catch_success', () => {
        GameState.beginnerMissionCompleted = ['help'];
        MissionManager.checkMission('catch_success');
        expect(isDone('catch_1')).toBe(true);
        expect(MissionManager.getCurrentMissionTexts()[0].includes('街へ行こう')).toBe(true);
    });

    it('Should complete "go_town" mission on go_town', () => {
        GameState.beginnerMissionCompleted = ['help', 'catch_1'];
        MissionManager.checkMission('go_town');
        expect(isDone('go_town')).toBe(true);
    });

    it('Should complete "buy_bait" mission on buy_bait', () => {
        GameState.beginnerMissionCompleted = ['help', 'catch_1', 'go_town', 'sell_fish'];
        MissionManager.checkMission('buy_bait');
        expect(isDone('buy_bait')).toBe(true);
    });

    it('Should NOT complete "catch_with_bait" if bait is D-rank', () => {
        GameState.beginnerMissionCompleted = ['help', 'catch_1', 'go_town', 'sell_fish', 'buy_bait'];
        MissionManager.checkMission('catch_success', { baitId: 'bait_d' });
        expect(isDone('catch_with_bait')).toBe(false);
    });

    it('Should complete "catch_with_bait" if bait is NOT D-rank', () => {
        GameState.beginnerMissionCompleted = ['help', 'catch_1', 'go_town', 'sell_fish', 'buy_bait'];

        // Mock UIManager.showMessage to avoid error
        const originalShowMessage = UIManager.showMessage;
        UIManager.showMessage = () => { };

        MissionManager.checkMission('catch_success', { baitId: 'bait_c' });

        expect(isDone('catch_with_bait')).toBe(true);
        expect(GameState.getSkillCount('power_up_1') > 0).toBe(true);

        UIManager.showMessage = originalShowMessage; // Restore
    });

    it('Should track progress for "catch_3" mission', () => {
        // catch_3 以外の初心者ミッションを完了済みにして、catch_3 を唯一のアクティブにする
        GameState.beginnerMissionCompleted = MissionManager.MISSIONS
            .map(m => m.id).filter(id => id !== 'catch_3');
        GameState.beginnerMissionProgress = {};

        // Mock UIManager.showMessage to avoid error
        const originalShowMessage = UIManager.showMessage;
        UIManager.showMessage = () => { };

        MissionManager.checkMission('catch_success');
        expect(GameState.beginnerMissionProgress['catch_3']).toBe(1);
        expect(GameState.beginnerMissionCompleted.includes('catch_3')).toBe(false);

        MissionManager.checkMission('catch_success');
        expect(GameState.beginnerMissionProgress['catch_3']).toBe(2);

        // Mock GameState.gachaTickets to check reward
        const initialTickets = GameState.gachaTickets;

        MissionManager.checkMission('catch_success');
        expect(GameState.beginnerMissionCompleted.includes('catch_3')).toBe(true); // Completed
        expect(GameState.gachaTickets).toBe(initialTickets + 5);

        UIManager.showMessage = originalShowMessage;
    });

});
