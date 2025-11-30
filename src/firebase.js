import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBEokGcqi5wTbg17KxDGpBtIbTUggEvbao",
  authDomain: "caption-craft-80247.firebaseapp.com",
  projectId: "caption-craft-80247",
  storageBucket: "caption-craft-80247.firebasestorage.app",
  messagingSenderId: "839651254830",
  appId: "1:839651254830:web:e588a56b7d50609950b5bf"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
