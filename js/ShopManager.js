// ショップマネージャー
// 購入、売却、強化などのショップ機能を管理

const ShopManager = {
    // ========================================
    // ショップカテゴリ
    // ========================================
    currentCategory: 'rods',  // rods, skills, baits
    currentTab: 'skill',      // skill, gacha
    currentStyleTab: 'gear',  // gear, sky
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
    // スタイルタブ切り替え (Gear / Sky)
    // ========================================
    switchStyleTab(tab) {
        this.currentStyleTab = tab;
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
            case 'skins':
                if (this.currentStyleTab === 'sky') {
                    this.renderSkyShop(container);
                } else {
                    this.renderSkinShop(container);
                }
                // サブタブを描画（最上部に挿入）
                this.renderStyleTabs(container);
                break;
            case 'casino':
                this.renderCasino(container);
                break;
        }
    },

    // ========================================
    // スキン（着せ替え）ショップ
    // ========================================
    renderSkinShop(container) {
        container = container || document.getElementById('shop-items');
        container.innerHTML = '';

        GAME_DATA.SKINS.forEach(skin => {
            const isUnlocked = GameState.unlockedSkins.includes(skin.id);
            const isEquipped = GameState.selectedSkin === skin.id;

            const item = document.createElement('div');
            item.className = `shop-item ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;

            let actionHtml = '';

            if (isUnlocked) {
                if (isEquipped) {
                    actionHtml = '<span class="status equipped">装備中</span>';
                } else {
                    actionHtml = `
                        <button class="btn btn-equip" onclick="ShopManager.equipSkin('${skin.id}')">
                            装備
                        </button>
                    `;
                }
            } else {
                // ロック中（解放条件を表示）
                // ロッド名を取得
                // rodIdからロッド名を探す
                const rod = GAME_DATA.RODS.find(r => r.id === skin.rodId);
                const rodName = rod ? rod.name : 'Unknown Rod';
                actionHtml = `<span class="status locked-reason"><span class="material-icons" style="font-size:14px;vertical-align:middle;">lock</span> ${rodName}で解放</span>`;
            }

            item.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${skin.name}</div>
                    <div class="item-desc">${skin.description}</div>
                    <div class="item-stats" style="display:flex; gap:10px; align-items:center; margin-top:5px;">
                        <div style="display:flex; align-items:center; gap:4px;">
                            <span style="font-size:10px; color:#aaa;">ROD</span>
                            <span style="display:inline-block; width:16px; height:16px; background-color:${skin.rodColor}; border-radius:4px; border:1px solid #555;"></span>
                        </div>
                        <div style="display:flex; align-items:center; gap:4px;">
                            <span style="font-size:10px; color:#aaa;">BOBBER</span>
                            <span style="display:inline-block; width:12px; height:12px; background-color:${skin.bobberColor}; border-radius:50%; border:1px solid #555;"></span>
                        </div>
                    </div>
                </div>
                <div class="item-action">
                    ${actionHtml}
                </div>
            `;

            container.appendChild(item);
        });

        // プレビュー情報（アップグレードセクションを再利用して現在の装備を表示）
        this.renderSkinInfo();
    },

    // 現在のスキン情報
    renderSkinInfo() {
        const container = document.getElementById('upgrade-section');
        if (!container) return;

        const currentSkin = GameState.getCurrentSkin();

        container.innerHTML = `
            <h3>現在のスタイル</h3>
            <div class="skin-preview" style="display:flex; gap:20px; align-items:center; justify-content:center; padding:10px;">
                <div style="text-align:center;">
                    <div style="width:8px; height:60px; background-color:${currentSkin.rodColor}; margin:0 auto; border:1px solid rgba(255,255,255,0.3);"></div>
                    <span style="font-size:10px; display:block; margin-top:4px;">ROD</span>
                </div>
                <div style="text-align:center;">
                    <div style="width:20px; height:20px; background-color:${currentSkin.bobberColor}; border-radius:50%; margin:0 auto; border:2px solid white;"></div>
                    <span style="font-size:10px; display:block; margin-top:4px;">BOBBER</span>
                </div>
            </div>
            <div class="item-desc" style="text-align:center; margin-top:10px;">
                ${currentSkin.name}: ${currentSkin.description}
            </div>
        `;
    },

    // ========================================
    // 空（背景）ショップ
    // ========================================
    renderSkyShop(container) {
        container = container || document.getElementById('shop-items');
        container.innerHTML = '';

        GAME_DATA.SKIES.forEach(sky => {
            const isUnlocked = GameState.unlockedSkies.includes(sky.id);
            const isEquipped = GameState.selectedSky === sky.id;
            const canBuy = GameState.money >= sky.price;

            const item = document.createElement('div');
            item.className = `shop-item ${isEquipped ? 'equipped' : ''} ${!isUnlocked && !canBuy ? 'locked' : ''}`;

            // 背景プレビュー用のスタイル
            const gradient = `linear-gradient(180deg, ${sky.colors[0]} 0%, ${sky.colors[1]} 100%)`;

            let actionHtml = '';

            if (isUnlocked) {
                if (isEquipped) {
                    actionHtml = '<span class="status equipped">装備中</span>';
                } else {
                    actionHtml = `
                        <button class="btn btn-equip" onclick="ShopManager.equipSky('${sky.id}')">
                            装備
                        </button>
                    `;
                }
            } else {
                actionHtml = `
                    <button class="btn btn-buy ${canBuy ? '' : 'disabled'}" 
                        onclick="ShopManager.buySky('${sky.id}')" ${canBuy ? '' : 'disabled'}>
                        ¥${sky.price.toLocaleString()}
                    </button>
                `;
            }

            item.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${sky.name}</div>
                    <div class="item-desc">${sky.description}</div>
                    <div class="sky-preview" style="margin-top: 8px; width: 100%; height: 40px; background: ${gradient}; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);"></div>
                </div>
                <div class="item-action">
                    ${actionHtml}
                </div>
            `;

            container.appendChild(item);
        });

        // プレビュー情報（現在の空）
        this.renderSkyInfo();
    },

    // 現在の空情報
    renderSkyInfo() {
        const container = document.getElementById('upgrade-section');
        if (!container) return;

        const currentSky = GameState.getCurrentSky();
        const gradient = `linear-gradient(180deg, ${currentSky.colors[0]} 0%, ${currentSky.colors[1]} 100%)`;

        container.innerHTML = `
            <h3>現在の空</h3>
            <div class="sky-preview" style="margin: 10px auto; width: 80%; height: 60px; background: ${gradient}; border-radius: 12px; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.3);"></div>
            <div class="item-desc" style="text-align:center;">
                ${currentSky.name}: ${currentSky.description}
            </div>
        `;
    },

    // 空購入
    buySky(skyId) {
        const sky = GAME_DATA.SKIES.find(s => s.id === skyId);
        if (GameState.buySky(skyId)) {
            UIManager.showMessage(`${sky.name}を購入しました！`);
            this.renderShop(); // 再描画
            UIManager.updateMoney();
        } else {
            UIManager.showMessage('お金が足りません！');
        }
    },

    // 空装備
    equipSky(skyId) {
        const sky = GAME_DATA.SKIES.find(s => s.id === skyId);
        if (GameState.equipSky(skyId)) {
            UIManager.showMessage(`${sky.name}に変更しました！`);
            this.renderShop();
            UIManager.updateSkyVisuals(); // 背景即時更新
        }
    },

    // スキン装備
    equipSkin(skinId) {
        if (GameState.equipSkin(skinId)) {
            const skin = GAME_DATA.SKINS.find(s => s.id === skinId);
            UIManager.showMessage(`${skin.name}に着せ替えました！`);
            this.renderShop();

            // 待機画面のロッドも更新が必要（アイドル状態なら）
            if (UIManager.currentScreen === 'fishing') {
                UIManager.updateRodView('idle');
            }
        }
    },

    // ========================================
    // スタイルタブ描画 helper
    // ========================================
    renderStyleTabs(container) {
        const isGear = this.currentStyleTab === 'gear';
        // タブHTMLを生成
        const html = `
            <div class="shop-tabs sub-tabs" style="margin-bottom: 20px; border-bottom: none; justify-content: center;">
                <button class="shop-tab ${isGear ? 'active' : ''}" onclick="ShopManager.switchStyleTab('gear')">
                    <span class="material-icons">fishing</span> 道具
                </button>
                <button class="shop-tab ${!isGear ? 'active' : ''}" onclick="ShopManager.switchStyleTab('sky')">
                    <span class="material-icons">cloud</span> 空
                </button>
            </div>
        `;
        // containerの先頭に挿入
        container.innerHTML = html + container.innerHTML;
    },

    // ========================================
    // スキル/ガチャ タブ描画 helper
    // ========================================
    renderSubTabs(container) {
        const isSkill = this.currentTab === 'skill';
        const html = `
            <div class="shop-tabs sub-tabs" style="margin-bottom: 20px; border-bottom: none; justify-content: center;">
                <button class="shop-tab ${isSkill ? 'active' : ''}" onclick="ShopManager.switchTab('skill')">
                    <span class="material-icons">backpack</span> 所持スキル
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
    // ========================================
    // スキル一覧（所持スキル）
    // ========================================
    renderSkillShop() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        // 所持しているスキルのみ抽出して表示
        const ownedSkills = GAME_DATA.SKILLS.filter(skill => GameState.getSkillCount(skill.id) > 0);

        if (ownedSkills.length === 0) {
            container.innerHTML = `
                <div class="no-items-message" style="text-align:center; padding: 40px; color: #888;">
                    <span class="material-icons" style="font-size: 48px; margin-bottom: 10px;">backpack</span><br>
                    スキルを所持していません。<br>
                    ガチャでスキルを獲得しましょう！
                </div>
            `;
        } else {
            ownedSkills.forEach(skill => {
                const ownedCount = GameState.getSkillCount(skill.id);
                const equippedCount = GameState.getEquippedSkillCount(skill.id);

                // 装備可能か: 所持数 > 装備数 かつ スロットに空きがある
                const canEquip = (ownedCount > equippedCount) &&
                    (GameState.equippedSkills.length < GameState.getSkillSlots());

                const item = document.createElement('div');
                item.className = `shop-item ${equippedCount > 0 ? 'equipped' : ''}`;

                let actionHtml = '';

                // 装備ボタン
                actionHtml += `
                    <div class="skill-actions">
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

                actionHtml += '</div>';

                item.innerHTML = `
                    <div class="item-info">
                        <div class="item-name">
                            ${skill.name} 
                            <span class="skill-count">所持: ${ownedCount}</span>
                            ${equippedCount > 0 ? `<span class="equipped-badge">装備中:${equippedCount}</span>` : ''}
                        </div>
                        <div class="item-desc">${skill.description}</div>
                        <div class="item-tier">Tier ${skill.tier}</div>
                    </div>
                    <div class="item-action-container">
                        ${actionHtml}
                    </div>
                `;

                container.appendChild(item);
            });
        }

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
    // カジノ（チンチロリン）
    // ========================================
    renderCasino(container) {
        container = container || document.getElementById('shop-items');

        // 借金状態なら赤く表示
        const isDebt = GameState.hasDebt();
        const debtAmount = GameState.getDebt();

        // 借金返済のメッセージ
        let debtHtml = '';
        if (isDebt) {
            debtHtml = `<div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 8px; padding: 10px; margin-bottom: 20px; text-align: center; color: #fca5a5;">
                <span class="material-icons" style="vertical-align: middle;">warning</span> 
                現在借金中: <strong>-${debtAmount.toLocaleString()} G</strong>
            </div>`;
        }

        let html = `
            ${debtHtml}
            <div class="casino-header" style="text-align: center; margin-bottom: 20px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px;">
                <h3 style="margin-bottom: 10px; font-size: 1.5rem;">🎲 チンチロリン</h3>
                <div class="casino-rules" style="font-size: 0.8rem; color: #ccc; text-align: left; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px;">
                    <strong>ルール:</strong><br>
                    • <strong>4-5-6 (シゴロ)</strong>: 4倍勝ち<br>
                    • <strong>ゾロ目 / 相手が1-2-3</strong>: 3倍勝ち<br>
                    • <strong>通常勝ち</strong>: 2倍勝ち<br>
                    • <strong>1-2-3 (ヒフミ) / 相手がゾロ目</strong>: 没収 + 同額支払い (計2倍負け)<br>
                    • <strong>相手が4-5-6</strong>: 没収 + 2倍支払い (計3倍負け)<br>
                    <span style="color: #ef4444;">※支払い不能分は借金になります</span>
                </div>
            </div>

            <div class="casino-board" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <div class="bet-input-container" style="display: flex; gap: 10px; align-items: center;">
                    <span style="font-weight: bold;">賭け金:</span>
                    <input type="number" id="bet-amount" value="100" min="10" step="10" 
                        style="padding: 8px; border-radius: 4px; border: 1px solid #555; background: #333; color: white; width: 100px; text-align: right;">
                    <span>G</span>
                </div>
                
                <div class="casino-actions">
                    <button class="btn btn-buy" onclick="ShopManager.playCasino()" style="padding: 12px 32px; font-size: 1.2rem; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);">
                        勝負する！
                    </button>
                </div>
                
                <div id="casino-result" class="casino-result" style="width: 100%; min-height: 150px; display: none; flex-direction: column; items-align: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; text-align: center;">
                    <!-- 結果表示エリア -->
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    // カジノ実行
    async playCasino() {
        const input = document.getElementById('bet-amount');
        const bet = parseInt(input.value, 10);

        if (isNaN(bet) || bet <= 0) {
            UIManager.showMessage('賭け金を正しく入力してください');
            return;
        }

        if (GameState.money < bet) {
            UIManager.showMessage('賭け金が足りません！');
            return;
        }

        // ロジック実行（結果は即時確定するが、表示を遅延させる）
        const data = CasinoManager.playRound(bet);

        // 演出実行
        await this.runCasinoAnimation(data);

        // 最終的な所持金更新
        UIManager.updateMoney();

        // 借金発生時の演出など
        if (GameState.hasDebt()) {
            UIManager.showMessage('借金をしてしまった...');
        }

        // カジノ画面をリフレッシュ（借金表示更新のため）
        // ただし入力値が消えるので、結果表示後に少し待ってからの方がいいかも？
        // ここでは借金警告エリアだけ更新したいが、簡易的に全体リロードはしない
        // renderCasino内で借金表示を更新するロジックがあれば良いが、今回はshowMessageで代用
    },

    // アニメーション付き結果表示
    async runCasinoAnimation(data) {
        const resultArea = document.getElementById('casino-result');
        if (resultArea) {
            resultArea.style.display = 'flex';
            // resultArea.innerHTML = '<div style="font-size:1.2rem; color:#aaa;">勝負開始...</div>'; // 初期メッセージはボタン表示時に上書きされるので削除
        }

        // ヘルパー: 指定時間待機
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // ヘルパー: ロールボタン表示待機
        const waitForRoll = (label = 'サイコロを振る') => {
            return new Promise(resolve => {
                if (!resultArea) return resolve();

                // ボタン表示
                const btnId = 'casino-roll-btn';
                resultArea.innerHTML = `
                    <div style="margin-bottom: 20px; color: #fff;">準備完了！</div>
                    <button id="${btnId}" class="btn" style="padding: 15px 40px; font-size: 1.5rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4); animation: pulse 2s infinite;">
                        🎲 ${label}
                    </button>
                    ${!document.getElementById('anim-style-pulse') ? `
                    <style id="anim-style-pulse">
                        @keyframes pulse {
                            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                        }
                    </style>` : ''}
                `;

                document.getElementById(btnId).addEventListener('click', () => {
                    resolve();
                });
            });
        };

        // UI構築用ヘルパー
        const updateDisplay = (playerDice, playerHandText, dealerDice, dealerHandText, message) => {
            if (!resultArea) return;
            let html = '';

            // プレイヤー
            if (playerDice) {
                html += `
                    <div style="font-size: 1.2rem; margin-bottom: 20px; color: #fff;">
                        自分: <span style="font-weight:bold; font-size:1.5rem;">${playerHandText}</span>
                        <div class="dice-display">${this.getDiceIcons(playerDice)}</div>
                    </div>
                `;
            } else {
                html += `
                    <div style="font-size: 1.2rem; margin-bottom: 20px; color: #fff; opacity: 0.5;">
                        自分: ...
                    </div>
                `;
            }

            // ディーラー（データがある場合のみ枠を表示）
            if (dealerDice || dealerHandText !== '-') {
                html += `
                    <div style="font-size: 1.2rem; margin-bottom: 20px; color: #aaa;">
                        相手: <span style="font-weight:bold; font-size:1.5rem;">${dealerHandText}</span>
                        <div class="dice-display">${dealerDice ? this.getDiceIcons(dealerDice) : '???'}</div>
                    </div>
                `;
            }

            // メッセージ
            if (message) {
                html += `<div style="font-size: 1.5rem; font-weight: bold; color: #fbbf24;">${message}</div>`;
            }

            resultArea.innerHTML = html;
        };

        // ----------------------------------------
        // プレイヤーのターン演出
        // ----------------------------------------
        let lastPlayerDice = null;
        let lastPlayerHandText = '...';

        for (let i = 0; i < data.playerHistory.length; i++) {
            const turn = data.playerHistory[i];
            const isLast = i === data.playerHistory.length - 1;

            // ロールボタン待機 (初回または再挑戦時)
            // 状況を表示した上でボタンを出す必要があるが、単純化のためボタンのみ表示 -> クリック -> Rolling -> 結果
            // 2回目以降は前回の結果を表示しつつボタンを出したい

            if (i > 0) {
                // 再挑戦の場合
                // 前回の結果を表示したままボタンを追加するのはupdateDisplayの構造上難しいので、
                // 簡易的にボタン画面に切り替える（ただし本来はリトライ感を出したい）
                // ここではシンプルに「目なし... 再挑戦！」の表示の後にボタンを出す
                await waitForRoll('再挑戦！(振る)');
            } else {
                // 初回
                await waitForRoll('サイコロを振る');
            }

            // サイコロを振る演出
            updateDisplay(lastPlayerDice, lastPlayerHandText, null, '-', 'Rolling...');
            await sleep(600); // 演出時間

            lastPlayerDice = turn.dice;
            lastPlayerHandText = turn.hand.text;

            // 結果表示
            const msg = turn.hand.type === 'menashi' ? (isLast ? '目なし...' : '目なし... 再挑戦！') : turn.hand.text + '！';
            updateDisplay(lastPlayerDice, lastPlayerHandText, null, '-', msg);

            // 次のロールがある場合、少し待ってからループ先頭でボタン表示へ
            if (!isLast) await sleep(1000);
            else await sleep(1000);
        }

        // プレイヤーの結果で即決着がついた場合
        const playerWinDirect = data.playerHand.type === '456';
        const playerLoseDirect = data.playerHand.type === '123';

        if (playerWinDirect || playerLoseDirect) {
            this.showFinalResult(data, resultArea);
            return;
        }

        // ----------------------------------------
        // ディーラーのターン演出
        // ----------------------------------------
        // 相手のターンはボタン待ちなし（自動）
        updateDisplay(lastPlayerDice, lastPlayerHandText, null, 'Rolling...', '相手の番です...');
        await sleep(1000);

        let lastDealerDice = null;
        let lastDealerHandText = '...';

        for (let i = 0; i < data.dealerHistory.length; i++) {
            const turn = data.dealerHistory[i];
            const isLast = i === data.dealerHistory.length - 1;

            // サイコロを振る演出
            updateDisplay(lastPlayerDice, lastPlayerHandText, null, 'Rolling...', '相手が振っています...');
            await sleep(600);

            lastDealerDice = turn.dice;
            lastDealerHandText = turn.hand.text;

            // 結果表示
            const msg = turn.hand.type === 'menashi' ? (isLast ? '相手: 目なし...' : '相手: 目なし... 再挑戦') : '相手: ' + turn.hand.text + '！';
            updateDisplay(lastPlayerDice, lastPlayerHandText, lastDealerDice, lastDealerHandText, msg);
            await sleep(1000);
        }

        // ----------------------------------------
        // 最終結果表示
        // ----------------------------------------
        this.showFinalResult(data, resultArea);
    },

    // 最終リザルト表示（既存のrenderCasinoResultを流用・改修）
    showFinalResult(data, resultArea) {
        const resultColor = data.profit > 0 ? '#22c55e' : (data.profit < 0 ? '#ef4444' : '#94a3b8');
        const resultText = data.result === 'win' ? 'WIN!' : (data.result === 'lose' ? 'LOSE...' : 'DRAW');

        let html = `
            <div style="font-size: 1.2rem; margin-bottom: 10px; color: #fff;">
                自分: <span style="font-weight:bold; font-size:1.5rem;">${data.playerHand.text}</span> 
                <span class="dice-display">${this.getDiceIcons(data.playerDice)}</span>
            </div>
        `;

        // 相手の手を表示すべきか（即決着以外）
        // 簡略化: dealerHistoryが存在すれば表示
        if (data.dealerHistory && data.dealerHistory.length > 0) {
            html += `
                <div style="font-size: 1.2rem; margin-bottom: 20px; color: #aaa;">
                    相手: <span style="font-weight:bold; font-size:1.5rem;">${data.dealerHand.text}</span>
                    <span class="dice-display">${this.getDiceIcons(data.dealerDice)}</span>
                </div>
            `;
        }

        html += `
            <div class="result-outcome" style="font-size: 2.5rem; font-weight: bold; color: ${resultColor}; text-shadow: 0 0 10px ${resultColor}; margin: 10px 0; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                ${resultText}
            </div>
            <div class="result-reason" style="font-size: 1rem; color: #ccc; margin-bottom: 10px;">
                ${data.reason}
            </div>
            <div class="result-profit" style="font-size: 1.5rem; font-weight: bold; color: ${resultColor};">
                ${data.profit > 0 ? '+' : ''}${data.profit.toLocaleString()} G
            </div>
        `;

        resultArea.innerHTML = html;

        // スタイル追加 (popInアニメーション)
        if (!document.getElementById('anim-style-pop')) {
            const style = document.createElement('style');
            style.id = 'anim-style-pop';
            style.innerHTML = `
                @keyframes popIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .dice-display { display: inline-block; vertical-align: middle; margin-left: 10px; }
            `;
            document.head.appendChild(style);
        }
    },

    // (Old method, can be removed or left as alias logic if needed, but runCasinoAnimation replaces it)
    renderCasinoResult(data) {
        // Alias to showFinalResult for compatibility if called directly
        const resultArea = document.getElementById('casino-result');
        if (resultArea) this.showFinalResult(data, resultArea);
    },

    getDiceIcons(dice) {
        const unicodeDice = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        return dice.map(d => `<span style="font-size: 2rem; margin: 0 2px;">${unicodeDice[d - 1]}</span>`).join('');
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
