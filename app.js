/* Мир деми-хьюманов — логика сайта. Тексты берутся из data-ru.js или data-en.js */

const byId = Object.fromEntries(PEOPLE.map(p=>[p.id,p]));
const ORDER = PEOPLE.map(p=>p.id);
const esc = s => String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.9 17.9A10 10 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 5.1-5.9M9.9 4.2A9 9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-2.2 3.2M1 1l22 22"/></svg>';
const spoiler = html => `<div class="spoiler"><button class="sp-head" type="button">${EYE}<span>${STR.spOpen}</span></button><div class="sp-body">${html}</div></div>`;
const no = p => "DM-" + String(ORDER.indexOf(p.id)+1).padStart(2,"0");

/* ---------- Карточки ---------- */
function portrait(p){
  return `<div class="portrait"><img src="${p.portrait}" alt="${esc(p.name)}" loading="lazy"><span class="no">${no(p)}</span></div>`;
}
function chips(p){
  let c = '';
  if(p.species) c += `<span class="chip ${p.demi?'acc':''}">${p.species}${p.latin?`<em>${p.latin}</em>`:''}</span>`;
  if(p.speciesSecret) c += `<span class="chip sp">${p.speciesSecret}</span>`;
  c += `<span class="chip">${STR.age(p.age)}</span>`;
  return `<div class="chips">${c}</div>`;
}
function card(p){
  return `<button class="pcard" data-npc="${p.id}" data-group="${p.group}" data-demi="${p.demi?1:0}">${portrait(p)}<div class="meta"><b>${esc(p.name)}</b><span>${esc(p.role)}</span>${p.roleSecret?`<span class="sp" style="font-size:.84rem">${esc(p.roleSecret)}</span>`:''}${chips(p)}</div></button>`;
}
function renderPeople(){
  const w = PEOPLE.filter(p=>p.group==="world").map(card).join("");
  const m = PEOPLE.filter(p=>p.group==="miami").map(card).join("");
  document.getElementById("peopleWrap").innerHTML =
   `<div class="pg" data-g="world"><div class="group-title"><h2>${STR.world}</h2><span class="mono muted">${STR.worldSub}</span></div><div class="people">${w}</div></div>
    <div class="pg" data-g="miami"><div class="group-title"><h2>${STR.miami}</h2><span class="mono muted">${STR.miamiSub}</span></div><div class="people">${m}</div></div>`;
  document.getElementById("miamiPeople").innerHTML = m;
}
function renderBots(){
  const html = BOTS.map(b=>{
    const p = byId[b.id];
    const av = b.url
      ? `<a class="av" href="${b.url}" target="_blank" rel="noopener">${portrait(p)}<span class="go-tag"><span>${STR.openJan}</span><span>↗</span></span></a>`
      : `<button class="av" type="button" data-soon="${p.id}">${portrait(p)}<span class="go-tag"><span>${STR.soonJan}</span><span>…</span></span></button>`;
    return `<article class="bot">${av}<div class="info">
      <span class="mono k">${b.url?STR.online:STR.wip}</span>
      <b>${esc(p.name)}</b>
      <p>${esc(p.role)}</p>${p.roleSecret?`<p class="sp">${esc(p.roleSecret)}</p>`:''}
      ${chips(p)}
      <div class="acts"><button class="btn" data-npc="${p.id}">${STR.dossier}</button>${b.url?`<a class="btn pri" href="${b.url}" target="_blank" rel="noopener">${STR.chat}</a>`:`<button class="btn" data-soon="${p.id}">${STR.chatSoon}</button>`}</div>
    </div></article>`;
  }).join("") + `<article class="bot soon"><div><span class="rb" aria-hidden="true"></span><span class="mono k">${STR.slotFree}</span><h3 style="margin:8px 0 6px;font-family:var(--display);font-weight:500;text-transform:uppercase">${STR.soon}</h3><p class="muted" style="font-size:.92rem">${STR.slotText}</p></div></article>`;
  document.getElementById("botsWrap").innerHTML = html;
}

