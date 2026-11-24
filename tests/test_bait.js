// 餌システム（1種類・使用数の段階制）のテスト
describe('# Bait (single type, use-count tiers)', () => {
    const CFG = GAME_DATA.BAIT_CONFIG;
    const RANKS = ['D', 'C', 'B', 'A', 'S', 'SS'];
    const pct = (weights) => {
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        const o = {};
        RANKS.forEach(r => { o[r] = (weights[r] || 0) / total; });
        return o;
    };
    const meanRank = (w) => { const p = pct(w); return RANKS.reduce((a, r, i) => a + p[r] * i, 0); };
    const setBait = (stock, use) => {
        GameState.baitStock = stock;
        GameState.baitUseCount = use;
        GameState.activeBaitCount = null;
        GameState.equippedSkills = [];
    };
    // 疑似乱数（再現性のため）
    const withRandom = (fn, seed = 12345) => {
        const orig = Math.random;
        const origLog = console.log;
        console.log = () => { }; // 抽選ログを抑制
        let x = seed;
        Math.random = () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; };
        try { return fn(); } finally { Math.random = orig; console.log = origLog; }
    };

    it('Tier table: counts ascend, start at 0, and each tier has weights/feverWeights', () => {
        expect(CFG.tiers[0].count).toBe(0);
        for (let i = 1; i < CFG.tiers.length; i++) {
            expect(CFG.tiers[i].count > CFG.tiers[i - 1].count).toBe(true);
        }
        CFG.tiers.forEach(t => {
            expect(Object.keys(t.weights).length > 0).toBe(true);
            expect(Object.keys(t.feverWeights).length > 0).toBe(true);
        });
    });

    it('Higher use count => higher average rank and higher A+ chance (normal and fever)', () => {
        for (let i = 1; i < CFG.tiers.length; i++) {
            expect(meanRank(CFG.tiers[i].weights) > meanRank(CFG.tiers[i - 1].weights)).toBe(true);
            expect(meanRank(CFG.tiers[i].feverWeights) >= meanRank(CFG.tiers[i - 1].feverWeights)).toBe(true);
            const bPlus = (w) => { const p = pct(w); return p.B + p.A + p.S + p.SS; };
            if (CFG.tiers[i].count <= 5) expect(bPlus(CFG.tiers[i].weights) >= bPlus(CFG.tiers[i - 1].weights)).toBe(true);
        }
        const top = pct(CFG.tiers[CFG.tiers.length - 1].weights);
        const oldS = pct({ A: 0.6, S: 0.2, B: 0.2, SS: 0.033 }); // 旧Sランク餌
        expect(top.S >= oldS.S).toBe(true);
        expect(top.SS >= oldS.SS).toBe(true);
        // 餌なしは旧D餌相当（ほぼD、少しC）
        const none = pct(CFG.tiers[0].weights);
        expect(none.D > 0.85).toBe(true);
        expect(none.A + none.B).toBe(0);
    });

    it('selectFish follows the tier weights (sampling)', () => {
        GameState.init(null);
        GameState.fever = { isActive: false, value: 0, type: 'sun' };
        GameState.highTierGuaranteed = false;
        [0, 3, 10].forEach(use => {
            setBait(1000, use);
            const counts = {};
            let n = 0;
            withRandom(() => {
                for (let i = 0; i < 4000; i++) {
                    const f = FishingGame.selectFish();
                    if (f.isTreasure) continue;
                    counts[f.rarity] = (counts[f.rarity] || 0) + 1;
                    n++;
                }
            }, 777 + use);
            const expected = pct(CFG.tiers.find(t => t.count === use).weights);
            RANKS.forEach(r => {
                const got = (counts[r] || 0) / n;
                expect(Math.abs(got - expected[r]) < 0.04).toBe(true);
            });
        });
    });

    it('selectFish does not mutate the shared weight tables (collector skill)', () => {
        GameState.init(null);
        setBait(10, 10);
        const before = JSON.stringify(CFG.tiers[4].weights);
        const orig = GameState.getEffectsByType;
        GameState.getEffectsByType = (type) => type === 'rank_collector' ? [{ targetRarity: 'S' }] : orig.call(GameState, type);
        withRandom(() => { for (let i = 0; i < 50; i++) FishingGame.selectFish(); });
        GameState.getEffectsByType = orig;
        expect(JSON.stringify(CFG.tiers[4].weights)).toBe(before);
    });

    it('Bird event: guaranteed rank is one above the use-count rank', () => {
        GameState.init(null);
        GameState.fever = { isActive: false, value: 0, type: 'sun' };
        [[0, 'C'], [1, 'B'], [3, 'A'], [5, 'S'], [10, 'SS']].forEach(([use, rank]) => {
            setBait(100, use);
            GameState.highTierGuaranteed = true;
            const orig = Math.random;
            Math.random = () => 0.5; // 宝箱抽選を避ける
            const got = FishingGame.selectFish().rarity;
            Math.random = orig;
            expect(got).toBe(rank);
        });
    });

    it('Use count: cycles through tiers and wraps, invalid values are normalized', () => {
        GameState.init(null);
        setBait(0, 0);
        const seen = [];
        for (let i = 0; i < CFG.tiers.length; i++) seen.push(GameState.switchBait(1));
        expect(seen.join(',')).toBe(CFG.tiers.slice(1).map(t => t.count).concat(0).join(','));
        expect(GameState.switchBait(-1)).toBe(CFG.tiers[CFG.tiers.length - 1].count);
        expect(GameState.normalizeBaitUseCount(4)).toBe(3);
        expect(GameState.normalizeBaitUseCount(-5)).toBe(0);
        expect(GameState.normalizeBaitUseCount(999)).toBe(20);
    });

    it('Cast consumes the used count immediately; failure refunds half (rounded down)', () => {
        GameState.init(null);
        setBait(20, 5);
        const r = GameState.commitBait();
        expect(r.used).toBe(5);
        expect(r.spent).toBe(5);
        expect(GameState.baitStock).toBe(15);
        expect(GameState.settleBait(false)).toBe(2);
        expect(GameState.baitStock).toBe(17);
        expect(GameState.settleBait(false)).toBe(0); // 二重精算しない
        expect(GameState.baitStock).toBe(17);
    });

    it('Success without skill keeps bait consumed; Bait Master returns each used bait by chance', () => {
        GameState.init(null);
        setBait(20, 10);
        GameState.commitBait();
        expect(GameState.settleBait(true)).toBe(0);
        expect(GameState.baitStock).toBe(10);

        const orig = GameState.getBaitSaveChance;
        GameState.getBaitSaveChance = () => 0.5;
        setBait(50000, 10);
        let refunded = 0;
        withRandom(() => {
            for (let i = 0; i < 400; i++) {
                GameState.commitBait();
                refunded += GameState.settleBait(true);
            }
        });
        GameState.getBaitSaveChance = orig;
        // 期待値 400*10*0.5 = 2000（二項分布なので十分に狭い）
        expect(Math.abs(refunded - 2000) < 150).toBe(true);
        expect(GameState.baitStock).toBe(50000 - 4000 + refunded);
    });

    it('Bait Master skill data: bait_save effect still defined (I-IV) and reads from equipped skills', () => {
        ['bait_master_1', 'bait_master_2', 'bait_master_3', 'bait_master_4'].forEach(id => {
            const s = GAME_DATA.SKILLS.find(x => x.id === id);
            expect(s.effect.type).toBe('bait_save');
        });
        GameState.init(null);
        GameState.equippedSkills = ['bait_master_2'];
        expect(GameState.getBaitSaveChance()).toBe(0.3);
        GameState.equippedSkills = [];
    });

    it('Infinite bait: nothing is consumed, selected count is used regardless of stock', () => {
        GameState.init(null);
        setBait(0, 10);
        const orig = GameState.isInfiniteBait;
        GameState.isInfiniteBait = () => true;
        const r = GameState.commitBait();
        expect(r.used).toBe(10);
        expect(r.spent).toBe(0);
        expect(GameState.settleBait(false)).toBe(0);
        expect(GameState.baitStock).toBe(0);
        GameState.isInfiniteBait = orig;
    });

    it('Shortage: falls back to the largest tier you can afford (0 when empty)', () => {
        GameState.init(null);
        setBait(7, 10);
        expect(GameState.getPlannedBaitCount()).toBe(5);
        let r = GameState.commitBait();
        expect(r.used).toBe(5);
        expect(r.short).toBe(true);
        expect(GameState.baitStock).toBe(2);
        GameState.settleBait(true);
        setBait(2, 10);
        expect(GameState.getPlannedBaitCount()).toBe(1);
        setBait(0, 10);
        r = GameState.commitBait();
        expect(r.used).toBe(0);
        expect(r.short).toBe(true);
        expect(GameState.baitStock).toBe(0);
        GameState.settleBait(true);
    });

    it('Abort before the result returns the committed bait in full', () => {
        GameState.init(null);
        setBait(10, 5);
        GameState.commitBait();
        expect(GameState.baitStock).toBe(5);
        GameState.cancelBait();
        expect(GameState.baitStock).toBe(10);
        expect(GameState.activeBaitCount).toBe(null);
    });

    it('Buying: pack prices, shop discount, and insufficient money', () => {
        GameState.init(null);
        setBait(0, 0);
        GameState.money = 0;
        expect(GameState.buyBait(10)).toBe(false);
        expect(GameState.baitStock).toBe(0);
        GameState.money = 100000;
        const pack = CFG.packs.find(p => p.count === 50);
        expect(GameState.buyBait(50)).toBe(true);
        expect(GameState.baitStock).toBe(50);
        expect(GameState.money).toBe(100000 - pack.price);
        // 大口ほど割安
        const unit = (p) => p.price / p.count;
        for (let i = 1; i < CFG.packs.length; i++) expect(unit(CFG.packs[i]) <= unit(CFG.packs[i - 1])).toBe(true);
        expect(CFG.packs[0].price / CFG.packs[0].count <= CFG.unitPrice).toBe(true);
    });

    it('New game starts with the starter stock and no bait selected', () => {
        GameState.init(null);
        expect(GameState.baitStock).toBe(CFG.starterStock);
        expect(GameState.baitUseCount).toBe(0);
    });

    it('Save/load: stock and use count round-trip', () => {
        GameState.init(null);
        setBait(123, 5);
        SaveManager.save(GameState);
        const data = SaveManager.load();
        expect(data.player.baitStock).toBe(123);
        expect(data.player.baitUseCount).toBe(5);
        expect(data.player.baitInventory).toBe(undefined);
        GameState.init(data);
        expect(GameState.baitStock).toBe(123);
        expect(GameState.baitUseCount).toBe(5);
        // 不正な使用数は段階に丸める
        data.player.baitUseCount = 7;
        GameState.init(data);
        expect(GameState.baitUseCount).toBe(5);
    });

    it('Legacy save migration: old ranked baits are converted by value; infinite D is ignored', () => {
        GameState.init(null);
        const base = SaveManager.getDefaultData();
        const mk = (inv, extra = {}) => ({ ...base, player: { ...base.player, baitInventory: inv, baitType: 'bait_c', ...extra } });
        // 価値: C5*10 + B2*40 + A1*160 + S1*600 = 890G / 単価20 = 44個
        GameState.init(mk({ bait_d: -1, bait_c: 5, bait_b: 2, bait_a: 1, bait_s: 1 }));
        expect(GameState.baitStock).toBe(Math.floor((5 * 10 + 2 * 40 + 160 + 600) / CFG.unitPrice));
        expect(GameState.baitUseCount).toBe(0);
        // Dの無限だけなら0
        GameState.init(mk({ bait_d: -1, bait_c: 0, bait_b: 0, bait_a: 0, bait_s: 0 }));
        expect(GameState.baitStock).toBe(0);
        // 端数で0になっても所持があれば最低1個
        GameState.init(mk({ bait_d: -1, bait_c: 1 }));
        expect(GameState.baitStock >= 1).toBe(true);
        // 更に古い形式 (baitType + baitCount)
        const oldest = { ...base, player: { ...base.player, baitType: 'bait_b', baitCount: 3 } };
        delete oldest.player.baitInventory;
        GameState.init(oldest);
        expect(GameState.baitStock).toBe(Math.floor(3 * 40 / CFG.unitPrice));
    });

    it('Treasure chests give plain bait counts (no ranked bait ids)', () => {
        const tables = GAME_DATA.TREASURE_CONFIG.lootTables;
        ['WOOD', 'SILVER', 'GOLD'].forEach(k => {
            expect(typeof tables[k].baits.min).toBe('number');
            expect(tables[k].baits.max >= tables[k].baits.min).toBe(true);
        });
        expect(tables.GOLD.baits.min > tables.SILVER.baits.max).toBe(true);
        expect(tables.SILVER.baits.min > tables.WOOD.baits.max).toBe(true);
        GameState.init(null);
        setBait(0, 0);
        const origShow = UIManager.showTreasureResult;
        UIManager.showTreasureResult = () => { };
        const res = FishingGame.processTreasureChest({ treasureType: 'WOOD' });
        UIManager.showTreasureResult = origShow;
        const b = res.find(r => r.type === 'bait');
        expect(!!b).toBe(true);
        expect(GameState.baitStock).toBe(b.count);
    });

    it('Mission "use_bait" counts the baits spent (no rank param)', () => {
        const origPopup = UIManager.showRewardPopup;
        const origUI = UIManager.updateMissionUI;
        UIManager.showRewardPopup = () => { };
        UIManager.updateMissionUI = () => { };
        GameState.beginnerMissionCompleted = MissionManager.MISSIONS.map(m => m.id);
        const dummy = () => ({ templateId: '__none', text: '', target: 999, current: 0, reward: { type: 'ticket', value: 1 }, exp: 0 });
        const m = { templateId: 'use_bait', text: 't', target: 100, current: 0, param: null, paramLabel: null, reward: { type: 'ticket', value: 1 }, exp: 0 };
        GameState.dynamicMissions = { A: dummy(), B: dummy(), C: m };
        MissionManager.checkMission('use_bait', { count: 5 });
        MissionManager.checkMission('use_bait', { count: 10 });
        expect(m.current).toBe(15);
        UIManager.showRewardPopup = origPopup;
        UIManager.updateMissionUI = origUI;
    });

    it('Higher use count lowers the wait time a little and raises the effective rank', () => {
        for (let i = 1; i < CFG.tiers.length; i++) {
            expect(CFG.tiers[i].waitTimeReduction >= CFG.tiers[i - 1].waitTimeReduction).toBe(true);
            expect(CFG.tiers[i].effectiveRank >= CFG.tiers[i - 1].effectiveRank).toBe(true);
        }
        expect(CFG.tiers[CFG.tiers.length - 1].waitTimeReduction <= 0.2).toBe(true);
    });
    it('FishingGame.cast commits bait; abort refunds; failure paths refund half', () => {
        const origTimeout = setTimeout;
        const origMsg = UIManager.showMessage;
        const msgs = [];
        setTimeout = () => 0; // キャスト後の待機タイマーを動かさない
        UIManager.showMessage = (m) => { msgs.push(m); };
        const origLog = console.log;
        console.log = () => { };
        try {
            GameState.init(null);
            GameState.fever = { isActive: false, value: 0, type: 'sun' };
            FishingGame.init();
            setBait(7, 10);
            expect(FishingGame.cast()).toBe(true);
            expect(GameState.activeBaitCount).toBe(5); // 所持7 → 5個に自動で下がる
            expect(GameState.baitStock).toBe(2);
            expect(msgs.some(m => m.includes('足りない'))).toBe(true);
            FishingGame.abort();
            expect(GameState.baitStock).toBe(7);

            // 早合わせ失敗: 使用数の半分が戻る
            setBait(20, 10);
            FishingGame.state = 'idle';
            FishingGame.cast();
            expect(GameState.baitStock).toBe(10);
            FishingGame.earlyClickFailed();
            expect(GameState.baitStock).toBe(15);
            expect(GameState.activeBaitCount).toBe(null);
        } finally {
            setTimeout = origTimeout;
            UIManager.showMessage = origMsg;
            console.log = origLog;
            FishingGame.abort();
        }
    });
});
