// BC.Game Crash Monitor - Popup Script
console.log("BC.Game Crash Monitor: Popup script loaded");

class PopupManager {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupUI());
    } else {
      this.setupUI();
    }
  }

  setupUI() {
    // Get DOM elements
    this.elements = {
      statusDot: document.getElementById("statusDot"),
      statusText: document.getElementById("statusText"),
    };

    // Check if we're on the BC.Game crash page
    this.checkStatus();
  }

  async checkStatus() {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab && tab.url && tab.url.includes("bc.game/game/crash")) {
        this.updateStatus("Active - Writing to history.txt", true);
      } else {
        this.updateStatus("Navigate to bc.game/game/crash", false);
      }
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error checking status:", error);
      this.updateStatus("Error", false);
    }
  }

  updateStatus(text, isActive) {
    this.elements.statusText.textContent = text;
    if (isActive) {
      this.elements.statusDot.classList.add("active");
    } else {
      this.elements.statusDot.classList.remove("active");
    }
  }
}

// Initialize the popup manager
new PopupManager();