/* ---------- Окна ---------- */
const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
function showOverlay(){ overlay.classList.add("show"); overlay.setAttribute("aria-hidden","false"); overlay.scrollTop=0; document.body.style.overflow="hidden"; wireSpoilers(overlay); const c=overlay.querySelector(".close"); if(c) c.focus(); }
function hideOverlay(){ overlay.classList.remove("show"); overlay.setAttribute("aria-hidden","true"); document.body.style.overflow=""; modal.className="modal"; }

function openNpc(id){
  const p = byId[id]; if(!p) return;
  const look = Object.entries(p.look).map(([k,v])=>`<div><em>${k}</em>${esc(v)}</div>`).join("");
  const para = t => '<p>'+esc(t)+'</p>';
  let body = `<div><h4>${STR.look}</h4><div class="look">${look}</div>${p.lookSecret?`<div style="margin-top:10px">${spoiler(para(p.lookSecret))}</div>`:''}</div>`;
  body += `<div><h4>${STR.character}</h4>${para(p.character)}${p.characterSecret?`<div style="margin-top:10px">${spoiler(para(p.characterSecret))}</div>`:''}</div>`;
  if(p.extra) body += `<div><h4>${STR.bio}</h4>${para(p.extra)}</div>`;
  (p.more||[]).forEach(m=>{ body += `<div><h4>${esc(m.h)}</h4>${m.s?spoiler(para(m.t)):para(m.t)}</div>`; });
  if(typeof p.relations==="string" && p.relations) body += `<div><h4>${STR.relations}</h4>${para(p.relations)}</div>`;
  if(p.relationsSecret) body += `<div><h4>${STR.relations}</h4>${spoiler(para(p.relationsSecret))}</div>`;
  if(p.links && p.links.length) body += `<div><h4>${STR.linked}</h4><div class="rel">${p.links.map(l=>`<button data-npc="${l}">${esc(byId[l].name)}</button>`).join("")}</div></div>`;
  const bot = BOTS.find(b=>b.id===id);
  modal.className="modal";
  modal.innerHTML = `
    <button class="close" aria-label="${STR.close}" data-close>✕</button>
    <div class="m-top">${portrait(p)}
      <div class="m-info"><span class="mono k">${no(p)} · ${p.group==="miami"?STR.miami:STR.world}</span>
        <h2 id="mName">${esc(p.name)}</h2>
        <p class="muted">${esc(p.role)}</p>
        ${p.roleSecret?`<p class="sp">${esc(p.roleSecret)}</p>`:''}
        ${chips(p)}
        ${bot?`<div class="acts" style="display:flex;gap:8px;margin-top:6px">${bot.url?`<a class="btn pri" href="${bot.url}" target="_blank" rel="noopener">${STR.botJan}</a>`:`<button class="btn" data-soon="${p.id}">${STR.botSoon}</button>`}</div>`:''}
      </div></div>
    <div class="m-body">${body}</div>`;
  showOverlay();
}
function openSoon(id){
  const p = byId[id];
  modal.className="modal small-modal";
  modal.innerHTML = `<button class="close" aria-label="${STR.close}" data-close>✕</button>
    <span class="rb" aria-hidden="true"></span>
    <span class="mono k">${STR.wip}</span>
    <h2 id="mName" style="font-size:1.3rem">${STR.soonJan}</h2>
    <p class="muted">${esc(STR.soonText(p.name))}</p>
    <button class="btn pri" data-close>${STR.ok}</button>`;
  showOverlay();
}

