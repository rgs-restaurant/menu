/* ================================================================
   APP.JS — Restaurant Menu
   ================================================================
   Mode édition : tapez EDIT_SEQUENCE (défaut : c-h-e-f)
   en dehors de tout champ texte.
   ================================================================ */

'use strict';

const APP_START = Date.now();
const MIN_LOADER_MS = 2500;

// ── État global ───────────────────────────────────────────────────
let restaurantInfo = null;
let menuItems      = [];
let isEdit         = false;
let activeTab      = 'info';
let editingId      = null;   // null = nouvel article
let pendingImg     = '';     // URL image en cours dans le formulaire

// Détection séquence clavier
let keyBuf  = [];
let keyTmr  = null;

// Sections par catégorie
const SECTIONS = {
  menu: ['entree', 'plat', 'dessert'],
  bar:  ['cocktail', 'vin', 'spiritueux', 'soft', 'chaud', 'snack'],
};
const SEC_LABELS = {
  entree: 'Entrées', plat: 'Plats', dessert: 'Desserts',
  cocktail: 'Cocktails', vin: 'Vins & Champagnes',
  spiritueux: 'Spiritueux', soft: 'Softs & Eaux',
  chaud: 'Boissons Chaudes', snack: 'Snacks',
};
const DAY_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// ══════════════════════════════════════════════════════════════════
// COUCHE DE DONNÉES (Firebase ou localStorage)
// ══════════════════════════════════════════════════════════════════
const DB = (function () {
  let _fb  = false;
  let _db  = null;

  /* ── SITE_ID : isole les données par établissement ── */
  function sid() {
    return (typeof SITE_ID !== 'undefined' && SITE_ID) ? SITE_ID : 'default';
  }
  function col(name) { return `${sid()}_${name}`; }   // ex: "bistrot_items"
  function lk(name)  { return `${sid()}_${name}`; }   // ex: "bistrot_restaurant_info"

  /* ── Détection de la configuration ── */
  function isFbConfigured() {
    return typeof FIREBASE_CONFIG !== 'undefined'
      && FIREBASE_CONFIG.apiKey
      && FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY';
  }
  function isCldConfigured() {
    return typeof CLOUDINARY_CONFIG !== 'undefined'
      && CLOUDINARY_CONFIG.cloudName
      && CLOUDINARY_CONFIG.cloudName !== 'YOUR_CLOUD_NAME';
  }

  /* ── Helpers localStorage ── */
  function lsGet(k, def) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; }
    catch { return def; }
  }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  function mkId()  { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

  /* ── Données de démonstration ── */
  const SEED = typeof SITE_SEED !== 'undefined' ? SITE_SEED : [
    { id:'se1', category:'menu', section:'entree',
      name:'Foie Gras Maison',
      description:'Foie gras de canard mi-cuit, chutney de figues, brioche toastée.',
      price:18, portionSize:120, portionUnit:'g',
      imageUrl:'https://images.unsplash.com/photo-1600565193348-f74bd3960d45?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'se2', category:'menu', section:'entree',
      name:'Soupe à l\'Oignon Gratinée',
      description:'Recette traditionnelle, croûtons dorés et emmental fondu.',
      price:12, portionSize:350, portionUnit:'g',
      imageUrl:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'se3', category:'menu', section:'entree',
      name:'Tartare de Saumon',
      description:'Saumon de Norvège, citron vert, câpres, aneth et crème légère.',
      price:16, portionSize:150, portionUnit:'g',
      imageUrl:'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'sp1', category:'menu', section:'plat',
      name:'Entrecôte & Frites Maison',
      description:'Bœuf Charolais 45 jours d\'affinage, sauce béarnaise, frites fraîches.',
      price:28, portionSize:280, portionUnit:'g',
      imageUrl:'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'sp2', category:'menu', section:'plat',
      name:'Sole Meunière',
      description:'Sole fraîche du jour, beurre noisette, câpres, persil, pommes vapeur.',
      price:34, portionSize:320, portionUnit:'g',
      imageUrl:'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'sp3', category:'menu', section:'plat',
      name:'Suprême de Volaille',
      description:'Poulet fermier Label Rouge, morilles à la crème, tagliatelles fraîches.',
      price:24, portionSize:260, portionUnit:'g',
      imageUrl:'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'sd1', category:'menu', section:'dessert',
      name:'Crème Brûlée Vanille',
      description:'Vanille de Madagascar, caramel croustillant réalisé à la minute.',
      price:10, portionSize:160, portionUnit:'g',
      imageUrl:'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'sd2', category:'menu', section:'dessert',
      name:'Fondant au Chocolat',
      description:'Chocolat Valrhona 70 %, cœur coulant, boule de glace vanille maison.',
      price:12, portionSize:180, portionUnit:'g',
      imageUrl:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'sb1', category:'bar', section:'cocktail',
      name:'Negroni',
      description:'Campari, Gin Hendrick\'s, Vermouth rouge, zeste d\'orange.',
      price:14, portionSize:9, portionUnit:'cl',
      imageUrl:'https://images.unsplash.com/photo-1605989434030-c293f51432b0?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'sb2', category:'bar', section:'cocktail',
      name:'Kir Royal',
      description:'Crémant d\'Alsace brut, crème de cassis de Dijon.',
      price:12, portionSize:12, portionUnit:'cl',
      imageUrl:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'sv1', category:'bar', section:'vin',
      name:'Bordeaux Rouge — Sélection Maison',
      description:'Médoc, notes de cassis, violette et tabac, tanins soyeux.',
      price:38, portionSize:75, portionUnit:'cl',
      imageUrl:'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
    { id:'ss1', category:'bar', section:'soft',
      name:'Perrier',
      description:'Eau minérale gazeuse naturelle.',
      price:5, portionSize:33, portionUnit:'cl',
      imageUrl:'https://images.unsplash.com/photo-1564419320461-6870880221ad?w=600&q=80',
      unavailable:false, unavailableSetAt:null },
  ];

  /* ── Réinitialisation des indisponibilités expirées ── */
  function resetExpired(items) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return items.map(item => {
      if (item.unavailable && item.unavailableSetAt) {
        if (new Date(item.unavailableSetAt) < todayStart) {
          const reset = { ...item, unavailable: false, unavailableSetAt: null };
          if (_fb) _db.collection(col('items')).doc(item.id).update({ unavailable: false, unavailableSetAt: null }).catch(() => {});
          else      lsUpdateItem(item.id, { unavailable: false, unavailableSetAt: null });
          return reset;
        }
      }
      return item;
    });
  }

  /* ── Opérations localStorage (préfixées par SITE_ID) ── */
  function lsGetInfo()         { return lsGet(lk('restaurant_info'), { ...RESTAURANT_DEFAULTS }); }
  function lsSetInfo(data)     { lsSet(lk('restaurant_info'), data); }
  function lsGetItems()        { const d = lsGet(lk('menu_items'), null); if (!d) { lsSet(lk('menu_items'), SEED); return SEED.map(i=>({...i})); } return d; }
  function lsAddItem(item)     { const all = lsGetItems(); const n = { ...item, id: mkId(), _t: Date.now() }; lsSet(lk('menu_items'), [...all, n]); return n; }
  function lsUpdateItem(id, u) { lsSet(lk('menu_items'), lsGetItems().map(i => i.id === id ? { ...i, ...u } : i)); }
  function lsDeleteItem(id)    { lsSet(lk('menu_items'), lsGetItems().filter(i => i.id !== id)); }

  /* ── Opérations Firebase (collections préfixées par SITE_ID) ── */

  /* Cache court-terme (5 min) pour réduire les lectures Firebase */
  const CACHE_TTL = 15 * 60 * 1000;
  function ck(name) { return `fc_${sid()}_${name}`; }
  function cacheRead(name) {
    try {
      const raw = localStorage.getItem(ck(name));
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      return (Date.now() - ts < CACHE_TTL) ? data : null;
    } catch { return null; }
  }
  function cacheWrite(name, data) {
    try { localStorage.setItem(ck(name), JSON.stringify({ data, ts: Date.now() })); } catch {}
  }
  function cacheBust(name) {
    try { localStorage.removeItem(ck(name)); } catch {}
  }

  async function fbGetInfo() {
    const cached = cacheRead('info');
    if (cached) return cached;
    const snap = await _db.collection(col('config')).doc('restaurant').get();
    const data = snap.exists ? snap.data() : { ...RESTAURANT_DEFAULTS };
    if (!snap.exists) await _db.collection(col('config')).doc('restaurant').set(data);
    cacheWrite('info', data);
    return data;
  }
  async function fbSetInfo(data) {
    await _db.collection(col('config')).doc('restaurant').set(data, { merge: true });
    cacheWrite('info', data);  // mettre le cache à jour immédiatement
  }
  async function fbGetItems() {
    const cached = cacheRead('items');
    if (cached) return cached;
    const snap = await _db.collection(col('items')).orderBy('_t', 'asc').get();
    let items;
    if (!snap.empty) {
      items = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    } else {
      const batch = _db.batch();
      SEED.forEach(item => batch.set(_db.collection(col('items')).doc(item.id), { ...item, _t: Date.now() }));
      await batch.commit();
      items = SEED.map(i => ({ ...i }));
    }
    cacheWrite('items', items);
    return items;
  }
  async function fbAddItem(item) {
    const ref  = _db.collection(col('items')).doc();
    const data = { ...item, id: ref.id, _t: Date.now() };
    await ref.set(data);
    cacheBust('items');  // invalider pour forcer un re-fetch
    return data;
  }
  async function fbUpdateItem(id, u) {
    await _db.collection(col('items')).doc(id).update(u);
    cacheBust('items');
  }
  async function fbDeleteItem(id) {
    await _db.collection(col('items')).doc(id).delete();
    cacheBust('items');
  }

  /* ── API publique ── */
  return {
    get isFirebase()  { return _fb; },
    get isCloudinary(){ return isCldConfigured(); },

    async init() {
      if (isFbConfigured()) {
        try {
          // Éviter le double init si les deux établissements partagent le même projet
          if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
          else firebase.app();
          _db = firebase.firestore();
          _fb = true;
        } catch (e) {
          console.warn('[DB] Firebase init échoué, mode local activé.', e);
          _fb = false;
        }
      }
    },

    async getInfo()        { return _fb ? fbGetInfo()  : lsGetInfo(); },
    async setInfo(data)    { return _fb ? fbSetInfo(data) : lsSetInfo(data); },
    async getItems()       {
      const raw = _fb ? await fbGetItems() : lsGetItems();
      return resetExpired(raw);
    },
    async addItem(item)    { return _fb ? fbAddItem(item)    : lsAddItem(item); },
    async updateItem(id,u) { return _fb ? fbUpdateItem(id,u) : lsUpdateItem(id,u); },
    async deleteItem(id)   { return _fb ? fbDeleteItem(id)   : lsDeleteItem(id); },
  };
})();

