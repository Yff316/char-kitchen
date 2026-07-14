window.RochePlugin.register({
  id: "char-kitchen",
  name: "给 Char 炒菜的厨房",
  version: "1.0.0",
  apps: [
    {
      id: "char-kitchen-home",
      name: "Char 的厨房",
      icon: "restaurant",
      iconImage: "",

      async mount(container, roche) {
        // ============== 常量：食材库 ==============
        const INGREDIENTS = {
          "水果": ["🍑","🍊","🍅","🍎","🍏","🍓","🍒","🍈","🍐","🍋","🍍","🥭","🍌","🍉","🍇","🥥","🥝"],
          "蔬菜": ["🥑","🥬","🥒","🍆","🥦","🥕","🥔","🌽","🍠","🌰","🥜","🍄","🌶️","🥫"],
          "主食": ["🍱","🍥","🥮","🍳","🍔","🥯","🍕","🥞","🌮","🥖","🌭","🥐","🥪","🍟","🌯","🥗","🍲","🥘","🥙","🥟","🥠","🍝","🍜","🍚","🍘","🍙","🍞"],
          "肉类": ["🍗","🍖","🥩","🥓","🍢","🍡","🍤"],
          "甜点": ["🍰","🎂","🍩","🍪","🍮","🍬","🍭","🍫","🍦","🍨","🍧","🧁"],
          "饮品": ["🍺","🍻","🍶","🍷","🍾","🥂","🥃","🍹","🍸","🥤","🍵","🥛","🍼"],
          "调料": ["🍯","🧀","🧂","🥨","🍿","🦴","💊"]
        };

        // 食材属性表（用于自动识别口感/味道/功能）
        const EMOJI_META = {
          "🍑":{taste:"甜",texture:"多汁",vibe:"温柔"},"🍊":{taste:"酸甜",texture:"多汁",vibe:"清爽"},
          "🍅":{taste:"酸",texture:"多汁",vibe:"鲜"},"🍎":{taste:"甜脆",texture:"脆",vibe:"经典"},
          "🍓":{taste:"甜",texture:"软糯",vibe:"少女"},"🍋":{taste:"酸",texture:"多汁",vibe:"提神"},
          "🥑":{taste:"清淡",texture:"绵密",vibe:"健康"},"🌶️":{taste:"辣",texture:"脆",vibe:"刺激"},
          "🥕":{taste:"清甜",texture:"脆",vibe:"营养"},"🥩":{taste:"咸鲜",texture:"扎实",vibe:"豪华"},
          "🍗":{taste:"咸香",texture:"多汁",vibe:"满足"},"🍰":{taste:"甜",texture:"松软",vibe:"甜蜜"},
          "🍫":{taste:"甜苦",texture:"丝滑",vibe:"浪漫"},"🍵":{taste:"清苦",texture:"温润",vibe:"平静"},
          "🌶️":{taste:"辣",texture:"脆",vibe:"火热"},"🧂":{taste:"咸",texture:"颗粒",vibe:"基础"},
          "🍯":{taste:"甜",texture:"粘稠",vibe:"温暖"},"💊":{taste:"苦",texture:"硬",vibe:"神秘"}
        };

        // ============== 样式 ==============
        const style = document.createElement("style");
        style.setAttribute("data-plugin", "char-kitchen");
        style.textContent = `
          .roche-plugin-kitchen{padding:16px;font-family:system-ui,sans-serif;color:#333;}
          .roche-plugin-kitchen h2{margin:8px 0;font-size:18px;}
          .rpk-tabs{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;}
          .rpk-tabs button{padding:6px 12px;border:1px solid #ddd;background:#fff;border-radius:16px;cursor:pointer;}
          .rpk-tabs button.active{background:#ffb;border-color:#e90;}
          .rpk-cat{margin-bottom:10px;}
          .rpk-cat-title{font-weight:bold;margin:6px 0;color:#666;font-size:13px;}
          .rpk-emoji-grid{display:flex;flex-wrap:wrap;gap:4px;}
          .rpk-emoji{font-size:24px;padding:6px;border-radius:8px;cursor:pointer;user-select:none;transition:.2s;}
          .rpk-emoji:hover{background:#f0f0f0;}
          .rpk-emoji.picked{background:#ffe6a0;transform:scale(1.15);}
          .rpk-pan{margin:12px 0;padding:12px;border:2px dashed #e90;border-radius:12px;min-height:50px;background:#fffdf5;}
          .rpk-pan-title{font-size:12px;color:#999;margin-bottom:4px;}
          .rpk-pan-content{font-size:28px;letter-spacing:4px;}
          .rpk-btn{padding:8px 16px;border:none;background:#e90;color:#fff;border-radius:8px;cursor:pointer;margin-right:8px;margin-top:4px;}
          .rpk-btn.ghost{background:#fff;color:#e90;border:1px solid #e90;}
          .rpk-btn:disabled{opacity:.4;cursor:not-allowed;}
          .rpk-dish{padding:12px;border:1px solid #eee;border-radius:10px;margin-bottom:8px;background:#fff;}
          .rpk-dish-emoji{font-size:32px;}
          .rpk-dish-name{font-weight:bold;font-size:15px;margin:4px 0;}
          .rpk-tag{display:inline-block;background:#f5f5f5;padding:2px 8px;border-radius:10px;font-size:12px;margin:2px 4px 2px 0;color:#666;}
          .rpk-input,.rpk-textarea{width:100%;padding:6px;border:1px solid #ddd;border-radius:6px;box-sizing:border-box;margin:4px 0;font-family:inherit;}
          .rpk-textarea{min-height:60px;resize:vertical;}
          .rpk-char-card{padding:10px;border:1px solid #eee;border-radius:8px;cursor:pointer;margin-bottom:6px;display:flex;align-items:center;gap:10px;}
          .rpk-char-card:hover{background:#f9f9f9;}
          .rpk-avatar{width:40px;height:40px;border-radius:50%;background:#ddd;object-fit:cover;}
          .rpk-empty{color:#aaa;text-align:center;padding:20px;}
          .rpk-feed{padding:10px;border-left:3px solid #e90;background:#fffdf5;margin-bottom:8px;border-radius:0 6px 6px 0;}
          .rpk-feed-meta{font-size:11px;color:#999;}
          .rpk-header{display:flex;justify-content:space-between;align-items:center;}
        `;
        document.head.appendChild(style);

        // ============== 状态 ==============
        let currentTab = "kitchen"; // kitchen | recipes | feed | memory | custom
        let picked = []; // 当前锅里的 emoji
        let customIngredients = (await roche.storage.get("customIngredients")) || [];

        // 数据库 1：菜谱簿
        // 结构: { id, name, emojis:[], desc, taste, texture, vibe, effect, appearance, createdAt }
        let recipes = (await roche.storage.get("recipes")) || [];

        // 数据库 2：投喂记忆
        // 结构: { id, charId, charName, dishId, dishName, dishEmojis, reaction, comment, choice, createdAt }
        let feedRecords = (await roche.storage.get("feedRecords")) || [];

        // ============== 主渲染 ==============
        container.innerHTML = `<div class="roche-plugin-kitchen"></div>`;
        const root = container.querySelector(".roche-plugin-kitchen");

        function render() {
          root.innerHTML = `
            <div class="rpk-header">
              <h2>🍳 Char 的厨房</h2>
              <button class="rpk-btn ghost" id="rpk-close">关闭</button>
            </div>
            <div class="rpk-tabs">
              <button data-tab="kitchen" class="${currentTab==="kitchen"?"active":""}">🔪 料理台</button>
              <button data-tab="recipes" class="${currentTab==="recipes"?"active":""}">📖 菜谱簿(${recipes.length})</button>
              <button data-tab="feed" class="${currentTab==="feed"?"active":""}">🥄 投喂 Char</button>
              <button data-tab="memory" class="${currentTab==="memory"?"active":""}">💭 投喂记忆(${feedRecords.length})</button>
              <button data-tab="custom" class="${currentTab==="custom"?"active":""}">🖼 自定义食材</button>
            </div>
            <div id="rpk-body"></div>
          `;
          root.querySelector("#rpk-close").onclick = () => roche.ui.closeApp();
          root.querySelectorAll(".rpk-tabs button[data-tab]").forEach(b => {
            b.onclick = () => { currentTab = b.dataset.tab; render(); };
          });
          const body = root.querySelector("#rpk-body");
          if (currentTab === "kitchen") renderKitchen(body);
          if (currentTab === "recipes") renderRecipes(body);
          if (currentTab === "feed") renderFeed(body);
          if (currentTab === "memory") renderMemory(body);
          if (currentTab === "custom") renderCustom(body);
        }

        // ============== Tab: 料理台 ==============
        function renderKitchen(body) {
          const cats = Object.entries(INGREDIENTS).map(([cat, list]) => `
            <div class="rpk-cat">
              <div class="rpk-cat-title">${cat}</div>
              <div class="rpk-emoji-grid">
                ${list.map(e => `<span class="rpk-emoji ${picked.includes(e)?"picked":""}" data-e="${e}">${e}</span>`).join("")}
              </div>
            </div>
          `).join("");

          const customBlock = customIngredients.length ? `
            <div class="rpk-cat">
              <div class="rpk-cat-title">自定义食材</div>
              <div class="rpk-emoji-grid">
                ${customIngredients.map(c => `<span class="rpk-emoji ${picked.includes("::"+c.id)?"picked":""}" data-custom="${c.id}" title="${c.name}">🖼️</span>`).join("")}
              </div>
            </div>
          ` : "";

          body.innerHTML = `
            ${cats}${customBlock}
            <div class="rpk-pan">
              <div class="rpk-pan-title">🍳 锅里：（点上方 emoji 加入，可多选）</div>
              <div class="rpk-pan-content">${picked.map(p => p.startsWith("::") ? "🖼️" : p).join(" ") || "<span style='font-size:14px;color:#bbb'>还是空的...</span>"}</div>
            </div>
            <button class="rpk-btn" id="rpk-cook" ${picked.length===0?"disabled":""}>🔥 开炒！</button>
            <button class="rpk-btn ghost" id="rpk-clear" ${picked.length===0?"disabled":""}>清空锅</button>
          `;

          body.querySelectorAll(".rpk-emoji[data-e]").forEach(el => {
            el.onclick = () => {
              const e = el.dataset.e;
              const i = picked.indexOf(e);
              if (i >= 0) picked.splice(i, 1); else picked.push(e);
              render();
            };
          });
          body.querySelectorAll(".rpk-emoji[data-custom]").forEach(el => {
            el.onclick = () => {
              const key = "::" + el.dataset.custom;
              const i = picked.indexOf(key);
              if (i >= 0) picked.splice(i, 1); else picked.push(key);
              render();
            };
          });
          body.querySelector("#rpk-clear").onclick = () => { picked = []; render(); };
          body.querySelector("#rpk-cook").onclick = cookDish;
        }

        // ============== 合成菜 ==============
        async function cookDish() {
          if (!picked.length) return;
          const emojis = [...picked];
          // 收集属性
          const tastes = new Set(), textures = new Set(), vibes = new Set();
          const parts = [];
          emojis.forEach(e => {
            if (e.startsWith("::")) {
              const c = customIngredients.find(x => x.id === e.slice(2));
              if (c) { parts.push(c.name + "(" + (c.desc||"") + ")"); }
            } else {
              parts.push(e);
              const m = EMOJI_META[e];
              if (m) { tastes.add(m.taste); textures.add(m.texture); vibes.add(m.vibe); }
            }
          });

          roche.ui.toast("🔥 正在颠勺...");

          // 让 AI 给菜命名与识别
          let name = "神秘料理";
          let desc = "";
          let effect = "";
          let appearance = "";
          try {
            const res = await roche.ai.chat({
              messages: [
                { role: "system", content: "你是一个会取名的厨师，请根据食材给一道菜起中文名并简短描述口感、味道、功能、卖相。只用 JSON 输出：{\"name\":\"\",\"desc\":\"\",\"effect\":\"\",\"appearance\":\"\"}" },
                { role: "user", content: `食材：${parts.join("、")}。请起菜名并输出 JSON。` }
              ],
              temperature: 0.9
            });
            const text = (res.text || "").trim();
            const m = text.match(/\{[\s\S]*\}/);
            if (m) {
              const j = JSON.parse(m[0]);
              name = j.name || name;
              desc = j.desc || "";
              effect = j.effect || "";
              appearance = j.appearance || "";
            }
          } catch (e) {
            // AI 不可用时兜底
            name = emojis.filter(x=>!x.startsWith("::")).slice(0,3).join("") + "什锦";
            desc = "一道由 " + parts.join("、") + " 混合而成的料理。";
          }

          const dish = {
            id: crypto.randomUUID(),
            name,
            emojis,
            desc,
            taste: [...tastes].join("/") || "未知",
            texture: [...textures].join("/") || "未知",
            vibe: [...vibes].join("/") || "神秘",
            effect,
            appearance,
            createdAt: Date.now()
          };
          recipes.unshift(dish);
          await roche.storage.set("recipes", recipes);
          picked = [];
          roche.ui.toast(`✅ 合成成功：${name}`);
          currentTab = "recipes";
          render();
        }

        // ============== Tab: 菜谱簿 ==============
        function renderRecipes(body) {
          if (!recipes.length) { body.innerHTML = `<div class="rpk-empty">还没有菜谱，去料理台炒一道吧～</div>`; return; }
          body.innerHTML = recipes.map(r => `
            <div class="rpk-dish" data-id="${r.id}">
              <div class="rpk-dish-emoji">${r.emojis.map(e=>e.startsWith("::")?"🖼️":e).join(" ")}</div>
              <div class="rpk-dish-name">${r.name}</div>
              <div style="font-size:13px;color:#666;">${r.desc}</div>
              <div style="margin-top:6px;">
                <span class="rpk-tag">味道:${r.taste}</span>
                <span class="rpk-tag">口感:${r.texture}</span>
                <span class="rpk-tag">氛围:${r.vibe}</span>
              </div>
              ${r.effect?`<div style="font-size:12px;color:#888;margin-top:4px;">✨ 功效：${r.effect}</div>`:""}
              ${r.appearance?`<div style="font-size:12px;color:#888;">🎨 卖相：${r.appearance}</div>`:""}
              <div style="margin-top:8px;">
                <button class="rpk-btn" data-act="feed" data-id="${r.id}">🥄 投喂</button>
                <button class="rpk-btn ghost" data-act="del" data-id="${r.id}">删除</button>
              </div>
            </div>
          `).join("");
          body.querySelectorAll("button[data-act]").forEach(b => {
            b.onclick = async () => {
              const id = b.dataset.id;
              if (b.dataset.act === "del") {
                const ok = await roche.ui.confirm({ title:"删除菜谱", message:"确定要删除吗？" });
                if (!ok) return;
                recipes = recipes.filter(x => x.id !== id);
                await roche.storage.set("recipes", recipes);
                render();
              } else if (b.dataset.act === "feed") {
                pendingFeedDishId = id;
                currentTab = "feed";
                render();
              }
            };
          });
        }

        // ============== Tab: 投喂 ==============
        let pendingFeedDishId = null;
        async function renderFeed(body) {
          body.innerHTML = `<div class="rpk-empty">读取角色中...</div>`;
          let chars = [];
          try { chars = await roche.character.list(); } catch(e){}
          const dish = recipes.find(r => r.id === pendingFeedDishId);

          body.innerHTML = `
            ${dish ? `
              <div class="rpk-dish">
                <div class="rpk-dish-emoji">${dish.emojis.map(e=>e.startsWith("::")?"🖼️":e).join(" ")}</div>
                <div class="rpk-dish-name">🥄 准备投喂：${dish.name}</div>
              </div>
            ` : `<div class="rpk-empty">请先在「菜谱簿」选择一道菜点【投喂】</div>`}
            <h2 style="margin-top:12px;">选择一位 Char：</h2>
            ${chars.length ? chars.map(c => `
              <div class="rpk-char-card" data-cid="${c.id}">
                ${c.avatar?`<img class="rpk-avatar" src="${c.avatar}">`:`<div class="rpk-avatar"></div>`}
                <div>
                  <div style="font-weight:bold;">${c.handle || c.name || "无名"}</div>
                  <div style="font-size:12px;color:#888;">${c.bio||""}</div>
                </div>
              </div>
            `).join("") : `<div class="rpk-empty">还没有 Char，先在 Roche 里创建角色吧</div>`}
          `;
          body.querySelectorAll(".rpk-char-card").forEach(card => {
            card.onclick = () => {
              if (!dish) { roche.ui.toast("请先选择菜谱"); return; }
              const c = chars.find(x => x.id === card.dataset.cid);
              feedToChar(dish, c);
            };
          });
        }

        async function feedToChar(dish, char) {
          roche.ui.toast(`把 ${dish.name} 递给 ${char.handle||char.name}...`);
          const personaText = char.persona || char.bio || "";
          let reply = "";
          let choice = "吃";
          try {
            const res = await roche.ai.chat({
              messages: [
                { role: "system", content: `你现在扮演角色「${char.name||char.handle}」。人设：${personaText}\n用户 user 端了一道菜给你。请从「吃 / 不吃 / 只尝一口 / 打翻 / 珍藏起来 / 其他反应」里挑一种真实反应，并写一段角色化的评价（口感、味道、心情、对 user 的回应）。请用 JSON 输出：{\"choice\":\"\",\"comment\":\"\"}` },
                { role: "user", content: `菜名：${dish.name}\n食材/描述：${dish.desc}\n味道：${dish.taste}｜口感：${dish.texture}｜氛围：${dish.vibe}\n${dish.effect?"功效："+dish.effect:""}` }
              ],
              temperature: 1.0
            });
            const text = (res.text||"").trim();
            const m = text.match(/\{[\s\S]*\}/);
            if (m) { const j = JSON.parse(m[0]); choice = j.choice||choice; reply = j.comment||text; }
            else reply = text;
          } catch(e) {
            reply = "（AI 未响应，Char 沉默地看着这道菜）";
          }

          const record = {
            id: crypto.randomUUID(),
            charId: char.id,
            charName: char.handle || char.name,
            dishId: dish.id,
            dishName: dish.name,
            dishEmojis: dish.emojis,
            reaction: reply,
            choice,
            createdAt: Date.now()
          };
          feedRecords.unshift(record);
          await roche.storage.set("feedRecords", feedRecords);

          await roche.ui.confirm({
            title: `${char.handle||char.name} 的反应：${choice}`,
            message: reply
          });

          pendingFeedDishId = null;
          currentTab = "memory";
          render();
        }

        // ============== Tab: 投喂记忆 ==============
        function renderMemory(body) {
          if (!feedRecords.length) { body.innerHTML = `<div class="rpk-empty">还没有投喂记录～</div>`; return; }
          // 按 char 分组
          const groups = {};
          feedRecords.forEach(r => {
            (groups[r.charName] = groups[r.charName] || []).push(r);
          });
          body.innerHTML = Object.entries(groups).map(([name, list]) => `
            <div style="margin-bottom:16px;">
              <h2>👤 ${name} <span style="font-size:12px;color:#999;">（共 ${list.length} 次）</span>
                <button class="rpk-btn ghost" data-sum="${name}" style="font-size:12px;padding:4px 10px;">📝 总结记忆</button>
                <button class="rpk-btn ghost" data-write="${name}" data-cid="${list[0].charId}" style="font-size:12px;padding:4px 10px;">💾 写入 Roche 主记忆</button>
              </h2>
              ${list.map(r => `
                <div class="rpk-feed">
                  <div>${r.dishEmojis.map(e=>e.startsWith("::")?"🖼️":e).join("")} <b>${r.dishName}</b> → <i>${r.choice}</i></div>
                  <div style="margin:4px 0;">${r.reaction}</div>
                  <div class="rpk-feed-meta">${new Date(r.createdAt).toLocaleString()}</div>
                </div>
              `).join("")}
            </div>
          `).join("");

          body.querySelectorAll("button[data-sum]").forEach(b => {
            b.onclick = () => summarize(b.dataset.sum);
          });
          body.querySelectorAll("button[data-write]").forEach(b => {
            b.onclick = () => writeToMainMemory(b.dataset.write, b.dataset.cid);
          });
        }

        async function summarize(charName) {
          const list = feedRecords.filter(r => r.charName === charName);
          roche.ui.toast("正在总结投喂记忆...");
          try {
            const res = await roche.ai.chat({
              messages: [
                { role: "system", content: "请把用户对角色的投喂历史总结成一段温暖的记忆文本，包含喜爱/讨厌的食物、常见反应、与 user 的互动模式。" },
                { role: "user", content: list.map(r => `【${r.dishName}】选择：${r.choice}｜反应：${r.reaction}`).join("\n") }
              ],
              temperature: 0.7
            });
            await roche.ui.confirm({ title: `${charName} 的投喂记忆总结`, message: res.text || "总结失败" });
          } catch(e) { roche.ui.toast("AI 不可用"); }
        }

        async function writeToMainMemory(charName, charId) {
          const ok = await roche.ui.confirm({
            title: "⚠️ 写入 Roche 主记忆",
            message: "这会把总结写进 Roche 主事实记忆，卸载插件不会自动删除。确定？"
          });
          if (!ok) return;
          try {
            const char = await roche.character.get(charId);
            const conversationId = char?.conversationId;
            if (!conversationId) { roche.ui.toast("该角色没有 conversationId"); return; }
            const list = feedRecords.filter(r => r.charName === charName);
            const res = await roche.ai.chat({
              messages: [
                { role: "system", content: "把投喂记录总结成一句适合作为事实记忆的话（≤60字）。" },
                { role: "user", content: list.map(r => `${r.dishName}:${r.choice}`).join("；") }
              ]
            });
            const summary = (res.text||"").trim() || `${charName} 曾被 user 投喂过 ${list.length} 次料理。`;
            await roche.memory.write({
              conversationId,
              summaryText: summary,
              who: [charName, "user"],
              action: summary,
              when: "厨房投喂",
              where: "Char 的厨房",
              source: "plugin:char-kitchen"
            });
            roche.ui.toast("✅ 已写入主记忆");
          } catch(e) { roche.ui.toast("写入失败"); }
        }

        // ============== Tab: 自定义食材 ==============
        function renderCustom(body) {
          body.innerHTML = `
            <h2>🖼 上传自定义食材</h2>
            <input class="rpk-input" id="rpk-c-name" placeholder="食材名字，例如：外婆家的腌梅子">
            <textarea class="rpk-textarea" id="rpk-c-desc" placeholder="外貌、口感、气味、来源..."></textarea>
            <input class="rpk-input" id="rpk-c-img" type="file" accept="image/*">
            <button class="rpk-btn" id="rpk-c-add">➕ 加入食材库</button>
            <hr style="margin:16px 0;">
            ${customIngredients.length ? customIngredients.map(c => `
              <div class="rpk-dish">
                <div style="display:flex;gap:10px;">
                  ${c.image?`<img src="${c.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`:""}
                  <div>
                    <div class="rpk-dish-name">${c.name}</div>
                    <div style="font-size:12px;color:#666;">${c.desc||""}</div>
                  </div>
                </div>
                <button class="rpk-btn ghost" data-del="${c.id}" style="margin-top:6px;">删除</button>
              </div>
            `).join("") : `<div class="rpk-empty">还没有自定义食材</div>`}
          `;
          body.querySelector("#rpk-c-add").onclick = async () => {
            const name = body.querySelector("#rpk-c-name").value.trim();
            const desc = body.querySelector("#rpk-c-desc").value.trim();
            const file = body.querySelector("#rpk-c-img").files[0];
            if (!name) { roche.ui.toast("请填名字"); return; }
            let image = "";
            if (file) {
              image = await new Promise(res => {
                const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file);
              });
            }
            customIngredients.push({ id: crypto.randomUUID(), name, desc, image });
            await roche.storage.set("customIngredients", customIngredients);
            roche.ui.toast("已加入");
            render();
          };
          body.querySelectorAll("button[data-del]").forEach(b => {
            b.onclick = async () => {
              customIngredients = customIngredients.filter(x => x.id !== b.dataset.del);
              await roche.storage.set("customIngredients", customIngredients);
              render();
            };
          });
        }

        render();
      },

      async unmount(container, roche) {
        document.querySelectorAll('style[data-plugin="char-kitchen"]').forEach(s => s.remove());
        container.replaceChildren();
      }
    }
  ]
});
