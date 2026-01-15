// ショップマネージャー
// 購入、売却、強化などのショップ機能を管理

const ShopManager = {
    // ========================================
    // ショップカテゴリ
    // ========================================
    currentCategory: 'rods',  // rods, skills, baits
    currentTab: 'skill',      // skill, gacha
    recycleSelectedSkills: [], // リサイクル用に選択されたスキルのIDリスト

    // ========================================
    // カテゴリ切り替え
    // ========================================
    setCategory(category) {
        this.currentCategory = category;
        this.renderShop();
    },

    // ========================================
    // サブタブ切り替え (Skills / Gacha)
    // ========================================
    switchTab(tab) {
        this.currentTab = tab;
        this.renderShop();
    },

    // ========================================
    // ショップ画面をレンダリング
    // ========================================
    renderShop() {
        // ショップアイテムコンテナを取得
        const container = document.getElementById('shop-items');
        // リセット前には何もしない（各renderメソッド内でクリアするが、タブ挿入のためにここでも制御が必要かも）

        switch (this.currentCategory) {
            case 'rods':
                this.renderRodShop();
                break;
            case 'skills':
                // サブタブを表示（コンテナの直前、あるいはコンテナ内に都度描画）
                // ここでは renderSkillShop / renderGachaShop の先頭で呼ぶ形にするか、
                // あるいは共通処理としてここで呼ぶか。
                // 既存のHTML構造上、shop-itemsの中にタブを入れると消えてしまうので、
                // shop-itemsの前に動的に入れるか、shop-itemsのinnerHTMLの最初にタブを入れる。
                // 簡易的に innerHTML の最初にタブを入れる実装にする。

                if (this.currentTab === 'skill') {
                    this.renderSkillShop();
                } else if (this.currentTab === 'gacha') {
                    // ガチャショップ描画
                    this.renderGachaShop(container);
                }
                break;
            case 'baits':
                this.renderBaitShop();
                break;
        }
    },

    // ========================================
    // スキル/ガチャ タブ描画 helper
    // ========================================
    renderSubTabs(container) {
        const isSkill = this.currentTab === 'skill';
        const html = `
            <div class="shop-tabs sub-tabs" style="margin-bottom: 20px; border-bottom: none; justify-content: center;">
                <button class="shop-tab ${isSkill ? 'active' : ''}" onclick="ShopManager.switchTab('skill')">
                    <span class="material-icons">bolt</span> スキル購入
                </button>
                <button class="shop-tab ${!isSkill ? 'active' : ''}" onclick="ShopManager.switchTab('gacha')">
                    <span class="material-icons">auto_awesome</span> ガチャ
                </button>
            </div>
        `;
        container.innerHTML = html + container.innerHTML;
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
    // ガチャショップの描画
    // ========================================
    renderGachaShop(container) {
        let html = '<div class="shop-items gacha-section">';

        // ガチャ設定からボタンを生成
        const config = GAME_DATA.GACHA_CONFIG;
        const tiers = [
            { id: 'BRONZE', name: 'ブロンズガチャ', color: '#cd7f32', desc: 'Tier1 (85%), Tier2 (14%), Tier3 (1%)' },
            { id: 'SILVER', name: 'シルバーガチャ', color: '#c0c0c0', desc: 'Tier1 (15%), Tier2 (75%), Tier3 (10%)' },
            { id: 'GOLD', name: 'ゴールドガチャ', color: '#ffd700', desc: 'Tier2 (20%), Tier3 (75%), Special (5%)' }
        ];

        tiers.forEach(tier => {
            const data = config[tier.id];
            const money = GameState.money;
            const singleAffordable = money >= data.single;
            const tenAffordable = money >= data.ten;

            html += `
                <div class="shop-item gacha-item" style="border-left: 4px solid ${tier.color}">
                    <div class="item-info">
                        <div class="item-name" style="color: ${tier.color}">${tier.name}</div>
                        <div class="item-desc">${tier.desc}</div>
                    </div>
                    <div class="item-action-container">
                        <button class="btn btn-buy ${!singleAffordable ? 'disabled' : ''}" 
                                onclick="ShopManager.drawGacha('${tier.id}', 1)">
                            単発 ¥${data.single.toLocaleString()}
                        </button>
                        <button class="btn btn-buy ${!tenAffordable ? 'disabled' : ''}" 
                                onclick="ShopManager.drawGacha('${tier.id}', 10)">
                            10連 ¥${data.ten.toLocaleString()}
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';

        // リサイクル（エコ・ボックス）セクション
        html += '<div id="recycle-section" class="recycle-section"></div>';

        container.innerHTML = html;

        // リサイクルUIの描画
        this.renderRecycleUI();

        // サブタブを描画（最上部に挿入）
        this.renderSubTabs(container);
    },

    // ========================================
    // リサイクル（エコ・ボックス）UI描画
    // ========================================
    renderRecycleUI() {
        const container = document.getElementById('recycle-section');
        if (!container) return;

        const selectedCount = this.recycleSelectedSkills.length;
        const canExecute = selectedCount === 5;

        let html = `
            <div class="recycle-header">
                <h3>♻️ エコ・ボックス (リサイクルガチャ)</h3>
                <p class="recycle-desc">不要なスキル5個で、新しいスキル1個と交換！(Tier1:40% / Tier2:50% / Tier3:10%)</p>
            </div>
            
            <div class="recycle-controls">
                <div class="recycle-status">
                    選択中: <span class="select-count ${canExecute ? 'complete' : ''}">${selectedCount}/5</span>
                </div>
                <div class="recycle-actions">
                    <button class="btn btn-mini" onclick="ShopManager.selectBulkRecycle(1)">Tier1を一括選択</button>
                    <button class="btn btn-mini" onclick="ShopManager.recycleSelectedSkills = []; ShopManager.renderShop();">クリア</button>
                </div>
            </div>

            <div class="recycle-grid">
        `;

        // 所持スキルを表示 (ソート: Tier昇順 -> ID順)
        const skills = GAME_DATA.SKILLS.map(s => {
            return {
                ...s,
                count: GameState.getSkillCount(s.id),
                equipped: GameState.getEquippedSkillCount(s.id)
            };
        }).filter(s => s.count > 0)
            .sort((a, b) => {
                if (a.tier !== b.tier) return a.tier - b.tier;
                return a.id.localeCompare(b.id);
            });

        if (skills.length === 0) {
            html += '<div class="no-skills">リサイクル可能なスキルがありません</div>';
        } else {
            skills.forEach(skill => {
                // 所持数分だけ個別に表示するのは大変なので、スキルごとに選択数を管理するUIにする
                // ここではシンプルに「所持数-装備数」分だけ選択可能とする
                const available = skill.count - skill.equipped;
                const selected = this.recycleSelectedSkills.filter(id => id === skill.id).length;
                const isSelected = selected > 0;

                // 選択可能な残り数
                const remaining = available - selected;
                const canSelectMore = remaining > 0 && this.recycleSelectedSkills.length < 5;

                html += `
                    <div class="recycle-item tier-${skill.tier} ${isSelected ? 'selected' : ''} ${remaining === 0 ? 'dimmed' : ''}"
                         onclick="${canSelectMore || isSelected ? `ShopManager.toggleRecycleSelect('${skill.id}')` : ''}">
                        <div class="recycle-item-icon">
                            <span class="material-icons">auto_awesome</span>
                        </div>
                        <div class="recycle-item-info">
                            <div class="name">${skill.name}</div>
                            <div class="tier">Tier ${skill.tier}</div>
                            <div class="count">所持: ${available} / 選択: ${selected}</div>
                        </div>
                        ${isSelected ? '<div class="check-mark"><span class="material-icons">check_circle</span></div>' : ''}
                    </div>
                `;
            });
        }

        html += `
            </div>
            
            <div class="recycle-execute">
                <button class="btn btn-recycle ${canExecute ? '' : 'disabled'}" 
                        onclick="ShopManager.executeRecycle()" ${canExecute ? '' : 'disabled'}>
                    ♻️ リサイクル実行！
                </button>
            </div>
        `;

        container.innerHTML = html;
    },

    // ========================================
    // リサイクル選択トグル
    // ========================================
    toggleRecycleSelect(skillId) {
        const index = this.recycleSelectedSkills.indexOf(skillId);
        const skill = GAME_DATA.SKILLS.find(s => s.id === skillId);
        const owned = GameState.getSkillCount(skillId);
        const equipped = GameState.getEquippedSkillCount(skillId);
        const available = owned - equipped;
        const currentSelected = this.recycleSelectedSkills.filter(id => id === skillId).length;

        if (this.recycleSelectedSkills.length < 5 && currentSelected < available) {
            this.recycleSelectedSkills.push(skillId);
        } else if (currentSelected > 0) {
            // 1つ削除
            const idx = this.recycleSelectedSkills.indexOf(skillId);
            if (idx > -1) {
                this.recycleSelectedSkills.splice(idx, 1);
            }
        }

        this.renderRecycleUI();
    },

    // ========================================
    // 一括選択
    // ========================================
    selectBulkRecycle(tier) {
        this.recycleSelectedSkills = []; // リセット

        const candidates = [];
        GAME_DATA.SKILLS.forEach(skill => {
            if (skill.tier === tier) {
                const owned = GameState.getSkillCount(skill.id);
                const equipped = GameState.getEquippedSkillCount(skill.id);
                const available = owned - equipped;
                for (let i = 0; i < available; i++) {
                    candidates.push(skill.id);
                }
            }
        });

        // 最大5個まで選択
        for (let i = 0; i < 5 && i < candidates.length; i++) {
            this.recycleSelectedSkills.push(candidates[i]);
        }

        this.renderRecycleUI();
    },

    // ========================================
    // リサイクル実行
    // ========================================
    executeRecycle() {
        if (this.recycleSelectedSkills.length !== 5) {
            UIManager.showMessage('スキルを5個選択してください');
            return;
        }

        // スキル消費
        this.recycleSelectedSkills.forEach(skillId => {
            if (GameState.skillInventory[skillId] > 0) {
                GameState.skillInventory[skillId]--;
            }
        });

        // 抽選
        const result = this.lottery(GAME_DATA.RECYCLE_RATES);

        // 選択状態リセット
        this.recycleSelectedSkills = [];
        this.renderShop(); // カウント更新のため再描画
        UIManager.updateMoney(); // 必要なら

        // ガチャ演出へ (単発扱い)
        FishingGame.startGacha([result]);
    },

    // ========================================
    // ガチャ抽選 (汎用)
    // ========================================
    lottery(rates) {
        const rand = Math.random() * 100;
        let selectedTier = 'tier1';
        let cumulative = 0;

        if ((cumulative += rates.special) > rand) selectedTier = 'special';
        else if ((cumulative += rates.tier3) > rand) selectedTier = 'tier3';
        else if ((cumulative += rates.tier2) > rand) selectedTier = 'tier2';
        else selectedTier = 'tier1';

        // Tier4 (Recycle用)
        if (rates.tier4 && (cumulative += rates.tier4) > rand) selectedTier = 'tier4';

        return this.pickSkillByTier(selectedTier);
    },

    // ========================================
    // ガチャ実行 (通常)
    // ========================================
    drawGacha(tierKey, count) {
        const config = GAME_DATA.GACHA_CONFIG[tierKey];
        if (!config) return;

        const cost = count === 10 ? config.ten : config.single;

        if (GameState.money < cost) {
            UIManager.showMessage('お金が足りません！');
            return;
        }

        // お金を消費
        GameState.money -= cost;
        UIManager.updateMoney();

        // 抽選実行
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.lottery(config.rates));
        }

        // ガチャ演出開始
        FishingGame.startGacha(results);
    },

    // ========================================
    // Tierに応じたスキル選出
    // ========================================
    pickSkillByTier(tier) {
        let targetTier = 1;
        if (tier === 'tier2') targetTier = 2;
        if (tier === 'tier3') targetTier = 3;
        if (tier === 'special' || tier === 'tier4') targetTier = 3; // Special/Tier4は現状Tier3相当

        // 該当Tierのスキルを抽出
        const candidates = GAME_DATA.SKILLS.filter(s => s.tier === targetTier);

        // 候補がない場合はフォールバック
        if (candidates.length === 0) {
            return GAME_DATA.SKILLS[0];
        }

        const index = Math.floor(Math.random() * candidates.length);
        const skill = candidates[index];

        // 結果オブジェクトを作成
        return {
            ...skill,
            isNew: GameState.getSkillCount(skill.id) === 0
        };
    },

    // ========================================
    // スキルショップ
    // ========================================
    renderSkillShop() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        GAME_DATA.SKILLS.forEach(skill => {
            const ownedCount = GameState.getSkillCount(skill.id);
            const equippedCount = GameState.getEquippedSkillCount(skill.id);

            const canBuy = GameState.money >= skill.price;
            // 装備可能か: 所持数 > 装備数 かつ スロットに空きがある
            const canEquip = (ownedCount > equippedCount) &&
                (GameState.equippedSkills.length < GameState.getSkillSlots());
            const canUnequip = equippedCount > 0;

            const item = document.createElement('div');
            item.className = `shop-item ${equippedCount > 0 ? 'equipped' : ''} ${ownedCount === 0 && !canBuy ? 'locked' : ''}`;

            let actionHtml = '';

            // 購入ボタン (常時表示)
            actionHtml += `
                <div class="skill-actions">
                    <button class="btn btn-buy ${canBuy ? '' : 'disabled'}" 
                        onclick="ShopManager.buySkill('${skill.id}')" ${canBuy ? '' : 'disabled'}>
                        ¥${skill.price.toLocaleString()}
                    </button>
            `;

            // 装備/解除ボタン
            if (ownedCount > 0) {
                // 装備ボタン
                actionHtml += `
                    <button class="btn btn-equip ${canEquip ? '' : 'disabled'}" 
                        onclick="ShopManager.equipSkill('${skill.id}')" ${canEquip ? '' : 'disabled'}>
                        装備
                    </button>
                `;

                // 解除ボタン
                if (equippedCount > 0) {
                    actionHtml += `
                        <button class="btn btn-unequip" onclick="ShopManager.unequipSkill('${skill.id}')">
                            外す
                        </button>
                    `;
                }
            }

            actionHtml += '</div>';

            item.innerHTML = `
                <div class="item-info">
                    <div class="item-name">
                        ${skill.name} 
                        <span class="skill-count">x${ownedCount}</span>
                        ${equippedCount > 0 ? `<span class="equipped-badge">装備中:${equippedCount}</span>` : ''}
                    </div>
                    <div class="item-desc">${skill.description}</div>
                </div>
                <div class="item-action-container">
                    ${actionHtml}
                </div>
            `;

            container.appendChild(item);
        });

        // スキルスロット情報
        this.renderSkillSlotInfo();

        // サブタブを描画（最上部に挿入）
        this.renderSubTabs(container);
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
                ? '<p class="hint">釣り竿を強化して<span class="material-icons">star</span>を増やすとスキルが装備できます</p>'
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
            const newCount = GameState.getSkillCount(skillId);
            UIManager.showMessage(`${skill.name}を購入しました！(所持数: ${newCount})`);
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
            const count = GameState.getEquippedSkillCount(skillId);
            UIManager.showMessage(`${skill.name}を装備しました！(計${count}個)`);
            this.renderShop();
        } else {
            // 失敗理由を簡易表示 (スロット一杯など)
            if (GameState.equippedSkills.length >= GameState.getSkillSlots()) {
                UIManager.showMessage('スキルスロットが一杯です');
            } else {
                UIManager.showMessage('所持数が足りません');
            }
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
