// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import { getVertexAI, getGenerativeModel } from "@firebase/vertexai";

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
if (window.location.hostname === "localhost") {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6LeQ1MYqAAAAALMmb1FiwXbhodOvzdJTb-_nHVr2"),
  isTokenAutoRefreshEnabled: true,
});

const database = getFirestore(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const vertexAI = getVertexAI(app);

// Initialize the generative model with a model that supports your use case
// Gemini 1.5 models are versatile and can be used with all API capabilities
const model = getGenerativeModel(vertexAI, { model: "gemini-2.0-flash-exp" });

export { database, storage, vertexAI, model, appCheck };
