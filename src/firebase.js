import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDV7dqCZ9EsY3Tg-0Y9_O6akWbktxxV2Y8",
  authDomain: "prisus-b4ab6.firebaseapp.com",
  projectId: "prisus-b4ab6",
  storageBucket: "prisus-b4ab6.appspot.com",
  messagingSenderId: "836459252861",
  appId: "1:836459252861:web:64168ff0674ae40b15f514",
  measurementId: "G-DW6BEH81NF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
