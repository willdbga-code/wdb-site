const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, limit, query, orderBy } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBEQUr-ra9PqQl3Yh08Q5pySLpu6G46ydM",
  authDomain: "williamdelbarrio-5a342.firebaseapp.com",
  projectId: "williamdelbarrio-5a342",
  storageBucket: "williamdelbarrio-5a342.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listSessions() {
  try {
    const q = query(collection(db, "whatsapp_sessions"), orderBy("updatedAt", "desc"), limit(10));
    const snap = await getDocs(q);
    console.log("Recent Sessions Count:", snap.size);
    snap.forEach(doc => {
      const data = doc.data();
      console.log("- ID:", doc.id, "UpdatedAt:", data.updatedAt ? data.updatedAt.toDate().toISOString() : "N/A");
      if (data.history && data.history.length > 0) {
        const lastMsg = data.history[data.history.length - 1];
        console.log("  Last Message:", lastMsg.role, "-", lastMsg.text.substring(0, 60));
      }
    });
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

listSessions();
