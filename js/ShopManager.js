// ショップマネージャー
// 購入、売却、強化などのショップ機能を管理

const ShopManager = {
    // ========================================
    // ショップカテゴリ
    // ========================================
    currentCategory: 'town', // デフォルトを町(town)に変更
    currentTab: 'skill',
    currentStyleTab: 'gear',
    recycleSelectedSkills: [],

    // ========================================
    // カテゴリ切り替え
    // ========================================
    setCategory(category) {
        this.currentCategory = category;

        if (category === 'casino') {
            UIManager.showScreen('casino');
            CasinoManager.render();
        } else {
            UIManager.showScreen('shop');
            this.renderShop();

            // 初心者ミッション判定: 街へ行く
            if (category === 'town') {
                MissionManager.checkMission('go_town');
            }
        }
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
        const container = document.getElementById('shop-items');
        const tabContainer = document.getElementById('shop-tabs-container');
        const townMenu = document.getElementById('town-menu');
        const upgradeSection = document.getElementById('upgrade-section');
        const title = document.getElementById('shop-main-title');

        // 表示のリセット
        container.innerHTML = '';
        if (tabContainer) tabContainer.innerHTML = '';
        if (townMenu) townMenu.classList.add('hidden');
        if (upgradeSection) upgradeSection.classList.add('hidden');

        if (this.currentCategory === 'town') {
            title.innerHTML = '<span class="material-icons">location_city</span> フィッシング・タウン';
            this.renderTownMenu();
        } else {
            if (upgradeSection) upgradeSection.classList.remove('hidden');

            switch (this.currentCategory) {
                case 'rods':
                    title.innerHTML = '<span class="material-icons">phishing</span> ロッド工房 匠';
                    this.renderRodShop();
                    break;
                case 'skills':
                    title.innerHTML = '<span class="material-icons">bolt</span> 冒険者の道場';
                    if (this.currentTab === 'skill') {
                        this.renderSkillShop();
                    } else if (this.currentTab === 'gacha') {
                        this.renderGachaShop(container);
                    }
                    break;
                case 'baits':
                    title.innerHTML = '<span class="material-icons">grass</span> 万屋 タックル';
                    this.renderBaitShop();
                    break;
                case 'skins':
                    title.innerHTML = '<span class="material-icons">palette</span> スタイリスト';
                    if (this.currentStyleTab === 'sky') {
                        this.renderSkyShop(container);
                    } else {
                        this.renderSkinShop(container);
                    }
                    this.renderStyleTabs(tabContainer); // Use tabContainer
                    break;
                // 'casino' case is removed as it's handled in setCategory now
            }
        }
        this.updateFooter();
    },

    // 町のメニューを描画
    renderTownMenu() {
        const townMenu = document.getElementById('town-menu');
        if (!townMenu) return;

        townMenu.classList.remove('hidden');
        townMenu.innerHTML = `
            <div class="shop-building rods" onclick="ShopManager.setCategory('rods')">
                <div class="building-icon"><span class="material-icons">phishing</span></div>
                <div class="building-info">
                    <div class="building-name">ロッド工房 匠</div>
                    <div class="building-desc">竿の購入・星強化を行えます</div>
                </div>
            </div>
            <div class="shop-building skills" onclick="ShopManager.setCategory('skills')">
                <div class="building-icon"><span class="material-icons">bolt</span></div>
                <div class="building-info">
                    <div class="building-name">冒険者の道場</div>
                    <div class="building-desc">スキルの習得・装備</div>
                </div>
            </div>
            <div class="shop-building baits" onclick="ShopManager.setCategory('baits')">
                <div class="building-icon"><span class="material-icons">grass</span></div>
                <div class="building-info">
                    <div class="building-name">万屋 タックル</div>
                    <div class="building-desc">各種ランクの餌を取り扱っています</div>
                </div>
            </div>
             <div class="shop-building styles" onclick="ShopManager.setCategory('skins')" style="border-color: var(--accent-color);">
                <div class="building-icon" style="color: var(--accent-color);"><span class="material-icons">palette</span></div>
                <div class="building-info">
                    <div class="building-name">スタイリスト</div>
                    <div class="building-desc">見た目の変更・空の変更</div>
                </div>
            </div>
             <div class="shop-building casino" onclick="ShopManager.setCategory('casino')">
                <div class="building-icon"><span class="material-icons">stars</span></div>
                <div class="building-info">
                    <div class="building-name">グランド・カジノ</div>
                    <div class="building-desc">運試しとスキルリサイクル</div>
                </div>
            </div>
        `;
    },

    // フッターボタンを状況に応じて更新
    updateFooter() {
        const footerActions = document.getElementById('shop-footer-actions');
        if (!footerActions) return;

        if (this.currentCategory === 'town') {
            footerActions.innerHTML = `
                <button id="sell-btn" class="btn-action" onclick="ShopManager.sellAllFish()">
                    <span class="material-icons">sell</span> 魚を全て売却
                </button>
                <button id="encyclopedia-btn" class="btn-action" onclick="UIManager.showScreen('encyclopedia')">
                    <span class="material-icons">menu_book</span> 図鑑
                </button>
                <button id="back-btn" class="btn-nav" onclick="UIManager.showScreen('fishing')">
                    <span class="material-icons">phishing</span> 釣り場へ
                </button>
            `;
        } else {
            footerActions.innerHTML = `
                <button class="btn-nav" style="flex: 1;" onclick="ShopManager.setCategory('town')">
                    <span class="material-icons">arrow_back</span> 町に戻る
                </button>
            `;
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
                if (sky.isGachaExclusive) {
                    actionHtml = `
                        <button class="btn disabled" disabled>
                            ガチャ限定
                        </button>
                    `;
                } else {
                    actionHtml = `
                        <button class="btn btn-buy ${canBuy ? '' : 'disabled'}" 
                            onclick="ShopManager.buySky('${sky.id}')" ${canBuy ? '' : 'disabled'}>
                            ¥${sky.price.toLocaleString()}
                        </button>
                    `;
                }
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
        let target = container || document.getElementById('shop-tabs-container');
        let usePrepend = false;

        // フォールバック: 専用コンテナがない場合は shop-items を使用
        if (!target) {
            target = document.getElementById('shop-items');
            usePrepend = true;
        }

        if (!target) return;

        const isGear = this.currentStyleTab === 'gear';

        const html = `
            <div class="shop-tabs sub-tabs">
                <button class="shop-tab ${isGear ? 'active' : ''}" onclick="ShopManager.switchStyleTab('gear')">
                    <span class="material-icons">phishing</span> 道具
                </button>
                <button class="shop-tab ${!isGear ? 'active' : ''}" onclick="ShopManager.switchStyleTab('sky')">
                    <span class="material-icons">cloud</span> 空
                </button>
            </div>
        `;

        if (usePrepend) {
            // 既存のコンテンツを保持して先頭に追加
            const div = document.createElement('div');
            div.innerHTML = html;
            target.prepend(div.firstElementChild);
        } else {
            // 専用コンテナなら中身を書き換え
            target.innerHTML = html;
        }
    },

    // ========================================
    // スキル/ガチャ タブ描画 helper
    // ========================================
    renderSubTabs(container) {
        let target = container || document.getElementById('shop-tabs-container');
        let usePrepend = false;

        if (!target) {
            target = document.getElementById('shop-items');
            usePrepend = true;
        }

        if (!target) return;

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

        if (usePrepend) {
            const div = document.createElement('div');
            div.innerHTML = html;
            target.prepend(div.firstElementChild);
        } else {
            target.innerHTML = html;
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

        // サブタブを描画
        this.renderSubTabs();
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
        UIManager.showGachaResult([result], () => {
            ShopManager.renderShop(); // リサイクルはショップ画面内
        });
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
        const resCheck = GameState.canDrawGacha(cost, count);

        if (!resCheck.can) {
            UIManager.showMessage('リソースが足りません！');
            return;
        }

        // コイン消費の場合は確認を出す
        if (resCheck.method === 'money') {
            const confirmed = confirm(`チケットがありません。${cost.toLocaleString()} G を消費してガチャを引きますか？`);
            if (!confirmed) return;
        }

        // 抽選実行 (リソース消費の前に抽選を行い、結果を演出に渡す)
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.lottery(config.rates));
        }

        // リソース消費
        GameState.consumeGachaResources(cost, count);
        UIManager.updateStatus(); // お金・チケット表示更新

        // ガチャ専用画面へ切り替え
        UIManager.showScreen('gacha');

        // ガチャ演出開始
        UIManager.startGachaPerformance(results, () => {
            // 演出完了後の処理は UIManager 内で完結させるが、
            // もしショップの更新が必要ならここで行う
            this.renderShop();
        });
    },

    // ========================================
    // Tierに応じたスキル選出
    // ========================================
    pickSkillByTier(tier) {
        let targetTier = 1;
        if (tier === 'tier2') targetTier = 2;
        if (tier === 'tier3') targetTier = 3;
        if (tier === 'special' || tier === 'tier4') targetTier = 3; // Special/Tier4は現状Tier3相当

        const limitedSkillIds = [
            'nibble_fix',
            'sun_blessing',
            'moon_blessing',
            'perfect_master_1'
        ];

        // 該当Tierのスキルを抽出 (限定スキルは除外)
        const candidates = GAME_DATA.SKILLS.filter(s => s.tier === targetTier && !limitedSkillIds.includes(s.id));

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

        // サブタブを描画
        this.renderSubTabs();
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

        GAME_DATA.BAITS.filter(b => b.id !== 'bait_d').forEach(bait => {
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

        const baitCount = GameState.getCurrentBaitCount();
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

            // 初心者ミッション判定: スキルを装備する
            MissionManager.checkMission('equip_skill');
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

            // 初心者ミッション判定: 餌を買う
            MissionManager.checkMission('buy_bait');
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