// ══════════════════════════════════════════════════════════════════
// UTILITAIRES
// ══════════════════════════════════════════════════════════════════
function fmtPrice(p) {
  if (p === null || p === undefined || p === '') return '';
  const n = parseFloat(p);
  if (isNaN(n)) return '';
  return Number.isInteger(n) ? `${n} €` : `${n.toFixed(2).replace('.', ',')} €`;
}
function fmtPortion(size, unit) {
  if (!size) return '';
  return `${size}\u202f${unit || 'g'}`;
}
function fmtSlots(slots) {
  if (!slots || slots.length === 0) return null;
  return slots.map(s => `${s.open.replace(':', 'h')} – ${s.close.replace(':', 'h')}`).join('&ensp;·&ensp;');
}

function getOpenStatus(hours) {
  if (!hours) return { state: 'unknown' };
  const JS_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const now     = new Date();
  const todayNm = JS_DAYS[now.getDay()];
  const nowMin  = now.getHours() * 60 + now.getMinutes();
  const today   = hours[todayNm];

  if (today && !today.closed && today.slots) {
    for (const s of today.slots) {
      const [oh, om] = s.open.split(':').map(Number);
      const [ch, cm] = s.close.split(':').map(Number);
      if (nowMin >= oh*60+om && nowMin < ch*60+cm)
        return { state: 'open', closeAt: s.close.replace(':', 'h') };
    }
  }
  // Chercher prochaine ouverture
  for (let i = 0; i < 7; i++) {
    const nm  = JS_DAYS[(now.getDay() + i) % 7];
    const day = hours[nm];
    if (!day || day.closed || !day.slots?.length) continue;
    for (const s of day.slots) {
      const [oh, om] = s.open.split(':').map(Number);
      if (i > 0 || oh*60+om > nowMin) {
        const label = i === 0 ? "plus tard aujourd'hui" : i === 1 ? 'demain' : nm.toLowerCase();
        return { state: 'closed', nextDay: label, nextAt: s.open.replace(':', 'h') };
      }
    }
  }
  return { state: 'closed' };
}

