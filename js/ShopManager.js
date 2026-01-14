// ショップマネージャー
// 購入、売却、強化などのショップ機能を管理

const ShopManager = {
    // ========================================
    // ショップカテゴリ
    // ========================================
    currentCategory: 'rods',  // rods, skills, baits

    // ========================================
    // カテゴリ切り替え
    // ========================================
    setCategory(category) {
        this.currentCategory = category;
        this.renderShop();
    },

    // ========================================
    // ショップ画面をレンダリング
    // ========================================
    renderShop() {
        switch (this.currentCategory) {
            case 'rods':
                this.renderRodShop();
                break;
            case 'skills':
                this.renderSkillShop();
                break;
            case 'baits':
                this.renderBaitShop();
                break;
        }
    },

    // ========================================
    // 釣り竿ショップ
    // ========================================
    renderRodShop() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        GAME_DATA.RODS.forEach((rod, index) => {
            const isUnlocked = GameState.unlockedRods.includes(index);
            const isEquipped = GameState.rodRankIndex === index;
            const canBuy = !isUnlocked && GameState.money >= rod.price;

            const item = document.createElement('div');
            item.className = `shop-item ${isEquipped ? 'equipped' : ''} ${!isUnlocked && !canBuy ? 'locked' : ''}`;

            // ランクカラーのマッピング (index 0:D, 1:C, 2:B, 3:A, 4:S)
            const rankMap = ['D', 'C', 'B', 'A', 'S'];
            const rankClass = `rarity-${rankMap[index] || 'D'}`;

            item.innerHTML = `
                <div class="item-info">
                    <div class="item-name ${rankClass}">${rod.name}</div>
                    <div class="item-desc">${rod.description}</div>
                    <div class="item-stats">
                        パワー: ${rod.basePower} (+${rod.starPowerBonus}/<span class="material-icons star-icon">star</span>)
                    </div>
                </div>
                <div class="item-action">
                    ${isUnlocked
                    ? (isEquipped
                        ? '<span class="status equipped">装備中</span>'
                        : `<button class="btn btn-equip" onclick="ShopManager.equipRod(${index})">装備</button>`)
                    : `<button class="btn btn-buy ${canBuy ? '' : 'disabled'}" 
                            onclick="ShopManager.buyRod(${index})" ${canBuy ? '' : 'disabled'}>
                            ¥${rod.price.toLocaleString()}
                          </button>`
                }
                </div>
            `;

            container.appendChild(item);
        });

        // 現在の竿の強化セクション
        this.renderUpgradeSection();
    },

    // ========================================
    // 釣り竿強化セクション
    // ========================================
    renderUpgradeSection() {
        const container = document.getElementById('upgrade-section');
        if (!container) return;

        const rod = GameState.getCurrentRod();
        const stars = GameState.rodStars;
        const upgradeCost = GameState.getUpgradeCost();
        const canUpgrade = upgradeCost !== null && GameState.money >= upgradeCost;

        // 星の表示を生成
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i < stars) {
                starsHtml += '<span class="material-icons star filled">star</span>';
            } else {
                starsHtml += '<span class="material-icons star empty">star_border</span>';
            }
        }

        container.innerHTML = `
            <h3>現在の釣り竿: ${rod.name}</h3>
            <div class="stars-display">${starsHtml}</div>
            <div class="current-power">
                現在のパワー: <strong>${GameState.getTotalPower()}</strong>
            </div>
            <div class="skill-slots">
                スキルスロット: <strong>${stars}</strong>個
            </div>
            ${stars < 5
                ? `<button class="btn btn-upgrade ${canUpgrade ? '' : 'disabled'}" 
                    onclick="ShopManager.upgradeRod()" ${canUpgrade ? '' : 'disabled'}>
                    強化 (¥${upgradeCost.toLocaleString()})
                  </button>`
                : '<span class="status max">最大強化済み</span>'
            }
        `;
    },

    // ========================================
    // スキルショップ
    // ========================================
    renderSkillShop() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        GAME_DATA.SKILLS.forEach(skill => {
            const isUnlocked = GameState.unlockedSkills.includes(skill.id);
            const isEquipped = GameState.equippedSkills.includes(skill.id);
            const canBuy = !isUnlocked && GameState.money >= skill.price;
            const canEquip = isUnlocked && !isEquipped &&
                GameState.equippedSkills.length < GameState.getSkillSlots();

            const item = document.createElement('div');
            item.className = `shop-item ${isEquipped ? 'equipped' : ''} ${!isUnlocked && !canBuy ? 'locked' : ''}`;

            let actionHtml = '';
            if (!isUnlocked) {
                actionHtml = `
                    <button class="btn btn-buy ${canBuy ? '' : 'disabled'}" 
                        onclick="ShopManager.buySkill('${skill.id}')" ${canBuy ? '' : 'disabled'}>
                        ¥${skill.price.toLocaleString()}
                    </button>`;
            } else if (isEquipped) {
                actionHtml = `
                    <button class="btn btn-unequip" onclick="ShopManager.unequipSkill('${skill.id}')">
                        外す
                    </button>`;
            } else {
                actionHtml = `
                    <button class="btn btn-equip ${canEquip ? '' : 'disabled'}" 
                        onclick="ShopManager.equipSkill('${skill.id}')" ${canEquip ? '' : 'disabled'}>
                        装備
                    </button>`;
            }

            item.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${skill.name}</div>
                    <div class="item-desc">${skill.description}</div>
                </div>
                <div class="item-action">
                    ${actionHtml}
                </div>
            `;

            container.appendChild(item);
        });

        // スキルスロット情報
        this.renderSkillSlotInfo();
    },

    // ========================================
    // スキルスロット情報
    // ========================================
    renderSkillSlotInfo() {
        const container = document.getElementById('upgrade-section');
        if (!container) return;

        const slots = GameState.getSkillSlots();
        const equipped = GameState.equippedSkills.length;

        container.innerHTML = `
            <h3>スキルスロット</h3>
            <div class="slot-info">
                使用中: <strong>${equipped}</strong> / ${slots}
            </div>
            ${slots === 0
                ? '<p class=\"hint\">釣り竿を強化して<span class=\"material-icons\">star</span>を増やすとスキルが装備できます</p>'
                : ''
            }
        `;
    },

    // ========================================
    // 餌ショップ
    // ========================================
    renderBaitShop() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        GAME_DATA.BAITS.forEach(bait => {
            const canBuy = GameState.money >= bait.price;

            const item = document.createElement('div');
            item.className = `shop-item ${!canBuy ? 'locked' : ''}`;

            item.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${bait.name}</div>
                    <div class="item-desc">${bait.description}</div>
                    <div class="item-stats">
                        ${bait.quantity}個入り
                    </div>
                </div>
                <div class="item-action">
                    <button class="btn btn-buy ${canBuy ? '' : 'disabled'}" 
                        onclick="ShopManager.buyBait('${bait.id}')" ${canBuy ? '' : 'disabled'}>
                        ¥${bait.price.toLocaleString()}
                    </button>
                </div>
            `;

            container.appendChild(item);
        });

        // 現在の餌情報
        this.renderBaitInfo();
    },

    // ========================================
    // 現在の餌情報
    // ========================================
    renderBaitInfo() {
        const container = document.getElementById('upgrade-section');
        if (!container) return;

        const baitCount = GameState.baitCount;
        const baitType = GameState.baitType;
        const bait = baitType ? GAME_DATA.BAITS.find(b => b.id === baitType) : null;

        container.innerHTML = `
            <h3>所持中の餌</h3>
            <div class="bait-info">
                ${bait
                ? `<strong>${bait.name}</strong> × ${baitCount}`
                : '<span class="none">なし</span>'
            }
            </div>
        `;
    },

    // ========================================
    // 釣り竿購入
    // ========================================
    buyRod(index) {
        if (GameState.buyRod(index)) {
            UIManager.showMessage(`${GAME_DATA.RODS[index].name}を購入しました！`);
            this.renderShop();
            UIManager.updateMoney();
        }
    },

    // ========================================
    // 釣り竿装備
    // ========================================
    equipRod(index) {
        if (GameState.equipRod(index)) {
            UIManager.showMessage(`${GAME_DATA.RODS[index].name}を装備しました！`);
            this.renderShop();
        }
    },

    // ========================================
    // 釣り竿強化
    // ========================================
    upgradeRod() {
        const result = GameState.upgradeRod();
        if (result.success) {
            UIManager.showMessage(`<span class="material-icons">star</span>${result.newStars}に強化しました！`);
            this.renderShop();
            UIManager.updateMoney();
        } else {
            UIManager.showMessage(result.message);
        }
    },

    // ========================================
    // スキル購入
    // ========================================
    buySkill(skillId) {
        const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
        if (GameState.buySkill(skillId)) {
            UIManager.showMessage(`${skill.name}を購入しました！`);
            this.renderShop();
            UIManager.updateMoney();
        }
    },

    // ========================================
    // スキル装備
    // ========================================
    equipSkill(skillId) {
        const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
        if (GameState.equipSkill(skillId)) {
            UIManager.showMessage(`${skill.name}を装備しました！`);
            this.renderShop();
        }
    },

    // ========================================
    // スキル取り外し
    // ========================================
    unequipSkill(skillId) {
        const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
        if (GameState.unequipSkill(skillId)) {
            UIManager.showMessage(`${skill.name}を外しました`);
            this.renderShop();
        }
    },

    // ========================================
    // 餌購入
    // ========================================
    buyBait(baitId) {
        const bait = GAME_DATA.BAITS.find(b => b.id === baitId);
        if (GameState.buyBait(baitId)) {
            UIManager.showMessage(`${bait.name}を購入しました！`);
            this.renderShop();
            UIManager.updateMoney();
        }
    },

    // ========================================
    // 魚を全て売却
    // ========================================
    sellAllFish() {
        const count = GameState.inventory.length;
        if (count === 0) {
            UIManager.showMessage('売る魚がありません');
            return;
        }

        const earned = GameState.sellAllFish();
        UIManager.showMessage(`魚${count}匹を売却して¥${earned.toLocaleString()}を獲得！`);
        UIManager.updateMoney();
        UIManager.updateInventory();
        // ショップを再描画して購入ボタンを更新
        this.renderShop();
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.ShopManager = ShopManager;
}
