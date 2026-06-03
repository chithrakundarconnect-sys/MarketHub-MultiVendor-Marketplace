// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNcsPJnzFfc_a_hh22QhgVYarB3-uj7KU",
  authDomain: "markethub-693a5.firebaseapp.com",
  projectId: "markethub-693a5",
  storageBucket: "markethub-693a5.firebasestorage.app",
  messagingSenderId: "826385766546",
  appId: "1:826385766546:web:3ef7e6abe1a3476abf2e4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ ADD THIS
export const auth = getAuth(app);
export const db = getFirestore(app);
