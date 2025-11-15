"use client";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHDtnX9XVhYWmd0Higj4XEwnyxXOr4D-0",
  authDomain: "memr-ai.firebaseapp.com",
  projectId: "memr-ai",
  storageBucket: "memr-ai.firebasestorage.app",
  messagingSenderId: "1068910994290",
  appId: "1:1068910994290:web:5324edd40c1988701a33eb",
  measurementId: "G-XY925Z3SLR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
