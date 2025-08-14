// BC.Game Crash Monitor - Background Script
console.log("BC.Game Crash Monitor: Background script loaded");

class FileManager {
  constructor() {
    this.filename = "history.txt";
    this.init();
  }

  init() {
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "storeValues") {
        this.appendToFile(message.data);
        sendResponse({ success: true });
      }
    });
  }

  async appendToFile(data) {
    try {
      // Format the data for the file
      const timestamp = new Date(data.timestamp).toLocaleString();
      const value = data.values[0]; // Each entry has one value
      const line = `${timestamp} - ${value}\n`;

      // Create a blob with the new line
      const blob = new Blob([line], { type: "text/plain" });

      // Download/append to the file
      const url = URL.createObjectURL(blob);

      await chrome.downloads.download({
        url: url,
        filename: this.filename,
        conflictAction: "uniquify",
        saveAs: false,
      });

      console.log("BC.Game Crash Monitor: Value written to file:", value);

      // Clean up the blob URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error writing to file:", error);
    }
  }
}

// Initialize the file manager
new FileManager();
