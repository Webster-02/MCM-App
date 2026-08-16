// MySVL — Firebase Configuration
// Using Firebase CDN (no npm needed for plain HTML)

import { initializeApp }    from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAnalytics }     from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import { getAuth }          from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore }     from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getStorage }       from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";
import { getDatabase }      from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

const firebaseConfig = {
apiKey: "AIzaSyDAcuJ0XBnkCq0Hwyy5B1RUIOvPB3QOvX4",
  authDomain: "eduverse-1fedd.firebaseapp.com",
  projectId: "eduverse-1fedd",
  storageBucket: "eduverse-1fedd.firebasestorage.app",
  messagingSenderId: "1028605523951",
  appId: "1:1028605523951:web:6472e756e0a096e105a81a",
  measurementId: "G-499CRLL8Q4"
};

const app      = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth     = getAuth(app);
const db       = getFirestore(app);
const storage  = getStorage(app);
const rtdb     = getDatabase(app);   // Realtime DB — for live chat

export { app, analytics, auth, db, storage, rtdb };
