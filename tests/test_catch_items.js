// 釣れるもの（魚以外）の追加データのテスト
describe('Catch items (魚以外の釣れるもの)', () => {
    const items = GAME_DATA.FISH.filter(f => f.id.indexOf('catch_') === 0);

    it('追加一覧の釣れるものが図鑑データに入っている', () => {
        expect(items.length).toBe(253);
    });

    it('IDが重複していない', () => {
        const ids = GAME_DATA.FISH.map(f => f.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('全部に系統・ランク・パワー・売値・重みがある', () => {
        const ranks = ['D', 'C', 'B', 'A', 'S'];
        const bad = items.filter(f => !f.category || !GAME_DATA.CATCH_CATEGORIES[f.category]
            || ranks.indexOf(f.rarity) < 0 || !(f.power > 0) || !(f.price > 0) || !(f.weight > 0)
            || !f.specialTitle || !f.description);
        expect(bad.length).toBe(0);
    });

    it('画像がまだ無いものには image を付けない（404を出さない）', () => {
        const withImage = items.filter(f => f.image);
        expect(withImage.length).toBe((window.CATCH_IMAGE_READY || []).length);
    });

    it('既存の魚と同じ名前（タイ・マグロ）は二重登録しない', () => {
        expect(items.some(f => f.name === 'タイ' || f.name === 'マグロ')).toBe(false);
    });

    it('どのランクを抽選しても釣れるものの候補に入る', () => {
        ['D', 'C', 'B', 'A', 'S'].forEach(r => {
            expect(GAME_DATA.FISH.filter(f => f.rarity === r && f.category).length > 0).toBe(true);
        });
    });
});
