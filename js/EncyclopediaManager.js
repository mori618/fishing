// 図鑑マネージャー
// 図鑑画面の表示を管理

const EncyclopediaManager = {
    // ========================================
    // 図鑑画面をレンダリング
    // ========================================
    render() {
        const container = document.getElementById('encyclopedia-list');
        const progressDisplay = document.getElementById('encyclopedia-progress');
        if (!container) return;

        container.innerHTML = '';

        let caughtNormalCount = 0;
        let caughtSpecialCount = 0;
        const totalNormalEntries = GAME_DATA.FISH.length;
        // 称号付きの総数は魚の種類と同じ
        const totalSpecialEntries = GAME_DATA.FISH.length;

        GAME_DATA.FISH.forEach(fish => {
            const data = GameState.encyclopedia[fish.id] || { count: 0, hasSpecial: false, specialCount: 0 };

            // 既存データ互換性: hasSpecialがtrueでspecialCountがない場合は1とする
            const specialCount = data.specialCount !== undefined ? data.specialCount : (data.hasSpecial ? 1 : 0);
            const normalCount = Math.max(0, data.count - specialCount);

            // ========================================
            // 1. 通常種の表示
            // ========================================
            const normalItem = document.createElement('div');
            // 通常種をまだ釣っていないが称号付きだけ釣った場合でも、その魚種を知っているなら表示
            const isDiscovered = data.count > 0;

            normalItem.className = `encyclopedia-item ${isDiscovered ? '' : 'unknown'}`;

            if (isDiscovered) {
                if (normalCount > 0 || specialCount > 0) caughtNormalCount++;

                normalItem.innerHTML = `
                    <div class="fish-icon">
                        <span class="material-icons">${fish.icon || 'set_meal'}</span>
                    </div>
                    <div class="fish-info-col">
                        <div class="fish-header">
                            <div class="fish-name rarity-${fish.rarity}">${fish.name}</div>
                        </div>
                        <div class="fish-count">捕獲数: ${normalCount} 匹</div>
                        <div class="fish-description">${fish.description}</div>
                    </div>
                `;
            } else {
                normalItem.innerHTML = `
                    <div class="fish-icon">
                        <span class="material-icons">help_outline</span>
                    </div>
                    <div class="fish-name">？？？</div>
                    <div class="fish-count">???</div>
                `;
            }
            container.appendChild(normalItem);

            // ========================================
            // 2. 称号付き種の表示
            // ========================================
            // 未発見の場合は表示しない

            const isSpecialCaught = specialCount > 0;
            if (isSpecialCaught) {
                caughtSpecialCount++;

                const specialItem = document.createElement('div');
                specialItem.className = 'encyclopedia-item special-entry';

                specialItem.innerHTML = `
                    <span class="material-icons special-mark">stars</span>
                    <div class="fish-icon special-icon-bg">
                        <span class="material-icons">${fish.icon || 'set_meal'}</span>
                    </div>
                    <div class="fish-info-col">
                        <div class="fish-header">
                            <div class="fish-name rarity-${fish.rarity}">【${fish.specialTitle}】${fish.name}</div>
                            <div class="special-tag">ヌシ級</div>
                        </div>
                        <div class="fish-count">捕獲数: ${specialCount} 匹</div>
                        <div class="fish-description">${fish.titleDescription}</div>
                    </div>
                `;

                container.appendChild(specialItem);
            }
        });

        // 進捗更新
        if (progressDisplay) {
            // 通常種と称号付きの進捗を分けて表示
            progressDisplay.innerHTML = `
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <span>通常種: ${caughtNormalCount} / ${totalNormalEntries}</span>
                    <span style="color: #ffd700; font-weight: bold; text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);">
                        ヌシ種: ${caughtSpecialCount}
                    </span>
                </div>
            `;
        }
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.EncyclopediaManager = EncyclopediaManager;
}
