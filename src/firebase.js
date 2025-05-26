// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAMwD6ah1-Hs85TSfC1YZshoBwcN8glWH0",
  authDomain: "goalmaster-efdc9.firebaseapp.com",
  projectId: "goalmaster-efdc9",
  storageBucket: "goalmaster-efdc9.appspot.com",
  messagingSenderId: "651982695727",
  appId: "1:651982695727:web:0f4409df090b61e91285da",
  measurementId: "G-T1CXXBDWFQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);