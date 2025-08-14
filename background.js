// BC.Game Crash Monitor - Background Script
console.log("BC.Game Crash Monitor: Background script loaded");

// Import Firebase SDK
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"
);

class FirebaseManager {
  constructor() {
    // Firebase configuration - REPLACE WITH YOUR FIREBASE CONFIG
    this.firebaseConfig = {
      apiKey: "AIzaSyD1GuKYlnJqty1nPMVXmFRcLMoTNvDMzp4",
      authDomain: "bc-game-89ca4.firebaseapp.com",
      databaseURL: "https://bc-game-89ca4-default-rtdb.firebaseio.com",
      projectId: "bc-game-89ca4",
      storageBucket: "bc-game-89ca4.firebasestorage.app",
      messagingSenderId: "839785126231",
      appId: "1:839785126231:web:9f26be87ab959164f9c612",
    };

    this.collectionName = "crash_values";
    this.db = null;
    this.init();
  }

  init() {
    try {
      // Initialize Firebase
      firebase.initializeApp(this.firebaseConfig);
      this.db = firebase.firestore();
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
    }

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "storeValues") {
        this.storeToFirestore(message.data).then((result) => {
          sendResponse(result);
        });
        return true; // Keep message channel open for async response
      }
    });
  }

  async storeToFirestore(data) {
    try {
      if (!this.db) {
        throw new Error("Firebase not initialized");
      }

      const value = data.values[0]; // Each entry has one value
      const numericValue = parseFloat(value.replace("×", ""));

      const payload = {
        timestamp: data.timestamp,
        crash_value: value,
        numeric_value: numericValue,
        url: data.url,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Add document to Firestore
      const docRef = await this.db.collection(this.collectionName).add(payload);

      console.log(
        "BC.Game Crash Monitor: Value stored to Firebase:",
        value,
        "Document ID:",
        docRef.id
      );
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error storing to Firebase:", error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize the Firebase manager
new FirebaseManager();
