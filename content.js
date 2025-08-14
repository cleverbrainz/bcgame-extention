// BC.Game Crash Monitor - Content Script
console.log("BC.Game Crash Monitor: Content script loaded");

class CrashMonitor {
  constructor() {
    this.lastValues = [];
    this.observer = null;
    this.debounceTimer = null;
    this.isMonitoring = false;

    this.init();
  }

  init() {
    // Wait for page to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.startMonitoring()
      );
    } else {
      this.startMonitoring();
    }
  }

  startMonitoring() {
    console.log("BC.Game Crash Monitor: Starting monitoring");

    // Try to find the target element immediately
    this.findAndMonitorElement();

    // Also set up a periodic check in case the element appears later
    const checkInterval = setInterval(() => {
      if (!this.isMonitoring) {
        this.findAndMonitorElement();
      } else {
        clearInterval(checkInterval);
      }
    }, 2000);

    // Clear interval after 30 seconds if element not found
    setTimeout(() => clearInterval(checkInterval), 30000);
  }

  findAndMonitorElement() {
    // Primary selector based on the provided HTML structure
    const selectors = [
      "div.grid.grid-auto-flow-column.gap-1.h-full.overflow-x-visible.grid-cols-7",
      'div[class*="grid"][class*="grid-auto-flow-column"][class*="gap-1"]',
      'div[style*="grid-template-columns"][style*="calc(14.2857%"]',
    ];

    let targetElement = null;

    for (const selector of selectors) {
      targetElement = document.querySelector(selector);
      if (targetElement) {
        console.log(
          `BC.Game Crash Monitor: Found target element with selector: ${selector}`
        );
        break;
      }
    }

    if (targetElement) {
      this.setupObserver(targetElement);
      this.extractValues(targetElement); // Extract initial values
    } else {
      console.log(
        "BC.Game Crash Monitor: Target element not found, will retry..."
      );
    }
  }

  setupObserver(targetElement) {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData" ||
          (mutation.type === "attributes" && mutation.attributeName === "style")
        ) {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        this.debouncedExtractValues(targetElement);
      }
    });

    this.observer.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    this.isMonitoring = true;
    console.log("BC.Game Crash Monitor: Observer set up successfully");
  }

  debouncedExtractValues(element) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.extractValues(element);
    }, 500);
  }

  extractValues(element) {
    try {
      // Find all spans that contain × values
      const valueSpans = element.querySelectorAll(
        'span[class*="font-extrabold"]'
      );
      const values = [];

      valueSpans.forEach((span) => {
        const text = span.textContent.trim();
        // Match pattern like "7.28×", "1.14×", etc.
        if (/^\d+\.\d+×$/.test(text)) {
          values.push(text);
        }
      });

      if (values.length > 0) {
        // Check if values have changed
        const valuesString = values.join(",");
        const lastValuesString = this.lastValues.join(",");

        if (valuesString !== lastValuesString) {
          console.log("BC.Game Crash Monitor: New values detected:", values);
          this.lastValues = [...values];
          this.storeValues(values);
        }
      }
    } catch (error) {
      console.error("BC.Game Crash Monitor: Error extracting values:", error);
    }
  }

  storeValues(values) {
    const data = {
      timestamp: new Date().toISOString(),
      values: values,
      url: window.location.href,
    };

    // Send to background script for storage
    chrome.runtime
      .sendMessage({
        action: "storeValues",
        data: data,
      })
      .catch((error) => {
        console.error(
          "BC.Game Crash Monitor: Error sending message to background:",
          error
        );
      });
  }
}

// Initialize the monitor
new CrashMonitor();