// ══════════════════════════════════════════════════════════════════
// TOASTS
// ══════════════════════════════════════════════════════════════════
function toast(msg, type = 'info', ms = 3200) {
  const wrap = document.getElementById('toasts');
  const el   = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('t-out');
    setTimeout(() => el.remove(), 320);
  }, ms);
}

// ══════════════════════════════════════════════════════════════════
// LOADING SCREEN
// ══════════════════════════════════════════════════════════════════
function hideLoader() {
  const elapsed    = Date.now() - APP_START;
  const remaining  = Math.max(0, MIN_LOADER_MS - elapsed);
  const ls         = document.getElementById('loading-screen');
  setTimeout(() => {
    ls.classList.add('fade-out');
    setTimeout(() => ls.classList.add('hidden'), 720);
  }, remaining);
}

// ══════════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════════
const App = {
  toggleNav() {
    const dd   = document.getElementById('nav-dd');
    const btn  = document.getElementById('nav-burger');
    const mask = document.getElementById('nav-mask');
    const open = dd.classList.contains('open');
    dd.classList.toggle('open', !open);
    btn.classList.toggle('open', !open);
    btn.setAttribute('aria-expanded', String(!open));
    mask.classList.toggle('on', !open);
  },
  closeNav() {
    document.getElementById('nav-dd').classList.remove('open');
    document.getElementById('nav-burger').classList.remove('open');
    document.getElementById('nav-burger').setAttribute('aria-expanded', 'false');
    document.getElementById('nav-mask').classList.remove('on');
  },

  /* ── Mode édition ── */
  enterEditMode() {
    isEdit = true;
    document.body.classList.add('edit-mode');
    const badge = document.getElementById('edit-badge');
    badge.classList.remove('hidden');
    // Afficher le compte Google connecté dans le bandeau
    try {
      if (DB.isFirebase && firebase.auth().currentUser) {
        badge.querySelector('span').textContent = `✎ ${firebase.auth().currentUser.email}`;
      }
    } catch {}
    openPanel('info');
  },
  exitEditMode() {
    isEdit = false;
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-badge').classList.add('hidden');
    closePanel();
  },
  toggleEditMode() {
    isEdit ? App.exitEditMode() : App.enterEditMode();
  },
};

// ══════════════════════════════════════════════════════════════════
// PANNEAU ÉDITION
// ══════════════════════════════════════════════════════════════════
function openPanel(tab) {
  document.getElementById('ep-overlay').classList.remove('hidden');
  const ep = document.getElementById('ep');
  ep.classList.remove('hidden');
  requestAnimationFrame(() => ep.classList.add('open'));
  epTab(tab || 'info');
}

function closePanel() {
  const ep = document.getElementById('ep');
  ep.classList.remove('open');
  document.getElementById('ep-overlay').classList.add('hidden');
  setTimeout(() => ep.classList.add('hidden'), 380);
}

function epTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.ep-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  renderPanel(tab);
}

function renderPanel(tab) {
  editingId  = null;
  pendingImg = '';
  const body = document.getElementById('ep-body');
  if (tab === 'info')  { body.innerHTML = buildInfoForm();      initDropZone(body.querySelector('#logo-zone'), url => setLogoValue(url)); }
  if (tab === 'menu')  body.innerHTML = buildItemList('menu');
  if (tab === 'bar')   body.innerHTML = buildItemList('bar');
  if (tab === 'hours') body.innerHTML = buildHoursForm();
}

// ══════════════════════════════════════════════════════════════════
// FORMULAIRE INFOS RESTAURANT
// ══════════════════════════════════════════════════════════════════
function buildLogoZoneContent(val) {
  if (isLogoUrl(val)) {
    return `<img src="${esc(val)}" alt=""
              style="max-height:80px;width:auto;object-fit:contain;padding:0.5rem">`;
  }
  return `<div style="font-size:2rem;text-align:center;padding:0.8rem;
                       color:var(--text2);width:100%">${val || '⚜'}</div>`;
}

