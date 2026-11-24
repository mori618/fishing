// 新スキル系統 (遊びスキル) のテスト
describe('# Fun Skill Families', () => {
    const FAMILIES = ['bonus_fish', 'combo_boost', 'time_angler', 'thrill_gauge', 'omen', 'sell_roulette', 'flow_state', 'revenge'];
    const reset = () => {
        GameState.equippedSkills = [];
        GameState.comboCount = 0;
        GameState.flowStacks = 0;
        GameState.revengeStacks = 0;
        GameState._debugHour = null;
        GameState.rodRankIndex = 0;
        GameState.rodStars = 0;
    };
    const near = (a, b) => Math.abs(a - b) < 1e-9;

    it('Should define 8 families x 4 tiers with required fields', () => {
        FAMILIES.forEach(base => {
            for (let t = 1; t <= 4; t++) {
                const s = GAME_DATA.SKILLS.find(x => x.id === `${base}_${t}`);
                expect(!!s).toBe(true);
                expect(s.tier).toBe(t);
                expect(!!s.group).toBe(true);
                expect(!!s.icon).toBe(true);
                expect(s.effect.type).toBe(base === 'combo_boost' ? 'combo_boost' : base);
                if (t === 4) expect(s.name.endsWith('極')).toBe(true);
            }
        });
    });

    it('bonus_fish: gives a different fish of equal or lower rank', () => {
        reset();
        const fish = GAME_DATA.FISH.find(f => f.rarity === 'B');
        expect(GameState.rollBonusFish(fish)).toBe(null); // 未装備
        GameState.equippedSkills = ['bonus_fish_4']; // 40%
        expect(GameState.rollBonusFish(fish, () => 0.99)).toBe(null);
        for (let i = 0; i < 30; i++) {
            const bonus = GameState.rollBonusFish(fish, (() => { let n = 0; return () => (n++ === 0 ? 0.1 : Math.random()); })());
            expect(!!bonus).toBe(true);
            expect(bonus.id === fish.id).toBe(false);
            expect(GameState._rankIdx(bonus.rarity) <= GameState._rankIdx('B')).toBe(true);
        }
        expect(GameState.rollBonusFish({ ...fish, isTreasure: true }, () => 0)).toBe(null);
    });

    it('combo_boost: stacks with consecutive catches, resets on failure, caps at max', () => {
        reset();
        GameState.equippedSkills = ['combo_boost_1']; // +1%/回, 最大10
        const base = GameState.getPriceBonus();
        for (let i = 0; i < 5; i++) GameState.registerCatchResult(true);
        expect(near(GameState.getComboSellBonus(), 0.05)).toBe(true);
        expect(near(GameState.getPriceBonus() - base, 0.05) || GameState.getPriceBonus() > base).toBe(true);
        for (let i = 0; i < 20; i++) GameState.registerCatchResult(true);
        expect(near(GameState.getComboSellBonus(), 0.10)).toBe(true); // 上限
        GameState.registerCatchResult(false);
        expect(GameState.getComboSellBonus()).toBe(0);
    });

    it('time_angler: effect depends on time of day', () => {
        reset();
        const w0 = GameState.getWaitTimeReduction();
        const p0 = GameState.getPriceBonus();
        const r0 = GameState.getRareBonus();
        const t0 = GameState.getTitleChanceMultiplier();
        GameState.equippedSkills = ['time_angler_2']; // 0.2

        GameState._debugHour = 7; // 朝
        expect(GameState.getTimeBand()).toBe('morning');
        expect(near(GameState.getWaitTimeReduction() - w0, 0.2)).toBe(true);
        expect(near(GameState.getPriceBonus(), p0)).toBe(true);

        GameState._debugHour = 12; // 昼
        expect(GameState.getTimeBand()).toBe('day');
        expect(near(GameState.getWaitTimeReduction(), w0)).toBe(true);
        expect(GameState.getPriceBonus() > p0).toBe(true);

        GameState._debugHour = 18; // 夕
        expect(GameState.getTimeBand()).toBe('evening');
        expect(near(GameState.getRareBonus() - r0, 0.2)).toBe(true);

        GameState._debugHour = 23; // 夜
        expect(GameState.getTimeBand()).toBe('night');
        expect(near(GameState.getTitleChanceMultiplier() - t0, 0.6)).toBe(true);
        GameState._debugHour = 3;
        expect(GameState.getTimeBand()).toBe('night');
        GameState._debugHour = null;
    });

    it('thrill_gauge: faster gauge but wider red zone in actual gauge battle', () => {
        reset();
        let captured = null;
        const origShow = UIManager.showGaugeBattle;
        const origRaf = globalThis.requestAnimationFrame;
        UIManager.showGaugeBattle = (fish, red) => { captured = red; };
        globalThis.requestAnimationFrame = () => 0;
        const run = () => {
            FishingGame.currentFish = { id: 'x', name: 'x', rarity: 'B', power: 100 };
            FishingGame.startGaugeBattle(50, 100);
            return { speed: FishingGame.gaugeSpeed, red: captured };
        };
        const base = run();
        GameState.equippedSkills = ['thrill_gauge_2']; // 速度+30% / 赤+50%
        const thrill = run();
        expect(near(thrill.speed / base.speed, 1.3)).toBe(true);
        expect(thrill.red > base.red).toBe(true);
        UIManager.showGaugeBattle = origShow;
        globalThis.requestAnimationFrame = origRaf;
    });

    it('omen: announces rare fish and extends hit window', () => {
        reset();
        const rareFish = { id: 'r', rarity: 'A', hasTitle: false };
        expect(GameState.getOmenInfo(rareFish)).toBe(null); // 未装備
        GameState.equippedSkills = ['omen_1'];
        expect(GameState.getOmenInfo({ id: 'd', rarity: 'D' })).toBe(null);
        const o1 = GameState.getOmenInfo(rareFish);
        expect(near(o1.hitWindowBonus, 0.1)).toBe(true);
        expect(o1.message.includes('A')).toBe(false); // I はランク非表示
        GameState.equippedSkills = ['omen_3'];
        const o3 = GameState.getOmenInfo(rareFish);
        expect(o3.message.includes('Aランク')).toBe(true);
        expect(GameState.getOmenInfo({ id: 'c', rarity: 'C' }) !== null).toBe(true); // III は C 以上
        GameState.equippedSkills = ['omen_4'];
        const o4 = GameState.getOmenInfo({ id: 'd', rarity: 'D', hasTitle: true });
        expect(o4.message.includes('ヌシ')).toBe(true);
    });

    it('sell_roulette: multiplier applied to the sale', () => {
        reset();
        GameState.equippedSkills = ['sell_roulette_1']; // [0.7,x1] [0.25,x1.5] [0.05,x3]
        expect(GameState.spinSellRoulette(() => 0.1).mult).toBe(1);
        expect(GameState.spinSellRoulette(() => 0.8).mult).toBe(1.5);
        expect(GameState.spinSellRoulette(() => 0.99).mult).toBe(3);

        const origRandom = Math.random;
        Math.random = () => 0.99; // x3 を引く
        GameState.inventory = [{ id: 'a', name: 'a', price: 100, power: 1, rarity: 'D' }];
        GameState.money = 0;
        const earned = GameState.sellAllFish();
        Math.random = origRandom;
        expect(earned).toBe(300);
        expect(GameState.lastSellRoulette.mult).toBe(3);

        // 未装備なら倍率なし
        GameState.equippedSkills = [];
        GameState.inventory = [{ id: 'a', name: 'a', price: 100, power: 1, rarity: 'D' }];
        expect(GameState.sellAllFish()).toBe(100);
        expect(GameState.lastSellRoulette).toBe(null);
    });

    it('flow_state: red-zone streak raises power; non-red resets', () => {
        reset();
        GameState.equippedSkills = ['flow_state_3']; // +4%/回, 最大10
        const p0 = GameState.getTotalPower();
        for (let i = 0; i < 5; i++) GameState.registerCatchResult(true, { battle: true, zone: 'red' });
        expect(GameState.flowStacks).toBe(5);
        expect(near(GameState.getFlowPowerBonus(), 0.2)).toBe(true);
        expect(GameState.getTotalPower() >= p0).toBe(true);
        GameState.registerCatchResult(true, { battle: false }); // バトル無しは影響なし
        expect(GameState.flowStacks).toBe(5);
        GameState.registerCatchResult(true, { battle: true, zone: 'green' });
        expect(GameState.flowStacks).toBe(0);
    });

    it('flow_state raises total power with a big enough base', () => {
        reset();
        GameState.rodRankIndex = GAME_DATA.RODS.length - 1;
        GameState.rodStars = 5;
        GameState.equippedSkills = ['flow_state_4'];
        const p0 = GameState.getTotalPower();
        for (let i = 0; i < 12; i++) GameState.registerCatchResult(true, { battle: true, zone: 'red' });
        expect(GameState.getTotalPower() > p0).toBe(true);
        reset();
    });

    it('revenge: failures stack catch rate bonus, success resets', () => {
        reset();
        GameState.equippedSkills = ['revenge_1']; // +3%/回, 最大5
        const c0 = GameState.getCatchBonus();
        GameState.registerCatchResult(false);
        GameState.registerCatchResult(false);
        expect(near(GameState.getCatchBonus() - c0, 0.06)).toBe(true);
        for (let i = 0; i < 10; i++) GameState.registerCatchResult(false);
        expect(near(GameState.getCatchBonus() - c0, 0.15)).toBe(true); // 上限
        GameState.registerCatchResult(true);
        expect(near(GameState.getCatchBonus(), c0)).toBe(true);
    });

    it('Synthesis chain exists (I -> II -> III -> 極) for new families', () => {
        FAMILIES.forEach(base => {
            for (let t = 1; t < 4; t++) {
                expect(!!GAME_DATA.SKILLS.find(s => s.id === `${base}_${t + 1}`)).toBe(true);
            }
        });
    });
});
