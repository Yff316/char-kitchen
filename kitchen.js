window.RochePlugin.register({
id:"char-kitchen",
name:"给 Char 炒菜的厨房",
version:"4.7.1",
apps:[{
id:"char-kitchen-home",
name:"Char 的厨房",
icon:"restaurant",
async mount(container, roche){

/* ============ 数据 ============ */
const FRIDGE = {
  "肉类":["🥩","🍗","🍖","🥓","🍤","🦑","🦐","🦀","🐟","🦞","🥚"],
  "蔬菜":["🥬","🥒","🍆","🥦","🥕","🥔","🌽","🍠","🍄","🌶️","🧄","🧅","🫑","🥗"],
  "水果":["🍎","🍏","🍊","🍋","🍑","🍒","🍓","🍈","🍉","🍇","🥭","🥝","🍌","🍐","🍍","🥥"],
  "主食":["🍚","🍞","🍜","🍝","🥖","🥐","🥯","🥟","🍙","🍘","🌮","🌯","🥙","🥞"],
  "蛋点":["🍰","🎂","🧁","🍮","🍩","🍪","🍫","🍬","🍭","🍦","🍨","🍧"],
  "饮品":["🥛","🧃","☕","🍵","🧉","🍹","🍸","🍷","🍺","🥤"],
  "怪东西":["🦴","🍿","🧀","💊","🧫","🫘"],
};
const SPICE_FX = {
  "🧂":{name:"盐",p:"·",c:"#fff",anim:"burst"}, "🌶️":{name:"辣椒",p:"~",c:"#e63b1e",anim:"burst-shake"},
  "🍯":{name:"蜂蜜",p:"◉",c:"#e8a13b",anim:"drip"}, "🧈":{name:"黄油",p:"◐",c:"#ffe08a",anim:"halo"},
  "🫒":{name:"橄榄油",p:"◎",c:"#7ab648",anim:"swirl"}, "🥫":{name:"番茄酱",p:"●",c:"#d33",anim:"splash"},
  "🧄":{name:"蒜",p:"■",c:"#f5f0dc",anim:"burst"}, "🍶":{name:"料酒",p:"˜",c:"#b8d8ff",anim:"rise"},
  "🥃":{name:"威士忌",p:"🔥",c:"#d99a3a",anim:"flambe"}, "💊":{name:"神秘药",p:"✦",c:"#b06bff",anim:"twinkle"},
  "🧊":{name:"冰",p:"❄",c:"#a8d8ff",anim:"drop"}, "🌿":{name:"香草",p:"❦",c:"#5fb04a",anim:"drop"},
  "🫙":{name:"罐装",p:"·",c:"#c8bfae",anim:"burst"}, "⚗️":{name:"试剂",p:"○",c:"#6bd2c8",anim:"bubble"},
};
const SPICES_COMMON  = ["🧂","🌶️","🍯","🧈","🫒","🥫","🧄"];
const SPICES_CABINET = ["🍶","🥃","💊","🧊","🌿","🫙","⚗️"];
const DARK_EMOJIS = ["💊","🦴","🍿","🧀","🧫","🫘"];
const BUBBLE_EMOJIS = ["🍎","🍱","🍥","🍰","🍔","🥞","🍕","🥐","🍣","🍢","🍡","🍪","🍤","🥠","🍘","🍙","🍮"];
const EMOJI_META = {
  "🥩":{t:"咸鲜",x:"扎实",v:"豪华"},"🍗":{t:"咸香",x:"多汁",v:"满足"},
  "🥚":{t:"清淡",x:"嫩",v:"温柔"},"🥕":{t:"清甜",x:"脆",v:"营养"},
  "🌶️":{t:"辣",x:"脆",v:"火热"},"🍅":{t:"酸",x:"多汁",v:"鲜"},
  "🍑":{t:"甜",x:"多汁",v:"温柔"},"🍫":{t:"甜苦",x:"丝滑",v:"浪漫"},
  "🍯":{t:"甜",x:"粘稠",v:"温暖"},"🧂":{t:"咸",x:"颗粒",v:"基础"},
  "💊":{t:"苦",x:"硬",v:"神秘"},"🧄":{t:"辛香",x:"脆",v:"浓郁"},
};
const POTS = [{id:"wok",name:"炒锅",tag:"炒"},{id:"flat",name:"平底锅",tag:"煎"},{id:"pressure",name:"高压锅",tag:"汤"}];
const TOOLS = [{id:"spatula",name:"锅铲"},{id:"ladle",name:"汤勺"}];
const THEMES = {
  warm:{bg:"#fff7ec",ink:"#3a2a1a",acc:"#e8863b",card:"#fff",loader:"🍙"},
  night:{bg:"#161a2e",ink:"#e8ecff",acc:"#ffb86b",card:"#232842",loader:"🍘"},
  mint:{bg:"#eefaf3",ink:"#233a30",acc:"#3fb27f",card:"#fff",loader:"🍡"},
  pink:{bg:"#fff2f6",ink:"#40202c",acc:"#e668a0",card:"#fff",loader:"🍣"},
};

/* ============ 成就系统 ============ */
const HIDDEN_IDS = new Set(["cabinet_open","all_theme","reset_ach","wipe_all","konami","single_ingredient","only_spice","big_dish","dark_at_midnight","reactions_all","char_all_fed","late_night_open","seven_days"]);
const ACHIEVEMENTS = {
  first_cook:{icon:"👨‍🍳",name:"第一次下厨",desc:"完成第一道菜"}, ten_dishes:{icon:"📚",name:"厨神修行",desc:"菜谱累计 10 道菜"},
  thirty_dishes:{icon:"📗",name:"食谱学徒",desc:"菜谱累计 30 道菜"}, fifty_dishes:{icon:"📖",name:"食谱百科",desc:"菜谱累计 50 道菜"},
  hundred_dishes:{icon:"🏆",name:"米其林三星",desc:"菜谱累计 100 道菜"}, pot_all:{icon:"🍳",name:"锅具全通",desc:"三种锅都用过"},
  spice_common_all:{icon:"🧂",name:"厨台霸主",desc:"台面 7 种调料都用过"}, spice_all:{icon:"🧪",name:"调料收藏家",desc:"用过全部 14 种调料"},
  no_spice:{icon:"🥗",name:"极简主义",desc:"不放任何调料炒一道菜"}, max_fire:{icon:"🔥",name:"猛火大师",desc:"用猛火出锅一次"},
  low_fire:{icon:"🕯",name:"文火慢炖",desc:"用小火出锅一次"}, toss_master:{icon:"🥢",name:"颠勺达人",desc:"累计颠勺 20 次"},
  toss_hundred:{icon:"💫",name:"颠勺宗师",desc:"累计颠勺 100 次"}, wok_ten:{icon:"🥘",name:"炒锅专家",desc:"用炒锅出锅 10 道菜"},
  flat_ten:{icon:"🍳",name:"煎锅专家",desc:"用平底锅出锅 10 道菜"}, pressure_ten:{icon:"🍲",name:"炖汤专家",desc:"用高压锅出锅 10 道菜"},
  ingredient_master:{icon:"🌈",name:"食材大师",desc:"累计用过 30 种不同食材"}, spice_junkie:{icon:"⚗️",name:"调料狂魔",desc:"单次使用 5 种以上调料"},
  dark_master:{icon:"☠️",name:"绝命毒师",desc:"第一次制作黑暗料理"}, dark_five:{icon:"🧟",name:"深渊厨师",desc:"累计做出 5 道黑暗料理"},
  dark_ten:{icon:"👹",name:"克苏鲁的呼唤",desc:"累计做出 10 道黑暗料理"}, dark_thirty:{icon:"🕷",name:"疯狂化学家",desc:"累计做出 30 道黑暗料理"},
  pill_chef:{icon:"💊",name:"化学家的浪漫",desc:"用神秘药炒一道菜"}, bone_soup:{icon:"🦴",name:"骨汤秘方",desc:"用骨头炒一道菜"},
  cheese_pop:{icon:"🧀",name:"奶酪爆米花",desc:"同锅使用奶酪和爆米花"}, petri_dish:{icon:"🧫",name:"培养皿主厨",desc:"使用培养皿做一道菜"},
  seafood_fruit:{icon:"🍤",name:"禁忌搭配",desc:"海鲜和水果同锅"}, all_dark_emojis:{icon:"👺",name:"深渊图鉴",desc:"6 种怪东西全部用过"},
  midnight:{icon:"🌙",name:"深夜食堂",desc:"在深夜炒出一道菜"}, midnight_ten:{icon:"🦉",name:"夜猫子厨师",desc:"深夜累计做出 10 道菜"},
  midnight_thirty:{icon:"🌌",name:"永夜料理人",desc:"深夜累计做出 30 道菜"}, early_bird:{icon:"🌅",name:"晨光料理",desc:"清晨 5-8 点做一道菜"},
  lunch_chef:{icon:"🌞",name:"午间小炒",desc:"中午 11-13 点做一道菜"}, dinner_chef:{icon:"🌇",name:"晚餐时刻",desc:"傍晚 17-19 点做一道菜"},
  feed_first:{icon:"🥄",name:"第一次投喂",desc:"投喂 Char 一次"}, feed_ten:{icon:"💝",name:"喂养大师",desc:"累计投喂 10 次"},
  feed_thirty:{icon:"🍽",name:"专属厨师",desc:"累计投喂 30 次"}, feed_fifty:{icon:"👑",name:"御膳房主厨",desc:"累计投喂 50 次"},
  feed_hundred:{icon:"⭐",name:"投喂之王",desc:"累计投喂 100 次"}, feed_same:{icon:"🍱",name:"你最懂它",desc:"给同一个 Char 投喂 5 次"},
  feed_same_ten:{icon:"💞",name:"独家宠爱",desc:"给同一个 Char 投喂 10 次"}, craving_ans:{icon:"📞",name:"应召厨师",desc:"响应 Char 主动讨菜"},
  craving_five:{icon:"📢",name:"随叫随到",desc:"响应讨菜 5 次"}, craving_ten:{icon:"📣",name:"值班御厨",desc:"响应讨菜 10 次"},
  gift_first:{icon:"🎁",name:"心意送达",desc:"第一次送菜给 Char"}, gift_ten:{icon:"💐",name:"礼物大师",desc:"累计送菜 10 次"},
  refused:{icon:"🙅",name:"美食受害者",desc:"被 Char 拒绝一次"}, loved:{icon:"💖",name:"珍藏级",desc:"Char 说要珍藏起来"},
  spat_out:{icon:"🤮",name:"精神污染",desc:"Char 被你的菜吐出来"}, smashed:{icon:"💥",name:"打翻现场",desc:"Char 把菜打翻了"},
  one_bite:{icon:"👅",name:"浅尝辄止",desc:"Char 只尝了一口"}, reactions_all:{icon:"🎭",name:"情绪调色盘",desc:"收集 5 种不同反应(隐藏)"},
  memory_saved:{icon:"💭",name:"记忆保管员",desc:"第一次把投喂记忆写入 Char"}, memory_ten:{icon:"🧠",name:"记忆缝纫师",desc:"写入 10 段投喂记忆"},
  memory_thirty:{icon:"📿",name:"往事编年史",desc:"写入 30 段投喂记忆"}, char_all_fed:{icon:"🌍",name:"雨露均沾",desc:"投喂过 5 位不同 Char(隐藏)"},
  custom_first:{icon:"🖼",name:"食材创造者",desc:"添加第一个自定义食材"}, custom_ten:{icon:"🧑‍🎨",name:"食材艺术家",desc:"自定义食材达到 10 个"},
  custom_thirty:{icon:"🎨",name:"食材宇宙",desc:"自定义食材达到 30 个"}, custom_in_dish:{icon:"✨",name:"独一无二",desc:"用自定义食材做出一道菜"},
  cabinet_open:{icon:"🗝",name:"打开柜子的人",desc:"打开一次稀有调料柜(隐藏)"}, all_theme:{icon:"🎨",name:"色彩收藏家",desc:"切换过全部 4 个主题(隐藏)"},
  reset_ach:{icon:"🔄",name:"从头开始",desc:"重置过一次成就(隐藏)"}, wipe_all:{icon:"🗑",name:"厨房焚毁",desc:"清空过全部厨房数据(隐藏)"},
  single_ingredient:{icon:"☝",name:"孤勇者",desc:"只用一种食材出锅(隐藏)"}, only_spice:{icon:"🧂",name:"调料汤",desc:"只放调料没有食材出锅(隐藏)"},
  big_dish:{icon:"🍜",name:"满汉全席",desc:"一次放入 10 种以上食材(隐藏)"}, dark_at_midnight:{icon:"🕯",name:"午夜黑弥撒",desc:"深夜炒出一道黑暗料理(隐藏)"},
  konami:{icon:"🕹",name:"???",desc:"???"}, late_night_open:{icon:"🦇",name:"夜半来客",desc:"深夜时段打开厨房(隐藏)"},
  flambe_master:{icon:"🔥",name:"焰火表演",desc:"使用威士忌 flambé"}, mystic_trio:{icon:"🔮",name:"三位一体",desc:"同时使用神秘药+试剂+骨头"},
  seven_days:{icon:"📅",name:"常客",desc:"连续 7 天使用厨房(隐藏)"},
};

/* ============ 状态 ============ */
const hour = new Date().getHours();
const isRealLateNight = (hour>=22 || hour<4);
const S = {
  tab:"stove", pot:"wok", tool:"spatula", fire:2,
  picked:[], spices:[],
  recipes:(await roche.storage.get("recipes"))||[],
  feeds:(await roche.storage.get("feedRecords"))||[],
  custom:(await roche.storage.get("customIngredients"))||[],
  cabinetOpen:false,
  catOpen:{"肉类":true,"蔬菜":true,"水果":false,"主食":false,"蛋点":false,"饮品":false,"怪东西":false,"自定义":true},
  forceMidnight:(await roche.storage.get("forceMidnight"))||false,
  theme:(await roche.storage.get("theme")) || ((isRealLateNight||(await roche.storage.get("forceMidnight")))?"night":"warm"),
  paddingTop:(await roche.storage.get("paddingTop")) || 0,
  chatWith:null, chatLog:[], cravingBanner:null, pendingDish:null,
  bookTab:"all", feedTab:"feedChar", chatStatusOpen:true, isTyping:false,
  
  achievements:(await roche.storage.get("achievements"))||{}, spiceUsed:new Set((await roche.storage.get("spiceUsed"))||[]),
  potUsed:new Set((await roche.storage.get("potUsed"))||[]), ingredientsUsed:new Set((await roche.storage.get("ingredientsUsed"))||[]),
  darkEmojisUsed:new Set((await roche.storage.get("darkEmojisUsed"))||[]), darkCount:(await roche.storage.get("darkCount"))||0,
  midnightCount:(await roche.storage.get("midnightCount"))||0, cravingAnsCount:(await roche.storage.get("cravingAnsCount"))||0,
  memoryCount:(await roche.storage.get("memoryCount"))||0, tossCount:(await roche.storage.get("tossCount"))||0,
  giftCount:(await roche.storage.get("giftCount"))||0, feedPerChar:(await roche.storage.get("feedPerChar"))||{},
  potDishCount:(await roche.storage.get("potDishCount"))||{wok:0,flat:0,pressure:0}, reactionSet:new Set((await roche.storage.get("reactionSet"))||[]),
  themesUsed:new Set((await roche.storage.get("themesUsed"))||[]), lastCookDate:(await roche.storage.get("lastCookDate"))||"",
  consecutiveCookDays:(await roche.storage.get("consecutiveCookDays"))||0, achOpen:true, konamiSeq:[],
};
const isLateNight = isRealLateNight || S.forceMidnight;

function renderEmo(e, size=26){
  if(e.startsWith("::")){
    const c = S.custom.find(x => x.id === e.slice(2));
    if(c) return c.image ? `<img src="${c.image}" style="width:${size}px;height:${size}px;object-fit:cover;vertical-align:text-bottom;display:inline-block;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.2);">` : (c.emoji || "🖼");
    return "🖼";
  }
  return e;
}
function renderEmoList(emojis, size=26){
  if(!emojis || emojis.length===0) return "";
  if(emojis.length <= 6) return emojis.map(e => renderEmo(e, size)).join("");
  const head = emojis.slice(0, 3).map(e => renderEmo(e, size)).join("");
  const tail = emojis.slice(-3).map(e => renderEmo(e, size)).join("");
  return `${head}<span style="margin:0 4px;color:#888;font-weight:bold;font-size:${size*0.7}px;vertical-align:middle;">···</span>${tail}`;
}

/* ============ 样式 ============ */
const style=document.createElement("style");
style.setAttribute("data-plugin","char-kitchen");
style.textContent=`
.ck{--bg:#fff7ec;--ink:#3a2a1a;--acc:#e8863b;--card:#fff;
  position:fixed;inset:0;background:var(--bg);color:var(--ink);
  font-family:system-ui,'PingFang SC',sans-serif;
  display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;}
.ck-top{display:flex;justify-content:space-between;align-items:center;
  padding:10px 16px;font-weight:700;border-bottom:1px solid rgba(0,0,0,.05);flex-shrink:0;}
.ck-close{border:none;background:transparent;font-size:22px;cursor:pointer;color:var(--ink);}
.ck-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px 16px 20px;position:relative;scroll-behavior:smooth;}
.ck-nav{height:60px;background:var(--card);display:flex;
  box-shadow:0 -4px 20px rgba(0,0,0,.08);border-top:1px solid rgba(0,0,0,.05);flex-shrink:0;}
.ck-nav button{flex:1;background:none;border:none;font-size:11px;color:#888;cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;}
.ck-nav button.on{color:var(--acc);font-weight:700;}
.ck-nav .ico{font-size:20px;}
.midnight-tag{display:inline-block;padding:2px 10px;border-radius:10px;
  background:linear-gradient(90deg,#3a3f6b,#5a3a6b);color:#ffb86b;font-size:11px;margin-left:8px;}
.craving{background:linear-gradient(90deg,#ffdcae,#ffb98a);padding:10px 14px;border-radius:12px;
  margin:8px 0;cursor:pointer;display:flex;gap:10px;align-items:center;font-size:13px;
  box-shadow:0 4px 12px rgba(232,134,59,.2);}
.craving img{width:36px;height:36px;border-radius:50%;object-fit:cover;}
.stove-fixed{position:sticky;top:0;background:var(--bg);padding:8px 0 4px;z-index:3;}
.stove{position:relative;width:100%;max-width:340px;height:200px;margin:0 auto;
  background:linear-gradient(180deg,#f6dfb8,#d9b878);border-radius:20px;overflow:visible;
  box-shadow:inset 0 -6px 0 rgba(0,0,0,.08);}
.ck[data-theme=night] .stove{background:linear-gradient(180deg,#2a2e4a,#1a1d2e);}
.pan-holder{position:absolute;left:50%;top:40px;transform:translateX(-50%);
  width:200px;height:80px;z-index:2;cursor:pointer;transform-origin:50% 100%;}
.pan-holder.toss{animation:toss .7s ease;}
@keyframes toss{0%{transform:translateX(-50%) rotate(0);} 30%{transform:translateX(-50%) rotate(-22deg) translateY(-18px);} 60%{transform:translateX(-50%) rotate(14deg) translateY(-10px);} 100%{transform:translateX(-50%) rotate(0);}}
.pan-holder.shake{animation:panShake .1s linear 5;}
@keyframes panShake{0%,100%{transform:translateX(-50%);}50%{transform:translateX(calc(-50% + 4px));}}
.pan-svg{width:100%;height:100%;overflow:visible;}
.pan-food{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:0 0 50% 50%/0 0 100% 100%;}
.pan-food span{position:absolute;font-size:18px;transform:translate(-50%,-50%);transition:left .3s ease,top .3s ease;}
.pan-food span img{display:block;}
.flame-holder{position:absolute;left:50%;top:90px;transform:translateX(-50%);
  width:80px;height:100px;z-index:1;pointer-events:none;display:flex;justify-content:center;align-items:flex-start;}
.fire-ctrl{display:flex;align-items:center;justify-content:center;gap:10px;padding:6px 0;font-size:12px;}
.fire-ctrl input[type=range]{width:180px;accent-color:var(--acc);}
.spice-fx-layer{position:fixed;pointer-events:none;z-index:9999;left:0;top:0;width:100vw;height:100vh;overflow:hidden;}
.sp-p{position:fixed;font-weight:bold;}
@keyframes sp-burst{0%{transform:translate(0,0) scale(.3);opacity:1;}100%{transform:translate(var(--dx),var(--dy)) scale(1);opacity:0;}}
@keyframes sp-drip{0%{transform:translate(0,0);opacity:1;}100%{transform:translate(var(--dx),var(--dy)) scale(.5);opacity:0;}}
@keyframes sp-rise{0%{transform:translate(0,0);opacity:0;}20%{opacity:1;}100%{transform:translate(var(--dx),calc(var(--dy) - 40px));opacity:0;}}
@keyframes sp-swirl{0%{transform:translate(0,0) rotate(0);opacity:1;}100%{transform:translate(var(--dx),var(--dy)) rotate(720deg);opacity:0;}}
@keyframes sp-splash{0%{transform:translate(0,0) scale(0);opacity:1;}100%{transform:translate(var(--dx),var(--dy)) scale(2.2);opacity:0;}}
@keyframes sp-halo{0%{transform:scale(.3);opacity:1;}100%{transform:scale(3);opacity:0;}}
@keyframes sp-flambe{0%{transform:translate(0,0) scale(.3);opacity:1;}50%{transform:translate(calc(var(--dx)/2),calc(var(--dy) - 20px)) scale(1.8);opacity:.9;}100%{transform:translate(var(--dx),var(--dy)) scale(2.5);opacity:0;}}
@keyframes sp-twinkle{0%,100%{transform:translate(0,0) scale(1);opacity:.3;}50%{transform:translate(var(--dx),var(--dy)) scale(1.5) rotate(180deg);opacity:1;}}
@keyframes sp-drop{0%{transform:translate(0,0);opacity:0;}30%{opacity:1;}100%{transform:translate(var(--dx),var(--dy)) scale(.8);opacity:0;}}
@keyframes sp-bubble{0%{transform:translate(0,0) scale(.5);opacity:0;}30%{opacity:1;}100%{transform:translate(var(--dx),var(--dy)) scale(1.4);opacity:0;}}
.sp-p.burst,.sp-p.burst-shake{animation:sp-burst 1s ease-out forwards;} .sp-p.drip{animation:sp-drip 1.4s ease-in forwards;}
.sp-p.halo{animation:sp-halo 1s ease-out forwards;} .sp-p.swirl{animation:sp-swirl 1.2s linear forwards;}
.sp-p.splash{animation:sp-splash 1s ease-out forwards;} .sp-p.rise{animation:sp-rise 1.5s ease-out forwards;}
.sp-p.flambe{animation:sp-flambe 1s ease-out forwards;} .sp-p.twinkle{animation:sp-twinkle 1.5s ease-in-out forwards;}
.sp-p.drop{animation:sp-drop 1.6s ease-in forwards;} .sp-p.bubble{animation:sp-bubble 1.8s ease-out forwards;}
.row{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;}
.chip{padding:5px 10px;border:1px solid rgba(0,0,0,.1);background:var(--card);border-radius:16px;cursor:pointer;font-size:12px;}
.chip.on{background:var(--acc);color:#fff;border-color:var(--acc);}
.h{font-weight:700;margin:12px 0 6px;font-size:13px;display:flex;justify-content:space-between;align-items:center;}
.h .caret{font-size:11px;color:#999;cursor:pointer;user-select:none;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:5px;}
.cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:22px;background:var(--card);border-radius:10px;cursor:pointer;user-select:none;transition:.15s;position:relative;}
.cell.on{background:var(--acc);transform:scale(1.08);}
.cabinet{border:1px dashed rgba(0,0,0,.15);border-radius:12px;padding:8px;margin-top:6px;}
.btn{padding:9px 16px;border:none;background:var(--acc);color:#fff;border-radius:10px;cursor:pointer;font-weight:700;font-size:13px;box-shadow:0 3px 10px rgba(0,0,0,.1);}
.btn.ghost{background:transparent;color:var(--acc);border:1.5px solid var(--acc);box-shadow:none;}
.btn:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;}
.card{background:var(--card);border-radius:14px;padding:12px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.04);}
.card.dark{background:linear-gradient(135deg,#1a1023,#2a1035);color:#e8c8ff;border:1px solid #6a2a8a;box-shadow:0 0 16px rgba(140,60,200,.3);}
.card.dark .tag{background:rgba(255,255,255,.08);color:#c8a8e8;}
.dish-emo{font-size:26px;letter-spacing:2px;line-height:30px;}
.dish-name{font-weight:700;font-size:15px;margin:4px 0;}
.tag{display:inline-block;background:rgba(0,0,0,.06);padding:2px 8px;border-radius:10px;font-size:11px;margin:2px 4px 2px 0;color:#666;}
.overlay{position:fixed;inset:0;background:rgba(20,15,10,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9998;}
.ck[data-theme=night] .overlay{background:rgba(5,8,20,.8);}
.loader-box{background:#fff;border-radius:20px;padding:32px 44px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5);min-width:220px;color:#000;}
.spinner{font-size:48px;display:inline-block;animation:spin 1.2s linear infinite;}
@keyframes spin{0%{transform:rotate(0);}100%{transform:rotate(360deg);}}
.loader-text{margin-top:12px;font-size:13px;color:#000;font-weight:600;}
.congrats{background:linear-gradient(135deg,#fff5c8,#ffd76a,#ff9a3c);border-radius:20px;padding:26px;text-align:center;color:#5a3a10;box-shadow:0 0 60px rgba(255,180,60,.7),inset 0 0 30px rgba(255,255,255,.5);animation:pop .5s ease-out,glow 2s ease-in-out infinite alternate;max-width:320px;}
.congrats.dark{background:linear-gradient(135deg,#2a0d3a,#5a1a6a,#8a2a9a);color:#f0d8ff;box-shadow:0 0 60px rgba(160,60,200,.6),inset 0 0 30px rgba(200,100,240,.3);}
.congrats.dark h3{text-shadow:0 0 20px #b06bff,0 0 40px #6a2a8a;animation:evilGlow 1.5s ease-in-out infinite alternate;}
@keyframes evilGlow{0%{filter:hue-rotate(0);}100%{filter:hue-rotate(30deg) brightness(1.2);}}
@keyframes pop{0%{transform:scale(.5);opacity:0;}100%{transform:scale(1);opacity:1;}}
@keyframes glow{0%{filter:brightness(1);}100%{filter:brightness(1.15);}}
.congrats h3{margin:6px 0;font-size:20px;}
.congrats .big-emo{font-size:60px;margin:8px 0;filter:drop-shadow(0 0 20px rgba(255,255,150,.9));}
@keyframes darkPulse{0%{opacity:0;transform:scale(1.2);}20%{opacity:1;}100%{opacity:0;transform:scale(1);}}
@keyframes bodyShake{0%,100%{transform:translate(0,0);}25%{transform:translate(-3px,2px);}75%{transform:translate(3px,-2px);}}
.chat-page{display:flex;flex-direction:column;height:100%;}
.chat-head{display:flex;align-items:center;gap:12px;padding:10px;background:var(--card);border-radius:12px;margin-bottom:10px;}
.chat-head img{width:56px;height:56px;border-radius:50%;object-fit:cover;}
.chat-head .info{flex:1;}
.chat-head .name{font-weight:700;font-size:15px;}
.chat-head .sub{font-size:11px;color:#888;display:flex;align-items:center;gap:2px;}
.status-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;overflow:hidden;transition:max-height 0.3s ease;}
.status-cell{background:var(--card);border-radius:10px;padding:8px 10px;font-size:12px;line-height:1.4;}
.status-cell .lbl{font-size:10px;color:#999;font-weight:700;margin-bottom:2px;}
.chat-log{background:var(--card);border-radius:12px;padding:10px;flex:1;overflow-y:auto;min-height:150px; scroll-behavior: smooth;}
.chat-msg{margin-bottom:6px;padding:8px 12px;border-radius:12px;max-width:85%;font-size:13px;line-height:1.5;}
.chat-msg.me{background:var(--acc);color:#fff;margin-left:auto;}
.chat-msg.other{background:rgba(0,0,0,.05);}
.ck[data-theme=night] .chat-msg.other{background:rgba(255,255,255,.08);}
.chat-in{display:flex;gap:6px;margin-top:8px;}
.chat-in input{flex:1;padding:9px;border:1px solid rgba(0,0,0,.1);border-radius:10px;background:var(--card);color:var(--ink);}
.textarea{width:100%;min-height:80px;padding:10px;border:1px solid rgba(0,0,0,.1);border-radius:10px;background:var(--card);color:var(--ink);font:inherit;box-sizing:border-box;}
.share-code{font-size:11px;color:var(--acc);margin-top:4px;font-family:ui-monospace,Menlo,monospace;cursor:pointer;word-break:break-all;}
.tab-bar{display:flex;background:var(--card);border-radius:12px;padding:4px;margin-bottom:12px;}
.tab-bar button{flex:1;padding:8px;border:none;background:transparent;border-radius:8px;font-weight:700;color:#888;cursor:pointer;transition:0.2s;}
.tab-bar button.on{background:var(--acc);color:#fff;}
@keyframes floatUp { 0% { transform: translateY(100vh) scale(0.5); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-100px) scale(1.2); opacity: 0; } }
.feed-bubble { position:absolute; font-size:46px; padding:10px; animation: floatUp linear infinite; cursor:pointer; user-select:none; z-index:10; filter:drop-shadow(0 4px 8px rgba(0,0,0,.2)); transition:transform 0.15s;}
.feed-bubble:hover { transform:scale(1.1); animation-play-state:paused; }
.feed-bubble:active { transform:scale(0.9) !important; }
.typing-dots { display:inline-flex; gap:4px; align-items:center; height:18px; padding:0 4px; }
.typing-dots span { width:6px; height:6px; background:currentColor; border-radius:50%; animation:bounce 1.4s infinite ease-in-out both; opacity:0.6; }
.typing-dots span:nth-child(1) { animation-delay:-0.32s; } .typing-dots span:nth-child(2) { animation-delay:-0.16s; }
@keyframes bounce { 0%, 80%, 100% { transform:scale(0); } 40% { transform:scale(1); } }
`;
document.head.appendChild(style);

/* ============ 挂载 ============ */
container.innerHTML=`<div class="ck" data-theme="${S.theme}">
  <div class="ck-top">
    <div>🍳 Char 的厨房${isLateNight?'<span class="midnight-tag">🌙 深夜食堂</span>':''}</div>
    <button class="ck-close">×</button>
  </div>
  <div class="ck-body" id="ckBody"></div>
  <div class="ck-nav" id="ckNav">
    ${[["stove","🍳","料理台"],["book","📖","菜谱"],["feed","🥄","投喂"],["custom","🖼","自定义"],["set","⚙️","设置"]]
      .map(([k,i,n])=>`<button data-t="${k}"><span class="ico">${i}</span>${n}</button>`).join("")}
  </div>
</div>`;
const root=container.querySelector(".ck");
const body=container.querySelector("#ckBody");
container.querySelector(".ck-close").onclick=()=>roche.ui.closeApp();

function applyTheme(){
  const t=THEMES[S.theme]||THEMES.warm;
  root.style.setProperty("--bg",t.bg); root.style.setProperty("--ink",t.ink);
  root.style.setProperty("--acc",t.acc); root.style.setProperty("--card",t.card);
  root.setAttribute("data-theme",S.theme);
  root.style.paddingTop = S.paddingTop + "px";
}
function nav(){
  container.querySelectorAll("#ckNav button").forEach(b=>{
    b.classList.toggle("on",b.dataset.t===S.tab);
    b.onclick=()=>{ S.tab=b.dataset.t; render(); };
  });
}

function scrollToBottom(el) {
  setTimeout(() => { if(el) el.scrollTop = el.scrollHeight; }, 50);
}

/* ============ 火焰 & 锅 ============ */
function flameSVG(level){
  if(level===0) return `<div style="opacity:.4;font-size:11px;color:#888;margin-top:20px;">🚫 熄火</div>`;
  const scale=0.4+level*0.28, w=60*scale, h=80*scale;
  return `<svg width="${w}" height="${h}" viewBox="0 0 60 80">
    <defs><radialGradient id="fg${level}" cx="50%" cy="80%" r="60%">
      <stop offset="0%" stop-color="#fff2b0"/><stop offset="40%" stop-color="#ffb03a"/><stop offset="100%" stop-color="#e63b1e" stop-opacity="0.9"/>
    </radialGradient></defs>
    <path fill="url(#fg${level})" d="M30 78 C 5 65, 10 40, 25 25 C 22 40, 35 42, 32 22 C 40 30, 52 45, 48 62 C 46 72, 40 78, 30 78 Z">
      <animate attributeName="d" dur="${(0.8-level*0.1).toFixed(2)}s" repeatCount="indefinite" values="M30 78 C 5 65, 10 40, 25 25 C 22 40, 35 42, 32 22 C 40 30, 52 45, 48 62 C 46 72, 40 78, 30 78 Z; M30 78 C 8 68, 6 38, 22 22 C 24 42, 36 40, 30 18 C 42 28, 54 46, 50 64 C 46 74, 40 78, 30 78 Z; M30 78 C 5 65, 10 40, 25 25 C 22 40, 35 42, 32 22 C 40 30, 52 45, 48 62 C 46 72, 40 78, 30 78 Z"/>
    </path>
    <path fill="#fff2a0" opacity=".9" d="M30 74 C 18 66, 20 48, 28 36 C 27 46, 34 46, 32 32 C 38 40, 44 52, 42 64 C 40 70, 36 74, 30 74 Z">
      <animate attributeName="opacity" values=".9;.5;.9" dur=".4s" repeatCount="indefinite"/>
    </path>
  </svg>`;
}
function panSVG(pot){
  if(pot==="pressure") return `<svg class="pan-svg" viewBox="0 0 200 80"><ellipse cx="100" cy="55" rx="80" ry="22" fill="#555"/><rect x="88" y="10" width="24" height="14" rx="3" fill="#888"/><ellipse cx="100" cy="35" rx="70" ry="10" fill="#777"/></svg>`;
  if(pot==="flat") return `<svg class="pan-svg" viewBox="0 0 200 80"><ellipse cx="85" cy="54" rx="70" ry="16" fill="#2a2a2a"/><ellipse cx="85" cy="50" rx="66" ry="12" fill="#3d3d3d"/><rect x="150" y="48" width="45" height="6" rx="3" fill="#6b3e1a"/></svg>`;
  return `<svg class="pan-svg" viewBox="0 0 200 80"><path d="M20 42 Q100 100 180 42 Z" fill="#2a2a2a"/><ellipse cx="100" cy="44" rx="72" ry="6" fill="#1a1a1a"/></svg>`;
}

/* ============ 调料特效 ============ */
function playSpiceFx(spice){
  const fx=SPICE_FX[spice]; if(!fx) return;
  const panEl=container.querySelector("#pan");
  if(!panEl){ roche.ui.toast(`${fx.name} 已加入！`); return; }
  const rect=panEl.getBoundingClientRect();
  const ox=rect.left+rect.width/2, oy=rect.top+rect.height*0.35, spread=rect.width*0.3;
  let layer=document.querySelector(".spice-fx-layer");
  if(!layer){ layer=document.createElement("div"); layer.className="spice-fx-layer"; document.body.appendChild(layer); }
  const count={burst:14,"burst-shake":14,drip:6,halo:1,swirl:10,splash:6,rise:10,flambe:3,twinkle:12,drop:12,bubble:10}[fx.anim]||10;
  for(let i=0;i<count;i++){
    const p=document.createElement("span"); p.className=`sp-p ${fx.anim}`; p.textContent=fx.p; p.style.color=fx.c;
    const startX=ox+(Math.random()-.5)*spread, startY=oy-40-Math.random()*20;
    p.style.left=startX+"px"; p.style.top=startY+"px"; p.style.fontSize=(14+Math.random()*8)+"px";
    p.style.setProperty("--dx",(ox-startX)+(Math.random()-.5)*20+"px"); p.style.setProperty("--dy",(oy-startY)+Math.random()*10+"px");
    p.style.animationDelay=(Math.random()*.25)+"s"; layer.appendChild(p); setTimeout(()=>p.remove(),2200);
  }
  if(spice==="🌶️"){ panEl.classList.add("shake"); setTimeout(()=>panEl.classList.remove("shake"),500); }
  roche.ui.toast(`${fx.name} 已加入！`);
}

/* ============ Loading / 弹窗 ============ */
function showLoading(text){
  hideLoading();
  const o=document.createElement("div"); o.className="overlay"; o.id="ckLoading";
  o.innerHTML=`<div class="loader-box"><div class="spinner">${THEMES[S.theme]?.loader||"🍙"}</div><div class="loader-text">${text}</div></div>`;
  document.body.appendChild(o);
}
function hideLoading(){ document.getElementById("ckLoading")?.remove(); }
function showCongrats(dish, dark){
  return new Promise(resolve=>{
    const o=document.createElement("div"); o.className="overlay";
    o.innerHTML=`<div class="congrats ${dark?"dark":""}">
      <div style="font-size:12px;letter-spacing:4px;opacity:.7;">${dark?"☠️ 黑暗料理诞生":"🎉 恭喜获得"}</div>
      <div class="big-emo" style="display:flex;justify-content:center;gap:4px;margin-top:10px;">${renderEmoList(dish.emojis, 54)}</div>
      <h3>${dish.name}</h3>
      <div style="font-size:13px;margin:6px 0;opacity:.85;">${dish.desc||""}</div>
      ${dish.effect?`<div style="font-size:12px;opacity:.75;">✨ ${dish.effect}</div>`:""}
      <button class="btn" style="margin-top:14px;background:${dark?"#8a3aa8":"#e8863b"};" id="okBtn">收下这道菜</button>
    </div>`;
    document.body.appendChild(o); o.querySelector("#okBtn").onclick=()=>{ o.remove(); resolve(); };
  });
}
async function editableDialog(title, initial){
  return new Promise(resolve=>{
    const o=document.createElement("div"); o.className="overlay";
    o.innerHTML=`<div class="loader-box" style="text-align:left;max-width:340px;width:90%;">
      <div style="font-weight:700;margin-bottom:8px;color:#000;">${title}</div>
      <textarea class="textarea" id="ta" style="min-height:120px;">${initial||""}</textarea>
      <div style="display:flex;gap:8px;margin-top:10px;justify-content:flex-end;">
        <button class="btn ghost" id="cn">取消</button><button class="btn" id="ok">保存</button>
      </div></div>`;
    document.body.appendChild(o);
    o.querySelector("#cn").onclick=()=>{ o.remove(); resolve(null); };
    o.querySelector("#ok").onclick=()=>{ const v=o.querySelector("#ta").value.trim(); o.remove(); resolve(v); };
  });
}
function darkFlash(){
  const f=document.createElement("div");
  f.style.cssText=`position:fixed;inset:0;z-index:10000;pointer-events:none;background:radial-gradient(circle at 50% 50%,rgba(180,60,220,.5),rgba(20,0,30,.9));animation:darkPulse 1.6s ease-out forwards;`;
  document.body.appendChild(f); setTimeout(()=>f.remove(),1700);
  document.body.style.animation="bodyShake .1s linear 8"; setTimeout(()=>{ document.body.style.animation=""; },900);
}
async function showErrorDialog(actionName) {
  return await roche.ui.confirm({ title: "生成失败", message: `${actionName}时发生错误。AI 可能开小差了，要重试吗？\n(取消则返回上一页)` });
}

/* ============ 黑暗料理判定 ============ */
function isDarkCombo(picked, spices){
  const dark = picked.some(e=>DARK_EMOJIS.includes(e));
  const seaFruit = picked.some(e=>["🍤","🦑","🦐","🦀","🐟","🦞"].includes(e)) && picked.some(e=>["🍎","🍏","🍓","🍒","🍑","🍰","🍫","🍩"].includes(e));
  const chaos = spices.length>=4;
  const sweetSalty = spices.includes("🧂")&&spices.includes("🍯")&&spices.includes("🌶️");
  return dark||seaFruit||chaos||sweetSalty;
}

/* ============ Char 主动讨菜 ============ */
async function maybeCraving(force){
  if(!force && (S.cravingBanner || Math.random()>0.2)) return;
  try{
    const chars=await roche.character.list();
    if(!chars.length){ if(force) roche.ui.toast("没有 Char"); return; }
    const c=chars[Math.floor(Math.random()*chars.length)];
    const res=await roche.ai.chat({messages:[
      {role:"system",content:`你扮演「${c.name||c.handle}」。人设：${c.persona||c.bio||""}\n主动来 user 的厨房讨吃的，写一句短短的讨菜台词（≤30字），不要引号。`},
      {role:"user",content:"你想吃什么？"}
    ],temperature:1.1});
    S.cravingBanner={char:c, text:(res.text||"").trim()||"肚子饿了…做点吃的？"};
    if(S.tab==="stove") render();
  }catch{ if(force) roche.ui.toast("呼叫失败"); }
}

/* ============ 渲染 ============ */
function render(){
  applyTheme(); nav(); body.innerHTML="";
  ({stove:renderStove, book:renderBook, feed:renderFeed, custom:renderCustom, set:renderSet})[S.tab](body);
}

/* ---------- 料理台 ---------- */
function renderStove(el){
  const foodDots=S.picked.map((p)=>{
    const custom=p.startsWith("::")?S.custom.find(c=>c.id===p.slice(2)):null;
    let emo = custom ? (custom.image ? `<img src="${custom.image}" style="max-width:32px;max-height:32px;object-fit:contain;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3));">` : (custom.emoji||"🖼")) : p;
    return `<span style="left:${100+(Math.random()-.5)*110}px;top:${45+(Math.random()-.5)*22}px;">${emo}</span>`;
  }).join("");
  const catBlock=(cat,list)=>{
    const open=S.catOpen[cat]!==false;
    return `<div class="h" data-cat="${cat}"><span>${cat}</span><span class="caret">${open?"▼":"▶"}</span></div>
      ${open?`<div class="grid">${list.map(e=>`<div class="cell ${S.picked.includes(e)?"on":""}" data-e="${e}">${e}</div>`).join("")}</div>`:""}`;
  };
  
  const isColdPrep = S.fire === 0;
  const cookBtnText = isColdPrep ? "🍽 装盘/调配" : "🍳 出锅";
  const canCook = S.picked.length > 0 || S.spices.length > 0;

  el.innerHTML=`
    ${S.cravingBanner?`<div class="craving" id="cravBanner">
      ${S.cravingBanner.char.avatar?`<img src="${S.cravingBanner.char.avatar}">`:`<div style="width:36px;height:36px;border-radius:50%;background:#ddd;"></div>`}
      <div><b>${S.cravingBanner.char.handle||S.cravingBanner.char.name}</b>：${S.cravingBanner.text}
      <div style="font-size:11px;opacity:.7;">点这里 → 为它下厨</div></div></div>`:""}
    <div class="stove-fixed">
      <div class="stove">
        <div class="pan-holder" id="pan">${panSVG(S.pot)}<div class="pan-food">${foodDots}</div></div>
        <div class="flame-holder" id="flame">${flameSVG(S.fire)}</div>
      </div>
      <div class="fire-ctrl">
        <span>🚫</span><input type="range" min="0" max="4" value="${S.fire}" id="fire"><span>猛🔥</span>
        <span style="color:#999;font-size:11px;">${["熄火","小火","中火","中大火","猛火"][S.fire]}</span>
      </div>
    </div>
    <div class="h"><span>锅具</span></div>
    <div class="row">${POTS.map(p=>`<div class="chip ${S.pot===p.id?"on":""}" data-pot="${p.id}">${p.name}·${p.tag}</div>`).join("")}</div>
    <div class="h"><span>工具</span></div>
    <div class="row">${TOOLS.map(t=>`<div class="chip ${S.tool===t.id?"on":""}" data-tool="${t.id}">${t.id==="spatula"?"🥄":"🍶"} ${t.name}</div>`).join("")}</div>
    <div class="h"><span>调料·台面常用</span></div>
    <div class="grid">${SPICES_COMMON.map(s=>`<div class="cell ${S.spices.includes(s)?"on":""}" data-sp="${s}" title="${SPICE_FX[s]?.name||""}">${s}</div>`).join("")}</div>
    <div class="cabinet">
      <div class="h" id="cabHd" style="margin:0;cursor:pointer;"><span>柜子里的稀有调料</span><span class="caret">${S.cabinetOpen?"▼":"▶"}</span></div>
      ${S.cabinetOpen?`<div class="grid" style="margin-top:6px;">${SPICES_CABINET.map(s=>`<div class="cell ${S.spices.includes(s)?"on":""}" data-sp="${s}" title="${SPICE_FX[s]?.name||""}">${s}</div>`).join("")}</div>`:""}
    </div>
    ${Object.entries(FRIDGE).map(([c,l])=>catBlock(c,l)).join("")}
    ${S.custom.length?`<div class="h" data-cat="自定义"><span>自定义</span><span class="caret">${S.catOpen["自定义"]!==false?"▼":"▶"}</span></div>
      ${S.catOpen["自定义"]!==false?`<div class="grid">${S.custom.map(c=>`<div class="cell ${S.picked.includes("::"+c.id)?"on":""}" data-ce="${c.id}" title="${c.name}">${c.image?`<img src="${c.image}" style="width:100%;height:100%;border-radius:8px;object-fit:cover;">`:(c.emoji||"🖼")}</div>`).join("")}</div>`:""}`:""}
    <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn" id="toss" ${S.picked.length===0||S.fire===0?"disabled":""}>🥢 颠勺</button>
      <button class="btn" id="cook" ${!canCook?"disabled":""}>${cookBtnText}</button>
      <button class="btn ghost" id="clr">清空</button>
    </div>`;
  const $=(s)=>el.querySelector(s);
  $("#fire").oninput=(e)=>{ S.fire=+e.target.value; $("#flame").innerHTML=flameSVG(S.fire); el.querySelectorAll(".fire-ctrl span")[2].textContent=["熄火","小火","中火","中大火","猛火"][S.fire]; render(); };
  el.querySelectorAll("[data-pot]").forEach(x=>x.onclick=()=>{S.pot=x.dataset.pot;render();});
  el.querySelectorAll("[data-tool]").forEach(x=>x.onclick=()=>{S.tool=x.dataset.tool;render();});
  el.querySelectorAll("[data-cat]").forEach(x=>x.onclick=()=>{ const c=x.dataset.cat; S.catOpen[c]=S.catOpen[c]===false; render(); });
  el.querySelectorAll("[data-sp]").forEach(x=>x.onclick=()=>{ const s=x.dataset.sp; const i=S.spices.indexOf(s); if(i>=0){ S.spices.splice(i,1); render(); } else { S.spices.push(s); render(); setTimeout(()=>playSpiceFx(s),30); } });
  el.querySelectorAll("[data-e]").forEach(x=>x.onclick=()=>{ const e=x.dataset.e; const i=S.picked.indexOf(e); if(i>=0) S.picked.splice(i,1); else S.picked.push(e); render(); });
  el.querySelectorAll("[data-ce]").forEach(x=>x.onclick=()=>{ const k="::"+x.dataset.ce; const i=S.picked.indexOf(k); if(i>=0) S.picked.splice(i,1); else S.picked.push(k); render(); });
  $("#cabHd").onclick=async ()=>{ S.cabinetOpen=!S.cabinetOpen; if(S.cabinetOpen) await unlock("cabinet_open"); render(); };
  $("#clr").onclick=()=>{ S.picked=[]; S.spices=[]; render(); };
  $("#toss").onclick=async ()=>{
    const p=$("#pan"); p.classList.remove("toss"); void p.offsetWidth; p.classList.add("toss");
    let n=0; const t=setInterval(()=>{ container.querySelectorAll(".pan-food span").forEach(s=>{ s.style.left=(100+(Math.random()-.5)*110)+"px"; s.style.top=(45+(Math.random()-.5)*22)+"px"; }); if(++n>=7) clearInterval(t); },100);
    S.tossCount=(S.tossCount||0)+1; await roche.storage.set("tossCount",S.tossCount);
    if(S.tossCount>=20) await unlock("toss_master"); if(S.tossCount>=100) await unlock("toss_hundred");
    roche.ui.toast("锵！颠勺～");
  };
  $("#cook").onclick=cookDish;
  const cb=$("#cravBanner"); if(cb) cb.onclick=()=>{ S.cravingBanner=null; render(); };
}

/* ---------- 出锅 / 装盘 ---------- */
async function cookDish(){
  if(!S.picked.length && !S.spices.length) return;
  const isColdPrep = S.fire === 0;
  const dark=isDarkCombo(S.picked, S.spices);
  showLoading(dark?"锅里发生了不祥的事…": (isColdPrep?"精心调配中…":"炒制中…"));
  const parts=[], tastes=new Set(), textures=new Set(), vibes=new Set();
  S.picked.forEach(e=>{
    if(e.startsWith("::")){ const c=S.custom.find(x=>x.id===e.slice(2)); if(c) parts.push(`${c.name}(${c.desc||""})`); }
    else { parts.push(e); const m=EMOJI_META[e]; if(m){tastes.add(m.t);textures.add(m.x);vibes.add(m.v);} }
  });
  S.spices.forEach(s=>{ const m=EMOJI_META[s]; if(m){tastes.add(m.t);textures.add(m.x);vibes.add(m.v);} });
  const pot=POTS.find(p=>p.id===S.pot), fireLevel=["熄火","小火","中火","中大火","猛火"][S.fire];
  const midnightHint=isLateNight?"\n【重要】现在是深夜食堂时间，请带有一种深夜的治愈、静谧、独处感，或者幽暗感。":"";
  const darkHint=dark?"\n【重要】这是一道黑暗料理，请起一个诡异/中二/克苏鲁风的中文菜名，描述要有邪典恐怖感、卖相怪诞、功效离谱。":"";
  
  const sysPrompt = isColdPrep
    ? `你是会取名的甜点师/调酒师。根据食材和调料，为这道【免火冷调】的甜点/饮品/冷盘起中文名。JSON：{"name":"","desc":"","effect":"","appearance":""}${midnightHint}${darkHint}`
    : `你是会取名的厨师。根据食材、调料、锅具、火候起中文菜名。JSON：{"name":"","desc":"","effect":"","appearance":""}${midnightHint}${darkHint}`;
  const userPrompt = isColdPrep
    ? `食材：${parts.join("、")||"无"}\n调料：${S.spices.map(s=>SPICE_FX[s]?.name||s).join("、")||"无"}\n制作方式：熄火冷调/装盘`
    : `食材：${parts.join("、")||"无"}\n调料：${S.spices.map(s=>SPICE_FX[s]?.name||s).join("、")||"无"}\n锅具：${pot.name}(${pot.tag})\n火候：${fireLevel}\n工具：${S.tool}`;

  let dish={name:"神秘料理",desc:"",effect:"",appearance:""};
  try{
    const res=await roche.ai.chat({messages:[{role:"system",content:sysPrompt},{role:"user",content:userPrompt}],temperature:0.9});
    const m=(res.text||"").match(/\{[\s\S]*\}/); if(m) Object.assign(dish, JSON.parse(m[0]));
  }catch{
    dish.name=(dark?"☠️":"")+S.picked.filter(x=>!x.startsWith("::")).slice(0,3).join("")+(isColdPrep?"冷盘":pot.tag);
    dish.desc=`${isColdPrep?"免火调配":"用"+pot.name+pot.tag}成的一道${dark?"诡异":""}菜。`;
  }
  const rec={
    id:crypto.randomUUID(), name:dish.name, desc:dish.desc, emojis:[...S.picked], spices:[...S.spices],
    pot:S.pot, tool:S.tool, fire:S.fire, taste:[...tastes].join("/")||"未知", texture:[...textures].join("/")||"未知", vibe:[...vibes].join("/")||"神秘",
    effect:dish.effect, appearance:dish.appearance, midnight:isLateNight, dark, createdAt:Date.now(), starred:false
  };
  const key=(r)=>`${r.name}|${[...r.emojis].sort().join(",")}|${[...(r.spices||[])].sort().join(",")}`;
  const dupe=S.recipes.find(r=>key(r)===key(rec));
  if(!dupe){
    S.recipes.unshift(rec); await roche.storage.set("recipes",S.recipes);
    const today = new Date().toLocaleDateString();
    if (S.lastCookDate !== today) {
      if (S.lastCookDate) { const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(); if (S.lastCookDate === yesterday) S.consecutiveCookDays++; else S.consecutiveCookDays = 1; } else { S.consecutiveCookDays = 1; }
      S.lastCookDate = today; await roche.storage.set("lastCookDate", S.lastCookDate); await roche.storage.set("consecutiveCookDays", S.consecutiveCookDays);
    }
    if (S.consecutiveCookDays >= 7) await unlock("seven_days");
    await unlock("first_cook"); if(S.recipes.length>=10) await unlock("ten_dishes"); if(S.recipes.length>=30) await unlock("thirty_dishes"); if(S.recipes.length>=50) await unlock("fifty_dishes"); if(S.recipes.length>=100) await unlock("hundred_dishes");
    S.potUsed.add(S.pot); await roche.storage.set("potUsed",[...S.potUsed]); if(S.potUsed.size>=3) await unlock("pot_all");
    S.potDishCount[S.pot]=(S.potDishCount[S.pot]||0)+1; await roche.storage.set("potDishCount",S.potDishCount); if(S.potDishCount.wok>=10) await unlock("wok_ten"); if(S.potDishCount.flat>=10) await unlock("flat_ten"); if(S.potDishCount.pressure>=10) await unlock("pressure_ten");
    S.spices.forEach(s=>S.spiceUsed.add(s)); await roche.storage.set("spiceUsed",[...S.spiceUsed]); if(S.spiceUsed.size>=14) await unlock("spice_all"); if(SPICES_COMMON.every(s=>S.spiceUsed.has(s))) await unlock("spice_common_all"); if(S.spices.length>=5) await unlock("spice_junkie"); if(!S.spices.length && S.picked.length) await unlock("no_spice"); if(S.spices.length && !S.picked.length) await unlock("only_spice");
    S.picked.forEach(e=>{ if(!e.startsWith("::")) S.ingredientsUsed.add(e); }); await roche.storage.set("ingredientsUsed",[...S.ingredientsUsed]); if(S.ingredientsUsed.size>=30) await unlock("ingredient_master"); if(S.picked.length===1) await unlock("single_ingredient"); if(S.picked.length>=10) await unlock("big_dish"); if(S.picked.some(e=>e.startsWith("::"))) await unlock("custom_in_dish");
    if(S.fire===4) await unlock("max_fire"); if(S.fire===1) await unlock("low_fire");
    if(rec.midnight){ S.midnightCount++; await roche.storage.set("midnightCount",S.midnightCount); await unlock("midnight"); if(S.midnightCount>=10) await unlock("midnight_ten"); if(S.midnightCount>=30) await unlock("midnight_thirty"); }
    if(hour>=5 && hour<8) await unlock("early_bird"); if(hour>=11 && hour<13) await unlock("lunch_chef"); if(hour>=17 && hour<19) await unlock("dinner_chef");
    if(rec.dark){ S.darkCount++; await roche.storage.set("darkCount",S.darkCount); await unlock("dark_master"); if(S.darkCount>=5) await unlock("dark_five"); if(S.darkCount>=10) await unlock("dark_ten"); if(S.darkCount>=30) await unlock("dark_thirty"); if(rec.midnight) await unlock("dark_at_midnight"); }
    if(S.picked.includes("💊")) await unlock("pill_chef"); if(S.picked.includes("🦴")) await unlock("bone_soup"); if(S.picked.includes("🧀") && S.picked.includes("🍿")) await unlock("cheese_pop"); if(S.picked.includes("🧫")) await unlock("petri_dish"); if(S.picked.includes("💊") && S.spices.includes("⚗️") && S.picked.includes("🦴")) await unlock("mystic_trio"); if(S.picked.some(e=>["🍤","🦑","🦐","🦀","🐟","🦞"].includes(e)) && S.picked.some(e=>["🍎","🍏","🍓","🍒","🍑","🍰","🍫","🍩"].includes(e))) await unlock("seafood_fruit");
    S.picked.forEach(e=>{ if(DARK_EMOJIS.includes(e)) S.darkEmojisUsed.add(e); }); await roche.storage.set("darkEmojisUsed",[...S.darkEmojisUsed]); if(S.darkEmojisUsed.size>=6) await unlock("all_dark_emojis");
    if(S.spices.includes("🥃")) await unlock("flambe_master");
    if(S.cravingBanner){ S.cravingAnsCount++; await roche.storage.set("cravingAnsCount",S.cravingAnsCount); await unlock("craving_ans"); if(S.cravingAnsCount>=5) await unlock("craving_five"); if(S.cravingAnsCount>=10) await unlock("craving_ten"); }
  }
  hideLoading(); if(dupe) roche.ui.toast("这道菜之前做过啦，已跳过重复");
  await showCongrats(rec, dark); S.picked=[]; S.spices=[];
  if(S.cravingBanner){ S.pendingDish=rec; const cravChar=S.cravingBanner.char; S.cravingBanner=null; S.tab="feed"; S.feedTab="feedChar"; render(); setTimeout(()=>feedToChar(rec, cravChar), 300); return; }
  S.tab="book"; render();
}

/* ---------- 菜谱 ---------- */
function renderBook(el){
  const list = S.bookTab==="starred" ? S.recipes.filter(r=>r.starred) : S.recipes;
  el.innerHTML=`
    <div class="tab-bar">
      <button class="${S.bookTab==="all"?"on":""}" data-bt="all">普通菜谱 (${S.recipes.length})</button>
      <button class="${S.bookTab==="starred"?"on":""}" data-bt="starred">🌟 收藏 (${S.recipes.filter(r=>r.starred).length})</button>
    </div>
    ${list.length?list.map(r=>`
      <div class="card ${r.dark?"dark":""}">
        <div class="dish-emo" style="display:flex;flex-wrap:wrap;gap:2px;align-items:center;">
          ${renderEmoList(r.emojis, 26)}
          ${r.spices?.length?"<span style='margin:0 4px;opacity:0.5;'>·</span>"+r.spices.join(""):""}
        </div>
        <div class="dish-name" style="display:flex;justify-content:space-between;">
          <span>${r.dark?"☠️ ":""}${r.name}${r.midnight?' <span style="font-size:12px;color:#ffb86b;">🌙</span>':""}</span>
          <span style="cursor:pointer;font-size:18px;" data-act="star" data-id="${r.id}">${r.starred?"🌟":"☆"}</span>
        </div>
        <div style="font-size:13px;opacity:.85;">${r.desc||""}</div>
        <div style="margin-top:6px;">
          <span class="tag">${r.fire===0?"🍽 冷调":("🍳 "+(POTS.find(p=>p.id===r.pot)?.name||"锅"))}</span> 
          ${r.fire>0?`<span class="tag">🔥 ${["熄","小","中","中大","猛"][r.fire]}火</span>`:""}
          <span class="tag">味 ${r.taste}</span><span class="tag">感 ${r.texture}</span><span class="tag">氛 ${r.vibe}</span>
        </div>
        ${r.effect?`<div style="font-size:12px;opacity:.75;margin-top:4px;">✨ ${r.effect}</div>`:""}
        <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
          <button class="btn" data-act="feed" data-id="${r.id}">🥄 投喂</button>
          <button class="btn ghost" data-act="gift" data-id="${r.id}">🎁 送给 Char</button>
          <button class="btn ghost" data-act="del" data-id="${r.id}">删除</button>
        </div>
      </div>`).join("") : `<div style="text-align:center;color:#aaa;padding:40px;">这里空空如也</div>`}`;
  el.querySelectorAll("[data-bt]").forEach(b=>b.onclick=()=>{ S.bookTab=b.dataset.bt; render(); });
  el.querySelectorAll("[data-act]").forEach(b=>b.onclick=async()=>{
    const r=S.recipes.find(x=>x.id===b.dataset.id); if(!r) return;
    const a=b.dataset.act;
    if(a==="del"){ S.recipes=S.recipes.filter(x=>x.id!==r.id); await roche.storage.set("recipes",S.recipes); render(); }
    else if(a==="feed"){ S.pendingDish=r; S.tab="feed"; S.feedTab="feedChar"; render(); }
    else if(a==="gift"){ giftToChar(r); }
    else if(a==="star"){ r.starred=!r.starred; await roche.storage.set("recipes",S.recipes); render(); }
  });
}
async function giftToChar(dish){
  let chars=[]; try{ chars=await roche.character.list(); }catch{}
  if(!chars.length){ roche.ui.toast("没有 Char"); return; }
  const pick=await roche.ui.select?.({title:"送给谁？",options:chars.map(c=>({label:c.handle||c.name,value:c.id}))});
  const target=chars.find(c=>c.id===(pick?.value||pick))||chars[0];
  const text=`🎁 ${target.handle||target.name},送你【${dish.name}】\n${dish.emojis.map(e => e.startsWith("::") ? "[图片食材]" : e).join(" ")}\n${dish.desc||""}`;
  try{
    if(roche.chat?.send) await roche.chat.send({conversationId:target.conversationId,text});
    else if(roche.character?.sendMessage) await roche.character.sendMessage({charId:target.id,text});
    else throw 0;
    roche.ui.toast("已发出 💌");
    S.giftCount=(S.giftCount||0)+1; await roche.storage.set("giftCount",S.giftCount);
    await unlock("gift_first"); if(S.giftCount>=10) await unlock("gift_ten");
  }catch{ navigator.clipboard?.writeText(text); roche.ui.toast("已复制到剪贴板"); }
}

/* ---------- 投喂 (双模式) ---------- */
async function renderFeed(el){
  if(S.chatWith){ 
    if(S.chatWith.isPureChat) renderPureChatPage(el); 
    else renderChatPage(el); 
    return; 
  }
  el.innerHTML=`
    <div class="tab-bar">
      <button class="${S.feedTab==="feedChar"?"on":""}" data-ft="feedChar">🥄 投喂 Char</button>
      <button class="${S.feedTab==="beFed"?"on":""}" data-ft="beFed">🍽 被投喂</button>
    </div>
    <div id="feedArea"></div>`;
  el.querySelectorAll("[data-ft]").forEach(b=>b.onclick=()=>{ S.feedTab=b.dataset.ft; renderFeed(el); });
  
  const area = el.querySelector("#feedArea");
  if(S.feedTab==="feedChar"){
    let chars=[]; try{ chars=await roche.character.list(); }catch{}
    const dish=S.pendingDish;
    area.innerHTML=`
      ${dish?`<div class="card"><div class="dish-emo" style="display:flex;gap:4px;">${renderEmoList(dish.emojis, 26)}</div><div class="dish-name">🥄 准备投喂：${dish.name}</div></div>`
        :`<div style="text-align:center;color:#aaa;padding:20px;">先在【菜谱】选一道菜点【投喂】</div>`}
      <div class="h"><span>选一位 Char</span></div>
      ${chars.length?chars.map(c=>`
        <div class="card" data-cid="${c.id}" style="cursor:pointer;display:flex;gap:10px;align-items:center;">
          ${c.avatar?`<img src="${c.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">`:`<div style="width:44px;height:44px;border-radius:50%;background:#ddd;"></div>`}
          <div><div style="font-weight:700;">${c.handle||c.name}</div><div style="font-size:12px;color:#888;">${(c.bio||"").slice(0,40)}</div></div>
        </div>`).join(""):`<div style="color:#aaa;text-align:center;padding:20px;">没有 Char</div>`}`;
    area.querySelectorAll("[data-cid]").forEach(c=>c.onclick=()=>{
      if(!dish){ roche.ui.toast("先选菜"); return; }
      feedToChar(dish, chars.find(x=>x.id===c.dataset.cid));
    });
  } else {
    renderBeFed(area);
  }
}

/* ---------- 被投喂模式 ---------- */
function renderBeFed(el){
  el.innerHTML=`
    <div style="text-align:center;color:#888;padding:40px 20px;line-height:1.6;">
      这里是「被投喂」区。<br>Char 随时可能端着食物来找你。<br>点击飘浮的泡泡看看是谁带了什么好吃的！
    </div>
    <div id="bubbleContainer" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;"></div>
  `;
  const container = el.querySelector("#bubbleContainer");
  const timer = setInterval(()=>{
    if(!document.getElementById("bubbleContainer")) { clearInterval(timer); return; }
    if(Math.random()>0.4) return;
    const b = document.createElement("div");
    b.className = "feed-bubble";
    b.textContent = BUBBLE_EMOJIS[Math.floor(Math.random()*BUBBLE_EMOJIS.length)];
    b.style.left = (10 + Math.random()*70) + "%";
    b.style.pointerEvents = "auto";
    b.style.animationDuration = (5 + Math.random()*4) + "s";
    b.onclick = () => handleBubbleClick(b);
    container.appendChild(b);
    setTimeout(()=>b.remove(), 9000);
  }, 1800);
  el._bubbleTimer = timer;
}

async function handleBubbleClick(bubbleEl){
  bubbleEl.remove();
  let chars=[]; try{ chars=await roche.character.list(); }catch{}
  if(!chars.length){ roche.ui.toast("没有 Char 可以投喂你"); return; }
  const char = chars[Math.floor(Math.random()*chars.length)];
  
  let dish;
  if(S.recipes.length > 0 && Math.random() > 0.3){
    dish = S.recipes[Math.floor(Math.random()*S.recipes.length)];
  } else {
    dish = { name: "Char的特制料理", desc: "不知道加了什么，但看起来是为你准备的。", emojis: [bubbleEl.textContent, "✨"], effect: "充满心意", taste:"未知", texture:"未知", vibe:"惊喜" };
    try{
      const res=await roche.ai.chat({messages:[
        {role:"system",content:`你扮演「${char.name||char.handle}」。根据人设，为你喜欢的人(user)自创一道料理。JSON：{"name":"菜名","desc":"描述","effect":"功效或特殊之处"}`},
        {role:"user",content:"做一道菜给我吧。"}
      ]});
      const m=(res.text||"").match(/\{[\s\S]*\}/); if(m) Object.assign(dish, JSON.parse(m[0]));
    }catch{}
  }

  const choice = await new Promise(resolve=>{
    const o=document.createElement("div"); o.className="overlay";
    o.innerHTML=`<div class="congrats" style="background:linear-gradient(135deg, #fffcf0, #ffe8b5); color:#5a3a10; text-align:center; padding:24px; border-radius:20px; max-width:300px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
      <div style="font-size:12px;color:#888;margin-bottom:10px;">${char.handle||char.name} 端来了一道菜</div>
      <div style="font-size:48px;margin:10px 0;">${renderEmoList(dish.emojis, 40)}</div>
      <h3 style="margin:4px 0;">${dish.name}</h3>
      <div style="font-size:13px;color:#666;margin-bottom:16px;">${dish.desc}</div>
      ${dish.effect?`<div style="font-size:12px;color:var(--acc);margin-bottom:16px;">✨ ${dish.effect}</div>`:""}
      <div style="display:flex;gap:10px;justify-content:center;">
        <button class="btn ghost" id="rejBtn" style="border-color:#ccc;color:#888;">婉拒</button>
        <button class="btn" id="eatBtn">吃掉！</button>
      </div>
    </div>`;
    document.body.appendChild(o);
    o.querySelector("#rejBtn").onclick=()=>{ o.remove(); resolve("婉拒了"); };
    o.querySelector("#eatBtn").onclick=()=>{ o.remove(); resolve("吃掉了"); };
  });

  S.chatWith = { char, dish, isPureChat:true, userAction: choice };
  S.chatLog = [];
  S.tab = "feed";
  render();
  generateInitialBeFedResponse(char, dish, choice);
}
/* ---------- 被投喂模式 ---------- */
function renderBeFed(el){
  el.innerHTML=`
    <div style="text-align:center;color:#888;padding:40px 20px;line-height:1.6;">
      这里是「被投喂」区。<br>Char 随时可能端着食物来找你。<br>点击飘浮的泡泡看看是谁带了什么好吃的！
    </div>
    <div id="bubbleContainer" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;"></div>
  `;
  const container = el.querySelector("#bubbleContainer");
  const timer = setInterval(()=>{
    if(!document.getElementById("bubbleContainer")) { clearInterval(timer); return; }
    if(Math.random()>0.4) return;
    const b = document.createElement("div");
    b.className = "feed-bubble";
    b.textContent = BUBBLE_EMOJIS[Math.floor(Math.random()*BUBBLE_EMOJIS.length)];
    b.style.left = (10 + Math.random()*70) + "%";
    b.style.pointerEvents = "auto";
    b.style.animationDuration = (5 + Math.random()*4) + "s";
    b.onclick = () => handleBubbleClick(b);
    container.appendChild(b);
    setTimeout(()=>b.remove(), 9000);
  }, 1800);
  el._bubbleTimer = timer;
}

async function handleBubbleClick(bubbleEl){
  const bubbleEmoji = bubbleEl.textContent;
  bubbleEl.remove();
  let chars=[]; try{ chars=await roche.character.list(); }catch{}
  if(!chars.length){ roche.ui.toast("没有 Char 可以投喂你"); return; }
  const char = chars[Math.floor(Math.random()*chars.length)];
  
  showLoading(`${char.handle||char.name} 正在向你走来…`);

  // 1. 决定菜品
  let dish;
  if(S.recipes.length > 0 && Math.random() > 0.4){
    dish = S.recipes[Math.floor(Math.random()*S.recipes.length)];
  } else {
    dish = { name: "特制料理", desc: "不知道加了什么，但看起来是为你准备的。", emojis: [bubbleEmoji, "✨"], effect: "充满心意", taste:"未知", texture:"未知", vibe:"惊喜" };
    try{
      const res=await roche.ai.chat({messages:[
        {role:"system",content:`你扮演「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\n请为你喜欢的人(user)自创一道料理。JSON格式：{"name":"菜名","desc":"描述","effect":"功效或特殊之处","emojis":["🍲","✨"]}`}
      ], temperature: 0.9});
      const m=(res.text||"").match(/\{[\s\S]*\}/); 
      if(m) {
        const parsed = JSON.parse(m[0]);
        Object.assign(dish, parsed);
        if(!Array.isArray(dish.emojis)) dish.emojis = [bubbleEmoji, "✨"];
      }
    }catch(e){ console.error("生成菜品失败", e); }
  }

  // 2. 生成角色的开场白
  let firstMsg = `（端着【${dish.name}】走到你面前，眼神有些期待）尝尝看？`;
  try {
    const res = await roche.ai.chat({messages:[
      {role:"system",content:`你扮演「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\n你端着你亲手准备的料理「${dish.name}」(${dish.desc}) 来找 user。请带上动作描写，说第一句话，邀请 user 品尝。字数50字以内，不要输出引号。`}
    ], temperature:0.9});
    if(res.text) firstMsg = res.text.trim();
  } catch(e) { console.error("生成开场白失败", e); }

  hideLoading();

  // 3. 进入聊天
  S.chatWith = { char, dish, isPureChat:true };
  S.chatLog = [{role:"assistant", text:firstMsg}];
  S.tab = "feed";
  render();
}

function renderPureChatPage(el){
  const {char, dish}=S.chatWith;
  el.innerHTML=`<div class="chat-page">
    <div class="chat-head">
      ${char.avatar?`<img src="${char.avatar}">`:`<div style="width:56px;height:56px;border-radius:50%;background:#ddd;"></div>`}
      <div class="info">
        <div class="name">${char.handle||char.name} 来投喂你了</div>
        <div class="sub">带来了：【${dish.name}】 ${renderEmoList(dish.emojis, 16)}</div>
      </div>
      <button class="btn ghost" id="chatDone">结束</button>
    </div>
    <div class="chat-log" id="chatLog">
      ${S.chatLog.map(m=>`<div class="chat-msg ${m.role==='user'?'me':'other'}">${m.text}</div>`).join("")}
      ${S.isTyping ? `<div class="chat-msg other"><div class="typing-dots"><span></span><span></span><span></span></div></div>` : ''}
    </div>
    <div style="display:flex; gap:6px; margin:8px 0 4px; padding:0 4px; overflow-x:auto; white-space:nowrap;">
      <button class="chip" id="btnEat">😋 吃掉</button>
      <button class="chip" id="btnRej">🙅 婉拒</button>
      <button class="chip" id="btnTaste">👅 尝一口</button>
    </div>
    <div class="chat-in">
      <input id="chatInput" placeholder="回复 ${char.handle||char.name}..." ${S.isTyping?"disabled":""}>
      <button class="btn ghost" id="chatRedraw" title="重绘最后一条" style="padding:9px;font-size:16px;" ${S.isTyping?"disabled":""}>🔄</button>
      <button class="btn" id="chatSend" ${S.isTyping?"disabled":""}>发送</button>
    </div>
  </div>`;
  
  const sendMsg = (text) => {
    const inp = el.querySelector("#chatInput");
    inp.value = text;
    el.querySelector("#chatSend").click();
  };
  
  el.querySelector("#btnEat").onclick = () => sendMsg("（啊呜一口吃掉）好吃！");
  el.querySelector("#btnRej").onclick = () => sendMsg("（摇摇头）我现在不太想吃...");
  el.querySelector("#btnTaste").onclick = () => sendMsg("（小心翼翼地尝了一口）这味道...");
  
  el.querySelector("#chatSend").onclick=()=>sendPureChat(el);
  el.querySelector("#chatRedraw").onclick=()=>redrawChat(el, true);
  el.querySelector("#chatInput").onkeydown=(e)=>{ if(e.key==="Enter") sendPureChat(el); };
  el.querySelector("#chatDone").onclick=onPureChatDone;
  scrollToBottom(el.querySelector("#chatLog"));
}

async function sendPureChat(el){
  if(S.isTyping) return;
  const inp=el.querySelector("#chatInput");
  const t=inp.value.trim(); if(!t) return;
  inp.value="";
  S.chatLog.push({role:"user",text:t});
  S.isTyping = true; render();
  try{
    const {char, dish}=S.chatWith;
    const res=await roche.ai.chat({messages:[
      {role:"system",content:`你扮演「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\n你给 user 端来了「${dish.name}」(${dish.desc})。请根据 user 的反应继续自然聊天，带上动作描写。`},
      ...S.chatLog.map(m=>({role:m.role,content:m.text}))
    ],temperature:0.9});
    S.chatLog.push({role:"assistant",text:res.text||"..."});
    S.isTyping = false; render();
  }catch{ 
    S.isTyping = false; S.chatLog.pop(); render();
    if(await showErrorDialog("发送消息")) sendPureChat(el);
  }
}

async function onPureChatDone(){
  const {char, dish}=S.chatWith;
  const wantSum=await roche.ui.confirm({title:"总结记忆？", message:"要把这次被投喂的经历总结成一段记忆吗？"});
  if(wantSum){
    showLoading("正在总结记忆…");
    let text=`Char给user做菜：${char.handle||char.name} 给 user 做了「${dish.name}」。`;
    try{
      const sum=await roche.ai.chat({messages:[
        {role:"system",content:"提取出菜的名字、总结大概功能口味、总结 user 到底吃没吃、总结大概剧情即可。提醒这是 Char 端给 user 的菜。字数≤100字。"},
        {role:"user",content:`菜：${dish.name}\n对话：\n${S.chatLog.map(m=>`${m.role}:${m.text}`).join("\n")}`}
      ]});
      text=(sum.text||"").trim()||text;
    }catch{}
    hideLoading();
    const edited=await editableDialog("📝 编辑记忆后再写入", text);
    if(edited && char.conversationId && roche.memory?.write){
      try{
        await roche.memory.write({
          conversationId:char.conversationId, summaryText:edited, who:[char.handle||char.name,"user"],
          action:edited, when:"被Char投喂", where:"Char 的厨房", source:"plugin:char-kitchen"
        });
        roche.ui.toast("✅ 已写入记忆库");
      }catch{ roche.ui.toast("写入失败"); }
    }
  }
  S.chatWith=null; S.chatLog=[]; render();
}

/* ---------- 投喂 Char 逻辑 ---------- */
async function feedToChar(dish, char){
  showLoading(`把 ${dish.name} 递给 ${char.handle||char.name}…`);
  let payload={eaten:"吃了", mood:"平静", inner:"…", feeling:"这是一道菜。"};
  try{
    const res=await roche.ai.chat({messages:[
      {role:"system",content:`你扮演角色「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\nuser 亲手为你制作了一道${dish.dark?"看起来非常诡异的黑暗":""}料理，端给了你。请严格按照人设和料理的情况输出 JSON：{"eaten":"","mood":"","inner":"","feeling":""}\n- eaten：吃没吃（例：吃了 / 只尝了一口 / 拒绝了 / 打翻了 / 珍藏起来 / 吐出来了）\n- mood：现在的心情（一两个词）\n- inner：心声 1-2 句\n- feeling：吃后感受/评价 1-2 句\n【重要】请记住这绝对是 user 在厨房里亲手为你做的，不要说这不是 user 做的！如果菜品有[特殊效果]，请自然地做出吐槽或赞美的反应。`},
      {role:"user",content:`菜名：${dish.name}${dish.dark?"(⚠️ 黑暗料理)":""}\n${dish.desc||""}\n味:${dish.taste} 感:${dish.texture} 氛:${dish.vibe}\n特殊效果：${dish.effect||"无"}`}
    ],temperature:1.0});
    const m=(res.text||"").match(/\{[\s\S]*\}/);
    if(m) Object.assign(payload, JSON.parse(m[0]));
  }catch{ roche.ui.toast("生成反应失败，使用默认反应"); }
  hideLoading();
  S.feeds.unshift({ id:crypto.randomUUID(), charId:char.id, charName:char.handle||char.name, dishId:dish.id, dishName:dish.name, dishEmojis:dish.emojis, ...payload, createdAt:Date.now() });
  await roche.storage.set("feedRecords",S.feeds);

  await unlock("feed_first"); if(S.feeds.length>=10) await unlock("feed_ten"); if(S.feeds.length>=30) await unlock("feed_thirty"); if(S.feeds.length>=50) await unlock("feed_fifty"); if(S.feeds.length>=100) await unlock("feed_hundred");
  S.feedPerChar[char.id]=(S.feedPerChar[char.id]||0)+1; await roche.storage.set("feedPerChar",S.feedPerChar); if(S.feedPerChar[char.id]>=5) await unlock("feed_same"); if(S.feedPerChar[char.id]>=10) await unlock("feed_same_ten"); if(Object.keys(S.feedPerChar).length>=5) await unlock("char_all_fed");
  
  const eat=(payload.eaten||"");
  if(/拒绝|不吃/.test(eat)) await unlock("refused"); if(/珍藏/.test(eat)) await unlock("loved"); if(/吐/.test(eat)) await unlock("spat_out"); if(/打翻/.test(eat)) await unlock("smashed"); if(/尝/.test(eat)) await unlock("one_bite");
  const reactKey = /拒绝|不吃/.test(eat)?"refuse" : /珍藏/.test(eat)?"treasure" : /吐/.test(eat)?"spit" : /打翻/.test(eat)?"smash" : /尝/.test(eat)?"bite" : "eat";
  S.reactionSet.add(reactKey); await roche.storage.set("reactionSet",[...S.reactionSet]); if(S.reactionSet.size>=5) await unlock("reactions_all");

  S.chatWith={char, dish, status:payload, isPureChat:false};
  S.chatLog=[{role:"assistant", text:payload.feeling}];
  S.pendingDish=null; S.chatStatusOpen=true; S.isTyping=false; render();
}

function renderChatPage(el){
  const {char, dish, status}=S.chatWith;
  el.innerHTML=`<div class="chat-page">
    <div class="chat-head">
      ${char.avatar?`<img src="${char.avatar}">`:`<div style="width:56px;height:56px;border-radius:50%;background:#ddd;"></div>`}
      <div class="info">
        <div class="name">${char.handle||char.name}</div>
        <div class="sub">吃了：【${dish.name}】 ${renderEmoList(dish.emojis, 16)}</div>
      </div>
      <button class="btn ghost" id="chatDone">结束投喂</button>
    </div>
    
    <div style="text-align:center;margin-bottom:4px;">
      <span id="toggleStatus" style="font-size:11px;color:#888;cursor:pointer;padding:4px 10px;background:var(--card);border-radius:10px;">
        ${S.chatStatusOpen?"收起感受面板 ▲":"展开感受面板 ▼"}
      </span>
    </div>
    <div class="status-grid" style="max-height:${S.chatStatusOpen?"200px":"0"}; opacity:${S.chatStatusOpen?"1":"0"}; margin-bottom:${S.chatStatusOpen?"10px":"0"};">
      <div class="status-cell"><div class="lbl">🍽 是否吃了</div>${status.eaten||"—"}</div>
      <div class="status-cell"><div class="lbl">💗 心情</div>${status.mood||"—"}</div>
      <div class="status-cell" style="grid-column:span 2;"><div class="lbl">💭 心声</div>${status.inner||"—"}</div>
    </div>

    <div class="chat-log" id="chatLog">
      ${S.chatLog.map(m=>`<div class="chat-msg ${m.role==='user'?'me':'other'}">${m.text}</div>`).join("")}
      ${S.isTyping ? `<div class="chat-msg other"><div class="typing-dots"><span></span><span></span><span></span></div></div>` : ''}
    </div>
    <div class="chat-in">
      <input id="chatInput" placeholder="和 ${char.handle||char.name} 聊聊这道菜…" ${S.isTyping?"disabled":""}>
      <button class="btn ghost" id="chatRedraw" title="重绘最后一条" style="padding:9px;font-size:16px;" ${S.isTyping?"disabled":""}>🔄</button>
      <button class="btn" id="chatSend" ${S.isTyping?"disabled":""}>发送</button>
    </div>
  </div>`;
  
  el.querySelector("#toggleStatus").onclick=()=>{ S.chatStatusOpen=!S.chatStatusOpen; renderChatPage(el); };
  el.querySelector("#chatSend").onclick=()=>sendChat(el);
  el.querySelector("#chatRedraw").onclick=()=>redrawChat(el, false);
  el.querySelector("#chatInput").onkeydown=(e)=>{ if(e.key==="Enter") sendChat(el); };
  el.querySelector("#chatDone").onclick=onChatDone;
  scrollToBottom(el.querySelector("#chatLog"));
}

async function sendChat(el){
  if(S.isTyping) return;
  const inp=el.querySelector("#chatInput");
  const t=inp.value.trim(); if(!t) return;
  inp.value="";
  S.chatLog.push({role:"user",text:t});
  S.isTyping = true; render();
  try{
    const {char, dish}=S.chatWith;
    const res=await roche.ai.chat({messages:[
      {role:"system",content:`你扮演「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\n刚才你吃了 user 亲手为你制作的「${dish.name}」${dish.dark?"（一道黑暗料理）":""}，它的特殊效果是：${dish.effect||"无"}。请继续和 user 聊天，保持角色语气，记住这是 user 亲手为你做的。`},
      ...S.chatLog.map(m=>({role:m.role,content:m.text}))
    ],temperature:0.9});
    S.chatLog.push({role:"assistant",text:res.text||"..."});
    S.isTyping = false; render();
  }catch{
    S.isTyping = false; S.chatLog.pop(); render();
    if(await showErrorDialog("发送消息")) sendChat(el);
  }
}

async function redrawChat(el, isPure){
  if(S.chatLog.length===0 || S.isTyping) return;
  if(S.chatLog[S.chatLog.length-1].role === "assistant"){
    S.chatLog.pop();
    S.isTyping = true; render();
    try{
      const {char, dish, userAction}=S.chatWith;
      let sysMsg = isPure 
        ? `你扮演「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\n你给 user 端来了「${dish.name}」，user ${userAction}。请继续自然聊天。`
        : `你扮演「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\n刚才你吃了 user 亲手为你制作的「${dish.name}」${dish.dark?"（一道黑暗料理）":""}，它的特殊效果是：${dish.effect||"无"}。请继续和 user 聊天，保持角色语气，记住这是 user 亲手为你做的。`;
      
      const res=await roche.ai.chat({messages:[
        {role:"system",content:sysMsg},
        ...S.chatLog.map(m=>({role:m.role,content:m.text}))
      ],temperature:0.95});
      S.chatLog.push({role:"assistant",text:res.text||"..."});
      S.isTyping = false; render();
    }catch{
      S.isTyping = false; render();
      if(await showErrorDialog("重绘消息")) redrawChat(el, isPure);
    }
  } else {
    roche.ui.toast("最后一条是你发的，无法重绘");
  }
}

async function onChatDone(){
  const {char, dish, status}=S.chatWith;
  showLoading(`${char.handle||char.name} 想说点什么…`);
  let finalWords="（Ta 抬眼看了看你，没说话。）";
  try{
    const res=await roche.ai.chat({messages:[
      {role:"system",content:`你扮演「${char.name||char.handle}」。人设：${char.persona||char.bio||""}\n你刚吃了 user 亲手为你做的「${dish.name}」并聊了一会儿。现在 user 要结束投喂了，请用角色语气写一段"结束感想"（2-3 句）。不要引号。`},
      {role:"user",content:S.chatLog.map(m=>`${m.role}:${m.text}`).join("\n")}
    ],temperature:0.9});
    finalWords=(res.text||"").trim()||finalWords;
  }catch{}
  hideLoading();
  await roche.ui.confirm({title:`${char.handle||char.name} 的结束感想`, message:finalWords});
  const wantSum=await roche.ui.confirm({title:"总结这段投喂记忆？", message:"要把这次投喂+对话总结成一段记忆吗？"});
  if(wantSum){
    showLoading("正在总结记忆…");
    let text=`用户给Char做菜：user 给 ${char.handle||char.name} 亲手做了「${dish.name}」，Char ${status.eaten}。`;
    try{
      const sum=await roche.ai.chat({messages:[
        {role:"system",content:"提取出菜的名字、总结大概功能口味和味道、总结char的感受（记得加入char吃没吃）、总结大概剧情即可。提醒这是用户在厨房给char亲手做的菜。字数≤100字。"},
        {role:"user",content:`菜：${dish.name}\n味:${dish.taste} 感:${dish.texture}\nChar吃没吃：${status.eaten}\n结束感想：${finalWords}\n对话：\n${S.chatLog.map(m=>`${m.role}:${m.text}`).join("\n")}`}
      ]});
      text=(sum.text||"").trim()||text;
    }catch{}
    hideLoading();
    const edited=await editableDialog("📝 编辑记忆后再写入", text);
    if(edited && char.conversationId && roche.memory?.write){
      try{
        await roche.memory.write({
          conversationId:char.conversationId, summaryText:edited, who:[char.handle||char.name,"user"],
          action:edited, when:"厨房投喂", where:"Char 的厨房", source:"plugin:char-kitchen"
        });
        roche.ui.toast("✅ 已写入记忆库");
        S.memoryCount++; await roche.storage.set("memoryCount",S.memoryCount);
        await unlock("memory_saved"); if(S.memoryCount>=10) await unlock("memory_ten"); if(S.memoryCount>=30) await unlock("memory_thirty");
      }catch{ roche.ui.toast("写入失败"); }
    } else if(edited===null){ roche.ui.toast("已取消写入"); }
  }
  S.chatWith=null; S.chatLog=[]; render();
}

/* ---------- 自定义 ---------- */
function renderCustom(el){
  el.innerHTML=`
    <div class="h"><span>🖼 添加自定义食材</span></div>
    <div class="row">
      <button class="btn" id="addImg">📷 导入图片</button>
      <button class="btn ghost" id="addEmo">😀 输入 Emoji</button>
    </div>
    <div style="font-size:11px;color:#888;margin:4px 0 8px;">分享格式：Emoji 食材 <code>［Emoji名称:描述］</code>，图片食材 <code>［菜品名称:描述］</code></div>
    <div class="h"><span>我的食材（${S.custom.length}）</span></div>
    ${S.custom.length?S.custom.map(c=>{
      const shareCode = c.image ? `［${c.name}:${c.desc||"—"}］` : `［${c.emoji||c.name}:${c.desc||"—"}］`;
      return `
        <div class="card" style="display:flex;gap:10px;align-items:center;">
          ${c.image?`<img src="${c.image}" style="width:52px;height:52px;border-radius:8px;object-fit:cover;">`:`<div style="width:52px;height:52px;border-radius:8px;background:rgba(0,0,0,.06);display:flex;align-items:center;justify-content:center;font-size:30px;">${c.emoji||"🖼"}</div>`}
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;">${c.name}</div><div style="font-size:12px;color:#888;">${c.desc||""}</div>
            <div class="share-code" data-copy="${shareCode.replace(/"/g,'&quot;')}" title="点击复制">📋 ${shareCode}</div>
          </div>
          <button class="btn ghost" data-del="${c.id}" style="padding:6px 10px;font-size:12px;">删除</button>
        </div>`;
    }).join(""):`<div style="text-align:center;color:#aaa;padding:20px;">还没有自定义食材</div>`}`;
  el.querySelector("#addImg").onclick=async()=>{
    const inp=document.createElement("input"); inp.type="file"; inp.accept="image/*";
    inp.onchange=async()=>{
      const f=inp.files[0]; if(!f) return;
      const name=prompt("食材名字：","自制食材"); if(!name) return;
      const desc=prompt("描述（可留空）：","")||"";
      const image=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f);});
      S.custom.push({id:crypto.randomUUID(),name,desc,image}); await roche.storage.set("customIngredients",S.custom);
      await unlock("custom_first"); if(S.custom.length>=10) await unlock("custom_ten"); if(S.custom.length>=30) await unlock("custom_thirty"); render();
    }; inp.click();
  };
  el.querySelector("#addEmo").onclick=async()=>{
    const e=prompt("输入一个 emoji 作为食材："); if(!e) return;
    const name=prompt("名字：",e)||e; const desc=prompt("描述（可留空）：","")||"";
    S.custom.push({id:crypto.randomUUID(),name,desc,image:"",emoji:e}); await roche.storage.set("customIngredients",S.custom);
    await unlock("custom_first"); if(S.custom.length>=10) await unlock("custom_ten"); if(S.custom.length>=30) await unlock("custom_thirty"); render();
  };
  el.querySelectorAll("[data-copy]").forEach(x=>x.onclick=()=>{ navigator.clipboard?.writeText(x.dataset.copy); roche.ui.toast("分享码已复制"); });
  el.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{
    if(!await roche.ui.confirm({title:"删除",message:"确定删除这个自定义食材？"}))return;
    S.custom=S.custom.filter(c=>c.id!==b.dataset.del); await roche.storage.set("customIngredients",S.custom); render();
  });
}

