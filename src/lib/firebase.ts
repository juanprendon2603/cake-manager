// src/lib/firebase.ts
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore, // 👈 tipo
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDKcGfxVG1E_XJvcwqCu3gKxKL2NKCeL6g",
  authDomain: "cakemanager-6f280.firebaseapp.com",
  projectId: "cakemanager-6f280",
  storageBucket: "cakemanager-6f280.appspot.com",
  messagingSenderId: "395000089513",
  appId: "1:395000089513:web:38d00ad84e0ff56a28d2b8",
  measurementId: "G-ZT1PWHC7M8",
};

const app = initializeApp(firebaseConfig);

// 👇 declaramos el tipo explícito
let db: Firestore;

try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
  });
}

const storage = getStorage(app);

let analytics: ReturnType<typeof getAnalytics> | undefined;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});

export { analytics, app, db, storage };
