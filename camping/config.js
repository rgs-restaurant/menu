/* ================================================================
   CONFIG.JS — La Guinguette (Camping)
   ================================================================ */

// Identifiant unique de cet établissement (préfixe Firestore + localStorage)
const SITE_ID = 'camping';

// ── Firebase ─────────────────────────────────────────────────────
// Même projet Firebase que le bistrot — données séparées par SITE_ID
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDGR9aT2Mt8JAAUbyQrLQJ1y3-z065yfew",

  authDomain: "items-menu.firebaseapp.com",

  projectId: "items-menu",

  storageBucket: "items-menu.firebasestorage.app",

  messagingSenderId: "367337852155",

  appId: "1:367337852155:web:adc610de725b5c8eb2b45e",
};

// ── Cloudinary ───────────────────────────────────────────────────
const CLOUDINARY_CONFIG = {
  cloudName:    "dasvupnzt",
  uploadPreset: "menu-restau",
};

// ── Séquence secrète ─────────────────────────────────────────────
const EDIT_SEQUENCE = ['c', 'h', 'e', 'f'];

// ── Emails autorisés (Google Auth) ───────────────────────────────
const ALLOWED_EMAILS = [
  'votre@gmail.com',
];

// ── Données par défaut ───────────────────────────────────────────
const RESTAURANT_DEFAULTS = {
  name:    "Camping de Sagnat",
  logo:    "🌿",
  tagline: "",
  hours: {
    "Lundi":    { closed: false, kitchenClose: "21:00", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "22:00" }] },
    "Mardi":    { closed: false, kitchenClose: "21:00", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "22:00" }] },
    "Mercredi": { closed: false, kitchenClose: "21:00", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "22:00" }] },
    "Jeudi":    { closed: false, kitchenClose: "21:00", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "22:00" }] },
    "Vendredi": { closed: false, kitchenClose: "21:30", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "22:30" }] },
    "Samedi":   { closed: false, kitchenClose: "21:30", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "22:30" }] },
    "Dimanche": { closed: false, kitchenClose: "20:30", slots: [{ open: "12:00", close: "15:00" }, { open: "19:00", close: "21:30" }] },
  },
};

// ── Données de démonstration (spécifiques au camping) ────────────
// Remplacent les données par défaut du bistrot dans app.js.
const SITE_SEED = [
  { id:'ce1', category:'menu', section:'entree',
    name:'Assiette de Charcuterie',
    description:'Saucisson sec, jambon cru, rosette, cornichons et pain de campagne.',
    price:12, portionSize:180, portionUnit:'g',
    imageUrl:'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'ce2', category:'menu', section:'entree',
    name:'Salade Niçoise',
    description:'Thon, œuf dur, olives, tomates, haricots verts, anchois, vinaigrette maison.',
    price:13, portionSize:320, portionUnit:'g',
    imageUrl:'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'ce3', category:'menu', section:'entree',
    name:'Soupe de Melon Froide',
    description:'Melon charentais, menthe fraîche, trait de porto blanc.',
    price:9, portionSize:250, portionUnit:'g',
    imageUrl:'https://images.unsplash.com/photo-1568158879083-c42860933ed7?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cp1', category:'menu', section:'plat',
    name:'Entrecôte Grillée',
    description:'Viande de Salers, grillée à la plancha, beurre maître d\'hôtel, frites maison.',
    price:22, portionSize:260, portionUnit:'g',
    imageUrl:'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cp2', category:'menu', section:'plat',
    name:'Burger Maison',
    description:'Pain brioché, steak haché 180g, cheddar, tomate, salade, sauce secrète, frites.',
    price:16, portionSize:380, portionUnit:'g',
    imageUrl:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cp3', category:'menu', section:'plat',
    name:'Poulet Rôti & Ratatouille',
    description:'Demi-poulet fermier rôti au four de pierre, ratatouille provençale maison.',
    price:18, portionSize:420, portionUnit:'g',
    imageUrl:'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cp4', category:'menu', section:'plat',
    name:'Pasta Pesto Gambas',
    description:'Tagliatelles fraîches, gambas poêlées, pesto maison, tomates confites, parmesan.',
    price:19, portionSize:340, portionUnit:'g',
    imageUrl:'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cd1', category:'menu', section:'dessert',
    name:'Tarte aux Fruits de Saison',
    description:'Pâte sablée maison, crème pâtissière vanille, fruits frais du marché.',
    price:8, portionSize:160, portionUnit:'g',
    imageUrl:'https://images.unsplash.com/photo-1519915028121-7d3463d5b1ff?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cd2', category:'menu', section:'dessert',
    name:'Coupe Glacée Maison',
    description:'Deux boules au choix, chantilly, coulis de framboise, amandes effilées.',
    price:7, portionSize:200, portionUnit:'g',
    imageUrl:'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cb1', category:'bar', section:'cocktail',
    name:'Mojito',
    description:'Rhum blanc, menthe fraîche, citron vert, sucre de canne, eau gazeuse.',
    price:10, portionSize:25, portionUnit:'cl',
    imageUrl:'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cb2', category:'bar', section:'cocktail',
    name:'Spritz Aperol',
    description:'Prosecco, Aperol, eau gazeuse, tranche d\'orange.',
    price:9, portionSize:20, portionUnit:'cl',
    imageUrl:'https://images.unsplash.com/photo-1560508180-03f285f67ded?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cv1', category:'bar', section:'vin',
    name:'Rosé de Provence — Bouteille',
    description:'AOP Côtes de Provence, frais et fruité, parfait pour l\'été.',
    price:22, portionSize:75, portionUnit:'cl',
    imageUrl:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cv2', category:'bar', section:'vin',
    name:'Rosé — Verre',
    description:'Côtes de Provence, servi bien frais.',
    price:5, portionSize:15, portionUnit:'cl',
    imageUrl:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cs1', category:'bar', section:'spiritueux',
    name:'Bière Artisanale Blonde',
    description:'Brasserie locale, houblonnée légère, 5°. Pression ou bouteille.',
    price:5, portionSize:50, portionUnit:'cl',
    imageUrl:'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cs2', category:'bar', section:'spiritueux',
    name:'Bière Artisanale Blanche',
    description:'Brasserie locale, notes d\'agrumes et coriandre, 4,5°.',
    price:5, portionSize:50, portionUnit:'cl',
    imageUrl:'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cso1', category:'bar', section:'soft',
    name:'Limonade Maison',
    description:'Citron frais, sucre de canne, eau gazeuse. Faite à la commande.',
    price:5, portionSize:40, portionUnit:'cl',
    imageUrl:'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=80',
    unavailable:false, unavailableSetAt:null },

  { id:'cso2', category:'bar', section:'soft',
    name:'Jus de Fruits Frais',
    description:'Orange, pastèque ou mangue — pressé à la commande.',
    price:5, portionSize:33, portionUnit:'cl',
    imageUrl:'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&q=80',
    unavailable:false, unavailableSetAt:null },
];