/* ---------- 设置 ---------- */
function renderSet(el){
  const total=Object.keys(ACHIEVEMENTS).length, got=Object.keys(S.achievements).length;
  el.innerHTML=`
    <div class="h"><span>📐 顶部安全区（防遮挡）</span></div>
    <div class="card" style="display:flex;align-items:center;gap:10px;padding:12px 16px;">
      <span style="font-size:12px;color:#888;">0</span>
      <input type="range" id="ptRange" min="0" max="100" value="${S.paddingTop}" style="flex:1;accent-color:var(--acc);">
      <span style="font-size:12px;color:#888;width:36px;text-align:right;" id="ptVal">${S.paddingTop}px</span>
    </div>

    <div class="h"><span>🌙 深夜食堂模式</span></div>
    <div class="card" style="display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:13px;">强制开启深夜厨房<div style="font-size:11px;color:#888;">全天候享受治愈与幽暗氛围，做出的菜带月亮标记。</div></div>
      <button class="btn ${S.forceMidnight?"":"ghost"}" id="toggleMidnight">${S.forceMidnight?"已开启":"未开启"}</button>
    </div>

    <div class="h"><span>🎨 主题</span></div>
    <div class="row">${Object.keys(THEMES).map(k=>`<div class="chip ${S.theme===k?"on":""}" data-th="${k}">${k}</div>`).join("")}</div>

    <div class="h"><span>👥 Char 互动</span></div>
    <div class="row"><button class="btn ghost" id="callChar">📞 随机呼叫一位 Char 来讨菜</button></div>

    <div class="h" id="achHd" style="cursor:pointer;"><span>🏆 成就（${got}/${total}）</span><span class="caret">${S.achOpen?"▼":"▶"}</span></div>
    ${S.achOpen?`<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;">
      ${Object.entries(ACHIEVEMENTS).map(([id,a])=>{
        const g=S.achievements[id], hide=HIDDEN_IDS.has(id)&&!g;
        return `<div class="card" style="text-align:center;padding:10px 6px;margin:0;${g?"":"opacity:.35;filter:grayscale(1);"}" title="${hide?"未知的秘密":a.desc}">
          <div style="font-size:28px;">${g?a.icon:"🔒"}</div><div style="font-size:12px;font-weight:700;margin-top:4px;">${hide?"???":a.name}</div><div style="font-size:10px;color:#888;line-height:1.3;">${hide?"隐藏成就":a.desc}</div>
        </div>`;
      }).join("")}
    </div>`:""}

    <div class="h"><span>💾 数据管理</span></div>
    <div class="row">
      <button class="btn ghost" id="exportData">📦 导出备份</button>
    </div>
    <div class="card" style="font-size:13px;line-height:1.8;">
      菜谱：${S.recipes.length} 条（已收藏 ${S.recipes.filter(r=>r.starred).length} 条）<br>投喂：${S.feeds.length} 条<br>
      自定义食材：${S.custom.length} 个<br>连续天数：${S.consecutiveCookDays||0} 天｜黑暗料理：${S.darkCount||0} 道
    </div>

    <div class="h"><span>☠️ 危险区</span></div>
    <div class="row">
      <button class="btn ghost" id="clrRec"  style="color:#c33;border-color:#c33;">一键清空普通菜谱</button>
      <button class="btn ghost" id="clrFeed" style="color:#c33;border-color:#c33;">清空投喂记录</button>
      <button class="btn ghost" id="clrAch"  style="color:#c33;border-color:#c33;">重置成就</button>
      <button class="btn ghost" id="wipeAll" style="color:#c33;border-color:#c33;">清空全部厨房数据</button>
    </div>`;

  const ptRange = el.querySelector("#ptRange"); const ptVal = el.querySelector("#ptVal");
  ptRange.oninput = (e) => { S.paddingTop = +e.target.value; ptVal.textContent = S.paddingTop + "px"; root.style.paddingTop = S.paddingTop + "px"; };
  ptRange.onchange = async () => { await roche.storage.set("paddingTop", S.paddingTop); };
    el.querySelector("#toggleMidnight").onclick=async()=>{
    S.forceMidnight = !S.forceMidnight;
    await roche.storage.set("forceMidnight", S.forceMidnight);
    if(S.forceMidnight) { S.theme="night"; await roche.storage.set("theme", "night"); }
    roche.ui.toast("设置已保存，重新打开插件生效");
    render();
  };

  el.querySelectorAll("[data-th]").forEach(b=>b.onclick=async()=>{
    S.theme=b.dataset.th; await roche.storage.set("theme",S.theme);
    S.themesUsed.add(S.theme); await roche.storage.set("themesUsed",[...S.themesUsed]);
    if(S.themesUsed.size>=4) await unlock("all_theme"); render();
  });
  el.querySelector("#callChar").onclick=async()=>{ S.cravingBanner=null; await maybeCraving(true); S.tab="stove"; render(); };
  el.querySelector("#achHd").onclick=()=>{ S.achOpen=!S.achOpen; render(); };
  
  el.querySelector("#exportData").onclick=()=>{
    const data = { recipes:S.recipes, feeds:S.feeds, custom:S.custom, achievements:S.achievements };
    const str = JSON.stringify(data);
    navigator.clipboard?.writeText(str);
    roche.ui.toast("备份数据已复制到剪贴板！");
  };

  el.querySelector("#clrRec").onclick=async()=>{
    if(!await roche.ui.confirm({title:"确认",message:"清空所有未收藏的菜谱？（已收藏的会保留）"}))return;
    const kept = S.recipes.filter(r=>r.starred);
    const removed = S.recipes.length - kept.length;
    S.recipes = kept; await roche.storage.set("recipes",S.recipes);
    roche.ui.toast(`已清理 ${removed} 道未收藏菜品`); render();
  };
  el.querySelector("#clrFeed").onclick=async()=>{
    if(!await roche.ui.confirm({title:"确认",message:"清空全部投喂记录？"}))return;
    S.feeds=[]; await roche.storage.set("feedRecords",[]); render();
  };
  el.querySelector("#clrAch").onclick=async()=>{
    if(!await roche.ui.confirm({title:"确认",message:"重置所有成就进度？"}))return;
    const had=Object.keys(S.achievements).length>0;
    S.achievements={}; S.spiceUsed=new Set(); S.potUsed=new Set(); S.ingredientsUsed=new Set(); S.darkEmojisUsed=new Set(); S.reactionSet=new Set(); S.themesUsed=new Set();
    await roche.storage.set("achievements",{}); await roche.storage.set("spiceUsed",[]); await roche.storage.set("potUsed",[]); await roche.storage.set("ingredientsUsed",[]); await roche.storage.set("darkEmojisUsed",[]); await roche.storage.set("reactionSet",[]); await roche.storage.set("themesUsed",[]);
    render(); if(had) setTimeout(()=>unlock("reset_ach"),400);
  };
  el.querySelector("#wipeAll").onclick=async()=>{
    if(!await roche.ui.confirm({title:"⚠️ 清空全部",message:"菜谱、投喂、自定义食材、成就都会删除，不可恢复。继续？"}))return;
    S.recipes=[];S.feeds=[];S.custom=[];S.achievements={};
    await roche.storage.set("recipes",[]); await roche.storage.set("feedRecords",[]); await roche.storage.set("customIngredients",[]); await roche.storage.set("achievements",{});
    render(); setTimeout(()=>unlock("wipe_all"),400);
  };
}

