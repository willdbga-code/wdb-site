const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBEQUr-ra9PqQl3Yh08Q5pySLpu6G46ydM",
  authDomain: "williamdelbarrio-5a342.firebaseapp.com",
  projectId: "williamdelbarrio-5a342",
  storageBucket: "williamdelbarrio-5a342.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const snap = await getDocs(collection(db, "galleries"));
    console.log("Galleries count:", snap.size);
    process.exit(0);
  } catch (err) {
    console.error("Error reading galleries:", err.message);
    process.exit(1);
  }
}

test();
