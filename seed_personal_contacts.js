// Seed script using Firebase client SDK
// Temporarily works because we'll open the collection rules just for this run

const { initializeApp } = require("C:\\Users\\LENOVO\\Desktop\\William Site\\node_modules\\firebase\\app\\dist\\index.cjs.js");
const { getFirestore, doc, setDoc, collection } = require("C:\\Users\\LENOVO\\Desktop\\William Site\\node_modules\\firebase\\firestore\\dist\\index.cjs.js");

const firebaseConfig = {
  apiKey: "AIzaSyBEQUr-ra9PqQl3Yh08Q5pySLpu6G46ydM",
  authDomain: "williamdelbarrio-5a342.firebaseapp.com",
  projectId: "williamdelbarrio-5a342",
  storageBucket: "williamdelbarrio-5a342.firebasestorage.app",
  messagingSenderId: "614618368067",
  appId: "1:614618368067:web:3ccb26ee660b10110fecf6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const personalContacts = [
  { number: "5512992236440", name: "Noiva" },
  { number: "5491176291082", name: "Melhor amiga" },
  { number: "5512991832163", name: "Mae" },
  { number: "5512992101522", name: "Pai" },
  { number: "5512988986148", name: "Melhor amigo" },
  { number: "5512996573093", name: "Sogra" },
  { number: "5512991153673", name: "Cunhado" },
  { number: "5512996023643", name: "Odair - Pc do Jota" },
  { number: "5512981552752", name: "Renan da Union" },
  { number: "5512991207953", name: "Irma" },
  { number: "5512982419153", name: "Patrick" },
  { number: "5512992211944", name: "Prima" },
  { number: "5512992487675", name: "Amigo" },
  { number: "5512991203017", name: "Irmao" },
  { number: "5512991604110", name: "Fornecedora" },
  { number: "5511916202004", name: "Prima 2" },
  { number: "5512982816597", name: "Amigo" },
  { number: "5512991100242", name: "Amiga" },
  { number: "5512997353120", name: "Amiga" },
  { number: "5512982215655", name: "Amigo" },
  { number: "5512992051659", name: "Amiga" },
  { number: "5512981296218", name: "Amiga" },
  { number: "5512982094774", name: "Amiga" },
  { number: "5512991916776", name: "Amiga" },
  { number: "5512997830605", name: "Amiga" },
  { number: "5512991553768", name: "Amiga" },
  { number: "5512991265644", name: "Amiga" },
];

async function seed() {
  console.log(`Adding ${personalContacts.length} contacts...`);
  for (const contact of personalContacts) {
    try {
      const ref = doc(db, "whatsapp_personal_contacts", contact.number);
      await setDoc(ref, { name: contact.name, silent: true });
      console.log(`  [OK] ${contact.number} - ${contact.name}`);
    } catch (err) {
      console.error(`  [ERRO] ${contact.number}: ${err.message}`);
    }
  }
  console.log("Done!");
  process.exit(0);
}

seed();
