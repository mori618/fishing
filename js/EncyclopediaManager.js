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

        let caughtCount = 0;
        const totalFishCount = GAME_DATA.FISH.length;

        GAME_DATA.FISH.forEach(fish => {
            const data = GameState.encyclopedia[fish.id] || { count: 0, hasSpecial: false };
            const isCaught = data.count > 0;
            if (isCaught) caughtCount++;

            const item = document.createElement('div');
            item.className = `encyclopedia-item ${isCaught ? '' : 'unknown'}`;

            if (isCaught) {
                item.innerHTML = `
                    ${data.hasSpecial ? '<span class="material-icons special-mark">stars</span>' : ''}
                    <div class="fish-icon">
                        <span class="material-icons">set_meal</span>
                    </div>
                    <div class="fish-name rarity-${fish.rarity}">${fish.name}</div>
                    <div class="fish-count">${data.count} 匹</div>
                    ${data.hasSpecial ? `<div class="special-tag">${fish.specialTitle}</div>` : ''}
                `;
            } else {
                item.innerHTML = `
                    <div class="fish-icon">
                        <span class="material-icons">help_outline</span>
                    </div>
                    <div class="fish-name">？？？</div>
                    <div class="fish-count">???</div>
                `;
            }

            container.appendChild(item);
        });

        // 進捗更新
        if (progressDisplay) {
            progressDisplay.textContent = `コンプリート: ${caughtCount} / ${totalFishCount}`;
        }
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.EncyclopediaManager = EncyclopediaManager;
}
