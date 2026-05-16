// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";

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

async function getAllPlayerNames() {
  const querySnapshot = await getDocs(collection(db, "memoryRooms"));

  const players: { roomId: string; player1Name: string | null; player2Name: string | null; }[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();

    players.push({
      roomId: doc.id,
      player1Name: data.player1Name || null,
      player2Name: data.player2Name || null,
    });
  });

  console.log(players);
  return players;
}



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
getAllPlayerNames();