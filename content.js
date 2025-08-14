// BC.Game Crash Monitor - Content Script
console.log("BC.Game Crash Monitor: Content script loaded");

class CrashMonitor {
  constructor() {
    this.lastValues = [];
    this.lastIds = [];
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
      // Find all direct child divs that contain the crash data
      const childDivs = element.querySelectorAll(
        "div.flex.items-center.justify-center.gap-1.px-2.h-full.cursor-pointer"
      );
      const currentValues = [];
      const currentIds = [];

      childDivs.forEach((div) => {
        // Find the × value span within this div
        const valueSpan = div.querySelector('span[class*="font-extrabold"]');
        // Find the ID span within this div
        const idSpan = div.querySelector(
          "span.text-xs.leading-tight.text-tertiary.font-semibold"
        );

        if (valueSpan && idSpan) {
          const valueText = valueSpan.textContent.trim();
          const idText = idSpan.textContent.trim();

          // Match pattern like "7.28×", "1.14×", etc.
          if (/^\d+\.\d+×$/.test(valueText) && /^\d+$/.test(idText)) {
            currentValues.push(valueText);
            currentIds.push(idText);
          }
        }
      });

      if (currentValues.length > 0) {
        // Check if new values were added by comparing IDs (more reliable than length)
        const newEntries = [];

        for (let i = 0; i < currentIds.length; i++) {
          const id = currentIds[i];
          const value = currentValues[i];

          // If this ID wasn't in our last seen IDs, it's new
          if (!this.lastIds || !this.lastIds.includes(id)) {
            newEntries.push({
              id: id,
              value: value,
            });
          }
        }

        if (newEntries.length > 0) {
          console.log(
            "BC.Game Crash Monitor: New entries detected:",
            newEntries
          );

          // Store only the new values
          const newValues = newEntries.map((entry) => entry.value);
          this.storeValues(newValues);
        }

        // Update our tracking arrays
        this.lastValues = [...currentValues];
        this.lastIds = [...currentIds];
      } else if (this.lastValues.length > 0) {
        // If we had values before but none now, the page might have reset
        console.log("BC.Game Crash Monitor: Page appears to have reset");
        this.lastValues = [];
        this.lastIds = [];
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
