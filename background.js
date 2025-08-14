// BC.Game Crash Monitor - Background Script
console.log("BC.Game Crash Monitor: Background script loaded");

class DatabaseManager {
  constructor() {
    // Supabase configuration
    this.supabaseUrl = "https://tpowdztczaiysxwxnxgr.supabase.co"; // Replace with your Supabase URL
    this.supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwb3dkenRjemFpeXN4d3hueGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMzc4ODUsImV4cCI6MjA3MDcxMzg4NX0.87A0N6SH3iFtPlTKHkK5ogW1MvYYbEoOHPqWkD1Yax8"; // Replace with your Supabase anon key
    this.tableName = "crash_values";
    this.init();
  }

  init() {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "storeValues") {
        this.storeToDatabase(message.data).then((result) => {
          sendResponse(result);
        });
        return true; // Keep message channel open for async response
      }
    });
  }

  async storeToDatabase(data) {
    try {
      const value = data.values[0]; // Each entry has one value
      const numericValue = parseFloat(value.replace("×", ""));

      const payload = {
        timestamp: data.timestamp,
        crash_value: value,
        numeric_value: numericValue,
        url: data.url,
        created_at: new Date().toISOString(),
      };

      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/${this.tableName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.supabaseKey,
            Authorization: `Bearer ${this.supabaseKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        console.log("BC.Game Crash Monitor: Value stored to database:", value);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error("BC.Game Crash Monitor: Database error:", errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error storing to database:", error);
      return { success: false, error: error.message };
    }
  }
}

// Initialize the database manager
new DatabaseManager();
