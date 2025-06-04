import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getDatabase } from '@firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBqKG7yTlIu9ct2s_k1b0H6qe3qfV4cf_E',
  authDomain: 'ltpautomatedpublisherscorecard.firebaseapp.com',
  projectId: 'ltpautomatedpublisherscorecard',
  storageBucket: 'ltpautomatedpublisherscorecard.appspot.com',
  messagingSenderId: '733755540125',
  appId: '1:733755540125:web:78050227021d6004330a74',
};

// export const app = initializeApp(firebaseConfig);
// export const authFirebase = getAuth(app);
// export const storage = getStorage();
// export const db = getFirestore();
// export const rtdb = getDatabase(app);

export const app = initializeApp(firebaseConfig);
export const authFirebase = getAuth(app);
export const storage = getStorage();
export const db =
  process.env.VITE_ENVIRONMENT === 'development'
    ? initializeFirestore(app, {}, 'dev-env')
    : process.env.VITE_ENVIRONMENT === 'staging'
    ? initializeFirestore(app, {}, 'stg-env')
    : getFirestore();
export const rtdb = getDatabase(app);
