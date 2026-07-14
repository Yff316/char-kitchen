window.RochePlugin.register({
  id: "char-kitchen",
  name: "给 Char 炒菜的厨房",
  version: "3.0.0",
  apps: [{
    id: "char-kitchen-home",
    name: "Char 的厨房",
    icon: "restaurant",
    async mount(container, roche) {

    /* ============ 数据 ============ */
    const FRIDGE = {
      "肉类":["🥩","🍗","🍖","🥓","🍤","🦑","🦐","🦀","🐟","🦞","🥚"],
      "蔬菜":["🥬","🥒","🍆","🥦","🥕","🥔","🌽","🍠","🍄","🌶️","🧄","🧅","🫑","🥗"],
      "水果":["🍎","🍏","🍊","🍋","🍑","🍒","🍓","🍈","🍉","🍇","🥭","🥝","🍌","🍐","🍍","🥥"],
      "主食":["🍚","🍞","🍜","🍝","🥖","🥐","🥯","🥟","🍙","🍘","🌮","🌯","🥙","🥞"],
      "蛋点":["🍰","🎂","🧁","🍮","🍩","🍪","🍫","🍬","🍭","🍦","🍨","🍧"],
      "饮品":["🥛","🧃","☕","🍵","🧉","🍹","🍸","🍷","🍺","🥤"],
    };
    // 每种调料自己的特效配置
    const SPICE_FX = {
      "🧂":{cls:"fx-salt",  name:"盐",     particle:"·",  color:"#fff"},
      "🌶️":{cls:"fx-chili", name:"辣椒",   particle:"~",  color:"#e63b1e"},
      "🍯":{cls:"fx-honey", name:"蜂蜜",   particle:"◉",  color:"#e8a13b"},
      "🧈":{cls:"fx-butter",name:"黄油",   particle:"◐",  color:"#ffe08a"},
      "🫒":{cls:"fx-olive", name:"橄榄油", particle:"◎",  color:"#7ab648"},
      "🥫":{cls:"fx-tomato",name:"番茄酱", particle:"●",  color:"#d33"},
      "🧄":{cls:"fx-garlic",name:"蒜",     particle:"■",  color:"#f5f0dc"},
      "🍶":{cls:"fx-sake",  name:"料酒",   particle:"˜",  color:"#b8d8ff"},
      "🥃":{cls:"fx-whisky",name:"威士忌", particle:"🔥", color:"#d99a3a"},
      "💊":{cls:"fx-magic", name:"神秘药", particle:"✦",  color:"#b06bff"},
      "🧊":{cls:"fx-ice",   name:"冰",     particle:"❄",  color:"#a8d8ff"},
      "🌿":{cls:"fx-herb",  name:"香草",   particle:"❦",  color:"#5fb04a"},
      "🫙":{cls:"fx-jar",   name:"罐装粉", particle:"·",  color:"#c8bfae"},
      "⚗️":{cls:"fx-lab",   name:"试剂",   particle:"○",  color:"#6bd2c8"},
    };
    const SPICES_COMMON  = ["🧂","🌶️","🍯","🧈","🫒","🥫","🧄"];
    const SPICES_CABINET = ["🍶","🥃","💊","🧊","🌿","🫙","⚗️"];

    const EMOJI_META = {
      "🥩":{t:"咸鲜",x:"扎实",v:"豪华"},"🍗":{t:"咸香",x:"多汁",v:"满足"},
      "🥚":{t:"清淡",x:"嫩",v:"温柔"},"🥕":{t:"清甜",x:"脆",v:"营养"},
      "🌶️":{t:"辣",x:"脆",v:"火热"},"🍅":{t:"酸",x:"多汁",v:"鲜"},
      "🍑":{t:"甜",x:"多汁",v:"温柔"},"🍫":{t:"甜苦",x:"丝滑",v:"浪漫"},
      "🍯":{t:"甜",x:"粘稠",v:"温暖"},"🧂":{t:"咸",x:"颗粒",v:"基础"},
      "💊":{t:"苦",x:"硬",v:"神秘"},"🧄":{t:"辛香",x:"脆",v:"浓郁"},
    };
    const POTS = [
      { id:"wok", name:"炒锅", desc:"爆炒锁香", tag:"炒" },
      { id:"flat",name:"平底锅",desc:"温和煎炒", tag:"煎" },
      { id:"pressure",name:"高压锅",desc:"炖汤入味", tag:"汤" },
    ];
    const TOOLS = [{id:"spatula",name:"锅铲"},{id:"ladle",name:"汤勺"}];
    const THEMES = {
      warm:{bg:"#fff7ec",ink:"#3a2a1a",acc:"#e8863b",card:"#fff"},
      night:{bg:"#161a2e",ink:"#e8ecff",acc:"#ffb86b",card:"#232842"},
      mint:{bg:"#eefaf3",ink:"#233a30",acc:"#3fb27f",card:"#fff"},
      pink:{bg:"#fff2f6",ink:"#40202c",acc:"#e668a0",card:"#fff"},
    };

    /* ============ 状态 ============ */
    const hour = new Date().getHours();
    const isLateNight = (hour>=22 || hour<4);
    const S = {
      tab:"stove", pot:"wok", tool:"spatula", fire:2,
      picked:[], spices:[],
      spiceFxQueue:[], // 触发的特效
      recipes: (await roche.storage.get("recipes"))||[],
      feeds:   (await roche.storage.get("feedRecords"))||[],
      custom:  (await roche.storage.get("customIngredients"))||[],
      plate:[], fridgeOpen:false, cabinetOpen:false,
      theme: (await roche.storage.get("theme")) || (isLateNight?"night":"warm"),
      chatWith:null, chatLog:[],
      cravingBanner:null, // Char 主动讨菜
      pendingDish:null,
    };

    /* ============ 样式 ============ */
    const style = document.createElement("style");
    style.setAttribute("data-plugin","char-kitchen");
    style.textContent = `
    .ck{--bg:#fff7ec;--ink:#3a2a1a;--acc:#e8863b;--card:#fff;
      position:fixed;inset:0;background:var(--bg);color:var(--ink);
      font-family:system-ui,'PingFang SC',sans-serif;
      display:flex;flex-direction:column;overflow:hidden;}
    .ck-top{display:flex;justify-content:space-between;align-items:center;
      padding:10px 16px;font-weight:700;background:var(--bg);border-bottom:1px solid rgba(0,0,0,.05);flex-shrink:0;}
    .ck-close{border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--ink);}
    .ck-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 16px 20px;}
    .ck-nav{height:60px;background:var(--card);display:flex;
      box-shadow:0 -4px 20px rgba(0,0,0,.08);border-top:1px solid rgba(0,0,0,.05);flex-shrink:0;}
    .ck-nav button{flex:1;background:none;border:none;font-size:11px;color:#888;cursor:pointer;
      display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;}
    .ck-nav button.on{color:var(--acc);font-weight:700;}
    .ck-nav .ico{font-size:20px;}

    /* 讨菜横幅 */
    .craving{background:linear-gradient(90deg,#ffdcae,#ffb98a);
      padding:10px 14px;border-radius:12px;margin:8px 0;cursor:pointer;
      display:flex;gap:10px;align-items:center;font-size:13px;box-shadow:0 4px 12px rgba(232,134,59,.2);}
    .craving img{width:36px;height:36px;border-radius:50%;object-fit:cover;}

    /* 深夜标题 */
    .midnight-tag{display:inline-block;padding:2px 10px;border-radius:10px;
      background:linear-gradient(90deg,#3a3f6b,#5a3a6b);color:#ffb86b;font-size:11px;margin-left:8px;}

    /* 灶台 */
    .stove-fixed{position:sticky;top:0;background:var(--bg);padding:8px 0 4px;z-index:3;}
    .stove{position:relative;width:100%;max-width:340px;height:200px;margin:0 auto;
      background:linear-gradient(180deg,#f6dfb8,#d9b878);border-radius:20px;overflow:visible;
      box-shadow:inset 0 -6px 0 rgba(0,0,0,.08);}
    .ck[data-theme=night] .stove{background:linear-gradient(180deg,#2a2e4a,#1a1d2e);}
    .pan-holder{position:absolute;left:50%;top:40px;transform:translateX(-50%);
      width:200px;height:80px;z-index:2;cursor:pointer;transform-origin:50% 100%;}
    .pan-holder.toss{animation:toss .7s ease;}
    @keyframes toss{
      0%{transform:translateX(-50%) rotate(0);}
      30%{transform:translateX(-50%) rotate(-22deg) translateY(-18px);}
      60%{transform:translateX(-50%) rotate(14deg) translateY(-10px);}
      100%{transform:translateX(-50%) rotate(0);}
    }
    .pan-svg{width:100%;height:100%;overflow:visible;}
    .pan-food{position:absolute;inset:0;pointer-events:none;}
    .pan-food span{position:absolute;font-size:18px;transform:translate(-50%,-50%);
      animation:bob 2s ease-in-out infinite;}
    @keyframes bob{0%,100%{transform:translate(-50%,-50%);}50%{transform:translate(-50%,-58%);}}

    /* 火焰在锅下面 */
    .flame-holder{position:absolute;left:50%;top:90px;transform:translateX(-50%);
      width:80px;height:100px;z-index:1;pointer-events:none;display:flex;justify-content:center;align-items:flex-start;}

    /* 火候滑竿 */
    .fire-ctrl{display:flex;align-items:center;justify-content:center;gap:10px;padding:6px 0;font-size:12px;}
    .fire-ctrl input[type=range]{width:180px;accent-color:var(--acc);}

    /* 特效层 */
    .fx-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3;}
    .fx-particle{position:absolute;font-size:14px;font-weight:bold;opacity:.9;}
    @keyframes fall{0%{transform:translateY(-20px);opacity:0;}20%{opacity:1;}100%{transform:translateY(80px);opacity:0;}}
    @keyframes rise{0%{transform:translateY(20px);opacity:0;}20%{opacity:1;}100%{transform:translateY(-80px);opacity:0;}}
    @keyframes swirl{0%{transform:rotate(0) translateX(20px);opacity:.9;}100%{transform:rotate(360deg) translateX(20px);opacity:0;}}
    @keyframes drip{0%{transform:translateY(-10px) scale(1);opacity:1;}70%{transform:translateY(30px) scale(.6);opacity:1;}100%{transform:translateY(50px) scale(.2);opacity:0;}}
    @keyframes splash{0%{transform:scale(0);opacity:1;}100%{transform:scale(2.5);opacity:0;}}
    @keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-4px);}75%{transform:translateX(4px);}}
    @keyframes twinkle{0%,100%{opacity:.3;transform:scale(1);}50%{opacity:1;transform:scale(1.4) rotate(180deg);}}
    @keyframes flambe{0%{transform:scale(0.3);opacity:1;}50%{transform:scale(2);opacity:.9;}100%{transform:scale(3);opacity:0;}}
    .p-fall{animation:fall 1.5s ease-in;}
    .p-rise{animation:rise 1.8s ease-out;}
    .p-swirl{animation:swirl 1.2s linear;}
    .p-drip{animation:drip 1.6s ease-in;}
    .p-splash{animation:splash .8s ease-out;}
    .p-shake{animation:shake .1s linear 8;}
    .p-twinkle{animation:twinkle 1.5s ease-in-out;}
    .p-flambe{animation:flambe 1s ease-out;}

    /* 选择行 */
    .row{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;}
    .chip{padding:5px 10px;border:1px solid rgba(0,0,0,.1);background:var(--card);
      border-radius:16px;cursor:pointer;font-size:12px;}
    .chip.on{background:var(--acc);color:#fff;border-color:var(--acc);}
    .h{font-weight:700;margin:12px 0 6px;font-size:13px;}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:5px;}
    .cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:22px;
      background:var(--card);border-radius:10px;cursor:pointer;user-select:none;transition:.15s;}
    .cell.on{background:var(--acc);transform:scale(1.08);}
    .cabinet{border:1px dashed rgba(0,0,0,.15);border-radius:12px;padding:8px;margin-top:6px;}
    .cabinet .hd{display:flex;justify-content:space-between;cursor:pointer;font-size:12px;color:#666;}
    .btn{padding:9px 16px;border:none;background:var(--acc);color:#fff;border-radius:10px;
      cursor:pointer;font-weight:700;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,.1);}
    .btn.ghost{background:transparent;color:var(--acc);border:1.5px solid var(--acc);box-shadow:none;}
    .btn:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;}
    .card{background:var(--card);border-radius:14px;padding:12px;margin-bottom:10px;
      box-shadow:0 2px 8px rgba(0,0,0,.04);}
    .dish-emo{font-size:26px;letter-spacing:2px;}
    .dish-name{font-weight:700;font-size:15px;margin:4px 0;}
    .tag{display:inline-block;background:rgba(0,0,0,.06);padding:2px 8px;border-radius:10px;
      font-size:11px;margin:2px 4px 2px 0;color:#666;}

    /* 冰箱 */
    .fridge-wrap{position:relative;width:100%;max-width:300px;height:380px;margin:12px auto;
      background:linear-gradient(180deg,#d9dee6,#b0bccc);border-radius:16px;
      box-shadow:0 8px 30px rgba(0,0,0,.15);perspective:1000px;}
    .fridge-door{position:absolute;inset:0;background:linear-gradient(135deg,#eef1f6,#c9d1de);
      border-radius:16px;transform-origin:left center;transition:transform .8s;
      display:flex;align-items:center;justify-content:center;font-size:54px;cursor:pointer;
      box-shadow:inset -8px 0 15px rgba(0,0,0,.1);z-index:2;}
    .fridge-door.open{transform:rotateY(-115deg);}
    .fridge-in{position:absolute;inset:8px;background:#f8fafc;border-radius:12px;
      padding:8px;overflow-y:auto;-webkit-overflow-scrolling:touch;}
    .fridge-in .sec{margin-bottom:8px;}
    .fridge-in .sec-title{font-weight:700;font-size:11px;color:#666;margin-bottom:3px;
      position:sticky;top:0;background:#f8fafc;padding:2px 0;z-index:1;}
    .fridge-in .row-scroll{display:flex;gap:5px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:4px;}
    .fridge-in .row-scroll .cell{flex:0 0 44px;background:#fff;}

    .plate{margin:12px auto;width:80%;max-width:280px;aspect-ratio:2/1;
      background:radial-gradient(#fff,#e0e0e0);border-radius:50%;
      box-shadow:0 6px 16px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;
      font-size:26px;letter-spacing:6px;padding:0 20px;text-align:center;overflow:hidden;}
    .plate.empty{color:#bbb;font-size:13px;letter-spacing:0;}

    .chat-log{max-height:260px;overflow-y:auto;background:var(--card);border-radius:12px;padding:10px;margin-top:10px;}
    .chat-msg{margin-bottom:6px;padding:6px 10px;border-radius:10px;max-width:80%;font-size:13px;line-height:1.5;}
    .chat-msg.me{background:var(--acc);color:#fff;margin-left:auto;}
    .chat-msg.other{background:rgba(0,0,0,.05);}
    .chat-in{display:flex;gap:6px;margin-top:8px;}
    .chat-in input{flex:1;padding:9px;border:1px solid rgba(0,0,0,.1);border-radius:10px;background:var(--card);color:var(--ink);}
    `;
    document.head.appendChild(style);

    /* ============ 挂载 ============ */
    container.innerHTML = `<div class="ck" data-theme="${S.theme}">
      <div class="ck-top">
        <div>🍳 Char 的厨房${isLateNight?'<span class="midnight-tag">🌙 深夜食堂</span>':''}</div>
        <button class="ck-close">×</button>
      </div>
      <div class="ck-body" id="ckBody"></div>
      <div class="ck-nav" id="ckNav">
        ${[["stove","🍳","料理台"],["book","📖","菜谱"],["feed","🥄","投喂"],["fridge","🧊","冰箱"],["set","⚙️","设置"]]
          .map(([k,i,n])=>`<button data-t="${k}"><span class="ico">${i}</span>${n}</button>`).join("")}
      </div>
    </div>`;
    const root = container.querySelector(".ck");
    const body = container.querySelector("#ckBody");
    container.querySelector(".ck-close").onclick = ()=>roche.ui.closeApp();

    function applyTheme(){
      const t = THEMES[S.theme] || THEMES.warm;
      root.style.setProperty("--bg",t.bg);
      root.style.setProperty("--ink",t.ink);
      root.style.setProperty("--acc",t.acc);
      root.style.setProperty("--card",t.card);
      root.setAttribute("data-theme", S.theme);
    }
    function nav(){
      container.querySelectorAll("#ckNav button").forEach(b=>{
        b.classList.toggle("on", b.dataset.t===S.tab);
        b.onclick = ()=>{ S.tab=b.dataset.t; render(); };
      });
    }

    /* ============ 火焰 SVG（挂在锅下方） ============ */
    function flameSVG(level){
      if(level===0) return `<div style="opacity:.4;font-size:11px;color:#888;margin-top:20px;">🚫 熄火</div>`;
      const scale = 0.35 + level*0.22;
      const w = 60*scale, h = 90*scale;
      return `<svg width="${w}" height="${h}" viewBox="0 0 60 90">
        <defs><radialGradient id="fg${level}" cx="50%" cy="20%" r="70%">
          <stop offset="0%" stop-color="#fff2b0"/>
          <stop offset="40%" stop-color="#ffb03a"/>
          <stop offset="100%" stop-color="#e63b1e" stop-opacity=".85"/>
        </radialGradient></defs>
        <path fill="url(#fg${level})" d="M30 2 C 10 25, 12 50, 25 65 C 22 50, 35 48, 32 30 C 42 42, 54 58, 48 78 C 44 86, 36 88, 30 88 C 24 88, 16 86, 12 78 C 6 58, 18 42, 28 30 C 25 48, 38 50, 35 65 C 48 50, 50 25, 30 2 Z">
          <animate attributeName="d" dur="${(0.7-level*0.08).toFixed(2)}s" repeatCount="indefinite"
            values="M30 2 C 10 25, 12 50, 25 65 C 22 50, 35 48, 32 30 C 42 42, 54 58, 48 78 C 44 86, 36 88, 30 88 C 24 88, 16 86, 12 78 C 6 58, 18 42, 28 30 C 25 48, 38 50, 35 65 C 48 50, 50 25, 30 2 Z;
                    M30 4 C 8 28, 10 52, 22 66 C 20 52, 34 46, 30 26 C 44 40, 56 60, 50 80 C 46 87, 34 89, 30 89 C 26 89, 14 87, 10 80 C 4 60, 16 40, 30 26 C 26 46, 40 52, 38 66 C 50 52, 52 28, 30 4 Z;
                    M30 2 C 10 25, 12 50, 25 65 C 22 50, 35 48, 32 30 C 42 42, 54 58, 48 78 C 44 86, 36 88, 30 88 C 24 88, 16 86, 12 78 C 6 58, 18 42, 28 30 C 25 48, 38 50, 35 65 C 48 50, 50 25, 30 2 Z"/>
        </path>
        <path fill="#fff2a0" opacity=".85" d="M30 30 C 22 45, 22 60, 30 72 C 38 60, 38 45, 30 30 Z">
          <animate attributeName="opacity" values=".9;.5;.9" dur=".35s" repeatCount="indefinite"/>
        </path>
      </svg>`;
    }

    /* ============ 锅 SVG ============ */
    function panSVG(pot){
      if(pot==="pressure"){
        return `<svg class="pan-svg" viewBox="0 0 200 80">
          <ellipse cx="100" cy="55" rx="80" ry="22" fill="#555"/>
          <rect x="88" y="10" width="24" height="14" rx="3" fill="#888"/>
          <ellipse cx="100" cy="35" rx="70" ry="10" fill="#777"/>
          <ellipse cx="100" cy="52" rx="65" ry="8" fill="#333"/></svg>`;
      }
      if(pot==="flat"){
        return `<svg class="pan-svg" viewBox="0 0 200 80">
          <ellipse cx="85" cy="54" rx="70" ry="16" fill="#2a2a2a"/>
          <ellipse cx="85" cy="50" rx="66" ry="12" fill="#3d3d3d"/>
          <rect x="150" y="48" width="45" height="6" rx="3" fill="#6b3e1a"/></svg>`;
      }
      return `<svg class="pan-svg" viewBox="0 0 200 80">
        <path d="M20 42 Q100 100 180 42 Z" fill="#2a2a2a"/>
        <path d="M28 44 Q100 88 172 44" fill="none" stroke="#555" stroke-width="2"/>
        <ellipse cx="100" cy="44" rx="72" ry="6" fill="#1a1a1a"/></svg>`;
    }

    /* ============ 特效触发 ============ */
    function playSpiceFx(spice){
      const fx = SPICE_FX[spice]; if(!fx) return;
      const layer = container.querySelector("#fxLayer");
      if(!layer) return;

      const spawn = (anim, count, opts={})=>{
        for(let i=0;i<count;i++){
          const el = document.createElement("span");
          el.className = `fx-particle ${anim}`;
          el.textContent = opts.text || fx.particle;
          el.style.color = opts.color || fx.color;
          el.style.left = (30 + Math.random()*140) + "px";
          el.style.top  = (Math.random()*40) + "px";
          el.style.fontSize = (opts.size||14) + "px";
          el.style.animationDelay = (Math.random()*.3)+"s";
          layer.appendChild(el);
          setTimeout(()=>el.remove(), 2500);
        }
      };

      switch(spice){
        case "🧂": spawn("p-fall", 20, {text:"·", size:18}); break;
        case "🌶️": spawn("p-rise", 12, {text:"~", color:"#e63b1e", size:20});
                   root.querySelector(".pan-holder")?.classList.add("p-shake");
                   setTimeout(()=>root.querySelector(".pan-holder")?.classList.remove("p-shake"),800); break;
        case "🍯": spawn("p-drip", 6, {text:"◉", size:20}); break;
        case "🧈": spawn("p-splash", 4, {text:"◐", size:30}); break;
        case "🫒": spawn("p-swirl", 10, {text:"◎"}); break;
        case "🥫": spawn("p-splash", 6, {text:"●", color:"#d33", size:26}); break;
        case "🧄": spawn("p-rise", 8, {text:"■", color:"#f5f0dc"}); break;
        case "🍶": spawn("p-rise", 10, {text:"˜", color:"#b8d8ff"}); break;
        case "🥃": spawn("p-flambe", 3, {text:"🔥", size:40}); break;
        case "💊": spawn("p-twinkle", 15, {text:"✦", color:"#b06bff", size:16}); break;
        case "🧊": spawn("p-fall", 12, {text:"❄", color:"#a8d8ff", size:16}); break;
        case "🌿": spawn("p-fall", 8, {text:"❦", color:"#5fb04a"}); break;
        case "🫙": spawn("p-fall", 25, {text:"·", color:"#c8bfae", size:16}); break;
        case "⚗️": spawn("p-rise", 12, {text:"○", color:"#6bd2c8"}); break;
      }
      roche.ui.toast(`${fx.name} 已加入！`);
    }

    /* ============ Char 主动讨菜 ============ */
    async function maybeCraving(){
      if(S.cravingBanner) return;
      if(Math.random() > 0.2) return;
      try{
        const chars = await roche.character.list();
        if(!chars.length) return;
        const c = chars[Math.floor(Math.random()*chars.length)];
        const res = await roche.ai.chat({messages:[
          {role:"system",content:`你扮演「${c.name||c.handle}」。人设：${c.persona||c.bio||""}\n主动来 user 的厨房讨吃的，写一句短短的、带角色语气的讨菜台词（≤30字），不要引号。`},
          {role:"user",content:"你想吃什么？"}
        ],temperature:1.1});
        S.cravingBanner = { char:c, text:(res.text||"").trim() || "肚子饿了…做点吃的？" };
        if(S.tab==="stove") render();
      }catch{}
    }

    /* ============ 渲染 ============ */
    function render(){
      applyTheme(); nav(); body.innerHTML="";
      ({stove:renderStove, book:renderBook, feed:renderFeed, fridge:renderFridge, set:renderSet})[S.tab](body);
    }

    /* ---------- 料理台 ---------- */
    function renderStove(el){
      const foodDots = S.picked.map((p,i)=>{
        const emo = p.startsWith("::") ? (S.custom.find(c=>c.id===p.slice(2))?.emoji || "🖼") : p;
        const x = 30 + (i%5)*35 + Math.random()*8;
        const y = 20 + Math.floor(i/5)*22;
        return `<span style="left:${x}px;top:${y}px;">${emo}</span>`;
      }).join("");

      el.innerHTML = `
        ${S.cravingBanner ? `
          <div class="craving" id="cravBanner">
            ${S.cravingBanner.char.avatar?`<img src="${S.cravingBanner.char.avatar}">`:`<div style="width:36px;height:36px;border-radius:50%;background:#ddd;"></div>`}
            <div><b>${S.cravingBanner.char.handle||S.cravingBanner.char.name}</b>：${S.cravingBanner.text}
              <div style="font-size:11px;opacity:.7;">点击 → 立刻为它下厨</div></div>
          </div>`:""}

        <div class="stove-fixed">
          <div class="stove">
            <div class="pan-holder" id="pan">
              ${panSVG(S.pot)}
              <div class="pan-food">${foodDots}</div>
            </div>
            <div class="flame-holder" id="flame">${flameSVG(S.fire)}</div>
            <div class="fx-layer" id="fxLayer"></div>
          </div>
          <div class="fire-ctrl">
            <span>🚫</span>
            <input type="range" min="0" max="4" value="${S.fire}" id="fire">
            <span>猛🔥</span>
            <span style="color:#999;font-size:11px;">${["熄火","小火","中火","中大火","猛火"][S.fire]}</span>
          </div>
        </div>

        <div class="h">锅具</div>
        <div class="row">${POTS.map(p=>`<div class="chip ${S.pot===p.id?"on":""}" data-pot="${p.id}">${p.name}·${p.tag}</div>`).join("")}</div>

        <div class="h">工具（墙上挂着）</div>
        <div class="row">${TOOLS.map(t=>`<div class="chip ${S.tool===t.id?"on":""}" data-tool="${t.id}">${t.id==="spatula"?"🥄":"🍶"} ${t.name}</div>`).join("")}</div>

        <div class="h">调料·台面常用（点击加入并触发特效）</div>
        <div class="grid">${SPICES_COMMON.map(s=>`<div class="cell ${S.spices.includes(s)?"on":""}" data-sp="${s}" title="${SPICE_FX[s]?.name||""}">${s}</div>`).join("")}</div>

        <div class="cabinet">
          <div class="hd" id="cabHd"><span>${S.cabinetOpen?"▼":"▶"} 柜子里的稀有调料</span><span style="opacity:.5;">${S.cabinetOpen?"收起":"打开"}</span></div>
          ${S.cabinetOpen?`<div class="grid" style="margin-top:6px;">${SPICES_CABINET.map(s=>`<div class="cell ${S.spices.includes(s)?"on":""}" data-sp="${s}" title="${SPICE_FX[s]?.name||""}">${s}</div>`).join("")}</div>`:""}
        </div>

        <div class="h">食材</div>
        ${Object.entries(FRIDGE).map(([cat,list])=>`
          <div style="font-size:12px;color:#888;margin:6px 0 4px;">${cat}</div>
          <div class="grid">${list.map(e=>`<div class="cell ${S.picked.includes(e)?"on":""}" data-e="${e}">${e}</div>`).join("")}</div>
        `).join("")}
        ${S.custom.length?`<div style="font-size:12px;color:#888;margin:8px 0 4px;">自定义</div>
          <div class="grid">${S.custom.map(c=>`<div class="cell ${S.picked.includes("::"+c.id)?"on":""}" data-ce="${c.id}" title="${c.name}">${c.image?`<img src="${c.image}" style="width:100%;height:100%;border-radius:8px;object-fit:cover;">`:(c.emoji||"🖼")}</div>`).join("")}</div>`:""}

        <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn" id="toss" ${S.picked.length===0||S.fire===0?"disabled":""}>🥢 颠勺</button>
          <button class="btn" id="cook" ${S.picked.length===0||S.fire===0?"disabled":""}>🍳 出锅</button>
          <button class="btn ghost" id="clr">清空</button>
        </div>
      `;

      // 事件
      const $=(s)=>el.querySelector(s);
      $("#fire").oninput=(e)=>{ S.fire=+e.target.value; $("#flame").innerHTML=flameSVG(S.fire); el.querySelectorAll(".fire-ctrl span")[2].textContent=["熄火","小火","中火","中大火","猛火"][S.fire]; };
      el.querySelectorAll("[data-pot]").forEach(x=>x.onclick=()=>{S.pot=x.dataset.pot;render();});
      el.querySelectorAll("[data-tool]").forEach(x=>x.onclick=()=>{S.tool=x.dataset.tool;render();});
      el.querySelectorAll("[data-sp]").forEach(x=>x.onclick=()=>{
        const s=x.dataset.sp; const i=S.spices.indexOf(s);
        if(i>=0){ S.spices.splice(i,1); render(); }
        else { S.spices.push(s); render(); setTimeout(()=>playSpiceFx(s), 50); }
      });
      el.querySelectorAll("[data-e]").forEach(x=>x.onclick=()=>{
        const e=x.dataset.e; const i=S.picked.indexOf(e);
        if(i>=0) S.picked.splice(i,1); else S.picked.push(e); render();
      });
      el.querySelectorAll("[data-ce]").forEach(x=>x.onclick=()=>{
        const k="::"+x.dataset.ce; const i=S.picked.indexOf(k);
        if(i>=0) S.picked.splice(i,1); else S.picked.push(k); render();
      });
      $("#cabHd").onclick=()=>{ S.cabinetOpen=!S.cabinetOpen; render(); };
      $("#clr").onclick=()=>{ S.picked=[]; S.spices=[]; render(); };
      $("#toss").onclick=()=>{
        const p=$("#pan"); p.classList.remove("toss"); void p.offsetWidth; p.classList.add("toss");
        roche.ui.toast("锵！颠勺～");
      };
      $("#cook").onclick=cookDish;
      const cb=$("#cravBanner"); if(cb) cb.onclick=()=>{ S.cravingBanner=null; render(); };
    }

    /* ---------- 出锅 ---------- */
    async function cookDish(){
      if(!S.picked.length||S.fire===0) return;
      const parts=[], tastes=new Set(), textures=new Set(), vibes=new Set();
      S.picked.forEach(e=>{
        if(e.startsWith("::")){ const c=S.custom.find(x=>x.id===e.slice(2)); if(c) parts.push(`${c.name}(${c.desc||""})`); }
        else { parts.push(e); const m=EMOJI_META[e]; if(m){tastes.add(m.t);textures.add(m.x);vibes.add(m.v);} }
      });
      S.spices.forEach(s=>{ const m=EMOJI_META[s]; if(m){tastes.add(m.t);textures.add(m.x);vibes.add(m.v);} });
      const pot = POTS.find(p=>p.id===S.pot);
      const fireLevel = ["熄火","小火","中火","中大火","猛火"][S.fire];
      roche.ui.toast(`${fireLevel} · ${pot.name}炒制中...`);

      const midnightHint = isLateNight ? "\n（现在是深夜，做出的菜请带一点治愈、独处、温暖的深夜食堂感）" : "";
      let dish={name:"神秘料理",desc:"",effect:"",appearance:""};
      try{
        const res=await roche.ai.chat({messages:[
          {role:"system",content:`你是会取名的厨师。根据食材、调料、锅具、火候起中文菜名。JSON：{"name":"","desc":"","effect":"","appearance":""}${midnightHint}`},
          {role:"user",content:`食材：${parts.join("、")}\n调料：${S.spices.map(s=>SPICE_FX[s]?.name||s).join("、")||"无"}\n锅具：${pot.name}(${pot.tag})\n火候：${fireLevel}\n工具：${S.tool}`}
        ],temperature:0.9});
        const m=(res.text||"").match(/\{[\s\S]*\}/); if(m) Object.assign(dish, JSON.parse(m[0]));
      }catch{
        dish.name = S.picked.filter(x=>!x.startsWith("::")).slice(0,3).join("") + pot.tag;
        dish.desc = `${fireLevel}下用${pot.name}${pot.tag}成的一道菜。`;
      }

      const rec={ id:crypto.randomUUID(), name:dish.name, desc:dish.desc,
        emojis:[...S.picked], spices:[...S.spices], pot:S.pot, tool:S.tool, fire:S.fire,
        taste:[...tastes].join("/")||"未知", texture:[...textures].join("/")||"未知",
        vibe:[...vibes].join("/")||"神秘", effect:dish.effect, appearance:dish.appearance,
        midnight:isLateNight, createdAt:Date.now() };
      S.recipes.unshift(rec); await roche.storage.set("recipes", S.recipes);
      S.picked=[]; S.spices=[]; roche.ui.toast(`✅ 出锅：${rec.name}`);
      // 讨菜的 Char 得到满足后，自动跳到投喂
      if(S.cravingBanner){
        S.pendingDish = rec;
        const cravChar = S.cravingBanner.char;
        S.cravingBanner = null;
        S.tab="feed"; render();
        setTimeout(()=>feedToChar(rec, cravChar), 300);
        return;
      }
      S.tab="book"; render();
    }

    /* ---------- 菜谱 ---------- */
    function renderBook(el){
      if(!S.recipes.length){ el.innerHTML=`<div style="text-align:center;color:#aaa;padding:40px;">还没有菜，去料理台炒一个</div>`; return; }
      el.innerHTML = S.recipes.map(r=>`
        <div class="card">
          <div class="dish-emo">${r.emojis.map(e=>e.startsWith("::")?"🖼":e).join(" ")}${r.spices?.length?" · "+r.spices.join(""):""}</div>
          <div class="dish-name">${r.name}${r.midnight?' <span style="font-size:10px;color:#ffb86b;">🌙</span>':""}</div>
          <div style="font-size:13px;color:#666;">${r.desc||""}</div>
          <div style="margin-top:6px;">
            <span class="tag">🍳 ${POTS.find(p=>p.id===r.pot)?.name||"锅"}</span>
            <span class="tag">🔥 ${["熄","小","中","中大","猛"][r.fire||2]}火</span>
            <span class="tag">味 ${r.taste}</span><span class="tag">感 ${r.texture}</span><span class="tag">氛 ${r.vibe}</span>
          </div>
          ${r.effect?`<div style="font-size:12px;color:#888;margin-top:4px;">✨ ${r.effect}</div>`:""}
          ${r.appearance?`<div style="font-size:12px;color:#888;">🎨 ${r.appearance}</div>`:""}
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn" data-act="feed" data-id="${r.id}">🥄 投喂</button>
            <button class="btn ghost" data-act="plate" data-id="${r.id}">🍽 放盘</button>
            <button class="btn ghost" data-act="gift" data-id="${r.id}">🎁 送给 Char</button>
            <button class="btn ghost" data-act="del" data-id="${r.id}">删除</button>
          </div>
        </div>`).join("");
      el.querySelectorAll("[data-act]").forEach(b=>b.onclick=async()=>{
        const r=S.recipes.find(x=>x.id===b.dataset.id); if(!r) return;
        const a=b.dataset.act;
        if(a==="del"){ S.recipes=S.recipes.filter(x=>x.id!==r.id); await roche.storage.set("recipes",S.recipes); render(); }
        else if(a==="plate"){ S.plate.push(r); roche.ui.toast("已放到盘子"); }
        else if(a==="feed"){ S.pendingDish=r; S.tab="feed"; render(); }
        else if(a==="gift"){ giftToChar(r); }
      });
    }

    async function giftToChar(dish){
      let chars=[]; try{ chars=await roche.character.list(); }catch{}
      if(!chars.length){ roche.ui.toast("没有 Char"); return; }
      const pick = await roche.ui.select?.({title:"送给谁？",options:chars.map(c=>({label:c.handle||c.name,value:c.id}))});
      const target = chars.find(c=>c.id===(pick?.value||pick)) || chars[0];
      const text = `🎁 ${target.handle||target.name}，送你一道亲手做的【${dish.name}】\n${dish.emojis.join(" ")}\n${dish.desc||""}`;
      try{
        if(roche.chat?.send) await roche.chat.send({conversationId:target.conversationId, text});
        else if(roche.character?.sendMessage) await roche.character.sendMessage({charId:target.id, text});
        else throw 0;
        roche.ui.toast("已发出 💌");
      }catch{ navigator.clipboard?.writeText(text); roche.ui.toast("已复制到剪贴板"); }
    }

    /* ---------- 投喂 ---------- */
    async function renderFeed(el){
      el.innerHTML=`<div style="text-align:center;color:#aaa;padding:20px;">读取 Char 中...</div>`;
      let chars=[]; try{ chars=await roche.character.list(); }catch{}
      const dish = S.pendingDish;
      el.innerHTML = `
        ${dish?`<div class="card"><div class="dish-emo">${dish.emojis.join(" ")}</div><div class="dish-name">🥄 准备投喂：${dish.name}</div></div>`
          :`<div style="text-align:center;color:#aaa;padding:20px;">先在【菜谱】点【投喂】选一道菜</div>`}
        <div class="h">选一位 Char</div>
        ${chars.length? chars.map(c=>`
          <div class="card" data-cid="${c.id}" style="cursor:pointer;display:flex;gap:10px;align-items:center;">
            ${c.avatar?`<img src="${c.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`:`<div style="width:44px;height:44px;border-radius:50%;background:#ddd;"></div>`}
            <div><div style="font-weight:700;">${c.handle||c.name}</div>
            <div style="font-size:12px;color:#888;">${(c.bio||"").slice(0,40)}</div></div>
          </div>`).join("") : `<div style="color:#aaa;text-align:center;padding:20px;">没有 Char</div>`}
        ${S.chatWith?renderChatBox():""}`;
      el.querySelectorAll("[data-cid]").forEach(c=>c.onclick=()=>{
        if(!dish){ roche.ui.toast("先选菜"); return; }
        feedToChar(dish, chars.find(x=>x.id===c.dataset.cid));
      });
      if(S.chatWith){
        el.querySelector("#chatSend").onclick=()=>sendChat(el);
        el.querySelector("#chatInput").onkeydown=(e)=>{ if(e.key==="Enter") sendChat(el); };
        el.querySelector("#chatDone").onclick=onChatDone;
      }
    }
    function renderChatBox(){
      return `<div class="h">💬 和 ${S.chatWith.name} 继续聊聊这道菜</div>
        <div class="chat-log">${S.chatLog.map(m=>`<div class="chat-msg ${m.role==='user'?'me':'other'}">${m.text}</div>`).join("")}</div>
        <div class="chat-in"><input id="chatInput" placeholder="想说什么..."><button class="btn" id="chatSend">发送</button></div>
        <div style="margin-top:8px;"><button class="btn ghost" id="chatDone">结束投喂</button></div>`;
    }
    async function feedToChar(dish, char){
      roche.ui.toast(`把 ${dish.name} 递给 ${char.handle||char.name}...`);
      let reply="",choice="吃";
      try{
        const res=await roche.ai.chat({messages:[
          {role:"system",content:`你扮演「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\nuser 端菜给你，从「吃/不吃/只尝一口/打翻/珍藏起来/其他」挑一种反应，写角色化评价。JSON：{"choice":"","comment":""}`},
          {role:"user",content:`菜名：${dish.name}\n${dish.desc||""}\n味:${dish.taste} 感:${dish.texture} 氛:${dish.vibe}`}
        ],temperature:1.0});
        const m=(res.text||"").match(/\{[\s\S]*\}/);
        if(m){ const j=JSON.parse(m[0]); choice=j.choice||choice; reply=j.comment||""; } else reply=res.text||"";
      }catch{ reply="（Char 沉默地看着这道菜）"; }
      S.feeds.unshift({ id:crypto.randomUUID(), charId:char.id, charName:char.handle||char.name,
        dishId:dish.id, dishName:dish.name, dishEmojis:dish.emojis, choice, reaction:reply, createdAt:Date.now() });
      await roche.storage.set("feedRecords", S.feeds);
      S.chatWith={ id:char.id, name:char.handle||char.name, char, dish };
      S.chatLog=[{role:"assistant",text:`（${choice}）${reply}`}];
      S.pendingDish=null; render();
    }
    async function sendChat(el){
      const inp=el.querySelector("#chatInput"); const t=inp.value.trim(); if(!t) return;
      inp.value=""; S.chatLog.push({role:"user",text:t}); render();
      try{
        const res=await roche.ai.chat({messages:[
          {role:"system",content:`你扮演「${S.chatWith.name}」。刚吃了「${S.chatWith.dish.name}」，继续和 user 聊天，保持角色。`},
          ...S.chatLog.map(m=>({role:m.role,content:m.text}))
        ],temperature:0.9});
        S.chatLog.push({role:"assistant",text:res.text||"..."}); render();
      }catch{ S.chatLog.push({role:"assistant",text:"（沉默）"}); render(); }
    }
    async function onChatDone(){
      const keep = await roche.ui.confirm({title:"保留这段投喂记忆？", message:`要把和 ${S.chatWith.name} 的这段厨房对话作为记忆保留下来吗？\n（选「否」将丢弃聊天，只保留最初评价）`});
      if(keep){
        try{
          const sum=await roche.ai.chat({messages:[
            {role:"system",content:"用一句 ≤60 字的话总结这段厨房投喂对话，作为角色事实记忆。"},
            {role:"user",content:S.chatLog.map(m=>`${m.role}:${m.text}`).join("\n")}
          ]});
          const text=(sum.text||"").trim();
          if(S.chatWith.char.conversationId && roche.memory?.write){
            await roche.memory.write({ conversationId:S.chatWith.char.conversationId, summaryText:text,
              who:[S.chatWith.name,"user"], action:text, when:"厨房投喂", where:"Char 的厨房", source:"plugin:char-kitchen" });
            roche.ui.toast("✅ 已写入主记忆");
          }
        }catch{ roche.ui.toast("记忆写入失败"); }
      } else roche.ui.toast("这段对话已丢弃");
      S.chatWith=null; S.chatLog=[]; render();
    }

    /* ---------- 冰箱 ---------- */
    function renderFridge(el){
      el.innerHTML=`
        <div style="margin:8px 0;display:flex;gap:8px;">
          <button class="btn ghost" id="addImg">➕ 导入图片食材</button>
          <button class="btn ghost" id="addEmo">➕ 输入 Emoji</button>
        </div>
        <div class="fridge-wrap">
          ${S.fridgeOpen?`
            <div class="fridge-in">
              ${Object.entries(FRIDGE).map(([cat,list])=>`
                <div class="sec"><div class="sec-title">${cat}</div>
                  <div class="row-scroll">${list.map(e=>`<div class="cell" data-e="${e}">${e}</div>`).join("")}</div></div>`).join("")}
              ${S.custom.length?`<div class="sec"><div class="sec-title">自定义</div>
                <div class="row-scroll">${S.custom.map(c=>`<div class="cell" data-ce="${c.id}" title="${c.name}">${c.image?`<img src="${c.image}" style="width:100%;height:100%;border-radius:8px;object-fit:cover;">`:(c.emoji||"🖼")}</div>`).join("")}</div></div>`:""}
              <div class="sec"><div class="sec-title">🍽 已做的菜（可再选）</div>
                <div class="row-scroll">${S.recipes.length?S.recipes.map(r=>`<div class="cell" data-r="${r.id}" title="${r.name}" style="font-size:18px;">${r.emojis[0]||"🍽"}</div>`).join(""):`<span style="color:#aaa;font-size:11px;">还没菜</span>`}</div></div>
            </div>`:""}
          <div class="fridge-door ${S.fridgeOpen?"open":""}" id="door">${S.fridgeOpen?"":"🧊"}</div>
        </div>
        <div class="h">🍽 盘子</div>
        <div class="plate ${S.plate.length?"":"empty"}">${S.plate.length? S.plate.map(x=>typeof x==="string"?(x.startsWith("::")?"🖼":x):(x.emojis?.[0]||"🍽")).join(" "):"（空盘子，点冰箱里的东西放进来）"}</div>
        <div style="text-align:center;margin-top:8px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
          <button class="btn" id="plateGift" ${S.plate.length?"":"disabled"}>🎁 送给 Char</button>
          <button class="btn ghost" id="platePan" ${S.plate.length?"":"disabled"}>♻️ 全部回锅</button>
          <button class="btn ghost" id="plateClr" ${S.plate.length?"":"disabled"}>🗑 清空</button>
        </div>`;
      el.querySelector("#door").onclick=()=>{ S.fridgeOpen=!S.fridgeOpen; render(); };
      el.querySelectorAll("[data-e]").forEach(x=>x.onclick=()=>{ S.plate.push(x.dataset.e); render(); });
      el.querySelectorAll("[data-ce]").forEach(x=>x.onclick=()=>{ S.plate.push("::"+x.dataset.ce); render(); });
      el.querySelectorAll("[data-r]").forEach(x=>x.onclick=()=>{ const r=S.recipes.find(y=>y.id===x.dataset.r); if(r) S.plate.push(r); render(); });
      el.querySelector("#addImg").onclick=importImage;
      el.querySelector("#addEmo").onclick=importEmoji;
      el.querySelector("#plateClr").onclick=()=>{ S.plate=[]; render(); };
      el.querySelector("#platePan").onclick=()=>{
        S.plate.forEach(p=>{ if(typeof p==="string") S.picked.push(p); });
        S.plate=[]; S.tab="stove"; render(); roche.ui.toast("已回锅");
      };
      el.querySelector("#plateGift").onclick=giftPlateToChar;
    }
    async function giftPlateToChar(){
      if(!S.plate.length) return;
      let chars=[]; try{ chars=await roche.character.list(); }catch{}
      if(!chars.length){ roche.ui.toast("没有 Char"); return; }
      const pick = await roche.ui.select?.({title:"送给谁？",options:chars.map(c=>({label:c.handle||c.name,value:c.id}))});
      const target = chars.find(c=>c.id===(pick?.value||pick)) || chars[0];
      const dishes=S.plate.filter(x=>typeof x!=="string");
      const raws=S.plate.filter(x=>typeof x==="string");
      const text=`🍽 送给 ${target.handle||target.name} 一盘：\n${dishes.map(d=>`【${d.name}】${d.emojis.join("")}`).join("\n")}${raws.length?`\n配菜：${raws.join(" ")}`:""}`;
      try{
        if(roche.chat?.send) await roche.chat.send({conversationId:target.conversationId, text});
        else if(roche.character?.sendMessage) await roche.character.sendMessage({charId:target.id, text});
        else { navigator.clipboard?.writeText(text); roche.ui.toast("已复制到剪贴板"); return; }
        roche.ui.toast("已送出 💌"); S.plate=[]; render();
      }catch{ roche.ui.toast("发送失败"); }
    }
    async function importImage(){
      const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
      inp.onchange=async()=>{
        const f=inp.files[0]; if(!f) return;
        const name=prompt("食材名字：","自制食材"); if(!name) return;
        const desc=prompt("描述（可留空）：","")||"";
        const image=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f);});
        S.custom.push({id:crypto.randomUUID(),name,desc,image});
        await roche.storage.set("customIngredients",S.custom); render();
      }; inp.click();
    }
    async function importEmoji(){
      const e=prompt("输入一个 emoji 作为食材："); if(!e) return;
      const name=prompt("名字：",e)||e;
      S.custom.push({id:crypto.randomUUID(),name,desc:"",image:"",emoji:e});
      await roche.storage.set("customIngredients",S.custom); render();
    }

    /* ---------- 设置 ---------- */
    function renderSet(el){
      el.innerHTML=`
        <div class="h">🎨 主题${isLateNight?"（当前深夜，默认已切 night）":""}</div>
        <div class="row">${Object.keys(THEMES).map(k=>`<div class="chip ${S.theme===k?"on":""}" data-th="${k}">${k}</div>`).join("")}</div>
        <div class="h">👥 Char 互动</div>
        <div class="row"><button class="btn ghost" id="callChar">📞 随机呼叫一位 Char 来讨菜</button></div>
        <div class="h">🧹 数据清理</div>
        <div class="row">
          <button class="btn ghost" id="clrPics">清除所有自定义食材图片</button>
          <button class="btn ghost" id="clrOne">单个清除图片</button>
        </div>
        <div class="h">📊 存储情况</div>
        <div class="card" style="font-size:13px;line-height:1.8;">
          菜谱：${S.recipes.length} 条<br>投喂：${S.feeds.length} 条<br>
          自定义食材：${S.custom.length} 个（其中带图 ${S.custom.filter(c=>c.image).length} 个）
        </div>
        <div class="h">☠️ 危险区</div>
        <div class="row"><button class="btn ghost" id="wipeAll" style="color:#c33;border-color:#c33;">清空全部厨房数据</button></div>`;
      el.querySelectorAll("[data-th]").forEach(b=>b.onclick=async()=>{
        S.theme=b.dataset.th; await roche.storage.set("theme",S.theme); render();
      });
      el.querySelector("#callChar").onclick=async()=>{
        S.cravingBanner=null; await maybeCraving_force(); S.tab="stove"; render();
      };
      el.querySelector("#clrPics").onclick=async()=>{
        if(!await roche.ui.confirm({title:"确认",message:"清除所有自定义食材的图片数据？食材本身保留。"}))return;
        S.custom=S.custom.map(c=>({...c,image:""}));
        await roche.storage.set("customIngredients",S.custom); render();
      };
      el.querySelector("#clrOne").onclick=async()=>{
        const withImg=S.custom.filter(c=>c.image);
        if(!withImg.length){ roche.ui.toast("没有带图的食材"); return; }
        const pick=await roche.ui.select?.({title:"清除哪个？",options:withImg.map(c=>({label:c.name,value:c.id}))});
        const id=pick?.value||pick; if(!id) return;
        S.custom=S.custom.map(c=>c.id===id?{...c,image:""}:c);
        await roche.storage.set("customIngredients",S.custom); render();
      };
      el.querySelector("#wipeAll").onclick=async()=>{
        if(!await roche.ui.confirm({title:"⚠️ 清空全部",message:"菜谱、投喂、自定义食材都会删除，不可恢复。继续？"}))return;
        S.recipes=[];S.feeds=[];S.custom=[];S.plate=[];
        await roche.storage.set("recipes",[]); await roche.storage.set("feedRecords",[]); await roche.storage.set("customIngredients",[]);
        render();
      };
    }
    async function maybeCraving_force(){
      try{
        const chars=await roche.character.list();
        if(!chars.length){ roche.ui.toast("没有 Char"); return; }
        const c=chars[Math.floor(Math.random()*chars.length)];
        const res=await roche.ai.chat({messages:[
          {role:"system",content:`你扮演「${c.name||c.handle}」。人设：${c.persona||c.bio||""}\n主动来 user 的厨房讨吃的，写一句短短的、带角色语气的讨菜台词（≤30字），不要引号。`},
          {role:"user",content:"你想吃什么？"}
        ],temperature:1.1});
        S.cravingBanner={ char:c, text:(res.text||"").trim()||"肚子饿了…做点吃的？" };
      }catch{ roche.ui.toast("呼叫失败"); }
    }

    render();
    maybeCraving();
  },
  async unmount(container){
    document.querySelectorAll('style[data-plugin="char-kitchen"]').forEach(s=>s.remove());
    container.replaceChildren();
  }
  }]
});
