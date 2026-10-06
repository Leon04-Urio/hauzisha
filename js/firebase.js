// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxX1f1igsz4ztHbUGy9l94kUTK4CfCQaM",
  authDomain: "loft-78ac3.firebaseapp.com",
  projectId: "loft-78ac3",
  storageBucket: "loft-78ac3.firebasestorage.app",
  messagingSenderId: "1084327481513",
  appId: "1:1084327481513:web:addb39cf8bf575c34219b8",
  measurementId: "G-41CFK08VNR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);