function buildInfoForm() {
  const r       = restaurantInfo || {};
  const logoVal = r.logo || '⚜';
  return `
    <div class="ep-row">
      <label class="ep-label">Nom du restaurant</label>
      <input class="ep-input" id="info-name" value="${esc(r.name||'')}" placeholder="Le Bistrot">
    </div>
    <div class="ep-row">
      <label class="ep-label">Accroche</label>
      <input class="ep-input" id="info-tagline" value="${esc(r.tagline||'')}" placeholder="Cuisine française traditionnelle">
    </div>
    <div class="ep-row">
      <label class="ep-label">Logo — glissez une image ou tapez un emoji</label>
      <div class="ep-drop-zone" id="logo-zone">${buildLogoZoneContent(logoVal)}</div>
      <div style="display:flex;gap:0.45rem">
        <input class="ep-input" id="info-logo"
               value="${esc(logoVal)}"
               placeholder="⚜  ou  https://…"
               style="flex:1;${isLogoUrl(logoVal) ? 'font-size:0.78rem' : 'font-size:1.2rem'}"
               oninput="updateLogoPrev(this.value)">
        <button class="ep-btn ep-btn-ghost" onclick="setLogoValue('⚜')" title="Revenir à un emoji">✕</button>
      </div>
    </div>
    <button class="ep-btn ep-btn-primary ep-btn-full" onclick="saveInfoForm()" style="margin-top:0.4rem">
      Enregistrer
    </button>
  `;
}

function updateLogoPrev(val) {
  const zone  = document.getElementById('logo-zone');
  const input = document.getElementById('info-logo');
  if (zone)  zone.innerHTML = buildLogoZoneContent(val);
  if (input) input.style.fontSize = isLogoUrl(val) ? '0.78rem' : '1.2rem';
}

function setLogoValue(val) {
  const input = document.getElementById('info-logo');
  const zone  = document.getElementById('logo-zone');
  if (input) { input.value = val; input.style.fontSize = isLogoUrl(val) ? '0.78rem' : '1.2rem'; }
  if (zone)  zone.innerHTML = buildLogoZoneContent(val);
}

async function saveInfoForm() {
  const name    = document.getElementById('info-name')?.value.trim();
  const logo    = document.getElementById('info-logo')?.value.trim();
  const tagline = document.getElementById('info-tagline')?.value.trim();
  if (!name) { toast('Le nom est requis.', 'error'); return; }
  restaurantInfo = { ...restaurantInfo, name, logo: logo || '⚜', tagline };
  await DB.setInfo(restaurantInfo);
  applyRestaurantInfo();
  toast('Informations enregistrées.', 'success');
}

