// BC.Game Crash Monitor - Background Script (Realtime Database Version)
console.log("BC.Game Crash Monitor: Background script loaded (RTDB)");

class FirebaseRTDBManager {
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

    this.init();
  }

  init() {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "storeValues") {
        this.storeToRTDB(message.data).then((result) => {
          sendResponse(result);
        });
        return true; // Keep message channel open for async response
      }
    });
  }

  async storeToRTDB(data) {
    try {
      const value = data.values[0]; // Each entry has one value
      const numericValue = parseFloat(value.replace("×", ""));

      const record = {
        timestamp: data.timestamp,
        crash_value: value,
        numeric_value: numericValue,
        url: data.url,
        created_at: new Date().toISOString(),
      };

      // Generate a unique key for the record
      const recordKey =
        Date.now() + "_" + Math.random().toString(36).substr(2, 9);

      // Use Firebase Realtime Database REST API
      const response = await fetch(
        `${this.firebaseConfig.databaseURL}/crash_values/${recordKey}.json?key=${this.firebaseConfig.apiKey}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(record),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(
          "BC.Game Crash Monitor: Value stored to Firebase RTDB:",
          value
        );
        return { success: true, key: recordKey };
      } else {
        const errorText = await response.text();
        console.error("BC.Game Crash Monitor: Firebase RTDB error:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error(
        "BC.Game Crash Monitor: Error storing to Firebase RTDB:",
        error
      );
      return { success: false, error: error.message };
    }
  }
}

// Initialize the Firebase RTDB manager
new FirebaseRTDBManager();
