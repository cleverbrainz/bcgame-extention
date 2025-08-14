// BC.Game Crash Monitor - Background Script
console.log("BC.Game Crash Monitor: Background script loaded");

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
    this.init();
  }

  init() {
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
      const value = data.values[0]; // Each entry has one value
      const numericValue = parseFloat(value.replace("×", ""));

      const document = {
        fields: {
          timestamp: { stringValue: data.timestamp },
          crash_value: { stringValue: value },
          numeric_value: { doubleValue: numericValue },
          url: { stringValue: data.url },
          created_at: { timestampValue: new Date().toISOString() },
        },
      };

      // Use Firestore REST API with API key authentication
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${this.firebaseConfig.projectId}/databases/(default)/documents/${this.collectionName}?key=${this.firebaseConfig.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(document),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("BC.Game Crash Monitor: Value stored to Firebase:", value);
        return { success: true, id: result.name };
      } else {
        const errorText = await response.text();
        console.error("BC.Game Crash Monitor: Firebase error:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error storing to Firebase:", error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize the Firebase manager
new FirebaseManager();
