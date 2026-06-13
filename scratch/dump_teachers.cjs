const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCfVSQggxj-kZ2yJAW2xB0BcupzfCJsowU",
  authDomain: "education-89c54.firebaseapp.com",
  projectId: "education-89c54",
  storageBucket: "education-89c54.firebasestorage.app",
  messagingSenderId: "292663641725",
  appId: "1:292663641725:web:076b161074bb891513d314",
  measurementId: "G-S4WJTJZ4XC",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function dump() {
  console.log("Fetching users...");
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    console.log(`Found ${usersSnap.size} users:`);
    usersSnap.forEach(doc => {
      console.log(`User ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
      console.log("--------------------------------------");
    });
  } catch (err) {
    console.error("Error fetching users:", err);
  }

  console.log("\nFetching teachers...");
  try {
    const teachersSnap = await getDocs(collection(db, "teachers"));
    console.log(`Found ${teachersSnap.size} teachers:`);
    teachersSnap.forEach(doc => {
      console.log(`Teacher ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
      console.log("--------------------------------------");
    });
  } catch (err) {
    console.error("Error fetching teachers:", err);
  }
}

dump();