// ══════════════════════════════════════════════════════════════════
// LISTE DES ARTICLES (édition)
// ══════════════════════════════════════════════════════════════════
function buildItemList(category) {
  let html = `
    <button class="ep-btn ep-btn-primary ep-btn-full" style="margin-bottom:1rem"
            onclick="showItemForm(null, '${category}')">
      + Ajouter un article
    </button>
  `;

  let hasAny = false;
  SECTIONS[category].forEach(section => {
    const items = menuItems.filter(i => i.category === category && i.section === section);
    if (!items.length) return;
    hasAny = true;

    html += `<div class="ep-stitle">${SEC_LABELS[section]}</div><div class="ep-list">`;
    items.forEach(item => {
      const imgEl = item.imageUrl
        ? `<img class="ep-thumb" src="${esc(item.imageUrl)}" alt="" loading="lazy" onerror="this.className='ep-thumb-ph'">`
        : `<div class="ep-thumb-ph"></div>`;
      const pillClass = item.unavailable ? 'off' : 'ok';
      const pillLabel = item.unavailable ? 'Indispo' : 'Dispo';

      html += `
        <div class="ep-item">
          ${imgEl}
          <div class="ep-item-info">
            <div class="ep-item-name">${esc(item.name)}</div>
            <div class="ep-item-meta">${fmtPortion(item.portionSize, item.portionUnit)} · ${fmtPrice(item.price)}</div>
          </div>
          <div class="ep-item-acts">
            <button class="ep-pill ${pillClass}" onclick="toggleDispo('${item.id}')">${pillLabel}</button>
            <button class="ep-act" onclick="showItemForm('${item.id}')" title="Modifier">✎</button>
            <button class="ep-act del" onclick="confirmDelete('${item.id}')" title="Supprimer">✕</button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  });

  if (!hasAny) {
    html += `<p style="color:var(--text3);font-size:0.8rem;text-align:center;padding:2rem 0">
      Aucun article. Utilisez le bouton ci-dessus pour en ajouter.
    </p>`;
  }
  return html;
}

// ══════════════════════════════════════════════════════════════════
// FORMULAIRE ARTICLE (ajout / modification)
// ══════════════════════════════════════════════════════════════════
function showItemForm(id, defaultCategory) {
  editingId  = id || null;
  pendingImg = '';

  const item = id ? menuItems.find(i => i.id === id) : null;
  const cat  = item?.category  || defaultCategory || 'menu';
  const sec  = item?.section   || (cat === 'menu' ? 'plat' : 'cocktail');
  const unit = item?.portionUnit || 'g';

  pendingImg = item?.imageUrl || '';

  const secOptions = (c) => SECTIONS[c].map(s =>
    `<option value="${s}" ${s === sec ? 'selected' : ''}>${SEC_LABELS[s]}</option>`
  ).join('');

  const imgInner = pendingImg
    ? `<img src="${esc(pendingImg)}" alt="" onerror="clearImage()">`
    : `<div class="ep-drop-hint"><span>🖼</span><p>Glissez une image ici</p><small>ou cliquez pour parcourir</small></div>`;

  document.getElementById('ep-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:0.7rem;margin-bottom:1rem">
      <button class="ep-btn ep-btn-ghost" onclick="backToList()">← Retour</button>
      <span style="font-family:var(--font-serif);font-size:1rem">${item ? 'Modifier l\'article' : 'Nouvel article'}</span>
    </div>

    <div class="ep-row">
      <label class="ep-label">Nom *</label>
      <input class="ep-input" id="f-name" value="${esc(item?.name||'')}" placeholder="Entrecôte & Frites">
    </div>
    <div class="ep-row">
      <label class="ep-label">Description</label>
      <textarea class="ep-textarea" id="f-desc" placeholder="Bœuf Charolais, frites maison…">${esc(item?.description||'')}</textarea>
    </div>
    <div class="ep-row ep-2col">
      <div>
        <label class="ep-label">Catégorie</label>
        <select class="ep-select" id="f-cat" onchange="onCatChange(this.value)">
          <option value="menu" ${cat==='menu'?'selected':''}>Menu</option>
          <option value="bar"  ${cat==='bar' ?'selected':''}>Bar</option>
        </select>
      </div>
      <div>
        <label class="ep-label">Section</label>
        <select class="ep-select" id="f-sec">${secOptions(cat)}</select>
      </div>
    </div>
    <div class="ep-row ep-3col">
      <div>
        <label class="ep-label">Prix (€)</label>
        <input class="ep-input" id="f-price" type="number" min="0" step="0.5" value="${item?.price||''}" placeholder="18">
      </div>
      <div>
        <label class="ep-label">Portion</label>
        <input class="ep-input" id="f-portion" type="number" min="0" value="${item?.portionSize||''}" placeholder="280">
      </div>
      <div>
        <label class="ep-label">Unité</label>
        <select class="ep-select" id="f-unit">
          <option value="g"  ${unit==='g' ?'selected':''}>g</option>
          <option value="cl" ${unit==='cl'?'selected':''}>cl</option>
          <option value="ml" ${unit==='ml'?'selected':''}>ml</option>
        </select>
      </div>
    </div>
    <div class="ep-row">
      <label class="ep-label">Image — glissez ou cliquez</label>
      <div class="ep-drop-zone" id="img-zone">${imgInner}</div>
      <div style="display:flex;gap:0.45rem">
        <button class="ep-btn ep-btn-ghost" style="flex:1" onclick="pasteImageUrl()">
          🔗 Coller une URL
        </button>
        ${pendingImg ? `<button class="ep-btn ep-btn-ghost" onclick="clearImage()">✕</button>` : ''}
      </div>
    </div>

    <div style="display:flex;gap:0.65rem;margin-top:0.3rem">
      <button class="ep-btn ep-btn-primary" style="flex:1" onclick="saveItemForm()">
        ${item ? 'Enregistrer' : 'Ajouter'}
      </button>
      ${item ? `<button class="ep-btn ep-btn-danger" onclick="confirmDelete('${item.id}')">Supprimer</button>` : ''}
    </div>
  `;

  // Activer le glisser-déposer sur la zone image
  initDropZone(document.getElementById('img-zone'), url => setImgPreview(url));
}

function onCatChange(cat) {
  const sel = document.getElementById('f-sec');
  if (!sel) return;
  sel.innerHTML = SECTIONS[cat].map(s => `<option value="${s}">${SEC_LABELS[s]}</option>`).join('');
}

function backToList() {
  editingId  = null;
  pendingImg = '';
  renderPanel(activeTab);
}

/* ── Drag & Drop + Upload Cloudinary ── */

// Upload vers Cloudinary sans widget — juste l'API unsigned
async function uploadToCloudinary(file) {
  if (!DB.isCloudinary) return null;
  const fd = new FormData();
  fd.append('file',         file);
  fd.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  fd.append('folder',        'menu');
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
    method: 'POST', body: fd,
  });
  if (!res.ok) throw new Error('Upload Cloudinary échoué');
  const json = await res.json();
  return json.secure_url;
}

// Convertit un File en data-URL (fallback sans Cloudinary)
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r  = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Traiter un fichier image déposé ou sélectionné
async function handleImageFile(file, onSuccess) {
  if (!file || !file.type.startsWith('image/')) {
    toast('Fichier non supporté — image uniquement.', 'error'); return;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast('Image trop lourde (max 10 Mo).', 'error'); return;
  }

  try {
    let url;
    if (DB.isCloudinary) {
      toast('Upload en cours…', 'info', 8000);
      url = await uploadToCloudinary(file);
    } else {
      // Sans Cloudinary : data-URL stockée localement
      url = await fileToDataUrl(file);
    }
    onSuccess(url);
    toast('Image ajoutée.', 'success');
  } catch (e) {
    console.error(e);
    toast('Erreur lors de l\'upload.', 'error');
  }
}

// Initialiser une zone de drop (réutilisable pour logo + article)
function initDropZone(zone, onUrlReady) {
  if (!zone) return;

  // Clic → input file caché
  const input = document.createElement('input');
  input.type   = 'file';
  input.accept = 'image/*';
  input.style  = 'display:none';
  input.addEventListener('change', () => {
    if (input.files[0]) handleImageFile(input.files[0], onUrlReady);
    input.value = '';
  });
  document.body.appendChild(input);
  zone.addEventListener('click', () => input.click());

  // Drag events
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file, onUrlReady);
  });
}

function setImgPreview(url) {
  pendingImg = url;
  const zone = document.getElementById('img-zone');
  if (zone) zone.innerHTML = `<img src="${esc(url)}" alt="" onerror="clearImage()">`;
}

