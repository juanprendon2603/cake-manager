// src/lib/firebase.ts
import { getAnalytics, isSupported } from "firebase/analytics";
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import {
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ✅ Evita doble inicialización con HMR/StrictMode
const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// ✅ Auth con persistencia en el navegador
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.error("[Auth] setPersistence error:", e);
});

// Opcional: idioma de los flujos de auth
auth.languageCode = "es";

export const googleProvider = new GoogleAuthProvider();

// ✅ Firestore con caché persistente y fallback seguro
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (err) {
  console.warn("[Firestore] persistent cache failed, using memory:", err);
  db = initializeFirestore(app, { localCache: memoryLocalCache() });
}

const storage = getStorage(app);

// Analytics opcional (solo si soportado en el navegador)
let analytics: ReturnType<typeof getAnalytics> | undefined;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});

export { analytics, app, db, storage };
