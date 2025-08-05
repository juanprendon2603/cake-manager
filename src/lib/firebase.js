import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDKcGfxVG1E_XJvcwqCu3gKxKL2NKCeL6g",
  authDomain: "cakemanager-6f280.firebaseapp.com",
  projectId: "cakemanager-6f280",
  storageBucket: "cakemanager-6f280.appspot.com", 
  messagingSenderId: "395000089513",
  appId: "1:395000089513:web:38d00ad84e0ff56a28d2b8",
  measurementId: "G-ZT1PWHC7M8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
isSupported().then((yes) => {
  if (yes) analytics = getAnalytics(app);
});

export { db, storage, analytics };
