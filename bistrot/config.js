/* ================================================================
   CONFIG.JS — Le Bistrot
   ================================================================ */

// Identifiant unique de cet établissement (préfixe Firestore + localStorage)
const SITE_ID = 'bistrot';

// ── Firebase ─────────────────────────────────────────────────────
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
  cloudName:    "YOUR_CLOUD_NAME",
  uploadPreset: "YOUR_UPLOAD_PRESET",
};

// ── Séquence secrète ─────────────────────────────────────────────
const EDIT_SEQUENCE = ['c', 'h', 'e', 'f'];

// ── Emails autorisés (Google Auth) ───────────────────────────────
const ALLOWED_EMAILS = [
  'votre@gmail.com',
];

// ── Données par défaut ───────────────────────────────────────────
const RESTAURANT_DEFAULTS = {
  name:    "Le Rive Gauche",
  logo:    "⚜",
  tagline: "Grillée et Savoureuse !",
  hours: {
    "Lundi":    { closed: true,  slots: [] },
    "Mardi":    { closed: false, kitchenClose: "21:30", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "22:30" }] },
    "Mercredi": { closed: false, kitchenClose: "21:30", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "22:30" }] },
    "Jeudi":    { closed: false, kitchenClose: "21:30", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "23:00" }] },
    "Vendredi": { closed: false, kitchenClose: "22:00", slots: [{ open: "12:00", close: "14:30" }, { open: "19:00", close: "23:00" }] },
    "Samedi":   { closed: false, kitchenClose: "22:00", slots: [{ open: "12:00", close: "15:00" }, { open: "19:00", close: "23:30" }] },
    "Dimanche": { closed: false, kitchenClose: "14:30", slots: [{ open: "12:00", close: "15:30" }] },
  },
};
