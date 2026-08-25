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

async function listContacts() {
  try {
    const snap = await getDocs(collection(db, "whatsapp_personal_contacts"));
    console.log("Personal Contacts Count:", snap.size);
    snap.forEach(doc => {
      console.log("- ID:", doc.id, "Data:", doc.data());
    });
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

listContacts();