/* ---------- Карта Майами ---------- */
const short = d => d.ark ? d.n : d.n.split(STR.and)[0];
function renderMap(){
  let gl=""; for(let i=50;i<600;i+=50) gl+=`<line class="gridl" x1="${i}" y1="0" x2="${i}" y2="700"/>`; for(let j=50;j<700;j+=50) gl+=`<line class="gridl" x1="0" y1="${j}" x2="600" y2="${j}"/>`;
  document.getElementById("gridLines").innerHTML=gl;
  const g = document.getElementById("mapDots");
  g.innerHTML = DISTRICTS.map((d,i)=>{
    const right = d.a ? d.a==="start" : d.x < 420;
    const anchor = (right||d.ark) ? "start" : "end";
    const lx = anchor==="start" ? d.x+11 : d.x-11;
    return `<g class="dot${d.nest?' nest':''}${d.ark?' ark':''}" data-i="${i}" tabindex="0" role="button" aria-label="${esc(d.n)}"><circle cx="${d.x}" cy="${d.y}" r="${d.nest?9:6}"/><text class="lbl" x="${lx}" y="${d.y+4}" text-anchor="${anchor}" ${d.ark?'style="fill:var(--secret)"':''}>${esc(short(d))}</text></g>`;
  }).join("");
  g.querySelectorAll(".dot").forEach(el=>{
    el.addEventListener("click",()=>selDistrict(+el.dataset.i));
    el.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();selDistrict(+el.dataset.i);} });
  });
  selDistrict(0);
}
function selDistrict(i){
  const d = DISTRICTS[i];
  document.querySelectorAll("#mapDots .dot").forEach(el=>el.classList.toggle("sel", +el.dataset.i===i));
  const on = document.body.classList.contains("spoilers-on");
  document.getElementById("districtCard").innerHTML =
    `<span class="mono" style="color:${d.ark?'var(--secret)':'var(--accent)'}">${d.ark?STR.arkPlace:(d.nest?STR.nest:STR.district)}</span><h3 style="font-family:var(--display);font-weight:500;text-transform:uppercase">${esc(d.n)}</h3><p style="color:var(--ink)">${esc(d.t)}</p>
     <p style="font-size:.84rem">${STR.mapHint}${on?'':STR.mapHintSp}</p>
     <div class="chips" style="margin-top:4px">${DISTRICTS.map((x,j)=>(!x.ark||on)?`<button class="chip${x.ark?' sec':''}" data-di="${j}">${esc(short(x))}</button>`:'').join("")}</div>`;
  document.querySelectorAll("#districtCard [data-di]").forEach(b=>b.addEventListener("click",()=>selDistrict(+b.dataset.di)));
}

/* ---------- Спойлеры ---------- */
function wireSpoilers(root){
  root.querySelectorAll(".spoiler").forEach(s=>{
    if(!s.querySelector(":scope > .sp-head")) s.insertAdjacentHTML("afterbegin", `<button class="sp-head" type="button">${EYE}<span>${STR.spOpen}</span></button>`);
    const h = s.querySelector(":scope > .sp-head");
    if(h.dataset.w) return; h.dataset.w=1;
    h.addEventListener("click",()=>{ s.classList.toggle("open"); h.querySelector("span").textContent = s.classList.contains("open")?STR.spClose:STR.spOpen; });
  });
  root.querySelectorAll(".sp").forEach(s=>{
    if(s.dataset.w) return; s.dataset.w=1;
    s.title=STR.spTitle;
    s.addEventListener("click",e=>{ if(!s.classList.contains("open")){ e.preventDefault(); e.stopPropagation(); s.classList.add("open"); } });
  });
}
const store = { get(k){try{return localStorage.getItem(k)}catch(e){return null}}, set(k,v){try{localStorage.setItem(k,v)}catch(e){}} };
function setSpoilers(on){
  document.body.classList.toggle("spoilers-on", on);
  const b = document.getElementById("spBtn");
  b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
  b.querySelector("span").textContent = on ? STR.spOn : STR.spOff;
  store.set("demi-spoilers", on?"1":"0");
  const sel = document.querySelector("#mapDots .dot.sel"); if(sel) selDistrict(+sel.dataset.i);
}

