// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "scholarshipment.firebaseapp.com",
  projectId: "scholarshipment",
  storageBucket: "scholarshipment.appspot.com",
  messagingSenderId: "924039520435",
  appId: "1:924039520435:web:787457234b1a9feb9390c6",
  measurementId: "G-4CVH6XDTJB",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { database, storage };
