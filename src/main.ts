import './style.css';
import { cardDatabase } from './cards/CardDatabase';
import { GameState, type GameMode } from './game/GameState';
import type { Card } from './cards/Card';
import { HISTORICAL_EVENTS } from './events/EventDatabase';
import { HISTORICAL_ITEMS } from './items/ItemDatabase';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('No existe #app');

const game = new GameState();
let activeEventId = localStorage.getItem('peropero-active-event') || HISTORICAL_EVENTS[0].id;
const currentEvent = () => HISTORICAL_EVENTS.find(e => e.id === activeEventId) ?? HISTORICAL_EVENTS[0];
game.load();
game.tickResources(Date.now(), false);
let chanceCards: Card[] = [];
let gachaChoices: Card[] = [];
let gachaRarity: 'N'|'R'|'SR'|null = null;
let missionTab: 'common'|'special'|'progress' = 'common';
let lastExplore: { icons: string[]; outcome: string; pero: number; exp: number } | null = null;

const formatTime = (ms: number): string => { const t=Math.max(0,Math.ceil(ms/1000)); const d=Math.floor(t/86400); const h=Math.floor((t%86400)/3600); const m=Math.floor((t%3600)/60); const sec=t%60; return d>0 ? `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; };

const esc = (value: string): string => value.replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char] ?? char));

const MENU: Array<{id: GameMode; label: string}> = [
  {id:'home',label:'HOME'}, {id:'explore',label:'EXPLORE'}, {id:'gacha',label:'GACHA'},
  {id:'collection',label:'HAREM'}, {id:'missions',label:'MISSION'},
];

function go(mode: GameMode) {
  if (!game.setMode(mode)) return popup('LOCKED','This feature is not unlocked yet.');
  render();
}

function chrome(content: string): string {
  const percent = Math.round((game.player.exp / game.player.expToNext) * 100);
  return `<div class="retro-game">
    <div class="title-strip">
      <button class="logo" data-mode="home">PeroPero <small>SEDUCTION</small></button>
      <div class="top-links">${MENU.map(m => `<button class="top-link ${game.currentMode===m.id?'sel':''}" data-mode="${m.id}">${m.label}</button>`).join('')}</div>
      <button class="event-top-button" id="eventQuickOpenTop">EVENT</button><div class="top-status"><span>Lv.${game.player.level}</span><span>${game.totalSed.toLocaleString()} SED</span><span>♥ <b id="staminaValue">${game.player.stamina}/${game.player.maxStamina}</b> <i id="staminaTimer">${game.player.stamina>=game.player.maxStamina?"FULL":formatTime(game.staminaNextInMs)}</i></span><span>◉ <b id="focusValue">${game.player.focus}/${game.player.maxFocus}</b> <i id="focusTimer">${game.player.focus>=game.player.maxFocus?"FULL":formatTime(game.focusNextInMs)}</i></span><span>¥ ${game.inventory.pero.toLocaleString()}</span></div>
    </div>
    <div class="blue-line"></div>
    <main class="stage">
      ${content}
    </main>
    <div class="bottom-hud">
      <div class="hud-cell hud-stamina"><b>♥</b><span class="bar"><i id="staminaBar" style="width:${(game.player.stamina/game.player.maxStamina)*100}%"></i></span><em><strong id="hudStaminaValue">${game.player.stamina}/${game.player.maxStamina}</strong> <small id="hudStaminaTimer">${game.player.stamina>=game.player.maxStamina?"FULL":formatTime(game.staminaNextInMs)}</small></em></div>
      <button class="go-button" data-mode="explore">GO</button>
      <div class="hud-cell hud-exp"><b>EXP</b><span class="bar"><i style="width:${percent}%"></i></span><em>${game.player.exp}/${game.player.expToNext}</em></div>
      <div class="hud-points"><b>SED</b><strong>${game.totalSed.toLocaleString()}</strong></div>
    </div>
    <div class="event-status-bar"><span>EVENT</span><b title="${esc(currentEvent().name)}">${esc(currentEvent().name)}</b><button id="eventQuickOpen">SELECT EVENT</button></div>
  </div>`;
}

function home(): string {
  const complete = game.tutorial.completed;
  return chrome(`<section class="home-screen">
    <div class="home-art home-backdrop"><div class="hero-card hero-left"><img src="/cards/runa-kamiwano/01.jpg" alt=""></div><div class="hero-card hero-center"><img src="/cards/akie/01.jpg" alt=""></div><div class="hero-card hero-right"><img src="/cards/risa/01.jpg" alt=""></div><div class="halftone"></div><div class="headline"><span>PeroPero</span><strong>SEDUCTION</strong><small>THE ORIGINAL HAREM ADVENTURE</small></div></div>
    <div class="home-menu" role="navigation">
      <button class="big-round pink" data-mode="explore"><strong>EXPLORE</strong><small>Girl Hunt Quest</small></button>
      <button class="big-round black" data-mode="gacha"><strong>GACHA</strong><small>Card Machine</small></button>
      <button class="big-round blue" data-mode="collection"><strong>HAREM</strong><small>Girl Cards</small></button>
      <button class="big-round gold" data-mode="missions"><strong>MISSION</strong><small>Daily / Special</small></button>
    </div>
    <div class="home-news"><b>MISSION</b><span>${complete ? 'Continue your hunt.' : 'I\'m Coming for You, Airu — Tutorial Reward: R Gacha Ticket x1'}</span><button id="tutorialBtn">${complete?'HELP':'START'}</button></div>
  </section>`);
}

function explore(): string {
  const locations = Array.from({length:9},(_,i)=>i+1);
  const iconNames: Record<string,string> = {chance:'CHANCE',pero:'PERO',exp:'EXP',gift:'GIFT',miss:'—'};
  return chrome(`<section class="screen explore-screen">
    <div class="screen-title"><span>01</span><h1>EXPLORE</h1><small>Search for target girls. Spend Stamina to receive EXP, Pero and Cards. <b>RECOVERY 1/MIN · 1,440 PER 24H</b> · NEXT +1 <span id="exploreStaminaTimer">${game.player.stamina>=game.player.maxStamina?"FULL":formatTime(game.staminaNextInMs)}</span></small></div>
    <div class="explore-map"><div class="map-rings"></div><div class="map-label">STAGE ${game.progress.explorationStage}</div>${locations.map(n=>`<button class="map-node ${n===game.progress.explorationLocation?'current':''}">${n}</button>`).join('')}</div>
    <div class="spin-panel">
      <div class="slots">${lastExplore ? lastExplore.icons.map((i)=>`<div class="slot slot-${i}">${iconNames[i]}</div>`).join('') : '<div class="slot">?</div><div class="slot">?</div><div class="slot">?</div>'}</div>
      <div class="result-line">${lastExplore ? `<b>${lastExplore.outcome.toUpperCase()}</b> · +${lastExplore.exp} EXP · +${lastExplore.pero.toLocaleString()} PERO` : 'Press GO to spin the slots.'}</div>
      <button class="retro-button pink-button spin-go" id="spin">GO</button>
    </div>
    ${chanceCards.length ? `<div class="chance-panel"><div class="chance-title">CHANCE TIME <small>Choose 1 of 6 cards</small></div><div class="chance-grid">${chanceCards.map((c)=>`<button class="chance-card" data-chance="${c.id}"><img src="${esc(c.currentImage)}" alt=""><div><span>${c.rarity}</span><b>${esc(c.name)}</b><small>${c.type} · Lv.${c.level} · ${c.maxBaseSed.toLocaleString()} SED</small></div></button>`).join('')}</div></div>`:''}
  </section>`);
}

function gacha(): string {
  const machine = (r: 'N'|'R'|'SR', label: string, accent: string, note: string) => {
    const tickets = game.inventory.gachaTickets[r];
    const free = r === 'N' && game.canUseFreeNormalGacha();
    const available = r === 'N' ? (free || tickets > 0) : tickets > 0;
    return `<div class="machine machine-${r}" style="--gacha-accent:${accent}">
      <div class="machine-top"><span class="machine-lamp"></span>${label}</div>
      <div class="machine-body"><div class="machine-window"><div class="machine-orb"></div><div class="machine-glow"></div><b>PeroPero</b></div><div class="machine-roll"><span></span><span></span><span></span></div></div>
      <div class="machine-meta"><span>${r==='N' && free ? 'FREE DRAW READY' : `${tickets} TICKET${tickets===1?'':'S'}`}</span><small>${note}</small></div>
      <button class="retro-button gacha-action" data-gacha="${r}" ${available?'':'disabled'}>${r==='N' && free ? 'FREE GACHA' : 'USE TICKET'}</button>
    </div>`;
  };
  return chrome(`<section class="screen gacha-screen gacha-backdrop">
    <div class="screen-title"><span>02</span><h1>GACHA</h1><small>Normal Gacha · Rare Gacha · SR Gacha <b>· SIX-CARD REVEAL</b></small></div>
    <div class="gacha-banner"><strong>GACHA MACHINE</strong><span>Combine companion cards to strengthen your harem.</span><em>N ${game.inventory.gachaTickets.N} · R ${game.inventory.gachaTickets.R} · SR ${game.inventory.gachaTickets.SR}</em></div>
    <div class="gacha-machines">${machine('N','NORMAL GACHA','#ff79b7','Free Gacha / N pool')}${machine('R','RARE GACHA','#e8eef2','Rare Ticket')}${machine('SR','SR GACHA','#ffd72c','SR Ticket')}</div>
    ${gachaChoices.length ? `<div class="gacha-reveal"><div class="reveal-head"><b>${gachaRarity} GACHA</b><span>Choose 1 of 6 cards</span><small>Card Reveal can expose all six positions.</small></div><div class="reveal-grid">${gachaChoices.map((c,i)=>`<button class="reveal-card" data-gacha-choice="${i}"><span class="back-face">PERO</span><img src="${esc(c.currentImage)}" alt="" loading="lazy"><small>POSITION ${i+1}</small></button>`).join('')}</div></div>` : `<div class="gacha-history"><b>HOW IT WORKS</b><span>Choose a machine, spin, then select one position from the six-card reveal.</span></div>`}
    ${chanceCards.length ? `<div class="gacha-results"><div class="result-title">LAST RESULT</div>${chanceCards.map(c=>`<div class="draw-card"><img src="${esc(c.currentImage)}" alt=""><b>${c.rarity}</b><strong>${esc(c.name)}</strong><small>${c.type} · ${c.sed.toLocaleString()} SED</small></div>`).join('')}</div>` : ''}
  </section>`);
}
const LEGACY_COLLECTION_CARDS = [
  {name:'Kokoa Muto', rarity:'N', type:'Sexy', sed:14316, image:'/historical/collection-cards/cardart_01.png', label:'Elite'},
  {name:'Hayama Mimarin', rarity:'SR', type:'Babe', sed:13490, image:'/historical/collection-cards/cardart_02.png', label:'',},
  {name:'Aizome Aoi', rarity:'SR', type:'Moe', sed:13080, image:'/historical/collection-cards/cardart_03.png', label:''},
  {name:'Succubus Ziska', rarity:'SR', type:'Sexy', sed:13080, image:'/historical/collection-cards/cardart_04.png', label:''},
  {name:'Kaimoto Iruka', rarity:'SR', type:'Moe', sed:12990, image:'/historical/collection-cards/cardart_05.png', label:''},
  {name:'Yukimura Yukari', rarity:'SR', type:'Sexy', sed:12880, image:'/historical/collection-cards/cardart_06.png', label:'Limited'},
  {name:'Mimi Odakata', rarity:'SR', type:'Sexy', sed:12610, image:'/historical/collection-cards/cardart_07.png', label:''},
  {name:'Ayako Mayuzumi', rarity:'SR', type:'Moe', sed:12430, image:'/historical/collection-cards/cardart_08.png', label:''},
  {name:'Kotoka Hoshino', rarity:'SR', type:'Moe', sed:12200, image:'/historical/collection-cards/cardart_09.png', label:''},
  {name:'Reona Isogawa', rarity:'SR', type:'Moe', sed:12030, image:'/historical/collection-cards/cardart_10.png', label:''},
  {name:'Sakurako Kakizaki', rarity:'SR', type:'Moe', sed:11850, image:'/historical/collection-cards/cardart_11.png', label:''},
  {name:'Nina Manami', rarity:'SR', type:'Moe', sed:11020, image:'/historical/collection-cards/cardart_12.png', label:''},
  {name:'My All-star Collection', rarity:'SR', type:'Moe', sed:10900, image:'/historical/collection-cards/cardart_13.png', label:''},
  {name:'Nami Wakabayashi', rarity:'SR', type:'Moe', sed:10650, image:'/historical/collection-cards/cardart_14.png', label:''},
] as const;
let collectionPage = 1;
let collectionFilter: 'all'|'N'|'R'|'SR' = 'all';
let collectionType: 'all'|'Moe'|'Babe'|'Sexy' = 'all';

function legacyCollectionCard(card: typeof LEGACY_COLLECTION_CARDS[number], idx: number): string {
  const rarityClass = card.rarity === 'SR' ? 'sr' : 'n';
  const actualIndex = idx >= 0 ? idx : cardDatabase.findIndex(x => x.name.toLowerCase() === card.name.toLowerCase());
  return `<button class="legacy-card-tile ${rarityClass}" data-card="${actualIndex}" aria-label="${esc(card.name)}">
    <span class="legacy-card-art"><img src="${card.image}" alt="${esc(card.name)}"></span>
    <span class="legacy-card-name">${esc(card.name)}</span>
    <span class="legacy-card-stats"><b>Lv.100</b><b>SED: ${card.sed.toLocaleString()}</b></span>
    ${card.label ? `<span class="legacy-ribbon">${esc(card.label)}</span>` : ''}
    <span class="legacy-heart">♥</span>
  </button>`;
}

function collection(): string {
  const filtered = LEGACY_COLLECTION_CARDS.filter(c => (collectionFilter==='all' || c.rarity===collectionFilter) && (collectionType==='all' || c.type===collectionType));
  const pageCount = 11;
  const visible = collectionPage === 1 ? filtered.slice(0,14) : [];
  const cards = visible.length ? visible.map(c => legacyCollectionCard(c,cardDatabase.findIndex(x => x.name.toLowerCase() === c.name.toLowerCase()))).join('') : `<div class="legacy-empty-page"><b>MY COLLECTION</b><span>Additional historical pages are loaded from the reconstructed card catalog.</span></div>`;
  return `<section class="collection-rebuild">
    <div class="collection-topbar">
      <button class="legacy-home" data-mode="home"><span class="home-icon">⌂</span> HOME</button>
      <div class="legacy-resource"><span>Lv: <b>${game.player.level}</b></span><span>Exp: <b>${game.player.exp.toLocaleString()}</b></span><span>To next Lv: <b>${game.player.expToNext.toLocaleString()}</b></span><span>Friends: <b>${game.player.peroFriends}/35</b></span><span>Coins: <b>${game.inventory.pero.toLocaleString()}</b></span></div>
      <div class="legacy-meter focus-meter"><small>Focus</small><i style="width:${Math.round(game.player.focus/game.player.maxFocus*100)}%"></i><b>${game.player.focus}/${game.player.maxFocus}</b><em>Full Recovery in: ${game.player.focus>=game.player.maxFocus?'00:00:00':formatTime(game.focusNextInMs)}</em></div>
      <div class="legacy-top-icons"><span>♥</span><span>◉</span><span>☰</span></div>
    </div>
    <div class="collection-title"><span>★</span><strong>MY GIRLS</strong><span>★</span></div>
    <div class="collection-notice"><div class="notice-girl">◔</div><div><b>card list.</b><span>Drag one of your cards to the deck in the upper left to make a set of Support cards.</span></div><div class="bulk-buy"><b>SAVE BIG by buying in bulk!</b><strong>BUY 5x E-Gacha Ticket <em>and FREE 1x</em></strong></div></div>
    <div class="deck-filter-row">
      <div class="my-deck"><div class="panel-label">MY DECK</div><div class="deck-slots">${[1,2,3,4,5].map((n,i)=>`<div class="deck-slot"><span>${i===2?'♣':'◉'}</span><small>${n}</small></div>`).join('')}</div><button class="confirm">Confirm Changes</button></div>
      <div class="filter-box"><div class="filter-count"><b>OWNED</b><strong>337</strong><b>NOT<br>OWNED</b><strong>739</strong></div><div class="filter-groups"><div><span>Rarity</span>${['N','R','SR'].map(r=>`<button data-rarity="${r}" class="filter-pill ${collectionFilter===r?'active':''}">${r}</button>`).join('')}</div><div><span>Attributes</span>${['M','B','S'].map((x,i)=>`<button data-type="${['Moe','Babe','Sexy'][i]}" class="filter-pill ${collectionType===['Moe','Babe','Sexy'][i]?'active':''}">${x}</button>`).join('')}</div></div><button class="reset-filter" id="collectionReset">Reset</button><button class="update-list">Update list</button></div>
    </div>
    <div class="collection-panel">
      <div class="collection-panel-head"><span class="panel-label">MY COLLECTION</span><strong>Seduction Power : ${game.totalSed.toLocaleString()}</strong><div class="page-control"><button id="collectionPrev" ${collectionPage<=1?'disabled':''}>◀</button><b>${collectionPage} / ${pageCount}</b><button id="collectionNext" ${collectionPage>=pageCount?'disabled':''}>▶</button></div><button class="sort-select" id="collectionSort">Highest Lv. ▾</button></div>
      <div class="legacy-grid">${cards}</div>
    </div>
    <button class="collection-scroll">●</button>
  </section>`;
}

function missions(): string {
  game.achievements.sync();
  const common = game.missions.missions.slice(0,14).map(m=>`<div class="mission-row"><span class="mission-icon mission-${m.category.toLowerCase().replace(/[^a-z]/g,'')}"><i></i></span><div><b>${esc(m.name)}</b><small>${esc(m.objective)}</small><span class="mission-bar"><i style="width:${Math.min(100,m.progress/m.target*100)}%"></i></span></div><strong>${m.progress}/${m.target}</strong><button class="claim" data-claim="${m.id}" ${game.missions.canClaim(m)?'':'disabled'}>CLAIM</button></div>`).join('');
  const special = game.missions.specialMissions.map(m=>{ const progress=game.missions.getSpecialProgress(m); return `<div class="mission-row special-row"><span class="mission-icon mission-special"><i></i></span><div><b>${esc(m.name)}</b><small>${esc(m.objective)}${m.note?` · ${esc(m.note)}`:''}</small><span class="mission-bar"><i style="width:${Math.min(100,m.target?progress/m.target*100:0)}%"></i></span></div><strong>${progress}/${m.target}</strong><button class="claim" data-special-claim="${m.id}" ${game.missions.canClaimSpecial(m)?'':'disabled'}>${m.claimed?'DONE':'CLAIM'}</button></div>`; }).join('');
  const inProgress = [...game.missions.missions.filter(m=>!m.claimed), ...game.missions.specialMissions.filter(m=>!m.claimed)].slice(0,18).map(m=>`<div class="mission-progress-card"><b>${esc(m.name)}</b><small>${esc(m.objective ?? '')}</small><em>${'progress' in m ? m.progress : game.missions.getSpecialProgress(m)}/${m.target}</em></div>`).join('');
  const body = missionTab==='special' ? special : missionTab==='progress' ? inProgress : common;
  return chrome(`<section class="screen mission-screen mission-backdrop"><div class="screen-title"><span>04</span><h1>MISSION</h1><small>Daily missions reset at 4:00 PM Pacific · next reset <b id="dailyResetTimer">${formatTime(game.dailyResetInMs)}</b></small></div>
    <div class="tabs"><button class="tab ${missionTab==='common'?'active':''}" data-mission-tab="common">COMMON</button><button class="tab ${missionTab==='special'?'active':''}" data-mission-tab="special">SPECIAL</button><button class="tab ${missionTab==='progress'?'active':''}" data-mission-tab="progress">IN PROGRESS</button></div>
    <div class="mission-list">${body}</div>
  </section>`);
}


function items(): string {
  const counts: Record<string, number> = {
    'n-wild-1': game.inventory.getWildCount('N'), 'r-wild-1': game.inventory.getWildCount('R'),
    'sr-wild-1': game.inventory.getWildCount('SR'), 'ex-wild': game.inventory.exWildCards,
    'n-gacha-ticket': game.inventory.gachaTickets.N, 'r-gacha-ticket': game.inventory.gachaTickets.R,
    'sr-gacha-ticket': game.inventory.gachaTickets.SR,
  };
  HISTORICAL_ITEMS.forEach(i => { counts[i.id] = game.inventory.getItemCount(i.id); });
  return chrome(`<section class="screen items-screen"><div class="screen-title"><span>05</span><h1>ITEM</h1><small>Historical item catalogue reconstructed from surviving documentation.</small></div><div class="item-grid">${HISTORICAL_ITEMS.map(i=>`<article class="item-panel item-${i.category.toLowerCase()}"><div class="item-icon"><span>${i.name.split(' ').map(x=>x[0]).join('').slice(0,3)}</span></div><div><b>${esc(i.name)}</b><small>${esc(i.description)}</small><em>${counts[i.id] ?? 0}</em></div>${['peronamin','peronamin-half','pero-pudding','pero-pudding-half'].includes(i.id)?`<button class="item-use" data-use-item="${i.id}" ${(counts[i.id]??0)>0?'':'disabled'}>USE</button>`:''}</article>`).join('')}</div></section>`);
}

function eventOverlay(): void {
  document.querySelector('.event-overlay')?.remove();
  const ev = currentEvent();
  const root = document.createElement('div'); root.className = 'event-overlay';
  const eventTitle = ev.kind === 'Elite Guard' ? 'Super Elite Guard' : ev.kind;
  const preview = ev.kind === 'Elite Guard' ? '/historical/events/elite-guard-akira.jpg' : '/historical/event-fallback.jpg';
  root.innerHTML = `<div class="event-archive-window">
    <button class="event-close" id="eventClose">×</button>
    <div class="event-archive-top"><span>${esc(eventTitle)}</span><strong>${esc(ev.name)}</strong><b>Lv 17</b></div>
    <div class="event-archive-body">
      <div class="event-main-card">
        <div class="event-card-title">${esc(ev.name)} <b>Lv 17</b></div>
        <div class="event-card-inner"><img src="${preview}" alt=""><div class="event-success">Seduction Successful!</div></div>
        <div class="event-stats"><span>SED <b>3,217,647</b></span><span>Special Card N1.44 × R1.30 × S2.00</span><span>Focus <b>${game.player.focus}/6</b></span></div>
        <div class="event-actions"><button>Search for the<br>Elite Guard</button><button>Support Battle List</button></div>
        <div class="event-items"><div>Pero Pudding<br><b>Owned: 105</b><button>Use</button></div><div>Pero Pudding HALF<br><b>Owned: 121</b><button>Use</button></div><div>Sexual Energy Drink<br><b>Owned: 50</b><button>Shop</button></div><div>Elixir<br><b>Owned: 58</b><button>Shop</button></div></div>
      </div>
      <aside class="event-rankings"><h3>Comments</h3><div class="comment-box">Take it out for me!</div><h3>♛ Seduction Ranking</h3>${[1,2,3].map((n,i)=>`<div class="rank-row"><b>Rank: ${n}</b><span>${['Enpatsu','ZaRazOrn','S3a'][i]}</span><small>Total Damage: ${['7,380,867','676,991','404,117'][i]}</small><button>Tease</button></div>`).join('')}</aside>
    </div>
    <div class="event-chooser"><div><small>EVENT ARCHIVE</small><b>${HISTORICAL_EVENTS.length} historical events</b></div><select id="eventSelect">${HISTORICAL_EVENTS.map(e=>`<option value="${e.id}" ${e.id===activeEventId?'selected':''}>${e.year} · ${esc(e.name)}</option>`).join('')}</select><button id="useEvent">SELECT</button></div>
  </div>`;
  document.body.appendChild(root);
  root.querySelector('#eventClose')?.addEventListener('click',()=>root.remove());
  root.addEventListener('click',e=>{ if(e.target===root) root.remove(); });
  const select = root.querySelector<HTMLSelectElement>('#eventSelect');
  select?.addEventListener('change',()=>{ activeEventId = select.value; });
  root.querySelector('#useEvent')?.addEventListener('click',()=>{ localStorage.setItem('peropero-active-event',activeEventId); root.remove(); render(); });
}

function placeholder(title: string, text: string, number: string): string {
  return chrome(`<section class="screen simple-screen"><div class="screen-title"><span>${number}</span><h1>${title}</h1><small>${text}</small></div><div class="historic-note"><b>HISTORICAL SYSTEM</b><p>This reconstruction will keep the period UI and rules separate from unverified server-only values.</p></div></section>`);
}

function cardDetail(index: number): string {
  const c = cardDatabase[index];
  if (!c) return collection();
  return chrome(`<section class="screen detail-screen"><button class="back-link" data-mode="collection">← HAREM</button><div class="detail-card"><div class="detail-portrait"><img src="${esc(c.currentImage)}" alt="${esc(c.name)}" onerror="this.style.display='none';this.parentElement?.classList.add('missing-art')"><div class="detail-overlay"><b>${c.rarity}</b><strong>${esc(c.name)}</strong><small>${c.type}</small></div></div><div class="detail-copy"><h1>${esc(c.name)}</h1><div class="three-stat"><span>LEVEL <b>${c.level}${c.exLevel?` +${c.exLevel}`:''}</b></span><span>SED <b>${c.sed.toLocaleString()}</b></span><span>MAX <b>${c.maxBaseSed.toLocaleString()}</b></span></div><div class="detail-rule">Moe grows early · Babe evenly · Sexy late. EX Level adds +3 SED per level.</div><div class="stage-list">${c.imageStages.map((s)=>`<button class="stage-chip ${c.isStageUnlocked(c.imageStages.indexOf(s)+1)?'open':''}" ${c.isStageUnlocked(c.imageStages.indexOf(s)+1)?`data-stage="${c.imageStages.indexOf(s)+1}"`:''}>STAGE ${c.imageStages.indexOf(s)+1}<small>LV ${s.level}</small></button>`).join('')}</div></div></div></section>`);
}

function render() {
  const content = game.currentMode === 'home' ? home() : game.currentMode === 'explore' ? explore() : game.currentMode === 'gacha' ? gacha() : game.currentMode === 'collection' ? collection() : game.currentMode === 'missions' ? missions() : game.currentMode === 'items' ? items() : game.currentMode === 'kurito' ? placeholder("KURITO'S NEST",'Trade tickets and other resources with Kurito.','06') : placeholder('SHOP','Resources and limited items.','07');
  app.innerHTML = content;
  bind();
  updateLiveHud();
}

function bind() {
  document.querySelectorAll<HTMLElement>('[data-mode]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.mode as GameMode)));
  document.querySelector('#eventQuickOpen')?.addEventListener('click',eventOverlay);
  document.querySelector('#eventQuickOpenTop')?.addEventListener('click',eventOverlay);
  document.querySelector('#spin')?.addEventListener('click',()=>{
    const result = game.explore.run(1);
    if (!result) return popup('STAMINA','Not enough Stamina.');
    lastExplore = { icons: result.icons, outcome: result.outcome, pero: result.pero, exp: result.exp };
    chanceCards = result.cardChoices;
    if (result.outcome==='chance') game.missions.recordTriple('Chance');
    if (result.outcome==='pero') game.missions.recordTriple('Pero');
    if (result.outcome==='exp') game.missions.recordTriple('Experience');
    if (result.outcome==='gift') game.missions.recordTriple('Gift');
    game.save(); render();
  });
  document.querySelectorAll<HTMLElement>('[data-chance]').forEach(el=>el.addEventListener('click',()=>{ if(game.explore.chooseChance(el.dataset.chance!)){ chanceCards=[]; render(); }}));
  document.querySelectorAll<HTMLElement>('[data-gacha]').forEach(el=>el.addEventListener('click',()=>{const r=el.dataset.gacha as 'N'|'R'|'SR'; const cards=game.gacha.dealSix(r); if(!cards) return popup('GACHA','No ticket/free draw available.'); gachaRarity=r; gachaChoices=cards; render();}));
  document.querySelectorAll<HTMLElement>('[data-gacha-choice]').forEach(el=>el.addEventListener('click',()=>{const index=Number(el.dataset.gachaChoice); const card=gachaChoices[index]; if(!card) return; const result=game.gacha.resolveSelection(card); if(!result) return; chanceCards=[result]; gachaChoices=[]; gachaRarity=null; popup('GACHA', `${result.rarity} · ${result.name}`); render();}));
  document.querySelectorAll<HTMLElement>('[data-mission-tab]').forEach(el=>el.addEventListener('click',()=>{ missionTab = el.dataset.missionTab as typeof missionTab; render(); }));
  document.querySelectorAll<HTMLElement>('[data-claim]').forEach(el=>el.addEventListener('click',()=>{if(game.missions.claim(el.dataset.claim!))render();}));
  document.querySelectorAll<HTMLElement>('[data-special-claim]').forEach(el=>el.addEventListener('click',()=>{if(game.missions.claimSpecial(el.dataset.specialClaim!))render();}));
  document.querySelectorAll<HTMLElement>('[data-use-item]').forEach(el=>el.addEventListener('click',()=>{
    const id=el.dataset.useItem!;
    if(!game.inventory.useItem(id,1)) return;
    if(id==='peronamin') game.player.stamina = game.player.maxStamina;
    if(id==='peronamin-half') game.player.stamina = Math.min(game.player.maxStamina, game.player.stamina + Math.ceil(game.player.maxStamina/2));
    if(id==='pero-pudding') game.player.focus = game.player.maxFocus;
    if(id==='pero-pudding-half') game.player.focus = Math.min(game.player.maxFocus, game.player.focus + 3);
    game.save(); popup('ITEM', `${id.replaceAll('-', ' ')} used.`); render();
  }));
  document.querySelectorAll<HTMLElement>('[data-card]').forEach(el=>el.addEventListener('click',()=>{
    const raw=Number(el.dataset.card);
    if (raw < 0 || Number.isNaN(raw)) { popup('COLLECTION','Historical card art/data has not been recovered for this entry yet.'); return; }
    app.innerHTML=cardDetail(raw); bind();
  }));
  document.querySelector('#collectionPrev')?.addEventListener('click',()=>{ if(collectionPage>1){collectionPage--; render();} });
  document.querySelector('#collectionNext')?.addEventListener('click',()=>{ const max=Math.max(1,Math.ceil(cardDatabase.length/14)); if(collectionPage<max){collectionPage++; render();} });
  document.querySelector('#collectionSort')?.addEventListener('click',()=>{ popup('SORT','Original screen: Highest Lv.'); });
  document.querySelector('#collectionFilterRarity')?.addEventListener('click',()=>{ popup('RARITY','N / R / SR filters are restored on this historical shell.'); });
  document.querySelector('#collectionFilterType')?.addEventListener('click',()=>{ popup('ATTRIBUTES','Use the Moe / Babe / Sexy buttons in the reconstructed Collection.'); });
  document.querySelectorAll<HTMLElement>('[data-rarity]').forEach(el=>el.addEventListener('click',()=>{collectionFilter=el.dataset.rarity as typeof collectionFilter; collectionPage=1; render();}));
  document.querySelectorAll<HTMLElement>('[data-type]').forEach(el=>el.addEventListener('click',()=>{collectionType=el.dataset.type as typeof collectionType; collectionPage=1; render();}));
  document.querySelector('#collectionReset')?.addEventListener('click',()=>{collectionFilter='all'; collectionType='all'; collectionPage=1; render();});
  document.querySelector('#tutorialBtn')?.addEventListener('click',()=>{ if(!game.tutorial.completed){game.claimTutorialReward(); game.tutorial.completed=true; game.firstRun=false; game.advanceTutorial('complete');} popup('MISSION','R Gacha Ticket x1 added.'); render(); });
}

function updateLiveHud() {
  game.tickResources(Date.now(), false);
  const staminaPct = Math.max(0, Math.min(100, (game.player.stamina / game.player.maxStamina) * 100));
  const stamina = `${game.player.stamina}/${game.player.maxStamina}`;
  const focus = `${game.player.focus}/${game.player.maxFocus}`;
  const staminaTimer = game.player.stamina >= game.player.maxStamina ? 'FULL' : formatTime(game.staminaNextInMs);
  const focusTimer = game.player.focus >= game.player.maxFocus ? 'FULL' : formatTime(game.focusNextInMs);
  document.querySelectorAll('#staminaValue,#hudStaminaValue').forEach(el => el.textContent = stamina);
  document.querySelectorAll('#focusValue').forEach(el => el.textContent = focus);
  document.querySelectorAll('#staminaTimer,#hudStaminaTimer').forEach(el => el.textContent = staminaTimer);
  document.querySelectorAll('#focusTimer').forEach(el => el.textContent = focusTimer);
  const bar = document.querySelector<HTMLElement>('#staminaBar'); if (bar) bar.style.width = `${staminaPct}%`;
  const daily = document.querySelector('#dailyResetTimer'); if (daily) daily.textContent = formatTime(game.dailyResetInMs);
  const exploreTimer = document.querySelector('#exploreStaminaTimer'); if (exploreTimer) exploreTimer.textContent = game.player.stamina >= game.player.maxStamina ? 'FULL' : formatTime(game.staminaNextInMs);
  const freeGacha = document.querySelector('#freeGachaTimer'); if (freeGacha) freeGacha.textContent = game.freeNormalGachaInMs ? formatTime(game.freeNormalGachaInMs) : 'READY';
}

function popup(title: string, text: string) {
  const p=document.createElement('div'); p.className='popup'; p.innerHTML=`<b>${esc(title)}</b><span>${esc(text)}</span>`; document.body.appendChild(p); setTimeout(()=>p.remove(),1800);
}

setInterval(updateLiveHud, 1000);
render();
