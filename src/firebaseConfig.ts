// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyAS4qYjlB5guBQ0m_UtF5X4td4xZqL8E2U",
	authDomain: "fross-8866c.firebaseapp.com",
	projectId: "fross-8866c",
	storageBucket: "fross-8866c.firebasestorage.app",
	messagingSenderId: "1011697896418",
	appId: "1:1011697896418:web:f1d34b7d6fb66e877d47bb",
	measurementId: "G-VMPSKSP8YT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
