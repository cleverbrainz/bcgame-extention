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
      const currentValues = [];

      valueSpans.forEach((span) => {
        const text = span.textContent.trim();
        // Match pattern like "7.28×", "1.14×", etc.
        if (/^\d+\.\d+×$/.test(text)) {
          currentValues.push(text);
        }
      });

      if (currentValues.length > 0) {
        // Check if new values were added (current length > previous length)
        if (currentValues.length > this.lastValues.length) {
          // Get only the new values (the ones added at the end)
          const newValues = currentValues.slice(this.lastValues.length);

          console.log("BC.Game Crash Monitor: New values added:", newValues);

          // Store only the new values
          this.storeValues(newValues);

          // Update our tracking array
          this.lastValues = [...currentValues];
        } else if (currentValues.length < this.lastValues.length) {
          // If the list got shorter (page refresh or reset), store all current values
          console.log(
            "BC.Game Crash Monitor: List reset, storing all values:",
            currentValues
          );
          this.lastValues = [...currentValues];
          this.storeValues(currentValues);
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
