import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc
}
from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBVT0KG6RzFN_6nQ8l6PPmQoGIDued_a_A",
    authDomain: "thai-synesthesia-study.firebaseapp.com",
    projectId: "thai-synesthesia-study",
    storageBucket: "thai-synesthesia-study.firebasestorage.app",
    messagingSenderId: "911551170737",
    appId: "1:911551170737:web:e226afd6a0b32b36e0ba90",
    measurementId: "G-BJPXHT8DLT"
};

const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

window.db = db;
window.collection = collection;
window.addDoc = addDoc;