/* ============ 解锁成就弹窗 ============ */
async function unlock(id){
  if(S.achievements[id]) return;
  S.achievements[id] = true;
  await roche.storage.set("achievements", S.achievements);
  const a = ACHIEVEMENTS[id];
  if(!a) return;
  const o = document.createElement("div");
  o.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-20px);background:var(--card);color:var(--ink);padding:12px 20px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);display:flex;align-items:center;gap:12px;z-index:10000;opacity:0;transition:.4s;border-left:4px solid var(--acc);`;
  o.innerHTML = `<div style="font-size:32px;">${a.icon}</div><div><div style="font-size:11px;color:var(--acc);font-weight:700;">成就解锁</div><div style="font-weight:700;font-size:15px;margin:2px 0;">${a.name}</div><div style="font-size:12px;opacity:.7;">${a.desc}</div></div>`;
  document.body.appendChild(o);
  setTimeout(() => { o.style.transform="translateX(-50%) translateY(0)"; o.style.opacity="1"; }, 50);
  setTimeout(() => { o.style.transform="translateX(-50%) translateY(-20px)"; o.style.opacity="0"; setTimeout(()=>o.remove(),400); }, 4000);
}

/* ============ Konami 彩蛋（↑↑↓↓←→←→） ============ */
const KONAMI=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"];
function onKey(e){
  S.konamiSeq.push(e.key); if(S.konamiSeq.length>KONAMI.length) S.konamiSeq.shift();
  if(KONAMI.every((k,i)=>S.konamiSeq[i]===k)) unlock("konami");
}
document.addEventListener("keydown", onKey);

/* ============ 启动 ============ */
if(isRealLateNight) unlock("late_night_open");
render();
maybeCraving();

// 保存 unmount 需要清理的引用
container._onKey = onKey;
},
async unmount(container){
  document.querySelectorAll('style[data-plugin="char-kitchen"]').forEach(s=>s.remove());
  document.querySelectorAll('.spice-fx-layer,.overlay').forEach(s=>s.remove());
  if(container._onKey) document.removeEventListener("keydown", container._onKey);
  // 清理气泡定时器
  if(container.querySelector("#ckBody")?._bubbleTimer) clearInterval(container.querySelector("#ckBody")._bubbleTimer);
  container.replaceChildren();
}
}]
});
