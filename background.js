// BC.Game Crash Monitor - Background Script
console.log("BC.Game Crash Monitor: Background script loaded");

class DataManager {
  constructor() {
    this.maxEntries = 1000;
    this.maxDays = 30;
    this.init();
  }

  init() {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "storeValues") {
        this.storeValues(message.data);
        sendResponse({ success: true });
      } else if (message.action === "getValues") {
        this.getValues().then((data) => {
          sendResponse({ success: true, data: data });
        });
        return true; // Keep message channel open for async response
      } else if (message.action === "clearHistory") {
        this.clearHistory().then(() => {
          sendResponse({ success: true });
        });
        return true;
      }
    });

    // Clean up old data on startup
    this.cleanupOldData();
  }

  async storeValues(newData) {
    try {
      // Get existing data
      const result = await chrome.storage.local.get(["crashValues"]);
      let crashValues = result.crashValues || [];

      // Add new data
      crashValues.push(newData);

      // Keep only the most recent entries
      if (crashValues.length > this.maxEntries) {
        crashValues = crashValues.slice(-this.maxEntries);
      }

      // Store back to storage
      await chrome.storage.local.set({ crashValues: crashValues });

      console.log("BC.Game Crash Monitor: Values stored successfully", newData);

      // Update badge with current count
      this.updateBadge(crashValues.length);
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error storing values:", error);
    }
  }

  async getValues() {
    try {
      const result = await chrome.storage.local.get(["crashValues"]);
      return result.crashValues || [];
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error getting values:", error);
      return [];
    }
  }

  async clearHistory() {
    try {
      await chrome.storage.local.remove(["crashValues"]);
      this.updateBadge(0);
      console.log("BC.Game Crash Monitor: History cleared");
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error clearing history:", error);
    }
  }

  async cleanupOldData() {
    try {
      const result = await chrome.storage.local.get(["crashValues"]);
      let crashValues = result.crashValues || [];

      if (crashValues.length === 0) return;

      // Remove entries older than maxDays
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.maxDays);

      const filteredValues = crashValues.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate > cutoffDate;
      });

      // Only update storage if we removed some entries
      if (filteredValues.length !== crashValues.length) {
        await chrome.storage.local.set({ crashValues: filteredValues });
        console.log(
          `BC.Game Crash Monitor: Cleaned up ${
            crashValues.length - filteredValues.length
          } old entries`
        );
      }

      this.updateBadge(filteredValues.length);
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error cleaning up data:", error);
    }
  }

  updateBadge(count) {
    try {
      if (count > 0) {
        chrome.action.setBadgeText({
          text: count > 99 ? "99+" : count.toString(),
        });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
      } else {
        chrome.action.setBadgeText({ text: "" });
      }
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error updating badge:", error);
    }
  }
}

// Initialize the data manager
new DataManager();