function pasteImageUrl() {
  const url = prompt('URL de l\'image :');
  if (url?.trim()) setImgPreview(url.trim());
}

function clearImage() {
  pendingImg = '';
  const zone = document.getElementById('img-zone');
  if (zone) {
    zone.innerHTML = `<div class="ep-drop-hint"><span>🖼</span><p>Glissez une image ici</p><small>ou cliquez pour parcourir</small></div>`;
    initDropZone(zone, url => setImgPreview(url));
  }
}

/* Save item */
async function saveItemForm() {
  const name    = document.getElementById('f-name')?.value.trim();
  const desc    = document.getElementById('f-desc')?.value.trim();
  const cat     = document.getElementById('f-cat')?.value;
  const section = document.getElementById('f-sec')?.value;
  const price   = parseFloat(document.getElementById('f-price')?.value) || null;
  const portion = parseInt(document.getElementById('f-portion')?.value, 10) || null;
  const unit    = document.getElementById('f-unit')?.value || 'g';

  if (!name) { toast('Le nom est requis.', 'error'); return; }

  const data = { name, description: desc||'', category: cat, section, price, portionSize: portion, portionUnit: unit, imageUrl: pendingImg };

  try {
    if (editingId) {
      await DB.updateItem(editingId, data);
      const idx = menuItems.findIndex(i => i.id === editingId);
      if (idx !== -1) menuItems[idx] = { ...menuItems[idx], ...data };
      toast('Article modifié.', 'success');
    } else {
      data.unavailable    = false;
      data.unavailableSetAt = null;
      const added = await DB.addItem(data);
      menuItems.push(added);
      toast('Article ajouté.', 'success');
    }
    renderAll();
    backToList();
  } catch (e) {
    console.error(e);
    toast('Erreur lors de l\'enregistrement.', 'error');
  }
}

/* Toggle availability */
async function toggleDispo(id) {
  const item = menuItems.find(i => i.id === id);
  if (!item) return;
  const off = !item.unavailable;
  const upd = { unavailable: off, unavailableSetAt: off ? Date.now() : null };
  await DB.updateItem(id, upd);
  Object.assign(item, upd);
  renderAll();
  renderPanel(activeTab);
  toast(off ? 'Marqué indisponible.' : 'Remis disponible.', 'info');
}

/* Delete */
async function confirmDelete(id) {
  const item = menuItems.find(i => i.id === id);
  if (!item || !confirm(`Supprimer « ${item.name} » ?`)) return;
  await DB.deleteItem(id);
  menuItems = menuItems.filter(i => i.id !== id);
  renderAll();
  renderPanel(activeTab);
  toast('Article supprimé.', 'info');
}

// ══════════════════════════════════════════════════════════════════
// FORMULAIRE HORAIRES
// ══════════════════════════════════════════════════════════════════
function buildHoursForm() {
  let html = '';
  const hours = restaurantInfo?.hours || {};

  DAY_ORDER.forEach(day => {
    const d      = hours[day] || { closed: true, slots: [] };
    const closed = d.closed || !d.slots?.length;

    const slotsHtml = (d.slots || []).map((s, i) => `
      <div class="ep-slot">
        <input class="ep-t" type="time" data-day="${day}" data-role="open"  value="${s.open}">
        <span class="ep-t-sep">–</span>
        <input class="ep-t" type="time" data-day="${day}" data-role="close" value="${s.close}">
        <button class="ep-slot-rm" onclick="this.closest('.ep-slot').remove()" title="Supprimer ce créneau">✕</button>
      </div>
    `).join('');

    html += `
      <div class="ep-day-row">
        <div class="ep-day-name">${day}</div>
        <div class="ep-day-body" id="dayb-${day}">
          <div class="ep-cbrow" style="margin-bottom:${closed?'0':'0.45rem'}">
            <input class="ep-cb" type="checkbox" id="cb-${day}" ${closed?'checked':''}
                   onchange="onDayClosed('${day}', this.checked)">
            <label for="cb-${day}" style="font-size:0.8rem;color:var(--text2);cursor:pointer">Fermé</label>
          </div>
          <div id="slots-${day}" style="${closed?'display:none':''}">${slotsHtml}</div>
          <button class="ep-add-slot" id="add-${day}" style="${closed?'display:none':''}"
                  onclick="addSlot('${day}')">+ Ajouter un créneau</button>
          <div id="kc-wrap-${day}" style="margin-top:0.55rem;display:${closed?'none':'flex'};align-items:center;gap:0.5rem">
            <span style="font-size:0.72rem;color:var(--text2);white-space:nowrap">Fermeture cuisine :</span>
            <input class="ep-t" type="time" id="kc-${day}" value="${d.kitchenClose||''}" placeholder="–">
          </div>
        </div>
      </div>
    `;
  });

  html += `
    <button class="ep-btn ep-btn-primary ep-btn-full" style="margin-top:1.2rem"
            onclick="saveHours()">Enregistrer les horaires</button>
  `;
  return html;
}

function onDayClosed(day, closed) {
  const slotsEl = document.getElementById(`slots-${day}`);
  const addEl   = document.getElementById(`add-${day}`);
  const kcWrap  = document.getElementById(`kc-wrap-${day}`);
  const cbRow   = document.querySelector(`#dayb-${day} .ep-cbrow`);

  if (slotsEl) slotsEl.style.display = closed ? 'none' : '';
  if (addEl)   addEl.style.display   = closed ? 'none' : '';
  if (kcWrap)  kcWrap.style.display  = closed ? 'none' : 'flex';
  if (cbRow)   cbRow.style.marginBottom = closed ? '0' : '0.45rem';

  if (!closed && slotsEl && slotsEl.querySelectorAll('.ep-slot').length === 0) {
    addSlot(day);
  }
}

