// ============ FIREBASE CONFIG (Maa Laxmi Narayan) ============

const firebaseConfig = {
  apiKey: "AIzaSyAhEAUsnANnBoiNCWzuS6aqn3IvMIMK9Gw",
  authDomain: "maa-laxmi-narayan-72dfe.firebaseapp.com",
  databaseURL: "https://maa-laxmi-narayan-72dfe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "maa-laxmi-narayan-72dfe",
  storageBucket: "maa-laxmi-narayan-72dfe.firebasestorage.app",
  messagingSenderId: "382287853214",
  appId: "1:382287853214:web:f4f053792abbfb511aad8f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log('🔥 Firebase Connected (Maa Laxmi Narayan)!');
