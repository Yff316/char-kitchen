window.RochePlugin.register({
  id: "char-kitchen",
  name: "给 Char 炒菜的厨房",
  version: "2.0.0",
  apps: [{
    id: "char-kitchen-home",
    name: "Char 的厨房",
    icon: "restaurant",

    async mount(container, roche) {
      /* ================= 数据 ================= */
      const FRIDGE = {
        "肉类":  ["🥩","🍗","🍖","🥓","🍤","🦑","🦐","🦀","🐟","🦞","🥚"],
        "蔬菜":  ["🥬","🥒","🍆","🥦","🥕","🥔","🌽","🍠","🍄","🌶️","🧄","🧅","🫑","🥗"],
        "水果":  ["🍎","🍏","🍊","🍋","🍑","🍒","🍓","🍈","🍉","🍇","🥭","🥝","🍌","🍐","🍍","🥥"],
        "主食":  ["🍚","🍞","🍜","🍝","🥖","🥐","🥯","🌽","🥟","🍙","🍘","🌮","🌯","🥙","🥞"],
        "蛋点":  ["🍰","🎂","🧁","🍮","🍩","🍪","🍫","🍬","🍭","🍦","🍨","🍧"],
        "饮品":  ["🥛","🧃","☕","🍵","🧉","🍹","🍸","🍷","🍺","🥤"],
      };
      const SPICES_COMMON = ["🧂","🌶️","🍯","🧈","🫒","🥫","🧄"];        // 台面
      const SPICES_CABINET = ["🍶","🥃","💊","🧊","🌿","🫙","🧫","⚗️"];   // 柜子

      const EMOJI_META = {
        "🥩":{t:"咸鲜",x:"扎实",v:"豪华"},"🍗":{t:"咸香",x:"多汁",v:"满足"},
        "🥚":{t:"清淡",x:"嫩",v:"温柔"},"🥕":{t:"清甜",x:"脆",v:"营养"},
        "🌶️":{t:"辣",x:"脆",v:"火热"},"🍅":{t:"酸",x:"多汁",v:"鲜"},
        "🍑":{t:"甜",x:"多汁",v:"温柔"},"🍫":{t:"甜苦",x:"丝滑",v:"浪漫"},
        "🍯":{t:"甜",x:"粘稠",v:"温暖"},"🧂":{t:"咸",x:"颗粒",v:"基础"},
        "💊":{t:"苦",x:"硬",v:"神秘"},"🧄":{t:"辛香",x:"脆",v:"浓郁"},
      };
      const POTS = [
        { id:"wok",     name:"炒锅",   desc:"适合爆炒，锁香",   emoji:"🥘", tag:"炒" },
        { id:"flat",    name:"平底锅", desc:"煎、炒都行，温和", emoji:"🍳", tag:"煎" },
        { id:"pressure",name:"高压锅", desc:"炖汤入味",         emoji:"🍲", tag:"汤" },
      ];
      const TOOLS = [
        { id:"spatula", name:"锅铲", desc:"翻炒" },
        { id:"ladle",   name:"汤勺", desc:"搅拌汤汁" },
      ];
      const THEMES = {
        warm:  { bg:"#fff7ec", ink:"#3a2a1a", accent:"#e8863b", card:"#fff" },
        night: { bg:"#1e2233", ink:"#e8ecff", accent:"#ffb86b", card:"#2a2f45" },
        mint:  { bg:"#eefaf3", ink:"#233a30", accent:"#3fb27f", card:"#fff" },
        pink:  { bg:"#fff2f6", ink:"#40202c", accent:"#e668a0", card:"#fff" },
      };

      /* ================= 状态 ================= */
      const S = {
        tab:"stove", pot:"wok", tool:"spatula", fire:2, // 0-4
        picked:[], spices:[],
        recipes: (await roche.storage.get("recipes")) || [],
        feeds: (await roche.storage.get("feedRecords")) || [],
        custom: (await roche.storage.get("customIngredients")) || [],
        plate: [], // 冰箱选出的菜（用于赠送/回炒）
        fridgeOpen: false,
        theme: (await roche.storage.get("theme")) || "warm",
        cabinetOpen: false,
        chatWith: null, chatLog: [],
      };

      /* ================= 样式 ================= */
      const style = document.createElement("style");
      style.setAttribute("data-plugin","char-kitchen");
      style.textContent = `
      .ck{--bg:#fff7ec;--ink:#3a2a1a;--acc:#e8863b;--card:#fff;
         position:relative;min-height:100%;background:var(--bg);color:var(--ink);
         font-family:system-ui,'PingFang SC',sans-serif;padding-bottom:76px;}
      .ck-top{display:flex;justify-content:space-between;align-items:center;
         padding:12px 16px;font-weight:700;position:sticky;top:0;background:var(--bg);z-index:5;}
      .ck-close{border:none;background:transparent;font-size:20px;cursor:pointer;color:var(--ink);}
      .ck-body{padding:0 16px 20px;}
      .ck-nav{position:fixed;left:0;right:0;bottom:0;height:64px;background:var(--card);
         display:flex;justify-content:space-around;align-items:center;
         box-shadow:0 -4px 20px rgba(0,0,0,.08);border-top:1px solid rgba(0,0,0,.05);z-index:10;}
      .ck-nav button{flex:1;background:none;border:none;font-size:11px;color:#888;cursor:pointer;
         display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;}
      .ck-nav button.on{color:var(--acc);font-weight:700;}
      .ck-nav .ico{font-size:22px;}

      /* stove */
      .stove-wrap{padding:8px 0 16px;text-align:center;}
      .stove{position:relative;width:100%;max-width:360px;height:260px;margin:0 auto;
         background:linear-gradient(180deg,#f6dfb8,#e6c48a);border-radius:20px;overflow:hidden;
         box-shadow:inset 0 -8px 0 rgba(0,0,0,.08);}
      .flame{position:absolute;left:50%;bottom:80px;transform:translateX(-50%);
         pointer-events:none;transition:transform .3s;}
      .pan{position:absolute;left:50%;bottom:50px;transform:translateX(-50%) rotate(0);
         width:180px;height:60px;transform-origin:50% 100%;transition:transform .3s;cursor:pointer;}
      .pan.toss{animation:toss .6s ease;}
      @keyframes toss{
        0%{transform:translateX(-50%) rotate(0);}
        30%{transform:translateX(-50%) rotate(-25deg) translateY(-14px);}
        60%{transform:translateX(-50%) rotate(15deg) translateY(-8px);}
        100%{transform:translateX(-50%) rotate(0);}
      }
      .pan svg{width:100%;height:100%;overflow:visible;}
      .pan .food{position:absolute;left:0;right:0;top:6px;text-align:center;font-size:22px;letter-spacing:2px;}

      .fire-ctrl{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:12px;}
      .fire-ctrl input[type=range]{width:200px;accent-color:var(--acc);}

      .row{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;}
      .chip{padding:6px 12px;border:1px solid rgba(0,0,0,.1);background:var(--card);
         border-radius:20px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:4px;}
      .chip.on{background:var(--acc);color:#fff;border-color:var(--acc);}
      .h{font-weight:700;margin:14px 0 6px;font-size:14px;}

      .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(48px,1fr));gap:6px;}
      .cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:24px;
         background:var(--card);border-radius:10px;cursor:pointer;user-select:none;transition:.15s;}
      .cell:hover{transform:scale(1.08);}
      .cell.on{background:var(--acc);transform:scale(1.1);}

      .cabinet{border:1px dashed rgba(0,0,0,.2);border-radius:12px;padding:8px;margin-top:6px;}
      .cabinet .hd{display:flex;justify-content:space-between;align-items:center;cursor:pointer;font-size:13px;color:#666;}

      .btn{padding:10px 18px;border:none;background:var(--acc);color:#fff;border-radius:12px;
         cursor:pointer;font-weight:700;font-size:14px;box-shadow:0 4px 12px rgba(232,134,59,.3);}
      .btn.ghost{background:transparent;color:var(--acc);border:1.5px solid var(--acc);box-shadow:none;}
      .btn:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;}

      .card{background:var(--card);border-radius:14px;padding:12px;margin-bottom:10px;
         box-shadow:0 2px 8px rgba(0,0,0,.04);}
      .dish-emo{font-size:28px;letter-spacing:2px;}
      .dish-name{font-weight:700;font-size:16px;margin:4px 0;}
      .tag{display:inline-block;background:rgba(0,0,0,.06);padding:2px 8px;border-radius:10px;
         font-size:11px;margin:2px 4px 2px 0;color:#666;}

      /* fridge */
      .fridge-wrap{position:relative;width:100%;max-width:320px;height:420px;margin:12px auto;
         background:linear-gradient(180deg,#d9dee6,#b8c2d1);border-radius:16px;
         box-shadow:0 8px 30px rgba(0,0,0,.15);perspective:1000px;}
      .fridge-door{position:absolute;inset:0;background:linear-gradient(135deg,#eef1f6,#c9d1de);
         border-radius:16px;transform-origin:left center;transition:transform .8s;
         display:flex;align-items:center;justify-content:center;font-size:60px;cursor:pointer;
         box-shadow:inset -8px 0 15px rgba(0,0,0,.1);}
      .fridge-door.open{transform:rotateY(-110deg);}
      .fridge-in{position:absolute;inset:8px;background:#f8fafc;border-radius:12px;
         padding:10px;overflow-y:auto;overflow-x:hidden;}
      .fridge-in .sec{margin-bottom:10px;}
      .fridge-in .sec-title{font-weight:700;font-size:12px;color:#666;margin-bottom:4px;
         position:sticky;top:0;background:#f8fafc;padding:2px 0;}
      .fridge-in .row-scroll{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;}
      .fridge-in .row-scroll::-webkit-scrollbar{height:4px;}
      .fridge-in .row-scroll::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px;}
      .fridge-in .row-scroll .cell{flex:0 0 48px;}
      .plate{margin:12px auto;width:80%;max-width:280px;aspect-ratio:2/1;background:radial-gradient(#fff,#e8e8e8);
         border-radius:50%;box-shadow:0 6px 16px rgba(0,0,0,.15);display:flex;align-items:center;
         justify-content:center;font-size:28px;letter-spacing:6px;color:#333;padding:0 20px;
         text-align:center;overflow:hidden;}
      .plate.empty{color:#bbb;font-size:14px;letter-spacing:0;}

      /* chat */
      .chat-log{max-height:280px;overflow-y:auto;background:var(--card);border-radius:12px;padding:10px;margin-top:10px;}
      .chat-msg{margin-bottom:8px;padding:6px 10px;border-radius:10px;max-width:80%;font-size:13px;line-height:1.5;}
      .chat-msg.me{background:var(--acc);color:#fff;margin-left:auto;}
      .chat-msg.other{background:rgba(0,0,0,.05);}
      .chat-in{display:flex;gap:6px;margin-top:8px;}
      .chat-in input{flex:1;padding:10px;border:1px solid rgba(0,0,0,.1);border-radius:10px;
         background:var(--card);color:var(--ink);}
      `;
      document.head.appendChild(style);

      /* ================= 挂载 ================= */
      container.innerHTML = `<div class="ck"><div class="ck-top">
          <div>🍳 Char 的厨房</div><button class="ck-close">×</button>
        </div><div class="ck-body" id="ckBody"></div>
        <div class="ck-nav" id="ckNav">
          ${[
            ["stove","🍳","料理台"],
            ["book","📖","菜谱"],
            ["feed","🥄","投喂"],
            ["fridge","🧊","冰箱"],
            ["set","⚙️","设置"],
          ].map(([k,i,n])=>`<button data-t="${k}"><span class="ico">${i}</span>${n}</button>`).join("")}
        </div></div>`;
      const root = container.querySelector(".ck");
      const body = container.querySelector("#ckBody");
      container.querySelector(".ck-close").onclick = () => roche.ui.closeApp();

      function applyTheme(){
        const t = THEMES[S.theme] || THEMES.warm;
        root.style.setProperty("--bg", t.bg);
        root.style.setProperty("--ink", t.ink);
        root.style.setProperty("--acc", t.accent);
        root.style.setProperty("--card", t.card);
      }

      function nav(){
        container.querySelectorAll("#ckNav button").forEach(b=>{
          b.classList.toggle("on", b.dataset.t===S.tab);
          b.onclick = ()=>{ S.tab=b.dataset.t; render(); };
        });
      }

      /* ================= 火焰 SVG ================= */
      function flameSVG(level){
        // level: 0..4  -> 大小 & 颜色
        if(level===0) return `<div style="opacity:.4;font-size:12px;color:#888;">🚫 熄火</div>`;
        const scale = 0.4 + level*0.28;
        const height = 80 * scale, width = 60 * scale;
        return `<svg width="${width}" height="${height}" viewBox="0 0 60 80">
          <defs>
            <radialGradient id="f1" cx="50%" cy="80%" r="60%">
              <stop offset="0%" stop-color="#fff2b0"/>
              <stop offset="40%" stop-color="#ffb03a"/>
              <stop offset="100%" stop-color="#e63b1e" stop-opacity="0.9"/>
            </radialGradient>
          </defs>
          <path d="M30 78 C 5 65, 10 40, 25 25 C 22 40, 35 42, 32 22 C 40 30, 52 45, 48 62 C 46 72, 40 78, 30 78 Z"
                fill="url(#f1)">
            <animate attributeName="d" dur="${(0.8 - level*0.1).toFixed(2)}s" repeatCount="indefinite"
              values="
              M30 78 C 5 65, 10 40, 25 25 C 22 40, 35 42, 32 22 C 40 30, 52 45, 48 62 C 46 72, 40 78, 30 78 Z;
              M30 78 C 8 68, 6 38, 22 22 C 24 42, 36 40, 30 18 C 42 28, 54 46, 50 64 C 46 74, 40 78, 30 78 Z;
              M30 78 C 5 65, 10 40, 25 25 C 22 40, 35 42, 32 22 C 40 30, 52 45, 48 62 C 46 72, 40 78, 30 78 Z"/>
          </path>
          <path d="M30 74 C 18 66, 20 48, 28 36 C 27 46, 34 46, 32 32 C 38 40, 44 52, 42 64 C 40 70, 36 74, 30 74 Z"
                fill="#fff2a0" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.6;0.9" dur="0.4s" repeatCount="indefinite"/>
          </path>
        </svg>`;
      }

      /* ================= 锅 SVG ================= */
      function panSVG(pot){
        if(pot==="pressure"){
          return `<svg viewBox="0 0 200 60"><ellipse cx="100" cy="35" rx="80" ry="22" fill="#555"/>
            <rect x="88" y="4" width="24" height="14" rx="3" fill="#888"/>
            <ellipse cx="100" cy="20" rx="70" ry="10" fill="#777"/></svg>`;
        }
        if(pot==="flat"){
          return `<svg viewBox="0 0 200 60"><ellipse cx="90" cy="34" rx="70" ry="18" fill="#2a2a2a"/>
            <ellipse cx="90" cy="30" rx="65" ry="14" fill="#3d3d3d"/>
            <rect x="155" y="28" width="45" height="6" rx="3" fill="#6b3e1a"/></svg>`;
        }
        // wok
        return `<svg viewBox="0 0 200 60"><path d="M20 22 Q100 90 180 22 Z" fill="#2a2a2a"/>
          <path d="M28 24 Q100 76 172 24" fill="none" stroke="#555" stroke-width="2"/></svg>`;
      }

      /* ================= 渲染入口 ================= */
      function render(){
        applyTheme(); nav();
        body.innerHTML = "";
        ({stove:renderStove, book:renderBook, feed:renderFeed,
          fridge:renderFridge, set:renderSet})[S.tab](body);
      }

      /* ---------- 料理台 ---------- */
      function renderStove(el){
        el.innerHTML = `
          <div class="stove-wrap">
            <div class="stove">
              <div class="flame" id="flame">${flameSVG(S.fire)}</div>
              <div class="pan" id="pan">${panSVG(S.pot)}
                <div class="food">${S.picked.map(p=>p.startsWith("::")?"🖼️":p).join(" ")}</div>
              </div>
            </div>
            <div class="fire-ctrl">
              <span>🔥小</span>
              <input type="range" min="0" max="4" value="${S.fire}" id="fire">
              <span>大🔥</span>
            </div>
          </div>

          <div class="h">锅具</div>
          <div class="row">${POTS.map(p=>`<div class="chip ${S.pot===p.id?"on":""}" data-pot="${p.id}">${p.emoji} ${p.name}<span style="opacity:.6;font-size:11px;">·${p.tag}</span></div>`).join("")}</div>

          <div class="h">工具（挂墙上）</div>
          <div class="row">${TOOLS.map(t=>`<div class="chip ${S.tool===t.id?"on":""}" data-tool="${t.id}">${t.id==="spatula"?"🥄":"🍶"} ${t.name}</div>`).join("")}</div>

          <div class="h">调料（台面常用）</div>
          <div class="grid">${SPICES_COMMON.map(s=>`<div class="cell ${S.spices.includes(s)?"on":""}" data-sp="${s}">${s}</div>`).join("")}</div>
          <div class="cabinet">
            <div class="hd" id="cabHd">${S.cabinetOpen?"▼":"▶"} 柜子里的稀有调料</div>
            ${S.cabinetOpen?`<div class="grid" style="margin-top:6px;">${SPICES_CABINET.map(s=>`<div class="cell ${S.spices.includes(s)?"on":""}" data-sp="${s}">${s}</div>`).join("")}</div>`:""}
          </div>

          <div class="h">食材</div>
          ${Object.entries(FRIDGE).map(([cat,list])=>`
            <div style="font-size:12px;color:#888;margin:6px 0 4px;">${cat}</div>
            <div class="grid">${list.map(e=>`<div class="cell ${S.picked.includes(e)?"on":""}" data-e="${e}">${e}</div>`).join("")}</div>
          `).join("")}
          ${S.custom.length?`<div style="font-size:12px;color:#888;margin:8px 0 4px;">自定义</div>
            <div class="grid">${S.custom.map(c=>`<div class="cell ${S.picked.includes("::"+c.id)?"on":""}" data-ce="${c.id}" title="${c.name}">${c.image?`<img src="${c.image}" style="width:100%;height:100%;border-radius:8px;object-fit:cover;">`:"🖼️"}</div>`).join("")}</div>`:""}

          <div style="margin-top:16px;display:flex;gap:8px;">
            <button class="btn" id="toss" ${S.picked.length===0||S.fire===0?"disabled":""}>🥢 颠勺</button>
            <button class="btn" id="cook" ${S.picked.length===0||S.fire===0?"disabled":""}>🍳 出锅！</button>
            <button class="btn ghost" id="clr">清空</button>
          </div>
        `;

        el.querySelector("#fire").oninput = (e)=>{
          S.fire = +e.target.value;
          el.querySelector("#flame").innerHTML = flameSVG(S.fire);
        };
        el.querySelectorAll("[data-pot]").forEach(x=>x.onclick=()=>{S.pot=x.dataset.pot;render();});
        el.querySelectorAll("[data-tool]").forEach(x=>x.onclick=()=>{S.tool=x.dataset.tool;render();});
        el.querySelectorAll("[data-sp]").forEach(x=>x.onclick=()=>{
          const s=x.dataset.sp; const i=S.spices.indexOf(s);
          if(i>=0) S.spices.splice(i,1); else S.spices.push(s); render();
        });
        el.querySelectorAll("[data-e]").forEach(x=>x.onclick=()=>{
          const e=x.dataset.e; const i=S.picked.indexOf(e);
          if(i>=0) S.picked.splice(i,1); else S.picked.push(e); render();
        });
        el.querySelectorAll("[data-ce]").forEach(x=>x.onclick=()=>{
          const k="::"+x.dataset.ce; const i=S.picked.indexOf(k);
          if(i>=0) S.picked.splice(i,1); else S.picked.push(k); render();
        });
        el.querySelector("#cabHd").onclick=()=>{S.cabinetOpen=!S.cabinetOpen;render();};
        el.querySelector("#clr").onclick=()=>{S.picked=[];S.spices=[];render();};
        el.querySelector("#toss").onclick=()=>{
          const p = el.querySelector("#pan"); p.classList.remove("toss"); void p.offsetWidth; p.classList.add("toss");
          roche.ui.toast("锵！颠勺～");
        };
        el.querySelector("#cook").onclick=cookDish;
      }

      /* ---------- 出锅（合成） ---------- */
      async function cookDish(){
        if(!S.picked.length||S.fire===0) return;
        const parts=[], tastes=new Set(), textures=new Set(), vibes=new Set();
        S.picked.forEach(e=>{
          if(e.startsWith("::")){
            const c=S.custom.find(x=>x.id===e.slice(2));
            if(c) parts.push(`${c.name}(${c.desc||""})`);
          } else {
            parts.push(e);
            const m=EMOJI_META[e]; if(m){tastes.add(m.t);textures.add(m.x);vibes.add(m.v);}
          }
        });
        S.spices.forEach(s=>{const m=EMOJI_META[s]; if(m){tastes.add(m.t);textures.add(m.x);vibes.add(m.v);}});

        const pot = POTS.find(p=>p.id===S.pot);
        const fireLevel = ["熄火","小火","中火","中大火","猛火"][S.fire];

        roche.ui.toast(`${fireLevel} · ${pot.name}炒制中...`);
        let dish={name:"神秘料理",desc:"",effect:"",appearance:""};
        try{
          const res=await roche.ai.chat({messages:[
            {role:"system",content:"你是一个会取名的厨师。根据食材、调料、锅具、火候，起一个中文菜名并输出 JSON：{\"name\":\"\",\"desc\":\"\",\"effect\":\"\",\"appearance\":\"\"}"},
            {role:"user",content:`食材：${parts.join("、")}\n调料：${S.spices.join(" ")||"无"}\n锅具：${pot.name}(${pot.tag})\n火候：${fireLevel}\n工具：${S.tool}`}
          ],temperature:0.9});
          const m=(res.text||"").match(/\{[\s\S]*\}/); if(m) Object.assign(dish, JSON.parse(m[0]));
        }catch(e){
          dish.name = S.picked.filter(x=>!x.startsWith("::")).slice(0,3).join("") + pot.tag;
          dish.desc = `${fireLevel}下用${pot.name}${pot.tag}成的一道菜。`;
        }

        const rec = {
          id: crypto.randomUUID(),
          name: dish.name, desc: dish.desc,
          emojis: [...S.picked], spices: [...S.spices],
          pot: S.pot, tool: S.tool, fire: S.fire,
          taste:[...tastes].join("/")||"未知",
          texture:[...textures].join("/")||"未知",
          vibe:[...vibes].join("/")||"神秘",
          effect: dish.effect, appearance: dish.appearance,
          createdAt: Date.now(),
        };
        S.recipes.unshift(rec);
        await roche.storage.set("recipes", S.recipes);
        S.picked=[]; S.spices=[];
        roche.ui.toast(`✅ 出锅：${rec.name}`);
        S.tab="book"; render();
      }

      /* ---------- 菜谱 ---------- */
      function renderBook(el){
        if(!S.recipes.length){el.innerHTML=`<div style="text-align:center;color:#aaa;padding:40px;">还没有菜～去料理台炒一个</div>`;return;}
        el.innerHTML = S.recipes.map(r=>`
          <div class="card">
            <div class="dish-emo">${r.emojis.map(e=>e.startsWith("::")?"🖼️":e).join(" ")}${r.spices?.length?" · "+r.spices.join(""):""}</div>
            <div class="dish-name">${r.name}</div>
            <div style="font-size:13px;color:#666;">${r.desc||""}</div>
            <div style="margin-top:6px;">
              <span class="tag">🍳 ${POTS.find(p=>p.id===r.pot)?.name||"锅"}</span>
              <span class="tag">🔥 ${["熄","小","中","中大","猛"][r.fire||2]}火</span>
              <span class="tag">味 ${r.taste}</span>
              <span class="tag">感 ${r.texture}</span>
              <span class="tag">氛 ${r.vibe}</span>
            </div>
            ${r.effect?`<div style="font-size:12px;color:#888;margin-top:4px;">✨ ${r.effect}</div>`:""}
            ${r.appearance?`<div style="font-size:12px;color:#888;">🎨 ${r.appearance}</div>`:""}
            <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn" data-act="feed" data-id="${r.id}">🥄 投喂</button>
              <button class="btn ghost" data-act="plate" data-id="${r.id}">🍽 放盘子</button>
              <button class="btn ghost" data-act="gift" data-id="${r.id}">🎁 打包送 Char</button>
              <button class="btn ghost" data-act="del" data-id="${r.id}">删除</button>
            </div>
          </div>`).join("");
        el.querySelectorAll("[data-act]").forEach(b=>b.onclick=async()=>{
          const r = S.recipes.find(x=>x.id===b.dataset.id); if(!r) return;
          const a = b.dataset.act;
          if(a==="del"){ S.recipes = S.recipes.filter(x=>x.id!==r.id); await roche.storage.set("recipes",S.recipes); render(); }
          else if(a==="plate"){ S.plate.push(r); roche.ui.toast("已放到盘子里"); }
          else if(a==="feed"){ S.pendingDish = r; S.tab="feed"; render(); }
          else if(a==="gift"){ giftToChar(r); }
        });
      }

      /* ---------- 赠送到 Roche 聊天 ---------- */
      async function giftToChar(dish){
        let chars=[]; try{ chars=await roche.character.list(); }catch{}
        if(!chars.length){ roche.ui.toast("没有可赠送的 Char"); return; }
        const ch = await roche.ui.select?.({title:"送给谁？",options:chars.map(c=>({label:c.handle||c.name,value:c.id}))})
                 || chars[0]?.id;
        const target = chars.find(c=>c.id===(ch?.value||ch)) || chars[0];
        const text = `🎁 ${target.handle||target.name}，送你一道亲手做的【${dish.name}】\n${dish.emojis.join(" ")}\n${dish.desc||""}`;
        try{
          if(roche.chat?.send) await roche.chat.send({conversationId: target.conversationId, text});
          else if(roche.character?.sendMessage) await roche.character.sendMessage({charId: target.id, text});
          else throw new Error("no chat api");
          roche.ui.toast("已发到聊天里 💌");
        }catch(e){ roche.ui.toast("这个 Roche 版本没暴露聊天 API，改为复制到剪贴板"); navigator.clipboard?.writeText(text); }
      }

      /* ---------- 投喂 ---------- */
      async function renderFeed(el){
        el.innerHTML = `<div style="text-align:center;color:#aaa;padding:20px;">读取 Char 中...</div>`;
        let chars=[]; try{ chars=await roche.character.list(); }catch{}
        const dish = S.pendingDish;
        el.innerHTML = `
          ${dish?`<div class="card"><div class="dish-emo">${dish.emojis.join(" ")}</div>
            <div class="dish-name">🥄 准备投喂：${dish.name}</div></div>`
            :`<div style="text-align:center;color:#aaa;padding:20px;">先在【菜谱】点【投喂】选一道菜</div>`}
          <div class="h">选一位 Char</div>
          ${chars.length? chars.map(c=>`
            <div class="card" data-cid="${c.id}" style="cursor:pointer;display:flex;gap:10px;align-items:center;">
              ${c.avatar?`<img src="${c.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`:`<div style="width:44px;height:44px;border-radius:50%;background:#ddd;"></div>`}
              <div><div style="font-weight:700;">${c.handle||c.name}</div>
                <div style="font-size:12px;color:#888;">${(c.bio||"").slice(0,40)}</div></div>
            </div>`).join("")
          :`<div style="color:#aaa;text-align:center;padding:20px;">没有 Char</div>`}
          ${S.chatWith?renderChatBox():""}
        `;
        el.querySelectorAll("[data-cid]").forEach(c=>c.onclick=()=>{
          if(!dish){ roche.ui.toast("先选菜"); return; }
          const char = chars.find(x=>x.id===c.dataset.cid);
          feedToChar(dish, char);
        });
        if(S.chatWith){
          el.querySelector("#chatSend").onclick = ()=>sendChat(el);
          el.querySelector("#chatInput").onkeydown = (e)=>{ if(e.key==="Enter") sendChat(el); };
          el.querySelector("#chatDone").onclick = onChatDone;
        }
      }

      function renderChatBox(){
        return `<div class="h">💬 和 ${S.chatWith.name} 继续聊聊这道菜</div>
          <div class="chat-log" id="chatLog">
            ${S.chatLog.map(m=>`<div class="chat-msg ${m.role==='user'?'me':'other'}">${m.text}</div>`).join("")}
          </div>
          <div class="chat-in">
            <input id="chatInput" placeholder="想说什么...">
            <button class="btn" id="chatSend">发送</button>
          </div>
          <div style="margin-top:8px;"><button class="btn ghost" id="chatDone">结束投喂</button></div>`;
      }

      async function feedToChar(dish, char){
        roche.ui.toast(`把 ${dish.name} 递给 ${char.handle||char.name}...`);
        let reply="", choice="吃";
        try{
          const res = await roche.ai.chat({messages:[
            {role:"system",content:`你扮演角色「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\nuser 端了一道菜给你。从「吃/不吃/只尝一口/打翻/珍藏起来/其他」里挑一种反应，写角色化评价。JSON：{"choice":"","comment":""}`},
            {role:"user",content:`菜名：${dish.name}\n${dish.desc||""}\n味:${dish.taste} 感:${dish.texture} 氛:${dish.vibe}`}
          ],temperature:1.0});
          const m=(res.text||"").match(/\{[\s\S]*\}/);
          if(m){ const j=JSON.parse(m[0]); choice=j.choice||choice; reply=j.comment||""; } else reply=res.text||"";
        }catch{ reply="（Char 沉默地看着这道菜）"; }

        const rec = {
          id: crypto.randomUUID(),
          charId: char.id, charName: char.handle||char.name,
          dishId: dish.id, dishName: dish.name, dishEmojis: dish.emojis,
          choice, reaction: reply, createdAt: Date.now(),
        };
        S.feeds.unshift(rec);
        await roche.storage.set("feedRecords", S.feeds);

        S.chatWith = { id: char.id, name: char.handle||char.name, char, dish };
        S.chatLog = [{role:"assistant", text:`（${choice}）${reply}`}];
        S.pendingDish = null;
        render();
      }

      async function sendChat(el){
        const inp = el.querySelector("#chatInput"); const t = inp.value.trim(); if(!t) return;
        inp.value=""; S.chatLog.push({role:"user",text:t}); render();
        try{
          const res = await roche.ai.chat({messages:[
            {role:"system",content:`你扮演「${S.chatWith.name}」。刚吃了「${S.chatWith.dish.name}」，继续和 user 聊天，保持角色。`},
            ...S.chatLog.map(m=>({role:m.role,content:m.text})),
          ],temperature:0.9});
          S.chatLog.push({role:"assistant",text:res.text||"..."}); render();
        }catch{ S.chatLog.push({role:"assistant",text:"（沉默）"}); render(); }
      }

      async function onChatDone(){
        const keep = await roche.ui.confirm({title:"保留这段投喂记忆吗？",
          message:`要把和 ${S.chatWith.name} 的这段厨房对话作为记忆保留下来吗？\n（选择「否」将只保留最初的评价，聊天内容丢弃）`});
        if(keep){
          try{
            const summary = await roche.ai.chat({messages:[
              {role:"system",content:"用一句 ≤60 字的话总结这段厨房投喂对话，作为角色事实记忆。"},
              {role:"user",content:S.chatLog.map(m=>`${m.role}:${m.text}`).join("\n")}
            ]});
            const text = (summary.text||"").trim();
            if(S.chatWith.char.conversationId && roche.memory?.write){
              await roche.memory.write({
                conversationId: S.chatWith.char.conversationId,
                summaryText: text, who:[S.chatWith.name,"user"], action:text,
                when:"厨房投喂", where:"Char 的厨房", source:"plugin:char-kitchen"
              });
              roche.ui.toast("✅ 已写入主记忆");
            }
          }catch{ roche.ui.toast("记忆写入失败"); }
        } else {
          roche.ui.toast("这段对话已丢弃");
        }
        S.chatWith=null; S.chatLog=[]; render();
      }

      /* ---------- 冰箱 ---------- */
      function renderFridge(el){
        el.innerHTML = `
          <div style="margin:8px 0;display:flex;gap:8px;">
            <button class="btn ghost" id="addImg">➕ 导入图片食材</button>
            <button class="btn ghost" id="addEmo">➕ 输入 Emoji</button>
          </div>
          <div class="fridge-wrap">
            ${S.fridgeOpen?`
              <div class="fridge-in">
                ${Object.entries(FRIDGE).map(([cat,list])=>`
                  <div class="sec"><div class="sec-title">${cat}</div>
                    <div class="row-scroll">${list.map(e=>`<div class="cell" data-e="${e}">${e}</div>`).join("")}</div>
                  </div>`).join("")}
                ${S.custom.length?`<div class="sec"><div class="sec-title">自定义</div>
                  <div class="row-scroll">${S.custom.map(c=>`<div class="cell" data-ce="${c.id}" title="${c.name}">${c.image?`<img src="${c.image}" style="width:100%;height:100%;border-radius:8px;object-fit:cover;">`:"🖼️"}</div>`).join("")}</div></div>`:""}
                <div class="sec"><div class="sec-title">🍽 已完成的菜（可再选）</div>
                  <div class="row-scroll">${S.recipes.length?S.recipes.map(r=>`<div class="cell" data-r="${r.id}" title="${r.name}" style="font-size:20px;">${r.emojis[0]||"🍽"}</div>`).join(""):`<span style="color:#aaa;font-size:12px;">还没菜</span>`}</div>
                </div>
              </div>`:""}
            <div class="fridge-door ${S.fridgeOpen?"open":""}" id="door">${S.fridgeOpen?"":"🧊"}</div>
          </div>

          <div class="h">🍽 盘子</div>
          <div class="plate ${S.plate.length?"":"empty"}">${
            S.plate.length? S.plate.map(x=>typeof x==="string"?x:x.emojis?.[0]||"🍽").join(" ")
            :"（空盘子，点上面的食材/菜放进来）"
          }</div>
          <div style="text-align:center;margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            <button class="btn" id="plateGift" ${S.plate.length?"":"disabled"}>🎁 送给 Char</button>
            <button class="btn ghost" id="platePan" ${S.plate.length?"":"disabled"}>♻️ 全部回锅</button>
            <button class="btn ghost" id="plateClr" ${S.plate.length?"":"disabled"}>🗑 清空盘子</button>
          </div>
        `;
        el.querySelector("#door").onclick = ()=>{ S.fridgeOpen=!S.fridgeOpen; render(); };
        el.querySelectorAll("[data-e]").forEach(x=>x.onclick=()=>{ S.plate.push(x.dataset.e); render(); });
        el.querySelectorAll("[data-ce]").forEach(x=>x.onclick=()=>{ S.plate.push("::"+x.dataset.ce); render(); });
        el.querySelectorAll("[data-r]").forEach(x=>x.onclick=()=>{
          const r=S.recipes.find(y=>y.id===x.dataset.r); if(r) S.plate.push(r); render();
        });
        el.querySelector("#addImg").onclick = importImage;
        el.querySelector("#addEmo").onclick = importEmoji;
        el.querySelector("#plateClr").onclick = ()=>{S.plate=[];render();};
        el.querySelector("#platePan").onclick = ()=>{
          // 把盘子里的食材（不是菜）扔回锅里
          S.plate.forEach(p=>{ if(typeof p==="string") S.picked.push(p); });
          S.plate=[]; S.tab="stove"; render();
          roche.ui.toast("已回锅");
        };
        el.querySelector("#plateGift").onclick = giftPlateToChar;
      }

      async function giftPlateToChar(){
        if(!S.plate.length) return;
        let chars=[]; try{ chars=await roche.character.list(); }catch{}
        if(!chars.length){ roche.ui.toast("没有 Char"); return; }
        const target = chars[0]; // 简化：用第一个；也可以做选择器
        const dishes = S.plate.filter(x=>typeof x!=="string");
        const raws   = S.plate.filter(x=>typeof x==="string");
        const text = `🍽 送给 ${target.handle||target.name} 一盘：\n${dishes.map(d=>`【${d.name}】${d.emojis.join("")}`).join("\n")}${raws.length?`\n配菜：${raws.join(" ")}`:""}`;
        try{
          if(roche.chat?.send) await roche.chat.send({conversationId: target.conversationId, text});
          else if(roche.character?.sendMessage) await roche.character.sendMessage({charId: target.id, text});
          else { navigator.clipboard?.writeText(text); roche.ui.toast("已复制到剪贴板"); return; }
          roche.ui.toast("已送出 💌");
          S.plate=[]; render();
        }catch{ roche.ui.toast("发送失败"); }
      }

      async function importImage(){
        const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
        inp.onchange=async()=>{
          const f=inp.files[0]; if(!f) return;
          const name = prompt("给这个食材起个名字：","自制食材"); if(!name) return;
          const desc = prompt("描述一下它（可留空）：","")||"";
          const image = await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f);});
          S.custom.push({id:crypto.randomUUID(),name,desc,image});
          await roche.storage.set("customIngredients",S.custom); render();
        };
        inp.click();
      }
      async function importEmoji(){
        const e = prompt("输入一个 emoji 作为食材："); if(!e) return;
        const name = prompt("名字：",e)||e;
        S.custom.push({id:crypto.randomUUID(),name,desc:"",image:"",emoji:e});
        await roche.storage.set("customIngredients",S.custom); render();
      }

      /* ---------- 设置 ---------- */
      function renderSet(el){
        el.innerHTML = `
          <div class="h">🎨 主题</div>
          <div class="row">${Object.keys(THEMES).map(k=>`<div class="chip ${S.theme===k?"on":""}" data-th="${k}">${k}</div>`).join("")}</div>

          <div class="h">🧹 数据清理</div>
          <div class="row">
            <button class="btn ghost" id="clrPics">清除所有自定义食材图片</button>
            <button class="btn ghost" id="clrOne">选择图片单个清除</button>
          </div>

          <div class="h">📊 存储情况</div>
          <div class="card" style="font-size:13px;line-height:1.8;">
            菜谱：${S.recipes.length} 条<br>
            投喂：${S.feeds.length} 条<br>
            自定义食材：${S.custom.length} 个（其中带图 ${S.custom.filter(c=>c.image).length} 个）
          </div>

          <div class="h">☠️ 危险区</div>
          <div class="row">
            <button class="btn ghost" id="wipeAll" style="color:#c33;border-color:#c33;">清空全部厨房数据</button>
          </div>
        `;
        el.querySelectorAll("[data-th]").forEach(b=>b.onclick=async()=>{
          S.theme=b.dataset.th; await roche.storage.set("theme",S.theme); render();
        });
        el.querySelector("#clrPics").onclick=async()=>{
          if(!await roche.ui.confirm({title:"确认",message:"清除所有自定义食材的图片数据？食材本身保留。"}))return;
          S.custom = S.custom.map(c=>({...c,image:""}));
          await roche.storage.set("customIngredients",S.custom); render();
        };
        el.querySelector("#clrOne").onclick=async()=>{
          const withImg = S.custom.filter(c=>c.image);
          if(!withImg.length){ roche.ui.toast("没有带图的食材"); return; }
          const pick = await roche.ui.select?.({title:"清除哪个图片？",options:withImg.map(c=>({label:c.name,value:c.id}))});
          const id = pick?.value||pick; if(!id) return;
          S.custom = S.custom.map(c=>c.id===id?{...c,image:""}:c);
          await roche.storage.set("customIngredients",S.custom); render();
        };
        el.querySelector("#wipeAll").onclick=async()=>{
          if(!await roche.ui.confirm({title:"⚠️ 清空全部",message:"菜谱、投喂记录、自定义食材都会删除，不可恢复。继续？"}))return;
          S.recipes=[];S.feeds=[];S.custom=[];S.plate=[];
          await roche.storage.set("recipes",[]);
          await roche.storage.set("feedRecords",[]);
          await roche.storage.set("customIngredients",[]);
          render();
        };
      }

      render();
    },

    async unmount(container){
      document.querySelectorAll('style[data-plugin="char-kitchen"]').forEach(s=>s.remove());
      container.replaceChildren();
    }
  }]
});
