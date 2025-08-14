// BC.Game Crash Monitor - Popup Script
console.log("BC.Game Crash Monitor: Popup script loaded");

class PopupManager {
  constructor() {
    this.currentData = null;
    this.historyData = [];
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
      currentValues: document.getElementById("currentValues"),
      historyList: document.getElementById("historyList"),
      totalEntries: document.getElementById("totalEntries"),
      exportBtn: document.getElementById("exportBtn"),
      clearBtn: document.getElementById("clearBtn"),
    };

    // Set up event listeners
    this.elements.exportBtn.addEventListener("click", () => this.exportData());
    this.elements.clearBtn.addEventListener("click", () => this.clearHistory());

    // Load initial data
    this.loadData();

    // Set up periodic refresh
    setInterval(() => this.loadData(), 2000);
  }

  async loadData() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getValues",
      });

      if (response.success) {
        this.historyData = response.data || [];
        this.updateUI();
      }
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error loading data:", error);
      this.updateStatus("Error", false);
    }
  }

  updateUI() {
    // Update status
    if (this.historyData.length > 0) {
      this.currentData = this.historyData[this.historyData.length - 1];
      this.updateStatus("Active", true);
      this.updateCurrentValues();
    } else {
      this.updateStatus("No Data", false);
      this.showNoCurrentData();
    }

    // Update history
    this.updateHistory();
    this.updateStats();
  }

  updateStatus(text, isActive) {
    this.elements.statusText.textContent = text;
    if (isActive) {
      this.elements.statusDot.classList.add("active");
    } else {
      this.elements.statusDot.classList.remove("active");
    }
  }

  updateCurrentValues() {
    if (!this.historyData || this.historyData.length === 0) {
      this.showNoCurrentData();
      return;
    }

    // Show the last 10 most recent values from all entries
    const recentValues = this.historyData
      .slice(-10)
      .flatMap((entry) => entry.values)
      .slice(-10);

    const valuesHtml = recentValues
      .map((value) => {
        const numericValue = parseFloat(value.replace("×", ""));
        const chipClass = numericValue >= 2.0 ? "success" : "warning";
        return `<div class="value-chip ${chipClass}">${value}</div>`;
      })
      .join("");

    this.elements.currentValues.innerHTML = valuesHtml;
  }

  showNoCurrentData() {
    this.elements.currentValues.innerHTML =
      '<div class="no-data">No data available</div>';
  }

  updateHistory() {
    if (this.historyData.length === 0) {
      this.elements.historyList.innerHTML =
        '<div class="no-data">No history available</div>';
      return;
    }

    // Show last 20 entries, most recent first
    const recentHistory = this.historyData.slice(-20).reverse();

    const historyHtml = recentHistory
      .map((entry) => {
        const timestamp = new Date(entry.timestamp).toLocaleString();
        const valuesHtml = entry.values
          .map((value) => `<span class="history-value">${value}</span>`)
          .join("");

        return `
          <div class="history-item">
            <div class="history-timestamp">${timestamp}</div>
            <div class="history-values">${valuesHtml}</div>
          </div>
        `;
      })
      .join("");

    this.elements.historyList.innerHTML = historyHtml;
  }

  updateStats() {
    this.elements.totalEntries.textContent = this.historyData.length;
  }

  async exportData() {
    try {
      if (this.historyData.length === 0) {
        alert("No data to export");
        return;
      }

      // Format data for export
      const exportData = this.historyData.map((entry) => ({
        timestamp: entry.timestamp,
        values: entry.values.join(", "),
        url: entry.url,
      }));

      // Convert to CSV format
      const csvHeader = "Timestamp,Values,URL\n";
      const csvRows = exportData
        .map((row) => `"${row.timestamp}","${row.values}","${row.url}"`)
        .join("\n");
      const csvContent = csvHeader + csvRows;

      // Copy to clipboard
      await navigator.clipboard.writeText(csvContent);

      // Show feedback
      const originalText = this.elements.exportBtn.textContent;
      this.elements.exportBtn.textContent = "Copied!";
      this.elements.exportBtn.style.background = "#28a745";

      setTimeout(() => {
        this.elements.exportBtn.textContent = originalText;
        this.elements.exportBtn.style.background = "";
      }, 2000);
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error exporting data:", error);
      alert("Failed to export data");
    }
  }

  async clearHistory() {
    if (!confirm("Are you sure you want to clear all history?")) {
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "clearHistory",
      });

      if (response.success) {
        this.historyData = [];
        this.currentData = null;
        this.updateUI();

        // Show feedback
        const originalText = this.elements.clearBtn.textContent;
        this.elements.clearBtn.textContent = "Cleared!";
        this.elements.clearBtn.style.background = "#28a745";

        setTimeout(() => {
          this.elements.clearBtn.textContent = originalText;
          this.elements.clearBtn.style.background = "";
        }, 2000);
      }
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error clearing history:", error);
      alert("Failed to clear history");
    }
  }
}

// Initialize the popup manager
new PopupManager();