function addSlot(day) {
  const slotsEl = document.getElementById(`slots-${day}`);
  if (!slotsEl) return;
  const div = document.createElement('div');
  div.className = 'ep-slot';
  div.innerHTML = `
    <input class="ep-t" type="time" data-day="${day}" data-role="open"  value="12:00">
    <span class="ep-t-sep">–</span>
    <input class="ep-t" type="time" data-day="${day}" data-role="close" value="14:30">
    <button class="ep-slot-rm" onclick="this.closest('.ep-slot').remove()" title="Supprimer">✕</button>
  `;
  slotsEl.appendChild(div);
}

async function saveHours() {
  const newHours = {};
  DAY_ORDER.forEach(day => {
    const cb     = document.getElementById(`cb-${day}`);
    const closed = cb ? cb.checked : true;

    if (closed) { newHours[day] = { closed: true, slots: [] }; return; }

    const slots = [];
    document.getElementById(`slots-${day}`)?.querySelectorAll('.ep-slot').forEach(slotEl => {
      const openIn  = slotEl.querySelector('[data-role="open"]');
      const closeIn = slotEl.querySelector('[data-role="close"]');
      if (openIn?.value && closeIn?.value)
        slots.push({ open: openIn.value, close: closeIn.value });
    });
    const kitchenClose = document.getElementById(`kc-${day}`)?.value || null;
    newHours[day] = { closed: false, slots, kitchenClose: kitchenClose || null };
  });

  restaurantInfo = { ...restaurantInfo, hours: newHours };
  await DB.setInfo(restaurantInfo);
  renderHours(newHours);
  renderStatus(newHours);
  toast('Horaires enregistrés.', 'success');
}

// ══════════════════════════════════════════════════════════════════
// RENDU DU MENU
// ══════════════════════════════════════════════════════════════════
function createCard(item) {
  const img = item.imageUrl
    ? `<img class="card-img" src="${esc(item.imageUrl)}" alt="${esc(item.name)}" loading="lazy"
           onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'card-img-ph',textContent:'🍽'}))">`
    : `<div class="card-img-ph">🍽</div>`;

  const div = document.createElement('div');
  div.className = `item-card${item.unavailable ? ' unavail' : ''}`;
  div.dataset.id = item.id;
  div.innerHTML = `
    ${img}
    <div class="card-body">
      <div class="card-name">${esc(item.name)}</div>
      ${item.description ? `<div class="card-desc">${esc(item.description)}</div>` : ''}
      <div class="card-foot">
        ${item.portionSize ? `<span class="card-portion">${fmtPortion(item.portionSize, item.portionUnit)}</span>` : '<span></span>'}
        ${item.price !== null && item.price !== undefined ? `<span class="card-price">${fmtPrice(item.price)}</span>` : ''}
      </div>
    </div>
  `;
  return div;
}

function renderCategory(category) {
  SECTIONS[category].forEach(section => {
    const grid = document.getElementById(`grid-${section}`);
    const sub  = document.getElementById(`sub-${section}`);
    if (!grid || !sub) return;
    const items = menuItems.filter(i => i.category === category && i.section === section);
    sub.style.display = items.length ? '' : 'none';
    grid.innerHTML = '';
    items.forEach(item => grid.appendChild(createCard(item)));
  });
}

function renderAll() {
  renderCategory('menu');
  renderCategory('bar');
}

// ══════════════════════════════════════════════════════════════════
// RENDU DES HORAIRES
// ══════════════════════════════════════════════════════════════════
function renderHours(hours) {
  const JS_DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const today   = JS_DAYS[new Date().getDay()];
  const tbl     = document.getElementById('hours-table');
  if (!tbl) return;

  tbl.innerHTML = DAY_ORDER.map(day => {
    const d     = (hours || {})[day];
    const slots = d && !d.closed ? fmtSlots(d.slots) : null;
    const kc    = d && !d.closed && d.kitchenClose
      ? `<span class="h-kitchen">Cuisine : ferme à ${d.kitchenClose.replace(':', 'h')}</span>` : '';
    return `
      <div class="h-row ${day === today ? 'today' : ''}">
        <span class="h-day">${day}</span>
        <span class="h-slots ${!slots ? 'h-closed' : ''}">${slots || 'Fermé'}${kc}</span>
      </div>
    `;
  }).join('');
}

function renderStatus(hours) {
  const s    = getOpenStatus(hours);
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  dot.className = 'dot';

  if (s.state === 'open') {
    dot.classList.add('dot-open');
    text.textContent = `Ouvert · Ferme à ${s.closeAt}`;
  } else if (s.state === 'closed') {
    dot.classList.add('dot-closed');
    text.textContent = s.nextDay ? `Fermé · Ouvre ${s.nextDay} à ${s.nextAt}` : 'Fermé';
  } else {
    dot.classList.add('dot-unknown');
    text.textContent = 'Horaires non renseignés';
  }
}

// ══════════════════════════════════════════════════════════════════
// APPLICATION DES INFOS RESTAURANT
// ══════════════════════════════════════════════════════════════════
function isLogoUrl(logo) {
  return logo && (logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('/'));
}

function applyRestaurantInfo() {
  const { name = '', logo = '⚜', tagline = '' } = restaurantInfo || {};

  document.title = name ? `${name} — Menu` : 'Menu Restaurant';

  // Éléments texte simples
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('nav-name',     name);
  setText('hero-name',    name);
  setText('hero-tagline', tagline);
  setText('footer-name',  name);
  setText('ls-name',      name);

  // Logo : emoji/texte ou image URL
  const logoHtml = isLogoUrl(logo)
    ? `<img class="logo-img" src="${esc(logo)}" alt="${esc(name)}" onerror="this.parentElement.textContent='⚜'">`
    : (logo || '⚜');
  ['nav-logo', 'footer-logo', 'ls-logo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = logoHtml;
  });
}