/* ---------- Тема (тёмная по умолчанию) ---------- */
const SUN='<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
const MOON='<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
const currentTheme = () => document.documentElement.getAttribute("data-theme")==="light" ? "light" : "dark";
function paintThemeBtn(){
  const dark = currentTheme()==="dark";
  document.getElementById("themeIcon").innerHTML = dark ? SUN : MOON;
  document.getElementById("themeLabel").textContent = dark ? STR.light : STR.dark;
}
function setTheme(t){ document.documentElement.setAttribute("data-theme", t); store.set("demi-theme", t); paintThemeBtn(); }

/* ---------- Язык: переход на другую страницу с тем же разделом ---------- */
document.getElementById("langBtn").addEventListener("click",()=>{
  const target = LANG==="ru" ? "en.html" : "index.html";
  location.href = target + location.hash;
});

/* ---------- Навигация ---------- */
const VIEWS = ["home","basics","history","laws","society","species","ark","people","miami","bots"];
let lastView = "home";
function buildSubnavs(){
  document.querySelectorAll(".view").forEach(v=>{
    const sn = v.querySelector(".subnav"); if(!sn) return;
    v.querySelectorAll("section.block[data-title]").forEach(s=>{
      const b = document.createElement("button"); b.type="button"; b.textContent = s.dataset.title;
      b.addEventListener("click",()=>s.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
      sn.appendChild(b);
    });
  });
}
function show(view){
  if(!VIEWS.includes(view)) view="home";
  lastView = view;
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active", v.id==="v-"+view));
  document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-selected", t.dataset.go===view));
  const t = document.querySelector(`.tab[data-go="${view}"]`); if(t) t.scrollIntoView({block:"nearest",inline:"nearest"});
}
function route(){
  const h = location.hash.slice(1);
  if(h.startsWith("npc-")){ if(!document.querySelector(".view.active")) show("people"); openNpc(h.slice(4)); return; }
  const wasOpen = overlay.classList.contains("show");
  hideOverlay();
  if(wasOpen && (h||"home")===lastView) return;
  show(h||"home"); window.scrollTo(0,0);
}
function go(view){ if(location.hash.slice(1)===view) route(); else location.hash = view; }
function closeAny(){ if(location.hash.startsWith("#npc-")) location.hash = lastView; else hideOverlay(); }

document.addEventListener("click", e=>{
  const g = e.target.closest("[data-go]"); if(g){ go(g.dataset.go); return; }
  const s = e.target.closest("[data-soon]"); if(s){ e.preventDefault(); openSoon(s.dataset.soon); return; }
  const n = e.target.closest("[data-npc]"); if(n){ e.preventDefault(); location.hash = "npc-"+n.dataset.npc; return; }
  if(e.target.closest("[data-close]") || e.target===overlay) closeAny();
});
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && overlay.classList.contains("show")) closeAny(); });
document.querySelectorAll(".filter button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".filter button").forEach(x=>x.setAttribute("aria-pressed", x===b));
  const f = b.dataset.f;
  document.querySelectorAll("#peopleWrap .pg").forEach(pg=>pg.style.display = (f==="all"||f==="demi"||pg.dataset.g===f)?"":"none");
  document.querySelectorAll("#peopleWrap .pcard").forEach(c=>c.style.display = (f==="demi" && c.dataset.demi!=="1")?"none":"");
}));
document.querySelectorAll("[data-profile]").forEach(a=>a.href = PROFILE_URL);

/* ---------- Запуск ---------- */
renderPeople(); renderBots(); renderMap(); buildSubnavs(); wireSpoilers(document);
paintThemeBtn();
document.getElementById("themeBtn").addEventListener("click",()=>setTheme(currentTheme()==="dark"?"light":"dark"));
document.getElementById("spBtn").addEventListener("click",()=>setSpoilers(!document.body.classList.contains("spoilers-on")));
setSpoilers(store.get("demi-spoilers")==="1");
window.addEventListener("hashchange", route);
if(location.hash.startsWith("#npc-")) show("people");
route();