// ══════════════════════════════════════════════════════════════════
// AUTHENTIFICATION GOOGLE (Firebase Auth)
// ══════════════════════════════════════════════════════════════════
function isEmailAllowed(email) {
  if (typeof ALLOWED_EMAILS === 'undefined') return true;
  if (!Array.isArray(ALLOWED_EMAILS) || ALLOWED_EMAILS.length === 0) return true;
  return ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

async function handleEditSequence() {
  // Sortir du mode édition si déjà actif
  if (isEdit) { App.exitEditMode(); return; }

  // Sans Firebase : accès direct, pas de popup
  if (!DB.isFirebase) { App.enterEditMode(); return; }

  const auth = firebase.auth();

  // Déjà connecté et autorisé → pas besoin de re-signer
  if (auth.currentUser && isEmailAllowed(auth.currentUser.email)) {
    App.enterEditMode();
    return;
  }

  // Popup Google Sign-In
  try {
    const result = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    if (isEmailAllowed(result.user.email)) {
      App.enterEditMode();
    } else {
      await auth.signOut();
      toast('Accès refusé pour ce compte Google.', 'error', 4000);
    }
  } catch (e) {
    // L'utilisateur a fermé le popup = silencieux
    if (e.code !== 'auth/popup-closed-by-user') {
      console.error('[Auth]', e);
      toast('Erreur de connexion Google.', 'error');
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// DÉTECTION SÉQUENCE CLAVIER
// ══════════════════════════════════════════════════════════════════
function initKeySequence() {
  const seq = (typeof EDIT_SEQUENCE !== 'undefined' && Array.isArray(EDIT_SEQUENCE))
    ? EDIT_SEQUENCE
    : ['c', 'h', 'e', 'f'];
  const target = seq.join('');

  document.addEventListener('keydown', e => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    keyBuf.push(e.key.toLowerCase());
    clearTimeout(keyTmr);
    keyTmr = setTimeout(() => { keyBuf = []; }, 1500);

    if (keyBuf.slice(-seq.length).join('') === target) {
      keyBuf = [];
      handleEditSequence();
    }
  });
}

// ══════════════════════════════════════════════════════════════════
// GESTE FOOTER (mobile) : droite → gauche → droite
// ══════════════════════════════════════════════════════════════════
function initFooterSwipe() {
  const footer = document.querySelector('footer');
  if (!footer) return;

  const SWIPE_SEQ    = ['r', 'l', 'r'];  // droite, gauche, droite
  const MIN_DIST     = 55;   // px minimum pour valider un swipe
  const MAX_VERT     = 0.65; // ratio vertical/horizontal max (évite les scrolls)
  const SEQ_TIMEOUT  = 2200; // ms max entre deux swipes

  let buf        = [];
  let timer      = null;
  let startX     = null;
  let startY     = null;

  footer.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  footer.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    startX = startY = null;

    // Ignorer si trop vertical ou trop court
    if (Math.abs(dx) < MIN_DIST) return;
    if (Math.abs(dy) > Math.abs(dx) * MAX_VERT) return;

    buf.push(dx > 0 ? 'r' : 'l');
    clearTimeout(timer);
    timer = setTimeout(() => { buf = []; }, SEQ_TIMEOUT);

    if (buf.slice(-SWIPE_SEQ.length).join('') === SWIPE_SEQ.join('')) {
      buf = [];
      clearTimeout(timer);
      handleEditSequence();
    }
  }, { passive: true });
}

// ══════════════════════════════════════════════════════════════════
// RESET DE MINUIT
// ══════════════════════════════════════════════════════════════════
function scheduleMidnightReset() {
  const now      = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 15, 0);
  const ms = midnight - now;

  setTimeout(async () => {
    console.info('[Midnight] Réinitialisation des indisponibilités…');
    menuItems = await DB.getItems();
    renderAll();
    if (isEdit) renderPanel(activeTab);
    scheduleMidnightReset();
  }, ms);
}

// ══════════════════════════════════════════════════════════════════
// SÉCURITÉ HTML (échappement)
// ══════════════════════════════════════════════════════════════════
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ══════════════════════════════════════════════════════════════════
// INITIALISATION
// ══════════════════════════════════════════════════════════════════
async function init() {
  try {
    await DB.init();

    // Chargement parallèle
    [restaurantInfo, menuItems] = await Promise.all([
      DB.getInfo(),
      DB.getItems(),
    ]);

    applyRestaurantInfo();
    renderHours(restaurantInfo.hours || {});
    renderStatus(restaurantInfo.hours || {});
    renderAll();
    initKeySequence();
    initFooterSwipe();
    scheduleMidnightReset();

    if (!DB.isFirebase) {
      // Mode local : ajouter une note explicative et garder le hint visible
      const hint = document.querySelector('.footer-hint');
      if (hint) {
        const note = document.createElement('div');
        note.className = 'footer-mode-note';
        note.textContent = '📦 Mode local — données sauvegardées dans ce navigateur';
        hint.after(note);
      }
    } else {
      // Mode Firebase : masquer l'indice de la séquence secrète
      document.querySelector('.footer-hint')?.classList.add('hidden');
    }

    hideLoader();
  } catch (err) {
    console.error('[Init]', err);
    hideLoader();
    toast('Erreur au chargement des données.', 'error', 6000);
  }
}

init();
